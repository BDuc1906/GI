import { describe, expect, it } from "vitest";
import {
  calculateAdditiveReactionBaseDamage,
  calculateAmplifyingReactionMultiplier,
  calculateDefenseMitigation,
  calculateResistanceMitigation,
  calculateTransformativeReactionBaseDamage,
  getElementalLevelMultiplier,
} from "@/core/game/dps/formulas";
import { DPSCalculator } from "@/core/game/dps-calculator";

describe("Genshin reaction damage formulas", () => {
  it("uses the in-game elemental level multiplier at levels 1 and 90", () => {
    expect(getElementalLevelMultiplier(1)).toBeCloseTo(17.165606, 6);
    expect(getElementalLevelMultiplier(90)).toBeCloseTo(1446.8535, 4);
    expect(getElementalLevelMultiplier(0)).toBe(getElementalLevelMultiplier(1));
    expect(getElementalLevelMultiplier(91)).toBe(getElementalLevelMultiplier(90));
  });

  it("applies forward and reverse amplifying reactions without a character-level multiplier", () => {
    const forward = calculateAmplifyingReactionMultiplier("Vaporize", 0, "forward");
    const reverse = calculateAmplifyingReactionMultiplier("Vaporize", 0, "reverse");

    expect(forward).toBe(2);
    expect(reverse).toBe(1.5);
    expect(forward / reverse).toBeCloseTo(2 / 1.5, 8);
    expect(calculateAmplifyingReactionMultiplier("Melt", 0, "forward")).toBe(2);
  });

  it("applies the published EM scaling to amplifying reactions", () => {
    const em = 200;
    const expected = 2 * (1 + (2.78 * em) / (1400 + em));
    expect(calculateAmplifyingReactionMultiplier("Vaporize", em)).toBeCloseTo(expected, 8);
    expect(calculateAmplifyingReactionMultiplier("Vaporize", em, "forward", 15)).toBeCloseTo(
      expected + 0.3,
      8
    );
  });

  it("calculates additive reaction damage as a flat base-damage addition", () => {
    const levelMultiplier = getElementalLevelMultiplier(90);
    expect(calculateAdditiveReactionBaseDamage("Aggravate", 90, 0)).toBeCloseTo(
      1.15 * levelMultiplier,
      5
    );
    expect(calculateAdditiveReactionBaseDamage("Spread", 90, 0)).toBeCloseTo(
      1.25 * levelMultiplier,
      5
    );
    expect(calculateAdditiveReactionBaseDamage("Aggravate", 90, 500)).toBeGreaterThan(
      calculateAdditiveReactionBaseDamage("Aggravate", 90, 0)
    );
  });

  it("calculates transformative reactions from their base coefficient, level, and EM", () => {
    expect(calculateTransformativeReactionBaseDamage("Overload", 90, 0)).toBeCloseTo(
      2.75 * getElementalLevelMultiplier(90),
      5
    );
    expect(calculateTransformativeReactionBaseDamage("Hyperbloom", 90, 500)).toBeCloseTo(
      3 * getElementalLevelMultiplier(90) * (1 + (16 * 500) / 2500),
      5
    );
    expect(calculateTransformativeReactionBaseDamage("Frozen", 90, 1000)).toBe(0);
  });
});

describe("enemy mitigation formulas", () => {
  it("uses percentage units for enemy resistance and handles negative/high resistance", () => {
    expect(calculateResistanceMitigation(10)).toBeCloseTo(0.9, 8);
    expect(calculateResistanceMitigation(-20)).toBeCloseTo(1.1, 8);
    expect(calculateResistanceMitigation(75)).toBeCloseTo(0.25, 8);
    expect(calculateResistanceMitigation(100)).toBeCloseTo(0.2, 8);
  });

  it("caps defense reduction at 90% and applies defense ignore separately", () => {
    expect(calculateDefenseMitigation(90, 90)).toBeCloseTo(0.5, 8);
    expect(calculateDefenseMitigation(90, 90, 100)).toBeCloseTo(
      calculateDefenseMitigation(90, 90, 90),
      8
    );
    expect(calculateDefenseMitigation(90, 90, 0, 100)).toBeCloseTo(1, 8);
  });
});

describe("DPS calculation reaction integration", () => {
  const calculator = new DPSCalculator();
  const talents = { normalAttack: 1, elementalSkill: 0, elementalBurst: 0 };
  const rotation = { normalAttacks: 1, skillCasts: 0, burstCasts: 0, reactionChance: 0.5 };

  it("applies the enemy's 10% resistance to direct and amplifying damage", () => {
    const result = calculator.calculateExpectedDPSFromTotalStats(
      90,
      { totalATK: 2000, critRate: 60, critDmg: 120, em: 0, damageBonus: 0 },
      talents,
      {
        enemyRes: 10,
        defenseReduction: 0,
        damageBonus: 0,
        vulnerability: 0,
        reaction: "Vaporize",
        reactionDirection: "forward",
      },
      rotation
    );

    expect(result.damageBreakdown.normalAttack).toBe(1548);
    expect(result.damageBreakdown.reactions).toBe(774);
    expect(result.expectedDPS).toBe(232);
  });

  it("divides rotation damage by the user-selected duration", () => {
    const result = calculator.calculateExpectedDPSFromTotalStats(
      90,
      { totalATK: 2000, critRate: 60, critDmg: 120, em: 0, damageBonus: 0 },
      talents,
      {
        enemyRes: 10,
        defenseReduction: 0,
        damageBonus: 0,
        vulnerability: 0,
        reaction: "Vaporize",
        reactionDirection: "forward",
      },
      { ...rotation, durationSeconds: 20 }
    );

    expect(result.expectedDPS).toBe(116);
  });

  it("does not apply CRIT, defense, or damage bonuses to transformative reaction damage", () => {
    const result = calculator.calculateExpectedDPSFromTotalStats(
      90,
      { totalATK: 0, critRate: 100, critDmg: 400, em: 0, damageBonus: 200 },
      { normalAttack: 0, elementalSkill: 0, elementalBurst: 0 },
      {
        enemyRes: 0,
        defenseReduction: 0,
        damageBonus: 0,
        vulnerability: 0,
        reaction: "Overload",
      },
      { normalAttacks: 1, skillCasts: 0, burstCasts: 0, reactionChance: 1 }
    );

    expect(result.damageBreakdown.reactions).toBe(
      Math.round(2.75 * getElementalLevelMultiplier(90))
    );
  });
});
