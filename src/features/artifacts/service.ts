import { Prisma } from "@prisma/client";
import { artifactsRepository } from "./repository";

export type ArtifactListArgs = {
  where: Prisma.ArtifactSetWhereInput;
  orderBy: Prisma.ArtifactSetOrderByWithRelationInput[];
  skip: number;
  take: number;
  select: Prisma.ArtifactSetSelect;
};

export class ArtifactsService {
  async list(args: ArtifactListArgs) {
    return artifactsRepository.list(args);
  }

  async getById(id: string) {
    return artifactsRepository.getById(id);
  }
}
