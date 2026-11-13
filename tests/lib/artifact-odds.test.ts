import { describe, it, expect } from "vitest";
import {
  ARTIFACT_MAIN_STAT_ODDS,
  ARTIFACT_SUBSTAT_ROLL_TIERS,
  calculateCritValue,
} from "@/core/game/artifact-odds";

describe("Artifact Odds and Roll Value (KQM)", () => {
  it("should have correct main stat percentage sum close to 100% for each slot", () => {
    for (const [slotKey, data] of Object.entries(ARTIFACT_MAIN_STAT_ODDS)) {
      const sum = data.stats.reduce((acc, curr) => acc + curr.percentage, 0);
      expect(sum).toBeGreaterThanOrEqual(99.9);
      expect(sum).toBeLessThanOrEqual(100.1);
      expect(data.slot).toBe(slotKey);
    }
  });

  it("should have exactly 100% flat HP for Flower and flat ATK for Plume", () => {
    expect(ARTIFACT_MAIN_STAT_ODDS.flower.stats).toHaveLength(1);
    expect(ARTIFACT_MAIN_STAT_ODDS.flower.stats[0].stat).toBe("HP");
    expect(ARTIFACT_MAIN_STAT_ODDS.flower.stats[0].percentage).toBe(100);

    expect(ARTIFACT_MAIN_STAT_ODDS.plume.stats).toHaveLength(1);
    expect(ARTIFACT_MAIN_STAT_ODDS.plume.stats[0].stat).toBe("ATK");
    expect(ARTIFACT_MAIN_STAT_ODDS.plume.stats[0].percentage).toBe(100);
  });

  it("should verify Goblet Elemental DMG and EM rare odds", () => {
    const gobletStats = ARTIFACT_MAIN_STAT_ODDS.goblet.stats;
    const emStat = gobletStats.find((s) => s.stat === "Elemental Mastery");
    expect(emStat?.percentage).toBe(2.5);

    const pyroStat = gobletStats.find((s) => s.stat === "Pyro DMG Bonus");
    expect(pyroStat?.percentage).toBe(5.0);
  });

  it("should verify Circlet CR/CD odds are 10% each", () => {
    const circletStats = ARTIFACT_MAIN_STAT_ODDS.circlet.stats;
    const crStat = circletStats.find((s) => s.stat === "CRIT Rate");
    const cdStat = circletStats.find((s) => s.stat === "CRIT DMG");
    expect(crStat?.percentage).toBe(10.0);
    expect(cdStat?.percentage).toBe(10.0);
  });

  it("should have 4 ascending roll tiers for all substats", () => {
    expect(ARTIFACT_SUBSTAT_ROLL_TIERS.length).toBeGreaterThanOrEqual(10);
    for (const tier of ARTIFACT_SUBSTAT_ROLL_TIERS) {
      expect(tier.tier5Star[0]).toBeLessThan(tier.tier5Star[1]);
      expect(tier.tier5Star[1]).toBeLessThan(tier.tier5Star[2]);
      expect(tier.tier5Star[2]).toBeLessThan(tier.tier5Star[3]);

      expect(tier.tier4Star[0]).toBeLessThan(tier.tier4Star[1]);
      expect(tier.tier4Star[1]).toBeLessThan(tier.tier4Star[2]);
      expect(tier.tier4Star[2]).toBeLessThan(tier.tier4Star[3]);
    }
  });

  it("should calculate Crit Value (CV) correctly according to KQM tiers", () => {
    // 3.9 CR + 21.0 CD = 2 * 3.9 + 21.0 = 28.8 CV -> Khá
    const res1 = calculateCritValue(3.9, 21.0);
    expect(res1.cv).toBe(28.8);
    expect(res1.tier).toContain("Khá");

    // 10.0 CR + 25.0 CD = 45.0 CV -> Xuất Sắc (God Tier)
    const res2 = calculateCritValue(10.0, 25.0);
    expect(res2.cv).toBe(45.0);
    expect(res2.tier).toContain("Xuất Sắc");

    // 15.0 CR + 22.0 CD = 52.0 CV -> Kỳ Lân
    const res3 = calculateCritValue(15.0, 22.0);
    expect(res3.cv).toBe(52.0);
    expect(res3.tier).toContain("Kỳ Lân");
  });
});
