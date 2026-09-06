import { Prisma } from "@prisma/client";
import { charactersRepository } from "./repository";

export type CharacterListArgs = {
  where: Prisma.CharacterWhereInput;
  orderBy: Prisma.CharacterOrderByWithRelationInput[];
  skip: number;
  take: number;
  select: Prisma.CharacterSelect;
};

export class CharactersService {
  async list(args: CharacterListArgs) {
    const result = await charactersRepository.list(args);
    return result;
  }

  async getById(id: string) {
    return charactersRepository.getById(id);
  }
}
