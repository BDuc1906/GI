/**
 * scripts/pipeline/crawl-extra-data.ts
 *
 * Crawl 15 folder genshin-db CHƯA có model trước đây (xem
 * data/inspect/_summary.json). Ghi mỗi folder ra data/raw/<folder>.json
 * — cùng thư mục, cùng cơ chế review-qua-PR như characters/weapons/...
 * mà update-data.yml đã dùng (xem data/raw/ diff -> tạo PR).
 *
 * Chạy: npx tsx scripts/pipeline/crawl-extra-data.ts
 * (đã được gọi tự động bởi `npm run data:crawl` — xem package.json)
 */

import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as any;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_RAW_DIR = path.join(__dirname, "../../data/raw");

if (!fs.existsSync(DATA_RAW_DIR)) {
  fs.mkdirSync(DATA_RAW_DIR, { recursive: true });
}

// folder genshin-db -> tên file JSON output (khớp với EXTRA_FOLDERS trong
// scripts/seed-extra.ts, ĐỪNG đổi tên riêng lẻ ở 1 trong 2 file).
const EXTRA_FOLDERS = [
  "achievementgroups",
  "achievements",
  "adventureranks",
  "animals",
  "constellations",
  "crafts",
  "elements",
  "enemies",
  "foods",
  "geographies",
  "namecards",
  "outfits",
  "rarity",
  "talents",
  "windgliders",
] as const;

function crawlFolder(folder: string): { count: number; error: string | null } {
  const fn = genshindb[folder];
  if (typeof fn !== "function") {
    return { count: 0, error: `genshindb.${folder} không tồn tại trong bản package đã cài` };
  }

  try {
    const all: any[] = fn("names", { matchCategories: true, verboseCategories: true }) ?? [];
    fs.writeFileSync(
      path.join(DATA_RAW_DIR, `${folder}.json`),
      JSON.stringify(all, null, 2)
    );
    return { count: all.length, error: null };
  } catch (err) {
    return { count: 0, error: err instanceof Error ? err.message : String(err) };
  }
}

function main() {
  console.log("🔄 Đang crawl 15 folder genshin-db bổ sung...\n");

  let totalOk = 0;
  let totalFail = 0;

  for (const folder of EXTRA_FOLDERS) {
    const { count, error } = crawlFolder(folder);
    if (error) {
      console.error(`❌ ${folder}: ${error}`);
      totalFail++;
    } else {
      console.log(`✅ ${folder}: ${count} bản ghi -> data/raw/${folder}.json`);
      totalOk++;
    }
  }

  console.log(`\n=== Xong: ${totalOk} folder OK, ${totalFail} folder lỗi ===`);

  if (totalFail > 0) {
    process.exit(1);
  }
}

main();
