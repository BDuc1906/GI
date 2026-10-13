import { describe, expect, it } from "vitest";
import { DPSCalculator } from "@/core/game/dps-calculator";

const calc = new DPSCalculator();

describe("calculateShowdown — Đối đầu 2 trang bị / 2 build A vs B", () => {
  it("xác định chính xác Build A thắng khi DPS cao hơn", () => {
    const buildA = {
      expectedDPS: 25000,
      damageBreakdown: { normalAttack: 5000, skill: 8000, burst: 12000, reactions: 3000 },
      optimizationTips: [],
    };

    const buildB = {
      expectedDPS: 20000,
      damageBreakdown: { normalAttack: 4000, skill: 7000, burst: 9000, reactions: 2000 },
      optimizationTips: [],
    };

    const showdown = calc.calculateShowdown(buildA, buildB, "Trượng Hộ Ma R1", "Thương Quyết Đấu R1");

    expect(showdown.winner).toBe("A");
    expect(showdown.improvementPercent).toBe(25.0); // (25000 - 20000) / 20000 = 25%
    expect(showdown.dpsDiff).toBe(5000);
    expect(showdown.differences.burstDiff).toBe(3000);
    expect(showdown.verdict).toContain("Trượng Hộ Ma R1 mang lại sát thương kỳ vọng cao hơn");
  });

  it("xác định chính xác Build B thắng khi DPS cao hơn", () => {
    const buildA = {
      expectedDPS: 18000,
      damageBreakdown: { normalAttack: 4000, skill: 6000, burst: 8000, reactions: 1500 },
      optimizationTips: [],
    };

    const buildB = {
      expectedDPS: 21600,
      damageBreakdown: { normalAttack: 4500, skill: 7200, burst: 9900, reactions: 2100 },
      optimizationTips: [],
    };

    const showdown = calc.calculateShowdown(buildA, buildB, "Nón Tỉ lệ Crit", "Nón Sát thương Crit");

    expect(showdown.winner).toBe("B");
    expect(showdown.improvementPercent).toBe(20.0); // (21600 - 18000) / 18000 = 20%
    expect(showdown.dpsDiff).toBe(-3600);
    expect(showdown.verdict).toContain("Nón Sát thương Crit mang lại sát thương kỳ vọng cao hơn");
  });

  it("xử lý trường hợp TIE khi chênh lệch dưới 5 DPS", () => {
    const buildA = {
      expectedDPS: 20002,
      damageBreakdown: { normalAttack: 5000, skill: 7000, burst: 8002, reactions: 2000 },
      optimizationTips: [],
    };

    const buildB = {
      expectedDPS: 20000,
      damageBreakdown: { normalAttack: 5000, skill: 7000, burst: 8000, reactions: 2000 },
      optimizationTips: [],
    };

    const showdown = calc.calculateShowdown(buildA, buildB);

    expect(showdown.winner).toBe("TIE");
    expect(showdown.improvementPercent).toBe(0);
    expect(showdown.verdict).toContain("tương đương nhau");
  });
});
