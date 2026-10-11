/**
 * src/core/game/team-synergy.ts
 *
 * Gợi ý đội hình THEO CƠ CHẾ GAME (phản ứng nguyên tố + cộng hưởng), có tính phương án thay thế
 * khi người chơi không có nhân vật cần thiết.
 *
 * ĐIỀU NÀY KHÔNG PHẢI "ĐỘI MẠNH NHẤT":
 *   - Dữ liệu nguồn (genshin-db) không có vai trò (DPS/hỗ trợ/hồi máu) lẫn dữ liệu thống kê người chơi,
 *     nên không thể xếp hạng sức mạnh. Thử suy vai trò từ chữ trong kỹ năng cho kết quả nhiễu
 *     (lẫn cả nhân vật chỉ tự hồi máu) nên cố tình KHÔNG dùng.
 *   - Điểm ở đây chỉ đo "độ phủ cơ chế": số phản ứng nguyên tố kích hoạt được và số cộng hưởng.
 *   - Người dùng ghim nhân vật cố định (vd DPS chính + người hồi máu), thuật toán lo các ô còn lại.
 *
 * Khi có dữ liệu thật (tỉ lệ dùng, vai trò đã kiểm duyệt), chỉ cần đổi TEAM_SCORE_WEIGHTS hoặc thêm
 * một hạng tử vào `scorePattern` — phần liệt kê và phương án thay thế giữ nguyên.
 *
 * Module này thuần (không đọc DB, không import dữ liệu dịch nặng): luật phản ứng/cộng hưởng được
 * truyền vào dạng gọn để chạy được cả ở trình duyệt.
 */

export interface TeamChar {
  id: string;
  /** Tên tiếng Anh (khớp với danh sách `requiresCharacters` của phản ứng Lunar). */
  name: string;
  element: string;
  rarity: number;
}

export interface ReactionRule {
  id: string;
  elements: string[];
  category: string;
  requiresCharacters?: string;
}

export interface ResonanceRule {
  id: string;
  /** Tên nguyên tố, hoặc "Unique" cho cộng hưởng 4 nguyên tố khác nhau (Protective Canopy). */
  element: string;
}

export const TEAM_SCORE_WEIGHTS = { reaction: 10, resonance: 6 } as const;

/**
 * Chế độ "Tập trung vào 1 phản ứng": ưu tiên theo thứ tự — nhiều thành viên đóng góp cho phản ứng
 * đó nhất, rồi mới đến cộng hưởng, rồi tới số phản ứng phụ. Trọng số lệch nhau đủ lớn để thứ tự này
 * luôn được giữ (tối đa 4 thành viên, 2 cộng hưởng, vài chục phản ứng phụ).
 */
export const FOCUS_SCORE_WEIGHTS = { contributor: 1000, resonance: 100, reaction: 1 } as const;

/** Chỉ các loại này được tính điểm tự động từ nguyên tố. Lunar/Stellar cần nhân vật cụ thể nên chỉ báo kèm. */
const SCORED_CATEGORIES = new Set(["amplifying", "transformative", "additive"]);

/** Khuếch Tán/Kết Tinh: elements[0] là nguyên tố kích hoạt, cần thêm BẤT KỲ 1 nguyên tố còn lại. */
const TRIGGER_PLUS_ANY = new Set(["swirl", "crystallize"]);

const UNIQUE_RESONANCE = "Unique";
export const TEAM_SIZE = 4;

export interface TeamSlot {
  character: TeamChar;
  pinned: boolean;
  /** Nhân vật CÙNG nguyên tố trong danh sách đang có có thể thay vào ô này. */
  alternatives: TeamChar[];
}

export interface SuggestedTeam {
  slots: TeamSlot[];
  score: number;
  /** id phản ứng (được tính điểm) kích hoạt được. */
  reactions: string[];
  /** id cộng hưởng kích hoạt được. */
  resonances: string[];
  /** id phản ứng Lunar có đủ nguyên tố và có nhân vật yêu cầu trong đội (không tính điểm). */
  lunar: string[];
  elements: string[];
}

export interface UpgradeHint {
  /** Nguyên tố người chơi chưa có nhân vật nào. */
  element: string;
  fromScore: number;
  toScore: number;
  newReactions: string[];
  newResonances: string[];
}

export interface SuggestResult {
  teams: SuggestedTeam[];
  hints: UpgradeHint[];
  /** Khi pool không đủ để lấp đầy đội thì giải thích ngắn gọn. */
  note?: string;
}

/* ───────────── Luật ───────────── */

export function availableReactions(elements: ReadonlySet<string>, rules: readonly ReactionRule[]): string[] {
  const out: string[] = [];
  for (const r of rules) {
    if (!SCORED_CATEGORIES.has(r.category)) continue;
    if (TRIGGER_PLUS_ANY.has(r.id)) {
      const [trigger, ...rest] = r.elements;
      if (elements.has(trigger) && rest.some((e) => elements.has(e))) out.push(r.id);
    } else if (r.elements.every((e) => elements.has(e))) {
      out.push(r.id);
    }
  }
  return out;
}

export function availableResonances(memberElements: readonly string[], rules: readonly ResonanceRule[]): string[] {
  const count = new Map<string, number>();
  for (const e of memberElements) count.set(e, (count.get(e) ?? 0) + 1);
  const out: string[] = [];
  for (const rule of rules) {
    if (rule.element === UNIQUE_RESONANCE) {
      if (count.size === TEAM_SIZE) out.push(rule.id); // đủ 4 nguyên tố khác nhau
    } else if ((count.get(rule.element) ?? 0) >= 2) {
      out.push(rule.id); // 2 + 2 kích hoạt được cả hai cộng hưởng
    }
  }
  return out;
}

function lunarReactions(members: readonly TeamChar[], rules: readonly ReactionRule[]): string[] {
  const elements = new Set(members.map((m) => m.element));
  const names = new Set(members.map((m) => m.name.toLowerCase()));
  return rules
    .filter((r) => r.category === "lunar" && r.elements.every((e) => elements.has(e)) && r.requiresCharacters)
    .filter((r) =>
      (r.requiresCharacters ?? "")
        .split(/[,;]/)
        .map((s) => s.trim().toLowerCase())
        .some((n) => n && names.has(n))
    )
    .map((r) => r.id);
}

/* ───────────── Thuật toán ───────────── */

interface Pattern {
  /** Nguyên tố của các ô còn trống (đã sắp xếp). */
  fill: string[];
  elements: string[];
  reactions: string[];
  resonances: string[];
  score: number;
  distinct: number;
  valid: boolean;
}

function scorePattern(
  memberElements: string[],
  reactionRules: readonly ReactionRule[],
  resonanceRules: readonly ResonanceRule[],
  focus?: ReactionRule
): Pick<Pattern, "reactions" | "resonances" | "score" | "distinct" | "valid"> {
  const set = new Set(memberElements);
  const reactions = availableReactions(set, reactionRules);
  const resonances = availableResonances(memberElements, resonanceRules);
  if (focus) {
    // Chế độ tập trung: đội phải mở được phản ứng đã chọn; điểm ưu tiên số thành viên đóng góp.
    const contributors = memberElements.filter((e) => focus.elements.includes(e)).length;
    return {
      reactions,
      resonances,
      valid: reactions.includes(focus.id),
      score:
        contributors * FOCUS_SCORE_WEIGHTS.contributor +
        resonances.length * FOCUS_SCORE_WEIGHTS.resonance +
        reactions.length * FOCUS_SCORE_WEIGHTS.reaction,
      distinct: set.size,
    };
  }
  return {
    reactions,
    resonances,
    valid: true,
    score: reactions.length * TEAM_SCORE_WEIGHTS.reaction + resonances.length * TEAM_SCORE_WEIGHTS.resonance,
    distinct: set.size,
  };
}

/** Liệt kê mọi cách chọn `k` ô theo nguyên tố (có lặp), tôn trọng số nhân vật sẵn có của mỗi nguyên tố. */
function enumerateFills(elements: string[], avail: Map<string, number>, k: number): string[][] {
  const out: string[][] = [];
  const walk = (idx: number, left: number, cur: string[]) => {
    if (left === 0) { out.push([...cur]); return; }
    if (idx >= elements.length) return;
    const el = elements[idx];
    const max = Math.min(left, avail.get(el) ?? 0);
    for (let m = max; m >= 0; m--) {
      walk(idx + 1, left - m, m > 0 ? [...cur, ...Array<string>(m).fill(el)] : cur);
    }
  };
  walk(0, k, []);
  return out;
}

function rankPatterns(
  pinnedElements: string[],
  elements: string[],
  avail: Map<string, number>,
  k: number,
  reactionRules: readonly ReactionRule[],
  resonanceRules: readonly ResonanceRule[],
  focus?: ReactionRule
): Pattern[] {
  return enumerateFills(elements, avail, k)
    .map((fill) => {
      const memberElements = [...pinnedElements, ...fill];
      return { fill, elements: memberElements, ...scorePattern(memberElements, reactionRules, resonanceRules, focus) };
    })
    .filter((p) => p.valid)
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.distinct - a.distinct ||
        a.fill.join().localeCompare(b.fill.join()) // ổn định, không phụ thuộc thứ tự đầu vào
    );
}

export interface SuggestInput {
  /** Nhân vật người chơi đang có (hoặc mọi nhân vật nếu muốn xem tổng quát). */
  pool: readonly TeamChar[];
  /** Nhân vật cố định trong đội (tối đa TEAM_SIZE). */
  pinned?: readonly TeamChar[];
  /** Mọi nhân vật trong game — chỉ dùng để gợi ý "nếu có thêm nguyên tố X". */
  universe?: readonly TeamChar[];
  reactions: readonly ReactionRule[];
  resonances: readonly ResonanceRule[];
  /**
   * id phản ứng muốn tập trung (vd "vaporize"). Bỏ trống = chế độ "phủ rộng": đếm số phản ứng + cộng hưởng.
   * Id không thuộc loại tính điểm (Lunar/Stellar) hoặc không tồn tại sẽ bị bỏ qua (về chế độ phủ rộng).
   */
  focus?: string;
  limit?: number;
  altLimit?: number;
}

export function suggestTeams(input: SuggestInput): SuggestResult {
  const { reactions, resonances } = input;
  const limit = input.limit ?? 6;
  const altLimit = input.altLimit ?? 6;
  const focus = input.focus
    ? reactions.find((r) => r.id === input.focus && SCORED_CATEGORIES.has(r.category))
    : undefined;
  // Chỉ nhận nguyên tố có trong luật phản ứng — loại các giá trị như "None" (Aether/Lumine, Manekin...).
  const knownElements = new Set(reactions.flatMap((r) => r.elements));
  const pinned = (input.pinned ?? []).slice(0, TEAM_SIZE).filter((c) => knownElements.has(c.element));
  const pinnedIds = new Set(pinned.map((p) => p.id));
  const k = TEAM_SIZE - pinned.length;

  // Pool đã loại nhân vật ghim; mỗi nguyên tố sắp theo độ hiếm giảm dần rồi theo tên (ổn định).
  const byElement = new Map<string, TeamChar[]>();
  for (const c of input.pool) {
    if (pinnedIds.has(c.id) || !knownElements.has(c.element)) continue;
    const list = byElement.get(c.element) ?? [];
    list.push(c);
    byElement.set(c.element, list);
  }
  for (const list of byElement.values()) {
    list.sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name));
  }
  const elements = [...new Set([...byElement.keys(), ...(input.universe ?? []).map((c) => c.element)])]
    .filter((e) => knownElements.has(e))
    .sort();
  const avail = new Map<string, number>(elements.map((e) => [e, byElement.get(e)?.length ?? 0]));
  const pinnedElements = pinned.map((p) => p.element);

  if (k === 0) {
    const s = scorePattern(pinnedElements, reactions, resonances, focus);
    return {
      teams: [buildTeam(pinned, [], pinnedElements, s, reactions, new Map(), altLimit)],
      hints: [],
    };
  }

  const patterns = rankPatterns(pinnedElements, elements, avail, k, reactions, resonances, focus);
  if (patterns.length === 0) {
    return {
      teams: [],
      hints: [],
      note: focus
        ? "Với danh sách nhân vật đang có, chưa lập được đội nào mở được phản ứng đã chọn."
        : "Danh sách nhân vật đang có chưa đủ để lập đủ đội 4 người.",
    };
  }

  const teams = patterns.slice(0, limit).map((p) => {
    // Lấy đại diện: mỗi nguyên tố lấy m nhân vật đầu danh sách (độ hiếm cao trước).
    const need = new Map<string, number>();
    for (const e of p.fill) need.set(e, (need.get(e) ?? 0) + 1);
    const chosen: TeamChar[] = [];
    for (const [el, m] of need) chosen.push(...(byElement.get(el) ?? []).slice(0, m));
    return buildTeam(pinned, chosen, p.elements, p, reactions, byElement, altLimit);
  });

  // Gợi ý "nếu có thêm nguyên tố X": thử giả định có sẵn nhân vật nguyên tố chưa sở hữu.
  const best = patterns[0];
  const hints: UpgradeHint[] = [];
  for (const el of elements) {
    if ((avail.get(el) ?? 0) > 0) continue;
    const hypo = new Map(avail);
    hypo.set(el, k);
    const top = rankPatterns(pinnedElements, elements, hypo, k, reactions, resonances, focus)[0];
    if (top && top.score > best.score) {
      hints.push({
        element: el,
        fromScore: best.score,
        toScore: top.score,
        newReactions: top.reactions.filter((r) => !best.reactions.includes(r)),
        newResonances: top.resonances.filter((r) => !best.resonances.includes(r)),
      });
    }
  }
  hints.sort((a, b) => b.toScore - a.toScore || a.element.localeCompare(b.element));

  return { teams, hints: hints.slice(0, 3) };
}

function buildTeam(
  pinned: readonly TeamChar[],
  chosen: readonly TeamChar[],
  memberElements: string[],
  s: Pick<Pattern, "reactions" | "resonances" | "score">,
  reactionRules: readonly ReactionRule[],
  byElement: Map<string, TeamChar[]>,
  altLimit: number
): SuggestedTeam {
  const members = [...pinned, ...chosen];
  const usedIds = new Set(members.map((m) => m.id));
  const slot = (character: TeamChar, isPinned: boolean): TeamSlot => ({
    character,
    pinned: isPinned,
    alternatives: isPinned
      ? []
      : (byElement.get(character.element) ?? []).filter((c) => !usedIds.has(c.id)).slice(0, altLimit),
  });
  return {
    slots: [...pinned.map((c) => slot(c, true)), ...chosen.map((c) => slot(c, false))],
    score: s.score,
    reactions: s.reactions,
    resonances: s.resonances,
    lunar: lunarReactions(members, reactionRules),
    elements: [...new Set(memberElements)],
  };
}
