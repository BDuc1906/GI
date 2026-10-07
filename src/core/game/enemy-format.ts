/**
 * src/lib/game/enemy-format.ts
 *
 * Đọc và định dạng dữ liệu kẻ địch từ cột `Enemy.raw` (nguyên bản ghi genshin-db).
 * CHỈ dùng trường có trong nguồn — không suy diễn điểm yếu/độ khó/vùng xuất hiện
 * (xem mục "Enemy metadata mở rộng" trong docs audit: các cột đó cố tình để trống).
 *
 * Nhãn tiếng Việt dưới đây do dự án tự đặt, KHÔNG phải bản địa hoá chính thức của
 * game; tên tiếng Anh gốc luôn được giữ ở thuộc tính title/ghi chú.
 */

export const ENEMY_TYPE_LABEL: Record<string, string> = {
  COMMON: "Thường",
  ELITE: "Tinh anh",
  BOSS: "Boss",
};

export const ENEMY_CATEGORY_LABEL: Record<string, string> = {
  CODEX_SUBTYPE_BEAST: "Thú thần bí",
  CODEX_SUBTYPE_HUMAN: "Thế lực loài người khác",
  CODEX_SUBTYPE_ELEMENTAL: "Sinh vật nguyên tố",
  CODEX_SUBTYPE_AUTOMATRON: "Cỗ máy",
  CODEX_SUBTYPE_HILICHURL: "Hilichurl",
  CODEX_SUBTYPE_FATUI: "Fatui",
  CODEX_SUBTYPE_ABYSS: "Vực Sâu",
  CODEX_SUBTYPE_BOSS: "Kẻ địch đáng chú ý",
};

export interface EnemyDrop {
  id?: number;
  name: string;
  count?: number;
}

export interface EnemyRaw {
  description?: string;
  specialNames?: string[];
  categoryText?: string;
  investigation?: {
    name?: string;
    categoryText?: string;
    description?: string;
  };
  rewardPreview?: EnemyDrop[];
}

export function readEnemyRaw(raw: unknown): EnemyRaw {
  return raw && typeof raw === "object" ? (raw as EnemyRaw) : {};
}

/** Nguồn đôi khi chứa chuỗi "\n" ở dạng ký tự thật (backslash + n). */
export function cleanText(s: string | undefined | null): string {
  return (s ?? "").replace(/\\n/g, "\n").trim();
}

export function paragraphs(s: string | undefined | null): string[] {
  return cleanText(s)
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** 200 → "200"; 0.0450 → "0.045"; undefined → null. */
export function formatAmount(n: number | undefined | null): string | null {
  if (typeof n !== "number" || !Number.isFinite(n)) return null;
  if (Number.isInteger(n)) return String(n);
  return String(Number(n.toFixed(3)));
}

/** Bỏ dấu + hạ chữ thường để tìm kiếm không phân biệt dấu. */
export function normalizeSearch(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .trim();
}
