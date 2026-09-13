import { Prisma } from "@prisma/client";
import { weaponsRepository } from "./repository";

export type WeaponListArgs = {
  where: Prisma.WeaponWhereInput;
  orderBy: Prisma.WeaponOrderByWithRelationInput[];
  skip: number;
  take: number;
  select: Prisma.WeaponSelect;
};

export class WeaponsService {
  async list(args: WeaponListArgs) {
    return weaponsRepository.list(args);
  }

  async getById(id: string) {
    return weaponsRepository.getById(id);
  }
}
