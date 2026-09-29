import { describe, expect, it } from "vitest";
import { TeamBuilder, type Team, type Character } from "@/lib/game/team-builder";

const builder = new TeamBuilder();

function makeChar(overrides: Partial<Character> = {}): Character {
  return {
    id: "c1",
    name: "Test",
    vision: "Pyro",
    weaponType: "Sword",
    role: "main DPS",
    erRequirement: 100,
    burstCost: 60,
    skillCooldown: 6,
    ...overrides,
  };
}

describe("calculateElementalResonance — hiệu ứng cộng hưởng đã verify qua nhiều nguồn", () => {
  it("Electro Resonance đúng cơ chế thật (sinh hạt Electro), KHÔNG còn số bịa '-30% ER requirement'", () => {
    const team: Team = { characters: [makeChar({ vision: "Electro" }), makeChar({ vision: "Electro" })] };
    const [effect] = builder.calculateElementalResonance(team);
    expect(effect).toContain("Electro");
    expect(effect).not.toContain("-30%");
    expect(effect).not.toContain("Energy Recharge requirement");
  });

  it("Dendro Resonance là +50 EM CỐ ĐỊNH, không phải %", () => {
    const team: Team = { characters: [makeChar({ vision: "Dendro" }), makeChar({ vision: "Dendro" })] };
    const [effect] = builder.calculateElementalResonance(team);
    expect(effect).toContain("+50 Elemental Mastery");
    expect(effect).not.toContain("+30%");
  });

  it("Anemo Resonance có đủ 3 hiệu ứng thật (stamina/tốc chạy/skill CD), không chỉ 2 số sai như trước", () => {
    const team: Team = { characters: [makeChar({ vision: "Anemo" }), makeChar({ vision: "Anemo" })] };
    const [effect] = builder.calculateElementalResonance(team);
    expect(effect).toContain("movement SPD");
    expect(effect).toContain("-5% skill cooldown");
  });

  it("chỉ 1 nhân vật 1 nguyên tố -> không có resonance nào (cần >=2)", () => {
    const team: Team = { characters: [makeChar({ vision: "Pyro" }), makeChar({ vision: "Hydro" })] };
    expect(builder.calculateElementalResonance(team)).toEqual([]);
  });
});

describe("simulateReactions — Quicken không còn multiplier bịa", () => {
  it("Quicken trả multiplier=0 (không tự gây sát thương), không phải 1.15 (số của Aggravate bị gán nhầm)", () => {
    const team: Team = { characters: [makeChar({ vision: "Electro" }), makeChar({ vision: "Dendro" })] };
    const reactions = builder.simulateReactions(team);
    const quicken = reactions.find((r) => r.name === "Quicken");
    expect(quicken?.multiplier).toBe(0);
  });
});
