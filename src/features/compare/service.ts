import { prisma } from "@/lib/db/prisma";
import type { CompareItem, CompareRequest } from "./types";

export class CompareService {
  async compare(input: CompareRequest): Promise<CompareItem[]> {
    if (!input.ids.length) {
      return [];
    }

    if (input.entity === "characters") {
      const items = await prisma.character.findMany({
        where: { id: { in: input.ids } },
        select: {
          id: true,
          name: true,
          vision: true,
          weaponType: true,
          rarity: true,
        },
      });

      return items.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.weaponType,
        rarity: item.rarity,
        vision: item.vision,
      }));
    }

    if (input.entity === "weapons") {
      const items = await prisma.weapon.findMany({
        where: { id: { in: input.ids } },
        select: {
          id: true,
          name: true,
          type: true,
          rarity: true,
        },
      });

      return items.map((item) => ({
        id: item.id,
        name: item.name,
        type: item.type,
        rarity: item.rarity,
      }));
    }

    const items = await prisma.artifactSet.findMany({
      where: { id: { in: input.ids } },
      select: {
        id: true,
        name: true,
        rarityRange: true,
      },
    });

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      type: item.rarityRange.join(", "),
      rarity: item.rarityRange[0] ?? null,
    }));
  }
}
