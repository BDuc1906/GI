import type { Prisma } from "@prisma/client";
import type { CharacterListingFilters } from "./query-params";

/** Chuyển filter đã parse từ URL thành Prisma where-clause. */
export function buildCharacterWhere(filters: CharacterListingFilters): Prisma.CharacterWhereInput {
  const where: Prisma.CharacterWhereInput = {};
  if (filters.vision.length > 0) where.vision = { in: filters.vision, mode: "insensitive" };
  if (filters.weapon.length > 0) where.weaponType = { in: filters.weapon, mode: "insensitive" };
  if (filters.region.length > 0) where.region = { in: filters.region, mode: "insensitive" };
  if (filters.rarity.length > 0) where.rarity = { in: filters.rarity };
  if (filters.q) where.name = { contains: filters.q, mode: "insensitive" };
  return where;
}
