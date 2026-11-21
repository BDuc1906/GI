import type { NextRequest } from "next/server";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

export const revalidate = 60;
export const dynamic = "force-dynamic";

// In-memory TTL cache để tăng tốc sub-20ms cho các lần tra cứu UID liên tiếp
const uidMemoryCache = new Map<string, { timestamp: number; payload: unknown }>();
const UID_CACHE_TTL_MS = 60 * 1000;

// ---------------------------------------------------------------------------
// Enka.Network API types
// ---------------------------------------------------------------------------

interface EnkaPlayerInfo {
  nickname: string;
  level: number;            // AR level
  signature?: string;
  worldLevel?: number;
  nameCardId?: number;
  finishAchievementNum?: number;
  towerFloorIndex?: number;
  towerLevelIndex?: number;
  profilePicture?: { avatarId?: number; id?: number };
}

interface EnkaFightPropMap {
  /** Max HP */ "2000"?: number;
  /** Base ATK */ "2001"?: number;
  /** Base DEF */ "2002"?: number;
  /** CRIT Rate */ "20"?: number;
  /** CRIT DMG */  "22"?: number;
  /** Elemental Mastery */ "28"?: number;
  /** Energy Recharge */  "23"?: number;
  [key: string]: number | undefined;
}

interface EnkaAvatarInfo {
  avatarId: number;
  propMap?: Record<string, { val?: string; ival?: string }>;
  fightPropMap?: EnkaFightPropMap;
  equipList?: unknown[];
  talentIdList?: number[];
  skillLevelMap?: Record<string, number>;
}

interface EnkaApiResponse {
  playerInfo: EnkaPlayerInfo;
  avatarInfoList?: EnkaAvatarInfo[];
  uid?: string;
  ttl?: number;
}

// ---------------------------------------------------------------------------
// Public output types
// ---------------------------------------------------------------------------

export interface EnkaFightProps {
  hp: number;
  baseHp: number;
  atk: number;
  baseAtk: number;
  def: number;
  baseDef: number;
  critRate: number;
  critDmg: number;
  em: number;
  er: number;
  damageBonus: number;
  healingBonus: number;
}

export interface EnkaArtifactPiece {
  slot: "flower" | "plume" | "sands" | "goblet" | "circlet";
  slotName: string;
  name: string;
  setName?: string;
  iconUrl: string | null;
  rarity: number;
  level: number;
  mainStat: {
    prop: string;
    label: string;
    value: string;
  };
  substats: Array<{
    prop: string;
    label: string;
    value: string;
    rollValue: number;
  }>;
  critRate: number;
  critDmg: number;
  critValue: number;
  rollValue: number;
  cvRating: "Kỳ Lân (Unicorn)" | "Cực Phẩm (God Roll)" | "Rất Tốt (Great)" | "Khá (Good)" | "Bình Thường";
}

export interface EnkaWeaponInfo {
  name: string;
  iconUrl: string | null;
  iconKey: string | null;
  level: number;
  refinement: number;
  rarity: number;
}

export interface EnkaShowcaseCharacter {
  /** slug từ DB (Character.id) — null nếu chưa map được */
  characterId: string | null;
  characterName: string | null;
  iconUrl: string | null;
  vision: string | null;
  /** Enka avatarId gốc để debug */
  avatarId: number;
  level: number;
  fightProps: EnkaFightProps;
  constellations: number;
  talentLevels: number[];
  weapon: EnkaWeaponInfo | null;
  artifacts: EnkaArtifactPiece[];
  totalCritValue: number;
  totalRollValue: number;
  totalCvRating: "Đỉnh Cao (Top 1%)" | "Cực Phẩm (Endgame)" | "Chuẩn Thi Đấu" | "Đang Hoàn Thiện";
  activeSetSummary: string[];
}

export interface EnkaShowcaseResult {
  playerInfo: {
    nickname: string;
    arLevel: number;
    worldLevel: number;
    signature: string;
    achievements: number | null;
    spiralAbyss: string | null;
  };
  showcaseCharacters: EnkaShowcaseCharacter[];
  ttl: number;
  fetchedAt: string;
}

// ---------------------------------------------------------------------------
// Helpers & Stat Definitions
// ---------------------------------------------------------------------------

function parseLevel(propMap: EnkaAvatarInfo["propMap"]): number {
  const raw = propMap?.["4001"]?.val ?? propMap?.["4001"]?.ival;
  return raw ? parseInt(raw, 10) : 1;
}

const ELEMENT_DAMAGE_PROP: Record<string, string> = {
  Pyro: "40",
  Hydro: "42",
  Dendro: "43",
  Electro: "41",
  Anemo: "44",
  Cryo: "46",
  Geo: "45",
  Physical: "30",
};

function parseFightProps(
  fightPropMap: EnkaFightPropMap | undefined,
  vision: string | null
): EnkaFightProps {
  if (!fightPropMap) {
    return {
      hp: 0,
      baseHp: 0,
      atk: 0,
      baseAtk: 0,
      def: 0,
      baseDef: 0,
      critRate: 5,
      critDmg: 50,
      em: 0,
      er: 100,
      damageBonus: 0,
      healingBonus: 0,
    };
  }

  const damagePropKey = vision ? (ELEMENT_DAMAGE_PROP[vision] ?? "30") : "30";
  const damageBonusVal = (fightPropMap[damagePropKey] ?? 0) * 100;
  const healingBonusVal = (fightPropMap["26"] ?? 0) * 100;

  return {
    hp: Math.round(fightPropMap["2000"] ?? 0),
    baseHp: Math.round(fightPropMap["1"] ?? 0),
    atk: Math.round(fightPropMap["2001"] ?? 0),
    baseAtk: Math.round(fightPropMap["4"] ?? 0),
    def: Math.round(fightPropMap["2002"] ?? 0),
    baseDef: Math.round(fightPropMap["7"] ?? 0),
    critRate: parseFloat(((fightPropMap["20"] ?? 0.05) * 100).toFixed(1)),
    critDmg: parseFloat(((fightPropMap["22"] ?? 0.5) * 100).toFixed(1)),
    em: Math.round(fightPropMap["28"] ?? 0),
    er: parseFloat(((fightPropMap["23"] ?? 1) * 100).toFixed(1)),
    damageBonus: parseFloat(damageBonusVal.toFixed(1)),
    healingBonus: parseFloat(healingBonusVal.toFixed(1)),
  };
}

const EQUIP_SLOT_MAP: Record<string, { slot: EnkaArtifactPiece["slot"]; slotName: string }> = {
  EQUIP_BRACER: { slot: "flower", slotName: "Hoa Sự Sống" },
  EQUIP_NECKLACE: { slot: "plume", slotName: "Lông Vũ Tử Vong" },
  EQUIP_SHOES: { slot: "sands", slotName: "Cát Thời Gian" },
  EQUIP_RING: { slot: "goblet", slotName: "Ly Không Gian" },
  EQUIP_DRESS: { slot: "circlet", slotName: "Nón Lý Trí" },
};

const PROP_LABELS: Record<string, string> = {
  FIGHT_PROP_HP: "HP",
  FIGHT_PROP_HP_PERCENT: "HP%",
  FIGHT_PROP_ATTACK: "Tấn Công",
  FIGHT_PROP_ATTACK_PERCENT: "Tấn Công%",
  FIGHT_PROP_DEFENSE: "Phòng Ngự",
  FIGHT_PROP_DEFENSE_PERCENT: "Phòng Ngự%",
  FIGHT_PROP_CRITICAL: "Tỉ Lệ Bạo Kích",
  FIGHT_PROP_CRITICAL_HURT: "Sát Thương Bạo Kích",
  FIGHT_PROP_CHARGE_EFFICIENCY: "Hiệu Quả Nạp",
  FIGHT_PROP_ELEMENT_MASTERY: "Tinh Thông Nguyên Tố",
  FIGHT_PROP_PHYSICAL_ADD_HURT: "ST Vật Lý%",
  FIGHT_PROP_FIRE_ADD_HURT: "ST Nguyên Tố Hỏa%",
  FIGHT_PROP_WATER_ADD_HURT: "ST Nguyên Tố Thủy%",
  FIGHT_PROP_GRASS_ADD_HURT: "ST Nguyên Tố Thảo%",
  FIGHT_PROP_ELEC_ADD_HURT: "ST Nguyên Tố Lôi%",
  FIGHT_PROP_WIND_ADD_HURT: "ST Nguyên Tố Phong%",
  FIGHT_PROP_ICE_ADD_HURT: "ST Nguyên Tố Băng%",
  FIGHT_PROP_ROCK_ADD_HURT: "ST Nguyên Tố Nham%",
  FIGHT_PROP_HEAL_ADD: "Tăng Trị Liệu%",
};

const MAX_SUBSTAT_ROLL: Record<string, number> = {
  FIGHT_PROP_CRITICAL: 3.89,
  FIGHT_PROP_CRITICAL_HURT: 7.77,
  FIGHT_PROP_ATTACK_PERCENT: 5.83,
  FIGHT_PROP_HP_PERCENT: 5.83,
  FIGHT_PROP_DEFENSE_PERCENT: 7.29,
  FIGHT_PROP_ELEMENT_MASTERY: 23.31,
  FIGHT_PROP_CHARGE_EFFICIENCY: 6.48,
  FIGHT_PROP_ATTACK: 19.45,
  FIGHT_PROP_HP: 298.75,
  FIGHT_PROP_DEFENSE: 23.15,
};

function formatStatValue(propId: string, val: number): string {
  if (
    propId.includes("PERCENT") ||
    propId === "FIGHT_PROP_CRITICAL" ||
    propId === "FIGHT_PROP_CRITICAL_HURT" ||
    propId === "FIGHT_PROP_CHARGE_EFFICIENCY" ||
    propId.includes("ADD_HURT") ||
    propId === "FIGHT_PROP_HEAL_ADD"
  ) {
    return `${val.toFixed(1)}%`;
  }
  return Math.round(val).toLocaleString();
}

function parseEquipList(equipList: unknown[] | undefined): {
  weapon: EnkaWeaponInfo | null;
  artifacts: EnkaArtifactPiece[];
  totalCritValue: number;
  totalRollValue: number;
  totalCvRating: EnkaShowcaseCharacter["totalCvRating"];
  activeSetSummary: string[];
} {
  let weapon: EnkaWeaponInfo | null = null;
  const artifacts: EnkaArtifactPiece[] = [];
  const setCounts: Record<string, number> = {};

  if (!Array.isArray(equipList)) {
    return {
      weapon: null,
      artifacts: [],
      totalCritValue: 0,
      totalRollValue: 0,
      totalCvRating: "Đang Hoàn Thiện",
      activeSetSummary: [],
    };
  }

  for (const rawItem of equipList) {
    if (typeof rawItem !== "object" || rawItem === null) continue;
    const item = rawItem as Record<string, unknown>;
    const flat = item.flat as Record<string, unknown> | undefined;
    if (!flat) continue;

    const itemType = flat.itemType as string;

    // 1. Weapon
    if (itemType === "ITEM_WEAPON") {
      const weaponObj = item.weapon as Record<string, unknown> | undefined;
      const affixMap = (weaponObj?.affixMap ?? {}) as Record<string, number>;
      const refinement = (Object.values(affixMap)[0] ?? 0) + 1;
      const icon = flat.icon as string | undefined;

      weapon = {
        name: (flat.nameTextMapHash as string) ?? "Vũ khí",
        iconUrl: icon ? `https://enka.network/ui/${icon}.png` : null,
        iconKey: icon ?? null,
        level: (weaponObj?.level as number) ?? 1,
        refinement,
        rarity: (flat.rankLevel as number) ?? 4,
      };
    }

    // 2. Artifact
    if (itemType === "ITEM_RELIQUARY") {
      const reliquary = item.reliquary as Record<string, unknown> | undefined;
      const equipType = (flat.equipType as string) ?? "EQUIP_BRACER";
      const slotInfo = EQUIP_SLOT_MAP[equipType] ?? { slot: "flower", slotName: "Hoa Sự Sống" };
      const icon = flat.icon as string | undefined;
      const setNameText = (flat.setNameTextMapHash as string) ?? "";

      if (setNameText) {
        setCounts[setNameText] = (setCounts[setNameText] ?? 0) + 1;
      }

      const mainstat = flat.reliquaryMainstat as { mainPropId: string; statValue: number } | undefined;
      const substatsRaw = (flat.reliquarySubstats as Array<{ appendPropId: string; statValue: number }>) ?? [];

      let pieceCritRate = 0;
      let pieceCritDmg = 0;
      let pieceRollValue = 0;

      const parsedSubstats = substatsRaw.map((sub) => {
        if (sub.appendPropId === "FIGHT_PROP_CRITICAL") {
          pieceCritRate = sub.statValue;
        } else if (sub.appendPropId === "FIGHT_PROP_CRITICAL_HURT") {
          pieceCritDmg = sub.statValue;
        }

        const maxRoll = MAX_SUBSTAT_ROLL[sub.appendPropId];
        const subRv = maxRoll ? Math.round((sub.statValue / maxRoll) * 100) : 0;
        pieceRollValue += subRv;

        return {
          prop: sub.appendPropId,
          label: PROP_LABELS[sub.appendPropId] ?? sub.appendPropId,
          value: formatStatValue(sub.appendPropId, sub.statValue),
          rollValue: subRv,
        };
      });

      // Crit Value = 2 * CR + CD
      const critValue = parseFloat((2 * pieceCritRate + pieceCritDmg).toFixed(1));

      let cvRating: EnkaArtifactPiece["cvRating"] = "Bình Thường";
      if (critValue >= 45) cvRating = "Kỳ Lân (Unicorn)";
      else if (critValue >= 35) cvRating = "Cực Phẩm (God Roll)";
      else if (critValue >= 25) cvRating = "Rất Tốt (Great)";
      else if (critValue >= 15) cvRating = "Khá (Good)";

      artifacts.push({
        slot: slotInfo.slot,
        slotName: slotInfo.slotName,
        name: (flat.nameTextMapHash as string) ?? slotInfo.slotName,
        setName: setNameText,
        iconUrl: icon ? `https://enka.network/ui/${icon}.png` : null,
        rarity: (flat.rankLevel as number) ?? 5,
        level: Math.max(0, ((reliquary?.level as number) ?? 1) - 1),
        mainStat: {
          prop: mainstat?.mainPropId ?? "",
          label: PROP_LABELS[mainstat?.mainPropId ?? ""] ?? "Chỉ số chính",
          value: mainstat ? formatStatValue(mainstat.mainPropId, mainstat.statValue) : "0",
        },
        substats: parsedSubstats,
        critRate: pieceCritRate,
        critDmg: pieceCritDmg,
        critValue,
        rollValue: pieceRollValue,
        cvRating,
      });
    }
  }

  // Sắp xếp thánh di vật theo thứ tự chuẩn in-game
  const slotOrder: Record<EnkaArtifactPiece["slot"], number> = {
    flower: 0,
    plume: 1,
    sands: 2,
    goblet: 3,
    circlet: 4,
  };
  artifacts.sort((a, b) => slotOrder[a.slot] - slotOrder[b.slot]);

  const totalCritValue = parseFloat(
    artifacts.reduce((acc, art) => acc + art.critValue, 0).toFixed(1)
  );

  const totalRollValue = artifacts.reduce((acc, art) => acc + art.rollValue, 0);

  let totalCvRating: EnkaShowcaseCharacter["totalCvRating"] = "Đang Hoàn Thiện";
  if (totalCritValue >= 220) totalCvRating = "Đỉnh Cao (Top 1%)";
  else if (totalCritValue >= 180) totalCvRating = "Cực Phẩm (Endgame)";
  else if (totalCritValue >= 140) totalCvRating = "Chuẩn Thi Đấu";

  const activeSetSummary: string[] = [];
  for (const [setName, count] of Object.entries(setCounts)) {
    if (count >= 4) {
      activeSetSummary.push(`${setName} (4)`);
    } else if (count >= 2) {
      activeSetSummary.push(`${setName} (2)`);
    }
  }

  return {
    weapon,
    artifacts,
    totalCritValue,
    totalRollValue,
    totalCvRating,
    activeSetSummary,
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export const GET = withErrorHandling(
  withRateLimit(
    async (_req: NextRequest, { params }: { params: Promise<Record<string, string>> }) => {
      const resolvedParams = await params;
      const uid = resolvedParams.uid;

      if (!/^\d{9,10}$/.test(uid)) {
        throw ApiError.badRequest("UID không hợp lệ. Vui lòng nhập 9 hoặc 10 chữ số.");
      }

      // ── BỘ ĐỆM BỘ NHỚ NHANH SUB-20MS CHO CÙNG 1 UID ──
      const cached = uidMemoryCache.get(uid);
      if (cached && Date.now() - cached.timestamp < UID_CACHE_TTL_MS) {
        return ok(cached.payload, { maxAgeSec: 60 });
      }

      const enkaUrl = `https://enka.network/api/uid/${uid}`;
      let enkaData: EnkaApiResponse;
      try {
        const resp = await fetch(enkaUrl, {
          headers: {
            "User-Agent": "LEIBO-GenshinDB/1.0 (https://leibo.gg)",
          },
          next: { revalidate: 60 },
        });

        if (resp.status === 400) {
          throw ApiError.badRequest("UID không tồn tại hoặc không hợp lệ theo Enka.Network.");
        }
        if (resp.status === 404) {
          throw ApiError.notFound("Không tìm thấy người chơi với UID này trên Enka.Network.");
        }
        if (resp.status === 424) {
          throw new ApiError(503, "GAME_MAINTENANCE", "Game đang bảo trì máy chủ, vui lòng thử lại sau.");
        }
        if (resp.status === 429) {
          throw new ApiError(429, "ENKA_RATE_LIMITED", "Enka.Network đang quá tải rate limit, vui lòng chờ 1-2 phút.");
        }
        if (!resp.ok) {
          throw new ApiError(502, "ENKA_UPSTREAM_ERROR", `Enka.Network trả mã lỗi ${resp.status}.`);
        }

        enkaData = (await resp.json()) as EnkaApiResponse;
      } catch (err) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(502, "ENKA_FETCH_FAILED", "Không thể kết nối tới máy chủ Enka.Network.");
      }

      const avatarInfoList = enkaData.avatarInfoList ?? [];
      const avatarIds = avatarInfoList.map((a) => String(a.avatarId));

      const charactersByGenshinDbId = await prisma.character.findMany({
        where: { genshinDbId: { in: avatarIds } },
        select: { id: true, name: true, iconUrl: true, vision: true, genshinDbId: true },
      });
      const dbMapByGenshinId = new Map(
        charactersByGenshinDbId.map((c) => [c.genshinDbId!, c])
      );

      const unmatchedAvatarIds = avatarInfoList
        .filter((a) => !dbMapByGenshinId.has(String(a.avatarId)))
        .map((a) => a.avatarId);

      const offsetIds = unmatchedAvatarIds.map((id) => String(id - 10000000));
      const charactersByOffset = offsetIds.length > 0
        ? await prisma.character.findMany({
            where: { genshinDbId: { in: offsetIds } },
            select: { id: true, name: true, iconUrl: true, vision: true, genshinDbId: true },
          })
        : [];

      const finalMap = new Map<
        string,
        { id: string; name: string; iconUrl: string | null; vision: string }
      >();
      for (const c of charactersByGenshinDbId) {
        finalMap.set(String(c.genshinDbId), c);
      }
      for (const c of charactersByOffset) {
        if (c.genshinDbId) {
          const recoveredAvatarId = String(parseInt(c.genshinDbId, 10) + 10000000);
          finalMap.set(recoveredAvatarId, c);
        }
      }

      const showcaseCharacters: EnkaShowcaseCharacter[] = avatarInfoList.map((avatar) => {
        const dbChar = finalMap.get(String(avatar.avatarId)) ?? null;
        const equipParsed = parseEquipList(avatar.equipList);

        return {
          characterId: dbChar?.id ?? null,
          characterName: dbChar?.name ?? null,
          iconUrl: dbChar?.iconUrl ?? null,
          vision: dbChar?.vision ?? null,
          avatarId: avatar.avatarId,
          level: parseLevel(avatar.propMap),
          fightProps: parseFightProps(avatar.fightPropMap, dbChar?.vision ?? null),
          constellations: avatar.talentIdList?.length ?? 0,
          talentLevels: Object.values(avatar.skillLevelMap ?? {}).slice(0, 3),
          weapon: equipParsed.weapon,
          artifacts: equipParsed.artifacts,
          totalCritValue: equipParsed.totalCritValue,
          totalRollValue: equipParsed.totalRollValue,
          totalCvRating: equipParsed.totalCvRating,
          activeSetSummary: equipParsed.activeSetSummary,
        };
      });

      const pInfo = enkaData.playerInfo;
      const spiralAbyss = pInfo.towerFloorIndex
        ? `Tầng ${pInfo.towerFloorIndex}-${pInfo.towerLevelIndex ?? 0}`
        : null;

      const result: EnkaShowcaseResult = {
        playerInfo: {
          nickname: pInfo.nickname,
          arLevel: pInfo.level,
          worldLevel: pInfo.worldLevel ?? 0,
          signature: pInfo.signature ?? "",
          achievements: pInfo.finishAchievementNum ?? null,
          spiralAbyss,
        },
        showcaseCharacters,
        ttl: enkaData.ttl ?? 60,
        fetchedAt: new Date().toISOString(),
      };

      uidMemoryCache.set(uid, { timestamp: Date.now(), payload: result });
      if (uidMemoryCache.size > 200) {
        const oldestKey = uidMemoryCache.keys().next().value;
        if (oldestKey) uidMemoryCache.delete(oldestKey);
      }

      return ok(result, { maxAgeSec: 60 });
    },
    { prefix: "enka-sync", limit: 30, window: "60 s" }
  )
);
