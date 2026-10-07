/**
 * src/lib/game/achievement-format.ts
 *
 * Đọc dữ liệu thành tựu từ cột `Achievement.raw` (nguyên bản ghi genshin-db):
 *   { stages: 1..3, stage1: { title, description, progress, reward: {id,name,count} }, stage2?, stage3? }
 * Lưu ý: `id` gốc của genshin-db là MẢNG (mỗi bậc một id) nên id trong DB có dạng
 * "80212,80213,80214" — chỉ dùng làm khoá, không hiển thị.
 */

export interface AchievementReward {
  id?: number;
  name: string;
  count?: number;
}

export interface AchievementStage {
  title?: string;
  description?: string;
  progress?: number;
  reward?: AchievementReward;
}

export interface AchievementRaw {
  stages?: number;
  stage1?: AchievementStage;
  stage2?: AchievementStage;
  stage3?: AchievementStage;
}

export function readAchievementRaw(raw: unknown): AchievementRaw {
  return raw && typeof raw === "object" ? (raw as AchievementRaw) : {};
}

/** Các bậc theo thứ tự, bỏ bậc trống. */
export function stagesOf(raw: unknown): AchievementStage[] {
  const r = readAchievementRaw(raw);
  return [r.stage1, r.stage2, r.stage3].filter((s): s is AchievementStage => Boolean(s));
}

/** Tổng Primogem nhận được khi hoàn thành mọi bậc. */
export function totalPrimogems(raw: unknown): number {
  return stagesOf(raw).reduce(
    (sum, s) => sum + (s.reward?.name === "Primogem" ? (s.reward.count ?? 0) : 0),
    0
  );
}

export function formatReward(r: AchievementReward | undefined): string | null {
  if (!r?.name) return null;
  return typeof r.count === "number" ? `${r.count} ${r.name}` : r.name;
}
