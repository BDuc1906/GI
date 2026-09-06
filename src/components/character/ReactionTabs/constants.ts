import { ELEMENTAL_REACTIONS, type DamageFormulaCategory } from "@/lib/game/element-reactions-data";

export const STANDARD_REACTIONS = ELEMENTAL_REACTIONS.filter(
  (r) => r.category !== "lunar" && r.category !== "stellar"
);
export const LUNAR_REACTIONS = ELEMENTAL_REACTIONS.filter((r) => r.category === "lunar");
export const STELLAR_REACTIONS = ELEMENTAL_REACTIONS.filter((r) => r.category === "stellar");

export const FORMULA_ORDER: DamageFormulaCategory[] = ["amplifying", "transformative", "additive", "lunarStellar"];

// Màu tiêu đề riêng cho từng khối công thức — tách biệt khỏi CATEGORY_COLOR
// (dùng cho badge trên thẻ phản ứng, kiểu ReactionCategory) vì "lunarStellar"
// gộp chung 2 category "lunar"+"stellar" thành 1 khối công thức, không có
// key tương ứng 1-1 trong CATEGORY_COLOR.
export const FORMULA_TITLE_COLOR: Record<DamageFormulaCategory, string> = {
  amplifying: "text-red-300",
  transformative: "text-slate-300",
  additive: "text-pink-300",
  lunarStellar: "text-indigo-300",
};
