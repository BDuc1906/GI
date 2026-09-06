export type CharacterComparison = {
  id: string;
  name: string;
  vision: string | null;
  weaponType: string | null;
  rarity: number | null;
  baseHp: number | null;
  baseAtk: number | null;
  baseDef: number | null;
};

export type BuildComparison = {
  character1: CharacterComparison;
  character2: CharacterComparison;
  similarities: {
    sameVision: boolean;
    sameWeaponType: boolean;
  };
  differences: {
    rarityDiff: number;
    atkDiff: number;
    hpDiff: number;
    defDiff: number;
  };
  recommendation: string;
};
