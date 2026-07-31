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