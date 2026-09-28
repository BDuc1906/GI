import { describe, expect, it } from "vitest";
import { DPSCalculator } from "@/lib/game/dps-calculator";

const calc = new DPSCalculator();

const baseCharStats = {
  level: 90,
  baseHp: 12000,
  baseAtk: 300,
  baseDef: 700,
  ascensionStat: "ATK%",
  ascensionStatValue: 0,
};
const baseWeaponStats = { level: 90, baseAtk: 500, subStat: "ATK%", subStatValue: 40, refinement: 1 };
const baseModifiers = { enemyRes: 10, defenseReduction: 0, damageBonus: 0, vulnerability: 0 };
const baseRotation = { normalAttacks: 3, skillCasts: 1, burstCasts: 1, reactionChance: 0 };
const baseTalents = { normalAttack: 1.5, elementalSkill: 2.0, elementalBurst: 3.0 };

function artifactsWith(critDmgSubstat: number) {
  return {
    flowerHp: 4780,
    plumeAtk: 311,
    sandsMainStat: "ATK%",
    sandsValue: 46.6,
    gobletMainStat: "ATK%",
    gobletValue: 46.6,
    // Circlet KHÔNG phải CRIT Rate%/CRIT DMG% -> critRate/critDmg CHỈ còn
    // đúng baseline 5%/50% + substat (không có bonus circlet).
    circletMainStat: "ATK%",
    circletValue: 46.6,
    subStats: { critRate: 0, critDmg: critDmgSubstat, atkPercent: 0, hpPercent: 0, defPercent: 0, em: 0, erPercent: 0 },
  };
}

describe("calculateExpectedDPS — baseline CRIT Rate 5% / CRIT DMG 50% (mọi nhân vật đều có sẵn)", () => {
  it("critRate substat = 0 vẫn phải có crit xảy ra (nhờ baseline 5%) — tăng critDmg substat vẫn làm DPS tăng dù critRate substat = 0", () => {
    // Nếu baseline 5% CR KHÔNG được cộng (bug cũ), critRate = 0% tuyệt đối
    // -> crit KHÔNG BAO GIỜ xảy ra -> tăng CRIT DMG substat sẽ KHÔNG ảnh
    // hưởng gì tới DPS (vì tỉ lệ crit thật vẫn = 0, critDmg nhân bao
    // nhiêu cũng vô nghĩa). Có baseline 5% -> critDmg cao hơn PHẢI làm
    // DPS tăng, dù rất ít, vì 5% số đòn vẫn crit.
    const low = calc.calculateExpectedDPS(
      baseCharStats,
      baseWeaponStats,
      artifactsWith(0),
      baseTalents,
      baseModifiers,
      baseRotation
    );
    const high = calc.calculateExpectedDPS(
      baseCharStats,
      baseWeaponStats,
      artifactsWith(200), // +200% CRIT DMG substat
      baseTalents,
      baseModifiers,
      baseRotation
    );
    expect(high.expectedDPS).toBeGreaterThan(low.expectedDPS);
  });
});
