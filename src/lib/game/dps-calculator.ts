// src/lib/game/dps-calculator.ts
/**
 * Advanced Mathematical Reasoning cho DPS Calculations
 * 
 * Features:
 * 1. Precise DPS calculation formulas
 * 2. Elemental reaction damage multipliers
 * 3. Artifact stat optimization
 * 4. Talent level scaling
 * 5. Character-specific mechanics
 */

interface CharacterStats {
  level: number;
  baseHp: number;
  baseAtk: number;
  baseDef: number;
  ascensionStat: string;
  ascensionStatValue: number;
}

interface WeaponStats {
  level: number;
  baseAtk: number;
  subStat: string;
  subStatValue: number;
  refinement: number; // 1-5
}

interface ArtifactStats {
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

interface TalentLevels {
  normalAttack: number;
  elementalSkill: number;
  elementalBurst: number;
}

interface DamageModifiers {
  enemyRes: number;
  defenseReduction: number;
  damageBonus: number;
  vulnerability: number;
}

interface DPSCalculationResult {
  expectedDPS: number;
  damageBreakdown: {
    normalAttack: number;
    skill: number;
    burst: number;
    reactions: number;
  };
  optimizationTips: string[];
}

class DPSCalculator {
  /**
   * Calculate total HP from base stats + artifacts
   */
  calculateTotalHP(charStats: CharacterStats, artifacts: ArtifactStats): number {
    const hpPercent = 1 + (artifacts.sandsMainStat === "HP%" ? artifacts.sandsValue / 100 : 0) +
                      (artifacts.gobletMainStat === "HP%" ? artifacts.gobletValue / 100 : 0) +
                      (artifacts.circletMainStat === "HP%" ? artifacts.circletValue / 100 : 0) +
                      (artifacts.subStats.hpPercent / 100);
    
    const flatHp = charStats.baseHp * hpPercent + artifacts.flowerHp + 
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
    const atkPercent = 1 + (artifacts.sandsMainStat === "ATK%" ? artifacts.sandsValue / 100 : 0) +
                       (artifacts.gobletMainStat === "ATK%" ? artifacts.gobletValue / 100 : 0) +
                       (artifacts.circletMainStat === "ATK%" ? artifacts.circletValue / 100 : 0) +
                       (artifacts.subStats.atkPercent / 100) +
                       (weapon.subStat === "ATK%" ? weapon.subStatValue / 100 : 0) +
                       (charStats.ascensionStat === "ATK%" ? charStats.ascensionStatValue / 100 : 0);
    
    const flatAtk = (charStats.baseAtk + weapon.baseAtk + artifacts.plumeAtk) * atkPercent;
    
    return Math.floor(flatAtk);
  }
  
  /**
   * Calculate Critical Value (CV)
   */
  calculateCV(artifacts: ArtifactStats): number {
    const critRate = artifacts.subStats.critRate + 
                     (artifacts.circletMainStat === "CRIT Rate%" ? artifacts.circletValue : 0) +
                     (artifacts.sandsMainStat === "CRIT Rate%" ? artifacts.sandsValue : 0) +
                     (artifacts.gobletMainStat === "CRIT Rate%" ? artifacts.gobletValue : 0);
    
    const critDmg = artifacts.subStats.critDmg + 
                   (artifacts.circletMainStat === "CRIT DMG%" ? artifacts.circletValue : 0) +
                   (artifacts.sandsMainStat === "CRIT DMG%" ? artifacts.sandsValue : 0) +
                   (artifacts.gobletMainStat === "CRIT DMG%" ? artifacts.gobletValue : 0);
    
    return 2 * critRate + critDmg;
  }
  
  /**
   * Calculate Elemental Mastery (EM)
   */
  calculateEM(artifacts: ArtifactStats): number {
    const em = artifacts.subStats.em +
             (artifacts.sandsMainStat === "Elemental Mastery" ? artifacts.sandsValue : 0) +
             (artifacts.gobletMainStat === "Elemental Mastery" ? artifacts.gobletValue : 0) +
             (artifacts.circletMainStat === "Elemental Mastery" ? artifacts.circletValue : 0);
    
    return em;
  }
  
  /**
   * Calculate Energy Recharge (ER)
   */
  calculateER(artifacts: ArtifactStats): number {
    const er = 1 + (artifacts.subStats.erPercent / 100) +
             (artifacts.sandsMainStat === "Energy Recharge%" ? artifacts.sandsValue / 100 : 0) +
             (artifacts.gobletMainStat === "Energy Recharge%" ? artifacts.gobletValue / 0) +
             (artifacts.circletMainStat === "Energy Recharge%" ? artifacts.circletValue / 100 : 0);
    
    return er;
  }
  
  /**
   * Calculate reaction damage multiplier
   */
  calculateReactionMultiplier(
    reaction: string,
    em: number,
    level: number
  ): number {
    const levelBonus = 1 + (level / 9) * 2.78; // Level-based scaling
    
    switch (reaction) {
      case "Vaporize":
        // Hydro on Pyro: 2.0x, Pyro on Hydro: 1.5x
        return 2.0 * levelBonus;
      
      case "Melt":
        // Pyro on Cryo: 2.0x, Cryo on Pyro: 1.5x
        return 2.0 * levelBonus;
      
      case "Overload":
        // Transformative reaction with EM scaling
        const emBonusOverload = 16 * em / (em + 2000);
        return (1 + emBonusOverload) * levelBonus;
      
      case "Superconduct":
        // Transformative reaction with EM scaling
        const emBonusSuperconduct = 16 * em / (em + 2000);
        return (1 + emBonusSuperconduct) * levelBonus;
      
      case "Electro-Charged":
        // Transformative reaction with EM scaling
        const emBonusEC = 16 * em / (em + 2000);
        return (1 + emBonusEC) * levelBonus;
      
      case "Shatter":
        // Additional damage multiplier
        return 1.5 * levelBonus;
      
      case "Burning":
        // DoT reaction with EM scaling
        const emBonusBurning = 16 * em / (em + 2000);
        return (1 + emBonusBurning) * levelBonus;
      
      case "Bloom":
        // Base damage with EM scaling
        const emBonusBloom = 16 * em / (em + 2000);
        return (1 + emBonusBloom) * levelBonus;
      
      case "Hyperbloom":
        // High damage transformative reaction
        const emBonusHyperbloom = 16 * em / (em + 2000);
        return (1 + emBonusHyperbloom) * levelBonus * 3; // 3x base multiplier
      
      case "Burgeon":
        // AoE transformative reaction
        const emBonusBurgeon = 16 * em / (em + 2000);
        return (1 + emBonusBurgeon) * levelBonus * 2; // 2x base multiplier
      
      case "Quicken":
        // Base multiplier for Quicken aura
        return 1.15 * levelBonus;
      
      case "Aggravate":
        // Electro on Quicken: 1.5x damage boost
        return 1.5 * levelBonus;
      
      case "Spread":
        // Dendro on Quicken: 1.25x damage boost
        return 1.25 * levelBonus;
      
      case "Crystallize":
        // Shield reaction, no direct damage multiplier
        return 1.0;
      
      case "Frozen":
        // No direct damage multiplier
        return 1.0;
      
      default:
        return 1.0;
    }
  }
  
  /**
   * Calculate defense mitigation
   */
  calculateDefenseMitigation(defenderLevel: number, attackerLevel: number, defense: number): number {
    const levelDiff = defenderLevel - attackerLevel;
    const levelRatio = (defenderLevel + 100) / (attackerLevel + 100);
    
    const defenseMultiplier = defense / (defense + (defenderLevel + 100) * (1 + levelRatio * 0.5));
    
    return Math.max(0.1, 1 - defenseMultiplier); // Minimum 10% damage
  }
  
  /**
   * Calculate resistance mitigation
   */
  calculateResistanceMitigation(resistance: number): number {
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
  
  /**
   * Calculate expected DPS for a character build
   */
  calculateExpectedDPS(
    charStats: CharacterStats,
    weapon: WeaponStats,
    artifacts: ArtifactStats,
    talents: TalentLevels,
    modifiers: DamageModifiers,
    rotation: {
      normalAttacks: number;
      skillCasts: number;
      burstCasts: number;
      reactionChance: number;
    }
  ): DPSCalculationResult {
    const totalATK = this.calculateTotalATK(charStats, weapon, artifacts);
    const totalHP = this.calculateTotalHP(charStats, artifacts);
    const em = this.calculateEM(artifacts);
    const cv = this.calculateCV(artifacts);
    const er = this.calculateER(artifacts);
    
    // Calculate critical hit rate and damage
    const critRate = Math.min(1, (artifacts.subStats.critRate + 
                   (artifacts.circletMainStat === "CRIT Rate%" ? artifacts.circletValue : 0)) / 100);
    const critDmg = 1 + (artifacts.subStats.critDmg + 
                  (artifacts.circletMainStat === "CRIT DMG%" ? artifacts.circletValue : 0)) / 100;
    
    const avgCritMultiplier = 1 - critRate + critRate * critDmg;
    
    // Calculate damage bonuses
    const dmgBonus = 1 + (modifiers.damageBonus / 100) +
                      (artifacts.gobletMainStat.includes("DMG%") ? artifacts.gobletValue / 100 : 0) +
                      (artifacts.sandsMainStat.includes("DMG%") ? artifacts.sandsValue / 100 : 0);
    
    // Calculate elemental damage bonus if applicable
    const elementalDmgBonus = 1 + (artifacts.gobletMainStat.includes("Elemental DMG%") ? 
                                    artifacts.gobletValue / 100 : 0);
    
    // Calculate mitigation
    const defenseMitigation = this.calculateDefenseMitigation(90, charStats.level, 0); // Assuming enemy level 90
    const resistanceMitigation = this.calculateResistanceMitigation(modifiers.enemyRes);
    
    // Calculate reaction multiplier
    const reactionMultiplier = this.calculateReactionMultiplier(
      "Vaporize", // Default reaction, should be parameterized
      em,
      charStats.level
    );
    
    // Base damage formulas (simplified)
    const normalAttackBase = totalATK * talents.normalAttack;
    const skillBase = totalATK * talents.elementalSkill;
    const burstBase = totalATK * talents.elementalBurst;
    
    // Apply multipliers
    const normalAttackDamage = normalAttackBase * avgCritMultiplier * dmgBonus * 
                              defenseMitigation * resistanceMitigation;
    
    const skillDamage = skillBase * avgCritMultiplier * dmgBonus * 
                       defenseMitigation * resistanceMitigation;
    
    const burstDamage = burstBase * avgCritMultiplier * dmgBonus * 
                       defenseMitigation * resistanceMitigation;
    
    // Reaction damage
    const reactionDamage = normalAttackDamage * reactionMultiplier * rotation.reactionChance;
    
    // Calculate DPS based on rotation
    const totalDamage = 
      (normalAttackDamage * rotation.normalAttacks) +
      (skillDamage * rotation.skillCasts) +
      (burstDamage * rotation.burstCasts) +
      reactionDamage;
    
    const expectedDPS = Math.floor(totalDamage / 10); // Assuming 10-second rotation
    
    // Generate optimization tips
    const tips = this.generateOptimizationTips(artifacts, em, cv, er);
    
    return {
      expectedDPS,
      damageBreakdown: {
        normalAttack: normalAttackDamage,
        skill: skillDamage,
        burst: burstDamage,
        reactions: reactionDamage
      },
      optimizationTips: tips
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
    const valuableSubstats = artifacts.subStats.critRate + artifacts.subStats.critDmg + 
                              artifacts.subStats.atkPercent + artifacts.subStats.em;
    if (valuableSubstats < 15) {
      tips.push("Low valuable substat count. Consider farming artifacts with better substats.");
    }
    
    return tips;
  }
  
  /**
   * Calculate optimal ER requirement for a character
   */
  calculateOptimalER(burstCost: number, skillUsage: number): number {
    // Basic formula: ER needed to burst every rotation
    // This is a simplified calculation
    const particlesPerSecond = 3; // Average particle generation
    const energyRegen = 0.167; // Base energy regen per second
    
    const targetUptime = 0.9; // 90% burst uptime target
    const rotationTime = 10; // 10-second rotation
    
    const requiredER = (burstCost * (rotationTime / skillUsage) / targetUptime) / particlesPerSecond;
    
    return Math.ceil(requiredER / 0.01) / 100; // Convert to percentage
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
      build1.charStats, build1.weapon, build1.artifacts, talents, modifiers,
      { normalAttacks: 10, skillCasts: 5, burstCasts: 2, reactionChance: 0.3 }
    );
    
    const dps2 = this.calculateExpectedDPS(
      build2.charStats, build2.weapon, build2.artifacts, talents, modifiers,
      { normalAttacks: 10, skillCasts: 5, burstCasts: 2, reactionChance: 0.3 }
    );
    
    if (dps1.expectedDPS > dps2.expectedDPS) {
      const improvement = ((dps1.expectedDPS - dps2.expectedDPS) / dps2.expectedDPS) * 100;
      return {
        winner: 1,
        improvement,
        reason: `Build 1 has ${dps1.expectedDPS.toFixed(0)} DPS vs ${dps2.expectedDPS.toFixed(0)} DPS (${improvement.toFixed(1)}% improvement)`
      };
    } else {
      const improvement = ((dps2.expectedDPS - dps1.expectedDPS) / dps1.expectedDPS) * 100;
      return {
        winner: 2,
        improvement,
        reason: `Build 2 has ${dps2.expectedDPS.toFixed(0)} DPS vs ${dps1.expectedDPS.toFixed(0)} DPS (${improvement.toFixed(1)}% improvement)`
      };
    }
  }
}

export { DPSCalculator, type CharacterStats, type WeaponStats, type ArtifactStats, type TalentLevels, type DamageModifiers, type DPSCalculationResult };