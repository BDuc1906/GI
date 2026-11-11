/**
 * src/core/game/dps/calculator.ts
 *
 * Engine tính toán DPS, so sánh build và tối ưu trang bị.
 */

import {
  calculateAdditiveReactionBaseDamage,
  calculateAmplifyingReactionMultiplier,
  calculateDefenseMitigation,
  calculateResistanceMitigation,
  calculateTransformativeReactionBaseDamage,
} from "./formulas";
import type {
  CharacterStats,
  WeaponStats,
  ArtifactStats,
  TalentLevels,
  DamageModifiers,
  DPSCalculationResult,
  RotationConfig,
  TotalStatsInput,
  ShowdownResult,
} from "./types";

interface RotationDamageInput {
  characterLevel: number;
  totalATK: number;
  critRate: number;
  critDmg: number;
  em: number;
  damageBonus: number;
  talents: TalentLevels;
  modifiers: DamageModifiers;
  rotation: RotationConfig;
}

function calculateRotationDamage({
  characterLevel,
  totalATK,
  critRate,
  critDmg,
  em,
  damageBonus,
  talents,
  modifiers,
  rotation,
}: RotationDamageInput): DPSCalculationResult {
  const avgCritMultiplier =
    1 + Math.min(1, Math.max(0, critRate / 100)) * Math.max(0, critDmg / 100);
  const damageBonusMultiplier =
    1 + (damageBonus + modifiers.damageBonus + modifiers.vulnerability) / 100;
  const defenseMitigation = calculateDefenseMitigation(
    characterLevel,
    modifiers.enemyLevel ?? 90,
    modifiers.defenseReduction,
    modifiers.defenseIgnore ?? 0
  );
  const resistanceMitigation = calculateResistanceMitigation(modifiers.enemyRes);
  const commonDamageMultiplier =
    avgCritMultiplier * damageBonusMultiplier * defenseMitigation * resistanceMitigation;

  const normalAttackDamage = totalATK * talents.normalAttack * commonDamageMultiplier;
  const skillDamage = totalATK * talents.elementalSkill * commonDamageMultiplier;
  const burstDamage = totalATK * talents.elementalBurst * commonDamageMultiplier;
  const attackCount = rotation.normalAttacks + rotation.skillCasts + rotation.burstCasts;
  const reactionChance = Math.min(1, Math.max(0, rotation.reactionChance));
  const reaction = modifiers.reaction;
  let reactionDamage = 0;

  if (reaction === "Vaporize" || reaction === "Melt") {
    const multiplier = calculateAmplifyingReactionMultiplier(
      reaction,
      em,
      modifiers.reactionDirection ?? "forward",
      modifiers.reactionBonus ?? 0
    );
    const unmitigatedAttackDamage =
      totalATK *
      (talents.normalAttack * rotation.normalAttacks +
        talents.elementalSkill * rotation.skillCasts +
        talents.elementalBurst * rotation.burstCasts);
    reactionDamage =
      unmitigatedAttackDamage *
      (multiplier - 1) *
      reactionChance *
      commonDamageMultiplier;
  } else if (reaction === "Aggravate" || reaction === "Spread") {
    const additiveDamage = calculateAdditiveReactionBaseDamage(
      reaction,
      characterLevel,
      em,
      modifiers.reactionBonus ?? 0
    );
    reactionDamage =
      additiveDamage * reactionChance * attackCount * commonDamageMultiplier;
  } else if (reaction) {
    const transformativeDamage = calculateTransformativeReactionBaseDamage(
      reaction,
      characterLevel,
      em,
      modifiers.reactionBonus ?? 0
    );
    reactionDamage = transformativeDamage * reactionChance * attackCount * resistanceMitigation;
  }

  const totalRotationDamage =
    normalAttackDamage * rotation.normalAttacks +
    skillDamage * rotation.skillCasts +
    burstDamage * rotation.burstCasts +
    reactionDamage;
  const durationSeconds = Math.max(1, rotation.durationSeconds ?? 10);

  return {
    expectedDPS: Math.round(totalRotationDamage / durationSeconds),
    damageBreakdown: {
      normalAttack: Math.round(normalAttackDamage),
      skill: Math.round(skillDamage),
      burst: Math.round(burstDamage),
      reactions: Math.round(reactionDamage),
    },
    optimizationTips: [],
  };
}

export class DPSCalculator {
  /**
   * Calculate total HP from base stats + artifacts
   */
  calculateTotalHP(charStats: CharacterStats, artifacts: ArtifactStats): number {
    const hpPercent =
      1 +
      (artifacts.sandsMainStat === "HP%" ? artifacts.sandsValue / 100 : 0) +
      (artifacts.gobletMainStat === "HP%" ? artifacts.gobletValue / 100 : 0) +
      (artifacts.circletMainStat === "HP%" ? artifacts.circletValue / 100 : 0) +
      artifacts.subStats.hpPercent / 100;

    const flatHp =
      charStats.baseHp * hpPercent +
      artifacts.flowerHp +
      (charStats.ascensionStat === "HP%" ? charStats.ascensionStatValue : 0);

    return Math.floor(flatHp);
  }

  /**
   * Calculate total ATK from base stats + artifacts + weapon
   */
  calculateTotalATK(
    charStats: CharacterStats,
    weapon: WeaponStats,
    artifacts: ArtifactStats
  ): number {
    const atkPercent =
      1 +
      (artifacts.sandsMainStat === "ATK%" ? artifacts.sandsValue / 100 : 0) +
      (artifacts.gobletMainStat === "ATK%" ? artifacts.gobletValue / 100 : 0) +
      (artifacts.circletMainStat === "ATK%" ? artifacts.circletValue / 100 : 0) +
      artifacts.subStats.atkPercent / 100 +
      (weapon.subStat === "ATK%" ? weapon.subStatValue / 100 : 0) +
      (charStats.ascensionStat === "ATK%" ? charStats.ascensionStatValue / 100 : 0);

    const flatAtk = (charStats.baseAtk + weapon.baseAtk + artifacts.plumeAtk) * atkPercent;

    return Math.floor(flatAtk);
  }

  /**
   * Calculate Critical Value (CV)
   */
  calculateCV(artifacts: ArtifactStats): number {
    const critRate =
      artifacts.subStats.critRate +
      (artifacts.circletMainStat === "CRIT Rate%" ? artifacts.circletValue : 0) +
      (artifacts.sandsMainStat === "CRIT Rate%" ? artifacts.sandsValue : 0) +
      (artifacts.gobletMainStat === "CRIT Rate%" ? artifacts.gobletValue : 0);

    const critDmg =
      artifacts.subStats.critDmg +
      (artifacts.circletMainStat === "CRIT DMG%" ? artifacts.circletValue : 0) +
      (artifacts.sandsMainStat === "CRIT DMG%" ? artifacts.sandsValue : 0) +
      (artifacts.gobletMainStat === "CRIT DMG%" ? artifacts.gobletValue : 0);

    return 2 * critRate + critDmg;
  }

  /**
   * Calculate Elemental Mastery (EM)
   */
  calculateEM(artifacts: ArtifactStats): number {
    return (
      artifacts.subStats.em +
      (artifacts.sandsMainStat === "Elemental Mastery" ? artifacts.sandsValue : 0) +
      (artifacts.gobletMainStat === "Elemental Mastery" ? artifacts.gobletValue : 0) +
      (artifacts.circletMainStat === "Elemental Mastery" ? artifacts.circletValue : 0)
    );
  }

  /**
   * Calculate Energy Recharge (ER)
   */
  calculateER(artifacts: ArtifactStats): number {
    return (
      1 +
      artifacts.subStats.erPercent / 100 +
      (artifacts.sandsMainStat === "Energy Recharge%" ? artifacts.sandsValue / 100 : 0) +
      (artifacts.gobletMainStat === "Energy Recharge%" ? artifacts.gobletValue / 100 : 0) +
      (artifacts.circletMainStat === "Energy Recharge%" ? artifacts.circletValue / 100 : 0)
    );
  }

  /**
   * Calculate defense mitigation (delegates to formulas)
   */
  calculateDefenseMitigation(
    characterLevel: number,
    enemyLevel: number,
    defenseReductionPercent: number = 0,
    defenseIgnorePercent: number = 0
  ): number {
    return calculateDefenseMitigation(
      characterLevel,
      enemyLevel,
      defenseReductionPercent,
      defenseIgnorePercent
    );
  }

  /**
   * Calculate resistance mitigation (delegates to formulas)
   */
  calculateResistanceMitigation(resistance: number): number {
    return calculateResistanceMitigation(resistance);
  }

  /**
   * Calculate expected DPS for a character build
   */
  calculateExpectedDPS(
    charStats: CharacterStats,
    weapon: WeaponStats,
    artifacts: ArtifactStats,
    talents: TalentLevels,
    modifiers: DamageModifiers,
    rotation: RotationConfig
  ): DPSCalculationResult {
    const totalATK = this.calculateTotalATK(charStats, weapon, artifacts);
    const em =
      this.calculateEM(artifacts) +
      (weapon.subStat.toLowerCase().includes("elemental mastery") ? weapon.subStatValue : 0) +
      (charStats.ascensionStat.toLowerCase().includes("elemental mastery")
        ? charStats.ascensionStatValue
        : 0);
    const cv = this.calculateCV(artifacts);
    const er = this.calculateER(artifacts);
    const critRate =
      5 +
      artifacts.subStats.critRate +
      artifacts.circletValue * Number(artifacts.circletMainStat === "CRIT Rate%") +
      artifacts.sandsValue * Number(artifacts.sandsMainStat === "CRIT Rate%") +
      artifacts.gobletValue * Number(artifacts.gobletMainStat === "CRIT Rate%") +
      weapon.subStatValue * Number(weapon.subStat.toLowerCase().includes("crit rate")) +
      charStats.ascensionStatValue * Number(charStats.ascensionStat.toLowerCase().includes("crit rate"));
    const critDmg =
      50 +
      artifacts.subStats.critDmg +
      artifacts.circletValue * Number(artifacts.circletMainStat === "CRIT DMG%") +
      artifacts.sandsValue * Number(artifacts.sandsMainStat === "CRIT DMG%") +
      artifacts.gobletValue * Number(artifacts.gobletMainStat === "CRIT DMG%") +
      weapon.subStatValue * Number(weapon.subStat.toLowerCase().includes("crit dmg")) +
      charStats.ascensionStatValue * Number(charStats.ascensionStat.toLowerCase().includes("crit dmg"));
    const artifactDamageBonus =
      (artifacts.gobletMainStat.includes("DMG%") ? artifacts.gobletValue : 0) +
      (artifacts.sandsMainStat.includes("DMG%") ? artifacts.sandsValue : 0);

    const result = calculateRotationDamage({
      characterLevel: charStats.level,
      totalATK,
      critRate,
      critDmg,
      em,
      damageBonus: artifactDamageBonus,
      talents,
      modifiers,
      rotation,
    });

    return {
      ...result,
      optimizationTips: this.generateOptimizationTips(artifacts, em, cv, er),
    };
  }

  /**
   * Generate optimization tips based on current build
   */
  private generateOptimizationTips(
    artifacts: ArtifactStats,
    em: number,
    cv: number,
    er: number
  ): string[] {
    const tips: string[] = [];

    // CV analysis
    if (cv < 50) {
      tips.push("CV is below 50. Consider farming artifacts with better crit substats.");
    } else if (cv >= 70) {
      tips.push("Excellent CV! This build has strong critical stats.");
    }

    // EM analysis
    if (em < 100 && artifacts.sandsMainStat === "Elemental Mastery") {
      tips.push("EM build with low EM. Consider using different main stat or farm better substats.");
    } else if (em >= 200 && artifacts.sandsMainStat !== "Elemental Mastery") {
      tips.push("High EM without EM main stat. Consider swapping to EM sands for reaction builds.");
    }

    // ER analysis
    if (er < 1.2) {
      tips.push("Low ER may cause burst uptime issues. Consider using ER sands or getting more ER substats.");
    } else if (er > 2.0) {
      tips.push("Very high ER. You may be overcapping ER. Consider swapping to damage-focused stats.");
    }

    // Main stat optimization
    if (artifacts.gobletMainStat === "HP%" && artifacts.circletMainStat === "HP%") {
      tips.push("Double HP main stats. Consider using elemental DMG% goblet or crit circlet for damage dealers.");
    }

    // Substat distribution
    const valuableSubstats =
      artifacts.subStats.critRate +
      artifacts.subStats.critDmg +
      artifacts.subStats.atkPercent +
      artifacts.subStats.em;
    if (valuableSubstats < 15) {
      tips.push("Low valuable substat count. Consider farming artifacts with better substats.");
    }

    return tips;
  }

  /**
   * Calculate optimal ER requirement for a character
   */
  calculateOptimalER(burstCost: number, skillUsage: number): number {
    const particlesPerSecond = 3;
    const targetUptime = 0.9;
    const rotationTime = 10;

    const requiredER = (burstCost * (rotationTime / skillUsage)) / targetUptime / particlesPerSecond;

    return Math.ceil(requiredER / 0.01) / 100;
  }

  /**
   * Compare two builds and recommend the better one
   */
  compareBuilds(
    build1: { charStats: CharacterStats; weapon: WeaponStats; artifacts: ArtifactStats },
    build2: { charStats: CharacterStats; weapon: WeaponStats; artifacts: ArtifactStats },
    talents: TalentLevels,
    modifiers: DamageModifiers
  ): { winner: 1 | 2; improvement: number; reason: string } {
    const dps1 = this.calculateExpectedDPS(
      build1.charStats,
      build1.weapon,
      build1.artifacts,
      talents,
      modifiers,
      { normalAttacks: 10, skillCasts: 5, burstCasts: 2, reactionChance: 0.3 }
    );

    const dps2 = this.calculateExpectedDPS(
      build2.charStats,
      build2.weapon,
      build2.artifacts,
      talents,
      modifiers,
      { normalAttacks: 10, skillCasts: 5, burstCasts: 2, reactionChance: 0.3 }
    );

    if (dps1.expectedDPS > dps2.expectedDPS) {
      const improvement = ((dps1.expectedDPS - dps2.expectedDPS) / dps2.expectedDPS) * 100;
      return {
        winner: 1,
        improvement,
        reason: `Build 1 has ${dps1.expectedDPS.toFixed(0)} DPS vs ${dps2.expectedDPS.toFixed(0)} DPS (${improvement.toFixed(1)}% improvement)`,
      };
    } else {
      const improvement = ((dps2.expectedDPS - dps1.expectedDPS) / dps1.expectedDPS) * 100;
      return {
        winner: 2,
        improvement,
        reason: `Build 2 has ${dps2.expectedDPS.toFixed(0)} DPS vs ${dps1.expectedDPS.toFixed(0)} DPS (${improvement.toFixed(1)}% improvement)`,
      };
    }
  }

  /**
   * Tính DPS trực tiếp từ Bảng chỉ số tổng trong game (Stat Sheet Mode)
   * Không bắt người dùng phải tách nhỏ hoặc cộng nhẩm từng món Thánh Di Vật
   */
  calculateExpectedDPSFromTotalStats(
    characterLevel: number,
    totalStats: TotalStatsInput,
    talents: TalentLevels,
    modifiers: DamageModifiers,
    rotation: RotationConfig
  ): DPSCalculationResult {
    const totalATK = Math.max(0, totalStats.totalATK);
    const em = Math.max(0, totalStats.em);
    const result = calculateRotationDamage({
      characterLevel,
      totalATK,
      critRate: totalStats.critRate,
      critDmg: totalStats.critDmg,
      em,
      damageBonus: totalStats.damageBonus ?? 0,
      talents,
      modifiers,
      rotation,
    });

    const optimizationTips: string[] = [];
    const critRatio = totalStats.critRate > 0 ? totalStats.critDmg / totalStats.critRate : 0;
    if (critRatio > 2.5 && totalStats.critRate < 60) {
      optimizationTips.push(
        `Tỉ lệ bạo kích (${totalStats.critRate}%) đang hơi thấp so với sát thương bạo kích (${totalStats.critDmg}%). Hãy ưu tiên tăng Tỉ lệ bạo kích để sát thương ổn định hơn.`
      );
    } else if (critRatio < 1.5 && totalStats.critRate > 70) {
      optimizationTips.push(
        `Tỉ lệ bạo kích (${totalStats.critRate}%) đang khá cao. Bạn có thể chuyển bớt sang Sát thương bạo kích để tối đa hóa DPS.`
      );
    }

    if (
      em < 100 &&
      (modifiers.reaction === "Vaporize" ||
        modifiers.reaction === "Melt" ||
        modifiers.reaction === "Aggravate" ||
        modifiers.reaction === "Spread")
    ) {
      optimizationTips.push(
        `Đội hình dùng phản ứng ${modifiers.reaction} nhưng Tinh thông nguyên tố (EM = ${em}) khá thấp. Bổ sung khoảng 100-200 EM sẽ tăng vọt sát thương phản ứng.`
      );
    }

    return { ...result, optimizationTips };
  }

  /**
   * Tính toán so sánh Đối đầu giữa 2 Build (Gear & Build Showdown)
   */
  calculateShowdown(
    buildA: DPSCalculationResult,
    buildB: DPSCalculationResult,
    labelA = "Build A",
    labelB = "Build B"
  ): ShowdownResult {
    const dpsA = buildA.expectedDPS;
    const dpsB = buildB.expectedDPS;
    const dpsDiff = dpsA - dpsB;

    let winner: "A" | "B" | "TIE" = "TIE";
    let improvementPercent = 0;

    if (Math.abs(dpsDiff) < 5 || (dpsA === 0 && dpsB === 0)) {
      winner = "TIE";
      improvementPercent = 0;
    } else if (dpsA > dpsB) {
      winner = "A";
      improvementPercent = dpsB > 0 ? Math.round(((dpsA - dpsB) / dpsB) * 1000) / 10 : 100;
    } else {
      winner = "B";
      improvementPercent = dpsA > 0 ? Math.round(((dpsB - dpsA) / dpsA) * 1000) / 10 : 100;
    }

    const normalDiff = buildA.damageBreakdown.normalAttack - buildB.damageBreakdown.normalAttack;
    const skillDiff = buildA.damageBreakdown.skill - buildB.damageBreakdown.skill;
    const burstDiff = buildA.damageBreakdown.burst - buildB.damageBreakdown.burst;
    const reactionsDiff = buildA.damageBreakdown.reactions - buildB.damageBreakdown.reactions;

    const insights: string[] = [];

    let verdict = "";
    if (winner === "TIE") {
      verdict = `Cả hai phương án có mức sát thương kỳ vọng tương đương nhau (chênh lệch dưới 1%). Bạn có thể tự do lựa chọn phương án có hiệu quả nạp (ER) cao hơn hoặc thuận tiện hơn khi kích hoạt combo.`;
    } else if (winner === "A") {
      verdict = `${labelA} mang lại sát thương kỳ vọng cao hơn ${labelB} khoảng ${improvementPercent}% (+${dpsDiff.toLocaleString("vi-VN")} DPS mỗi chu kỳ).`;
      if (Math.abs(burstDiff) > 500) {
        insights.push(
          burstDiff > 0
            ? `Kỹ năng Nộ của ${labelA} nhỉnh hơn ${burstDiff.toLocaleString("vi-VN")} sát thương.`
            : `Kỹ năng Nộ của ${labelB} cao hơn ${Math.abs(burstDiff).toLocaleString("vi-VN")} sát thương, nhưng ${labelA} vẫn thắng nhờ tổng chu kỳ tối ưu hơn.`
        );
      }
      if (Math.abs(reactionsDiff) > 300) {
        insights.push(
          reactionsDiff > 0
            ? `Sát thương phản ứng của ${labelA} vượt trội hơn (+${reactionsDiff.toLocaleString("vi-VN")}).`
            : `Sát thương phản ứng của ${labelB} tốt hơn (+${Math.abs(reactionsDiff).toLocaleString("vi-VN")}).`
        );
      }
    } else {
      verdict = `${labelB} mang lại sát thương kỳ vọng cao hơn ${labelA} khoảng ${improvementPercent}% (+${Math.abs(dpsDiff).toLocaleString("vi-VN")} DPS mỗi chu kỳ).`;
      if (Math.abs(burstDiff) > 500) {
        insights.push(
          burstDiff < 0
            ? `Kỹ năng Nộ của ${labelB} nhỉnh hơn ${Math.abs(burstDiff).toLocaleString("vi-VN")} sát thương.`
            : `Kỹ năng Nộ của ${labelA} cao hơn ${burstDiff.toLocaleString("vi-VN")} sát thương, nhưng ${labelB} vẫn thắng nhờ tổng chu kỳ tối ưu hơn.`
        );
      }
      if (Math.abs(reactionsDiff) > 300) {
        insights.push(
          reactionsDiff < 0
            ? `Sát thương phản ứng của ${labelB} vượt trội hơn (+${Math.abs(reactionsDiff).toLocaleString("vi-VN")}).`
            : `Sát thương phản ứng của ${labelA} tốt hơn (+${reactionsDiff.toLocaleString("vi-VN")}).`
        );
      }
    }

    return {
      winner,
      improvementPercent,
      dpsDiff,
      buildA,
      buildB,
      differences: {
        normalAttackDiff: normalDiff,
        skillDiff,
        burstDiff,
        reactionsDiff,
      },
      verdict,
      insights,
    };
  }
}
