import { prisma } from "@/lib/db/prisma";
import type { BuildRecommendation, BuildRecommendationRequest } from "./types";

export class BuildService {
  async recommend(input: BuildRecommendationRequest): Promise<BuildRecommendation> {
    const character = await prisma.character.findUnique({
      where: { id: input.characterId },
      select: {
        id: true,
        name: true,
        vision: true,
        weaponType: true,
        rarity: true,
      },
    });

    if (!character) {
      throw new Error(`Không tìm thấy nhân vật với id: ${input.characterId}`);
    }

    const weapon = input.weaponId
      ? await prisma.weapon.findUnique({
          where: { id: input.weaponId },
          select: {
            id: true,
            name: true,
            type: true,
            rarity: true,
          },
        })
      : await prisma.weapon.findFirst({
          where: {
            type: character.weaponType ?? undefined,
            rarity: character.rarity ?? undefined,
          },
          orderBy: [{ rarity: "desc" }, { name: "asc" }],
          select: {
            id: true,
            name: true,
            type: true,
            rarity: true,
          },
        });

    const summary = `Build gợi ý cho ${character.name}: ưu tiên ${character.vision ?? "khác"} với ${weapon?.name ?? "vũ khí phù hợp"} để hỗ trợ playstyle ${character.weaponType ?? "chung"}.`;

    return {
      characterId: character.id,
      characterName: character.name,
      vision: character.vision,
      weaponType: character.weaponType,
      recommendedWeapon: weapon
        ? {
            id: weapon.id,
            name: weapon.name,
            type: weapon.type,
            rarity: weapon.rarity,
          }
        : null,
      summary,
    };
  }
}
