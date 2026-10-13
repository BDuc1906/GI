import type { NextRequest } from "next/server";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";

export const revalidate = 60;
export const dynamic = "force-dynamic";

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
// Public output type
// ---------------------------------------------------------------------------

export interface EnkaFightProps {
  hp: number;
  atk: number;
  def: number;
  critRate: number;
  critDmg: number;
  em: number;
  er: number;
}

export interface EnkaArtifactPiece {
  slot: "flower" | "plume" | "sands" | "goblet" | "circlet";
  slotName: string;
  name: string;
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
  }>;
  critRate: number;
  critDmg: number;
  critValue: number;
  cvRating: "Kỳ Lân (Unicorn)" | "Cực Phẩm (God Roll)" | "Rất Tốt (Great)" | "Khá (Good)" | "Bình Thường";
}

export interface EnkaWeaponInfo {
  name: string;
  iconUrl: string | null;
  level: number;
  refinement: number;
  rarity: number;
}

export interface EnkaShowcaseCharacter {
  /** slug từ DB (Character.id) — null nếu chưa map được */
  characterId: string | null;
  characterName: string | null;
  iconUrl: string | null;
  /** Enka avatarId gốc để debug */
  avatarId: number;
  level: number;
  fightProps: EnkaFightProps;
  constellations: number;
  talentLevels: number[];
  weapon: EnkaWeaponInfo | null;
  artifacts: EnkaArtifactPiece[];
  totalCritValue: number;
  totalCvRating: "Đỉnh Cao (Top 1%)" | "Cực Phẩm (Endgame)" | "Chuẩn Thi Đấu" | "Đang Hoàn Thiện";
}

export interface EnkaShowcaseResult {
  playerInfo: {
    nickname: string;
    arLevel: number;
    worldLevel: number;
    signature: string;
  };
  showcaseCharacters: EnkaShowcaseCharacter[];
  ttl: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parse level từ propMap["4001"] */
function parseLevel(propMap: EnkaAvatarInfo["propMap"]): number {
  const raw = propMap?.["4001"]?.val ?? propMap?.["4001"]?.ival;
  return raw ? parseInt(raw, 10) : 1;
}

function parseFightProps(fp: EnkaFightPropMap | undefined): EnkaFightProps {
  return {
    hp: Math.round(fp?.["2000"] ?? 0),
    atk: Math.round(fp?.["2001"] ?? 0),
    def: Math.round(fp?.["2002"] ?? 0),
    critRate: parseFloat(((fp?.["20"] ?? 0) * 100).toFixed(1)),
    critDmg: parseFloat(((fp?.["22"] ?? 0) * 100).toFixed(1)),
    em: Math.round(fp?.["28"] ?? 0),
    er: parseFloat(((fp?.["23"] ?? 1) * 100).toFixed(1)),
  };
}

const PROP_LABELS: Record<string, string> = {
  FIGHT_PROP_HP: "HP",
  FIGHT_PROP_HP_PERCENT: "HP%",
  FIGHT_PROP_ATTACK: "Tấn Công",
  FIGHT_PROP_ATTACK_PERCENT: "Tấn Công%",
  FIGHT_PROP_DEFENSE: "Phòng Ngự",
  FIGHT_PROP_DEFENSE_PERCENT: "Phòng Ngự%",
  FIGHT_PROP_CRITICAL: "Tỉ Lệ Bạo",
  FIGHT_PROP_CRITICAL_HURT: "ST Bạo Kích",
  FIGHT_PROP_CHARGE_EFFICIENCY: "Hiệu Quả Nạp",
  FIGHT_PROP_ELEMENT_MASTERY: "Tinh Thông Nguyên Tố",
  FIGHT_PROP_FIRE_ADD_HURT: "ST Hỏa%",
  FIGHT_PROP_WATER_ADD_HURT: "ST Thủy%",
  FIGHT_PROP_WIND_ADD_HURT: "ST Phong%",
  FIGHT_PROP_ELEC_ADD_HURT: "ST Lôi%",
  FIGHT_PROP_GRASS_ADD_HURT: "ST Thảo%",
  FIGHT_PROP_ICE_ADD_HURT: "ST Băng%",
  FIGHT_PROP_ROCK_ADD_HURT: "ST Nham%",
  FIGHT_PROP_PHYSICAL_ADD_HURT: "ST Vật Lý%",
  FIGHT_PROP_HEAL_ADD: "Tăng Trị Liệu%",
};

const EQUIP_SLOT_MAP: Record<string, { slot: EnkaArtifactPiece["slot"]; slotName: string }> = {
  EQUIP_BRACER: { slot: "flower", slotName: "Hoa Sự Sống" },
  EQUIP_NECKLACE: { slot: "plume", slotName: "Lông Vũ Tử Vong" },
  EQUIP_SHOES: { slot: "sands", slotName: "Cát Thời Gian" },
  EQUIP_RING: { slot: "goblet", slotName: "Ly Không Gian" },
  EQUIP_DRESS: { slot: "circlet", slotName: "Nón Lý Trí" },
};

function formatStatValue(prop: string, val: number): string {
  if (
    prop.includes("PERCENT") ||
    prop.includes("CRITICAL") ||
    prop.includes("EFFICIENCY") ||
    prop.includes("ADD_HURT") ||
    prop.includes("HEAL")
  ) {
    return `${val.toFixed(1)}%`;
  }
  return String(Math.round(val));
}

function parseEquipList(equipList: unknown[] | undefined): {
  weapon: EnkaWeaponInfo | null;
  artifacts: EnkaArtifactPiece[];
  totalCritValue: number;
  totalCvRating: EnkaShowcaseCharacter["totalCvRating"];
} {
  let weapon: EnkaWeaponInfo | null = null;
  const artifacts: EnkaArtifactPiece[] = [];

  if (!Array.isArray(equipList)) {
    return {
      weapon: null,
      artifacts: [],
      totalCritValue: 0,
      totalCvRating: "Đang Hoàn Thiện",
    };
  }

  for (const rawItem of equipList) {
    if (!rawItem || typeof rawItem !== "object") continue;
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

      const mainstat = flat.reliquaryMainstat as { mainPropId: string; statValue: number } | undefined;
      const substatsRaw = (flat.reliquarySubstats as Array<{ appendPropId: string; statValue: number }>) ?? [];

      let pieceCritRate = 0;
      let pieceCritDmg = 0;

      const parsedSubstats = substatsRaw.map((sub) => {
        if (sub.appendPropId === "FIGHT_PROP_CRITICAL") {
          pieceCritRate = sub.statValue;
        } else if (sub.appendPropId === "FIGHT_PROP_CRITICAL_HURT") {
          pieceCritDmg = sub.statValue;
        }
        return {
          prop: sub.appendPropId,
          label: PROP_LABELS[sub.appendPropId] ?? sub.appendPropId,
          value: formatStatValue(sub.appendPropId, sub.statValue),
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
        cvRating,
      });
    }
  }

  // Sắp xếp thánh di vật theo thứ tự chuẩn in-game: Flower -> Plume -> Sands -> Goblet -> Circlet
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

  let totalCvRating: EnkaShowcaseCharacter["totalCvRating"] = "Đang Hoàn Thiện";
  if (totalCritValue >= 220) totalCvRating = "Đỉnh Cao (Top 1%)";
  else if (totalCritValue >= 180) totalCvRating = "Cực Phẩm (Endgame)";
  else if (totalCritValue >= 140) totalCvRating = "Chuẩn Thi Đấu";

  return {
    weapon,
    artifacts,
    totalCritValue,
    totalCvRating,
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export const GET = withErrorHandling(
  withRateLimit(
    async (req: NextRequest, ctx) => {
      const { uid } = await ctx.params;

      // Validate UID: 9 chữ số, không âm
      if (!/^\d{9}$/.test(uid)) {
        throw ApiError.badRequest("UID không hợp lệ. UID phải gồm đúng 9 chữ số.");
      }

      // Gọi Enka.Network public API
      const enkaUrl = `https://enka.network/api/uid/${uid}`;
      let enkaData: EnkaApiResponse;
      try {
        const resp = await fetch(enkaUrl, {
          headers: {
            // Identify ourselves politely
            "User-Agent": "LEIBO-GenshinDB/1.0 (https://leibo.gg)",
          },
          // Next.js fetch cache — revalidate theo TTL Enka trả về (fallback 60s)
          next: { revalidate: 60 },
        });

        if (resp.status === 400) {
          throw ApiError.badRequest("UID không tồn tại hoặc không hợp lệ theo Enka.Network.");
        }
        if (resp.status === 404) {
          throw ApiError.notFound("Không tìm thấy người chơi với UID này trên Enka.Network.");
        }
        if (resp.status === 424) {
          throw new ApiError(503, "GAME_MAINTENANCE", "Game đang bảo trì, thử lại sau.");
        }
        if (resp.status === 429) {
          throw new ApiError(429, "ENKA_RATE_LIMITED", "Đang bị rate limit bởi Enka.Network, vui lòng thử lại sau 1 giây.");
        }
        if (!resp.ok) {
          throw new ApiError(502, "ENKA_UPSTREAM_ERROR", `Enka.Network trả lỗi ${resp.status}.`);
        }

        enkaData = (await resp.json()) as EnkaApiResponse;
      } catch (err) {
        if (err instanceof ApiError) throw err;
        throw new ApiError(502, "ENKA_FETCH_FAILED", "Không thể kết nối tới Enka.Network.");
      }

      const avatarInfoList = enkaData.avatarInfoList ?? [];

      // Lấy tất cả genshinDbId từ DB để map avatarId -> Character
      // Character.raw chứa field `id` hoặc `id` trong object gốc genshin-db
      // Enka avatarId = 10000000 + genshinDbId offset trong nhiều trường hợp
      // Cách đáng tin cậy nhất: lưu avatarId vào Character.raw khi seed, hoặc
      // dùng offset = avatarId - 10000000 để map sang genshinDbId.
      // Theo genshin-db, genshinDbId khớp với avatarId (không cần offset).
      const avatarIds = avatarInfoList.map((a) => String(a.avatarId));

      // Thử match theo genshinDbId trước
      const charactersByGenshinDbId = await prisma.character.findMany({
        where: { genshinDbId: { in: avatarIds } },
        select: { id: true, name: true, iconUrl: true, genshinDbId: true },
      });
      const dbMapByGenshinId = new Map(
        charactersByGenshinDbId.map((c) => [c.genshinDbId!, c])
      );

      // Fallback: thử map theo offset (avatarId - 10000000) nếu genshinDbId không match
      const unmatchedAvatarIds = avatarInfoList
        .filter((a) => !dbMapByGenshinId.has(String(a.avatarId)))
        .map((a) => a.avatarId);

      const offsetIds = unmatchedAvatarIds.map((id) => String(id - 10000000));
      const charactersByOffset = offsetIds.length > 0
        ? await prisma.character.findMany({
            where: { genshinDbId: { in: offsetIds } },
            select: { id: true, name: true, iconUrl: true, genshinDbId: true },
          })
        : [];

      // Build final map: avatarId (string) -> character
      const finalMap = new Map<string, { id: string; name: string; iconUrl: string | null }>();
      for (const c of charactersByGenshinDbId) {
        finalMap.set(String(c.genshinDbId), c);
      }
      for (const c of charactersByOffset) {
        if (c.genshinDbId) {
          const recoveredAvatarId = String(parseInt(c.genshinDbId, 10) + 10000000);
          finalMap.set(recoveredAvatarId, c);
        }
      }

      // Map avatarInfoList -> EnkaShowcaseCharacter[]
      const showcaseCharacters: EnkaShowcaseCharacter[] = avatarInfoList.map((avatar) => {
        const dbChar = finalMap.get(String(avatar.avatarId)) ?? null;
        const equipParsed = parseEquipList(avatar.equipList);

        return {
          characterId: dbChar?.id ?? null,
          characterName: dbChar?.name ?? null,
          iconUrl: dbChar?.iconUrl ?? null,
          avatarId: avatar.avatarId,
          level: parseLevel(avatar.propMap),
          fightProps: parseFightProps(avatar.fightPropMap),
          constellations: avatar.talentIdList?.length ?? 0,
          talentLevels: Object.values(avatar.skillLevelMap ?? {}).slice(0, 3),
          weapon: equipParsed.weapon,
          artifacts: equipParsed.artifacts,
          totalCritValue: equipParsed.totalCritValue,
          totalCvRating: equipParsed.totalCvRating,
        };
      });

      const result: EnkaShowcaseResult = {
        playerInfo: {
          nickname: enkaData.playerInfo.nickname,
          arLevel: enkaData.playerInfo.level,
          worldLevel: enkaData.playerInfo.worldLevel ?? 0,
          signature: enkaData.playerInfo.signature ?? "",
        },
        showcaseCharacters,
        ttl: enkaData.ttl ?? 60,
      };

      return ok(result, { maxAgeSec: 60 });
    },
    { prefix: "enka-sync", limit: 30, window: "60 s" }
  )
);
