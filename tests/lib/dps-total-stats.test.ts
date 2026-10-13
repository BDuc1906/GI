import { describe, expect, it } from "vitest";
import { DPSCalculator } from "@/core/game/dps-calculator";

const calc = new DPSCalculator();

describe("calculateExpectedDPSFromTotalStats — Chế độ Bảng chỉ số tổng trong game", () => {
  const talents = { normalAttack: 1.5, elementalSkill: 2.5, elementalBurst: 5.0 };
  const modifiers = { enemyRes: 10, defenseReduction: 0, damageBonus: 0, vulnerability: 0 };
  const rotation = { normalAttacks: 3, skillCasts: 1, burstCasts: 1, reactionChance: 0 };

  it("tính đúng DPS khi tăng ATK và CRIT", () => {
    const buildLow = calc.calculateExpectedDPSFromTotalStats(
      90,
      {
        totalATK: 1500,
        critRate: 50,
        critDmg: 100,
        em: 0,
        damageBonus: 0,
      },
      talents,
      modifiers,
      rotation
    );

    const buildHigh = calc.calculateExpectedDPSFromTotalStats(
      90,
      {
        totalATK: 2200,
        critRate: 70,
        critDmg: 160,
        em: 0,
        damageBonus: 46.6,
      },
      talents,
      modifiers,
      rotation
    );

    expect(buildHigh.expectedDPS).toBeGreaterThan(buildLow.expectedDPS);
    expect(buildHigh.damageBreakdown.normalAttack).toBeGreaterThan(buildLow.damageBreakdown.normalAttack);
    expect(buildHigh.damageBreakdown.burst).toBeGreaterThan(buildLow.damageBreakdown.burst);
  });

  it("tính chính xác phản ứng Vaporize với EM > 0", () => {
    const buildNoEM = calc.calculateExpectedDPSFromTotalStats(
      90,
      {
        totalATK: 2000,
        critRate: 60,
        critDmg: 120,
        em: 0,
      },
      talents,
      { ...modifiers, reaction: "Vaporize", reactionDirection: "forward" },
      { ...rotation, reactionChance: 1 }
    );

    const buildWithEM = calc.calculateExpectedDPSFromTotalStats(
      90,
      {
        totalATK: 2000,
        critRate: 60,
        critDmg: 120,
        em: 200,
      },
      talents,
      { ...modifiers, reaction: "Vaporize", reactionDirection: "forward" },
      { ...rotation, reactionChance: 1 }
    );

    expect(buildWithEM.damageBreakdown.reactions).toBeGreaterThan(buildNoEM.damageBreakdown.reactions);
  });
});
