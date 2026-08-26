/**
 * scripts/inspect-name-translations.ts
 *
 * CHỈ DÙNG 1 LẦN — kiểm tra thật (không đoán) xem genshin-db trả tên
 * đúng theo từng ngôn ngữ hay không, cho 1 nhân vật + 1 vũ khí + 1 thánh
 * di vật + 1 bí cảnh + 1 nguyên liệu mẫu, TRƯỚC KHI chạy
 * seed-name-translations.ts trên toàn bộ DB (hàng nghìn dòng).
 *
 * Chạy: npx tsx scripts/inspect-name-translations.ts
 */
import { createRequire } from "module";
import { getOfficialGameNames } from "../../src/lib/i18n/name-translations";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as Record<string, unknown>;

const SAMPLES: Array<{ folder: string; name: string }> = [
  { folder: "characters", name: "Kaedehara Kazuha" },
  { folder: "weapons", name: "Aquila Favonia" },
  { folder: "artifacts", name: "Gladiator's Finale" },
  { folder: "domains", name: "Domain of Blessing: Autumn Hunt" },
  { folder: "materials", name: "Mora" },
];

for (const { folder, name } of SAMPLES) {
  console.log(`\n=== ${folder} — "${name}" ===`);
  const names = getOfficialGameNames(genshindb, folder, name);
  for (const [locale, translated] of Object.entries(names)) {
    console.log(`  ${locale.padEnd(6)} → ${translated}`);
  }
  const missing = Object.keys({
    en: 1, vi: 1, "zh-CN": 1, "zh-TW": 1, ja: 1, ko: 1, id: 1, th: 1, de: 1, fr: 1, pt: 1, es: 1, ru: 1,
  }).filter((l) => !(l in names));
  if (missing.length > 0) {
    console.log(`  ⚠ Thiếu (genshin-db không trả tên cho): ${missing.join(", ")}`);
  }
}

console.log(
  "\n👉 Soát kỹ output ở trên trước khi chạy seed-name-translations.ts.\n" +
    "Nếu 1 locale nào đó BỊ THIẾU (dòng ⚠) ở TẤT CẢ 5 mẫu (không chỉ 1 mẫu lẻ),\n" +
    "khả năng cao là mã ngôn ngữ trong GENSHINDB_LOCALE_MAP\n" +
    "(scripts/lib/name-translations.ts) bị sai — dừng lại, KHÔNG chạy seed\n" +
    "script cho tới khi xác minh lại. Thiếu ở 1-2 mẫu lẻ là bình thường (không\n" +
    "phải entity nào cũng có đủ bản dịch trong dữ liệu gốc của game)."
);
