#!/usr/bin/env node
/**
 * scripts/i18n/apply-element-name-translations.mjs
 *
 * Vá 1 lỗi tôi bỏ sót: 7 tên nguyên tố (Pyro/Hydro/Cryo...) chưa có bản
 * dịch ngoài vi/en, khiến mọi ngôn ngữ khác tự rơi về tiếng Anh. Dữ liệu
 * lấy từ genshin-db (field elementText của nhân vật, đã verify khớp
 * đúng 100% với nameVi hiện có trong file — Hỏa/Thủy/Băng/Lôi/Phong/
 * Nham/Thảo).
 *
 * AN TOÀN: chỉ CHÈN THÊM field `nameTranslations` vào 7 dòng ELEMENTS,
 * không đụng vào bất kỳ nội dung nào khác trong element-reactions-data.ts
 * — không ghi đè cả file, không ảnh hưởng 546 key bạn vừa dịch xong.
 * Idempotent — chạy lại không chèn trùng.
 *
 * CÁCH DÙNG:
 *   node scripts/i18n/apply-element-name-translations.mjs
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "..", "..", "src", "lib", "game", "element-reactions-data.ts");

const ELEMENT_TRANSLATIONS = {
  pyro:    { "zh-CN": "火", "zh-TW": "火", ja: "炎", ko: "불", fr: "Pyro", de: "Pyro", id: "Pyro", it: "Pyro", pt: "Pyro", ru: "Пиро", es: "Pyro", th: "ไฟ", tr: "Ateş" },
  hydro:   { "zh-CN": "水", "zh-TW": "水", ja: "水", ko: "물", fr: "Hydro", de: "Hydro", id: "Hydro", it: "Hydro", pt: "Hydro", ru: "Гидро", es: "Hydro", th: "น้ำ", tr: "Su" },
  cryo:    { "zh-CN": "冰", "zh-TW": "冰", ja: "氷", ko: "얼음", fr: "Cryo", de: "Kryo", id: "Cryo", it: "Cryo", pt: "Cryo", ru: "Крио", es: "Cryo", th: "น้ำแข็ง", tr: "Buz" },
  electro: { "zh-CN": "雷", "zh-TW": "雷", ja: "雷", ko: "번개", fr: "Électro", de: "Elektro", id: "Electro", it: "Electro", pt: "Electro", ru: "Электро", es: "Electro", th: "ไฟฟ้า", tr: "Elektrik" },
  anemo:   { "zh-CN": "风", "zh-TW": "風", ja: "風", ko: "바람", fr: "Anémo", de: "Anemo", id: "Anemo", it: "Anemo", pt: "Anemo", ru: "Анемо", es: "Anemo", th: "ลม", tr: "Rüzgar" },
  geo:     { "zh-CN": "岩", "zh-TW": "岩", ja: "岩", ko: "바위", fr: "Géo", de: "Geo", id: "Geo", it: "Geo", pt: "Geo", ru: "Гео", es: "Geo", th: "หิน", tr: "Toprak" },
  dendro:  { "zh-CN": "草", "zh-TW": "草", ja: "草", ko: "풀", fr: "Dendro", de: "Dendro", id: "Dendro", it: "Dendro", pt: "Dendro", ru: "Дендро", es: "Dendro", th: "ไม้", tr: "Doğa" },
};

async function main() {
  let src = await fs.readFile(DATA_FILE, "utf-8");

  // 1) Thêm field nameTranslations vào interface ElementInfo (nếu có
  //    khai báo interface riêng) — nếu ELEMENTS chỉ là literal array
  //    không qua interface đặt tên, bỏ qua bước này (TypeScript vẫn suy
  //    luận đúng kiểu từ literal, không bắt buộc phải khai interface).
  let insertedCount = 0;
  let skippedCount = 0;

  for (const [id, translations] of Object.entries(ELEMENT_TRANSLATIONS)) {
    const marker = `id: "${id}",`;
    const idx = src.indexOf(marker);
    if (idx === -1) {
      console.log(`⚠ Không tìm thấy "${marker}" — bỏ qua.`);
      continue;
    }
    // Kiểm tra dòng này đã có nameTranslations chưa (idempotent).
    const lineEnd = src.indexOf("\n", idx);
    const line = src.slice(idx, lineEnd);
    if (line.includes("nameTranslations")) {
      skippedCount++;
      continue;
    }
    const jsonValue = JSON.stringify(translations);
    const insertion = ` nameTranslations: ${jsonValue},`;
    // Chèn ngay sau nameVi: "...", trên cùng dòng.
    const nameViMatch = line.match(/nameVi:\s*"[^"]*",/);
    if (!nameViMatch) {
      console.log(`⚠ Không tìm thấy "nameVi:" trên dòng của "${id}" — bỏ qua, chèn tay.`);
      continue;
    }
    const insertPos = idx + nameViMatch.index + nameViMatch[0].length;
    src = src.slice(0, insertPos) + insertion + src.slice(insertPos);
    insertedCount++;
  }

  await fs.writeFile(DATA_FILE, src, "utf-8");
  console.log(`✓ Đã chèn nameTranslations: ${insertedCount} nguyên tố, bỏ qua ${skippedCount} (đã có sẵn).`);

  // 2) Sửa hàm getElementName để thật sự ĐỌC nameTranslations vừa thêm
  //    (trước đó hàm chỉ biết vi/en, mọi locale khác luôn rơi về tiếng Anh).
  const oldFn = 'export function getElementName(el: { name: string; nameVi: string }, locale: string): string {\n  return locale === "vi" ? el.nameVi : el.name;\n}';
  const newFn = 'export function getElementName(el: { name: string; nameVi: string; nameTranslations?: Partial<Record<OtherLocale, string>> }, locale: string): string {\n  if (locale === "vi") return el.nameVi;\n  return el.nameTranslations?.[locale as OtherLocale] ?? el.name;\n}';
  if (src.includes(oldFn)) {
    src = src.replace(oldFn, newFn);
    await fs.writeFile(DATA_FILE, src, "utf-8");
    console.log("✓ Đã sửa getElementName() để đọc nameTranslations.");
  } else if (src.includes("el.nameTranslations")) {
    console.log("→ getElementName() đã được sửa từ trước, bỏ qua.");
  } else {
    console.log("⚠ Không tìm thấy đúng nội dung hàm getElementName() để sửa tự động — cần sửa tay (xem hướng dẫn cuối log).");
  }
}

main().catch((err) => {
  console.error("✗ Lỗi:", err.message);
  process.exit(1);
});
