/**
 * fix-reaction-category-labels.mjs
 *
 * Vá lại 5 nhãn category phản ứng nguyên tố (categoryTransformative,
 * categoryAdditive, categoryLunar, categoryStellar — categoryAmplifying
 * đã đúng, không đụng tới) trong toàn bộ 15 file src/messages/*.json.
 *
 * Bản gốc bị dịch sai nghĩa hoàn toàn ở nhiều ngôn ngữ (rất có thể do
 * pipeline dịch máy trước đó nhầm từ đồng âm/đồng nghĩa), ví dụ:
 *   - "Additive" (phản ứng Bổ trợ) -> bị dịch thành "Add-ons"/"플러그인"/
 *     "附加组件" nghĩa là "tiện ích mở rộng/plugin", hoàn toàn sai nghĩa.
 *   - "Stellar" (Tinh Vực) -> bị dịch thành "Essence"/"본질"/"本质" nghĩa
 *     là "tinh chất/bản chất", sai hoàn toàn.
 *   - "Lunar" (Nguyệt) -> bị dịch thành "Moon" ở tiếng Anh, và "문"/"月"
 *     (danh từ "mặt trăng") thay vì dùng đúng cách phiên âm/tính từ mà
 *     chính các tên phản ứng khác trong site đã dùng nhất quán (vd
 *     "루나-차지", "ルナチャージャー" cho Lunar-Charged).
 *
 * Chạy 1 lần: node scripts/fix-reaction-category-labels.mjs
 */
import fs from "fs";
import path from "path";

const MESSAGES_DIR = path.resolve("src/messages");

const FIXES = {
  categoryTransformative: {
    en: "Transformative", ko: "변형", ja: "変形", "zh-CN": "转化", "zh-TW": "轉化",
    tr: "Dönüştürücü", id: "Transformatif",
  },
  categoryAdditive: {
    en: "Additive", ko: "가산", ja: "加算", "zh-CN": "加成", "zh-TW": "加成",
    de: "Additiv", fr: "Additive", it: "Additiva", pt: "Aditiva", es: "Aditiva",
    ru: "Аддитивная", th: "การเติมแต่ง", tr: "Ekleyici", id: "Aditif",
  },
  categoryLunar: {
    en: "Lunar", ko: "루나", ja: "ルナ", de: "Lunar",
    fr: "Lunaire", it: "Lunare", pt: "Lunar", es: "Lunar", ru: "Лунный",
  },
  categoryStellar: {
    en: "Stellar", ko: "스텔라", ja: "ステラー", "zh-CN": "恒星", "zh-TW": "恆星",
    de: "Stellar", fr: "Stellaire", it: "Stellare", pt: "Estelar", es: "Estelar",
    ru: "Звёздный", th: "ดาวฤกษ์", tr: "Yıldız", id: "Bintang",
  },
};

const files = fs.readdirSync(MESSAGES_DIR).filter((f) => f.endsWith(".json"));
let totalChanges = 0;

for (const file of files) {
  const locale = file.replace(/\.json$/, "");
  const fullPath = path.join(MESSAGES_DIR, file);
  const json = JSON.parse(fs.readFileSync(fullPath, "utf-8"));

  if (!json.ReactionTabs) {
    console.log(`  [skip] ${file} — không có namespace ReactionTabs`);
    continue;
  }

  let changed = false;
  for (const [key, localeMap] of Object.entries(FIXES)) {
    if (locale in localeMap) {
      const oldValue = json.ReactionTabs[key];
      const newValue = localeMap[locale];
      if (oldValue !== newValue) {
        json.ReactionTabs[key] = newValue;
        console.log(`  [${locale}] ${key}: "${oldValue}" -> "${newValue}"`);
        changed = true;
        totalChanges++;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(fullPath, JSON.stringify(json, null, 2) + "\n", "utf-8");
  }
}

console.log(`\nHoàn tất — đã sửa ${totalChanges} giá trị trên ${files.length} file ngôn ngữ.`);
