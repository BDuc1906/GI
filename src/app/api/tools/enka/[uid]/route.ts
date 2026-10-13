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

        return {
          characterId: dbChar?.id ?? null,
          characterName: dbChar?.name ?? null,
          iconUrl: dbChar?.iconUrl ?? null,
          avatarId: avatar.avatarId,
          level: parseLevel(avatar.propMap),
          fightProps: parseFightProps(avatar.fightPropMap),
          constellations: avatar.talentIdList?.length ?? 0,
          talentLevels: Object.values(avatar.skillLevelMap ?? {}).slice(0, 3),
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
