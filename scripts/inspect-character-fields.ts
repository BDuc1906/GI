/**
 * scripts/inspect-character-fields.ts
 *
 * So sánh TOÀN BỘ field mà genshin-db trả về cho characters với danh sách
 * field mà scripts/pipeline/crawl-characters.ts hiện đang trích ra —
 * để biết chính xác đang bỏ sót field nào ở phần nhân vật.
 *
 * Chạy: npx tsx scripts/inspect-character-fields.ts
 */

import { createRequire } from "module";
import fs from "fs";
import path from "path";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as any;

// Field CharacterData hiện đang lấy — copy đúng theo scripts/pipeline/crawl-characters.ts.
// Nếu file đó đổi, cập nhật lại danh sách này cho khớp.
const CURRENTLY_CAPTURED = new Set([
  "name",
  "title",
  "elementText", // -> vision
  "weaponText", // -> weaponType
  "rarity",
  "region",
  "affiliation",
  "description",
  "images", // -> iconUrl/sideIconUrl/splashUrl (chỉ lấy 1 vài biến thể, xem getBestImageUrl)
  "baseHp",
  "baseAtk",
  "baseDef",
  "substatText", // -> ascensionStat
  "costs", // -> ascensionMaterials/talentMaterials
  "stats", // -> statsByLevel
  "birthday",
  "constellationName",
  "voice", // -> voiceActors
  "version", // -> gameVersion
  "wikiUrl",
]);

const OUT_DIR = path.join(process.cwd(), "data", "inspect");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

function main() {
  const names: string[] = genshindb.characters("names", { matchCategories: true });
  console.log(`Đang quét ${names.length} nhân vật...\n`);

  const allKeys = new Set<string>();
  const keyPresenceCount: Record<string, number> = {};
  let sampleFull: any = null;

  for (const name of names) {
    const raw = genshindb.characters(name);
    if (!raw) continue;
    if (!sampleFull || name === "Hu Tao") sampleFull = raw; // ưu tiên 1 nhân vật đầy đủ dữ liệu làm mẫu

    for (const key of Object.keys(raw)) {
      allKeys.add(key);
      keyPresenceCount[key] = (keyPresenceCount[key] ?? 0) + 1;
    }
  }

  const missing = [...allKeys].filter((k) => !CURRENTLY_CAPTURED.has(k)).sort();
  const captured = [...allKeys].filter((k) => CURRENTLY_CAPTURED.has(k)).sort();

  console.log("=== FIELD ĐANG ĐƯỢC LẤY (có mặt trong CharacterData) ===");
  console.log(captured.join(", "));

  console.log("\n=== ❌ FIELD BỊ BỎ SÓT (genshin-db có nhưng crawl-characters.ts KHÔNG lấy) ===");
  for (const key of missing) {
    console.log(`  ${key.padEnd(25)} (xuất hiện ở ${keyPresenceCount[key]}/${names.length} nhân vật)`);
  }

  // Ghi mẫu 1 object đầy đủ ra file để xem cụ thể hình dạng/giá trị từng field thiếu
  fs.writeFileSync(
    path.join(OUT_DIR, "character-sample-full.json"),
    JSON.stringify(sampleFull, null, 2)
  );
  fs.writeFileSync(
    path.join(OUT_DIR, "character-fields-missing.json"),
    JSON.stringify({ captured, missing, keyPresenceCount }, null, 2)
  );

  console.log(`\n📁 Mẫu object đầy đủ 1 nhân vật: ${OUT_DIR}/character-sample-full.json`);
  console.log(`📄 Chi tiết field thiếu: ${OUT_DIR}/character-fields-missing.json`);
}

main();
