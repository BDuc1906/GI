/**
 * src/core/game/dps/types.ts
 *
 * Kiểu dữ liệu phục vụ tính toán sát thương (DPS Calculation)
 */

export interface CharacterStats {
  level: number;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  ascensionStat: string;
  ascensionStatValue: number;
}

export interface WeaponStats {
  level: number;
  baseAtk: number;
  subStat: string;
  subStatValue: number;
  refinement: number; // 1-5
}

export interface ArtifactStats {
  flowerHp: number;
  plumeAtk: number;
  sandsMainStat: string;
  sandsValue: number;
  gobletMainStat: string;
  gobletValue: number;
  circletMainStat: string;
  circletValue: number;
  subStats: {
    critRate: number;
    critDmg: number;
    atkPercent: number;
    hpPercent: number;
    defPercent: number;
    em: number;
    erPercent: number;
  };
}

export interface TalentLevels {
  normalAttack: number;
  elementalSkill: number;
  elementalBurst: number;
}

export type ReactionType =
  | "Vaporize"
  | "Melt"
  | "Overload"
  | "Superconduct"
  | "Electro-Charged"
  | "Shatter"
  | "Burning"
  | "Bloom"
  | "Hyperbloom"
  | "Burgeon"
  | "Swirl"
  | "Quicken"
  | "Aggravate"
  | "Spread"
  | "Crystallize"
  | "Frozen";

export type ReactionDirection = "forward" | "reverse";

export interface DamageModifiers {
  enemyRes: number;
  /** % giảm DEF địch (0-100), vd Zhongli/Xiangling giảm 20% -> truyền 20. */
  defenseReduction: number;
  /**
   * % bỏ qua DEF địch hoàn toàn cho đòn đánh này (0-100) — khác cơ chế
   * với defenseReduction (giảm CHỈ SỐ DEF thật).
   */
  defenseIgnore?: number;
  /**
   * Level của kẻ địch — Mặc định 90 (La Hoàn Thâm Cảnh tầng 12).
   */
  enemyLevel?: number;
  damageBonus: number;
  vulnerability: number;
  /** Phản ứng nguyên tố áp dụng cho combo đang tính (mặc định "Vaporize"). */
  reaction?: ReactionType;
  /** Chiều phản ứng ("forward" = 2.0x, "reverse" = 1.5x cho Vaporize/Melt). */
  reactionDirection?: ReactionDirection;
}

export interface DPSCalculationResult {
  expectedDPS: number;
  damageBreakdown: {
    normalAttack: number;
    skill: number;
    burst: number;
    reactions: number;
  };
  optimizationTips: string[];
}

export interface RotationConfig {
  normalAttacks: number;
  skillCasts: number;
  burstCasts: number;
  reactionChance: number;
}

/** Chế độ nhập trực tiếp Bảng chỉ số tổng trong game */
export interface TotalStatsInput {
  totalATK: number;
  totalHP?: number;
  totalDEF?: number;
  critRate: number; // % (0-100)
  critDmg: number; // % (0-400)
  em: number; // Tinh thông nguyên tố (0-2000)
  er?: number; // Hiệu quả nạp %
  damageBonus?: number; // Tăng sát thương nguyên tố %
}
