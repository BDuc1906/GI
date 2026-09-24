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
