import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export const domainsRepository = {
  async list(params: {
    where: Prisma.DomainWhereInput;
    orderBy: Prisma.DomainOrderByWithRelationInput[];
    skip: number;
    take: number;
  }) {
    const [items, total] = await Promise.all([
      prisma.domain.findMany({
        where: params.where,
        orderBy: params.orderBy,
        skip: params.skip,
        take: params.take,
      }),
      prisma.domain.count({ where: params.where }),
    ]);

    return { items, total };
  },

  async getById(id: string) {
    return prisma.domain.findUnique({ where: { id } });
  },
};
