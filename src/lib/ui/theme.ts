export function rarityStars(rarity: number): string {
  return "★".repeat(rarity);
}

export function rarityRibbonClass(rarity: number): string {
  if (rarity >= 5) return "rarity-ribbon rarity-ribbon-5";
  if (rarity === 4) return "rarity-ribbon rarity-ribbon-4";
  return "rarity-ribbon rarity-ribbon-3";
}

export function rarityDotClass(rarity: number): string {
  if (rarity >= 5) return "rarity-dot rarity-dot-5";
  if (rarity === 4) return "rarity-dot rarity-dot-4";
  return "rarity-dot rarity-dot-3";
}

export function rarityTextClass(rarity: number): string {
  if (rarity >= 5) return "text-[color:var(--rarity-5)] font-bold";
  if (rarity === 4) return "text-[color:var(--rarity-4)] font-bold";
  return "text-[color:var(--rarity-3)] font-bold";
}

/**
 * Map tên nguyên tố (giá trị `vision` trong DB, tiếng Anh: Pyro/Hydro/...)
 * sang biến CSS màu tương ứng — đây là hệ màu tương tác cốt lõi của thiết
 * kế v2, thay cho 1 accent vàng phủ khắp mọi hover ở bản trước.
 */
const ELEMENT_CSS_VAR: Record<string, string> = {
  Pyro: "var(--el-pyro)",
  Hydro: "var(--el-hydro)",
  Anemo: "var(--el-anemo)",
  Electro: "var(--el-electro)",
  Dendro: "var(--el-dendro)",
  Cryo: "var(--el-cryo)",
  Geo: "var(--el-geo)",
};

export function elementColorVar(vision?: string | null): string {
  if (!vision) return "var(--accent-500)";
  return ELEMENT_CSS_VAR[vision] ?? "var(--accent-500)";
}

/**
 * Vũ khí không có nguyên tố — yếu tố định danh thật của nó là phẩm cấp
 * (rarity). Dùng màu rarity làm --el cho EntityCard/hero vũ khí, thay vì
 * luôn vàng hay phải bịa ra 1 hệ màu mới không có căn cứ trong game.
 */
export function rarityColorVar(rarity: number): string {
  if (rarity >= 5) return "var(--rarity-5)";
  if (rarity === 4) return "var(--rarity-4)";
  return "var(--rarity-3)";
}
