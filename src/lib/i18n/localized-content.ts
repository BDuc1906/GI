// src/lib/i18n/localized-content.ts
/**
 * Đọc nội dung dài (mô tả, thiên phú, mệnh cung, tinh luyện vũ khí) đã
 * dịch qua Azure Translator (xem scripts/i18n/translate-character-content.mjs),
 * lưu trong các cột *Translations (Json?) — khác với `nameTranslations`
 * (tên ngắn, dịch tay/verify kỹ) ở chỗ đây là dịch máy thuần, KHÔNG có
 * key "vi" (vi luôn đọc thẳng từ cột gốc, coi là nguồn sự thật).
 *
 * Quy ước chung mọi hàm ở đây: locale "vi" → trả về text gốc luôn (không
 * tra cột *Translations). Locale khác → tra cột *Translations[locale],
 * nếu thiếu (chưa chạy pipeline / API lỗi giữa chừng) → fallback về
 * chính text gốc tiếng Anh, KHÔNG bao giờ trả về rỗng hay ném lỗi.
 */

export function getLocalizedDescription(
  entity: { description: string | null; descriptionTranslations: unknown },
  locale: string
): string | null {
  if (!entity.description) return null;
  if (locale === "vi") return entity.description;
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
 * Trả về mảng talents đã dịch tên/mô tả/nhãn thuộc tính — GIỮ NGUYÊN
 * `values` (số liệu) và `icon` từ bản gốc, chỉ thay text. Khớp theo `key`
 * (không theo index) để không lệch nếu thứ tự talents đổi giữa các lần
 * seed.
 */
export function getLocalizedTalents(
  talents: Talent[],
  talentsTranslations: unknown,
  locale: string
): Talent[] {
  if (locale === "vi" || !talents.length) return talents;
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
  locale: string
): Constellation[] {
  if (locale === "vi" || !constellations.length) return constellations;
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
  locale: string
): T[] {
  if (locale === "vi" || !passiveByRefinement.length) return passiveByRefinement;
  const byLocale = passiveByRefinementTranslations as Record<string, RefinementTranslationEntry[]> | null;
  const entries = byLocale?.[locale];
  if (!entries) return passiveByRefinement;

  return passiveByRefinement.map((r, i) => {
    const tr = entries[i];
    if (!tr) return r;
    return { ...r, description: tr.description ?? r.description };
  });
}
