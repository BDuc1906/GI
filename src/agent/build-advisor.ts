import { generateText } from "ai";
import { z } from "zod";
import { calculateArtifactRV, type SubstatKey } from "@/core/game/dps/kqm-standards";
import { getBuildSource, getCharacterBuild } from "@/data/character-builds-data";
import { prisma } from "@/lib/db/prisma";
import { ApiError } from "@/lib/api/errors";
import { createLLMClient } from "./core/llm-client";
import { validateConfig } from "./core/config";

const EnkaResponseSchema = z.object({
  avatarInfoList: z.array(
    z.object({
      avatarId: z.number(),
      fightPropMap: z.record(z.string(), z.number()).optional(),
      equipList: z.array(z.unknown()).optional(),
    }).passthrough()
  ).default([]),
}).passthrough();

const EnkaSubstatSchema = z.object({
  appendPropId: z.string(),
  statValue: z.number(),
});

const ENKA_STAT_TO_KQM: Record<string, SubstatKey> = {
  FIGHT_PROP_CRITICAL: "critRate",
  FIGHT_PROP_CRITICAL_HURT: "critDmg",
  FIGHT_PROP_ATTACK_PERCENT: "atkPercent",
  FIGHT_PROP_HP_PERCENT: "hpPercent",
  FIGHT_PROP_DEFENSE_PERCENT: "defPercent",
  FIGHT_PROP_ELEMENT_MASTERY: "em",
  FIGHT_PROP_CHARGE_EFFICIENCY: "er",
  FIGHT_PROP_ATTACK: "flatAtk",
  FIGHT_PROP_HP: "flatHp",
  FIGHT_PROP_DEFENSE: "flatDef",
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? value as Record<string, unknown>
    : null;
}

function percent(value: number | undefined, defaultValue = 0): number {
  return Number((((value ?? defaultValue) * 100)).toFixed(1));
}

function analyzeEquipment(equipList: unknown[] | undefined) {
  const weapon: Record<string, unknown> | null = null;
  const artifacts: Array<Record<string, unknown>> = [];
  let equippedWeapon: Record<string, unknown> | null = weapon;

  for (const rawEquip of equipList ?? []) {
    const equip = asRecord(rawEquip);
    const flat = asRecord(equip?.flat);
    if (!equip || !flat) continue;

    if (flat.itemType === "ITEM_WEAPON") {
      const weaponInfo = asRecord(equip.weapon);
      equippedWeapon = {
        name: typeof flat.nameTextMapHash === "string" ? flat.nameTextMapHash : "Unknown weapon",
        level: typeof weaponInfo?.level === "number" ? weaponInfo.level : null,
        refinement: (() => {
          const affixMap = asRecord(weaponInfo?.affixMap);
          const affix = affixMap ? Object.values(affixMap)[0] : undefined;
          return typeof affix === "number" ? affix + 1 : null;
        })(),
      };
      continue;
    }

    if (flat.itemType !== "ITEM_RELIQUARY") continue;

    const mainStat = asRecord(flat.reliquaryMainstat);
    const rawSubstats = Array.isArray(flat.reliquarySubstats)
      ? flat.reliquarySubstats.flatMap((item) => {
          const parsed = EnkaSubstatSchema.safeParse(item);
          return parsed.success ? [parsed.data] : [];
        })
      : [];
    const kqmSubstats: Partial<Record<SubstatKey, number>> = {};
    for (const substat of rawSubstats) {
      const key = ENKA_STAT_TO_KQM[substat.appendPropId];
      if (key) kqmSubstats[key] = (kqmSubstats[key] ?? 0) + substat.statValue;
    }

    const reliquary = asRecord(equip.reliquary);
    artifacts.push({
      name: typeof flat.nameTextMapHash === "string" ? flat.nameTextMapHash : "Artifact",
      slot: typeof flat.equipType === "string" ? flat.equipType : "unknown",
      level: typeof reliquary?.level === "number" ? Math.max(0, reliquary.level - 1) : null,
      mainStat: {
        prop: typeof mainStat?.mainPropId === "string" ? mainStat.mainPropId : null,
        value: typeof mainStat?.statValue === "number" ? mainStat.statValue : null,
      },
      substats: rawSubstats.map((substat) => ({
        prop: substat.appendPropId,
        value: substat.statValue,
      })),
      kqmRollValue: calculateArtifactRV(kqmSubstats),
    });
  }

  return { weapon: equippedWeapon, artifacts };
}

async function getEnkaAvatar(uid: string, characterId: string) {
  const character = await prisma.character.findUnique({
    where: { id: characterId },
    select: {
      id: true,
      name: true,
      vision: true,
      weaponType: true,
      rarity: true,
      genshinDbId: true,
    },
  });

  if (!character) throw ApiError.notFound("Không tìm thấy nhân vật trong dữ liệu LEIBO.");
  if (!character.genshinDbId) {
    throw ApiError.notFound("Nhân vật này chưa được liên kết với dữ liệu Enka.");
  }

  let response: Response;
  try {
    response = await fetch(`https://enka.network/api/uid/${uid}`, {
      headers: { "User-Agent": "LEIBO-GenshinDB/1.0 (https://leibo.gg)" },
      signal: AbortSignal.timeout(10_000),
      next: { revalidate: 60 },
    });
  } catch {
    throw new ApiError(502, "ENKA_UNAVAILABLE", "Không thể kết nối Enka.Network. Vui lòng thử lại.");
  }

  if (response.status === 404 || response.status === 400) {
    throw ApiError.notFound("Không tìm thấy UID hoặc showcase công khai trên Enka.Network.");
  }
  if (response.status === 424) {
    throw new ApiError(503, "GAME_MAINTENANCE", "Game đang bảo trì. Vui lòng thử lại sau.");
  }
  if (response.status === 429) {
    throw new ApiError(429, "ENKA_RATE_LIMITED", "Enka.Network đang giới hạn yêu cầu. Vui lòng thử lại sau.");
  }
  if (!response.ok) {
    throw new ApiError(502, "ENKA_UPSTREAM_ERROR", "Enka.Network hiện không thể xử lý yêu cầu.");
  }

  const rawData: unknown = await response.json();
  const parsedData = EnkaResponseSchema.safeParse(rawData);
  if (!parsedData.success) {
    throw new ApiError(502, "ENKA_INVALID_RESPONSE", "Dữ liệu showcase từ Enka.Network không hợp lệ.");
  }

  const avatar = parsedData.data.avatarInfoList.find((entry) => {
    const avatarId = String(entry.avatarId);
    return avatarId === character.genshinDbId
      || String(entry.avatarId - 10_000_000) === character.genshinDbId;
  });

  if (!avatar) {
    throw ApiError.notFound(`${character.name} không có trong showcase công khai của UID này.`);
  }

  const fightProps = avatar.fightPropMap ?? {};
  const equipped = analyzeEquipment(avatar.equipList);

  return {
    character,
    observedStats: {
      hp: Math.round(fightProps["2000"] ?? 0),
      atk: Math.round(fightProps["2001"] ?? 0),
      def: Math.round(fightProps["2002"] ?? 0),
      critRate: percent(fightProps["20"]),
      critDmg: percent(fightProps["22"]),
      em: Math.round(fightProps["28"] ?? 0),
      er: percent(fightProps["23"], 1),
    },
    weapon: equipped.weapon,
    artifacts: equipped.artifacts,
  };
}

export async function generateBuildAdvice(uid: string, characterId: string): Promise<{
  characterName: string;
  advice: string;
  buildSource: "curated" | "draft" | "auto";
}> {
  const configErrors = validateConfig();
  if (configErrors.length > 0) {
    throw new ApiError(
      503,
      "AI_NOT_CONFIGURED",
      `AI Build Advisor chưa được cấu hình: ${configErrors.join("; ")}`
    );
  }

  const liveBuild = await getEnkaAvatar(uid, characterId);
  const build = getCharacterBuild(liveBuild.character.id);
  const buildSource = getBuildSource(liveBuild.character.id);

  const weaponIds = build?.weapons?.map((weapon) => weapon.weaponId) ?? [];
  const artifactSetIds = [...new Set(build?.artifacts?.flatMap((artifact) => artifact.setIds) ?? [])];
  const [weapons, artifactSets] = await Promise.all([
    weaponIds.length > 0
      ? prisma.weapon.findMany({
          where: { id: { in: weaponIds } },
          select: { id: true, name: true },
        })
      : [],
    artifactSetIds.length > 0
      ? prisma.artifactSet.findMany({
          where: { id: { in: artifactSetIds } },
          select: { id: true, name: true },
        })
      : [],
  ]);
  const weaponNames = new Map(weapons.map((weapon) => [weapon.id, weapon.name]));
  const artifactNames = new Map(artifactSets.map((set) => [set.id, set.name]));

  const buildContext = build
    ? {
        source: buildSource,
        recommendedWeapons: build.weapons?.map((weapon) => ({
          name: weaponNames.get(weapon.weaponId) ?? weapon.weaponId,
          tier: weapon.tier,
          note: weapon.noteVi,
        })),
        recommendedArtifacts: build.artifacts?.map((artifact) => ({
          sets: artifact.setIds.map((id) => artifactNames.get(id) ?? id),
          mode: artifact.mode,
          priority: artifact.priority,
          note: artifact.noteVi,
        })),
        mainStats: build.mainStats,
        subStats: build.subStats,
        talentPriority: build.talentPriority,
        playstyle: build.playstyleNoteVi,
        teams: build.teams,
      }
    : { source: "auto", note: "LEIBO chưa có build được biên soạn riêng cho nhân vật này." };

  const prompt = JSON.stringify({
    character: {
      name: liveBuild.character.name,
      element: liveBuild.character.vision,
      weaponType: liveBuild.character.weaponType,
      rarity: liveBuild.character.rarity,
    },
    observedStats: liveBuild.observedStats,
    equippedWeapon: liveBuild.weapon,
    equippedArtifacts: liveBuild.artifacts,
    leiboBuildGuide: buildContext,
    kqmDpsReference: {
      description: "KQM 20-roll artifact substat reference for a generic on-field DPS; not a universal target for support or reaction builds.",
      targetRolls: { critRate: 6, critDmg: 6, atkPercent: 6, er: 2 },
      targetSubstatValues: { critRate: 23.34, critDmg: 46.62, atkPercent: 34.98, er: 12.96 },
    },
  });

  let advice: string;
  try {
    const model = await createLLMClient();
    const result = await generateText({
      model,
      system: [
        "Bạn là LEIBO AI Build Advisor, chuyên gia Genshin Impact.",
        "Chỉ phân tích dữ liệu JSON đã cung cấp. Dữ liệu showcase và stat là số liệu thực Enka; không bịa số hoặc hiệu ứng.",
        "Đối chiếu hướng build LEIBO với vũ khí, main stat, substat, chỉ số chiến đấu và KQM Roll Value theo từng món.",
        "KQM 20-roll chỉ là benchmark tham khảo cho DPS phù hợp, không áp dụng máy móc cho support, healer, EM/reaction build.",
        "Ghi rõ nguồn hướng dẫn curated/draft/auto; không mô tả draft hoặc auto là đã được chuyên gia xác minh.",
        "Đưa ra ưu tiên nâng cấp cụ thể theo thứ tự, giải thích vì sao; phân biệt vấn đề chắc chắn và điều còn tùy team/rotation.",
        "Nếu thiếu dữ liệu, nói rõ thiếu gì. Không đưa tên UID, nickname hoặc chữ ký người chơi vào phản hồi.",
        "Trả lời bằng tiếng Việt, ngắn gọn theo mục: Tóm tắt; Điểm tốt; Ưu tiên cải thiện; Mục tiêu chỉ số/build; Lưu ý.",
      ].join("\n"),
      prompt,
      temperature: 0.2,
      maxOutputTokens: 900,
    });
    advice = result.text.trim();
  } catch (error) {
    console.error(
      "[BuildAdvisor] LLM request failed:",
      error instanceof Error ? error.name : "UnknownError"
    );
    throw new ApiError(502, "AI_GENERATION_FAILED", "AI chưa thể tạo tư vấn lúc này. Vui lòng thử lại sau.");
  }

  if (!advice) {
    throw new ApiError(502, "AI_EMPTY_RESPONSE", "AI không trả về nội dung tư vấn. Vui lòng thử lại.");
  }

  return { characterName: liveBuild.character.name, advice, buildSource };
}
