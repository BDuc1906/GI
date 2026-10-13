/**
 * React.cache() wrappers cho các Prisma entity lookup hay bị gọi nhiều lần
 * trong cùng 1 SSR request (vd: generateMetadata() + page component đều
 * gọi findUnique({ where: { id } }) cho cùng 1 character/weapon/artifact).
 *
 * React.cache() deduplicates: mọi call cùng args trong cùng render tree chỉ
 * thật sự chạy query 1 lần, các call sau nhận kết quả từ memory.
 * Cache này tự động flush sau mỗi request — KHÔNG cache cross-request.
 *
 * Import và dùng thay thế trực tiếp cho prisma.X.findUnique({ where: { id } })
 * trong các page.tsx và opengraph-image.tsx.
 */

import { cache } from "react";
import { prisma } from "./prisma";

/**
 * Cached findUnique cho Character theo id slug.
 * Tự động bỏ qua traveler placeholder (manekin/manekina) giống repository.ts.
 */
export const getCharacterById = cache(async (id: string) => {
  if (id === "manekin" || id === "manekina") return null;
  return prisma.character.findUnique({ where: { id } });
});

/**
 * Cached findUnique cho Weapon theo id slug.
 */
export const getWeaponById = cache(async (id: string) => {
  return prisma.weapon.findUnique({ where: { id } });
});

/**
 * Cached findUnique cho ArtifactSet theo id slug.
 */
export const getArtifactSetById = cache(async (id: string) => {
  return prisma.artifactSet.findUnique({ where: { id } });
});

/**
 * Cached findUnique cho Material theo id slug.
 */
export const getMaterialById = cache(async (id: string) => {
  return prisma.material.findUnique({ where: { id } });
});

/**
 * Cached findUnique cho Enemy theo id slug.
 */
export const getEnemyById = cache(async (id: string) => {
  return prisma.enemy.findUnique({ where: { id } });
});

/**
 * Cached findUnique cho Food/Recipe theo id slug.
 */
export const getFoodById = cache(async (id: string) => {
  return prisma.food.findUnique({ where: { id } });
});

/**
 * Cached findUnique cho Domain theo id slug.
 */
export const getDomainById = cache(async (id: string) => {
  return prisma.domain.findUnique({ where: { id } });
});
