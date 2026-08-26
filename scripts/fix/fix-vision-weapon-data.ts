/**
 * scripts/fix-vision-weapon-data.ts
 *
 * Sửa 1 LẦN dữ liệu `vision` / `weaponType` đang sai trong DB — hậu quả
 * của bug trong scripts/pipeline/crawl-characters.ts: script đó đọc
 * `raw.vision` (field không tồn tại trong genshin-db v5 -> luôn 'Unknown')
 * và `raw.weaponType` (mã enum nội bộ, vd "WEAPON_POLE", KHÔNG phải tên
 * hiển thị "Polearm") thay vì đúng ra phải đọc `raw.elementText` /
 * `raw.weaponText`. Hậu quả: lọc theo vũ khí trên /characters luôn ra 0
 * kết quả, lọc theo nguyên tố sai/thiếu với các nhân vật bị crawl lại sau
 * khi bug xuất hiện.
 *
 * Bug ở crawl-characters.ts đã được sửa (dùng elementText/weaponText),
 * nên lần crawl+seed tiếp theo sẽ tự đúng. Script này chỉ để sửa NGAY dữ
 * liệu đang có trong DB, không cần đợi/chạy lại toàn bộ pipeline crawl.
 *
 * Khác với scripts/fix-vision-mismatch.ts (suy ra vision từ URL icon,
 * chỉ sửa được vision và chỉ khi elementIcon đã đúng): script này tra
 * thẳng genshin-db theo TÊN nhân vật để lấy elementText/weaponText THẬT,
 * sửa được cả 2 cột, kể cả những nhân vật đang bị 'Unknown' hoàn toàn.
 *
 * CHẠY THỬ TRƯỚC (mặc định, KHÔNG ghi DB):
 *   npx tsx --env-file=.env scripts/fix-vision-weapon-data.ts
 *
 * CHẠY THẬT (ghi DB):
 *   npx tsx --env-file=.env scripts/fix-vision-weapon-data.ts -- --apply
 */

import { createRequire } from "module";
import { assertEnv } from "../../src/lib/infra/env";
assertEnv();

import { prisma } from "../../src/lib/db/prisma";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

const APPLY = process.argv.includes("--apply");

type Fix = {
  id: string;
  name: string;
  visionFrom: string;
  visionTo: string;
  weaponFrom: string;
  weaponTo: string;
};

async function main() {
  console.log(
    APPLY
      ? "🔧 Chạy THẬT — sẽ ghi đè `vision`/`weaponType` sai trong DB.\n"
      : "🔍 Chạy THỬ (dry-run) — sẽ KHÔNG ghi DB. Thêm `-- --apply` để ghi thật.\n"
  );

  const characters = await prisma.character.findMany({
    select: { id: true, name: true, vision: true, weaponType: true },
  });

  const fixes: Fix[] = [];
  const notFoundInGenshinDb: string[] = [];

  for (const c of characters) {
    const raw = genshindb.characters(c.name) as any;
    if (!raw || !raw.name) {
      notFoundInGenshinDb.push(c.name);
      continue;
    }

    const correctVision = raw.elementText || null;
    const correctWeapon = raw.weaponText || null;
    if (!correctVision && !correctWeapon) continue;

    const visionWrong = correctVision && correctVision !== c.vision;
    const weaponWrong = correctWeapon && correctWeapon !== c.weaponType;

    if (visionWrong || weaponWrong) {
      fixes.push({
        id: c.id,
        name: c.name,
        visionFrom: c.vision,
        visionTo: correctVision ?? c.vision,
        weaponFrom: c.weaponType,
        weaponTo: correctWeapon ?? c.weaponType,
      });
    }
  }

  if (fixes.length === 0) {
    console.log("✔ Không tìm thấy nhân vật nào lệch dữ liệu vision/weaponType.");
  } else {
    console.log(`Tìm thấy ${fixes.length} nhân vật cần sửa:\n`);
    for (const f of fixes) {
      const visionNote = f.visionFrom !== f.visionTo ? `vision "${f.visionFrom}" → "${f.visionTo}"` : null;
      const weaponNote = f.weaponFrom !== f.weaponTo ? `weaponType "${f.weaponFrom}" → "${f.weaponTo}"` : null;
      console.log(`  - ${f.name} (${f.id}): ${[visionNote, weaponNote].filter(Boolean).join(", ")}`);
    }
  }

  if (notFoundInGenshinDb.length) {
    console.warn(
      `\n⚠ ${notFoundInGenshinDb.length} nhân vật không tìm thấy trong genshin-db theo tên (có thể tên đã đổi):\n` +
      notFoundInGenshinDb.map((n) => `   - ${n}`).join("\n")
    );
  }

  if (fixes.length === 0) return;

  if (!APPLY) {
    console.log(
      `\n👉 Đây là dry-run. Chạy lại kèm "-- --apply" để ghi ${fixes.length} thay đổi trên vào DB thật.`
    );
    return;
  }

  console.log("\n💾 Đang ghi vào DB...");
  for (const f of fixes) {
    await prisma.character.update({
      where: { id: f.id },
      data: { vision: f.visionTo, weaponType: f.weaponTo },
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