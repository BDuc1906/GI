/**
 * src/lib/data-sources/types.ts
 *
 * Định nghĩa kiểu dữ liệu trung gian giữa các adapter và seed script.
 */

export type MaterialRef = {
  name: string;
  count: number | null;
};

export type AscensionMaterialPhase = {
  phase: number;
  materials: MaterialRef[];
};

export type TalentMaterialLevel = {
  level: number;
  materials: MaterialRef[];
};

export type StatsByLevelRow = {
  level: number;
  ascension: number | null;
  hp: number | null;
  attack: number | null;
  defense: number | null;
  specialized: number | null;
};

export type TalentEntry = {
  key: string;
  name: string | null;
  description: string | null;
};

export type ConstellationEntry = {
  level: number;
  name: string | null;
  description: string | null;
};

export type VoiceActors = {
  english: string | null;
  chinese: string | null;
  japanese: string | null;
  korean: string | null;
};

export type CharacterData = {
  id: string;
  name: string;
  title: string | null;
  vision: string;
  weaponType: string;
  rarity: number;
  region: string | null;
  affiliation: string | null;
  releaseDate: Date | null;
  description: string | null;
  iconUrl: string | null;
  sideIconUrl: string | null;
  splashUrl: string | null;
  elementIcon: string | null;
  baseHp: number | null;
  baseAtk: number | null;
  baseDef: number | null;
  ascensionStat: string | null;
  ascensionMaterials: AscensionMaterialPhase[] | null;
  talentMaterials: TalentMaterialLevel[] | null;
  statsByLevel: StatsByLevelRow[] | null;
  birthday: string | null;
  constellationName: string | null;
  voiceActors: VoiceActors | null;
  gameVersion: string | null;
  wikiUrl: string | null;
  constellations: ConstellationEntry[] | null;
  talents: TalentEntry[] | null;
  missingTalentBookType: boolean;
};