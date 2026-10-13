import { prisma } from "@/lib/db/prisma";

export interface SimilarCharacterSummary {
  id: string;
  name: string;
  vision: string;
  rarity: number;
  iconUrl: string | null;
  iconUrlOriginal: string | null;
  shared: string;
}

export async function getSimilarCharacters(characterId: string): Promise<{
  sameElement: SimilarCharacterSummary[];
  all: SimilarCharacterSummary[];
}> {
  const current = await prisma.character.findUnique({
    where: { id: characterId },
    select: { id: true, vision: true }
  });

  if (!current) {
    return { sameElement: [], all: [] };
  }

  const matches = await prisma.character.findMany({
    where: { id: { not: characterId } },
    select: {
      id: true,
      name: true,
      vision: true,
      rarity: true,
      iconUrl: true,
      iconUrlOriginal: true,
      weaponType: true,
    },
    orderBy: [{ vision: "asc" }, { rarity: "desc" }, { name: "asc" }],
    take: 12,
  });

  const normalize = (entry: (typeof matches)[number]): SimilarCharacterSummary => ({
    id: entry.id,
    name: entry.name,
    vision: entry.vision,
    rarity: entry.rarity,
    iconUrl: entry.iconUrl,
    iconUrlOriginal: entry.iconUrlOriginal,
    shared: `${entry.vision} · ${entry.weaponType}`,
  });

  const sameElement = matches
    .filter((entry) => entry.vision === current.vision)
    .slice(0, 6)
    .map(normalize);

  return {
    sameElement,
    all: matches.slice(0, 6).map(normalize),
  };
}
