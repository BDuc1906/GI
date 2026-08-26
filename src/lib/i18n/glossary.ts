/**
 * src/lib/glossary.ts
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
 */
import {
  ELEMENTAL_REACTIONS,
  ELEMENTAL_RESONANCES,
  elementColor,
  reactionAccentColor,
  type ElementalReaction,
} from "../game/element-reactions-data";

export interface GlossaryTerm {
  id: string;
  // Tất cả cách viết được nhận diện khi quét văn bản để auto-link —
  // KHÔNG phân biệt hoa/thường/dấu khi so khớp (xem normalizeForMatch),
  // nhưng hiển thị nguyên văn đoạn text gốc trong bài (giữ hoa/thường
  // như người viết gõ).
  keywords: string[];
  title: string; // "Bốc Hơi (Vaporize)"
  badge: string; // "Biến đổi" / "Khuếch đại" / "Cộng hưởng Nguyên tố"...
  summary: string; // 1 câu ngắn cho tooltip khi hover
  detail: string; // mô tả đầy đủ cho popup khi bấm
  requiresCharacters?: string;
  accentColor: string; // hex — viền/màu chữ của chip + tiêu đề popup
}

const CATEGORY_LABEL_VI: Record<ElementalReaction["category"], string> = {
  amplifying: "Khuếch đại",
  transformative: "Biến đổi",
  additive: "Bổ trợ",
  lunar: "Nguyệt",
  stellar: "Tinh Vực",
};

// Câu đầu tiên của description — dùng làm tóm tắt ngắn cho tooltip hover,
// tránh hiện nguyên đoạn dài (đoạn dài dành cho popup chi tiết khi bấm).
function firstSentence(text: string): string {
  const match = text.match(/^[^.]+\./);
  return match ? match[0] : text;
}

const REACTION_TERMS: GlossaryTerm[] = ELEMENTAL_REACTIONS.map((r) => ({
  id: r.id,
  keywords: r.nameVi !== r.name ? [r.nameVi, r.name] : [r.name],
  title: r.nameVi !== r.name ? `${r.nameVi} (${r.name})` : r.name,
  badge: CATEGORY_LABEL_VI[r.category],
  summary: firstSentence(r.description),
  detail: r.description,
  requiresCharacters: r.requiresCharacters,
  accentColor: reactionAccentColor(r),
}));

const RESONANCE_TERMS: GlossaryTerm[] = ELEMENTAL_RESONANCES.map((res) => ({
  id: `resonance-${res.id}`,
  keywords: [res.nameVi],
  title: res.nameVi,
  badge: "Cộng hưởng Nguyên tố",
  summary: firstSentence(res.description),
  detail: `${res.description}\n\nCần ≥2 nhân vật ${res.element === "Anemo" || res.element === "Electro" ? "hệ" : "nguyên tố"} ${res.element} trong 4 vị trí đầu đội hình.`,
  accentColor: elementColor(res.element),
}));

export const GLOSSARY_TERMS: GlossaryTerm[] = [...REACTION_TERMS, ...RESONANCE_TERMS];

export const GLOSSARY_MAP: Record<string, GlossaryTerm> = Object.fromEntries(
  GLOSSARY_TERMS.map((term) => [term.id, term])
);

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

// Sắp xếp từ khóa DÀI TRƯỚC — để "Điện Cảm" được ưu tiên khớp trước khi
// thử khớp 1 từ ngắn hơn có thể là con của nó, tránh cắt nhầm giữa từ.
const KEYWORD_ENTRIES: KeywordEntry[] = GLOSSARY_TERMS.flatMap((term) =>
  term.keywords.map((kw) => ({ normalized: normalizeForMatch(kw), original: kw, termId: term.id }))
).sort((a, b) => b.normalized.length - a.normalized.length);

export interface GlossaryMatch {
  start: number;
  end: number;
  termId: string;
}

/**
 * Quét 1 đoạn text thuần, trả về danh sách vị trí khớp với từ khóa
 * glossary — dùng \b (word boundary) để không khớp giữa chừng 1 từ khác
 * (vd không khớp "Sum Suê" bên trong 1 từ ghép dài hơn). Ưu tiên khớp
 * dài nhất tại mỗi vị trí, không chồng lấn giữa các match.
 */
export function findGlossaryMatches(text: string): GlossaryMatch[] {
  const normalized = normalizeForMatch(text);
  const matches: GlossaryMatch[] = [];
  let cursor = 0;

  while (cursor < text.length) {
    let matched: { entry: KeywordEntry; index: number } | null = null;

    for (const entry of KEYWORD_ENTRIES) {
      const idx = normalized.indexOf(entry.normalized, cursor);
      if (idx === -1) continue;
      // Ưu tiên match GẦN cursor nhất; nếu bằng nhau thì match DÀI HƠN
      // thắng (KEYWORD_ENTRIES đã sort dài->ngắn nên giữ cái tìm thấy
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
