import { describe, expect, it } from "vitest";
import { TeamBuilder, type Team, type Character } from "@/core/game/team-builder";

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

describe("calculateElementalResonance — hợp nhất với element-reactions-data.ts (nguồn sự thật duy nhất, đã verify)", () => {
  it("Electro Resonance đúng cơ chế thật (sinh hạt Electro), KHÔNG còn số bịa '-30% ER requirement'", () => {
    const team: Team = { characters: [makeChar({ vision: "Electro" }), makeChar({ vision: "Electro" })] };
    const [effect] = builder.calculateElementalResonance(team);
    expect(effect).toContain("Điện Áp Cao"); // nameVi thật trong element-reactions-data.ts
    expect(effect).not.toContain("-30%");
    expect(effect).not.toContain("Energy Recharge requirement");
  });

  it("Dendro Resonance là +50 EM CỐ ĐỊNH, không phải %", () => {
    const team: Team = { characters: [makeChar({ vision: "Dendro" }), makeChar({ vision: "Dendro" })] };
    const [effect] = builder.calculateElementalResonance(team);
    expect(effect).toContain("50 Tinh Thông Nguyên Tố");
    expect(effect).not.toContain("30%");
  });

  it("Anemo Resonance có đủ 3 hiệu ứng thật (stamina/tốc chạy/skill CD), không chỉ 2 số sai như trước", () => {
    const team: Team = { characters: [makeChar({ vision: "Anemo" }), makeChar({ vision: "Anemo" })] };
    const [effect] = builder.calculateElementalResonance(team);
    expect(effect).toContain("tốc độ di chuyển");
    expect(effect).toContain("Giảm 5% hồi chiêu");
  });

  it("chỉ 1 nhân vật 1 nguyên tố -> không có resonance nào (cần >=2)", () => {
    const team: Team = { characters: [makeChar({ vision: "Pyro" }), makeChar({ vision: "Hydro" })] };
    expect(builder.calculateElementalResonance(team)).toEqual([]);
  });

  it("mọi nguyên tố có ≥2 nhân vật đều lấy được resonance từ nguồn hợp nhất (không undefined/lỗi)", () => {
    for (const vision of ["Pyro", "Hydro", "Cryo", "Geo"]) {
      const team: Team = { characters: [makeChar({ vision }), makeChar({ vision })] };
      const [effect] = builder.calculateElementalResonance(team);
      expect(effect).not.toContain("undefined");
      expect(effect.length).toBeGreaterThan(10);
    }
  });
});

describe("simulateReactions — multiplier khớp TRANSFORMATIVE_BASE_COEFFICIENT đã xác minh (KQM)", () => {
  it("Quicken trả multiplier=0 (không tự gây sát thương), không phải 1.15 (số của Aggravate bị gán nhầm)", () => {
    const team: Team = { characters: [makeChar({ vision: "Electro" }), makeChar({ vision: "Dendro" })] };
    const reactions = builder.simulateReactions(team);
    const quicken = reactions.find((r) => r.name === "Quicken");
    expect(quicken?.multiplier).toBe(0);
  });

  it.each([
    ["Pyro", "Electro", "Overload", 2.75],
    ["Cryo", "Electro", "Superconduct", 1.5],
    ["Electro", "Hydro", "Electro-Charged", 2.0],
    ["Pyro", "Dendro", "Burning", 0.25],
    ["Hydro", "Dendro", "Bloom", 2.0],
  ] as const)("%s + %s -> %s có multiplier đúng %s (không còn placeholder ~1.0)", (v1, v2, name, expected) => {
    const team: Team = { characters: [makeChar({ vision: v1 }), makeChar({ vision: v2 })] };
    const reactions = builder.simulateReactions(team);
    const reaction = reactions.find((r) => r.name === name);
    expect(reaction?.multiplier).toBeCloseTo(expected, 5);
  });
});
