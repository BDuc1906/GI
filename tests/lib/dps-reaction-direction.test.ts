import { describe, expect, it } from "vitest";
import { DPSCalculator } from "@/lib/game/dps-calculator";

const calc = new DPSCalculator();

describe("calculateReactionMultiplier — chiều phản ứng (forward/reverse)", () => {
  it("Vaporize forward (Hydro áp lên Pyro) mạnh hơn reverse (Pyro áp lên Hydro)", () => {
    const forward = calc.calculateReactionMultiplier("Vaporize", 0, 90, "forward");
    const reverse = calc.calculateReactionMultiplier("Vaporize", 0, 90, "reverse");
    expect(forward).toBeGreaterThan(reverse);
    // Tỉ lệ hệ số gốc đúng 2.0 / 1.5 bất kể levelBonus áp dụng cho cả hai.
    expect(forward / reverse).toBeCloseTo(2.0 / 1.5, 5);
  });

  it("Melt forward (Pyro áp lên Cryo) mạnh hơn reverse (Cryo áp lên Pyro)", () => {
    const forward = calc.calculateReactionMultiplier("Melt", 0, 90, "forward");
    const reverse = calc.calculateReactionMultiplier("Melt", 0, 90, "reverse");
    expect(forward).toBeGreaterThan(reverse);
    expect(forward / reverse).toBeCloseTo(2.0 / 1.5, 5);
  });

  it("direction mặc định là 'forward' khi không truyền", () => {
    const withoutDirection = calc.calculateReactionMultiplier("Vaporize", 0, 90);
    const explicitForward = calc.calculateReactionMultiplier("Vaporize", 0, 90, "forward");
    expect(withoutDirection).toBe(explicitForward);
  });

  it("direction không ảnh hưởng phản ứng transformative có EM scaling (vd Overload)", () => {
    const forward = calc.calculateReactionMultiplier("Overload", 500, 90, "forward");
    const reverse = calc.calculateReactionMultiplier("Overload", 500, 90, "reverse");
    expect(forward).toBe(reverse);
  });
});

describe("calculateReactionMultiplier — Aggravate/Spread/Quicken (công thức Additive Reaction)", () => {
  it("Quicken không gây sát thương trực tiếp (luôn trả 1.0, không phụ thuộc EM/level)", () => {
    expect(calc.calculateReactionMultiplier("Quicken", 0, 90)).toBe(1.0);
    expect(calc.calculateReactionMultiplier("Quicken", 1000, 1)).toBe(1.0);
  });

  it("Aggravate tăng theo EM (0 EM phải nhỏ hơn hẳn 800 EM)", () => {
    const lowEM = calc.calculateReactionMultiplier("Aggravate", 0, 90);
    const highEM = calc.calculateReactionMultiplier("Aggravate", 800, 90);
    expect(highEM).toBeGreaterThan(lowEM);
  });

  it("Spread luôn mạnh hơn Aggravate ở cùng EM/level (hằng số 1.25 > 1.15)", () => {
    const aggravate = calc.calculateReactionMultiplier("Aggravate", 400, 90);
    const spread = calc.calculateReactionMultiplier("Spread", 400, 90);
    expect(spread).toBeGreaterThan(aggravate);
  });

  it("Aggravate ở 0 EM khớp hằng số gốc 1.15 (không có bonus EM)", () => {
    const level = 90;
    const levelBonus = 1 + (level / 9) * 2.78;
    const result = calc.calculateReactionMultiplier("Aggravate", 0, level);
    expect(result).toBeCloseTo(1.15 * levelBonus, 5);
  });
});

describe("calculateReactionMultiplier — hệ số cơ bản Transformative Reaction (KQM/Genshin Wiki)", () => {
  const level = 90;
  const levelBonus = 1 + (level / 9) * 2.78;

  it.each([
    ["Burning", 0.25],
    ["Swirl", 0.6],
    ["Superconduct", 1.5],
    ["Electro-Charged", 2.0],
    ["Bloom", 2.0],
    ["Overload", 2.75],
    ["Burgeon", 3.0],
    ["Hyperbloom", 3.0],
    ["Shatter", 3.0],
  ] as const)("%s ở 0 EM khớp đúng hệ số cơ bản chính thức ×levelBonus", (reaction, coefficient) => {
    const result = calc.calculateReactionMultiplier(reaction, 0, level);
    expect(result).toBeCloseTo(coefficient * levelBonus, 5);
  });

  it("Hyperbloom mạnh hơn Superconduct đúng tỉ lệ 3.0/1.5 = 2x ở cùng EM/level", () => {
    const hyperbloom = calc.calculateReactionMultiplier("Hyperbloom", 500, level);
    const superconduct = calc.calculateReactionMultiplier("Superconduct", 500, level);
    expect(hyperbloom / superconduct).toBeCloseTo(2.0, 5);
  });

  it("EM cao hơn luôn cho sát thương transformative cao hơn (mọi phản ứng)", () => {
    const low = calc.calculateReactionMultiplier("Overload", 0, level);
    const high = calc.calculateReactionMultiplier("Overload", 1000, level);
    expect(high).toBeGreaterThan(low);
  });
});

describe("calculateDefenseMitigation — công thức DEF Multiplier chính thức", () => {
  it("cùng level, không giảm/bỏ qua DEF -> giảm còn đúng 50% (ví dụ chính thức trên Genshin Wiki)", () => {
    const result = calc.calculateDefenseMitigation(90, 90, 0, 0);
    expect(result).toBeCloseTo(0.5, 5);
  });

  it("nhân vật cấp thấp hơn địch -> DEF Multiplier < 0.5 (bất lợi hơn)", () => {
    const lowLevel = calc.calculateDefenseMitigation(1, 90, 0, 0);
    const equalLevel = calc.calculateDefenseMitigation(90, 90, 0, 0);
    expect(lowLevel).toBeLessThan(equalLevel);
  });

  it("giảm DEF địch (defenseReduction) làm DEF Multiplier tăng (đỡ bị giảm sát thương hơn)", () => {
    const noReduction = calc.calculateDefenseMitigation(90, 90, 0, 0);
    const withReduction = calc.calculateDefenseMitigation(90, 90, 20, 0); // vd Zhongli -20%
    expect(withReduction).toBeGreaterThan(noReduction);
  });

  it("bỏ qua DEF hoàn toàn (defenseIgnore=100) -> DEF Multiplier = 1.0 (không giảm sát thương gì)", () => {
    const result = calc.calculateDefenseMitigation(90, 90, 0, 100);
    expect(result).toBeCloseTo(1.0, 5);
  });

  it("mặc định (không truyền defenseReduction/defenseIgnore) vẫn tính đúng như truyền 0", () => {
    const withDefaults = calc.calculateDefenseMitigation(90, 90);
    const explicit = calc.calculateDefenseMitigation(90, 90, 0, 0);
    expect(withDefaults).toBeCloseTo(explicit, 10);
  });
});
