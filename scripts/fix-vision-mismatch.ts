/**
 * scripts/fix-vision-mismatch.ts
 *
 * Sửa 1 LẦN các nhân vật đang bị lệch giữa cột `vision` (text, vd "Pyro")
 * và cột `elementIcon` (URL icon nguyên tố) — hậu quả của bug đã sửa trong
 * scripts/seed-characters.ts (xem comment ở resolveFallbackField()): một
 * lần crawl bị thiếu dữ liệu từng ghi đè `vision` thành "Unknown" trong khi
 * `elementIcon` (cột ảnh, chỉ set lúc CREATE) vẫn giữ nguyên icon nguyên tố
 * THẬT — nhân vật hiển thị icon lửa nhưng text nguyên tố lại là "Unknown".
 *
 * Script này KHÔNG cần crawl lại: chỉ cần đọc ngược map URL -> tên nguyên
 * tố (ELEMENT_ICON_MAP) để suy ra vision đúng từ elementIcon đang có sẵn.
 *
 * CHẠY THỬ TRƯỚC (mặc định, KHÔNG ghi DB):
 *   npx tsx --env-file=.env scripts/fix-vision-mismatch.ts
 *
 * CHẠY THẬT (ghi DB):
 *   npx tsx --env-file=.env scripts/fix-vision-mismatch.ts -- --apply
 */

import { assertEnv } from "../src/lib/env";
assertEnv();

import { prisma } from "../src/lib/prisma";
import { ELEMENT_ICON_MAP } from "./lib/genshin-pure-helpers";

const APPLY = process.argv.includes("--apply");

// Đảo ngược ELEMENT_ICON_MAP: URL icon -> tên nguyên tố.
const ICON_URL_TO_VISION = new Map<string, string>(
  Object.entries(ELEMENT_ICON_MAP).map(([vision, url]) => [url, vision])
);

type Mismatch = { id: string; name: string; from: string; to: string };

async function main() {
  console.log(
    APPLY
      ? "🔧 Chạy THẬT — sẽ ghi đè `vision` sai trong DB.\n"
      : "🔍 Chạy THỬ (dry-run) — sẽ KHÔNG ghi DB. Thêm `-- --apply` để ghi thật.\n"
  );

  const characters = await prisma.character.findMany({
    select: { id: true, name: true, vision: true, elementIcon: true },
  });

  const mismatches: Mismatch[] = [];
  for (const c of characters) {
    if (!c.elementIcon) continue;
    const correctVision = ICON_URL_TO_VISION.get(c.elementIcon);
    if (correctVision && correctVision !== c.vision) {
      mismatches.push({ id: c.id, name: c.name, from: c.vision, to: correctVision });
    }
  }

  if (mismatches.length === 0) {
    console.log("✔ Không tìm thấy nhân vật nào lệch giữa `vision` và `elementIcon`.");
    return;
  }

  console.log(`Tìm thấy ${mismatches.length} nhân vật lệch dữ liệu nguyên tố:\n`);
  for (const m of mismatches) {
    console.log(`  - ${m.name} (${m.id}): vision "${m.from}" → phải là "${m.to}"`);
  }

  if (!APPLY) {
    console.log(
      `\n👉 Đây là dry-run. Chạy lại kèm "-- --apply" để ghi ${mismatches.length} thay đổi trên vào DB thật.`
    );
    return;
  }

  console.log("\n💾 Đang ghi vào DB...");
  for (const m of mismatches) {
    await prisma.character.update({ where: { id: m.id }, data: { vision: m.to } });
  }
  console.log(`✅ Đã sửa xong ${mismatches.length} nhân vật.`);
}

main()
  .catch((err) => {
    console.error("❌ Script thất bại:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
