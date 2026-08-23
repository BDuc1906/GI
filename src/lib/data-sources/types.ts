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

export type TalentAttributeRow = {
  // Tên hiển thị của thông số, vd "1-Hit DMG", "Press CD"
  label: string;
  // Giá trị đã format sẵn (%, số nguyên...) tại mỗi cấp thiên phú, thường
  // 15 phần tử (cấp 1-15). Chỉ áp dụng cho combat1/2/3 (Đòn thường/Kỹ
  // năng/Trọng kích) — passive không có field này vì không scale theo cấp.
  values: string[];
};

export type TalentEntry = {
  key: string;
  name: string | null;
  description: string | null;
  // URL enka.network — null nếu genshin-db không có filename cho talent này.
  icon: string | null;
  // null với passive (không scale theo cấp) và khi genshin-db không trả
  // về attributes cho talent này.
  attributes: TalentAttributeRow[] | null;
};

export type ConstellationEntry = {
  level: number;
  name: string | null;
  description: string | null;
  icon: string | null;
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
  genshinDbId?: string | null;
  gender?: string | null;
  bodyType?: string | null;
  associationType?: string | null;
  qualityType?: string | null;
  birthdaymmdd?: string | null;
  raw?: unknown; // Sử dụng chính xác kiểu `unknown` theo đúng hướng dẫn
};