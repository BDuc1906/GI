/**
 * src/lib/element-reactions-data.ts
 *
 * Dữ liệu TĨNH, viết tay theo đúng cơ chế phản ứng nguyên tố chính thức
 * trong game. genshin-db không có mục riêng cho "phản ứng nguyên tố"/
 * "cơ chế phe phái" nên không lấy qua đó được — toàn bộ tra cứu thủ công
 * từ Wiki Genshin Impact (Fandom) + các trang tin game uy tín, đối chiếu
 * chéo nhiều nguồn trước khi ghi vào đây.
 *
 * LỊCH SỬ SỬA (đọc trước khi sửa tiếp, tránh lặp lại lỗi cũ):
 *   - Tên phản ứng Thảo từng bị nhầm lẫn hàng loạt, đã sửa đúng theo
 *     game: Bloom="Sum Suê", Quicken="Sinh Trưởng", Aggravate="Tăng
 *     Cường", Spread="Lan Tràn", Hyperbloom="Nở Rộ", Burgeon="Bung Tỏa".
 *   - Tên tiếng Anh chính thức bản 7.0 là "Stellar Glimmer" (Stellar-
 *     Conduct, Stellar-Swirl) — không phải "Starglow" tôi tự đặt tạm.
 *   - KHÔNG gắn cứng "ra mắt bản 5.8" cho mọi phản ứng Nguyệt — mỗi nhân
 *     vật kích hoạt ra mắt ở version KHÁC NHAU (Ineffa/Flins/Lauma/Aino
 *     ở 6.0, Columbina/Zibai ở 6.3, Linnea ở 6.5...), gắn 1 số chung sẽ
 *     sai. Đã bỏ hẳn field version hiển thị nổi bật, chỉ giữ trong
 *     comment để tham khảo nội bộ.
 *   - Hexerei (Bài Tập Của Ma Nữ) và Witch's Revelation (Khải Huyền Của
 *     Ma Nữ) là 2 cơ chế KHÁC NHAU dù tên tiếng Anh na ná nhau:
 *       + Hexerei = "Witch's Homework" (bản 6.2 + sóng 2 bản 6.6),
 *         cho nhân vật Mondstadt cũ + witch mới, KHÔNG liên quan Stellar.
 *       + Witch's Revelation = "Khải Huyền Của Ma Nữ" (bản 6.7), 7 nhân
 *         vật, gắn trực tiếp với phản ứng Stellar-Conduct.
 *     Trước đây bỏ sót "sóng 2" của Hexerei (6.6) và toàn bộ Witch's
 *     Revelation — đã bổ sung đủ.
 */

export const ELEMENTS = [
  { id: "pyro", name: "Pyro", nameVi: "Hỏa", color: "#EF7940" },
  { id: "hydro", name: "Hydro", nameVi: "Thủy", color: "#4CC2F1" },
  { id: "cryo", name: "Cryo", nameVi: "Băng", color: "#9FE0E8" },
  { id: "electro", name: "Electro", nameVi: "Lôi", color: "#B380E6" },
  { id: "anemo", name: "Anemo", nameVi: "Phong", color: "#6FD9BC" },
  { id: "geo", name: "Geo", nameVi: "Nham", color: "#F7CB53" },
  { id: "dendro", name: "Dendro", nameVi: "Thảo", color: "#A8CB3A" },
] as const;

export function elementColor(name: string): string {
  return ELEMENTS.find((e) => e.name === name)?.color ?? "#C9A66B";
}

export const ELEMENT_ICON_URLS: Record<string, string> = {
  Pyro: "https://static.wikia.nocookie.net/gensin-impact/images/2/2c/Element_Pyro.svg",
  Hydro: "https://static.wikia.nocookie.net/gensin-impact/images/8/80/Element_Hydro.svg",
  Cryo: "https://static.wikia.nocookie.net/gensin-impact/images/7/72/Element_Cryo.svg",
  Electro: "https://static.wikia.nocookie.net/gensin-impact/images/f/ff/Element_Electro.svg",
  Anemo: "https://static.wikia.nocookie.net/gensin-impact/images/1/10/Element_Anemo.svg",
  Geo: "https://static.wikia.nocookie.net/gensin-impact/images/9/9b/Element_Geo.svg",
  Dendro: "https://static.wikia.nocookie.net/gensin-impact/images/7/73/Element_Dendro.svg",
};

export type ReactionCategory = "amplifying" | "transformative" | "additive" | "lunar" | "stellar";

export interface ElementalReaction {
  id: string;
  name: string;
  nameVi: string;
  elements: string[];
  category: ReactionCategory;
  description: string;
  requiresCharacters?: string;
  // Nguyên tố dùng để tô màu chữ tên phản ứng cho Nguyệt/Stellar (nguyên
  // tố "đặc trưng" của biến thể đó, khác với nguyên tố nền dùng chung
  // như Thủy/Băng). Không áp dụng cho phản ứng thường.
  accentElement?: string;
}

export const ELEMENTAL_REACTIONS: ElementalReaction[] = [
  { id: "vaporize", name: "Vaporize", nameVi: "Bốc Hơi", elements: ["Hydro", "Pyro"], category: "amplifying", description: "Hỏa gặp Thủy (hoặc ngược lại). Nhân sát thương đòn đánh gây phản ứng: x2 nếu Thủy tác dụng trước lên Hỏa có sẵn, x1.5 nếu Hỏa tác dụng trước lên Thủy có sẵn." },
  { id: "melt", name: "Melt", nameVi: "Tan Chảy", elements: ["Pyro", "Cryo"], category: "amplifying", description: "Hỏa gặp Băng (hoặc ngược lại). Nhân sát thương đòn đánh gây phản ứng: x2 nếu Hỏa tác dụng lên Băng có sẵn, x1.5 nếu Băng tác dụng lên Hỏa có sẵn." },
  { id: "overloaded", name: "Overloaded", nameVi: "Quá Tải", elements: ["Pyro", "Electro"], category: "transformative", description: "Hỏa gặp Lôi. Gây sát thương Hỏa lan tỏa diện rộng kèm hất tung mục tiêu và các mục tiêu xung quanh." },
  { id: "superconduct", name: "Superconduct", nameVi: "Siêu Dẫn", elements: ["Cryo", "Electro"], category: "transformative", description: "Băng gặp Lôi. Gây sát thương Băng diện rộng, đồng thời giảm Kháng Vật Lý của mục tiêu trúng đòn." },
  { id: "electro-charged", name: "Electro-Charged", nameVi: "Điện Cảm", elements: ["Electro", "Hydro"], category: "transformative", description: "Lôi gặp Thủy. Gây sát thương Lôi liên tục theo thời gian, có thể lan sang mục tiêu dính Thủy gần đó." },
  { id: "frozen", name: "Frozen", nameVi: "Đóng Băng", elements: ["Cryo", "Hydro"], category: "transformative", description: "Băng gặp Thủy. Đóng băng mục tiêu, vô hiệu hóa hành động trong thời gian ngắn. Đòn phá băng gây 200% sát thương." },
  { id: "swirl", name: "Swirl", nameVi: "Khuếch Tán", elements: ["Anemo", "Pyro", "Hydro", "Cryo", "Electro"], category: "transformative", description: "Phong gặp Hỏa/Thủy/Băng/Lôi. Gây sát thương Phong diện rộng theo nguyên tố bị khuếch tán, đồng thời lan nguyên tố đó sang các mục tiêu xung quanh." },
  { id: "crystallize", name: "Crystallize", nameVi: "Kết Tinh", elements: ["Geo", "Pyro", "Hydro", "Cryo", "Electro"], category: "transformative", description: "Nham gặp Hỏa/Thủy/Băng/Lôi. Tạo ra tinh thể bảo vệ mang nguyên tố tương ứng, nhặt lên để nhận khiên chắn nguyên tố đó." },
  { id: "burning", name: "Burning", nameVi: "Thiêu Đốt", elements: ["Pyro", "Dendro"], category: "transformative", description: "Hỏa gặp Thảo. Gây sát thương Hỏa liên tục theo thời gian trong vùng cháy, có thể lan sang thực vật/mục tiêu dính Thảo khác." },
  { id: "bloom", name: "Bloom", nameVi: "Sum Suê", elements: ["Dendro", "Hydro"], category: "transformative", description: "Thảo gặp Thủy. Tạo Hạt Nhân Thảo (Seed Core) — sau thời gian ngắn sẽ tự nổ gây sát thương Thảo diện rộng." },
  { id: "hyperbloom", name: "Hyperbloom", nameVi: "Nở Rộ", elements: ["Dendro", "Hydro", "Electro"], category: "transformative", description: "Lôi tác động lên Hạt Nhân Thảo (sau Sum Suê). Hạt Nhân biến thành đạn truy đuổi mục tiêu, gây sát thương Lôi." },
  { id: "burgeon", name: "Burgeon", nameVi: "Bung Tỏa", elements: ["Dendro", "Hydro", "Pyro"], category: "transformative", description: "Hỏa tác động lên Hạt Nhân Thảo (sau Sum Suê). Hạt Nhân nổ mạnh diện rộng lớn hơn, gây sát thương Hỏa." },
  { id: "quicken", name: "Quicken", nameVi: "Sinh Trưởng", elements: ["Dendro", "Electro"], category: "additive", description: "Thảo gặp Lôi. Tạo dấu Sinh Trưởng trên mục tiêu — không gây sát thương ngay mà làm nền cho Tăng Cường/Lan Tràn." },
  { id: "aggravate", name: "Aggravate", nameVi: "Tăng Cường", elements: ["Dendro", "Electro"], category: "amplifying", description: "Lôi tác động lên mục tiêu đang có dấu Sinh Trưởng. Khuếch đại sát thương Lôi của đòn gây phản ứng." },
  { id: "spread", name: "Spread", nameVi: "Lan Tràn", elements: ["Dendro", "Electro"], category: "amplifying", description: "Thảo tác động lên mục tiêu đang có dấu Sinh Trưởng. Khuếch đại sát thương Thảo của đòn gây phản ứng." },

  // ---- Phản ứng Nguyệt (Lunar Reactions, cơ chế Moonsign) ----
  // accentElement = nguyên tố KHÔNG PHẢI Thủy (Thủy dùng chung cả 3),
  // dùng để tô màu tên phản ứng theo đúng nguyên tố đặc trưng.
  {
    id: "lunar-charged", name: "Lunar-Charged", nameVi: "Nguyệt-Điện Cảm",
    elements: ["Electro", "Hydro"], category: "lunar", accentElement: "Electro",
    description: "Bản nâng cấp của Điện Cảm khi có nhân vật Moonsign phù hợp — triệu hồi đám mây sấm gây sát thương Lôi liên tục, CÓ THỂ bạo kích.",
    requiresCharacters: "Ineffa, Flins, Columbina",
  },
  {
    id: "lunar-bloom", name: "Lunar-Bloom", nameVi: "Nguyệt-Sum Suê",
    elements: ["Dendro", "Hydro"], category: "lunar", accentElement: "Dendro",
    description: "Bản nâng cấp của Sum Suê — tạo tối đa 3 giọt Sương Xanh (Verdant Dew) để nhân vật liên quan tiêu thụ, gây sát thương CÓ THỂ bạo kích.",
    requiresCharacters: "Lauma, Nefer",
  },
  {
    id: "lunar-crystallize", name: "Lunar-Crystallize", nameVi: "Nguyệt-Kết Tinh",
    elements: ["Geo", "Hydro"], category: "lunar", accentElement: "Geo",
    description: "Bản nâng cấp của Kết Tinh — triệu hồi 3 Mảnh Trôi Nguyệt (Moondrift). Đủ 3 lần sẽ gây 1 đòn sát thương CÓ THỂ bạo kích.",
    requiresCharacters: "Zibai, Linnea",
  },

  // ---- Stellar Glimmer (bản 6.7–7.0, Snezhnaya) ----
  {
    id: "stellar-conduct", name: "Stellar-Conduct", nameVi: "Tinh Vực-Siêu Dẫn",
    elements: ["Cryo", "Electro"], category: "stellar", accentElement: "Electro",
    description: "Bản nâng cấp của Siêu Dẫn: tạo Lăng Kính Sao (Starlight Prism), biến khu vực xung quanh thành Vùng Trục Sao (Polestar Field) — Lôi/Băng/Tinh Vực-Siêu Dẫn gây thêm sát thương cho mục tiêu trong vùng.",
    requiresCharacters: "Kích hoạt: Sandrone, Odette, Traveler (Cryo). Được nâng cấp thêm (Witch's Revelation): Wriothesley, Yae Miko, Cyno, Qiqi, Diona, Beidou, Yumemizuki Mizuki",
  },
  {
    id: "stellar-swirl", name: "Stellar-Swirl", nameVi: "Tinh Vực-Khuếch Tán",
    elements: ["Anemo", "Cryo"], category: "stellar", accentElement: "Anemo",
    description: "Bản nâng cấp của Khuếch Tán Băng: gây 1 đòn ngay lập tức rồi tạo Cụm Gió Tinh Tú (Polestar Wind Cluster: Cryo) — nổ chậm gây sát thương Băng diện rộng, CÓ THỂ bạo kích cả 2 đòn.",
    requiresCharacters: "Kích hoạt: Odette, Traveler (Cryo), Sandrone. Hưởng lợi thêm: Mizuki, Varka, Skirk, Qiqi, Venti, Kazuha, Sucrose, Prune, Sayu, Diona, Faruzan",
  },
];

export function reactionsInvolving(elementName: string): ElementalReaction[] {
  return ELEMENTAL_REACTIONS.filter((r) => r.elements.includes(elementName));
}

// ---- Cộng hưởng Nguyên tố (Elemental Resonance) ----
export interface ElementalResonance {
  id: string;
  element: string;
  nameVi: string;
  description: string;
}

export const ELEMENTAL_RESONANCES: ElementalResonance[] = [
  { id: "fervent-flames", element: "Pyro", nameVi: "Ngọn Lửa Nồng Nhiệt", description: "Giảm 40% thời gian bị Đóng Băng. Tăng 25% Tấn công cho toàn đội." },
  { id: "soothing-water", element: "Hydro", nameVi: "Dòng Nước Xoa Dịu", description: "Giảm 40% thời gian bị Thiêu Đốt. Tăng 30% hiệu quả hồi máu cho toàn đội." },
  { id: "high-voltage", element: "Electro", nameVi: "Điện Áp Cao", description: "Giảm 40% thời gian bị ẩm ướt. Siêu Dẫn/Quá Tải/Điện Cảm có 100% cơ hội tạo thêm 1 Hạt Nguyên Tố Lôi (hồi 5 giây)." },
  { id: "shattering-ice", element: "Cryo", nameVi: "Băng Giá Vỡ Vụn", description: "Giảm 40% thời gian bị nhiễm điện. Tăng 15% tỉ lệ bạo kích lên kẻ địch đóng băng/bị ảnh hưởng Băng." },
  { id: "impetuous-winds", element: "Anemo", nameVi: "Cuồng Phong", description: "Tăng 10% tốc độ di chuyển và tốc độ hồi Thể Lực. Giảm 15% tiêu hao Thể Lực. Giảm 5% hồi chiêu Kỹ Năng/Trọng Kích." },
  { id: "enduring-rock", element: "Geo", nameVi: "Nham Thạch Vững Bền", description: "Tăng 15% Tấn công khi có khiên bảo vệ. Giảm khả năng bị choáng và sát thương từ đòn trực diện." },
  { id: "protective-canopy", element: "Dendro", nameVi: "Tán Lá Bảo Hộ", description: "Tăng Kháng Nguyên Tố Thảo cho toàn đội (tăng thêm nếu kết hợp nguyên tố khác)." },
];

// ---- Cộng hưởng Nguyệt (Lunar Resonance, bản 6.0) ----
export interface LunarResonanceScaling {
  elements: string[];
  statLabel: string;
  ratePerUnit: string;
  // Ví dụ cụ thể để hình dung mức buff thật, đối chiếu KQM
  // (keqingmains.com/misc/nod-krai-guide).
  example: string;
}

export const LUNAR_RESONANCE = {
  nameVi: "Cộng hưởng Nguyệt",
  requirement: "Cần đội hình đạt Moonsign Level = Ascendant Gleam (≥2 nhân vật Moonsign, vd Ineffa/Flins/Aino/Lauma/Nefer trong đội).",
  description: "Mỗi khi 1 nhân vật KHÔNG sở hữu Moonsign tung Kỹ Năng hoặc Trọng Kích, toàn đội nhận buff Sát Thương Phản Ứng Nguyệt 20 giây, tính theo chỉ số của chính nhân vật đó. KHÔNG cộng dồn — dùng chiêu lại sẽ làm mới theo giá trị mới, không phải cộng thêm.",
  scalings: [
    { elements: ["Pyro", "Electro", "Cryo"], statLabel: "Tấn công (ATK)", ratePerUnit: "+0.9% mỗi 100 ATK", example: "Raiden Shogun 2.000 ATK → +18% Sát Thương Nguyệt" },
    { elements: ["Hydro"], statLabel: "HP tối đa", ratePerUnit: "+0.6% mỗi 1000 HP", example: "Furina 30.000 HP → +18% Sát Thương Nguyệt" },
    { elements: ["Geo"], statLabel: "Phòng thủ (DEF)", ratePerUnit: "+1% mỗi 100 DEF", example: "Nhân vật Geo ~1.800 DEF → +18% Sát Thương Nguyệt" },
    { elements: ["Anemo", "Dendro"], statLabel: "Tinh Thông Nguyên Tố (EM)", ratePerUnit: "+2.25% mỗi 100 EM", example: "Kazuha ~800 EM → +18% Sát Thương Nguyệt" },
  ] as LunarResonanceScaling[],
  maxBonus: "36% (giới hạn cứng, dù tính ra cao hơn cũng không vượt quá)",
  gameVersion: "6.0",
};

// ---- Hexerei: Bí Mật Nghi Thức ("Bài Tập Của Ma Nữ" / Witch's Homework) ----
// Cơ chế phe phái Mondstadt, KHÔNG liên quan phản ứng nguyên tố. Kích
// hoạt khi có ≥2 nhân vật Hexerei trong đội, sau khi mỗi nhân vật đã
// hoàn thành nhiệm vụ "Bài Tập Của Ma Nữ" (Witch's Homework) riêng —
// nhân vật Hexenzirkel mới (Nicole/Lohen/Prune) thì có sẵn không cần
// nhiệm vụ. Ra mắt bản 6.2 (7 nhân vật), thêm sóng 2 ở bản 6.6 (7 nhân
// vật + 3 witch mới) — tổng 18 nhân vật.
export const HEXEREI_WAVE_1 = ["Durin", "Razor", "Fischl", "Sucrose", "Mona", "Venti", "Klee", "Albedo"] as const; // bản 6.2
export const HEXEREI_WAVE_2 = ["Amber", "Kaeya", "Lisa", "Jean", "Noelle", "Mika", "Eula"] as const; // bản 6.6
export const HEXEREI_NEW_WITCHES = ["Nicole", "Lohen", "Prune"] as const; // bản 6.6, witch mới có sẵn Hexerei không cần Bài Tập

export const HEXEREI_CHARACTERS = [...HEXEREI_WAVE_1, ...HEXEREI_WAVE_2, ...HEXEREI_NEW_WITCHES] as const;

export const HEXEREI_INFO = {
  nameVi: "Hexerei: Bí Mật Nghi Thức",
  requirement: `Nhân vật Mondstadt cũ cần hoàn thành "Bài Tập Của Ma Nữ" (Witch's Homework) để mở khoá tư cách Hexerei; witch mới (Nicole/Lohen/Prune) có sẵn không cần làm nhiệm vụ. Cần ≥2 nhân vật Hexerei trong đội mới kích hoạt hiệu ứng.`,
  description: "Mỗi nhân vật Hexerei được nâng cấp riêng 1 thiên phú/chiêu thức/mệnh cung khi đứng cùng đội với 1 nhân vật Hexerei khác — không phải buff chỉ số chung cho toàn đội như Cộng hưởng Nguyên tố.",
};

// ---- Khải Huyền Của Ma Nữ (Witch's Revelation) ----
// KHÁC HEXEREI dù tên na ná — đây là cơ chế gắn với phản ứng Stellar-
// Conduct, ra mắt bản 6.7. 7 nhân vật, không cần ≥2 người mới có hiệu
// lực (mỗi người tự kích hoạt buff riêng khi ở trong Polestar Field).
export const WITCH_REVELATION_CHARACTERS = [
  "Wriothesley", "Yae Miko", "Cyno", "Qiqi", "Diona", "Beidou", "Yumemizuki Mizuki",
] as const;

export const WITCH_REVELATION_INFO = {
  nameVi: "Khải Huyền Của Ma Nữ",
  requirement: `Sở hữu nhân vật ≥ cấp 70, hoàn thành nhiệm vụ "Revelations by Chance" lấy Hộp Khải Huyền, sau đó làm nhiệm vụ Khải Huyền riêng cho từng nhân vật.`,
  description: "Mở khoá thêm 1 thiên phú + nâng cấp mệnh cung C1/C2/C4/C6. Khi đứng trong Vùng Trục Sao (Polestar Field) do Stellar-Conduct tạo ra, nhân vật vào trạng thái Radiance: Stellar-Conduct, nhận thêm hiệu ứng/sát thương Stellar-Conduct riêng.",
  gameVersion: "6.7",
};