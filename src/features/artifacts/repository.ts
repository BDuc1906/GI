import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export const artifactsRepository = {
  async list(params: {
    where: Prisma.ArtifactSetWhereInput;
    orderBy: Prisma.ArtifactSetOrderByWithRelationInput[];
    skip: number;
    take: number;
    select: Prisma.ArtifactSetSelect;
  }) {
    const [items, total] = await Promise.all([
      prisma.artifactSet.findMany({
        where: params.where,
        orderBy: params.orderBy,
        skip: params.skip,
        take: params.take,
        select: params.select,
      }),
      prisma.artifactSet.count({ where: params.where }),
    ]);

    return { items, total };
  },

  async getById(id: string) {
    return prisma.artifactSet.findUnique({ where: { id } });
  },
};
