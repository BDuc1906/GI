import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {
    character: { findUnique: vi.fn() },
    weapon: { findMany: vi.fn() },
    artifactSet: { findMany: vi.fn() },
  },
  generateText: vi.fn(),
  createLLMClient: vi.fn(),
  validateConfig: vi.fn(),
}));

vi.mock("@/lib/db/prisma", () => ({ prisma: mocks.prisma }));
vi.mock("ai", () => ({ generateText: mocks.generateText }));
vi.mock("@/agent/core/llm-client", () => ({
  createLLMClient: mocks.createLLMClient,
}));
vi.mock("@/agent/core/config", () => ({
  validateConfig: mocks.validateConfig,
}));

const { generateBuildAdvice } = await import("@/agent/build-advisor");

const uid = "812345678";
const nickname = "PRIVATE_PLAYER_NICKNAME";
const signature = "PRIVATE_PLAYER_SIGNATURE";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.validateConfig.mockReturnValue([]);
  mocks.createLLMClient.mockResolvedValue({ provider: "test" });
  mocks.generateText.mockResolvedValue({ text: "Tăng Energy Recharge." });
  mocks.prisma.character.findUnique.mockResolvedValue({
    id: "alhaitham",
    name: "Alhaitham",
    vision: "Dendro",
    weaponType: "Sword",
    rarity: 5,
    genshinDbId: "78",
  });
  mocks.prisma.weapon.findMany.mockResolvedValue([]);
  mocks.prisma.artifactSet.findMany.mockResolvedValue([]);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("AI Build Advisor", () => {
  it("uses Enka stats and KQM RV while keeping player identifiers out of the LLM prompt", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      playerInfo: { nickname, signature },
      avatarInfoList: [{
        avatarId: 10_000_078,
        fightPropMap: { "2000": 20_000, "2001": 2_000, "20": 0.7, "22": 1.4, "23": 1.2 },
        equipList: [{
          flat: {
            itemType: "ITEM_WEAPON",
            nameTextMapHash: "weapon",
          },
          weapon: { level: 90, affixMap: { "1": 0 } },
        }, {
          flat: {
            itemType: "ITEM_RELIQUARY",
            nameTextMapHash: "artifact",
            equipType: "EQUIP_BRACER",
            reliquaryMainstat: { mainPropId: "FIGHT_PROP_HP", statValue: 4_780 },
            reliquarySubstats: [{
              appendPropId: "FIGHT_PROP_CRITICAL",
              statValue: 7.8,
            }],
          },
          reliquary: { level: 21 },
        }],
      }],
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateBuildAdvice(uid, "alhaitham");

    expect(result).toMatchObject({
      characterName: "Alhaitham",
      advice: "Tăng Energy Recharge.",
      buildSource: "curated",
    });
    expect(fetchMock).toHaveBeenCalledWith(
      `https://enka.network/api/uid/${uid}`,
      expect.objectContaining({ signal: expect.any(AbortSignal) })
    );

    const prompt = mocks.generateText.mock.calls[0][0].prompt as string;
    expect(prompt).not.toContain(uid);
    expect(prompt).not.toContain(nickname);
    expect(prompt).not.toContain(signature);
    const context = JSON.parse(prompt);
    expect(context.observedStats.critRate).toBe(70);
    expect(context.equippedArtifacts[0].kqmRollValue.totalRV).toBeGreaterThan(0);
    expect(mocks.generateText.mock.calls[0][0].system).toContain("KQM 20-roll");
  });

  it("does not call the model when the selected character is not in the showcase", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({
      avatarInfoList: [],
    }), { status: 200 })));

    await expect(generateBuildAdvice(uid, "alhaitham")).rejects.toMatchObject({
      status: 404,
      code: "NOT_FOUND",
    });
    expect(mocks.generateText).not.toHaveBeenCalled();
  });
});
