#!/usr/bin/env node
/**
 * scripts/i18n/apply-game-content-translations.mjs
 *
 * Đọc các file scripts/i18n/game-content-{locale}.json (do
 * translate-game-content.mjs sinh ra), ghép thêm key locale đó vào ĐÚNG
 * object nameTranslations/descriptionTranslations tương ứng trong
 * src/lib/game/element-reactions-data.ts — KHÔNG đụng vào field "en" đã
 * verify tay, chỉ THÊM các locale mới.
 *
 * An toàn với dấu ngoặc `{`/`}` nằm BÊN TRONG chuỗi string (vd mô tả có
 * chứa "(x2 nếu...)")— dùng bộ đếm độ sâu ngoặc có nhận biết string
 * literal (findMatchingBrace bên dưới), không dùng regex ngây thơ.
 *
 * CÁCH DÙNG:
 *   node scripts/i18n/apply-game-content-translations.mjs
 *   node scripts/i18n/apply-game-content-translations.mjs --locale=ja,ko
 *
 * AN TOÀN CHẠY LẠI: idempotent — nếu 1 locale đã có trong object rồi,
 * script tự động SKIP thay vì chèn trùng.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "..", "..", "src", "lib", "game", "element-reactions-data.ts");

const ALL_TARGET_LOCALES = ["zh-CN", "zh-TW", "ja", "ko", "id", "th", "de", "fr", "it", "pt", "es", "ru", "tr"];

function parseArgs() {
  const args = process.argv.slice(2);
  const localeArg = args.find((a) => a.startsWith("--locale="));
  return { onlyLocales: localeArg ? localeArg.split("=")[1].split(",") : null };
}

/** Tìm vị trí dấu `}` khớp với dấu `{` ở openIdx, bỏ qua nội dung bên
 * trong string literal (', ", `) kể cả có escape (\"). */
function findMatchingBrace(src, openIdx) {
  let depth = 0;
  let inString = null; // null | "'" | '"' | "`"
  for (let i = openIdx; i < src.length; i++) {
    const ch = src[i];
    if (inString) {
      if (ch === "\\") { i++; continue; } // bỏ qua ký tự ngay sau backslash
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") { inString = ch; continue; }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  throw new Error(`Không tìm thấy dấu } khớp bắt đầu từ vị trí ${openIdx}`);
}

/** Chèn thêm key locale vào 1 object dạng `fieldName: { en: "..." }`,
 * tìm theo id đứng ngay trước đó trong cùng entry (id: "xxx", ...
 * fieldName: { ... }). Trả về source đã sửa, hoặc null nếu không tìm
 * thấy field đó cho id này (bình thường — không phải id nào cũng có
 * descriptionTranslations, vd formula dùng key khác). */
function insertLocaleIntoField(src, idMarker, fieldName, locale, value) {
  const idIdx = src.indexOf(idMarker);
  if (idIdx === -1) return { src, changed: false, reason: `không tìm thấy "${idMarker}"` };

  // Giới hạn phạm vi tìm fieldName tới đúng RANH GIỚI ENTRY thật (tìm
  // entry TIẾP THEO bắt đầu bằng "  { id:" sau vị trí này), KHÔNG dùng
  // số ký tự cố định — mô tả dài (13 ngôn ngữ) từng vượt quá 2000 ký tự
  // cứng trước đây, khiến script "không thấy" field đã có, tạo trùng
  // lặp hàng loạt object cùng tên (bug thật đã xảy ra, đã sửa ở đây).
  const nextEntryMatch = src.slice(idIdx + idMarker.length).match(/\n\s*\{\s*id:\s*"/);
  const searchWindowEnd = nextEntryMatch
    ? idIdx + idMarker.length + nextEntryMatch.index
    : src.length;
  const windowSrc = src.slice(idIdx, searchWindowEnd);
  const fieldMarker = `${fieldName}: {`;
  const fieldIdxInWindow = windowSrc.indexOf(fieldMarker);
  if (fieldIdxInWindow === -1) return { src, changed: false, reason: `không có field "${fieldName}"` };

  const fieldOpenIdx = idIdx + fieldIdxInWindow + fieldMarker.length - 1; // vị trí dấu "{"
  const fieldCloseIdx = findMatchingBrace(src, fieldOpenIdx);
  const fieldContent = src.slice(fieldOpenIdx + 1, fieldCloseIdx);

  // Idempotent: đã có key locale này rồi thì bỏ qua, không chèn trùng.
  const localeKeyPattern = new RegExp(`(^|[,{\\s])["']?${locale}["']?\\s*:`);
  if (localeKeyPattern.test(fieldContent)) {
    return { src, changed: false, reason: `đã có "${locale}" rồi, bỏ qua` };
  }

  const jsonValue = JSON.stringify(value);
  const insertion = `, "${locale}": ${jsonValue}`;
  const newSrc = src.slice(0, fieldCloseIdx) + insertion + src.slice(fieldCloseIdx);
  return { src: newSrc, changed: true };
}

async function main() {
  const { onlyLocales } = parseArgs();
  const targets = onlyLocales ?? ALL_TARGET_LOCALES;

  let src = await fs.readFile(DATA_FILE, "utf-8");
  let totalInserted = 0;
  let totalSkipped = 0;

  for (const locale of targets) {
    const jsonPath = path.join(__dirname, `game-content-${locale}.json`);
    let translations;
    try {
      translations = JSON.parse(await fs.readFile(jsonPath, "utf-8"));
    } catch {
      console.log(`⚠ ${locale}: không tìm thấy ${path.relative(process.cwd(), jsonPath)} — bỏ qua (chạy translate-game-content.mjs trước).`);
      continue;
    }

    let localeInserted = 0;
    let localeSkipped = 0;

    for (const [key, value] of Object.entries(translations)) {
      const [group, id, field] = key.split(".");

      if (group === "reaction" && field === "description") {
        const r = insertLocaleIntoField(src, `id: "${id}", descriptionTranslations:`, "descriptionTranslations", locale, value);
        src = r.src;
        r.changed ? localeInserted++ : localeSkipped++;
        continue;
      }
      if (group === "reaction" && field === "name") {
        // reaction CHƯA CHẮC có sẵn field nameTranslations (Phase 2 chỉ
        // tạo descriptionTranslations lúc khởi tạo entry) — nếu chưa có,
        // phải chèn THÊM cả object nameTranslations mới, ngay SAU khi
        // descriptionTranslations đã đóng ngoặc hoàn chỉnh (không phải
        // chèn giữa chừng chữ "descriptionTranslations:").
        const idIdx = src.indexOf(`id: "${id}",`);
        if (idIdx === -1) { localeSkipped++; continue; }

        // Thử tìm nameTranslations CÓ SẴN trước (idempotent / lần chạy sau).
        const r1 = insertLocaleIntoField(src, `id: "${id}",`, "nameTranslations", locale, value);
        if (r1.changed) {
          src = r1.src;
          localeInserted++;
          continue;
        }
        if (r1.reason && r1.reason.includes("đã có")) {
          localeSkipped++;
          continue;
        }

        // Chưa có nameTranslations — tìm descriptionTranslations, chèn
        // object nameTranslations mới ngay SAU dấu } đóng của nó.
        const descMarker = "descriptionTranslations: {";
        const nextEntryMatch = src.slice(idIdx).match(/\n\s*\{\s*id:\s*"/);
        const windowEnd = nextEntryMatch ? idIdx + nextEntryMatch.index : src.length;
        const descIdxInWindow = src.slice(idIdx, windowEnd).indexOf(descMarker);
        if (descIdxInWindow === -1) { localeSkipped++; continue; }
        const descOpenIdx = idIdx + descIdxInWindow + descMarker.length - 1;
        const descCloseIdx = findMatchingBrace(src, descOpenIdx);
        // Sau dấu } đóng thường có dấu "," ngay sau — chèn nameTranslations
        // mới ngay sau dấu phẩy đó (nếu có), không thì ngay sau dấu }.
        let insertAt = descCloseIdx + 1;
        if (src[insertAt] === ",") insertAt += 1;
        const jsonValue = JSON.stringify(value);
        const insertion = ` nameTranslations: { "${locale}": ${jsonValue} },`;
        src = src.slice(0, insertAt) + insertion + src.slice(insertAt);
        localeInserted++;
        continue;
      }
      if (group === "resonance" && (field === "name" || field === "description")) {
        const fieldName = field === "name" ? "nameTranslations" : "descriptionTranslations";
        const r = insertLocaleIntoField(src, `id: "${id}", nameTranslations:`, fieldName, locale, value);
        src = r.src;
        r.changed ? localeInserted++ : localeSkipped++;
        continue;
      }
      if (group === "formula" && (field === "title" || field === "explanation")) {
        const fieldName = field === "title" ? "titleTranslations" : "explanationTranslations";
        const r = insertLocaleIntoField(src, `category: "${id}",\n    titleTranslations:`, fieldName, locale, value);
        src = r.src;
        r.changed ? localeInserted++ : localeSkipped++;
        continue;
      }
      // lunar.*, hexerei.*, witchRevelation.*, lunar.scaling.* — các field
      // này nằm trong LUNAR_RESONANCE_EN/HEXEREI_INFO_EN/WITCH_REVELATION_INFO_EN
      // (object riêng, không phải Partial<Record<OtherLocale,...>>), CHƯA
      // hỗ trợ auto-apply — cần merge tay hoặc mở rộng script này nếu cần
      // đủ 15/15 ngôn ngữ cho 3 mục đó (hiện tại: vi + en, còn lại fallback
      // đúng theo thiết kế getLunarResonance/getHexereiInfo/getWitchRevelationInfo).
    }

    totalInserted += localeInserted;
    totalSkipped += localeSkipped;
    console.log(`${locale}: chèn ${localeInserted} key, bỏ qua ${localeSkipped} (đã có sẵn hoặc không có field tương ứng).`);
  }

  await fs.writeFile(DATA_FILE, src, "utf-8");
  console.log(`\n✓ Đã ghi ${path.relative(process.cwd(), DATA_FILE)}. Tổng: chèn ${totalInserted}, bỏ qua ${totalSkipped}.`);
  console.log("Chạy `npx tsc --noEmit` (hoặc npm run build) để xác nhận file vẫn hợp lệ trước khi commit.");
}

main().catch((err) => {
  console.error("✗ Lỗi:", err.message);
  process.exit(1);
});
