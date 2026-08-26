/**
 * scripts/fix-ascension-stat-data.ts
 *
 * Sửa 1 LẦN dữ liệu `Character.ascensionStat` đang sai/thiếu trong DB —
 * cùng nguyên nhân với bug vision/weaponType đã sửa trước đó (xem
 * scripts/fix-vision-weapon-data.ts): scripts/pipeline/crawl-characters.ts
 * đọc `raw.ascensionStat` — field KHÔNG TỒN TẠI trong genshin-db v5 (luôn
 * undefined) — thay vì đúng ra phải đọc `raw.substatText` (vd "CRIT DMG",
 * "Elemental Mastery", "Energy Recharge", "ATK", "Pyro DMG Bonus"...).
 * Hậu quả: cột `ascensionStat` bị NULL, UI (CharacterLevelSlider) phải
 * fallback hiện chữ chung chung "Chỉ số đột phá" thay vì tên thật.
 *
 * Bug ở crawl-characters.ts đã được sửa (dùng substatText), nên lần
 * crawl+seed tiếp theo sẽ tự đúng. Script này chỉ để sửa NGAY dữ liệu
 * đang có trong DB, không cần đợi/chạy lại toàn bộ pipeline crawl.
 *
 * CHẠY THỬ TRƯỚC (mặc định, KHÔNG ghi DB):
 *   npx tsx --env-file=.env scripts/fix-ascension-stat-data.ts
 *
 * CHẠY THẬT (ghi DB):
 *   npx tsx --env-file=.env scripts/fix-ascension-stat-data.ts -- --apply
 */

import { createRequire } from "module";
import { assertEnv } from "../../src/lib/infra/env";
assertEnv();

import { prisma } from "../../src/lib/db/prisma";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

const APPLY = process.argv.includes("--apply");

type Fix = { id: string; name: string; from: string | null; to: string };

async function main() {
  console.log(
    APPLY
      ? "🔧 Chạy THẬT — sẽ ghi đè `ascensionStat` sai/thiếu trong DB.\n"
      : "🔍 Chạy THỬ (dry-run) — sẽ KHÔNG ghi DB. Thêm `-- --apply` để ghi thật.\n"
  );

  const characters = await prisma.character.findMany({
    select: { id: true, name: true, ascensionStat: true },
  });

  const fixes: Fix[] = [];
  const notFoundInGenshinDb: string[] = [];
  const skippedTraveler: string[] = [];

  for (const c of characters) {
    // Biến thể Traveler theo nguyên tố (vd "Aether (Cryo)") không tra
    // được trong genshin-db theo đúng tên đó — giống lưu ý ở
    // fix-traveler-variant-data.ts. Bỏ qua, không phải lỗi.
    if (/^(Aether|Lumine)\s*[(（]/i.test(c.name)) {
      skippedTraveler.push(c.name);
      continue;
    }

    const raw = genshindb.characters(c.name) as any;
    if (!raw || !raw.name) {
      notFoundInGenshinDb.push(c.name);
      continue;
    }

    const correct = raw.substatText || null;
    if (!correct) continue; // Traveler gốc không có substatText, bỏ qua an toàn.

    if (correct !== c.ascensionStat) {
      fixes.push({ id: c.id, name: c.name, from: c.ascensionStat, to: correct });
    }
  }

  if (fixes.length === 0) {
    console.log("✔ Không tìm thấy nhân vật nào lệch dữ liệu ascensionStat.");
  } else {
    console.log(`Tìm thấy ${fixes.length} nhân vật cần sửa:\n`);
    for (const f of fixes) {
      console.log(`  - ${f.name} (${f.id}): "${f.from ?? "(trống)"}" → "${f.to}"`);
    }
  }

  if (notFoundInGenshinDb.length) {
    console.warn(
      `\n⚠ ${notFoundInGenshinDb.length} nhân vật không tìm thấy trong genshin-db theo tên:\n` +
      notFoundInGenshinDb.map((n) => `   - ${n}`).join("\n")
    );
  }
  if (skippedTraveler.length) {
    console.log(`\nℹ Bỏ qua ${skippedTraveler.length} biến thể Traveler theo nguyên tố (không áp dụng).`);
  }

  if (fixes.length === 0) return;

  if (!APPLY) {
    console.log(`\n👉 Đây là dry-run. Chạy lại kèm "-- --apply" để ghi ${fixes.length} thay đổi trên vào DB thật.`);
    return;
  }

  console.log("\n💾 Đang ghi vào DB...");
  for (const f of fixes) {
    await prisma.character.update({
      where: { id: f.id },
      data: { ascensionStat: f.to },
    });
  }
  console.log(`✅ Đã sửa xong ${fixes.length} nhân vật.`);
}

main()
  .catch((err) => {
    console.error("❌ Script thất bại:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
