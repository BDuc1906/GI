#!/usr/bin/env node
/**
 * scripts/i18n/fix-duplicate-tweapontype.mjs
 *
 * Sửa lỗi tôi gây ra: script trước tự thêm dòng khai báo `const
 * tWeaponType = await getTranslations(...)` lần 2 dù đã có sẵn (check
 * cũ không nhận diện đúng định dạng dòng có sẵn) — TypeScript báo
 * "Cannot redeclare block-scoped variable". Xóa dòng trùng, giữ 1.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FILE = path.join(__dirname, "..", "..", "src", "app", "[locale]", "weapons", "[id]", "page.tsx");

async function main() {
  let src = await fs.readFile(FILE, "utf-8");
  const line = 'const tWeaponType = await getTranslations({ locale, namespace: "WeaponType" });';
  const count = src.split(line).length - 1;

  if (count <= 1) {
    console.log(`weapons/[id]/page.tsx: chỉ có ${count} dòng khai báo tWeaponType — không cần sửa.`);
    return;
  }

  // Xóa TẤT CẢ các lần xuất hiện kèm dòng mới đứng trước nó, rồi thêm
  // lại ĐÚNG 1 lần ngay sau setRequestLocale(locale).
  const withNewline = "\n  " + line;
  while (src.includes(withNewline)) {
    src = src.replace(withNewline, "");
  }
  const marker = "setRequestLocale(locale);";
  const idx = src.indexOf(marker);
  if (idx === -1) {
    console.log("⚠ Không tìm thấy setRequestLocale(locale) để chèn lại — cần sửa tay.");
    return;
  }
  const insertAt = idx + marker.length;
  src = src.slice(0, insertAt) + "\n  " + line + src.slice(insertAt);

  await fs.writeFile(FILE, src, "utf-8");
  console.log(`✓ Đã xóa ${count} dòng trùng, chỉ giữ lại đúng 1 dòng khai báo tWeaponType.`);
}

main().catch((err) => {
  console.error("✗ Lỗi:", err.message);
  process.exit(1);
});
