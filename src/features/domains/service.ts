import { Prisma } from "@prisma/client";
import { domainsRepository } from "./repository";

export type DomainListArgs = {
  where: Prisma.DomainWhereInput;
  orderBy: Prisma.DomainOrderByWithRelationInput[];
  skip: number;
  take: number;
};

export class DomainsService {
  async list(args: DomainListArgs) {
    return domainsRepository.list(args);
  }

  async getById(id: string) {
    return domainsRepository.getById(id);
  }
}
