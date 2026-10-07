import { prisma } from "@/lib/db/prisma";
import { PLAYABLE_CHARACTER_FILTER } from "@/core/game/character-catalog";
import { buildCharacterSearchWhere, buildWeaponSearchWhere } from "./query";

/**
 * Search aliases from fields already stored in the database. Keeping the
 * large genshin-db dataset out of this runtime avoids bundling its 178 MB
 * JSON file into the server function.
 */
export const searchRepository = {
  async searchCharacters(query: string, limit: number) {
    return prisma.character.findMany({
      where: {
        AND: [PLAYABLE_CHARACTER_FILTER, buildCharacterSearchWhere(query)],
      },
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
      take: limit,
      select: {
        id: true,
        name: true,
        vision: true,
        weaponType: true,
        rarity: true,
        iconUrl: true,
        elementIcon: true,
      },
    });
  },

  async searchWeapons(query: string, limit: number) {
    return prisma.weapon.findMany({
      where: buildWeaponSearchWhere(query),
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
      take: limit,
      select: {
        id: true,
        name: true,
        type: true,
        rarity: true,
        iconUrl: true,
      },
    });
  },

  async searchArtifacts(query: string, limit: number) {
    return prisma.artifactSet.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      orderBy: { name: "asc" },
      take: limit,
      select: {
        id: true,
        name: true,
        rarityRange: true,
        iconUrl: true,
      },
    });
  },

  async searchDomains(query: string, limit: number) {
    return prisma.domain.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      orderBy: { name: "asc" },
      take: limit,
      select: {
        id: true,
        name: true,
        category: true,
        imageUrl: true,
      },
    });
  },
};