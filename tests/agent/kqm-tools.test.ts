import { describe, it, expect, vi } from "vitest";
import { KQMBenchmarkTool } from "@/agent/tools/kqm-benchmark.tool";
import { CharacterBuildTool } from "@/agent/tools/character-build.tool";

// Mock prisma
vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    character: {
      findUnique: vi.fn().mockResolvedValue({ id: "hutao", name: "Hu Tao", baseAtk: 106 }),
    },
    weapon: {
      findUnique: vi.fn().mockImplementation(({ where }: { where: { id: string } }) => {
        if (where.id === "staff-of-homa") {
          return Promise.resolve({
            id: "staff-of-homa",
            name: "Staff of Homa",
            atk: 608,
            subStat: "CRIT DMG",
            subStatValue: "66.2%",
          });
        }
        if (where.id === "dragons-bane") {
          return Promise.resolve({
            id: "dragons-bane",
            name: "Dragon's Bane",
            atk: 454,
            subStat: "Elemental Mastery",
            subStatValue: "221",
          });
        }
        return Promise.resolve(null);
      }),
    },
  },
}));

describe("AI Agent Tools: KQM Benchmark & Character Build", () => {
  it("should calculate single weapon stats correctly", async () => {
    const tool = new KQMBenchmarkTool();
    const res = await tool.execute(
      {
        characterId: "hutao",
        weaponAId: "staff-of-homa",
        distribution: "dps",
      },
      { sessionId: "test", userId: "test" }
    );

    expect(res.success).toBe(true);
    expect(res.data?.characterName).toBe("Hu Tao");
    expect(res.data?.weaponA.name).toBe("Staff of Homa");
    expect(res.data?.weaponA.critDmg).toBeGreaterThan(100);
  });

  it("should compare two weapons under KQM neutral gear", async () => {
    const tool = new KQMBenchmarkTool();
    const res = await tool.execute(
      {
        characterId: "hutao",
        weaponAId: "dragons-bane",
        weaponBId: "staff-of-homa",
        distribution: "dps",
      },
      { sessionId: "test", userId: "test" }
    );

    expect(res.success).toBe(true);
    expect(res.data?.weaponB).toBeDefined();
    expect(res.data?.weaponB?.name).toBe("Staff of Homa");
    expect(res.data?.recommendation).toContain("Staff of Homa");
  });

  it("should retrieve curated character build for playable characters", async () => {
    const tool = new CharacterBuildTool();
    const res = await tool.execute(
      { characterId: "alhaitham" },
      { sessionId: "test", userId: "test" }
    );

    expect(res.success).toBe(true);
    expect(res.data?.hasCuratedBuild).toBe(true);
    expect(res.data?.recommendedWeapons.length).toBeGreaterThan(0);
    expect(res.data?.mainStats.sands).toBeTruthy();
  });
});
