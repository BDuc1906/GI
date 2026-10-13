/**
 * src/core/game/dps/calculator.ts
 *
 * Engine tính toán DPS, so sánh build và tối ưu trang bị.
 */

import {
  calculateReactionMultiplier,
  calculateDefenseMitigation,
  calculateResistanceMitigation,
} from "./formulas";
import type {
  CharacterStats,
  WeaponStats,
  ArtifactStats,
  TalentLevels,
  DamageModifiers,
  DPSCalculationResult,
  ReactionType,
  ReactionDirection,
  RotationConfig,
  TotalStatsInput,
} from "./types";

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
   * Calculate reaction damage multiplier (delegates to formulas)
   */
  calculateReactionMultiplier(
    reaction: ReactionType,
    em: number,
    level: number,
    direction: ReactionDirection = "forward"
  ): number {
    return calculateReactionMultiplier(reaction, em, level, direction);
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
    const em = this.calculateEM(artifacts);
    const cv = this.calculateCV(artifacts);
    const er = this.calculateER(artifacts);

    // Baseline 5% CRIT Rate / 50% CRIT DMG mốc tối thiểu của mọi nhân vật
    const BASE_CRIT_RATE = 5; // %
    const BASE_CRIT_DMG = 50; // %
    const critRate = Math.min(
      1,
      (BASE_CRIT_RATE +
        artifacts.subStats.critRate +
        (artifacts.circletMainStat === "CRIT Rate%" ? artifacts.circletValue : 0)) /
        100
    );
    const critDmg =
      1 +
      (BASE_CRIT_DMG +
        artifacts.subStats.critDmg +
        (artifacts.circletMainStat === "CRIT DMG%" ? artifacts.circletValue : 0)) /
        100;

    const avgCritMultiplier = 1 - critRate + critRate * critDmg;

    // Calculate damage bonuses
    const dmgBonus =
      1 +
      modifiers.damageBonus / 100 +
      (artifacts.gobletMainStat.includes("DMG%") ? artifacts.gobletValue / 100 : 0) +
      (artifacts.sandsMainStat.includes("DMG%") ? artifacts.sandsValue / 100 : 0);

    // Calculate mitigation
    const defenseMitigation = this.calculateDefenseMitigation(
      charStats.level,
      modifiers.enemyLevel ?? 90,
      modifiers.defenseReduction,
      modifiers.defenseIgnore ?? 0
    );
    const resistanceMitigation = this.calculateResistanceMitigation(modifiers.enemyRes);

    // Calculate reaction multiplier
    const reactionMultiplier = this.calculateReactionMultiplier(
      modifiers.reaction ?? "Vaporize",
      em,
      charStats.level,
      modifiers.reactionDirection ?? "forward"
    );

    // Base damage formulas
    const normalAttackBase = totalATK * talents.normalAttack;
    const skillBase = totalATK * talents.elementalSkill;
    const burstBase = totalATK * talents.elementalBurst;

    // Apply multipliers
    const normalAttackDamage =
      normalAttackBase * avgCritMultiplier * dmgBonus * defenseMitigation * resistanceMitigation;

    const skillDamage =
      skillBase * avgCritMultiplier * dmgBonus * defenseMitigation * resistanceMitigation;

    const burstDamage =
      burstBase * avgCritMultiplier * dmgBonus * defenseMitigation * resistanceMitigation;

    // Reaction damage
    const reactionDamage = normalAttackDamage * reactionMultiplier * rotation.reactionChance;

    // Calculate DPS based on rotation (assumes 10-second rotation)
    const totalDamage =
      normalAttackDamage * rotation.normalAttacks +
      skillDamage * rotation.skillCasts +
      burstDamage * rotation.burstCasts +
      reactionDamage;

    const expectedDPS = Math.floor(totalDamage / 10);

    // Generate optimization tips
    const tips = this.generateOptimizationTips(artifacts, em, cv, er);

    return {
      expectedDPS,
      damageBreakdown: {
        normalAttack: normalAttackDamage,
        skill: skillDamage,
        burst: burstDamage,
        reactions: reactionDamage,
      },
      optimizationTips: tips,
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

    const critRate = Math.min(1, Math.max(0, totalStats.critRate / 100));
    const critDmg = 1 + Math.max(0, totalStats.critDmg / 100);
    const avgCritMultiplier = 1 - critRate + critRate * critDmg;

    const dmgBonus = 1 + (modifiers.damageBonus + (totalStats.damageBonus ?? 0)) / 100;

    const defenseMitigation = this.calculateDefenseMitigation(
      characterLevel,
      modifiers.enemyLevel ?? 90,
      modifiers.defenseReduction,
      modifiers.defenseIgnore ?? 0
    );
    const resistanceMitigation = this.calculateResistanceMitigation(modifiers.enemyRes);

    const reactionMultiplier = this.calculateReactionMultiplier(
      modifiers.reaction ?? "Vaporize",
      em,
      characterLevel,
      modifiers.reactionDirection ?? "forward"
    );

    const normalAttackBase = totalATK * talents.normalAttack;
    const skillBase = totalATK * talents.elementalSkill;
    const burstBase = totalATK * talents.elementalBurst;

    const normalAttackDamage =
      normalAttackBase * avgCritMultiplier * dmgBonus * defenseMitigation * resistanceMitigation;
    const skillDamage =
      skillBase * avgCritMultiplier * dmgBonus * defenseMitigation * resistanceMitigation;
    const burstDamage =
      burstBase * avgCritMultiplier * dmgBonus * defenseMitigation * resistanceMitigation;

    let reactionDamage = 0;
    if (modifiers.reaction && modifiers.reaction !== "Frozen" && modifiers.reaction !== "Crystallize") {
      const baseDamageForReaction = (skillDamage + burstDamage) / 2;
      reactionDamage =
        baseDamageForReaction * (reactionMultiplier - 1) * (rotation.reactionChance ?? 1);
    }

    const totalRotationDamage =
      normalAttackDamage * rotation.normalAttacks +
      skillDamage * rotation.skillCasts +
      burstDamage * rotation.burstCasts +
      reactionDamage;

    const rotationDuration = 10;
    const expectedDPS = Math.round(totalRotationDamage / rotationDuration);

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

    return {
      expectedDPS,
      damageBreakdown: {
        normalAttack: Math.round(normalAttackDamage),
        skill: Math.round(skillDamage),
        burst: Math.round(burstDamage),
        reactions: Math.round(reactionDamage),
      },
      optimizationTips,
    };
  }
}
