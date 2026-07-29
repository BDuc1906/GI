// Định nghĩa mã màu phát sáng cho các Nguyên tố trong Genshin Impact
export const ELEMENT_COLORS: Record<string, string> = {
  Anemo: "#72e2c4",
  Geo: "#eec34b",
  Electro: "#bc8fe6",
  Dendro: "#a5c83b",
  Hydro: "#4cc3f1",
  Pyro: "#ec6646",
  Cryo: "#a0e8ef",
};

// Hàm lấy màu sắc nguyên tố nhanh
export function elementColor(vision: string): string {
  return ELEMENT_COLORS[vision] || "#999999";
}

// Hàm chuyển đổi số lượng sao thành ký tự biểu tượng ngôi sao hiển thị (★)
export function rarityStars(rarity: number): string {
  return "★".repeat(rarity);
}

// Định nghĩa Class Tailwind phát sáng theo phẩm cấp vật phẩm (3 sao, 4 sao, 5 sao)
export function rarityGlowClass(rarity: number): string {
  switch (rarity) {
    case 5:
      return "shadow-[0_0_15px_rgba(236,143,36,0.25)] border-amber-500/30";
    case 4:
      return "shadow-[0_0_15px_rgba(168,85,247,0.25)] border-purple-500/30";
    default:
      return "shadow-[0_0_15px_rgba(59,130,246,0.20)] border-blue-500/20";
  }
}

// Định nghĩa màu chữ cho số lượng sao hiển thị
export function rarityTextClass(rarity: number): string {
  switch (rarity) {
    case 5:
      return "text-amber-400 font-bold";
    case 4:
      return "text-purple-400 font-bold";
    default:
      return "text-blue-400 font-bold";
  }
}
