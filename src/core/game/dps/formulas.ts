/**
 * src/core/game/dps/formulas.ts
 *
 * Các công thức toán học tính toán sát thương chuẩn Genshin Impact:
 * 1. Reaction multipliers (Vaporize, Melt, Transformative, Additive)
 * 2. Defense mitigation (chính thức theo Level nhân vật vs quái + % DEF reduction / ignore)
 * 3. Resistance mitigation (âm, 0-75%, 75%+)
 */

import type { ReactionType, ReactionDirection } from "./types";

export const BASE_REACTION_COEFFICIENT: Record<string, number> = {
  Burning: 0.25,
  Swirl: 0.6,
  Superconduct: 1.5,
  "Electro-Charged": 2.0,
  Bloom: 2.0,
  Overload: 2.75,
  Burgeon: 3.0,
  Hyperbloom: 3.0,
  Shatter: 3.0,
};

/**
 * Tính hệ số sát thương phản ứng nguyên tố theo cấp độ và Tinh Thông Nguyên Tố (EM)
 */
export function calculateReactionMultiplier(
  reaction: ReactionType,
  em: number,
  level: number,
  direction: ReactionDirection = "forward"
): number {
  const levelBonus = 1 + (level / 9) * 2.78; // Level-based scaling

  switch (reaction) {
    case "Vaporize": {
      // Hydro on Pyro (forward): 2.0x, Pyro on Hydro (reverse): 1.5x
      // Thưởng Tinh Thông Nguyên Tố chính thức: 2.78 × EM / (EM + 1400)
      const emBonus = (2.78 * em) / (em + 1400);
      return (direction === "forward" ? 2.0 : 1.5) * (1 + emBonus) * levelBonus;
    }

    case "Melt": {
      // Pyro on Cryo (forward): 2.0x, Cryo on Pyro (reverse): 1.5x
      // Thưởng Tinh Thông Nguyên Tố chính thức: 2.78 × EM / (EM + 1400)
      const emBonus = (2.78 * em) / (em + 1400);
      return (direction === "forward" ? 2.0 : 1.5) * (1 + emBonus) * levelBonus;
    }

    case "Overload":
    case "Superconduct":
    case "Electro-Charged":
    case "Shatter":
    case "Burning":
    case "Bloom":
    case "Hyperbloom":
    case "Burgeon":
    case "Swirl": {
      // Hệ số chính thức (KQM Theorycrafting Library / Genshin Wiki):
      // Công thức: BaseCoefficient × LevelMultiplier × (1 + 16×EM/(EM+2000))
      const emBonus = (16 * em) / (em + 2000);
      return BASE_REACTION_COEFFICIENT[reaction] * (1 + emBonus) * levelBonus;
    }

    case "Quicken":
      // Quicken không gây sát thương trực tiếp, chỉ kích hoạt trạng thái Quickened
      return 1.0;

    case "Aggravate": {
      // Additive Reaction: ReactionMultiplier × LevelMultiplier × (1 + 5×EM/(1200+EM))
      // ReactionMultiplier(Aggravate) = 1.15
      const emBonusAggravate = (5 * em) / (1200 + em);
      return 1.15 * (1 + emBonusAggravate) * levelBonus;
    }

    case "Spread": {
      // Additive Reaction: ReactionMultiplier(Spread) = 1.25
      const emBonusSpread = (5 * em) / (1200 + em);
      return 1.25 * (1 + emBonusSpread) * levelBonus;
    }

    case "Crystallize":
    case "Frozen":
      return 1.0;

    default:
      return 1.0;
  }
}

/**
 * Tính giảm trừ phòng thủ của kẻ địch (DEF Mitigation).
 * Công thức chính thức (Genshin Wiki "DEF Multiplier"):
 *   DEF Multiplier = (CharLevel + 100) / [ (CharLevel + 100) + (EnemyLevel + 100) × (1-DefRed) × (1-DefIgnore) ]
 */
export function calculateDefenseMitigation(
  characterLevel: number,
  enemyLevel: number,
  defenseReductionPercent: number = 0,
  defenseIgnorePercent: number = 0
): number {
  const defReduction = Math.min(1, Math.max(0, defenseReductionPercent / 100));
  const defIgnore = Math.min(1, Math.max(0, defenseIgnorePercent / 100));
  const k = (1 - defReduction) * (1 - defIgnore);

  return (characterLevel + 100) / (characterLevel + 100 + (enemyLevel + 100) * k);
}

/**
 * Tính giảm trừ kháng nguyên tố (Resistance Mitigation)
 */
export function calculateResistanceMitigation(resistance: number): number {
  if (resistance < 0) {
    // Negative resistance amplifies damage
    return 1 - (resistance / 2);
  } else if (resistance < 0.75) {
    // 0-75% resistance: linear reduction
    return 1 - resistance;
  } else {
    // 75%+ resistance: heavy reduction
    return 1 / (1 + 4 * resistance);
  }
}
