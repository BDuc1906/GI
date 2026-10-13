/**
 * scripts/lib/genshin-level-breakpoints.ts
 *
 * Breakpoint cấp độ dùng chung cho Character và Weapon. TRƯỚC ĐÂY logic
 * này bị copy-paste 3 chỗ:
 *   - scripts/seed/seed-characters.ts
 *   - scripts/fix/fix-weapon-stats-by-level.ts
 *   - scripts/debug/debug-weapon-stats.ts
 * Sửa 1 chỗ là 2 chỗ kia lệch âm thầm.
 *
 * QUY TẮC: 20/40/50/60/70/80 là mốc ĐỘT PHÁ (ascension). Tại mỗi mốc có
 * 2 biến thể: "-" (trước đột phá) và "+" (sau đột phá). Các cấp còn lại
 * chỉ có 1 biến thể (ascension = undefined).
 *
 * Đây là NGUỒN SỰ THẬT DUY NHẤT cho danh sách mốc cấp độ.
 */

export const ASCENSION_BREAKPOINT_LEVELS = new Set([20, 40, 50, 60, 70, 80]);

export type Ascension = "-" | "+" | undefined;
export type LevelBreakpoint = [number, Ascension];

function buildStatBreakpoints(): LevelBreakpoint[] {
  const points: LevelBreakpoint[] = [];
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

// Precomputed — tránh build lại mỗi lần gọi (fix-weapon-stats gọi cho mỗi
// weapon, build lại mảng 96 phần tử ~253 lần là lãng phí).
export const STAT_BREAKPOINTS: LevelBreakpoint[] = buildStatBreakpoints();