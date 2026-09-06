import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export const weaponsRepository = {
  async list(params: {
    where: Prisma.WeaponWhereInput;
    orderBy: Prisma.WeaponOrderByWithRelationInput[];
    skip: number;
    take: number;
    select: Prisma.WeaponSelect;
  }) {
    const [items, total] = await Promise.all([
      prisma.weapon.findMany({
        where: params.where,
        orderBy: params.orderBy,
        skip: params.skip,
        take: params.take,
        select: params.select,
      }),
      prisma.weapon.count({ where: params.where }),
    ]);

    return { items, total };
  },

  async getById(id: string) {
    return prisma.weapon.findUnique({ where: { id } });
  },
};
