/**
 * scripts/debug-weapon-stats.ts
 *
 * Dò 1 vũ khí cụ thể: in ra statsByLevel ĐANG LƯU trong DB (số dòng, các
 * mốc cấp có/thiếu), và tính lại trực tiếp từ genshin-db để so sánh — để
 * biết chính xác thiếu ở bước nào (tính toán hay ghi DB) thay vì đoán.
 *
 * CHẠY:
 *   npx tsx --env-file=.env scripts/debug-weapon-stats.ts "A Teaspoon of Transcendence"
 */

import { createRequire } from "module";
import { assertEnv } from "../src/lib/env";
assertEnv();

import { prisma } from "../src/lib/prisma";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

const weaponName = process.argv[2] || "A Teaspoon of Transcendence";

const ASCENSION_BREAKPOINT_LEVELS = new Set([20, 40, 50, 60, 70, 80]);

function buildStatBreakpoints(): Array<[number, "-" | "+" | undefined]> {
  const points: Array<[number, "-" | "+" | undefined]> = [];
  for (let level = 1; level <= 90; level++) {
    if (ASCENSION_BREAKPOINT_LEVELS.has(level)) {
      points.push([level, "-"]);
      points.push([level, "+"]);
    } else {
      points.push([level, undefined]);
    }
  }
  return points;
}

async function main() {
  console.log(`\n=== 1) DỮ LIỆU ĐANG LƯU TRONG DB ===`);
  const w = await prisma.weapon.findFirst({
    where: { name: { equals: weaponName, mode: "insensitive" } },
    select: { id: true, name: true, statsByLevel: true, baseAtk: true },
  });

  if (!w) {
    console.log(`❌ Không tìm thấy vũ khí tên "${weaponName}" trong DB.`);
  } else {
    console.log(`id: ${w.id}`);
    console.log(`baseAtk (cột cũ): ${w.baseAtk}`);
    const rows = Array.isArray(w.statsByLevel) ? (w.statsByLevel as any[]) : null;
    if (!rows) {
      console.log(`statsByLevel: NULL — chưa có dữ liệu gì cả.`);
    } else {
      console.log(`statsByLevel: ${rows.length} dòng.`);
      console.log(`Toàn bộ nội dung:`);
      console.log(JSON.stringify(rows, null, 2));
    }
  }

  console.log(`\n=== 2) TÍNH LẠI TRỰC TIẾP TỪ genshin-db (không qua DB) ===`);
  const raw = genshindb.weapons(weaponName) as any;
  if (!raw || !raw.name) {
    console.log(`❌ genshindb.weapons("${weaponName}") không trả về gì.`);
    return;
  }
  console.log(`Tên khớp trong genshin-db: "${raw.name}"`);
  console.log(`typeof raw.stats: ${typeof raw.stats}`);

  if (typeof raw.stats !== "function") {
    console.log(`❌ raw.stats không phải hàm — genshin-db bản này không hỗ trợ .stats() cho vũ khí.`);
    return;
  }

  const breakpoints = buildStatBreakpoints();
  let ok = 0;
  let failed: Array<{ level: number; ascension?: string; error: string }> = [];
  const rows: unknown[] = [];

  for (const [level, ascension] of breakpoints) {
    try {
      const s = ascension ? raw.stats(level, ascension) : raw.stats(level);
      if (!s) {
        failed.push({ level, ascension, error: "trả về null/undefined" });
        continue;
      }
      ok++;
      rows.push(s);
    } catch (err) {
      failed.push({ level, ascension, error: (err as Error).message });
    }
  }

  console.log(`Tính thành công: ${ok} / ${breakpoints.length} mốc.`);
  if (failed.length) {
    console.log(`❌ Thất bại ${failed.length} mốc, ví dụ 10 mốc đầu:`);
    for (const f of failed.slice(0, 10)) {
      console.log(`   - level=${f.level} ascension=${f.ascension ?? "(none)"}: ${f.error}`);
    }
  } else {
    console.log(`✔ Không mốc nào lỗi.`);
  }

  console.log(`\nMẫu 3 dòng đầu tính được:`);
  console.log(JSON.stringify(rows.slice(0, 3), null, 2));
  console.log(`\nPhiên bản genshin-db đang cài:`);
  console.log(require("genshin-db/package.json").version);
}

main()
  .catch((err) => {
    console.error("❌ Script thất bại:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
