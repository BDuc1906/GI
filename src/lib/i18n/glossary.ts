
/**
 * src/lib/i18n/glossary.ts
 *
 * Nguồn dữ liệu DUY NHẤT cho tính năng "từ khóa hiệu ứng có thể bấm vào"
 * dùng ở PHẠM VI TOÀN WEB: mọi nơi nhắc tới tên 1 phản ứng nguyên tố hay
 * cộng hưởng nguyên tố (trong mô tả nhân vật, build guide, trang chủ...)
 * đều có thể tự động biến thành 1 GlossaryTerm — di chuột vào hiện tóm
 * tắt, bấm vào hiện chi tiết đầy đủ.
 *
 * KHÔNG chứa JSX — file .ts thuần, chỉ xử lý dữ liệu + tìm kiếm chuỗi.
 * Phần hiển thị (tooltip/modal) nằm ở
 * src/components/glossary/GlossaryTerm.tsx và GlossaryProvider.tsx.
 *
 * ĐA NGÔN NGỮ (2026-08): mọi hàm ở đây giờ nhận thêm tham số `locale`.
 * Khi locale="vi", hành vi/nội dung GIỮ NGUYÊN 100% như trước (không đổi
 * gì cả). Khi locale khác, dùng nội dung tiếng Anh đã dịch trong
 * element-reactions-data.ts (getReactionName/getReactionDescription...),
 * fallback về tiếng Anh cho các locale chưa có bản dịch riêng. Kết quả
 * build theo locale được cache trong bộ nhớ (glossaryCache) để tránh
 * tính lại KEYWORD_ENTRIES (có sort) mỗi lần render.
 */
import {
  ELEMENTAL_REACTIONS,
  ELEMENTAL_RESONANCES,
  elementColor,
  reactionAccentColor,
  getReactionName,
  getReactionDescription,
  getResonanceName,
  getResonanceDescription,
  type ElementalReaction,
} from "../game/element-reactions-data";

export interface GlossaryTerm {
  id: string;
  // Tất cả cách viết được nhận diện khi quét văn bản để auto-link —
  // KHÔNG phân biệt hoa/thường/dấu khi so khớp (xem normalizeForMatch),
  // nhưng hiển thị nguyên văn đoạn text gốc trong bài (giữ hoa/thường
  // như người viết gõ).
  keywords: string[];
  title: string; // "Bốc Hơi (Vaporize)" / "Vaporize"
  badge: string; // "Biến đổi" / "Khuếch đại" / "Cộng hưởng Nguyên tố"...
  summary: string; // 1 câu ngắn cho tooltip khi hover
  detail: string; // mô tả đầy đủ cho popup khi bấm
  requiresCharacters?: string;
  accentColor: string; // hex — viền/màu chữ của chip + tiêu đề popup
}

const CATEGORY_LABEL: Record<ElementalReaction["category"], Partial<Record<string, string>>> = {
  amplifying: { "en": "Amplification", "vi": "Khuếch đại", "ko": "증폭", "ja": "増幅", "zh-CN": "放大", "zh-TW": "放大", "de": "Verstärkung", "fr": "Amplification", "it": "Amplificazione", "pt": "Amplificação", "es": "Amplificación", "ru": "Усиление", "th": "การขยายเสียง", "tr": "Güçlendirme", "id": "Amplifikasi" },
  transformative: { "en": "Transformative", "vi": "Biến đổi", "ko": "변형", "ja": "変形", "zh-CN": "转化", "zh-TW": "轉化", "de": "Transformation", "fr": "Transformation", "it": "Trasformazione", "pt": "Transformação", "es": "Transformación", "ru": "Трансформация", "th": "การเปลี่ยนแปลง", "tr": "Dönüştürücü", "id": "Transformatif" },
  additive: { "en": "Additive", "vi": "Bổ trợ", "ko": "가산", "ja": "加算", "zh-CN": "加成", "zh-TW": "加成", "de": "Additiv", "fr": "Additive", "it": "Additiva", "pt": "Aditiva", "es": "Aditiva", "ru": "Аддитивная", "th": "การเติมแต่ง", "tr": "Ekleyici", "id": "Aditif" },
  lunar: { "en": "Lunar", "vi": "Nguyệt", "ko": "루나", "ja": "ルナ", "zh-CN": "月亮", "zh-TW": "月亮", "de": "Lunar", "fr": "Lunaire", "it": "Lunare", "pt": "Lunar", "es": "Lunar", "ru": "Лунный", "th": "ดวงจันทร์", "tr": "Ay", "id": "Bulan" },
  stellar: { "en": "Stellar", "vi": "Tinh Vực", "ko": "스텔라", "ja": "ステラー", "zh-CN": "恒星", "zh-TW": "恆星", "de": "Stellar", "fr": "Stellaire", "it": "Stellare", "pt": "Estelar", "es": "Estelar", "ru": "Звёздный", "th": "ดาวฤกษ์", "tr": "Yıldız", "id": "Bintang" },
};

// Đã dịch đủ 15 ngôn ngữ (trước đây chỉ có vi/en cứng, đã sửa 2026-09 —
// dùng cùng bộ nhãn với ReactionTabs.category* trong messages/*.json,
// sau khi bộ đó cũng được sửa lại vì bị dịch sai nghĩa ở nhiều ngôn ngữ,
// vd "Additive" từng bị dịch thành "Add-ons"/"플러그인").
function categoryLabel(category: ElementalReaction["category"], locale: string): string {
  return CATEGORY_LABEL[category][locale] ?? CATEGORY_LABEL[category].en ?? category;
}


// Câu đầu tiên của description — dùng làm tóm tắt ngắn cho tooltip hover,
// tránh hiện nguyên đoạn dài (đoạn dài dành cho popup chi tiết khi bấm).
function firstSentence(text: string): string {
  const match = text.match(/^[^.]+\./);
  return match ? match[0] : text;
}

function uniq(arr: string[]): string[] {
  return arr.filter((v, i, a) => a.indexOf(v) === i);
}

function buildReactionTerms(locale: string): GlossaryTerm[] {
  const isVi = locale === "vi";
  return ELEMENTAL_REACTIONS.map((r) => {
    if (isVi) {
      return {
        id: r.id,
        keywords: r.nameVi !== r.name ? [r.nameVi, r.name] : [r.name],
        title: r.nameVi !== r.name ? `${r.nameVi} (${r.name})` : r.name,
        badge: categoryLabel(r.category, locale),
        summary: firstSentence(r.description),
        detail: r.description,
        requiresCharacters: r.requiresCharacters,
        accentColor: reactionAccentColor(r),
      };
    }
    const displayName = getReactionName(r, locale);
    const description = getReactionDescription(r, locale);
    return {
      id: r.id,
      keywords: uniq([displayName, r.name]),
      title: displayName !== r.name ? `${displayName} (${r.name})` : r.name,
      badge: categoryLabel(r.category, locale),
      summary: firstSentence(description),
      detail: description,
      requiresCharacters: r.requiresCharacters,
      accentColor: reactionAccentColor(r),
    };
  });
}

function buildResonanceTerms(locale: string): GlossaryTerm[] {
  const isVi = locale === "vi";
  return ELEMENTAL_RESONANCES.map((res) => {
    const name = getResonanceName(res, locale);
    const description = getResonanceDescription(res, locale);
    const requiresText = isVi
      ? `Cần ≥2 nhân vật ${res.element === "Anemo" || res.element === "Electro" ? "hệ" : "nguyên tố"} ${res.element} trong 4 vị trí đầu đội hình.`
      : `Requires ≥2 ${res.element} characters in the first 4 team slots.`;
    return {
      id: `resonance-${res.id}`,
      keywords: [name],
      title: name,
      badge: isVi ? "Cộng hưởng Nguyên tố" : "Elemental Resonance",
      summary: firstSentence(description),
      detail: `${description}\n\n${requiresText}`,
      accentColor: elementColor(res.element),
    };
  });
}

// Chuẩn hoá để so khớp không phân biệt hoa/thường (không bỏ dấu tiếng
// Việt — "Đóng Băng" và "đóng băng" phải khớp nhau, nhưng "Bang" (không
// dấu) THÌ KHÔNG được khớp "Băng", tránh auto-link nhầm những từ thường
// không liên quan tới hiệu ứng).
function normalizeForMatch(s: string): string {
  return s.toLowerCase();
}

interface KeywordEntry {
  normalized: string;
  original: string;
  termId: string;
}

export interface GlossaryMatch {
  start: number;
  end: number;
  termId: string;
}

interface GlossaryBundle {
  terms: GlossaryTerm[];
  map: Record<string, GlossaryTerm>;
  keywordEntries: KeywordEntry[];
}

// Cache theo locale — build 1 lần/locale, dùng lại cho các lần gọi sau
// (tránh sort KEYWORD_ENTRIES lại mỗi lần render).
const glossaryCache = new Map<string, GlossaryBundle>();

function getBundle(locale: string): GlossaryBundle {
  const cached = glossaryCache.get(locale);
  if (cached) return cached;

  const terms = [...buildReactionTerms(locale), ...buildResonanceTerms(locale)];
  const map = Object.fromEntries(terms.map((term) => [term.id, term]));
  // Sắp xếp từ khóa DÀI TRƯỚC — để "Điện Cảm"/"Electro-Charged" được ưu
  // tiên khớp trước khi thử khớp 1 từ ngắn hơn có thể là con của nó.
  const keywordEntries: KeywordEntry[] = terms
    .flatMap((term) => term.keywords.map((kw) => ({ normalized: normalizeForMatch(kw), original: kw, termId: term.id })))
    .sort((a, b) => b.normalized.length - a.normalized.length);

  const bundle: GlossaryBundle = { terms, map, keywordEntries };
  glossaryCache.set(locale, bundle);
  return bundle;
}

/** Toàn bộ glossary term theo locale — dùng khi cần liệt kê tất cả. */
export function getGlossaryTerms(locale: string): GlossaryTerm[] {
  return getBundle(locale).terms;
}

/** Tra 1 term theo id, đúng locale — dùng trong GlossaryProvider/GlossaryTerm. */
export function getGlossaryTerm(id: string, locale: string): GlossaryTerm | undefined {
  return getBundle(locale).map[id];
}

/**
 * Quét 1 đoạn text thuần, trả về danh sách vị trí khớp với từ khóa
 * glossary — dùng \b (word boundary) để không khớp giữa chừng 1 từ khác
 * (vd không khớp "Sum Suê" bên trong 1 từ ghép dài hơn). Ưu tiên khớp
 * dài nhất tại mỗi vị trí, không chồng lấn giữa các match.
 */
export function findGlossaryMatches(text: string, locale: string): GlossaryMatch[] {
  const { keywordEntries } = getBundle(locale);
  const normalized = normalizeForMatch(text);
  const matches: GlossaryMatch[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    let matched: { entry: KeywordEntry; index: number } | null = null;

    for (const entry of keywordEntries) {
      const idx = normalized.indexOf(entry.normalized, cursor);
      if (idx === -1) continue;
      // Ưu tiên match GẦN cursor nhất; nếu bằng nhau thì match DÀI HƠN
      // thắng (keywordEntries đã sort dài->ngắn nên giữ cái tìm thấy
      // trước ở cùng vị trí gần nhất).
      if (matched === null || idx < matched.index || (idx === matched.index && entry.normalized.length > matched.entry.normalized.length)) {
        matched = { entry, index: idx };
      }
    }

    if (!matched) break;

    const { entry, index } = matched;
    const end = index + entry.normalized.length;
    const before = index > 0 ? text[index - 1] : " ";
    const after = end < text.length ? text[end] : " ";
    const isWordChar = (c: string) => /[\p{L}\p{N}]/u.test(c);

    if (!isWordChar(before) && !isWordChar(after)) {
      matches.push({ start: index, end, termId: entry.termId });
      cursor = end;
    } else {
      // Khớp giữa chừng 1 từ khác (vd không phải ranh giới từ) — bỏ qua,
      // tìm tiếp từ ngay sau vị trí này.
      cursor = index + 1;
    }
  }

  return matches;
}
