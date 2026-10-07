import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { PLAYABLE_CHARACTER_FILTER } from "@/core/game/character-catalog";

export const charactersRepository = {
  async list(params: {
    where: Prisma.CharacterWhereInput;
    orderBy: Prisma.CharacterOrderByWithRelationInput[];
    skip: number;
    take: number;
    select: Prisma.CharacterSelect;
  }) {
    const where: Prisma.CharacterWhereInput = {
      AND: [params.where, PLAYABLE_CHARACTER_FILTER],
    };
    const [items, total] = await Promise.all([
      prisma.character.findMany({
        where,
        orderBy: params.orderBy,
        skip: params.skip,
        take: params.take,
        select: params.select,
      }),
      prisma.character.count({ where }),
    ]);

    return { items, total };
  },

  async getById(id: string) {
    if (id === "manekin" || id === "manekina") return null;
    return prisma.character.findUnique({ where: { id } });
  },
};
