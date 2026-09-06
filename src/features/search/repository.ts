import { prisma } from "@/lib/db/prisma";

export const searchRepository = {
  async searchCharacters(query: string, limit: number) {
    return prisma.character.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
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
      where: { name: { contains: query, mode: "insensitive" } },
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
