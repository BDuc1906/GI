/**
 * scripts/inspect-genshindb-all.ts
 *
 * Liệt kê TOÀN BỘ dữ liệu genshin-db đang có trong package đã cài (mọi
 * folder, không chỉ characters/weapons/artifacts/materials/domains như
 * pipeline hiện tại đang seed). Dump ra data/inspect/ để bạn tự xem field
 * nào có, field nào thiếu, và folder nào bạn CHƯA hề dùng tới.
 *
 * Chạy: npx tsx scripts/inspect-genshindb-all.ts
 */

import { createRequire } from "module";
import fs from "fs";
import path from "path";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as any;

const OUT_DIR = path.join(process.cwd(), "data", "inspect");
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Toàn bộ 19 folder query function theo README chính thức của genshin-db
// (github.com/theBowja/genshin-db). Nếu bản genshin-db bạn cài mới hơn có
// thêm folder mới, thêm tên vào đây.
const FOLDERS = [
  "achievementgroups",
  "achievements",
  "adventureranks",
  "animals",
  "artifacts",
  "characters",
  "constellations",
  "crafts",
  "domains",
  "elements",
  "enemies",
  "foods",
  "geographies",
  "materials",
  "namecards",
  "outfits",
  "rarity",
  "talents",
  "weapons",
  "windgliders",
];

// Các folder mà pipeline hiện tại (prisma/schema.prisma) ĐÃ có model
// tương ứng — chỉnh lại danh sách này nếu schema đổi.
const ALREADY_MODELED = new Set(["characters", "weapons", "artifacts", "materials", "domains"]);

interface FolderSummary {
  folder: string;
  alreadyModeled: boolean;
  functionExists: boolean;
  count: number | null;
  sampleName: string | null;
  sampleFields: string[];
  error: string | null;
}

const summaries: FolderSummary[] = [];

for (const folder of FOLDERS) {
  const fn = genshindb[folder];
  if (typeof fn !== "function") {
    summaries.push({
      folder,
      alreadyModeled: ALREADY_MODELED.has(folder),
      functionExists: false,
      count: null,
      sampleName: null,
      sampleFields: [],
      error: "genshindb." + folder + " không tồn tại trong bản package đã cài",
    });
    continue;
  }

  try {
    const names: string[] = fn("names", { matchCategories: true });
    const all: any[] = fn("names", { matchCategories: true, verboseCategories: true });

    // Ghi toàn bộ data thô của folder này ra 1 file JSON riêng để bạn
    // duyệt thủ công (đối chiếu với web thật xem thiếu field/giá trị nào).
    fs.writeFileSync(
      path.join(OUT_DIR, folder + ".json"),
      JSON.stringify(all, null, 2)
    );

    const sample = all?.[0];
    summaries.push({
      folder,
      alreadyModeled: ALREADY_MODELED.has(folder),
      functionExists: true,
      count: Array.isArray(names) ? names.length : null,
      sampleName: sample?.name ?? null,
      sampleFields: sample ? Object.keys(sample) : [],
      error: null,
    });
  } catch (err) {
    summaries.push({
      folder,
      alreadyModeled: ALREADY_MODELED.has(folder),
      functionExists: true,
      count: null,
      sampleName: null,
      sampleFields: [],
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

fs.writeFileSync(
  path.join(OUT_DIR, "_summary.json"),
  JSON.stringify(summaries, null, 2)
);

// In bảng tóm tắt ra console
console.log("\n=== TÓM TẮT DỮ LIỆU GENSHIN-DB ===\n");
console.log(
  "Folder".padEnd(20),
  "Đã có model?".padEnd(14),
  "Số lượng".padEnd(10),
  "Field mẫu"
);
console.log("-".repeat(100));
for (const s of summaries) {
  console.log(
    s.folder.padEnd(20),
    (s.alreadyModeled ? "✅ có" : "❌ CHƯA").padEnd(14),
    String(s.count ?? "lỗi").padEnd(10),
    s.error ? "LỖI: " + s.error : s.sampleFields.slice(0, 8).join(", ")
  );
}

const missing = summaries.filter((s) => !s.alreadyModeled && s.functionExists && !s.error);
console.log(
  `\n👉 ${missing.length} folder genshin-db ĐÃ CÓ dữ liệu nhưng web CHƯA dùng: ` +
    missing.map((s) => s.folder).join(", ")
);
console.log(`\n📁 Đã ghi chi tiết từng folder vào: ${OUT_DIR}/<folder>.json`);
console.log(`📄 Bảng tóm tắt: ${OUT_DIR}/_summary.json\n`);
