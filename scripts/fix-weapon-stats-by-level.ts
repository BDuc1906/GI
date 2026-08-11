/**
 * scripts/fix-weapon-stats-by-level.ts
 *
 * Backfill cột `Weapon.statsByLevel` (mới thêm — xem migration
 * 20260809150000_add_weapon_stats_by_level) cho các vũ khí đã seed từ
 * trước, KHÔNG cần chạy lại toàn bộ `npm run db:seed`. Tính từ
 * genshindb.weapons(name).stats(level, ascension) — dữ liệu THẬT theo
 * từng cấp/mốc đột phá, không nội suy. Cũng tiện sửa luôn `baseAtk` /
 * `subStatName` / `subStatValue` nếu vì lý do gì đó bị lệch so với
 * genshin-db hiện tại (tương tự cách fix-vision-weapon-data.ts làm với
 * Character).
 *
 * CHẠY THỬ TRƯỚC (mặc định, KHÔNG ghi DB):
 *   npx tsx --env-file=.env scripts/fix-weapon-stats-by-level.ts
 *
 * CHẠY THẬT (ghi DB):
 *   npx tsx --env-file=.env scripts/fix-weapon-stats-by-level.ts -- --apply
 */

import { createRequire } from "module";
import { assertEnv } from "../src/lib/env";
assertEnv();

import { prisma } from "../src/lib/prisma";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

const APPLY = process.argv.includes("--apply");

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

const STAT_BREAKPOINTS = buildStatBreakpoints();

type WeaponStatsFn = (level: number, ascension?: "-" | "+") => {
  level?: number;
  ascension?: number;
  attack?: number;
  specialized?: number;
} | null;

function getWeaponStatsByLevel(statsFn: unknown): unknown {
  if (typeof statsFn !== "function") return null;
  try {
    const fn = statsFn as WeaponStatsFn;
    const rows = STAT_BREAKPOINTS.map(([level, ascension]) => {
      const s = ascension ? fn(level, ascension) : fn(level);
      if (!s) return null;
      return {
        level: s.level ?? level,
        ascension: s.ascension ?? null,
        attack: s.attack ?? null,
        specialized: s.specialized ?? null,
      };
    }).filter((r): r is NonNullable<typeof r> => r !== null);
    return rows.length ? JSON.parse(JSON.stringify(rows)) : null;
  } catch {
    return null;
  }
}

async function main() {
  console.log(
    APPLY
      ? "🔧 Chạy THẬT — sẽ ghi statsByLevel vào DB.\n"
      : "🔍 Chạy THỬ (dry-run) — sẽ KHÔNG ghi DB. Thêm `-- --apply` để ghi thật.\n"
  );

  const weapons = await prisma.weapon.findMany({
    select: { id: true, name: true, statsByLevel: true },
  });

  let toFix = 0;
  let notFound = 0;
  const updates: Array<{ id: string; name: string; statsByLevel: unknown; rowCount: number }> = [];

  for (const w of weapons) {
    const raw = genshindb.weapons(w.name) as any;
    if (!raw || !raw.name) {
      notFound++;
      console.warn(`⚠️ "${w.name}" (${w.id}): không tìm thấy trong genshin-db theo tên — bỏ qua.`);
      continue;
    }

    const statsByLevel = getWeaponStatsByLevel(raw.stats);
    if (!statsByLevel) {
      console.warn(`⚠️ "${w.name}" (${w.id}): genshin-db không trả về .stats() dùng được — bỏ qua.`);
      continue;
    }

    // Đã có sẵn đủ dữ liệu (vd chạy script này 2 lần) -> bỏ qua để đỡ ghi
    // DB không cần thiết. So sánh thô qua độ dài mảng cho nhanh, không cần
    // deep-equal chính xác tuyệt đối.
    const existingCount = Array.isArray(w.statsByLevel) ? w.statsByLevel.length : 0;
    const newCount = Array.isArray(statsByLevel) ? statsByLevel.length : 0;
    if (existingCount === newCount && existingCount > 0) continue;

    toFix++;
    updates.push({ id: w.id, name: w.name, statsByLevel, rowCount: newCount });
  }

  console.log(`Tổng số vũ khí: ${weapons.length}`);
  console.log(`Cần backfill statsByLevel: ${toFix}`);
  if (notFound) console.log(`Không tìm thấy trong genshin-db: ${notFound}`);

  if (toFix === 0) return;

  for (const u of updates.slice(0, 10)) {
    console.log(`  - ${u.name} (${u.id}): ${u.rowCount} mốc cấp độ`);
  }
  if (updates.length > 10) console.log(`  ... và ${updates.length - 10} vũ khí khác.`);

  if (!APPLY) {
    console.log(`\n👉 Đây là dry-run. Chạy lại kèm "-- --apply" để ghi ${toFix} vũ khí trên vào DB thật.`);
    return;
  }

  console.log("\n💾 Đang ghi vào DB...");
  for (const u of updates) {
    await prisma.weapon.update({
      where: { id: u.id },
      data: { statsByLevel: u.statsByLevel as any },
    });
  }
  console.log(`✅ Đã backfill statsByLevel cho ${updates.length} vũ khí.`);
}

main()
  .catch((err) => {
    console.error("❌ Script thất bại:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
