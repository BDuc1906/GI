/**
 * src/lib/game/food-format.ts
 *
 * Đọc/định dạng dữ liệu món ăn từ cột `Food.raw` (nguyên bản ghi genshin-db).
 * Nhãn tiếng Việt do dự án tự đặt, KHÔNG phải bản địa hoá chính thức của game.
 */

export const FOOD_TYPE_LABEL: Record<string, string> = {
  NORMAL: "Món thường",
  SPECIALTY: "Món đặc biệt",
};

export const FOOD_FILTER_LABEL: Record<string, string> = {
  COOK_FOOD_HEAL: "Món hồi phục",
  COOK_FOOD_ATTACK: "Món tăng Tấn công",
  COOK_FOOD_DEFENSE: "Món tăng Phòng thủ",
  COOK_FOOD_FUNCTION: "Món của nhà thám hiểm",
};

export const QUALITY_LABEL = {
  suspicious: "Kỳ quái (Suspicious)",
  normal: "Thường (Normal)",
  delicious: "Ngon tuyệt (Delicious)",
} as const;

export interface FoodIngredient {
  id?: number;
  name: string;
  count?: number;
}

export interface FoodQuality {
  effect?: string;
  description?: string;
}

export interface FoodRaw {
  effect?: string;
  description?: string;
  filterText?: string;
  ingredients?: FoodIngredient[];
  suspicious?: FoodQuality;
  normal?: FoodQuality;
  delicious?: FoodQuality;
  baseDishName?: string;
  characterName?: string;
}

export function readFoodRaw(raw: unknown): FoodRaw {
  return raw && typeof raw === "object" ? (raw as FoodRaw) : {};
}

export function stars(rarity: number | null | undefined): string {
  return rarity && rarity > 0 ? "★".repeat(Math.min(rarity, 5)) : "";
}
