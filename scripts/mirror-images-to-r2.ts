import { assertEnv } from "../src/lib/env";
import { startPipeline, endPipelineSuccess, endPipelineFailure } from './lib/pipeline-logger';
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
import { notifyOps } from "../src/lib/notify";

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
// BUG ĐÃ SỬA: trước đây chỉ cache khi MIRROR THÀNH CÔNG (urlCache). Với các
// asset dùng chung 1 filename gốc cho rất nhiều bản ghi — vd nền bí cảnh
// "UI_DungeonPic_NTDungeon_Cycle01" xuất hiện ở 16 domain khác nhau (xem
// scripts/list-failed-images.ts để tự kiểm chứng số lượng thật trong DB) —
// nếu asset đó CHẾT hẳn trên mọi nguồn, script cũ sẽ thử lại toàn bộ chuỗi
// fallback (enka -> mihoyo -> fandom -> 2 CDN, mỗi URL retry tối đa 3 lần
// kèm backoff) LẶP LẠI cho từng bản ghi trong 16 bản ghi đó, dù kết quả
// chắc chắn giống hệt lần trước trong CÙNG 1 lần chạy script. Đây chính là
// nguyên nhân log lặp lại y hệt nhiều lần (xem ảnh chụp: cùng 1 URL
// "UI_DungeonPic_NTCycle02" bị 404 lặp lại liên tiếp cho các domain khác
// nhau) và khiến 1 lần chạy có thể tốn hàng chục phút một cách vô ích.
// -> Cache CẢ kết quả THẤT BẠI (trong phạm vi 1 lần chạy script) để mọi bản
// ghi tiếp theo dùng chung sourceUrl chết được trả lời ngay lập tức.
const failedSourceUrls = new Set<string>();
// Gom các sourceUrl thất bại kèm số bản ghi bị ảnh hưởng, để in tổng kết
// CÓ THỂ HÀNH ĐỘNG ĐƯỢC ở cuối run (xem printFailureSummary) — thay vì để
// người vận hành phải tự đếm qua hàng chục dòng "❌ Không thể mirror" trùng
// lặp mới biết được thực chất chỉ có vài asset gốc bị thiếu.
const failedSourceUrlCount = new Map<string, number>();
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

// ---------- FALLBACK THỦ CÔNG THEO TÊN FILE GỐC ----------
// BUG ĐÃ SỬA: bản cũ key theo `id` (slug) TỪNG BẢN GHI. Vấn đề: rất nhiều
// asset — đặc biệt ảnh nền bí cảnh (Domain) — dùng CHUNG 1 filename gốc
// cho hàng chục bản ghi khác nhau (đã xác minh trực tiếp qua genshin-db:
// "UI_DungeonPic_NTDungeon_Cycle01" dùng chung bởi 16 domain,
// "UI_DungeonPic_NTCycle02" bởi 12 domain, v.v. — đây chính là asset bản
// Natlan/Nod-Krai mới, chưa được enka.network lẫn 2 CDN dự phòng mirror
// kịp, nên toàn bộ domain dùng chung filename đó cùng lúc báo lỗi như ảnh
// chụp "Domains: 0/65"). Key theo id buộc phải chép cùng 1 dòng override
// N lần cho N bản ghi giống hệt nhau. Đổi sang key theo FILENAME GỐC (tách
// từ URL enka.network, không gồm đuôi .png) để 1 dòng vá được mọi bản ghi
// cùng dùng asset đó — nhất quán với `fandomMap` bên dưới (cũng key theo
// filename) nên gộp luôn 2 map làm một, đỡ 2 nơi phải tra.
//
// Cách thêm 1 override mới: chạy `npm run images:mirror`, xem dòng tổng
// kết cuối run "Còn N asset gốc chưa có nguồn thay thế" (in kèm filename,
// xem printFailureSummary) — không phải soi từng dòng "❌ Không thể mirror"
// lặp lại theo từng bản ghi — tự tìm 1 URL ảnh còn sống (enka.network/ui/
// <tên khác>, wiki, hoặc ảnh tự host), thêm 1 dòng vào đây theo đúng
// filename đã in, rồi chạy lại script.
const MANUAL_MIRROR_FALLBACKS_BY_FILENAME: Record<string, string> = {
  // "UI_DungeonPic_NTDungeon_Cycle01": "https://example.com/anh-thay-the.png",
};

/** @deprecated Giữ lại để không phá override cũ (nếu có) key theo id bản ghi — ưu tiên thấp hơn map theo filename. */
const MANUAL_MIRROR_FALLBACKS_BY_ID: Record<string, string> = {
  // "ten-nhan-vat": "https://example.com/anh-thay-the.png",
};

// enka.network CHỈ mirror ảnh THẬT SỰ đang hiển thị trên chính trang của nó
// (avatar/vũ khí/thánh di vật trong showcase nhân vật) — KHÔNG phải toàn bộ
// asset UI_* của game. Rất nhiều icon nguyên liệu (UI_ItemIcon_*) không nằm
// trong tập showcase đó nên 404 dù tên file đúng chuẩn game (xác nhận từ
// tài liệu enkanetwork: "enka.network only hosts images that are actually
// used on the site"). 2 CDN dưới đây mirror TOÀN BỘ asset UI_* của game
// (dump từ ExcelBinOutput, không giới hạn theo showcase) nên phủ được các
// trường hợp enka thiếu — cùng quy luật đặt tên file UI_*, chỉ khác gốc
// domain + đuôi file.
const ALT_ASSET_CDNS: Array<{ baseUrl: string; ext: string }> = [
  { baseUrl: "https://gi.yatta.moe/assets/UI/", ext: "png" },
  { baseUrl: "https://static.nanoka.cc/gi/UI/", ext: "webp" },
];

// ---------- DANH SÁCH URL FALLBACK ----------
// Lưu ý: `originalUrl` ở đây LUÔN là hotlink thật (đọc từ cột *Original —
// xem các hàm mirrorCharacters/mirrorMaterials/... bên dưới), không phải
// URL đã mirror sang R2. Vì vậy heuristic tách tên file (`.split("/").pop()`)
// bên dưới vẫn đúng: nó tách đúng tên file gốc trên enka.network/mihoyo,
// KHÔNG phải tên object generic ("icon.png") mà script này tự đặt trên R2.
// Không giữ Fandom map runtime trong module vì các URL đang có trong map trước
// đây đã xác nhận bằng HEAD/HTTP 404 với thực tế cầu dữ liệu mới của repo. Vẫn
// có 1 map thủ công `MANUAL_MIRROR_FALLBACKS_BY_FILENAME` ở trên để vận hành
// nhập tay khi nguồn sống được xác minh.

function getFallbackUrls(originalUrl: string, type: string, id?: string): string[] {
  const urls: string[] = [originalUrl];

  // Tách filename SỚM (trước mọi override) để override theo filename dùng
  // được ngay cả khi originalUrl không phải enka.network/ui/ (vd 1 hotlink
  // khác trong tương lai) — miễn tách được tên file là tra được override.
  const filename = originalUrl.includes("/")
    ? originalUrl.split("/").pop()?.replace(/\.(png|webp|jpg|jpeg)$/i, "") || ""
    : "";

  // Override theo FILENAME GỐC — ưu tiên thử NGAY SAU url gốc, trước cả
  // heuristic enka/mihoyo/fandom/CDN bên dưới, vì đây là URL đã xác nhận
  // hoạt động cho đúng asset này (đáng tin hơn 1 phỏng đoán theo quy luật
  // tên file chung), và áp dụng cho MỌI bản ghi dùng chung filename đó
  // (vd 1 dòng vá được cả 16 domain cùng dùng 1 ảnh nền — xem comment ở
  // MANUAL_MIRROR_FALLBACKS_BY_FILENAME phía trên).
  if (filename && MANUAL_MIRROR_FALLBACKS_BY_FILENAME[filename]) {
    urls.push(MANUAL_MIRROR_FALLBACKS_BY_FILENAME[filename]);
  }
  // Override cũ theo id — giữ tương thích ngược, ưu tiên thấp hơn.
  if (id && MANUAL_MIRROR_FALLBACKS_BY_ID[id]) {
    urls.push(MANUAL_MIRROR_FALLBACKS_BY_ID[id]);
  }

  if (originalUrl.includes("enka.network/ui/")) {
    if (filename.startsWith("UI_") && !filename.startsWith("UI_DungeonPic_")) {
      urls.push(`https://upload-os-bbs.mihoyo.com/game_record/genshin/character_icon/${filename}.png`);
    }
    // Dự phòng cuối: 2 CDN dump toàn bộ asset UI_* (xem comment ở
    // ALT_ASSET_CDNS phía trên) — thử SAU mihoyo hotlink vì mihoyo là
    // nguồn chính hãng, đáng tin hơn khi cả 2 đều có file.
    if (filename) {
      for (const cdn of ALT_ASSET_CDNS) {
        urls.push(`${cdn.baseUrl}${filename}.${cdn.ext}`);
      }
    }
  }

  return urls;
}

/** Tách tên file gốc từ 1 sourceUrl, dùng để gộp thống kê lỗi theo asset thay vì theo bản ghi. Trả về sourceUrl nguyên văn nếu không tách được (vd URL lạ không có "/"). */
function extractFilenameForReporting(sourceUrl: string): string {
  if (!sourceUrl.includes("/")) return sourceUrl;
  return sourceUrl.split("/").pop()?.replace(/\.(png|webp|jpg|jpeg)$/i, "") || sourceUrl;
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
// `sourceUrl` PHẢI là URL gốc (cột *Original), KHÔNG phải cột hiển thị —
// việc quyết định "đã mirror hay chưa" (để không tải lại vô ích) nằm ở
// phía gọi (xem shouldMirror() bên dưới), dựa trên cột hiển thị hiện tại,
// vì cột *Original không bao giờ trỏ vào R2 nên tự nó không thể dùng để
// biết đã mirror hay chưa.
async function mirrorUrl(
  sourceUrl: string,
  keyBase: string,
  type: string = "unknown",
  id?: string
): Promise<string | null> {
  const cached = urlCache.get(sourceUrl);
  if (cached) return cached;

  // BUG ĐÃ SỬA: trả lời NGAY nếu sourceUrl này đã biết chết trong lần chạy
  // hiện tại — tránh lặp lại toàn bộ chuỗi fallback (nhiều URL x nhiều
  // retry x backoff) cho từng bản ghi tiếp theo dùng chung 1 asset đã xác
  // nhận chết (xem comment chi tiết ở khai báo failedSourceUrls phía trên).
  if (failedSourceUrls.has(sourceUrl)) {
    failedCount++;
    failedSourceUrlCount.set(sourceUrl, (failedSourceUrlCount.get(sourceUrl) ?? 0) + 1);
    return null;
  }

  const urls = getFallbackUrls(sourceUrl, type, id);

  for (const url of urls) {
    try {
      const head = await fetchWithRetry(url, 2, 10000);
      if (!head.ok) {
        console.warn(`  ⚠ HTTP ${head.status} - ${url}`);
        continue;
      }

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
  failedSourceUrls.add(sourceUrl);
  failedSourceUrlCount.set(sourceUrl, (failedSourceUrlCount.get(sourceUrl) ?? 0) + 1);
  console.warn(`  ❌ Không thể mirror: ${sourceUrl}`);
  return null;
}

/** True nếu cột hiển thị hiện tại đã trỏ vào R2 -> đã mirror, không cần tải lại. */
function shouldMirror(displayUrl: string | null | undefined): boolean {
  return !isAlreadyMirrored(displayUrl ?? "");
}

// ---------- CÁC HÀM MIRROR TỪNG BẢNG ----------
async function mirrorCharacters(): Promise<void> {
  const rows = await prisma.character.findMany({
    select: {
      id: true,
      vision: true,
      iconUrl: true,
      iconUrlOriginal: true,
      sideIconUrl: true,
      sideIconUrlOriginal: true,
      splashUrl: true,
      splashUrlOriginal: true,
      elementIcon: true,
      elementIconOriginal: true,
    },
  });
  let updated = 0;
  for (const c of rows) {
    const data: Record<string, string> = {};
    if (c.iconUrlOriginal && shouldMirror(c.iconUrl)) {
      const u = await mirrorUrl(c.iconUrlOriginal, `characters/${c.id}/icon`, "character", c.id);
      if (u) data.iconUrl = u;
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    }
    if (c.sideIconUrlOriginal && shouldMirror(c.sideIconUrl)) {
      const u = await mirrorUrl(c.sideIconUrlOriginal, `characters/${c.id}/side-icon`, "character", c.id);
      if (u) data.sideIconUrl = u;
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    }
    if (c.splashUrlOriginal && shouldMirror(c.splashUrl)) {
      const u = await mirrorUrl(c.splashUrlOriginal, `characters/${c.id}/splash`, "character", c.id);
      if (u) data.splashUrl = u;
      await sleep(DELAY_BETWEEN_REQUESTS_MS);
    }
    if (c.elementIconOriginal && shouldMirror(c.elementIcon)) {
      const u = await mirrorUrl(c.elementIconOriginal, `shared/element-icons/${c.vision.toLowerCase()}`, "element", c.id);
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
  const rows = await prisma.material.findMany({
    select: { id: true, iconUrl: true, iconUrlOriginal: true },
  });
  let updated = 0;
  for (const m of rows) {
    if (!m.iconUrlOriginal || !shouldMirror(m.iconUrl)) continue;
    const u = await mirrorUrl(m.iconUrlOriginal, `materials/${m.id}/icon`, "material", m.id);
    if (u) {
      if (!DRY_RUN) await prisma.material.update({ where: { id: m.id }, data: { iconUrl: u } });
      updated++;
    }
    await sleep(DELAY_BETWEEN_REQUESTS_MS);
  }
  console.log(`Materials: ${updated}/${rows.length}`);
}

async function mirrorWeapons(): Promise<void> {
  const rows = await prisma.weapon.findMany({
    select: { id: true, iconUrl: true, iconUrlOriginal: true },
  });
  let updated = 0;
  for (const w of rows) {
    if (!w.iconUrlOriginal || !shouldMirror(w.iconUrl)) continue;
    const u = await mirrorUrl(w.iconUrlOriginal, `weapons/${w.id}/icon`, "weapon", w.id);
    if (u) {
      if (!DRY_RUN) await prisma.weapon.update({ where: { id: w.id }, data: { iconUrl: u } });
      updated++;
    }
    await sleep(DELAY_BETWEEN_REQUESTS_MS);
  }
  console.log(`Weapons: ${updated}/${rows.length}`);
}

async function mirrorArtifactSets(): Promise<void> {
  const rows = await prisma.artifactSet.findMany({
    select: { id: true, iconUrl: true, iconUrlOriginal: true },
  });
  let updated = 0;
  for (const a of rows) {
    if (!a.iconUrlOriginal || !shouldMirror(a.iconUrl)) continue;
    const u = await mirrorUrl(a.iconUrlOriginal, `artifacts/${a.id}/icon`, "artifact", a.id);
    if (u) {
      if (!DRY_RUN) await prisma.artifactSet.update({ where: { id: a.id }, data: { iconUrl: u } });
      updated++;
    }
    await sleep(DELAY_BETWEEN_REQUESTS_MS);
  }
  console.log(`ArtifactSets: ${updated}/${rows.length}`);
}

async function mirrorDomains(): Promise<void> {
  const rows = await prisma.domain.findMany({
    select: { id: true, imageUrl: true, imageUrlOriginal: true },
  });
  let updated = 0;
  for (const d of rows) {
    if (!d.imageUrlOriginal || !shouldMirror(d.imageUrl)) continue;
    const u = await mirrorUrl(d.imageUrlOriginal, `domains/${d.id}/image`, "domain", d.id);
    if (u) {
      if (!DRY_RUN) await prisma.domain.update({ where: { id: d.id }, data: { imageUrl: u } });
      updated++;
    }
    await sleep(DELAY_BETWEEN_REQUESTS_MS);
  }
  console.log(`Domains: ${updated}/${rows.length}`);
}

// ---------- TỔNG KẾT LỖI THEO ASSET ----------
// Thay vì để người vận hành tự đếm qua N dòng "❌ Không thể mirror" gần như
// giống hệt nhau (1 dòng / bản ghi, dù nhiều bản ghi cùng dùng 1 filename
// gốc — xem comment ở failedSourceUrls), in 1 danh sách DUY NHẤT theo từng
// asset gốc còn thiếu, kèm số bản ghi bị ảnh hưởng — đây là thông tin thật
// sự cần để quyết định có đáng thêm 1 dòng vào
// MANUAL_MIRROR_FALLBACKS_BY_FILENAME hay không (asset ảnh hưởng càng
// nhiều bản ghi càng đáng ưu tiên tìm nguồn thay thế).
/**
 * Dựng phần thân danh sách asset lỗi (không kèm dòng tiêu đề/hướng dẫn) —
 * tách riêng khỏi printFailureSummary() để dùng lại nguyên vẹn làm `detail`
 * cho notifyOps() bên dưới, thay vì chép lại logic sort/format ở 2 nơi.
 */
function buildFailureListText(): string {
  const sorted = [...failedSourceUrlCount.entries()].sort((a, b) => b[1] - a[1]);
  return sorted
    .map(([sourceUrl, count]) => {
      const filename = extractFilenameForReporting(sourceUrl);
      return `- ${filename}  (${count} bản ghi)  <- ${sourceUrl}`;
    })
    .join("\n");
}

function printFailureSummary(): void {
  if (failedSourceUrlCount.size === 0) return;
  console.warn(
    `\n⚠ ${failedSourceUrlCount.size} asset gốc chưa có nguồn thay thế nào hoạt động ` +
      `(ảnh hưởng tổng ${failedCount} bản ghi):`
  );
  console.warn(buildFailureListText());
  console.warn(
    `→ Với asset ảnh hưởng nhiều bản ghi, thêm 1 dòng vào ` +
      `MANUAL_MIRROR_FALLBACKS_BY_FILENAME (key = tên file ở trên, không kèm ` +
      `đuôi) trong scripts/mirror-images-to-r2.ts rồi chạy lại — 1 dòng sẽ ` +
      `vá được toàn bộ số bản ghi liệt kê ở trên, không cần thêm theo từng id.`
  );
}

// ---------- MAIN ----------
async function main(): Promise<void> {
  const pipeline = await startPipeline('mirror');

  if (DRY_RUN) {
    console.log("=== DRY RUN ===\n");
  } else {
    console.log("Mirror ảnh sang R2...\n");
    console.log(`Timeout: ${TIMEOUT_MS / 1000}s, Retry: ${RETRY_COUNT}, Delay: ${DELAY_BETWEEN_REQUESTS_MS}ms\n`);
  }

  try {
    await mirrorCharacters();
    await mirrorMaterials();
    await mirrorWeapons();
    await mirrorArtifactSets();
    await mirrorDomains();

    if (!DRY_RUN) {
      console.log(
        `\n✅ Tải mới: ${downloadedCount}, Đã có: ${skippedExistingCount}, Lỗi: ${failedCount}`
      );

      await endPipelineSuccess(pipeline.id, {
        downloaded: downloadedCount,
        skipped: skippedExistingCount,
        failed: failedCount,
        totalAttempted: downloadedCount + skippedExistingCount + failedCount,
        dryRun: false,
      });

      if (failedCount > 0) {
        printFailureSummary();
        await notifyOps({
          source: 'mirror-images',
          severity: 'warning',
          title: `${failedCount} ảnh mirror thất bại`,
          detail: buildFailureListText(),
        });
      } else {
        await notifyOps({
          source: 'mirror-images',
          severity: 'info',
          title: `Mirror thành công: ${downloadedCount} ảnh mới, ${skippedExistingCount} ảnh đã có`,
        });
      }
    } else {
      console.log("\n=== DRY RUN kết thúc. Bỏ --dry-run để chạy thật. ===");
    }
  } catch (error) {
    const errMsg = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    console.error("❌ Lỗi:", error);
    await endPipelineFailure(pipeline.id, errMsg);
    await notifyOps({
      source: 'mirror-images',
      severity: 'error',
      title: 'Script mirror ảnh crash giữa chừng',
      detail: errMsg,
    });
    throw error;
  }
}

main().catch((error) => {
  console.error("❌ Unhandled mirror failure:", error);
  process.exit(1);
});