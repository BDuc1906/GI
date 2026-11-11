import type { ReactionType, ReactionDirection } from "./types";

const TRANSFORMATIVE_REACTION_COEFFICIENT: Partial<Record<ReactionType, number>> = {
  Burning: 0.25,
  Swirl: 0.6,
  Superconduct: 1.5,
  "Electro-Charged": 2,
  Bloom: 2,
  Overload: 2.75,
  Burgeon: 3,
  Hyperbloom: 3,
  Shatter: 3,
};

// The game table includes its level-0 row at index 0, so a character's level is the array index.
const ELEMENTAL_LEVEL_MULTIPLIERS = [
  17.165606, 17.165606, 18.535048, 19.904854, 21.274902, 22.6454, 24.649612, 26.640642, 28.868587, 31.36768,
  34.143345, 37.201, 40.66, 44.446667, 48.56352, 53.74848, 59.081898, 64.420044, 69.72446, 75.12314,
  80.58478, 86.11203, 91.70374, 97.24463, 102.812645, 108.40956, 113.20169, 118.102905, 122.97932, 129.72733,
  136.29291, 142.67085, 149.02902, 155.41699, 161.8255, 169.10631, 176.51808, 184.07274, 191.70952, 199.55692,
  207.38205, 215.3989, 224.16566, 233.50217, 243.35057, 256.06308, 268.5435, 281.52606, 295.01364, 309.0672,
  323.6016, 336.75754, 350.5303, 364.4827, 378.61917, 398.6004, 416.39825, 434.387, 452.95105, 472.60623,
  492.8849, 513.56854, 539.1032, 565.51056, 592.53876, 624.4434, 651.47015, 679.4968, 707.79407, 736.67145,
  765.64026, 794.7734, 824.67737, 851.1578, 877.74207, 914.2291, 946.74677, 979.4114, 1011.223, 1044.7917,
  1077.4437, 1109.9976, 1142.9766, 1176.3695, 1210.1844, 1253.8357, 1288.9528, 1325.4841, 1363.4569, 1405.0974,
  1446.8535,
] as const;

export function getElementalLevelMultiplier(level: number): number {
  const index = Math.min(90, Math.max(1, Math.floor(level)));
  return ELEMENTAL_LEVEL_MULTIPLIERS[index];
}

export function calculateAmplifyingReactionMultiplier(
  reaction: "Vaporize" | "Melt",
  em: number,
  direction: ReactionDirection = "forward",
  reactionBonusPercent = 0
): number {
  const baseMultiplier = direction === "forward" ? 2 : 1.5;
  const emBonus = (2.78 * Math.max(0, em)) / (1400 + Math.max(0, em));
  return baseMultiplier * (1 + emBonus + reactionBonusPercent / 100);
}

export function calculateAdditiveReactionBaseDamage(
  reaction: "Aggravate" | "Spread",
  level: number,
  em: number,
  reactionBonusPercent = 0
): number {
  const reactionCoefficient = reaction === "Aggravate" ? 1.15 : 1.25;
  const elementalMastery = Math.max(0, em);
  const emBonus = (5 * elementalMastery) / (1200 + elementalMastery);
  return (
    reactionCoefficient *
    getElementalLevelMultiplier(level) *
    (1 + emBonus + reactionBonusPercent / 100)
  );
}

export function calculateTransformativeReactionBaseDamage(
  reaction: ReactionType,
  level: number,
  em: number,
  reactionBonusPercent = 0
): number {
  const coefficient = TRANSFORMATIVE_REACTION_COEFFICIENT[reaction] ?? 0;
  if (coefficient === 0) return 0;

  const elementalMastery = Math.max(0, em);
  const emBonus = (16 * elementalMastery) / (2000 + elementalMastery);
  return (
    coefficient *
    getElementalLevelMultiplier(level) *
    (1 + emBonus + reactionBonusPercent / 100)
  );
}

export function calculateDefenseMitigation(
  characterLevel: number,
  enemyLevel: number,
  defenseReductionPercent = 0,
  defenseIgnorePercent = 0
): number {
  const defReduction = Math.min(0.9, Math.max(0, defenseReductionPercent / 100));
  const defIgnore = Math.min(1, Math.max(0, defenseIgnorePercent / 100));
  const k = (1 - defReduction) * (1 - defIgnore);

  return (characterLevel + 100) / (characterLevel + 100 + (enemyLevel + 100) * k);
}

export function calculateResistanceMitigation(resistancePercent: number): number {
  const resistance = resistancePercent / 100;
  if (resistance < 0) return 1 - resistance / 2;
  if (resistance < 0.75) return 1 - resistance;
  return 1 / (1 + 4 * resistance);
}
