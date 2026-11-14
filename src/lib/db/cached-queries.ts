/**
 * src/lib/db/cached-queries.ts
 *
 * Tối ưu hóa hiệu năng 2 tầng (Two-Tier Caching):
 * 1. React.cache(): Khử trùng lặp (deduplication) trong cùng 1 SSR render cycle
 *    (generateMetadata + page component gọi cùng id sẽ chỉ chạy 1 lần).
 * 2. Next.js unstable_cache(): Bộ đệm dữ liệu liên request (Cross-Request Data Cache).
 *    Một khi dữ liệu của nhân vật, vũ khí, thánh di vật đã được nạp lần đầu từ PostgreSQL,
 *    các lần truy cập tiếp theo của bất kỳ người dùng nào sẽ được phục vụ TỨC THÌ (0ms - 2ms)
 *    từ RAM/Disk cache mà không cần truy vấn lại database.
 */

import { cache } from "react";
import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";
import { PLAYABLE_CHARACTER_FILTER } from "@/core/game/character-catalog";

/**
 * Cached findUnique cho Character theo id slug.
 */
const getCachedCharacter = unstable_cache(
  async (id: string) => prisma.character.findUnique({ where: { id } }),
  ["cached-character-by-id"],
  { revalidate: 86400, tags: ["characters"] }
);

export const getCharacterById = cache(async (id: string) => {
  if (id === "manekin" || id === "manekina") return null;
  return getCachedCharacter(id);
});

/**
 * Cached findUnique cho Weapon theo id slug.
 */
const getCachedWeapon = unstable_cache(
  async (id: string) => prisma.weapon.findUnique({ where: { id } }),
  ["cached-weapon-by-id"],
  { revalidate: 86400, tags: ["weapons"] }
);

export const getWeaponById = cache(async (id: string) => {
  return getCachedWeapon(id);
});

/**
 * Cached findUnique cho ArtifactSet theo id slug.
 */
const getCachedArtifactSet = unstable_cache(
  async (id: string) => prisma.artifactSet.findUnique({ where: { id } }),
  ["cached-artifact-by-id"],
  { revalidate: 86400, tags: ["artifacts"] }
);

export const getArtifactSetById = cache(async (id: string) => {
  return getCachedArtifactSet(id);
});

/**
 * Cached findUnique cho Material theo id slug.
 */
const getCachedMaterial = unstable_cache(
  async (id: string) => prisma.material.findUnique({ where: { id } }),
  ["cached-material-by-id"],
  { revalidate: 86400, tags: ["materials"] }
);

export const getMaterialById = cache(async (id: string) => {
  return getCachedMaterial(id);
});

/**
 * Cached findUnique cho Enemy theo id slug.
 */
const getCachedEnemy = unstable_cache(
  async (id: string) => prisma.enemy.findUnique({ where: { id } }),
  ["cached-enemy-by-id"],
  { revalidate: 86400, tags: ["enemies"] }
);

export const getEnemyById = cache(async (id: string) => {
  return getCachedEnemy(id);
});

/**
 * Cached findUnique cho Food/Recipe theo id slug.
 */
const getCachedFood = unstable_cache(
  async (id: string) => prisma.food.findUnique({ where: { id } }),
  ["cached-food-by-id"],
  { revalidate: 86400, tags: ["foods"] }
);

export const getFoodById = cache(async (id: string) => {
  return getCachedFood(id);
});

/**
 * Cached findUnique cho Domain theo id slug.
 */
const getCachedDomain = unstable_cache(
  async (id: string) => prisma.domain.findUnique({ where: { id } }),
  ["cached-domain-by-id"],
  { revalidate: 86400, tags: ["domains"] }
);

export const getDomainById = cache(async (id: string) => {
  return getCachedDomain(id);
});

/**
 * Cached danh sách nguyên liệu theo mảng IDs — dùng cho bảng Đột phá & Thiên phú
 */
export const getCachedMaterialsByIds = unstable_cache(
  async (ids: string[]) => {
    if (!ids.length) return [];
    return prisma.material.findMany({
      where: { id: { in: ids } },
      select: { id: true, iconUrl: true, name: true, nameTranslations: true },
    });
  },
  ["cached-materials-by-ids"],
  { revalidate: 86400, tags: ["materials"] }
);

/**
 * Cached toàn bộ danh sách tóm tắt nhân vật chơi được — dùng cho Team Variants & Similar section
 */
export const getCachedAllPlayableCharacters = unstable_cache(
  async () =>
    prisma.character.findMany({
      where: PLAYABLE_CHARACTER_FILTER,
      select: {
        id: true,
        name: true,
        nameTranslations: true,
        vision: true,
        rarity: true,
        iconUrl: true,
      },
    }),
  ["cached-all-playable-characters-summary"],
  { revalidate: 86400, tags: ["characters"] }
);
