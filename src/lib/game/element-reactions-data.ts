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

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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

/**
 * Màu badge theo category phản ứng — nguồn DUY NHẤT, dùng chung cho cả
 * ReactionTabs.tsx và elements/page.tsx (trước đây định nghĩa lặp lại ở
 * 2 file, dẫn tới rủi ro lệch nhau — đã gộp về đây sau khi phát hiện bug
 * chọn màu trùng màu nguyên tố thật).
 *
 * NGUYÊN TẮC CHỌN MÀU (quan trọng, đừng đổi tuỳ tiện): 5 màu category này
 * PHẢI khác hẳn 7 màu nguyên tố ở ELEMENTS bên dưới, nếu không người xem
 * sẽ tưởng nhầm màu category là màu nguyên tố (đã xảy ra thật: transformative
 * dùng purple-500 trùng gần như y hệt Electro #B380E6, additive dùng
 * emerald-500 trùng Anemo #6FD9BC — khiến "Đóng Băng" (Cryo+Hydro, chẳng
 * liên quan Electro) hiện badge tím y hệt màu Lôi, gây hiểu lầm).
 * 7 màu nguyên tố hiện có: Pyro=cam(#EF7940), Hydro=xanh dương nhạt
 * (#4CC2F1), Cryo=xanh cyan nhạt(#9FE0E8), Electro=tím(#B380E6), Anemo=
 * xanh ngọc(#6FD9BC), Geo=vàng(#F7CB53), Dendro=xanh lá mạ(#A8CB3A).
 * => 5 màu category chọn dưới đây CỐ Ý nằm ngoài toàn bộ dải màu trên:
 * đỏ, xám trung tính, hồng, chàm (indigo), hồng tím (fuchsia).
 */
export const CATEGORY_COLOR: Record<ReactionCategory, string> = {
  amplifying: "border-red-500/50 bg-red-500/10 text-red-300",
  transformative: "border-slate-400/50 bg-slate-400/10 text-slate-300",
  additive: "border-pink-400/50 bg-pink-400/10 text-pink-300",
  lunar: "border-indigo-400/50 bg-indigo-400/10 text-indigo-300",
  stellar: "border-fuchsia-400/50 bg-fuchsia-400/10 text-fuchsia-300",
};

export interface ElementalReaction {
  id: string;
  name: string;
  nameVi: string;
  elements: string[];
  category: ReactionCategory;
  description: string;
  requiresCharacters?: string;
  // Nguyên tố dùng để tô màu chữ tên phản ứng + pill (elements/page.tsx,
  // reactionAccentColor bên dưới) — nguyên tố "đặc trưng"/thị giác thật
  // sự của phản ứng đó, KHÔNG PHẢI cứ lấy phần tử đầu của elements[].
  // Quy ước chọn (đối chiếu icon/hiệu ứng thật trong game):
  //   - Khuếch Tán (Swirl) / Kết Tinh (Crystallize): luôn là nguyên tố
  //     KÍCH HOẠT cố định (Anemo / Geo) — nguyên tố bị cuốn theo thay đổi
  //     tuỳ trận nên không dùng làm màu đại diện được.
  //   - Đóng Băng: Cryo (hiệu ứng đóng băng rõ ràng nhất là băng giá).
  //   - Sinh Trưởng/Tăng Cường/Lan Tràn (Quicken/Aggravate/Spread): Dendro
  //     — cả 3 đều hiện dấu hiệu vàng-xanh lá đặc trưng của Dendro trong
  //     game, dù có Lôi tham gia.
  //   - Nở Rộ (Hyperbloom): Electro — chính Lôi là thứ biến hạt giống
  //     thành đạn truy đuổi. Bung Tỏa (Burgeon): Pyro — chính Hỏa là thứ
  //     làm hạt giống nổ mạnh hơn.
  //   - Phản ứng Khuếch Đại (Bốc Hơi/Tan Chảy) CỐ TÌNH không đặt
  //     accentElement — giữ tông đỏ cam "nhân sát thương" chung, đúng quy
  //     ước cộng đồng/wiki thay vì tô theo 1 trong 2 nguyên tố tham gia.
  accentElement?: string;
}

export const ELEMENTAL_REACTIONS: ElementalReaction[] = [
  { id: "vaporize", name: "Vaporize", nameVi: "Bốc Hơi", elements: ["Hydro", "Pyro"], category: "amplifying", description: "Hỏa gặp Thủy (hoặc ngược lại). Nhân sát thương đòn đánh gây phản ứng: x2 nếu Thủy tác dụng trước lên Hỏa có sẵn, x1.5 nếu Hỏa tác dụng trước lên Thủy có sẵn." },
  { id: "melt", name: "Melt", nameVi: "Tan Chảy", elements: ["Pyro", "Cryo"], category: "amplifying", description: "Hỏa gặp Băng (hoặc ngược lại). Nhân sát thương đòn đánh gây phản ứng: x2 nếu Hỏa tác dụng lên Băng có sẵn, x1.5 nếu Băng tác dụng lên Hỏa có sẵn." },
  { id: "overloaded", name: "Overloaded", nameVi: "Quá Tải", elements: ["Pyro", "Electro"], category: "transformative", accentElement: "Pyro", description: "Hỏa gặp Lôi. Gây sát thương Hỏa lan tỏa diện rộng kèm hất tung mục tiêu và các mục tiêu xung quanh." },
  { id: "superconduct", name: "Superconduct", nameVi: "Siêu Dẫn", elements: ["Cryo", "Electro"], category: "transformative", accentElement: "Cryo", description: "Băng gặp Lôi. Gây sát thương Băng diện rộng, đồng thời giảm 40% Kháng Vật Lý của mục tiêu trúng đòn trong 12 giây." },
  { id: "electro-charged", name: "Electro-Charged", nameVi: "Điện Cảm", elements: ["Electro", "Hydro"], category: "transformative", accentElement: "Electro", description: "Lôi gặp Thủy. Gây sát thương Lôi liên tục theo thời gian, có thể lan sang mục tiêu dính Thủy gần đó." },
  { id: "frozen", name: "Frozen", nameVi: "Đóng Băng", elements: ["Cryo", "Hydro"], category: "transformative", accentElement: "Cryo", description: "Băng gặp Thủy. Đóng băng mục tiêu, vô hiệu hóa hành động trong thời gian ngắn — bản thân Đóng Băng KHÔNG gây sát thương. Đòn \"phá băng\" (Vỡ Băng/Shattered) bằng Đại Kiếm hoặc kỹ năng Nham sau đó mới gây sát thương, tính theo công thức Phản ứng Biến Đổi (xem mục Công Thức Tính Sát Thương)." },
  { id: "swirl", name: "Swirl", nameVi: "Khuếch Tán", elements: ["Anemo", "Pyro", "Hydro", "Cryo", "Electro"], category: "transformative", accentElement: "Anemo", description: "Phong gặp Hỏa/Thủy/Băng/Lôi. Gây sát thương DIỆN RỘNG ĐÚNG THEO nguyên tố bị cuốn theo (Khuếch Tán Hỏa gây sát thương Hỏa, Khuếch Tán Lôi gây sát thương Lôi...) — KHÔNG phải sát thương Phong. Ngoại lệ: Khuếch Tán Thủy không gây sát thương, chỉ lan trạng thái Ướt. Đồng thời lan nguyên tố đó sang các mục tiêu xung quanh (trừ mục tiêu gốc)." },
  { id: "crystallize", name: "Crystallize", nameVi: "Kết Tinh", elements: ["Geo", "Pyro", "Hydro", "Cryo", "Electro"], category: "transformative", accentElement: "Geo", description: "Nham gặp Hỏa/Thủy/Băng/Lôi. Tạo ra tinh thể bảo vệ mang nguyên tố tương ứng, nhặt lên để nhận khiên chắn nguyên tố đó." },
  { id: "burning", name: "Burning", nameVi: "Thiêu Đốt", elements: ["Pyro", "Dendro"], category: "transformative", accentElement: "Pyro", description: "Hỏa gặp Thảo. Gây sát thương Hỏa liên tục theo thời gian trong vùng cháy, có thể lan sang thực vật/mục tiêu dính Thảo khác." },
  { id: "bloom", name: "Bloom", nameVi: "Sum Suê", elements: ["Dendro", "Hydro"], category: "transformative", accentElement: "Dendro", description: "Thảo gặp Thủy. Tạo Hạt Nhân Thảo (Seed Core) — sau thời gian ngắn sẽ tự nổ gây sát thương Thảo diện rộng." },
  { id: "hyperbloom", name: "Hyperbloom", nameVi: "Nở Rộ", elements: ["Dendro", "Hydro", "Electro"], category: "transformative", accentElement: "Electro", description: "Lôi tác động lên Hạt Nhân Thảo (sau Sum Suê). Hạt Nhân biến thành đạn truy đuổi mục tiêu, gây sát thương Lôi." },
  { id: "burgeon", name: "Burgeon", nameVi: "Bung Tỏa", elements: ["Dendro", "Hydro", "Pyro"], category: "transformative", accentElement: "Pyro", description: "Hỏa tác động lên Hạt Nhân Thảo (sau Sum Suê). Hạt Nhân nổ mạnh diện rộng lớn hơn, gây sát thương Hỏa." },
  { id: "quicken", name: "Quicken", nameVi: "Sinh Trưởng", elements: ["Dendro", "Electro"], category: "additive", accentElement: "Dendro", description: "Thảo gặp Lôi. Tạo dấu Sinh Trưởng trên mục tiêu — không gây sát thương ngay mà làm nền cho Tăng Cường/Lan Tràn." },
  { id: "aggravate", name: "Aggravate", nameVi: "Tăng Cường", elements: ["Dendro", "Electro"], category: "additive", accentElement: "Dendro", description: "Lôi tác động lên mục tiêu đang có dấu Sinh Trưởng. CỘNG THÊM sát thương Lôi vào đòn gây phản ứng (không phải nhân lên như Khuếch Đại) — hệ số 1.15, xem công thức chi tiết ở mục Công Thức Tính Sát Thương." },
  { id: "spread", name: "Spread", nameVi: "Lan Tràn", elements: ["Dendro", "Electro"], category: "additive", accentElement: "Dendro", description: "Thảo tác động lên mục tiêu đang có dấu Sinh Trưởng. CỘNG THÊM sát thương Thảo vào đòn gây phản ứng (không phải nhân lên như Khuếch Đại) — hệ số 1.25, xem công thức chi tiết ở mục Công Thức Tính Sát Thương." },

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

// Tông đỏ-cam mặc định cho phản ứng Khuếch Đại (Vaporize/Melt, không có
// accentElement — xem giải thích trong ElementalReaction ở trên).
const AMPLIFYING_ACCENT = "#F2622E";

/**
 * Màu "đại diện" của 1 phản ứng, dùng để tô pill/border/tên — thay cho
 * việc dùng chung 5 màu CATEGORY_COLOR (khiến gần hết phản ứng
 * transformative hiện cùng 1 màu xám nhạt, nhìn phẳng và xấu — bug đã
 * phát hiện qua ảnh chụp trang /elements thực tế).
 */
export function reactionAccentColor(r: ElementalReaction): string {
  if (r.accentElement) return elementColor(r.accentElement);
  if (r.category === "amplifying") return AMPLIFYING_ACCENT;
  return "#C9A66B";
}

/**
 * Style inline (border/nền/chữ) từ 1 mã màu hex bất kỳ — hàm dùng chung,
 * cả cho reactionAccentColor() (ReactionTabs, tô theo nguyên tố ĐẶC
 * TRƯNG cố định của phản ứng) lẫn cho elements/page.tsx (tô theo nguyên
 * tố của CHÍNH SECTION đang xem — xem swatchStyle bên dưới).
 */
export function swatchStyle(hex: string): { borderColor: string; backgroundColor: string; color: string } {
  return {
    borderColor: hexToRgba(hex, 0.55),
    backgroundColor: hexToRgba(hex, 0.14),
    color: hex,
  };
}

/**
 * Style pill cho danh sách "phản ứng theo từng nguyên tố" ở
 * elements/page.tsx — CỐ Ý tô theo màu của CHÍNH nguyên tố đang liệt kê
 * (elementName = el.name của section), KHÔNG dùng accentElement cố định
 * của phản ứng. Lý do: nhiều phản ứng (Bốc Hơi, Tan Chảy, Khuếch Tán,
 * Kết Tinh...) có thể được kích hoạt bởi ≥2 nguyên tố khác nhau — dưới
 * mục Thủy thì Bốc Hơi nên tô màu Thủy (không phải luôn cam như dưới
 * mục Hỏa), dưới mục Băng thì Khuếch Tán/Kết Tinh nên tô màu Băng
 * (không cố định Phong/Nham) — mỗi section nhất quán 1 tông màu theo
 * đúng nguyên tố của chính section đó.
 */
export function reactionPillStyle(elementName: string): { borderColor: string; backgroundColor: string; color: string } {
  return swatchStyle(elementColor(elementName));
}

// ---- Công thức tính sát thương phản ứng nguyên tố ----
// Nguồn: KeQingMains Theorycrafting Library (library.keqingmains.com/
// combat-mechanics/damage/damage-formula) + Genshin Impact Wiki chính thức
// (genshin-impact.fandom.com/wiki/Damage) — đối chiếu chéo cả 2 nguồn,
// tra cứu lại ngày viết (đã xác nhận số liệu PHẢN ÁNH ĐÚNG bản game hiện
// tại, đã tính cả đợt buff 4 phản ứng Overloaded/Superconduct/Shattered/
// Electro-Charged ở bản 5.2). NẾU game buff/nerf hệ số phản ứng ở bản sau,
// cần tra lại đúng 2 link trên trước khi sửa số ở đây — đừng đoán.
export type DamageFormulaCategory = "amplifying" | "transformative" | "additive" | "lunarStellar";

export interface DamageFormulaInfo {
  category: DamageFormulaCategory;
  titleVi: string;
  formulaLatex: string; // dạng text đơn giản, không cần render LaTeX thật
  explanationVi: string;
  sourceUrl: string;
}

export const DAMAGE_FORMULAS: Record<DamageFormulaCategory, DamageFormulaInfo> = {
  amplifying: {
    category: "amplifying",
    titleVi: "Phản ứng Khuếch Đại (Tan Chảy / Bốc Hơi)",
    formulaLatex: "Hệ Số Khuếch Đại = HSN × [1 + 2.78×EM/(1400+EM) + %ThưởngPhảnỨng]",
    explanationVi:
      "HSN (Hệ Số Nền) = 2 nếu tác dụng \"thuận\" (Thủy lên Hỏa cho Bốc Hơi, Hỏa lên Băng cho Tan Chảy), = 1.5 nếu \"ngược\". " +
      "Hệ Số Khuếch Đại nhân THẲNG vào sát thương đòn đánh gây ra phản ứng — vẫn cộng ATK, tỉ lệ/sát thương bạo kích, % Sát Thương như bình thường, KHÁC với 2 loại còn lại.",
    sourceUrl: "https://library.keqingmains.com/combat-mechanics/elemental-effects/amplifying-reactions",
  },
  transformative: {
    category: "transformative",
    titleVi: "Phản ứng Biến Đổi (Quá Tải, Siêu Dẫn, Điện Cảm, Khuếch Tán, Thiêu Đốt, Sum Suê, Nở Rộ, Bung Tỏa, Vỡ Băng...)",
    formulaLatex: "Sát Thương = HSN × HSCấp(nhân vật kích hoạt) × [1 + 16×EM/(2000+EM) + %ThưởngPhảnỨng] × KhángNguyênTố(mục tiêu)",
    explanationVi:
      "HSCấp (Hệ Số Cấp Độ) ở Lv.90 = 1446.85, Lv.80 = 1077.44 (chỉ tính cấp NHÂN VẬT gây phản ứng, không phải mục tiêu). " +
      "KHÔNG THỂ bạo kích, bỏ qua hoàn toàn Phòng Thủ của mục tiêu, chỉ chịu ảnh hưởng bởi Kháng Nguyên Tố — vì vậy ATK/Crit/DMG% của nhân vật hoàn toàn KHÔNG ảnh hưởng, chỉ Tinh Thông Nguyên Tố (EM) và cấp độ mới có tác dụng.",
    sourceUrl: "https://library.keqingmains.com/combat-mechanics/damage/damage-formula",
  },
  additive: {
    category: "additive",
    titleVi: "Phản ứng Cộng Dồn (Tăng Cường, Lan Tràn)",
    formulaLatex: "Sát Thương Cộng Thêm = HSN × HSCấp(nhân vật kích hoạt) × [1 + 5×EM/(1200+EM) + %ThưởngPhảnỨng]",
    explanationVi:
      "HSN = 1.15 cho Tăng Cường, 1.25 cho Lan Tràn. Khoản này CỘNG THẲNG vào sát thương gốc của đòn đánh TRƯỚC khi nhân % Sát Thương/bạo kích — nên vẫn hưởng lợi từ Crit/DMG% của đòn kích hoạt, khác hẳn phản ứng Biến Đổi.",
    sourceUrl: "https://library.keqingmains.com/combat-mechanics/damage/damage-formula",
  },
  lunarStellar: {
    category: "lunarStellar",
    titleVi: "Phản ứng Nguyệt & Tinh Vực (Nguyệt-Điện Cảm, Nguyệt-Sum Suê, Nguyệt-Kết Tinh, Tinh Vực-Dẫn, Khuếch Tán Tinh Vực)",
    formulaLatex: "Sát Thương Cá Nhân = HSN × HSCấp × [1 + %ThưởngPhảnỨng] × [1 + %ThưởngPhảnỨng_EM] × (1 + Sát Thương Bạo Kích) × KhángNguyênTố",
    explanationVi:
      "Fandom xác nhận Nguyệt và Tinh Vực dùng CHUNG 1 công thức (khác Biến Đổi thường ở chỗ: CÓ THỂ bạo kích — Crit Rate/Crit DMG của nhân vật tính vào đây, và tính CHO TỪNG nhân vật riêng lẻ, không gộp chung 1 người kích hoạt). " +
      "Nếu nhiều nhân vật cùng tác dụng nguyên tố liên quan (tối đa 4 người): người có sát thương cá nhân cao nhất tính 100%, người nhì tính 50%, người ba và tư mỗi người chỉ tính 1/12 — cộng cả 4 phần lại ra sát thương Nguyệt/Tinh Vực cuối cùng. " +
      "HSN Nguyệt-Điện Cảm = 1.8 (một số nhân vật như Ineffa có đòn \"trực tiếp\" dùng HSN riêng, không theo số này).",
    sourceUrl: "https://genshin-impact.fandom.com/wiki/Damage",
  },
};

// Hệ số nền (Base Reaction Coefficient) từng phản ứng Biến Đổi cụ thể —
// dùng thay vào công thức DAMAGE_FORMULAS.transformative ở trên. Số liệu
// SAU đợt buff bản 5.2 (Overloaded 2→2.75, Superconduct 0.5→1.5, Shattered
// 1.5→3, Electro-Charged 1.2→2 mỗi lần tác dụng — Điện Cảm có thể tác dụng
// 2 lần/chu kỳ nên tổng có thể x2 giá trị này).
export const TRANSFORMATIVE_BASE_COEFFICIENT: Record<string, number> = {
  burning: 0.25,
  swirl: 0.6,
  superconduct: 1.5,
  "electro-charged": 2.0,
  bloom: 2.0,
  overloaded: 2.75,
  frozen: 3.0, // "Shattered" — đòn phá băng, hệ số áp dụng cho ĐÒN PHÁ, không phải bản thân Đóng Băng (Đóng Băng không gây sát thương)
  burgeon: 3.0,
  hyperbloom: 3.0,
};

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
// nhiệm vụ. Ra mắt bản 6.2 (8 nhân vật: Durin, Razor, Fischl, Sucrose,
// Mona, Venti, Klee, Albedo). "Sóng 2" (Amber/Kaeya/Lisa/Jean/Noelle/
// Mika/Eula) từng được đồn/liệt kê trong 1 số bài leak bản 6.6 nhưng
// KHÔNG thực sự nhận buff Hexerei trong game — đã bỏ khỏi danh sách
// theo xác nhận thực tế trong game.
export const HEXEREI_WAVE_1 = ["Durin", "Razor", "Fischl", "Sucrose", "Mona", "Venti", "Klee", "Albedo"] as const; // bản 6.2
export const HEXEREI_NEW_WITCHES = ["Nicole", "Lohen", "Prune"] as const; // bản 6.6, witch mới có sẵn Hexerei không cần Bài Tập

export const HEXEREI_CHARACTERS = [...HEXEREI_WAVE_1, ...HEXEREI_NEW_WITCHES] as const;

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

// ---- Nguyên tố (Vision) của từng nhân vật ở trên — dùng để tô màu chip
// tên nhân vật ĐÚNG THEO NGUYÊN TỐ RIÊNG của họ (characterPillStyle bên
// dưới), thay vì gộp chung 1 màu theo nhóm Sóng 1/Witch mới/Khải Huyền
// như trước — vì trong 1 nhóm vẫn có nhiều nguyên tố khác nhau.
export const CHARACTER_ELEMENT: Record<string, string> = {
  // Hexerei — Sóng 1 (bản 6.2)
  Durin: "Pyro",
  Razor: "Electro",
  Fischl: "Electro",
  Sucrose: "Anemo",
  Mona: "Hydro",
  Venti: "Anemo",
  Klee: "Pyro",
  Albedo: "Geo",
  // Hexerei — Witch mới có sẵn (bản 6.6)
  Nicole: "Pyro",
  Lohen: "Cryo",
  Prune: "Anemo",
  // Khải Huyền Của Ma Nữ (bản 6.7)
  Wriothesley: "Cryo",
  "Yae Miko": "Electro",
  Cyno: "Electro",
  Qiqi: "Cryo",
  Diona: "Cryo",
  Beidou: "Electro",
  "Yumemizuki Mizuki": "Anemo",
};

/**
 * Style pill cho chip tên nhân vật, tô theo ĐÚNG nguyên tố (Vision)
 * riêng của nhân vật đó (tra CHARACTER_ELEMENT) — không gộp chung 1
 * màu cho cả nhóm nữa.
 */
export function characterPillStyle(name: string): { borderColor: string; backgroundColor: string; color: string } {
  const el = CHARACTER_ELEMENT[name];
  return swatchStyle(el ? elementColor(el) : "#C9A66B");
}
