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

/**
 * scripts/mirror-images-to-r2.ts
 *
 * TẠI SAO CẦN SCRIPT NÀY: toàn bộ ảnh trong DB hiện hotlink trực tiếp từ
 * Enka Network / Fandom Wikia / miHoYo CDN (xem next.config.ts
 * remotePatterns) — không phải rủi ro lý thuyết: nếu 1 trong 3 nguồn đổi
 * cấu trúc URL, chặn hotlink, hoặc ngừng hoạt động, ảnh vỡ hàng loạt trên
 * TOÀN site ngay lập tức, không có cách nào tự phục hồi. Script này tải
 * từng ảnh về, upload lên Cloudflare R2 (S3-compatible, KHÔNG tính phí
 * egress — khác biệt lớn nhất so với AWS S3 thật, quan trọng vì site này
 * chỉ đọc, lưu lượng ra chiếm gần như toàn bộ chi phí), rồi cập nhật DB
 * trỏ thẳng vào R2 — sau khi chạy xong, site không còn phụ thuộc nguồn
 * ngoài nào để hiển thị ảnh nữa.
 *
 * IDEMPOTENT — chạy lại nhiều lần an toàn:
 *   - Dòng đã trỏ vào R2_PUBLIC_URL (từ lần chạy trước) được bỏ qua ngay
 *     (xem isAlreadyMirrored trong scripts/lib/r2-client.ts).
 *   - Trước khi upload, kiểm tra object đã tồn tại trên R2 chưa
 *     (HeadObjectCommand) — nếu có rồi thì chỉ cập nhật DB, không tải lại
 *     ảnh gốc, không tốn băng thông/thời gian.
 *   - Trong 1 lần chạy, cache theo URL gốc để nhiều dòng cùng dùng chung 1
 *     ảnh (vd icon nguyên tố — nhiều nhân vật cùng Vision share 1 URL) chỉ
 *     tải + kiểm tra 1 lần.
 *
 * AN TOÀN: hỗ trợ `--dry-run` — chạy thử, in ra sẽ làm gì, KHÔNG upload
 * lên R2 và KHÔNG sửa DB. Luôn chạy dry-run trước khi chạy thật lần đầu.
 *
 *   npm run images:mirror -- --dry-run
 *   npm run images:mirror
 *
 * KHÔNG chạy trong CI — đây là thao tác vận hành một lần (hoặc chạy lại
 * sau khi seed dữ liệu mới có ảnh chưa mirror), không phải một phần của
 * pipeline build/deploy tự động.
 */

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

// Cache trong phạm vi 1 lần chạy script — key là URL gốc, value là URL R2
// công khai đã upload xong (hoặc đã xác nhận tồn tại sẵn).
const urlCache = new Map<string, string>();

let downloadedCount = 0;
let skippedExistingCount = 0;
let failedCount = 0;

const KNOWN_IMAGE_EXTENSIONS = new Set(["png", "webp", "jpg", "jpeg", "gif", "svg"]);

async function detectExtension(sourceUrl: string): Promise<string> {
  try {
    const head = await fetch(sourceUrl, { method: "HEAD" });
    const contentType = head.headers.get("content-type")?.split(";")[0]?.trim();
    if (contentType && CONTENT_TYPE_TO_EXT[contentType]) {
      return CONTENT_TYPE_TO_EXT[contentType];
    }
  } catch {
    // Một số CDN không hỗ trợ HEAD tốt (405/lỗi mạng) — rơi xuống đoán
    // theo đuôi file trong URL thay vì thất bại hẳn.
  }
  const pathExt = safeUrlPathExtension(sourceUrl);
  if (pathExt && KNOWN_IMAGE_EXTENSIONS.has(pathExt)) {
    return pathExt === "jpeg" ? "jpg" : pathExt;
  }
  return "png"; // fallback an toàn — hầu hết ảnh Genshin đều PNG nền trong suốt.
}

function safeUrlPathExtension(url: string): string | null {
  try {
    const ext = new URL(url).pathname.split(".").pop()?.toLowerCase();
    return ext && ext.length <= 4 ? ext : null;
  } catch {
    return null;
  }
}

async function objectExistsOnR2(key: string): Promise<boolean> {
  if (!r2) return false;
  try {
    await r2.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Tải `sourceUrl` về và upload lên R2 dưới key `${keyBase}.<ext đoán được>`.
 * Trả về URL R2 công khai mới, hoặc null nếu bỏ qua (đã mirror rồi / tải
 * lỗi — trường hợp lỗi giữ nguyên URL gốc trong DB thay vì làm hỏng dữ
 * liệu, script tiếp tục với dòng kế tiếp thay vì dừng hẳn).
 */
async function mirrorUrl(sourceUrl: string, keyBase: string): Promise<string | null> {
  if (isAlreadyMirrored(sourceUrl)) return null;

  const cached = urlCache.get(sourceUrl);
  if (cached) return cached;

  const ext = await detectExtension(sourceUrl);
  const key = `${keyBase}.${ext}`;

  if (DRY_RUN) {
    console.log(`  [dry-run] sẽ mirror: ${sourceUrl}\n            -> ${key}`);
    const fakeUrl = `<R2_PUBLIC_URL>/${key}`;
    urlCache.set(sourceUrl, fakeUrl);
    return fakeUrl;
  }

  const existsAlready = await objectExistsOnR2(key);
  if (existsAlready) {
    skippedExistingCount++;
  } else {
    const res = await fetch(sourceUrl);
    if (!res.ok) {
      failedCount++;
      console.warn(`  ⚠ Không tải được ${sourceUrl} (HTTP ${res.status}) — giữ nguyên URL gốc.`);
      return null;
    }
    const bytes = new Uint8Array(await res.arrayBuffer());
    const contentType =
      res.headers.get("content-type")?.split(";")[0]?.trim() ??
      `image/${ext === "jpg" ? "jpeg" : ext}`;

    await r2!.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: bytes,
        ContentType: contentType,
        // Ảnh Genshin không đổi sau khi ra mắt (icon nhân vật/vũ khí cũ
        // không được vẽ lại) -> cache vĩnh viễn ở CDN là an toàn, giảm tối
        // đa số lần Cloudflare phải gọi lại origin.
        CacheControl: "public, max-age=31536000, immutable",
      })
    );
    downloadedCount++;
  }

  const publicUrl = r2PublicUrl(key);
  urlCache.set(sourceUrl, publicUrl);
  return publicUrl;
}

async function mirrorCharacters(): Promise<void> {
  const rows = await prisma.character.findMany({
    select: { id: true, vision: true, iconUrl: true, sideIconUrl: true, splashUrl: true, elementIcon: true },
  });
  let updated = 0;

  for (const c of rows) {
    const data: Record<string, string> = {};

    if (c.iconUrl) {
      const u = await mirrorUrl(c.iconUrl, `characters/${c.id}/icon`);
      if (u) data.iconUrl = u;
    }
    if (c.sideIconUrl) {
      const u = await mirrorUrl(c.sideIconUrl, `characters/${c.id}/side-icon`);
      if (u) data.sideIconUrl = u;
    }
    if (c.splashUrl) {
      const u = await mirrorUrl(c.splashUrl, `characters/${c.id}/splash`);
      if (u) data.splashUrl = u;
    }
    if (c.elementIcon) {
      // Icon nguyên tố dùng CHUNG giữa mọi nhân vật cùng Vision (vd toàn bộ
      // nhân vật Pyro cùng trỏ 1 URL gốc) -> đặt key theo vision thay vì
      // theo từng nhân vật, để tự nhiên chỉ upload 1 lần duy nhất cho mỗi
      // nguyên tố (7 nguyên tố = tối đa 7 lần upload, không phải hàng trăm
      // bản sao giống hệt nhau).
      const u = await mirrorUrl(c.elementIcon, `shared/element-icons/${c.vision.toLowerCase()}`);
      if (u) data.elementIcon = u;
    }

    if (Object.keys(data).length > 0) {
      if (!DRY_RUN) await prisma.character.update({ where: { id: c.id }, data });
      updated++;
    }
  }
  console.log(`Characters: ${updated}/${rows.length} dòng có ảnh cần cập nhật.`);
}

async function mirrorMaterials(): Promise<void> {
  const rows = await prisma.material.findMany({ select: { id: true, iconUrl: true } });
  let updated = 0;
  for (const m of rows) {
    if (!m.iconUrl) continue;
    const u = await mirrorUrl(m.iconUrl, `materials/${m.id}/icon`);
    if (u) {
      if (!DRY_RUN) await prisma.material.update({ where: { id: m.id }, data: { iconUrl: u } });
      updated++;
    }
  }
  console.log(`Materials: ${updated}/${rows.length} dòng có ảnh cần cập nhật.`);
}

async function mirrorWeapons(): Promise<void> {
  const rows = await prisma.weapon.findMany({ select: { id: true, iconUrl: true } });
  let updated = 0;
  for (const w of rows) {
    if (!w.iconUrl) continue;
    const u = await mirrorUrl(w.iconUrl, `weapons/${w.id}/icon`);
    if (u) {
      if (!DRY_RUN) await prisma.weapon.update({ where: { id: w.id }, data: { iconUrl: u } });
      updated++;
    }
  }
  console.log(`Weapons: ${updated}/${rows.length} dòng có ảnh cần cập nhật.`);
}

async function mirrorArtifactSets(): Promise<void> {
  const rows = await prisma.artifactSet.findMany({ select: { id: true, iconUrl: true } });
  let updated = 0;
  for (const a of rows) {
    if (!a.iconUrl) continue;
    const u = await mirrorUrl(a.iconUrl, `artifacts/${a.id}/icon`);
    if (u) {
      if (!DRY_RUN) await prisma.artifactSet.update({ where: { id: a.id }, data: { iconUrl: u } });
      updated++;
    }
  }
  console.log(`ArtifactSets: ${updated}/${rows.length} dòng có ảnh cần cập nhật.`);
}

async function mirrorDomains(): Promise<void> {
  const rows = await prisma.domain.findMany({ select: { id: true, imageUrl: true } });
  let updated = 0;
  for (const d of rows) {
    if (!d.imageUrl) continue;
    const u = await mirrorUrl(d.imageUrl, `domains/${d.id}/image`);
    if (u) {
      if (!DRY_RUN) await prisma.domain.update({ where: { id: d.id }, data: { imageUrl: u } });
      updated++;
    }
  }
  console.log(`Domains: ${updated}/${rows.length} dòng có ảnh cần cập nhật.`);
}

async function main(): Promise<void> {
  if (DRY_RUN) {
    console.log("=== DRY RUN — không upload lên R2, không sửa DB ===\n");
  } else {
    console.log("Mirror ảnh sang Cloudflare R2...\n");
  }

  await mirrorCharacters();
  await mirrorMaterials();
  await mirrorWeapons();
  await mirrorArtifactSets();
  await mirrorDomains();

  if (!DRY_RUN) {
    console.log(
      `\nHoàn tất — tải mới ${downloadedCount}, đã có sẵn trên R2 (bỏ qua) ${skippedExistingCount}, lỗi ${failedCount}.`
    );
    if (failedCount > 0) {
      console.warn(
        `⚠ ${failedCount} ảnh tải lỗi vẫn còn trỏ URL gốc trong DB — chạy lại script này ` +
          `(idempotent, an toàn) sau khi kiểm tra lại nguồn, hoặc kiểm tra log phía trên để biết ảnh nào.`
      );
    }
  } else {
    console.log("\n=== Kết thúc dry-run. Chạy lại KHÔNG có --dry-run để thực hiện thật. ===");
  }
}

main()
  .catch((e) => {
    console.error("❌ Script mirror-images-to-r2 thất bại khi chạy:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
