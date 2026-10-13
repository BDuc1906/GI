// src/lib/i18n/localized-content.ts
/**
 * Đọc nội dung dài (mô tả, thiên phú, mệnh cung, tinh luyện vũ khí) theo từng ngôn ngữ.
 *
 * HỖ TRỢ ĐA NGÔN NGỮ CHÍNH THỨC CỦA MIHOYO (13/15 locale):
 * Tự động đối chiếu trực tiếp dữ liệu chính thức từ gói `genshin-db`
 * (chứa 100% bản địa hóa chính thức trong game cho 13 ngôn ngữ) để hiển thị tên
 * chiêu thức, mô tả nộ, thiên phú, cung mệnh và vũ khí chuẩn xác tuyệt đối.
 *
 * Với 2 ngôn ngữ miHoYo không hỗ trợ trong game (Ý "it", Thổ Nhĩ Kỳ "tr"):
 * Tự động chuyển tiếp sang cột *Translations (máy dịch) hoặc fallback về tiếng Anh.
 */

import genshindb from "genshin-db";

const GENSHINDB_LANGUAGE_MAP: Record<string, genshindb.Language> = {
  en: genshindb.Language.English,
  vi: genshindb.Language.Vietnamese,
  "zh-CN": genshindb.Language.ChineseSimplified,
  "zh-TW": genshindb.Language.ChineseTraditional,
  ja: genshindb.Language.Japanese,
  ko: genshindb.Language.Korean,
  id: genshindb.Language.Indonesian,
  th: genshindb.Language.Thai,
  de: genshindb.Language.German,
  fr: genshindb.Language.French,
  pt: genshindb.Language.Portuguese,
  es: genshindb.Language.Spanish,
  ru: genshindb.Language.Russian,
};

export function getLocalizedDescription(
  entity: { name?: string; description: string | null; descriptionTranslations: unknown },
  locale: string
): string | null {
  if (!entity.description && !entity.name) return null;

  const targetLang = GENSHINDB_LANGUAGE_MAP[locale];
  if (targetLang && entity.name) {
    try {
      const gChar = genshindb.characters(entity.name, { resultLanguage: targetLang });
      if (gChar?.description) return gChar.description;

      const gWeapon = genshindb.weapons(entity.name, { resultLanguage: targetLang });
      if (gWeapon?.description) return gWeapon.description;
    } catch {
      // ignore & fallback
    }
  }

  const map = entity.descriptionTranslations as Record<string, string> | null;
  return map?.[locale] ?? entity.description;
}

export interface TalentAttributeRow {
  label: string;
  values: string[];
}

export interface Talent {
  key: string;
  name: string;
  description: string;
  icon: string | null;
  attributes: TalentAttributeRow[] | null;
}

interface TalentTranslationEntry {
  key: string;
  name: string;
  description: string;
  attributeLabels: string[];
}

/**
 * Trả về mảng talents đã dịch tên/mô tả/nhãn thuộc tính.
 */
export function getLocalizedTalents(
  talents: Talent[],
  talentsTranslations: unknown,
  locale: string,
  characterName?: string
): Talent[] {
  if (!talents.length) return talents;

  const targetLang = GENSHINDB_LANGUAGE_MAP[locale];
  if (targetLang && characterName) {
    try {
      const gTalents = genshindb.talents(characterName, { resultLanguage: targetLang }) as Record<string, any> | undefined;
      if (gTalents) {
        const talentKeyMap: Record<string, string> = {
          normalAttack: "combat1",
          elementalSkill: "combat2",
          elementalBurst: "combat3",
          passive1: "passive1",
          passive2: "passive2",
          passive3: "passive3",
        };

        return talents.map((tal) => {
          const gKey = talentKeyMap[tal.key] || tal.key;
          const gTal = gTalents[gKey];
          if (!gTal) return tal;

          const localizedName = gTal.name || tal.name;
          const localizedDesc = gTal.description || tal.description;
          const localizedLabels = gTal.attributes?.labels as string[] | undefined;

          return {
            ...tal,
            name: localizedName,
            description: localizedDesc,
            attributes: tal.attributes && localizedLabels
              ? tal.attributes.map((row, i) => ({
                  ...row,
                  label: localizedLabels[i] || row.label,
                }))
              : tal.attributes,
          };
        });
      }
    } catch {
      // ignore & fallback
    }
  }

  const byLocale = talentsTranslations as Record<string, TalentTranslationEntry[]> | null;
  const entries = byLocale?.[locale];
  if (!entries) return talents;

  const byKey = new Map(entries.map((e) => [e.key, e]));
  return talents.map((tal) => {
    const tr = byKey.get(tal.key);
    if (!tr) return tal;
    return {
      ...tal,
      name: tr.name ?? tal.name,
      description: tr.description ?? tal.description,
      attributes: tal.attributes
        ? tal.attributes.map((row, i) => ({
            ...row,
            label: tr.attributeLabels?.[i] ?? row.label,
          }))
        : tal.attributes,
    };
  });
}

export interface Constellation {
  level?: number;
  name: string;
  description: string;
  icon: string | null;
}

interface ConstellationTranslationEntry {
  name: string;
  description: string;
}

/** Khớp theo INDEX (constellation không có id/key ổn định) — an toàn vì
 * mảng constellations luôn đúng 6 phần tử theo thứ tự cố định C1-C6. */
export function getLocalizedConstellations(
  constellations: Constellation[],
  constellationsTranslations: unknown,
  locale: string,
  characterName?: string
): Constellation[] {
  if (!constellations.length) return constellations;

  const targetLang = GENSHINDB_LANGUAGE_MAP[locale];
  if (targetLang && characterName) {
    try {
      const gConst = genshindb.constellations(characterName, { resultLanguage: targetLang }) as Record<string, any> | undefined;
      if (gConst) {
        const cKeys = ["c1", "c2", "c3", "c4", "c5", "c6"];
        return constellations.map((cs, i) => {
          const gC = gConst[cKeys[i]];
          if (!gC) return cs;
          return {
            ...cs,
            name: gC.name || cs.name,
            description: gC.description || cs.description,
          };
        });
      }
    } catch {
      // ignore & fallback
    }
  }

  const byLocale = constellationsTranslations as Record<string, ConstellationTranslationEntry[]> | null;
  const entries = byLocale?.[locale];
  if (!entries) return constellations;

  return constellations.map((cs, i) => {
    const tr = entries[i];
    if (!tr) return cs;
    return { ...cs, name: tr.name ?? cs.name, description: tr.description ?? cs.description };
  });
}

interface RefinementTranslationEntry {
  description: string;
}

/** Khớp theo index (R1-R5, luôn cố định thứ tự). */
export function getLocalizedRefinements<T extends { description: string }>(
  passiveByRefinement: T[],
  passiveByRefinementTranslations: unknown,
  locale: string,
  weaponName?: string
): T[] {
  if (!passiveByRefinement.length) return passiveByRefinement;

  const targetLang = GENSHINDB_LANGUAGE_MAP[locale];
  if (targetLang && weaponName) {
    try {
      const gWeapon = genshindb.weapons(weaponName, { resultLanguage: targetLang }) as Record<string, any> | undefined;
      if (gWeapon) {
        const rKeys = ["r1", "r2", "r3", "r4", "r5"];
        return passiveByRefinement.map((r, i) => {
          const gR = gWeapon[rKeys[i]];
          if (!gR?.description) return r;
          return { ...r, description: gR.description };
        });
      }
    } catch {
      // ignore & fallback
    }
  }

  const byLocale = passiveByRefinementTranslations as Record<string, RefinementTranslationEntry[]> | null;
  const entries = byLocale?.[locale];
  if (!entries) return passiveByRefinement;

  return passiveByRefinement.map((r, i) => {
    const tr = entries[i];
    if (!tr) return r;
    return { ...r, description: tr.description ?? r.description };
  });
}
