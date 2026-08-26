/**
 * scripts/fix-traveler-variant-data.ts
 *
 * Sửa nốt 14 nhân vật "Aether (Element)" / "Lumine (Element)" mà
 * scripts/fix-vision-weapon-data.ts KHÔNG sửa được — vì đây là các dòng
 * đại diện riêng cho từng nguyên tố của Nhà Lữ Hành (Traveler) do chính
 * web này tách ra để lọc theo nguyên tố, genshin-db không có tên nhân vật
 * khớp kiểu "Aether (Cryo)" (genshin-db chỉ biết "Aether"/"Lumine" gốc,
 * không tách biến thể nguyên tố — xem comment trong
 * scripts/lib/genshin-pure-helpers.ts / resolveTravelerTalentBook).
 *
 * Không cần tra genshin-db: suy thẳng từ CHÍNH CÁI TÊN đang lưu trong DB —
 * nguyên tố nằm trong ngoặc ở cuối tên, và Traveler CHỈ dùng Sword ở mọi
 * nguyên tố (không có biến thể vũ khí khác).
 *
 * CHẠY THỬ TRƯỚC (mặc định, KHÔNG ghi DB):
 *   npx tsx --env-file=.env scripts/fix-traveler-variant-data.ts
 *
 * CHẠY THẬT (ghi DB):
 *   npx tsx --env-file=.env scripts/fix-traveler-variant-data.ts -- --apply
 */

import { assertEnv } from "../../src/lib/infra/env";
assertEnv();

import { prisma } from "../../src/lib/db/prisma";

const APPLY = process.argv.includes("--apply");

// Tên nguyên tố hợp lệ, để chặn match nhầm nếu có nhân vật khác lỡ có
// dấu ngoặc trong tên vì lý do gì đó không liên quan tới Traveler.
const VALID_ELEMENTS = new Set([
  "Anemo", "Geo", "Electro", "Dendro", "Hydro", "Pyro", "Cryo",
]);

// Khớp thoáng: cho phép khoảng trắng bất kỳ (kể cả \u00A0 non-breaking
// space), ngoặc nửa/toàn chiều rộng ( ) hoặc （ ）, và không phân biệt
// hoa/thường ở tên nguyên tố (ELEMENT_TEXT chuẩn hoá sau khi khớp).
const TRAVELER_NAME_PATTERN = /^(Aether|Lumine)\s*[(（]\s*([A-Za-z]+)\s*[)）]\s*$/i;

type Fix = { id: string; name: string; visionFrom: string; visionTo: string; weaponFrom: string; weaponTo: string };

async function main() {
  console.log(
    APPLY
      ? "🔧 Chạy THẬT — sẽ ghi đè vision/weaponType của các biến thể Traveler.\n"
      : "🔍 Chạy THỬ (dry-run) — sẽ KHÔNG ghi DB. Thêm `-- --apply` để ghi thật.\n"
  );

  const characters = await prisma.character.findMany({
    select: { id: true, name: true, vision: true, weaponType: true },
  });

  // Debug: liệt kê mọi nhân vật có "Aether"/"Lumine" trong tên kèm mã ký
  // tự (charCodeAt) của từng ký tự, để bắt được cả trường hợp regex trên
  // vẫn không khớp (vd ký tự lạ không lường trước).
  const travelerLike = characters.filter((c) => /aether|lumine/i.test(c.name));
  console.log(`🔎 Tìm thấy ${travelerLike.length} nhân vật có "Aether"/"Lumine" trong tên:`);
  for (const c of travelerLike) {
    const matched = TRAVELER_NAME_PATTERN.test(c.name);
    console.log(`   - id="${c.id}" name=${JSON.stringify(c.name)} matched=${matched}`);
  }
  console.log("");

  const fixes: Fix[] = [];

  for (const c of characters) {
    const match = c.name.match(TRAVELER_NAME_PATTERN);
    if (!match) continue;

    // Chuẩn hoá case: "cryo" -> "Cryo"
    const element = match[2][0].toUpperCase() + match[2].slice(1).toLowerCase();
    if (!VALID_ELEMENTS.has(element)) {
      console.warn(`⚠️ "${c.name}" (${c.id}): tên có dạng Traveler nhưng "${element}" không phải nguyên tố hợp lệ — bỏ qua.`);
      continue;
    }

    const visionWrong = c.vision !== element;
    const weaponWrong = c.weaponType !== "Sword";
    if (visionWrong || weaponWrong) {
      fixes.push({
        id: c.id,
        name: c.name,
        visionFrom: c.vision,
        visionTo: element,
        weaponFrom: c.weaponType,
        weaponTo: "Sword",
      });
    }
  }

  if (fixes.length === 0) {
    console.log("✔ Không có biến thể Traveler nào cần sửa.");
    return;
  }

  console.log(`Tìm thấy ${fixes.length} biến thể Traveler cần sửa:\n`);
  for (const f of fixes) {
    const visionNote = f.visionFrom !== f.visionTo ? `vision "${f.visionFrom}" → "${f.visionTo}"` : null;
    const weaponNote = f.weaponFrom !== f.weaponTo ? `weaponType "${f.weaponFrom}" → "${f.weaponTo}"` : null;
    console.log(`  - ${f.name} (${f.id}): ${[visionNote, weaponNote].filter(Boolean).join(", ")}`);
  }

  if (!APPLY) {
    console.log(`\n👉 Đây là dry-run. Chạy lại kèm "-- --apply" để ghi ${fixes.length} thay đổi trên vào DB thật.`);
    return;
  }

  console.log("\n💾 Đang ghi vào DB...");
  for (const f of fixes) {
    await prisma.character.update({
      where: { id: f.id },
      data: { vision: f.visionTo, weaponType: f.weaponTo },
    });
  }
  console.log(`✅ Đã sửa xong ${fixes.length} biến thể Traveler.`);
}

main()
  .catch((err) => {
    console.error("❌ Script thất bại:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());