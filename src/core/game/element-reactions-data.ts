/**
 * src/core/game/element-reactions-data.ts
 *
 * Dữ liệu phản ứng nguyên tố, cộng hưởng và cơ chế phe phái.
 * Dữ liệu tĩnh lớn (reactions, formulas, resonances, mechanics) được tách vào các file JSON
 * trong src/core/game/data/ để đảm bảo Single Responsibility và tối ưu bundle/compile.
 */

import damageFormulasData from "./data/damage-formulas.json";
import elementalReactionsData from "./data/elemental-reactions.json";
import elementalResonancesData from "./data/elemental-resonances.json";
import factionMechanicsData from "./data/faction-mechanics.json";
import lunarResonanceData from "./data/lunar-resonance.json";

export const ELEMENTS = [
  { id: "pyro", name: "Pyro", nameVi: "Hỏa", nameTranslations: {"zh-CN":"火","zh-TW":"火","ja":"炎","ko":"불","fr":"Pyro","de":"Pyro","id":"Pyro","it":"Pyro","pt":"Pyro","ru":"Пиро","es":"Pyro","th":"ไฟ","tr":"Ateş"}, color: "#EF7940" },
  { id: "hydro", name: "Hydro", nameVi: "Thủy", nameTranslations: {"zh-CN":"水","zh-TW":"水","ja":"水","ko":"물","fr":"Hydro","de":"Hydro","id":"Hydro","it":"Hydro","pt":"Hydro","ru":"Гидро","es":"Hydro","th":"น้ำ","tr":"Su"}, color: "#4CC2F1" },
  { id: "cryo", name: "Cryo", nameVi: "Băng", nameTranslations: {"zh-CN":"冰","zh-TW":"冰","ja":"氷","ko":"얼음","fr":"Cryo","de":"Kryo","id":"Cryo","it":"Cryo","pt":"Cryo","ru":"Крио","es":"Cryo","th":"น้ำแข็ง","tr":"Buz"}, color: "#9FE0E8" },
  { id: "electro", name: "Electro", nameVi: "Lôi", nameTranslations: {"zh-CN":"雷","zh-TW":"雷","ja":"雷","ko":"번개","fr":"Électro","de":"Elektro","id":"Electro","it":"Electro","pt":"Electro","ru":"Электро","es":"Electro","th":"ไฟฟ้า","tr":"Elektrik"}, color: "#B380E6" },
  { id: "anemo", name: "Anemo", nameVi: "Phong", nameTranslations: {"zh-CN":"风","zh-TW":"風","ja":"風","ko":"바람","fr":"Anémo","de":"Anemo","id":"Anemo","it":"Anemo","pt":"Anemo","ru":"Анемо","es":"Anemo","th":"ลม","tr":"Rüzgar"}, color: "#6FD9BC" },
  { id: "geo", name: "Geo", nameVi: "Nham", nameTranslations: {"zh-CN":"岩","zh-TW":"岩","ja":"岩","ko":"바위","fr":"Géo","de":"Geo","id":"Geo","it":"Geo","pt":"Geo","ru":"Гео","es":"Geo","th":"หิน","tr":"Toprak"}, color: "#F7CB53" },
  { id: "dendro", name: "Dendro", nameVi: "Thảo", nameTranslations: {"zh-CN":"草","zh-TW":"草","ja":"草","ko":"풀","fr":"Dendro","de":"Dendro","id":"Dendro","it":"Dendro","pt":"Dendro","ru":"Дендро","es":"Dendro","th":"ไม้","tr":"Doğa"}, color: "#A8CB3A" },
] as const;

export type OtherLocale = "en" | "zh-CN" | "zh-TW" | "ja" | "ko" | "id" | "th" | "de" | "fr" | "it" | "pt" | "es" | "ru" | "tr";

function pickTranslation(
  translations: Partial<Record<OtherLocale, string>> | undefined,
  locale: string,
  viFallback: string
): string {
  if (locale === "vi") return viFallback;
  return translations?.[locale as OtherLocale] ?? translations?.en ?? viFallback;
}

export function getElementName(el: { name: string; nameVi: string; nameTranslations?: Partial<Record<OtherLocale, string>> }, locale: string): string {
  if (locale === "vi") return el.nameVi;
  return el.nameTranslations?.[locale as OtherLocale] ?? el.name;
}

export function getElementNameByKey(name: string, locale: string): string {
  const el = ELEMENTS.find((e) => e.name === name);
  return el ? getElementName(el, locale) : name;
}

export function elementColor(name: string): string {
  return ELEMENTS.find((e) => e.name === name)?.color ?? "#C9A66B";
}

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Local PNG assets (downloaded to public/local-genshin-assets/elements/)
// Fallback: Wikia SVGs (used before local download was available)
export const ELEMENT_ICON_URLS: Record<string, string> = {
  Pyro: "/local-genshin-assets/elements/pyro.png",
  Hydro: "/local-genshin-assets/elements/hydro.png",
  Cryo: "/local-genshin-assets/elements/cryo.png",
  Electro: "/local-genshin-assets/elements/electro.png",
  Anemo: "/local-genshin-assets/elements/anemo.png",
  Geo: "/local-genshin-assets/elements/geo.png",
  Dendro: "/local-genshin-assets/elements/dendro.png",
};

export type ReactionCategory = "amplifying" | "transformative" | "additive" | "lunar" | "stellar";

export const CATEGORY_COLOR: Record<ReactionCategory, string> = {
  amplifying: "border-red-500/50 bg-red-500/10 text-red-300",
  transformative: "border-slate-400/50 bg-slate-400/10 text-slate-300",
  additive: "border-pink-400/50 bg-pink-400/10 text-pink-300",
  lunar: "border-indigo-400/50 bg-indigo-400/10 text-indigo-300",
  stellar: "border-fuchsia-400/50 bg-fuchsia-400/10 text-fuchsia-300",
};

export interface ElementalReaction {
  id: string;
  name: string;
  nameVi: string;
  elements: string[];
  category: ReactionCategory;
  description: string;
  requiresCharacters?: string;
  accentElement?: string;
  nameTranslations?: Partial<Record<Exclude<OtherLocale, never>, string>>;
  descriptionTranslations?: Partial<Record<OtherLocale, string>>;
}

export const ELEMENTAL_REACTIONS: ElementalReaction[] = elementalReactionsData as ElementalReaction[];

export function reactionsInvolving(elementName: string): ElementalReaction[] {
  return ELEMENTAL_REACTIONS.filter((r) => r.elements.includes(elementName));
}

export function getReactionName(r: ElementalReaction, locale: string): string {
  if (locale === "vi") return r.nameVi;
  return r.nameTranslations?.[locale as OtherLocale] ?? r.name;
}

export function getReactionDescription(r: ElementalReaction, locale: string): string {
  return pickTranslation(r.descriptionTranslations, locale, r.description);
}

const AMPLIFYING_ACCENT = "#F2622E";

export function reactionAccentColor(r: ElementalReaction): string {
  if (r.accentElement) return elementColor(r.accentElement);
  if (r.category === "amplifying") return AMPLIFYING_ACCENT;
  return "#C9A66B";
}

export function swatchStyle(hex: string): { borderColor: string; backgroundColor: string; color: string } {
  return {
    borderColor: hexToRgba(hex, 0.55),
    backgroundColor: hexToRgba(hex, 0.14),
    color: hex,
  };
}

export function reactionPillStyle(elementName: string): { borderColor: string; backgroundColor: string; color: string } {
  return swatchStyle(elementColor(elementName));
}

export type DamageFormulaCategory = "amplifying" | "transformative" | "additive" | "lunarStellar";

export interface DamageFormulaInfo {
  category: DamageFormulaCategory;
  titleVi: string;
  formulaLatex: string;
  explanationVi: string;
  sourceUrl: string;
  titleTranslations?: Partial<Record<OtherLocale, string>>;
  explanationTranslations?: Partial<Record<OtherLocale, string>>;
}

export function getFormulaTitle(f: DamageFormulaInfo, locale: string): string {
  return pickTranslation(f.titleTranslations, locale, f.titleVi);
}

export function getFormulaExplanation(f: DamageFormulaInfo, locale: string): string {
  return pickTranslation(f.explanationTranslations, locale, f.explanationVi);
}

export const DAMAGE_FORMULAS: Record<DamageFormulaCategory, DamageFormulaInfo> = damageFormulasData as Record<DamageFormulaCategory, DamageFormulaInfo>;

export const TRANSFORMATIVE_BASE_COEFFICIENT: Record<string, number> = {
  burning: 0.25,
  swirl: 0.6,
  superconduct: 1.5,
  "electro-charged": 2.0,
  bloom: 2.0,
  overloaded: 2.75,
  frozen: 3.0,
  burgeon: 3.0,
  hyperbloom: 3.0,
};

export interface ElementalResonance {
  id: string;
  element: string;
  nameVi: string;
  description: string;
  nameTranslations?: Partial<Record<OtherLocale, string>>;
  descriptionTranslations?: Partial<Record<OtherLocale, string>>;
}

export function getResonanceName(res: ElementalResonance, locale: string): string {
  return pickTranslation(res.nameTranslations, locale, res.nameVi);
}

export function getResonanceDescription(res: ElementalResonance, locale: string): string {
  return pickTranslation(res.descriptionTranslations, locale, res.description);
}

export const ELEMENTAL_RESONANCES: ElementalResonance[] = elementalResonancesData as ElementalResonance[];

export interface LunarResonanceScaling {
  elements: string[];
  statLabel: string;
  ratePerUnit: string;
  example: string;
  statLabelTranslations?: Partial<Record<OtherLocale, string>>;
}

export const LUNAR_RESONANCE = lunarResonanceData as {
  nameVi: string;
  requirement: string;
  description: string;
  scalings: LunarResonanceScaling[];
  maxBonus: string;
  gameVersion: string;
  nameTranslations?: Partial<Record<OtherLocale, string>>;
  requirementTranslations?: Partial<Record<OtherLocale, string>>;
  descriptionTranslations?: Partial<Record<OtherLocale, string>>;
  maxBonusTranslations?: Partial<Record<OtherLocale, string>>;
};

export function getLunarResonance(locale: string) {
  return {
    ...LUNAR_RESONANCE,
    name: pickTranslation(LUNAR_RESONANCE.nameTranslations, locale, LUNAR_RESONANCE.nameVi),
    requirement: pickTranslation(LUNAR_RESONANCE.requirementTranslations, locale, LUNAR_RESONANCE.requirement),
    description: pickTranslation(LUNAR_RESONANCE.descriptionTranslations, locale, LUNAR_RESONANCE.description),
    maxBonus: pickTranslation(LUNAR_RESONANCE.maxBonusTranslations, locale, LUNAR_RESONANCE.maxBonus),
    scalings: LUNAR_RESONANCE.scalings.map((s) => ({
      ...s,
      statLabel: pickTranslation(s.statLabelTranslations, locale, s.statLabel),
    })),
  };
}

export const HEXEREI_WAVE_1 = factionMechanicsData.hexerei.wave1 as readonly string[];
export const HEXEREI_NEW_WITCHES = factionMechanicsData.hexerei.newWitches as readonly string[];
export const HEXEREI_CHARACTERS = factionMechanicsData.hexerei.characters as readonly string[];

export const HEXEREI_INFO = factionMechanicsData.hexerei.info;

export function getHexereiInfo(locale: string) {
  return {
    ...HEXEREI_INFO,
    name: pickTranslation(HEXEREI_INFO.nameTranslations, locale, HEXEREI_INFO.nameVi),
    requirement: pickTranslation(HEXEREI_INFO.requirementTranslations, locale, HEXEREI_INFO.requirement),
    description: pickTranslation(HEXEREI_INFO.descriptionTranslations, locale, HEXEREI_INFO.description),
  };
}

export const WITCH_REVELATION_CHARACTERS = factionMechanicsData.witchRevelation.characters as readonly string[];
export const WITCH_REVELATION_INFO = factionMechanicsData.witchRevelation.info;

export function getWitchRevelationInfo(locale: string) {
  return {
    ...WITCH_REVELATION_INFO,
    name: pickTranslation(WITCH_REVELATION_INFO.nameTranslations, locale, WITCH_REVELATION_INFO.nameVi),
    requirement: pickTranslation(WITCH_REVELATION_INFO.requirementTranslations, locale, WITCH_REVELATION_INFO.requirement),
    description: pickTranslation(WITCH_REVELATION_INFO.descriptionTranslations, locale, WITCH_REVELATION_INFO.description),
  };
}

export const CHARACTER_ELEMENT: Record<string, string> = factionMechanicsData.characterElement;

export function characterPillStyle(name: string): { borderColor: string; backgroundColor: string; color: string } {
  const el = CHARACTER_ELEMENT[name];
  return swatchStyle(el ? elementColor(el) : "#C9A66B");
}
