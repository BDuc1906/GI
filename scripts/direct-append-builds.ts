/**
 * Script đơn giản: Chỉ đọc EXPERT_BUILDS từ append-expert-builds.ts
 * và append trực tiếp vào character-builds-data.ts (không cần DB connection).
 */
import fs from "fs";
import path from "path";
import { EXPERT_BUILDS } from "./append-expert-builds";

const dataPath = path.resolve(process.cwd(), "src/data/character-builds-data.ts");
let content = fs.readFileSync(dataPath, "utf-8");

let added = 0;
let skipped = 0;
let newEntriesCode = "";

for (const [charId, build] of Object.entries(EXPERT_BUILDS)) {
  // Kiểm tra xem đã có chưa
  if (
    content.includes(`"${charId}": {`) ||
    content.includes(`  ${charId}: {`)
  ) {
    console.log(`⏭  Bỏ qua '${charId}' — đã tồn tại`);
    skipped++;
    continue;
  }
  console.log(`✅ Thêm '${charId}'`);
  newEntriesCode += `\n  // ── ${charId} ──\n  "${charId}": ${JSON.stringify(build, null, 4)},\n`;
  added++;
}

if (newEntriesCode) {
  // Chèn trước "} ;" cuối cùng của CHARACTER_BUILDS (không phải ID_ALIASES hay function)
  // Pattern: tìm `\n};\n\n\nconst ID_ALIASES`
  const insertMarker = "\n};\n\n\nconst ID_ALIASES";
  const insertIndex = content.indexOf(insertMarker);
  if (insertIndex === -1) {
    console.error("❌ Không tìm thấy marker '};\\n\\n\\nconst ID_ALIASES'");
    process.exit(1);
  }
  const updatedContent =
    content.slice(0, insertIndex) +
    newEntriesCode +
    content.slice(insertIndex);
  fs.writeFileSync(dataPath, updatedContent, "utf-8");
  console.log(`\n🎉 Đã thêm ${added} build mới, bỏ qua ${skipped} build đã có!`);
} else {
  console.log(`\nℹ️ Không có build mới — tất cả ${skipped} nhân vật đã tồn tại.`);
}
