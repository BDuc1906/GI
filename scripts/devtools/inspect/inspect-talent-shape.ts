/**
 * scripts/inspect-talent-shape.ts
 *
 * CHỈ DÙNG 1 LẦN — kiểm tra chính xác genshin-db trả về field gì cho
 * talent/constellation (icon nằm ở field nào, thông số theo cấp có sẵn
 * dưới dạng gì) TRƯỚC khi viết code chính thức đọc các field đó.
 *
 * Lý do cần bước này: docs của genshin-db không liệt kê đầy đủ shape,
 * đoán sai tên field sẽ khiến code chạy "thành công" nhưng lưu null cho
 * MỌI nhân vật — lỗi âm thầm, khó phát hiện qua test thông thường.
 *
 * Chạy: npx tsx scripts/inspect-talent-shape.ts
 */
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

const rawTalents = genshindb.talents("Kaedehara Kazuha") as unknown as Record<string, unknown>;
console.log("===== RAW TALENTS (Kazuha) =====");
console.log(JSON.stringify(rawTalents, null, 2));

const rawConstellations = genshindb.constellations("Kaedehara Kazuha") as unknown as Record<string, unknown>;
console.log("\n===== RAW CONSTELLATIONS (Kazuha) =====");
console.log(JSON.stringify(rawConstellations, null, 2));