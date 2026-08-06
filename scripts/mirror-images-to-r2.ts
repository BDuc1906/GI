
import { assertEnv } from "../src/lib/env";

assertEnv();

import { prisma } from "../src/lib/prisma";
import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  createR2Client,
  isAlreadyMirrored,
  r2BucketName,
  r2PublicUrl,
} from "./lib/r2-client";
import { setTimeout as sleep } from "node:timers/promises";

// ===== CẤU HÌNH =====
const TIMEOUT_MS = 30000;
const RETRY_COUNT = 3;
const DELAY_BETWEEN_REQUESTS_MS = 500;
// =====================

const DRY_RUN = process.argv.includes("--dry-run");

const CONTENT_TYPE_TO_EXT: Record<string, string> = {
  "image/png": "png",
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

const r2 = DRY_RUN ? null : createR2Client();
const bucket = DRY_RUN ? "" : r2BucketName();

const urlCache = new Map<string, string>();
let downloadedCount = 0;
let skippedExistingCount = 0;
let failedCount = 0;

const KNOWN_IMAGE_EXTENSIONS = new Set(["png", "webp", "jpg", "jpeg", "gif", "svg"]);

// ---------- HÀM FETCH VỚI RETRY ----------
async function fetchWithRetry(
  url: string,
  retries: number = RETRY_COUNT,
  timeoutMs: number = TIMEOUT_MS
): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      return res;
    } catch (err) {
      lastError = err as Error;
      if (attempt < retries - 1) {
        const waitMs = (attempt + 1) * 2000;
        console.log(`  ⏳ Retry ${attempt + 1}/${retries} sau ${waitMs / 1000}s...`);
        await sleep(waitMs);
      }
    }
  }
  throw new Error(`Failed after ${retries} retries: ${lastError?.message || "unknown error"}`);
}

// ---------- FALLBACK THỦ CÔNG THEO TỪNG BẢN GHI ----------
// Với các bản ghi mà CẢ heuristic bên dưới (enka -> mihoyo hotlink) LẪN
// fandomMap chung theo domain đều không cứu được (ảnh gốc chết hẳn, tên
// file không theo quy luật UI_DungeonPic_*...), thêm URL thay thế đã biết
// hoạt động tại đây, key = đúng `id` (slug) của bản ghi trong DB — id
// được truyền xuyên suốt mirrorUrl() -> getFallbackUrls() chính là để
// phục vụ việc này.
//
// Cách thêm 1 override mới: chạy `npm run images:mirror`, xem log
// "❌ Mirror thất bại" kèm id bản ghi, tự tìm 1 URL ảnh thay thế còn sống
// (enka.network/ui/<tên khác>, wiki, hoặc ảnh tự host), thêm 1 dòng vào
// đây rồi chạy lại script cho riêng id đó.
const MANUAL_MIRROR_FALLBACKS: Record<string, string> = {
  // "ten-nhan-vat": "https://example.com/anh-thay-the.png",
};

// ---------- DANH SÁCH URL FALLBACK ----------
function getFallbackUrls(originalUrl: string, type: string, id?: string): string[] {
  const urls: string[] = [originalUrl];

  // Override thủ công theo id — ưu tiên thử NGAY SAU url gốc, trước cả
  // heuristic enka/mihoyo bên dưới, vì đây là URL đã xác nhận hoạt động
  // cho đúng bản ghi này (đáng tin hơn 1 phỏng đoán theo quy luật tên file
  // chung).
  if (id && MANUAL_MIRROR_FALLBACKS[id]) {
    urls.push(MANUAL_MIRROR_FALLBACKS[id]);
  }

  if (originalUrl.includes("enka.network/ui/")) {
    const filename = originalUrl.split("/").pop()?.replace(".png", "") || "";
    if (filename.startsWith("UI_") && !filename.startsWith("UI_DungeonPic_")) {
      urls.push(`https://upload-os-bbs.mihoyo.com/game_record/genshin/character_icon/${filename}.png`);
    }
    if (type === "domain" && filename.startsWith("UI_DungeonPic_")) {
      const fandomMap: Record<string, string> = {
        "UI_DungeonPic_Thunder": "https://static.wikia.nocookie.net/gensin-impact/images/4/4f/Domain_of_Forgery_Thundercloud_Altar.png",
        "UI_DungeonPic_ThunderCave_Dq": "https://static.wikia.nocookie.net/gensin-impact/images/1/1a/Domain_of_Blessing_Autumn_Hunt.png",
        // Thêm các map khác nếu cần
      };
      if (fandomMap[filename]) {
        urls.push(fandomMap[filename]);
      }
    }
  }

  return urls;
}

// ---------- DETECT EXTENSION ----------
async function detectExtension(sourceUrl: string): Promise<string> {
  try {
    const head = await fetchWithRetry(sourceUrl, 2, 10000);
    const contentType = head.headers.get("content-type")?.split(";")[0]?.trim();
    if (contentType && CONTENT_TYPE_TO_EXT[contentType]) {
      return CONTENT_TYPE_TO_EXT[contentType];
    }
  } catch {
    // fallback
  }
  const pathExt = safeUrlPathExtension(sourceUrl);
  if (pathExt && KNOWN_IMAGE_EXTENSIONS.has(pathExt)) {
    return pathExt === "jpeg" ? "jpg" : pathExt;
  }
  return "png";
}

function safeUrlPathExtension(url: string): string | null {
  try {
    const ext = new URL(url).pathname.split(".").pop()?.toLowerCase();
    return ext && ext.length <= 4 ? ext : null;
  } catch {
    return null;
  }
}

// ---------- KIỂM TRA TỒN TẠI TRÊN R2 ----------
async function objectExistsOnR2(key: string): Promise<boolean> {
  if (!r2) return false;
  try {
    await r2.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

// ---------- MIRROR URL (CỐT LÕI) ----------
async function mirrorUrl(
  sourceUrl: string,
  keyBase: string,
  type: string = "unknown",
  id?: string
): Promise<string | null> {
  if (isAlreadyMirrored(sourceUrl)) return null;

  const cached = urlCache.get(sourceUrl);
  if (cached) return cached;

  const urls = getFallbackUrls(sourceUrl, type, id);

  for (const url of urls) {
    try {
      const head = await fetchWithRetry(url, 2, 10000);
      if (!head.ok) continue;

      const ext = await detectExtension(url);
      const key = `${keyBase}.${ext}`;

      if (DRY_RUN) {
        console.log(`  [dry-run] sẽ mirror: ${url}\n            -> ${key}`);
        const fakeUrl = `<R2_PUBLIC_URL>/${key}`;
        urlCache.set(sourceUrl, fakeUrl);
        return fakeUrl;
      }

      const exists = await objectExistsOnR2(key);
      if (exists) {
        skippedExistingCount++;
        const publicUrl = r2PublicUrl(key);
        urlCache.set(sourceUrl, publicUrl);
        return publicUrl;
      }

      console.log(`  ⬇️ Đang tải: ${url}`);
      const res = await fetchWithRetry(url);
      if (!res.ok) {
        console.warn(`  ⚠ HTTP ${res.status} - ${url}`);
        continue;
      }
      const bytes = new Uint8Array(await res.arrayBuffer());
      const contentType =
        res.headers.get("content-type")?.split(";")[0]?.trim() ||
        `image/${ext === "jpg" ? "jpeg" : ext}`;

      console.log(`  ⬆️ Đang upload: ${key}`);
      await r2!.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: bytes,
          ContentType: contentType,
          CacheControl: "public, max-age=31536000, immutable",
        })
      );
      downloadedCount++;

      const publicUrl = r2PublicUrl(key);
      urlCache.set(sourceUrl, publicUrl);
      return publicUrl;
    } catch (err) {
      console.warn(`  ⚠ Lỗi với ${url}:`, (err as Error).message);
    }
  }

  failedCount++;
  console.warn(`  ❌ Không thể mirror: ${sourceUrl}`);
  return null;
}

// ---------- CÁC HÀM MIRROR TỪNG BẢNG ----------
async function mirrorCharacters(): Promise<void> {
  const rows = await prisma.character.findMany({
    select: { id: true, vision: true, iconUrl: true, sideIconUrl: true, splashUrl: true, elementIcon: true },
  });
  let updated = 0;
  for (const c of rows) {
    const data: Record<string, string> = {};
    if (c.iconUrl) {
      const u = await mirrorUrl(c.iconUrl, `characters/${c.id}/icon`, "character", c.id);
      if (u) data.iconUrl = u;
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    }
    if (c.sideIconUrl) {
      const u = await mirrorUrl(c.sideIconUrl, `characters/${c.id}/side-icon`, "character", c.id);
      if (u) data.sideIconUrl = u;
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    }
    if (c.splashUrl) {
      const u = await mirrorUrl(c.splashUrl, `characters/${c.id}/splash`, "character", c.id);
      if (u) data.splashUrl = u;
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    }
    if (c.elementIcon) {
      const u = await mirrorUrl(c.elementIcon, `shared/element-icons/${c.vision.toLowerCase()}`, "element", c.id);
      if (u) data.elementIcon = u;
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    }
    if (Object.keys(data).length > 0) {
      if (!DRY_RUN) await prisma.character.update({ where: { id: c.id }, data });
      updated++;
    }
  }
  console.log(`Characters: ${updated}/${rows.length}`);
}

async function mirrorMaterials(): Promise<void> {
  const rows = await prisma.material.findMany({ select: { id: true, iconUrl: true } });
  let updated = 0;
  for (const m of rows) {
    if (!m.iconUrl) continue;
    const u = await mirrorUrl(m.iconUrl, `materials/${m.id}/icon`, "material", m.id);
    if (u) {
      if (!DRY_RUN) await prisma.material.update({ where: { id: m.id }, data: { iconUrl: u } });
      updated++;
    }
    await sleep(DELAY_BETWEEN_REQUESTS_MS);
  }
  console.log(`Materials: ${updated}/${rows.length}`);
}

async function mirrorWeapons(): Promise<void> {
  const rows = await prisma.weapon.findMany({ select: { id: true, iconUrl: true } });
  let updated = 0;
  for (const w of rows) {
    if (!w.iconUrl) continue;
    const u = await mirrorUrl(w.iconUrl, `weapons/${w.id}/icon`, "weapon", w.id);
    if (u) {
      if (!DRY_RUN) await prisma.weapon.update({ where: { id: w.id }, data: { iconUrl: u } });
      updated++;
    }
    await sleep(DELAY_BETWEEN_REQUESTS_MS);
  }
  console.log(`Weapons: ${updated}/${rows.length}`);
}

async function mirrorArtifactSets(): Promise<void> {
  const rows = await prisma.artifactSet.findMany({ select: { id: true, iconUrl: true } });
  let updated = 0;
  for (const a of rows) {
    if (!a.iconUrl) continue;
    const u = await mirrorUrl(a.iconUrl, `artifacts/${a.id}/icon`, "artifact", a.id);
    if (u) {
      if (!DRY_RUN) await prisma.artifactSet.update({ where: { id: a.id }, data: { iconUrl: u } });
      updated++;
    }
    await sleep(DELAY_BETWEEN_REQUESTS_MS);
  }
  console.log(`ArtifactSets: ${updated}/${rows.length}`);
}

async function mirrorDomains(): Promise<void> {
  const rows = await prisma.domain.findMany({ select: { id: true, imageUrl: true } });
  let updated = 0;
  for (const d of rows) {
    if (!d.imageUrl) continue;
    const u = await mirrorUrl(d.imageUrl, `domains/${d.id}/image`, "domain", d.id);
    if (u) {
      if (!DRY_RUN) await prisma.domain.update({ where: { id: d.id }, data: { imageUrl: u } });
      updated++;
    }
    await sleep(DELAY_BETWEEN_REQUESTS_MS);
  }
  console.log(`Domains: ${updated}/${rows.length}`);
}

// ---------- MAIN ----------
async function main(): Promise<void> {
  if (DRY_RUN) {
    console.log("=== DRY RUN ===\n");
  } else {
    console.log("Mirror ảnh sang R2...\n");
    console.log(`Timeout: ${TIMEOUT_MS / 1000}s, Retry: ${RETRY_COUNT}, Delay: ${DELAY_BETWEEN_REQUESTS_MS}ms\n`);
  }

  await mirrorCharacters();
  await mirrorMaterials();
  await mirrorWeapons();
  await mirrorArtifactSets();
  await mirrorDomains();

  if (!DRY_RUN) {
    console.log(
      `\n✅ Tải mới: ${downloadedCount}, Đã có: ${skippedExistingCount}, Lỗi: ${failedCount}`
    );
    if (failedCount > 0) {
      console.warn(`⚠ Còn ${failedCount} ảnh lỗi. Chạy lại script để thử tiếp.`);
    }
  } else {
    console.log("\n=== DRY RUN kết thúc. Bỏ --dry-run để chạy thật. ===");
  }
}

main()
  .catch((e) => {
    console.error("❌ Lỗi:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
