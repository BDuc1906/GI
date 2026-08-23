/**
 * scripts/fix-character-image-mixup.ts
 *
 * Sửa 1 LẦN dữ liệu đã bị lỗi do bug ĐÃ XÁC NHẬN trong
 * scripts/auto-fill-local-images.ts (đã vá — xem comment trong file đó
 * và src/lib/local-image-name.ts): 14 biến thể Traveler ("Aether
 * (Cryo)", "Lumine (Geo)"...) có `splashUrl` bị fuzzy-match nhầm sang
 * file local CHỈ đặt tên theo nguyên tố (vd "/local-genshin-assets/
 * cryo.png") — không phải ảnh nhân vật thật. Vì EntityCard ưu tiên
 * `splashUrl` trước `iconUrl`, giá trị rác này luôn được chọn hiển thị.
 *
 * Script này set `splashUrl` về null cho các dòng khớp đúng pattern đó
 * — `iconUrl` (đã mirror đúng qua R2 từ trước) sẽ tự động được dùng lại
 * làm ảnh chính (xem resolveCharacterCardImage() trong
 * src/lib/character-helpers.ts).
 *
 * CHẠY THỬ TRƯỚC (mặc định, KHÔNG ghi DB):
 *   npx tsx --env-file=.env scripts/fix-character-image-mixup.ts
 *
 * CHẠY THẬT (ghi DB):
 *   npx tsx --env-file=.env scripts/fix-character-image-mixup.ts -- --apply
 */

import { assertEnv } from "../src/lib/env";
assertEnv();

import { prisma } from "../src/lib/prisma";

const APPLY = process.argv.includes("--apply");

const ELEMENT_NAMES = ["anemo", "geo", "electro", "dendro", "hydro", "pyro", "cryo"];
const BAD_LOCAL_ELEMENT_ASSET = new RegExp(
  `^/local-genshin-assets/(${ELEMENT_NAMES.join("|")})\\.[a-z0-9]+$`,
  "i"
);

async function main() {
  console.log(
    APPLY
      ? "🔧 Chạy THẬT — sẽ set splashUrl về null cho các bản ghi lỗi.\n"
      : "🔍 Chạy THỬ (dry-run) — sẽ KHÔNG ghi DB. Thêm \"-- --apply\" để ghi thật.\n"
  );

  const characters = await prisma.character.findMany({
    select: { id: true, name: true, splashUrl: true, iconUrl: true },
  });

  const broken = characters.filter((c) => c.splashUrl && BAD_LOCAL_ELEMENT_ASSET.test(c.splashUrl));

  if (broken.length === 0) {
    console.log("✔ Không tìm thấy nhân vật nào bị dính bug splashUrl local-genshin-assets.");
    return;
  }

  console.log(`Tìm thấy ${broken.length} nhân vật bị lỗi:\n`);
  for (const c of broken) {
    console.log(`  - ${c.name} (${c.id}): splashUrl="${c.splashUrl}" → sẽ dùng iconUrl="${c.iconUrl}"`);
  }

  if (!APPLY) {
    console.log(`\n👉 Đây là dry-run. Chạy lại kèm "-- --apply" để ghi ${broken.length} thay đổi trên vào DB thật.`);
    return;
  }

  console.log("\n💾 Đang ghi vào DB...");
  for (const c of broken) {
    await prisma.character.update({ where: { id: c.id }, data: { splashUrl: null } });
  }
  console.log(`✅ Đã sửa xong ${broken.length} nhân vật.`);
}

main()
  .catch((err) => {
    console.error("❌ Script thất bại:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
