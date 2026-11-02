import { prisma } from "@/lib/db/prisma";
import { PLAYABLE_CHARACTER_FILTER } from "@/core/game/character-catalog";
import {
  buildArtifactSearchWhere,
  buildCharacterSearchWhereForLocale,
  buildDomainSearchWhere,
  buildMaterialSearchWhere,
  buildWeaponSearchWhereForLocale,
} from "./query";

/**
 * Search aliases from fields already stored in the database. Keeping the
 * large genshin-db dataset out of this runtime avoids bundling its 178 MB
 * JSON file into the server function.
 */
export const searchRepository = {
  async searchCharacters(query: string, limit: number, locale: string) {
    return prisma.character.findMany({
      where: {
        AND: [PLAYABLE_CHARACTER_FILTER, buildCharacterSearchWhereForLocale(query, locale)],
      },
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
      take: limit,
      select: {
        id: true,
        name: true,
        nameTranslations: true,
        vision: true,
        weaponType: true,
        rarity: true,
        iconUrl: true,
        elementIcon: true,
      },
    });
  },

  async searchWeapons(query: string, limit: number, locale: string) {
    return prisma.weapon.findMany({
      where: buildWeaponSearchWhereForLocale(query, locale),
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
      take: limit,
      select: {
        id: true,
        name: true,
        nameTranslations: true,
        type: true,
        rarity: true,
        iconUrl: true,
      },
    });
  },

  async searchArtifacts(query: string, limit: number, locale: string) {
    return prisma.artifactSet.findMany({
      where: buildArtifactSearchWhere(query, locale),
      orderBy: { name: "asc" },
      take: limit,
      select: {
        id: true,
        name: true,
        nameTranslations: true,
        rarityRange: true,
        iconUrl: true,
      },
    });
  },

  async searchDomains(query: string, limit: number, locale: string) {
    return prisma.domain.findMany({
      where: buildDomainSearchWhere(query, locale),
      orderBy: { name: "asc" },
      take: limit,
      select: {
        id: true,
        name: true,
        nameTranslations: true,
        category: true,
        imageUrl: true,
        imageUrlOriginal: true,
      },
    });
  },

  async searchMaterials(query: string, limit: number, locale: string) {
    return prisma.material.findMany({
      where: buildMaterialSearchWhere(query, locale),
      orderBy: { name: "asc" },
      take: limit,
      select: {
        id: true,
        name: true,
        nameTranslations: true,
        iconUrl: true,
        iconUrlOriginal: true,
      },
    });
  },
};