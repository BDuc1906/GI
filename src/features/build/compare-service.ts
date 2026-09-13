import { prisma } from "@/lib/db/prisma";
import type { BuildComparison, CharacterComparison } from "./compare-types";

export class BuildCompareService {
  async compare(characterId1: string, characterId2: string): Promise<BuildComparison> {
    const [char1, char2] = await Promise.all([
      prisma.character.findUnique({
        where: { id: characterId1 },
        select: {
          id: true,
          name: true,
          vision: true,
          weaponType: true,
          rarity: true,
          baseHp: true,
          baseAtk: true,
          baseDef: true,
        },
      }),
      prisma.character.findUnique({
        where: { id: characterId2 },
        select: {
          id: true,
          name: true,
          vision: true,
          weaponType: true,
          rarity: true,
          baseHp: true,
          baseAtk: true,
          baseDef: true,
        },
      }),
    ]);

    if (!char1 || !char2) {
      throw new Error("Không tìm thấy một hoặc cả hai nhân vật để so sánh");
    }

    const c1: CharacterComparison = {
      id: char1.id,
      name: char1.name,
      vision: char1.vision,
      weaponType: char1.weaponType,
      rarity: char1.rarity,
      baseHp: char1.baseHp,
      baseAtk: char1.baseAtk,
      baseDef: char1.baseDef,
    };

    const c2: CharacterComparison = {
      id: char2.id,
      name: char2.name,
      vision: char2.vision,
      weaponType: char2.weaponType,
      rarity: char2.rarity,
      baseHp: char2.baseHp,
      baseAtk: char2.baseAtk,
      baseDef: char2.baseDef,
    };

    const similarities = {
      sameVision: c1.vision === c2.vision,
      sameWeaponType: c1.weaponType === c2.weaponType,
    };

    const differences = {
      rarityDiff: Math.abs((c1.rarity ?? 0) - (c2.rarity ?? 0)),
      atkDiff: Math.abs((c1.baseAtk ?? 0) - (c2.baseAtk ?? 0)),
      hpDiff: Math.abs((c1.baseHp ?? 0) - (c2.baseHp ?? 0)),
      defDiff: Math.abs((c1.baseDef ?? 0) - (c2.baseDef ?? 0)),
    };

    const recommendation = this.generateComparison(c1, c2, similarities, differences);

    return {
      character1: c1,
      character2: c2,
      similarities,
      differences,
      recommendation,
    };
  }

  private generateComparison(
    c1: CharacterComparison,
    c2: CharacterComparison,
    similarities: { sameVision: boolean; sameWeaponType: boolean },
    differences: { rarityDiff: number; atkDiff: number; hpDiff: number; defDiff: number }
  ): string {
    const parts: string[] = [];

    if (similarities.sameVision && similarities.sameWeaponType) {
      parts.push(`${c1.name} và ${c2.name} là những nhân vật tương tự nhau.`);
    } else {
      parts.push(`${c1.name} và ${c2.name} có phong cách chơi khác biệt.`);
    }

    if (differences.atkDiff > 50) {
      const higher = (c1.baseAtk ?? 0) > (c2.baseAtk ?? 0) ? c1.name : c2.name;
      parts.push(`${higher} có ATK cao hơn đáng kể.`);
    }

    if (differences.hpDiff > 100) {
      const higher = (c1.baseHp ?? 0) > (c2.baseHp ?? 0) ? c1.name : c2.name;
      parts.push(`${higher} có HP cao hơn, khiến nhân vật này bền hơn.`);
    }

    return parts.join(" ");
  }
}
