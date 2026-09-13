import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export const charactersRepository = {
  async list(params: {
    where: Prisma.CharacterWhereInput;
    orderBy: Prisma.CharacterOrderByWithRelationInput[];
    skip: number;
    take: number;
    select: Prisma.CharacterSelect;
  }) {
    const [items, total] = await Promise.all([
      prisma.character.findMany({
        where: params.where,
        orderBy: params.orderBy,
        skip: params.skip,
        take: params.take,
        select: params.select,
      }),
      prisma.character.count({ where: params.where }),
    ]);

    return { items, total };
  },

  async getById(id: string) {
    return prisma.character.findUnique({ where: { id } });
  },
};
