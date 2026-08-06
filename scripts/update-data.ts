
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, "data");

// Đảm bảo thư mục data tồn tại
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Lấy danh sách nhân vật từ genshin-db và tạo file mapping
 * Nếu nhân vật mới chưa có trong mapping, sẽ để trống để người dùng điền tay
 * (vì Fandom Wiki crawl có thể phức tạp, tôi tạo framework để bạn mở rộng)
 */
async function updateTalentBookMapping() {
  console.log("📚 Đang cập nhật talent-book-mapping.json...");

  // Lấy tất cả tên nhân vật từ genshin-db
  const names = genshindb.characters("names", { matchCategories: true }) as string[];
  const filteredNames = names.filter(
    (n) => !n.includes("Traveler") && n !== "Aether" && n !== "Lumine"
  );

  // Đọc file hiện có nếu tồn tại
  const mappingPath = path.join(DATA_DIR, "talent-book-mapping.json");
  let existingMapping: Record<string, string> = {};
  if (fs.existsSync(mappingPath)) {
    try {
      existingMapping = JSON.parse(fs.readFileSync(mappingPath, "utf-8"));
    } catch {
      console.warn("⚠️ File talent-book-mapping.json bị hỏng, tạo mới...");
    }
  }

  // Tìm nhân vật mới chưa có trong mapping
  const newCharacters = filteredNames.filter((name) => !existingMapping[name]);
  if (newCharacters.length > 0) {
    console.log(`🆕 Phát hiện ${newCharacters.length} nhân vật mới:`);
    newCharacters.forEach((name) => console.log(`   - ${name}`));
    console.log("\n⚠️ Vui lòng thêm mapping cho các nhân vật này vào file JSON.");
    console.log("   Mở: scripts/data/talent-book-mapping.json\n");
  }

  // Ghi lại file (giữ nguyên dữ liệu cũ + thêm nhân vật mới với giá trị rỗng)
  const updatedMapping = { ...existingMapping };
  newCharacters.forEach((name) => {
    if (!updatedMapping[name]) {
      updatedMapping[name] = ""; // Để trống, người dùng sẽ điền sau
    }
  });

  fs.writeFileSync(mappingPath, JSON.stringify(updatedMapping, null, 2));
  console.log(`✅ Đã cập nhật talent-book-mapping.json (${Object.keys(updatedMapping).length} nhân vật)`);

  // Thống kê nhân vật chưa có mapping
  const missing = Object.entries(updatedMapping)
    .filter(([, series]) => !series || series === "")
    .map(([name]) => name);

  if (missing.length > 0) {
    console.log(`\n⚠️ ${missing.length} nhân vật CHƯA có mapping (cần điền tay):`);
    missing.forEach((name) => console.log(`   - ${name}`));
  }
}

/**
 * Cập nhật image-overrides.json
 * Tự động thêm các nguyên liệu thiếu icon từ check-images
 */
async function updateImageOverrides() {
  console.log("\n🖼️ Đang cập nhật image-overrides.json...");

  const overridesPath = path.join(DATA_DIR, "image-overrides.json");
  let existingOverrides: Record<string, string> = {};
  if (fs.existsSync(overridesPath)) {
    try {
      existingOverrides = JSON.parse(fs.readFileSync(overridesPath, "utf-8"));
    } catch {
      console.warn("⚠️ File image-overrides.json bị hỏng, tạo mới...");
    }
  }

  // TODO: Tự động lấy danh sách nguyên liệu thiếu icon từ check-images.ts
  // Hiện tại giữ nguyên, bạn có thể mở rộng sau

  fs.writeFileSync(overridesPath, JSON.stringify(existingOverrides, null, 2));
  console.log(`✅ Đã cập nhật image-overrides.json (${Object.keys(existingOverrides).length} override)`);
}

/**
 * Ý TƯỞNG CHƯA TRIỂN KHAI: tự động crawl danh sách nhân vật dùng mỗi loại
 * sách kỹ năng (Freedom Book, Prosperity Book...) từ Fandom Wiki, thay vì
 * phải tự tay điền `scripts/data/talent-book-mapping.json` mỗi khi có
 * nhân vật mới.
 *
 * CHƯA làm vì cần 1 HTML parser thật (vd `cheerio`, hiện chưa có trong
 * package.json) và cần kiểm tra kỹ cấu trúc HTML thật của từng trang wiki
 * (dễ đổi format mà không báo trước) trước khi tin tưởng chạy tự động —
 * viết regex đoán mò không kiểm chứng được rất dễ âm thầm crawl sai dữ
 * liệu, còn tệ hơn giữ nguyên quy trình điền tay hiện tại. Nếu muốn triển
 * khai: 1) `npm i cheerio`, 2) fetch từng trang
 * `https://genshin-impact.fandom.com/wiki/<Tên_sách>`, 3) parse bảng danh
 * sách nhân vật, 4) đối chiếu thử với `talent-book-mapping.json` hiện có
 * trước khi ghi đè, để phát hiện ngay nếu parser sai.
 */

/**
 * Main
 */
async function main() {
  console.log("🔄 Đang cập nhật dữ liệu từ các nguồn...\n");

  await updateTalentBookMapping();
  await updateImageOverrides();

  console.log("\n✅ Cập nhật dữ liệu hoàn tất!");
  console.log("👉 Chạy 'npm run db:seed' để áp dụng dữ liệu mới.");
}

main().catch((err) => {
  console.error("❌ Lỗi khi cập nhật dữ liệu:", err);
  process.exit(1);
});
