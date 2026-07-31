// Định nghĩa mã màu phát sáng cho các Nguyên tố trong Genshin Impact
export const ELEMENT_COLORS: Record<string, string> = {
  Anemo: "#6FC6A3",
  Geo: "#CFA83E",
  Electro: "#B98FE0",
  Dendro: "#A2C93B",
  Hydro: "#4CC2F1",
  Pyro: "#EF7938",
  Cryo: "#8FE0E0",
};

export function elementColor(vision: string): string {
  return ELEMENT_COLORS[vision] || "#999999";
}

export function rarityStars(rarity: number): string {
  return "★".repeat(rarity);
}

// Sử dụng class từ globals.css – tự động thích ứng dark/light
export function rarityGlowClass(rarity: number): string {
  switch (rarity) {
    case 5: return "rarity-glow-5";
    case 4: return "rarity-glow-4";
    default: return "rarity-glow-3";
  }
}

export function rarityTextClass(rarity: number): string {
  switch (rarity) {
    case 5: return "text-amber-400 font-bold";
    case 4: return "text-purple-400 font-bold";
    default: return "text-blue-400 font-bold";
  }
}