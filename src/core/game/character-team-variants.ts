/**
 * src/core/game/character-team-variants.ts
 *
 * Hệ thống đề xuất đội hình tự động theo cơ chế phản ứng nguyên tố và biến thể tình huống
 * cho nhân vật trong Genshin Impact.
 *
 * 100% sử dụng dữ liệu nhân vật thật từ PostgreSQL Prisma DB.
 */

import { getCharacterBuild } from "@/data/character-builds-data";

export interface TeamVariantMember {
  id: string;
  name: string;
  localizedName: string;
  iconUrl: string | null;
  vision: string;
  rarity: number;
  roleVi: "Chủ lực (DPS)" | "Phụ sát thương (Sub-DPS)" | "Hỗ trợ (Buffer)" | "Bảo hộ / Khiên (Shielder)" | "Hồi máu (Healer)";
}

export interface CharacterTeamVariant {
  variantId: string;
  nameVi: string;
  situationVi: string;
  archetypeVi: string;
  members: TeamVariantMember[];
  reactionsVi: string[];
  resonancesVi: string[];
  teamBuilderUrl: string;
}

interface RawTeamBlueprint {
  nameVi: string;
  situationVi: string;
  archetypeVi: string;
  teammateIds: [string, string, string];
  teammateRoles: [TeamVariantMember["roleVi"], TeamVariantMember["roleVi"], TeamVariantMember["roleVi"]];
  reactionsVi: string[];
  resonancesVi: string[];
}

/**
 * Bản đồ alias ID nhân vật giữa mã nguồn và DB
 */
export const CHARACTER_ID_ALIASES: Record<string, string> = {
  kazuha: "kaedehara-kazuha",
  ayaka: "kamisato-ayaka",
  ayato: "kamisato-ayato",
  kokomi: "sangonomiya-kokomi",
  itto: "arataki-itto",
  raiden: "raiden-shogun",
  sara: "kujou-sara",
  shinobu: "kuki-shinobu",
  heizou: "shikanoin-heizou",
  mizuki: "yumemizuki-mizuki",
};

/**
 * Kiểm tra xem ID nhân vật có phải là Nhà Lữ Hành (Aether / Lumine) hay không.
 * Trong Genshin Impact, một đội hình tuyệt đối KHÔNG ĐƯỢC có quá 1 Nhà Lữ Hành!
 */
export function isTravelerCharacter(id: string): boolean {
  const lower = id.toLowerCase();
  return (
    lower.startsWith("traveler-") ||
    lower.startsWith("aether") ||
    lower.startsWith("lumine") ||
    lower.includes("traveler")
  );
}

/**
 * Danh sách ưu tiên nhân vật hỗ trợ/Sub-DPS hàng đầu theo từng hệ (Meta Supports).
 * Dùng để thuật toán tự động KHÔNG BAO GIỜ bốc bừa Nhà Lữ Hành hoặc nhân vật không liên quan.
 */
const META_PRIORITY_BY_VISION: Record<string, string[]> = {
  Pyro: ["bennett", "xiangling", "chevreuse", "thoma", "dehya", "yanfei"],
  Hydro: ["furina", "xingqiu", "yelan", "sangonomiya-kokomi", "mona", "barbara"],
  Anemo: ["kaedehara-kazuha", "sucrose", "xianyun", "faruzan", "venti", "jean"],
  Geo: ["zhongli", "chiori", "albedo", "gorou", "kachina", "xilonen", "yun-jin", "ningguang"],
  Electro: ["fischl", "raiden-shogun", "kuki-shinobu", "yae-miko", "beidou", "kujou-sara"],
  Dendro: ["nahida", "baizhu", "emilie", "yaoyao", "kirara", "collei"],
  Cryo: ["shenhe", "rosaria", "diona", "layla", "charlotte", "mika"],
};

/**
 * Bản thiết kế đội hình chiến thuật tiêu biểu (Canonical Meta Variants)
 * cho các nhân vật hàng đầu, bao quát đa dạng kịch bản và phản ứng.
 */
const CANONICAL_VARIANTS: Record<string, RawTeamBlueprint[]> = {
  // --- Thủy (Hydro) ---
  furina: [
    {
      nameVi: "Siêu Thẩm Phán Thủy (Neuvillette Hypercarry)",
      situationVi: "Tối đa sát thương diện rộng và hồi phục siêu tốc, càn quét La Hoàn 12.",
      archetypeVi: "Thuần Thủy / Khuếch Tán",
      teammateIds: ["neuvillette", "kazuha", "baizhu"],
      teammateRoles: ["Chủ lực (DPS)", "Hỗ trợ (Buffer)", "Hồi máu (Healer)"],
      reactionsVi: ["Khuếch Tán Thủy", "Nở Rộ"],
      resonancesVi: ["Trị Liệu (+25% Max HP)"],
    },
    {
      nameVi: "Hỏa Long Bốc Hơi Đáp (Hu Tao Xianyun Vape)",
      situationVi: "Dồn sát thương Tấn Công Khi Đáp cực lớn, tận dụng tối đa buff Náo Nhiệt.",
      archetypeVi: "Bốc Hơi (Vaporize)",
      teammateIds: ["hu-tao", "yelan", "xianyun"],
      teammateRoles: ["Chủ lực (DPS)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
      reactionsVi: ["Bốc Hơi (x1.5 / x2.0)", "Khuếch Tán"],
      resonancesVi: ["Trị Liệu (+25% Max HP)"],
    },
    {
      nameVi: "Thảo Nở Rộ Siêu Cấp (Alhaitham Quickbloom)",
      situationVi: "Vừa có sát thương Lan Truyền nguyên chất vừa có đạn Nở Rộ tự tìm mục tiêu.",
      archetypeVi: "Nở Rộ Siêu Cấp (Hyperbloom)",
      teammateIds: ["alhaitham", "nahida", "kuki-shinobu"],
      teammateRoles: ["Chủ lực (DPS)", "Hỗ trợ (Buffer)", "Hồi máu (Healer)"],
      reactionsVi: ["Nở Rộ Siêu Cấp", "Sinh Trưởng", "Lan Truyền"],
      resonancesVi: ["Cỏ Cây (+EM)"],
    },
  ],

  neuvillette: [
    {
      nameVi: "Thần Thủy Toàn Năng (Furina Hypercarry)",
      situationVi: "Đạt trần sát thương Trọng Kích cao nhất, tối ưu 3 tầng thiên phú và buff Náo Nhiệt.",
      archetypeVi: "Khuếch Tán / Trị Liệu",
      teammateIds: ["furina", "kazuha", "baizhu"],
      teammateRoles: ["Phụ sát thương (Sub-DPS)", "Hỗ trợ (Buffer)", "Hồi máu (Healer)"],
      reactionsVi: ["Khuếch Tán Thủy", "Nở Rộ"],
      resonancesVi: ["Trị Liệu (+25% Max HP)"],
    },
    {
      nameVi: "Khiên Bất Hoại Kháng Đòn (Zhongli Shield Team)",
      situationVi: "Đảm bảo kháng gián đoạn tuyệt đối cho Neuvillette C0, kích hoạt 3 phản ứng khác nhau.",
      archetypeVi: "Điện Cảm / Kết Tinh",
      teammateIds: ["zhongli", "kazuha", "fischl"],
      teammateRoles: ["Bảo hộ / Khiên (Shielder)", "Hỗ trợ (Buffer)", "Phụ sát thương (Sub-DPS)"],
      reactionsVi: ["Điện Cảm", "Khuếch Tán", "Kết Tinh"],
      resonancesVi: ["Tán Râm (+15% Kháng Mọi Nguyên Tố)"],
    },
    {
      nameVi: "Đóng Băng Thẩm Phán (Permafrost Freeze)",
      situationVi: "Khống chế cứng kẻ địch cơ động cao, không cho tiếp cận.",
      archetypeVi: "Đóng Băng (Frozen)",
      teammateIds: ["furina", "kazuha", "charlotte"],
      teammateRoles: ["Phụ sát thương (Sub-DPS)", "Hỗ trợ (Buffer)", "Hồi máu (Healer)"],
      reactionsVi: ["Đóng Băng", "Khuếch Tán"],
      resonancesVi: ["Trị Liệu (+25% Max HP)"],
    },
  ],

  // --- Hỏa (Pyro) ---
  "hu-tao": [
    {
      nameVi: "Bốc Hơi Kinh Điển (Double Hydro Vape)",
      situationVi: "Sát thương đơn mục tiêu diệt Boss số 1 game, cực kỳ an toàn nhờ Khiên Ngọc.",
      archetypeVi: "Bốc Hơi (Vaporize)",
      teammateIds: ["xingqiu", "yelan", "zhongli"],
      teammateRoles: ["Phụ sát thương (Sub-DPS)", "Phụ sát thương (Sub-DPS)", "Bảo hộ / Khiên (Shielder)"],
      reactionsVi: ["Bốc Hơi (x1.5)", "Kết Tinh"],
      resonancesVi: ["Trị Liệu (+25% Max HP)"],
    },
    {
      nameVi: "Bốc Hơi Lướt Sóng (Furina Xianyun Plunge)",
      situationVi: "Sát thương Tấn Công Khi Đáp diện rộng cực khủng, xóa bỏ giới hạn thể lực.",
      archetypeVi: "Bốc Hơi / Khuếch Tán",
      teammateIds: ["furina", "yelan", "xianyun"],
      teammateRoles: ["Phụ sát thương (Sub-DPS)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
      reactionsVi: ["Bốc Hơi (x1.5)", "Khuếch Tán"],
      resonancesVi: ["Trị Liệu (+25% Max HP)"],
    },
    {
      nameVi: "Quá Tải Chevreuse (Chevreuse Overload)",
      situationVi: "Giảm 40% kháng Hỏa và Lôi liên tục, sát thương phá khiên quái nặng.",
      archetypeVi: "Quá Tải (Overload)",
      teammateIds: ["chevreuse", "fischl", "bennett"],
      teammateRoles: ["Hỗ trợ (Buffer)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
      reactionsVi: ["Quá Tải (x2.75)"],
      resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
    },
  ],

  arlecchino: [
    {
      nameVi: "Bốc Hơi Bộc Phát (Vape Hypercarry)",
      situationVi: "Dồn sát thương đơn mục tiêu cực hạn hạ gục Boss trong 1 chu kỳ chiến đấu.",
      archetypeVi: "Bốc Hơi (Vaporize)",
      teammateIds: ["yelan", "kazuha", "bennett"],
      teammateRoles: ["Phụ sát thương (Sub-DPS)", "Hỗ trợ (Buffer)", "Hỗ trợ (Buffer)"],
      reactionsVi: ["Bốc Hơi (x1.5)", "Khuếch Tán Hỏa/Thủy"],
      resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
    },
    {
      nameVi: "Bảo Hộ Khiên Nham (Zhongli Safe Vape)",
      situationVi: "Do Arlecchino không nhận hồi máu từ đồng đội, Khiên Zhongli bảo vệ tuyệt đối.",
      archetypeVi: "Bốc Hơi / Khiên",
      teammateIds: ["xingqiu", "zhongli", "bennett"],
      teammateRoles: ["Phụ sát thương (Sub-DPS)", "Bảo hộ / Khiên (Shielder)", "Hỗ trợ (Buffer)"],
      reactionsVi: ["Bốc Hơi (x1.5)", "Kết Tinh"],
      resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
    },
    {
      nameVi: "Hỏa Lôi Diệt Tuyệt (Chevreuse Overload)",
      situationVi: "Chiến đấu linh hoạt không phụ thuộc vào vòng tròn chiêu nộ của Bennett.",
      archetypeVi: "Quá Tải (Overload)",
      teammateIds: ["chevreuse", "fischl", "beidou"],
      teammateRoles: ["Hỗ trợ (Buffer)", "Phụ sát thương (Sub-DPS)", "Phụ sát thương (Sub-DPS)"],
      reactionsVi: ["Quá Tải (x2.75)"],
      resonancesVi: ["Năng Lượng (+Hạt Lôi)"],
    },
  ],

  // --- Lôi (Electro) ---
  "raiden-shogun": [
    {
      nameVi: "Lôi Thần Quốc Dân (Rational Team)",
      situationVi: "Đội hình cân bằng và hiệu quả nhất game: sạc năng lượng vô tận, phản ứng liên hồi.",
      archetypeVi: "Bốc Hơi / Quá Tải / Điện Cảm",
      teammateIds: ["xingqiu", "xiangling", "bennett"],
      teammateRoles: ["Phụ sát thương (Sub-DPS)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
      reactionsVi: ["Bốc Hơi", "Quá Tải", "Điện Cảm"],
      resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
    },
    {
      nameVi: "Nhất Đao Đoạt Mệnh (Raiden Hypercarry)",
      situationVi: "Tập trung toàn bộ bùa lợi để nhát chém đầu tiên gây sát thương cực hạn.",
      archetypeVi: "Thuần Lôi Siêu Cấp",
      teammateIds: ["kazuha", "kujou-sara", "bennett"],
      teammateRoles: ["Hỗ trợ (Buffer)", "Hỗ trợ (Buffer)", "Hồi máu (Healer)"],
      reactionsVi: ["Khuếch Tán Lôi/Hỏa", "Quá Tải"],
      resonancesVi: ["Năng Lượng (+Hạt Lôi)"],
    },
    {
      nameVi: "Kích Nổ Hạt Thảo (Hyperbloom E-bot)",
      situationVi: "Chi phí build cực rẻ (chỉ cần Full Tinh Thông EM), đạn Nở Rộ tự tìm diệt quái.",
      archetypeVi: "Nở Rộ Siêu Cấp (Hyperbloom)",
      teammateIds: ["nahida", "xingqiu", "baizhu"],
      teammateRoles: ["Hỗ trợ (Buffer)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
      reactionsVi: ["Nở Rộ Siêu Cấp (x2.0)", "Sinh Trưởng"],
      resonancesVi: ["Cỏ Cây (+EM)"],
    },
  ],

  // --- Thảo (Dendro) ---
  nahida: [
    {
      nameVi: "Siêu Nở Rộ Vàng (Hyperbloom Standard)",
      situationVi: "Tiêu diệt Boss và quái cơ động nhanh nhất với sát thương đạn nổ 35,000+ mỗi viên.",
      archetypeVi: "Nở Rộ Siêu Cấp (Hyperbloom)",
      teammateIds: ["xingqiu", "kuki-shinobu", "alhaitham"],
      teammateRoles: ["Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)", "Chủ lực (DPS)"],
      reactionsVi: ["Nở Rộ Siêu Cấp", "Sinh Trưởng", "Lan Truyền"],
      resonancesVi: ["Cỏ Cây (+EM)"],
    },
    {
      nameVi: "Nở Rộ Phì Nhiêu (Nilou Bountiful Bloom)",
      situationVi: "Hạt Thảo phát nổ ngay lập tức trên diện rộng, dọn sạch mọi tầng quái đông đảo.",
      archetypeVi: "Nở Rộ Đặc Biệt (Bountiful Bloom)",
      teammateIds: ["nilou", "kokomi", "baizhu"],
      teammateRoles: ["Hỗ trợ (Buffer)", "Hồi máu (Healer)", "Hồi máu (Healer)"],
      reactionsVi: ["Nở Rộ Đặc Biệt"],
      resonancesVi: ["Trị Liệu (+25% Max HP)", "Cỏ Cây (+EM)"],
    },
    {
      nameVi: "Thuần Thảo Lan Truyền (Quicken Spread)",
      situationVi: "Sát thương Thảo và Lôi nguyên chất liên tục, không cần quản lý chu trình nước.",
      archetypeVi: "Lan Truyền / Tăng Cường",
      teammateIds: ["alhaitham", "yae-miko", "zhongli"],
      teammateRoles: ["Chủ lực (DPS)", "Phụ sát thương (Sub-DPS)", "Bảo hộ / Khiên (Shielder)"],
      reactionsVi: ["Sinh Trưởng", "Lan Truyền", "Tăng Cường"],
      resonancesVi: ["Cỏ Cây (+EM)"],
    },
  ],

  // --- Băng (Cryo) ---
  ayaka: [
    {
      nameVi: "Đóng Băng Vĩnh Cửu (Classic Freeze)",
      situationVi: "Gom quái tụ điểm và đóng băng 100%, chiêu nộ dồn sát thương trọn vẹn 20 nhát chém.",
      archetypeVi: "Đóng Băng (Frozen)",
      teammateIds: ["shenhe", "kazuha", "kokomi"],
      teammateRoles: ["Hỗ trợ (Buffer)", "Hỗ trợ (Buffer)", "Hồi máu (Healer)"],
      reactionsVi: ["Đóng Băng", "Khuếch Tán Băng/Thủy"],
      resonancesVi: ["Sương Giá (+15% Tỉ Lệ Bạo)"],
    },
    {
      nameVi: "Tan Chảy Ngược (Reverse Melt)",
      situationVi: "Dành cho quái không thể đóng băng (Boss thế giới, Boss La Hoàn), nhân đôi sát thương.",
      archetypeVi: "Tan Chảy (Melt)",
      teammateIds: ["xiangling", "bennett", "kazuha"],
      teammateRoles: ["Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)", "Hỗ trợ (Buffer)"],
      reactionsVi: ["Tan Chảy (x1.5)", "Khuếch Tán"],
      resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
    },
  ],

  // --- Nham (Geo) ---
  navia: [
    {
      nameVi: "Pháo Bắn Đạn Kép (Navia Double Pyro)",
      situationVi: "Nạp Mảnh Đạn pháo kích liên tục nhờ vòng lửa của Xiangling, buff ATK tối đa.",
      archetypeVi: "Kết Tinh / Hỏa",
      teammateIds: ["zhongli", "xiangling", "bennett"],
      teammateRoles: ["Bảo hộ / Khiên (Shielder)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
      reactionsVi: ["Kết Tinh (Tạo Mảnh Đạn)", "Kết Tinh Hỏa"],
      resonancesVi: ["Kiên Định (+15% Sát Thương)", "Nhiệt Huyết (+25% ATK)"],
    },
    {
      nameVi: "Pháo Đài Lướt Sóng (Navia Furina Plunge)",
      situationVi: "Kết hợp đạn súng 200,000+ với đòn tấn công khi đáp diện rộng uy lực.",
      archetypeVi: "Kết Tinh / Thủy",
      teammateIds: ["furina", "xianyun", "chiori"],
      teammateRoles: ["Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)", "Phụ sát thương (Sub-DPS)"],
      reactionsVi: ["Kết Tinh Thủy"],
      resonancesVi: ["Kiên Định (+15% Sát Thương)"],
    },
  ],

  // --- Nham (Geo) - Albedo, Zhongli, Itto ---
  albedo: [
    {
      nameVi: "Thuần Nham Hoàng Kim (Itto Albedo Gorou Zhongli)",
      situationVi: "Đội hình Thuần Nham tối thượng: Albedo cung cấp hoa sát thương phụ diện rộng mỗi 2s, hưởng trọn buff DEF của Gorou và khiên kháng giảm của Zhongli.",
      archetypeVi: "Thuần Nham (Mono Geo)",
      teammateIds: ["arataki-itto", "gorou", "zhongli"],
      teammateRoles: ["Chủ lực (DPS)", "Hỗ trợ (Buffer)", "Bảo hộ / Khiên (Shielder)"],
      reactionsVi: ["Kết Tinh Nham"],
      resonancesVi: ["Kiên Định (+15% Sát Thương Khiên)"],
    },
    {
      nameVi: "Song Nham Bốc Hơi Cổ Điển (Hu Tao Double Geo)",
      situationVi: "Cặp bài trùng Albedo + Zhongli tạo cộng hưởng Nham và buff 125 Tinh Thông Nguyên Tố cho Hu Tao bốc hơi liên tục.",
      archetypeVi: "Bốc Hơi / Song Nham",
      teammateIds: ["hu-tao", "xingqiu", "zhongli"],
      teammateRoles: ["Chủ lực (DPS)", "Phụ sát thương (Sub-DPS)", "Bảo hộ / Khiên (Shielder)"],
      reactionsVi: ["Bốc Hơi (x1.5)", "Kết Tinh"],
      resonancesVi: ["Kiên Định (+15% Sát Thương)"],
    },
    {
      nameVi: "Pháo Kích Song Nham Song Hỏa (Navia Albedo Xiangling Bennett)",
      situationVi: "Albedo nạp hạt Nham nhanh chóng và tạo mảnh Kết Tinh liên tục để Navia tích đạn bắn đại bác.",
      archetypeVi: "Kết Tinh / Hỏa",
      teammateIds: ["navia", "xiangling", "bennett"],
      teammateRoles: ["Chủ lực (DPS)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
      reactionsVi: ["Kết Tinh Hỏa"],
      resonancesVi: ["Kiên Định (+15% Sát Thương)", "Nhiệt Huyết (+25% ATK)"],
    },
  ],

  zhongli: [
    {
      nameVi: "Bảo Hộ Khiên Bốc Hơi (Hu Tao Yelan Xingqiu Zhongli)",
      situationVi: "Khiên ngọc bích giảm 20% toàn bộ kháng nguyên tố của địch, bảo vệ tuyệt đối cho Hu Tao dưới 50% HP.",
      archetypeVi: "Bốc Hơi / Song Thủy",
      teammateIds: ["hu-tao", "yelan", "xingqiu"],
      teammateRoles: ["Chủ lực (DPS)", "Phụ sát thương (Sub-DPS)", "Phụ sát thương (Sub-DPS)"],
      reactionsVi: ["Bốc Hơi (x1.5)", "Kết Tinh Thủy"],
      resonancesVi: ["Kiên Định (+15% Sát Thương)", "Trị Liệu (+25% Max HP)"],
    },
    {
      nameVi: "Thẩm Phán Kháng Đòn Tuyệt Đối (Neuvillette Zhongli Hypercarry)",
      situationVi: "Cung cấp kháng gián đoạn 100% cho Neuvillette bắn tia nước trọng kích an toàn tối đa.",
      archetypeVi: "Thuần Thủy / Kết Tinh",
      teammateIds: ["neuvillette", "furina", "kaedehara-kazuha"],
      teammateRoles: ["Chủ lực (DPS)", "Phụ sát thương (Sub-DPS)", "Hỗ trợ (Buffer)"],
      reactionsVi: ["Khuếch Tán Thủy", "Kết Tinh Thủy"],
      resonancesVi: ["Tán Râm (+15% Kháng)"],
    },
    {
      nameVi: "Thuần Nham Bất Khả Chiến Bại (Itto Gorou Albedo Zhongli)",
      situationVi: "Đội hình 4 Nham bất hoại, Itto vung chuỳ cuồng nộ dưới sự bảo hộ của Nham Thần.",
      archetypeVi: "Thuần Nham (Mono Geo)",
      teammateIds: ["arataki-itto", "gorou", "albedo"],
      teammateRoles: ["Chủ lực (DPS)", "Hỗ trợ (Buffer)", "Phụ sát thương (Sub-DPS)"],
      reactionsVi: ["Kết Tinh Nham"],
      resonancesVi: ["Kiên Định (+15% Sát Thương Khiên)"],
    },
  ],

  "arataki-itto": [
    {
      nameVi: "Thuần Nham Hoàng Kim (Mono Geo Hypercarry)",
      situationVi: "Itto gánh vác toàn bộ sát thương với buff DEF từ Gorou, hoa Albedo và khiên Zhongli.",
      archetypeVi: "Thuần Nham (Mono Geo)",
      teammateIds: ["gorou", "albedo", "zhongli"],
      teammateRoles: ["Hỗ trợ (Buffer)", "Phụ sát thương (Sub-DPS)", "Bảo hộ / Khiên (Shielder)"],
      reactionsVi: ["Kết Tinh Nham"],
      resonancesVi: ["Kiên Định (+15% Sát Thương Khiên)"],
    },
    {
      nameVi: "Song Búp Bê Song Nham (Itto Chiori Gorou Zhongli)",
      situationVi: "Tận dụng kết cấu Nham Ushi để Chiori triệu hồi 2 búp bê chém off-field cực mạnh.",
      archetypeVi: "Thuần Nham (Mono Geo)",
      teammateIds: ["chiori", "gorou", "zhongli"],
      teammateRoles: ["Phụ sát thương (Sub-DPS)", "Hỗ trợ (Buffer)", "Bảo hộ / Khiên (Shielder)"],
      reactionsVi: ["Kết Tinh Nham"],
      resonancesVi: ["Kiên Định (+15% Sát Thương)"],
    },
  ],

  // --- Phong (Anemo) - Kazuha & Xiao ---
  "kaedehara-kazuha": [
    {
      nameVi: "Quốc Tế Childe (International Childe Vape)",
      situationVi: "Đội hình AOE mạnh nhất game: Kazuha gom quái kép và khuếch tán kép Hỏa/Thủy cho Childe và Xiangling.",
      archetypeVi: "Bốc Hơi (Vaporize)",
      teammateIds: ["tartaglia", "xiangling", "bennett"],
      teammateRoles: ["Chủ lực (DPS)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
      reactionsVi: ["Bốc Hơi (x2.0)", "Khuếch Tán Kép"],
      resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
    },
    {
      nameVi: "Lôi Thần Siêu Cấp (Raiden Hypercarry)",
      situationVi: "Kazuha buff 40% sát thương Lôi và giảm 40% kháng Lôi để Nhất Đao Đoạt Mạng của Raiden chém 500k+.",
      archetypeVi: "Thuần Lôi Siêu Cấp",
      teammateIds: ["raiden-shogun", "kujou-sara", "bennett"],
      teammateRoles: ["Chủ lực (DPS)", "Hỗ trợ (Buffer)", "Hồi máu (Healer)"],
      reactionsVi: ["Khuếch Tán Lôi", "Quá Tải"],
      resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
    },
    {
      nameVi: "Đóng Băng Vĩnh Cửu (Ayaka Shenhe Kokomi)",
      situationVi: "Gom quái và gia tăng sát thương Băng cho chiêu nộ bão tuyết của Ayaka.",
      archetypeVi: "Đóng Băng (Frozen)",
      teammateIds: ["kamisato-ayaka", "shenhe", "sangonomiya-kokomi"],
      teammateRoles: ["Chủ lực (DPS)", "Hỗ trợ (Buffer)", "Hồi máu (Healer)"],
      reactionsVi: ["Đóng Băng", "Khuếch Tán Băng"],
      resonancesVi: ["Sương Giá (+15% CRIT Rate)"],
    },
  ],
  kazuha: [
    {
      nameVi: "Quốc Tế Childe (International Childe Vape)",
      situationVi: "Đội hình AOE mạnh nhất game: Kazuha gom quái kép và khuếch tán kép Hỏa/Thủy cho Childe và Xiangling.",
      archetypeVi: "Bốc Hơi (Vaporize)",
      teammateIds: ["tartaglia", "xiangling", "bennett"],
      teammateRoles: ["Chủ lực (DPS)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
      reactionsVi: ["Bốc Hơi (x2.0)", "Khuếch Tán Kép"],
      resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
    },
    {
      nameVi: "Lôi Thần Siêu Cấp (Raiden Hypercarry)",
      situationVi: "Kazuha buff 40% sát thương Lôi và giảm 40% kháng Lôi để Nhất Đao Đoạt Mạng của Raiden chém 500k+.",
      archetypeVi: "Thuần Lôi Siêu Cấp",
      teammateIds: ["raiden-shogun", "kujou-sara", "bennett"],
      teammateRoles: ["Chủ lực (DPS)", "Hỗ trợ (Buffer)", "Hồi máu (Healer)"],
      reactionsVi: ["Khuếch Tán Lôi", "Quá Tải"],
      resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
    },
  ],

  xiao: [
    {
      nameVi: "Phong Thần Đáp Siêu Cấp (FFXX Hyper Plunge)",
      situationVi: "Xiao nhận buff tối thượng từ Faruzan C6, Furina Náo Nhiệt và Xianyun tăng sát thương khi đáp.",
      archetypeVi: "Thuần Phong (Anemo Hypercarry)",
      teammateIds: ["faruzan", "furina", "xianyun"],
      teammateRoles: ["Hỗ trợ (Buffer)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
      reactionsVi: ["Khuếch Tán Thủy"],
      resonancesVi: ["Nhanh Nhẹn (-Tiêu Hao Thể Lực)"],
    },
    {
      nameVi: "Xiao Cổ Điển Bất Tử (Xiao Zhongli Bennett Faruzan)",
      situationVi: "An toàn tuyệt đối dưới khiên ngọc bích và vùng buff tấn công khổng lồ của Bennett.",
      archetypeVi: "Thuần Phong / Hỏa",
      teammateIds: ["faruzan", "zhongli", "bennett"],
      teammateRoles: ["Hỗ trợ (Buffer)", "Bảo hộ / Khiên (Shielder)", "Hồi máu (Healer)"],
      reactionsVi: ["Khuếch Tán Hỏa"],
      resonancesVi: ["Tán Râm (+15% Kháng)"],
    },
  ],

  // --- Hỏa (Pyro) - Bennett & Xiangling ---
  bennett: [
    {
      nameVi: "Quốc Dân Cổ Điển (Classic National)",
      situationVi: "Bennett hồi máu siêu tốc và cấp 1200+ ATK cho toàn đội hình xả sát thương liên hoàn.",
      archetypeVi: "Bốc Hơi / Khuếch Tán",
      teammateIds: ["xiangling", "xingqiu", "kaedehara-kazuha"],
      teammateRoles: ["Phụ sát thương (Sub-DPS)", "Phụ sát thương (Sub-DPS)", "Hỗ trợ (Buffer)"],
      reactionsVi: ["Bốc Hơi (x1.5)", "Khuếch Tán Hỏa/Thủy"],
      resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
    },
    {
      nameVi: "Lôi Thần Quốc Dân (Rational)",
      situationVi: "Bennett sạc Hỏa cho Xiangling và buff nộ cực hạn cho Raiden Shogun chém.",
      archetypeVi: "Bốc Hơi / Quá Tải / Điện Cảm",
      teammateIds: ["raiden-shogun", "xiangling", "xingqiu"],
      teammateRoles: ["Chủ lực (DPS)", "Phụ sát thương (Sub-DPS)", "Phụ sát thương (Sub-DPS)"],
      reactionsVi: ["Bốc Hơi (x1.5)", "Quá Tải"],
      resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
    },
  ],

  xiangling: [
    {
      nameVi: "Quốc Tế Childe (International Childe)",
      situationVi: "Vòng lửa Thần Khí của Xiangling bốc hơi x2.0 liên tục trên trường trảm trảm của Childe.",
      archetypeVi: "Bốc Hơi (Vaporize)",
      teammateIds: ["tartaglia", "kaedehara-kazuha", "bennett"],
      teammateRoles: ["Chủ lực (DPS)", "Hỗ trợ (Buffer)", "Hồi máu (Healer)"],
      reactionsVi: ["Bốc Hơi (x2.0)", "Khuếch Tán Kép"],
      resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
    },
    {
      nameVi: "Lôi Thần Quốc Dân (Rational)",
      situationVi: "Xiangling nhận pin sạc vô tận từ Raiden Shogun, xả Thần Khí không bao giờ lo thiếu năng lượng.",
      archetypeVi: "Bốc Hơi / Quá Tải",
      teammateIds: ["raiden-shogun", "xingqiu", "bennett"],
      teammateRoles: ["Chủ lực (DPS)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
      reactionsVi: ["Bốc Hơi (x1.5)", "Quá Tải"],
      resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
    },
  ],

  // --- Thảo & Băng (Dendro & Cryo) ---
  alhaitham: [
    {
      nameVi: "Thảo Nở Rộ Siêu Cấp (Alhaitham Quickbloom)",
      situationVi: "Alhaitham duy trì 3 gương chém quang kiếm, vừa có sát thương Lan Truyền vừa có đạn Nở Rộ.",
      archetypeVi: "Nở Rộ Siêu Cấp (Quickbloom)",
      teammateIds: ["nahida", "furina", "kuki-shinobu"],
      teammateRoles: ["Hỗ trợ (Buffer)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
      reactionsVi: ["Lan Truyền", "Nở Rộ Siêu Cấp", "Sinh Trưởng"],
      resonancesVi: ["Cỏ Cây (+EM)"],
    },
    {
      nameVi: "Lan Truyền Thuần Khiết (Alhaitham Pure Spread)",
      situationVi: "Dồn sát thương nguyên tố Thảo nguyên chất với cộng hưởng Thảo và giảm kháng của Zhongli.",
      archetypeVi: "Lan Truyền (Spread)",
      teammateIds: ["nahida", "fischl", "zhongli"],
      teammateRoles: ["Hỗ trợ (Buffer)", "Phụ sát thương (Sub-DPS)", "Bảo hộ / Khiên (Shielder)"],
      reactionsVi: ["Lan Truyền", "Tăng Cường", "Sinh Trưởng"],
      resonancesVi: ["Cỏ Cây (+EM)"],
    },
  ],

  ganyu: [
    {
      nameVi: "Tan Chảy Khổng Lồ (Melt Ganyu)",
      situationVi: "Tên Băng Nhụy bung hoa trúng mục tiêu đính kèm lửa của Xiangling và Bennett, gây 150k+ mỗi phát bắn.",
      archetypeVi: "Tan Chảy (Melt)",
      teammateIds: ["xiangling", "bennett", "zhongli"],
      teammateRoles: ["Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)", "Bảo hộ / Khiên (Shielder)"],
      reactionsVi: ["Tan Chảy (x1.5)", "Kết Tinh Hỏa"],
      resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
    },
    {
      nameVi: "Morgana Đóng Băng Cổ Điển (Ganyu Freeze)",
      situationVi: "Đóng băng vĩnh cửu và nạp năng lượng liên tục, kiểm soát toàn diện quái đông trong La Hoàn.",
      archetypeVi: "Đóng Băng (Frozen)",
      teammateIds: ["mona", "venti", "diona"],
      teammateRoles: ["Hỗ trợ (Buffer)", "Hỗ trợ (Buffer)", "Bảo hộ / Khiên (Shielder)"],
      reactionsVi: ["Đóng Băng", "Khuếch Tán Băng"],
      resonancesVi: ["Sương Giá (+15% CRIT Rate)"],
    },
  ],

  // --- Thủy (Hydro) - Xingqiu & Yelan ---
  xingqiu: [
    {
      nameVi: "Quốc Dân Lôi Thần (Rational Xingqiu)",
      situationVi: "Xingqiu cung cấp mưa kiếm giảm sát thương nhận vào, kháng gián đoạn và cấp ấn Thủy liên tục.",
      archetypeVi: "Bốc Hơi / Điện Cảm",
      teammateIds: ["raiden-shogun", "xiangling", "bennett"],
      teammateRoles: ["Chủ lực (DPS)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
      reactionsVi: ["Bốc Hơi (x1.5)", "Điện Cảm"],
      resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
    },
    {
      nameVi: "Song Thủy Hu Tao (Double Hydro Hu Tao)",
      situationVi: "Phối hợp cùng Yelan tạo lượng ấn Thủy khổng lồ để Hu Tao bốc hơi mượt mà.",
      archetypeVi: "Bốc Hơi / Song Thủy",
      teammateIds: ["hu-tao", "yelan", "zhongli"],
      teammateRoles: ["Chủ lực (DPS)", "Phụ sát thương (Sub-DPS)", "Bảo hộ / Khiên (Shielder)"],
      reactionsVi: ["Bốc Hơi (x1.5)"],
      resonancesVi: ["Trị Liệu (+25% Max HP)"],
    },
  ],

  yelan: [
    {
      nameVi: "Hu Tao Song Thủy Bảo Hộ",
      situationVi: "Yelan buff gia tăng sát thương tăng dần theo thời gian cho Hu Tao xông xáo trên sân.",
      archetypeVi: "Bốc Hơi / Song Thủy",
      teammateIds: ["hu-tao", "xingqiu", "zhongli"],
      teammateRoles: ["Chủ lực (DPS)", "Phụ sát thương (Sub-DPS)", "Bảo hộ / Khiên (Shielder)"],
      reactionsVi: ["Bốc Hơi (x1.5)"],
      resonancesVi: ["Trị Liệu (+25% Max HP)"],
    },
    {
      nameVi: "Thảo Nở Rộ Siêu Tốc (Yelan Quickbloom)",
      situationVi: "Tận dụng tốc độ bắn tên và cấp Thủy vượt trội để tạo hạt Nở Rộ liên tục.",
      archetypeVi: "Nở Rộ Siêu Cấp",
      teammateIds: ["alhaitham", "nahida", "kuki-shinobu"],
      teammateRoles: ["Chủ lực (DPS)", "Hỗ trợ (Buffer)", "Hồi máu (Healer)"],
      reactionsVi: ["Nở Rộ Siêu Cấp", "Sinh Trưởng"],
      resonancesVi: ["Cỏ Cây (+EM)"],
    },
  ],

  // --- Phiên bản 7.2 & Snezhnaya ---
  mitya: [
    {
      nameVi: "Lôi Thảo Tăng Cường (Mitya Aggravate Hypercarry)",
      situationVi: "Kích hoạt Tăng Cường liên tục giữa đòn đánh Pháp Khí hệ Lôi của Mitya và ấn Thảo của Nahida, khuếch đại sát thương cực lớn.",
      archetypeVi: "Tăng Cường (Aggravate / Quicken)",
      teammateIds: ["nahida", "fischl", "kazuha"],
      teammateRoles: ["Hỗ trợ (Buffer)", "Phụ sát thương (Sub-DPS)", "Hỗ trợ (Buffer)"],
      reactionsVi: ["Tăng Cường (Aggravate)", "Lan Truyền", "Khuếch Tán Lôi"],
      resonancesVi: ["Năng Lượng (+Hạt Lôi)"],
    },
    {
      nameVi: "Điện Cảm Siêu Sạc (Mitya Electro-Charged Furina)",
      situationVi: "Sát thương dồn dập giữa trường điện từ của Mitya và thú cưng Thủy của Furina, càn quét La Hoàn đông quái.",
      archetypeVi: "Điện Cảm (Electro-Charged)",
      teammateIds: ["furina", "yelan", "baizhu"],
      teammateRoles: ["Phụ sát thương (Sub-DPS)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
      reactionsVi: ["Điện Cảm", "Nở Rộ", "Siêu Nở Rộ"],
      resonancesVi: ["Trị Liệu (+25% Max HP)"],
    },
    {
      nameVi: "Lôi Hỏa Quá Tải Chevreuse (Mitya Overload)",
      situationVi: "Chevreuse giảm 40% kháng Lôi và Hỏa, Mitya đứng sân xả sấm sét bùng nổ diệt Boss.",
      archetypeVi: "Quá Tải (Overload)",
      teammateIds: ["chevreuse", "xiangling", "bennett"],
      teammateRoles: ["Hỗ trợ (Buffer)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
      reactionsVi: ["Quá Tải (x2.75)"],
      resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
    },
  ],

  valeriy: [
    {
      nameVi: "Song Lôi Tác Chiến Tăng Cường (Clorinde Valeriy Aggravate)",
      situationVi: "Valeriy hỗ trợ nạp và cấp ấn Lôi bổ trợ cho Clorinde hoặc Keqing, giữ vững nhịp độ tác chiến.",
      archetypeVi: "Tăng Cường (Aggravate)",
      teammateIds: ["clorinde", "nahida", "kazuha"],
      teammateRoles: ["Chủ lực (DPS)", "Hỗ trợ (Buffer)", "Hỗ trợ (Buffer)"],
      reactionsVi: ["Tăng Cường", "Sinh Trưởng", "Khuếch Tán"],
      resonancesVi: ["Năng Lượng (+Hạt Lôi)"],
    },
    {
      nameVi: "Tiểu Đoàn Quá Tải Snezhnaya (Valeriy Overload)",
      situationVi: "Phối hợp cùng Chevreuse và Raiden Shogun kích hoạt Quá Tải giảm kháng liên tục.",
      archetypeVi: "Quá Tải (Overload)",
      teammateIds: ["raiden-shogun", "chevreuse", "bennett"],
      teammateRoles: ["Chủ lực (DPS)", "Hỗ trợ (Buffer)", "Hồi máu (Healer)"],
      reactionsVi: ["Quá Tải (x2.75)"],
      resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
    },
    {
      nameVi: "Quốc Dân Sạc Năng Lượng (Valeriy National Support)",
      situationVi: "Valeriy cầm Kiếm Tây Phong nạp năng lượng liên tục cho Xiangling và Xingqiu xả chiêu nộ.",
      archetypeVi: "Điện Cảm / Bốc Hơi / Quá Tải",
      teammateIds: ["xiangling", "xingqiu", "bennett"],
      teammateRoles: ["Phụ sát thương (Sub-DPS)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
      reactionsVi: ["Bốc Hơi (x1.5)", "Điện Cảm", "Quá Tải"],
      resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
    },
  ],

  vesna: [
    {
      nameVi: "Bão Kiếm Snezhnaya (Vesna Anemo Hypercarry)",
      situationVi: "Tối đa hóa sát thương Phong nguyên chất của Vesna với sự hỗ trợ của Faruzan và Furina.",
      archetypeVi: "Thuần Phong (Anemo Hypercarry)",
      teammateIds: ["faruzan", "furina", "xianyun"],
      teammateRoles: ["Hỗ trợ (Buffer)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
      reactionsVi: ["Khuếch Tán Thủy"],
      resonancesVi: ["Nhanh Nhẹn (-Tiêu Hao Thể Lực, +Tốc Chạy)"],
    },
    {
      nameVi: "Khuếch Tán Quốc Dân (Vesna National Driver)",
      situationVi: "Vesna cầm kiếm bọc gió gom quái và kích hoạt Khuếch Tán liên hoàn cho Xiangling và Xingqiu.",
      archetypeVi: "Khuếch Tán / Bốc Hơi",
      teammateIds: ["xiangling", "xingqiu", "bennett"],
      teammateRoles: ["Phụ sát thương (Sub-DPS)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
      reactionsVi: ["Khuếch Tán", "Bốc Hơi (x1.5)"],
      resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
    },
  ],

  vodyanitsa: [
    {
      nameVi: "Thủy Triều Snezhnaya (Vodyanitsa Hydro DPS)",
      situationVi: "Vodyanitsa tận dụng tối đa buff Náo Nhiệt của Furina và giảm kháng Thủy của Kazuha để dồn sát thương cực hạn.",
      archetypeVi: "Thuần Thủy / Khuếch Tán",
      teammateIds: ["furina", "kazuha", "baizhu"],
      teammateRoles: ["Phụ sát thương (Sub-DPS)", "Hỗ trợ (Buffer)", "Hồi máu (Healer)"],
      reactionsVi: ["Khuếch Tán Thủy", "Nở Rộ"],
      resonancesVi: ["Trị Liệu (+25% Max HP)"],
    },
    {
      nameVi: "Bốc Hơi Ca Kịch (Vodyanitsa Vaporize)",
      situationVi: "Vodyanitsa tạo ấn Thủy liên tục kích hoạt Bốc Hơi cực mạnh cùng vòng lửa của Xiangling.",
      archetypeVi: "Bốc Hơi (Vaporize)",
      teammateIds: ["xiangling", "bennett", "kazuha"],
      teammateRoles: ["Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)", "Hỗ trợ (Buffer)"],
      reactionsVi: ["Bốc Hơi (x2.0)", "Khuếch Tán Hỏa/Thủy"],
      resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
    },
  ],
};

/**
 * Thuật toán tự động sinh 3 biến thể chiến thuật tổng quát cho nhân vật
 * chưa có trong danh sách cấu hình tĩnh (bao phủ 100% nhân vật trong DB).
 * TUYỆT ĐỐI KHÔNG GHÉP TRÙNG LẶP VÀ KHÔNG QUÁ 1 NHÀ LỮ HÀNH TRONG ĐỘI HÌNH!
 */
function generateDynamicVariants(
  character: { id: string; name: string; vision: string },
  charactersByVision: Map<string, Array<{ id: string; name: string; vision: string; rarity: number }>>
): RawTeamBlueprint[] {
  const isCharTraveler = isTravelerCharacter(character.id);

  // Helper chọn nhân vật tối ưu, loại bỏ trùng lặp và TUYỆT ĐỐI không cho quá 1 Nhà Lữ Hành trong 1 đội
  const getTop = (vision: string, excludeIds: string[]) => {
    const list = charactersByVision.get(vision) ?? [];
    const metaList = META_PRIORITY_BY_VISION[vision] ?? [];

    const isExcluded = (id: string) => {
      if (id === character.id || excludeIds.includes(id)) return true;
      // Nếu nhân vật chính đã là Nhà Lữ Hành HOẶC trong excludeIds đã có 1 Nhà Lữ Hành -> cấm mọi Nhà Lữ Hành khác
      if (isTravelerCharacter(id)) {
        if (isCharTraveler || excludeIds.some((exId) => isTravelerCharacter(exId))) {
          return true;
        }
      }
      return false;
    };

    // 1. Ưu tiên các nhân vật Meta hỗ trợ hàng đầu của hệ đó
    for (const metaId of metaList) {
      const resolved = CHARACTER_ID_ALIASES[metaId] ?? metaId;
      const found = list.find((c) => c.id === resolved || c.id === metaId);
      if (found && !isExcluded(found.id)) {
        return found;
      }
    }

    // 2. Fallback: Lấy các nhân vật không phải Nhà Lữ Hành trước
    const nonTraveler = list.find((c) => !isTravelerCharacter(c.id) && !isExcluded(c.id));
    if (nonTraveler) return nonTraveler;

    // 3. Cuối cùng mới đến Nhà Lữ Hành (nếu đội chưa hề có ai là Nhà Lữ Hành)
    return list.find((c) => !isExcluded(c.id));
  };

  const v = character.vision;

  if (v === "Pyro") {
    // 1. Vape, 2. Melt, 3. Overload
    const hydro1 = getTop("Hydro", []);
    const anemo = getTop("Anemo", [hydro1?.id ?? ""]);
    const hydro2 = getTop("Hydro", [hydro1?.id ?? "", anemo?.id ?? ""]);
    const cryo1 = getTop("Cryo", []);
    const electro1 = getTop("Electro", []);
    const pyroBuffer = getTop("Pyro", []);

    return [
      {
        nameVi: "Biến thể 1: Đội Hình Bốc Hơi (Vaporize)",
        situationVi: "Tối ưu hóa sát thương đơn mục tiêu chống Boss bằng phản ứng Bốc Hơi.",
        archetypeVi: "Bốc Hơi (Vaporize)",
        teammateIds: [hydro1?.id ?? "xingqiu", anemo?.id ?? "kazuha", hydro2?.id ?? "bennett"],
        teammateRoles: ["Phụ sát thương (Sub-DPS)", "Hỗ trợ (Buffer)", "Hồi máu (Healer)"],
        reactionsVi: ["Bốc Hơi (x1.5 / x2.0)", "Khuếch Tán"],
        resonancesVi: ["Trị Liệu (+25% Max HP)"],
      },
      {
        nameVi: "Biến thể 2: Đội Hình Tan Chảy (Melt)",
        situationVi: "Dồn sát thương bộc phát cực đại x2.0 lên mục tiêu bị đính kèm Băng.",
        archetypeVi: "Tan Chảy (Melt)",
        teammateIds: [cryo1?.id ?? "rosaria", anemo?.id ?? "sucrose", pyroBuffer?.id ?? "bennett"],
        teammateRoles: ["Phụ sát thương (Sub-DPS)", "Hỗ trợ (Buffer)", "Hồi máu (Healer)"],
        reactionsVi: ["Tan Chảy (x2.0)", "Khuếch Tán Băng"],
        resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
      },
      {
        nameVi: "Biến thể 3: Đội Hình Quá Tải / Phá Khiên (Overload)",
        situationVi: "Gây sát thương Quá Tải hất văng và phá khiên kẻ địch hạng nặng.",
        archetypeVi: "Quá Tải (Overload)",
        teammateIds: [electro1?.id ?? "fischl", pyroBuffer?.id ?? "bennett", anemo?.id ?? "chevreuse"],
        teammateRoles: ["Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)", "Hỗ trợ (Buffer)"],
        reactionsVi: ["Quá Tải (x2.75)"],
        resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
      },
    ];
  }

  if (v === "Hydro") {
    const pyro1 = getTop("Pyro", []);
    const anemo = getTop("Anemo", [pyro1?.id ?? ""]);
    const pyro2 = getTop("Pyro", [pyro1?.id ?? "", anemo?.id ?? ""]);
    const dendro1 = getTop("Dendro", []);
    const electro1 = getTop("Electro", [dendro1?.id ?? ""]);
    const dendro2 = getTop("Dendro", [dendro1?.id ?? "", electro1?.id ?? ""]);
    const cryo1 = getTop("Cryo", []);
    const cryo2 = getTop("Cryo", [cryo1?.id ?? "", anemo?.id ?? ""]);

    return [
      {
        nameVi: "Biến thể 1: Đội Hình Bốc Hơi (Vaporize)",
        situationVi: "Tối ưu hóa sát thương Thủy/Hỏa diện rộng và gia tăng hệ số khuếch đại.",
        archetypeVi: "Bốc Hơi (Vaporize)",
        teammateIds: [pyro1?.id ?? "xiangling", anemo?.id ?? "kazuha", pyro2?.id ?? "bennett"],
        teammateRoles: ["Phụ sát thương (Sub-DPS)", "Hỗ trợ (Buffer)", "Hồi máu (Healer)"],
        reactionsVi: ["Bốc Hơi (x2.0)", "Khuếch Tán"],
        resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
      },
      {
        nameVi: "Biến thể 2: Nở Rộ Siêu Cấp (Hyperbloom)",
        situationVi: "Sinh hạt Thảo liên tục và kích nổ tự tìm diệt mục tiêu linh hoạt.",
        archetypeVi: "Nở Rộ Siêu Cấp (Hyperbloom)",
        teammateIds: [dendro1?.id ?? "nahida", electro1?.id ?? "kuki-shinobu", dendro2?.id ?? "baizhu"],
        teammateRoles: ["Hỗ trợ (Buffer)", "Hồi máu (Healer)", "Hồi máu (Healer)"],
        reactionsVi: ["Nở Rộ Siêu Cấp", "Sinh Trưởng"],
        resonancesVi: ["Cỏ Cây (+EM)"],
      },
      {
        nameVi: "Biến thể 3: Đóng Băng Khống Chế (Permafrost Freeze)",
        situationVi: "Đóng băng toàn bộ kẻ địch cơ động, giữ an toàn và tăng Tỉ Lệ Bạo.",
        archetypeVi: "Đóng Băng (Frozen)",
        teammateIds: [cryo1?.id ?? "ayaka", anemo?.id ?? "kazuha", cryo2?.id ?? "diona"],
        teammateRoles: ["Chủ lực (DPS)", "Hỗ trợ (Buffer)", "Bảo hộ / Khiên (Shielder)"],
        reactionsVi: ["Đóng Băng", "Khuếch Tán Băng"],
        resonancesVi: ["Sương Giá (+15% CRIT Rate)"],
      },
    ];
  }

  if (v === "Dendro") {
    const electro1 = getTop("Electro", []);
    const dendroBuffer = getTop("Dendro", [electro1?.id ?? ""]);
    const geo1 = getTop("Geo", [electro1?.id ?? "", dendroBuffer?.id ?? ""]);
    const hydro1 = getTop("Hydro", []);
    const hydro2 = getTop("Hydro", [hydro1?.id ?? "", electro1?.id ?? ""]);
    const pyroThoma = charactersByVision.get("Pyro")?.find((c) => c.id === "thoma") ?? getTop("Pyro", []);
    const thomaId = pyroThoma?.id ?? "thoma";
    const dendroHealer = getTop("Dendro", [hydro1?.id ?? "", thomaId]);

    return [
      {
        nameVi: "Biến thể 1: Sinh Trưởng & Lan Truyền (Quicken Spread)",
        situationVi: "Gia tăng sát thương nguyên chất Thảo và Lôi bằng trạng thái Sinh Trưởng.",
        archetypeVi: "Lan Truyền (Spread)",
        teammateIds: [electro1?.id ?? "fischl", dendroBuffer?.id ?? "nahida", geo1?.id ?? "zhongli"],
        teammateRoles: ["Phụ sát thương (Sub-DPS)", "Hỗ trợ (Buffer)", "Bảo hộ / Khiên (Shielder)"],
        reactionsVi: ["Sinh Trưởng", "Lan Truyền", "Tăng Cường"],
        resonancesVi: ["Cỏ Cây (+EM)"],
      },
      {
        nameVi: "Biến thể 2: Nở Rộ Siêu Cấp (Hyperbloom)",
        situationVi: "Tận dụng tối đa hạt Thảo và kích nổ tầm xa sát thương cao.",
        archetypeVi: "Nở Rộ Siêu Cấp (Hyperbloom)",
        teammateIds: [hydro1?.id ?? "xingqiu", electro1?.id ?? "kuki-shinobu", hydro2?.id ?? "yelan"],
        teammateRoles: ["Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)", "Phụ sát thương (Sub-DPS)"],
        reactionsVi: ["Nở Rộ Siêu Cấp", "Sinh Trưởng"],
        resonancesVi: ["Trị Liệu (+25% Max HP)"],
      },
      {
        nameVi: "Biến thể 3: Bung Nở Diệt Quái (Burgeon)",
        situationVi: "Kích nổ hạt Thảo diện rộng bằng Hỏa, quét sạch quái đông nhanh chóng.",
        archetypeVi: "Bung Nở (Burgeon)",
        teammateIds: [hydro1?.id ?? "xingqiu", thomaId, dendroHealer?.id ?? "baizhu"],
        teammateRoles: ["Phụ sát thương (Sub-DPS)", "Bảo hộ / Khiên (Shielder)", "Hồi máu (Healer)"],
        reactionsVi: ["Bung Nở (x2.0)", "Thiêu Rụi"],
        resonancesVi: ["Tán Râm (+15% Kháng)"],
      },
    ];
  }

  if (v === "Electro") {
    const dendro1 = getTop("Dendro", []);
    const electroBattery = getTop("Electro", [dendro1?.id ?? ""]);
    const anemo1 = getTop("Anemo", [dendro1?.id ?? "", electroBattery?.id ?? ""]);
    const hydro1 = getTop("Hydro", []);
    const pyroChevreuse = charactersByVision.get("Pyro")?.find((c) => c.id === "chevreuse") ?? getTop("Pyro", []);
    const chevreuseId = pyroChevreuse?.id ?? "chevreuse";
    const pyroBuffer = getTop("Pyro", [chevreuseId, electroBattery?.id ?? ""]);

    return [
      {
        nameVi: "Biến thể 1: Lôi Thảo Tăng Cường (Aggravate)",
        situationVi: "Kích hoạt phản ứng Tăng Cường gia tăng sát thương Lôi bộc phát liên tục.",
        archetypeVi: "Tăng Cường (Aggravate / Quicken)",
        teammateIds: [dendro1?.id ?? "nahida", electroBattery?.id ?? "fischl", anemo1?.id ?? "kazuha"],
        teammateRoles: ["Hỗ trợ (Buffer)", "Phụ sát thương (Sub-DPS)", "Hỗ trợ (Buffer)"],
        reactionsVi: ["Tăng Cường", "Sinh Trưởng", "Khuếch Tán Lôi"],
        resonancesVi: ["Năng Lượng (+Hạt Lôi)"],
      },
      {
        nameVi: "Biến thể 2: Điện Cảm Siêu Sạc (Electro-Charged)",
        situationVi: "Sát thương Lôi và Thủy giật lan diện rộng dọn dẹp các phòng đông quái nhanh chóng.",
        archetypeVi: "Điện Cảm (Electro-Charged)",
        teammateIds: [hydro1?.id ?? "furina", electroBattery?.id ?? "fischl", anemo1?.id ?? "kazuha"],
        teammateRoles: ["Phụ sát thương (Sub-DPS)", "Phụ sát thương (Sub-DPS)", "Hỗ trợ (Buffer)"],
        reactionsVi: ["Điện Cảm", "Khuếch Tán Lôi/Thủy"],
        resonancesVi: ["Năng Lượng (+Hạt Lôi)"],
      },
      {
        nameVi: "Biến thể 3: Lôi Hỏa Quá Tải Chevreuse (Overload)",
        situationVi: "Giảm 40% kháng Lôi và Hỏa, sát thương phá khiên và đẩy lùi kẻ địch hạng nặng.",
        archetypeVi: "Quá Tải (Overload)",
        teammateIds: [chevreuseId, pyroBuffer?.id ?? "bennett", electroBattery?.id ?? "fischl"],
        teammateRoles: ["Hỗ trợ (Buffer)", "Hồi máu (Healer)", "Phụ sát thương (Sub-DPS)"],
        reactionsVi: ["Quá Tải (x2.75)"],
        resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
      },
    ];
  }

  if (v === "Cryo") {
    const hydro1 = getTop("Hydro", []);
    const anemo1 = getTop("Anemo", [hydro1?.id ?? ""]);
    const cryoSupport = getTop("Cryo", [hydro1?.id ?? "", anemo1?.id ?? ""]);
    const pyro1 = getTop("Pyro", []);
    const pyroBuffer = getTop("Pyro", [pyro1?.id ?? ""]);

    return [
      {
        nameVi: "Biến thể 1: Đóng Băng Vĩnh Cửu (Permafrost Freeze)",
        situationVi: "Khống chế cứng kẻ địch cơ động cao, nhận thêm 15% Tỉ Lệ Bạo Kích và an toàn tối đa.",
        archetypeVi: "Đóng Băng (Frozen)",
        teammateIds: [hydro1?.id ?? "furina", anemo1?.id ?? "kazuha", cryoSupport?.id ?? "shenhe"],
        teammateRoles: ["Phụ sát thương (Sub-DPS)", "Hỗ trợ (Buffer)", "Hỗ trợ (Buffer)"],
        reactionsVi: ["Đóng Băng", "Khuếch Tán Băng/Thủy"],
        resonancesVi: ["Sương Giá (+15% CRIT Rate)"],
      },
      {
        nameVi: "Biến thể 2: Tan Chảy Ngược (Reverse Melt)",
        situationVi: "Nhân đôi sát thương nguyên tố Băng khi tấn công mục tiêu đính kèm ấn Hỏa.",
        archetypeVi: "Tan Chảy (Melt)",
        teammateIds: [pyro1?.id ?? "xiangling", pyroBuffer?.id ?? "bennett", anemo1?.id ?? "kazuha"],
        teammateRoles: ["Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)", "Hỗ trợ (Buffer)"],
        reactionsVi: ["Tan Chảy (x1.5)", "Khuếch Tán Hỏa"],
        resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
      },
    ];
  }

  if (v === "Anemo") {
    const faruzan = charactersByVision.get("Anemo")?.find((c) => c.id === "faruzan") ?? getTop("Anemo", []);
    const faruzanId = faruzan?.id ?? "faruzan";
    const hydro1 = getTop("Hydro", [faruzanId]);
    const geo1 = getTop("Geo", [faruzanId, hydro1?.id ?? ""]);
    const pyro1 = getTop("Pyro", []);
    const pyroBuffer = getTop("Pyro", [pyro1?.id ?? "", hydro1?.id ?? ""]);

    return [
      {
        nameVi: "Biến thể 1: Thuần Phong Siêu Cấp (Anemo Hypercarry)",
        situationVi: "Tối đa hóa sát thương Phong nguyên chất với sự hỗ trợ giảm kháng và buff bạo kích.",
        archetypeVi: "Thuần Phong (Anemo Hypercarry)",
        teammateIds: [faruzanId, hydro1?.id ?? "furina", geo1?.id ?? "zhongli"],
        teammateRoles: ["Hỗ trợ (Buffer)", "Phụ sát thương (Sub-DPS)", "Bảo hộ / Khiên (Shielder)"],
        reactionsVi: ["Khuếch Tán"],
        resonancesVi: ["Nhanh Nhẹn (+Tốc Chạy, -Tiêu Hao Thể Lực)"],
      },
      {
        nameVi: "Biến thể 2: Khuếch Tán Quốc Dân (Swirl National)",
        situationVi: "Đứng sân gom quái và kích hoạt Khuếch Tán đa nguyên tố liên hoàn.",
        archetypeVi: "Khuếch Tán / Bốc Hơi",
        teammateIds: [pyro1?.id ?? "xiangling", hydro1?.id ?? "xingqiu", pyroBuffer?.id ?? "bennett"],
        teammateRoles: ["Phụ sát thương (Sub-DPS)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
        reactionsVi: ["Khuếch Tán", "Bốc Hơi (x1.5)"],
        resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
      },
    ];
  }

  // Nham (Geo)
  const geoSupport = getTop("Geo", []);
  const geoSupport2 = getTop("Geo", [geoSupport?.id ?? ""]);
  const pyro1 = getTop("Pyro", [geoSupport?.id ?? "", geoSupport2?.id ?? ""]);
  const pyroBuffer = getTop("Pyro", [geoSupport?.id ?? "", pyro1?.id ?? ""]);

  return [
    {
      nameVi: "Biến thể 1: Thuần Nham Hoàng Kim (Mono Geo)",
      situationVi: "Tối đa hóa phòng ngự và sát thương Nham nguyên chất với buff Khiên Kiên Định.",
      archetypeVi: "Thuần Nham (Mono Geo)",
      teammateIds: [geoSupport?.id ?? "gorou", geoSupport2?.id ?? "zhongli", pyroBuffer?.id ?? "bennett"],
      teammateRoles: ["Hỗ trợ (Buffer)", "Bảo hộ / Khiên (Shielder)", "Hồi máu (Healer)"],
      reactionsVi: ["Kết Tinh Nham"],
      resonancesVi: ["Kiên Định (+15% Sát Thương)"],
    },
    {
      nameVi: "Biến thể 2: Kết Tinh Song Hỏa (Double Geo Double Pyro)",
      situationVi: "Cân bằng giữa phòng ngự khiên bất hoại và buff tấn công 25% ATK.",
      archetypeVi: "Kết Tinh / Hỏa",
      teammateIds: [geoSupport?.id ?? "zhongli", pyro1?.id ?? "xiangling", pyroBuffer?.id ?? "bennett"],
      teammateRoles: ["Bảo hộ / Khiên (Shielder)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
      reactionsVi: ["Kết Tinh Hỏa"],
      resonancesVi: ["Kiên Định (+15% Sát Thương)", "Nhiệt Huyết (+25% ATK)"],
    },
  ];
}

/**
 * Xây dựng danh sách các đội hình đề xuất và biến thể hoàn chỉnh cho nhân vật
 */
export function buildCharacterTeamVariants(
  character: { id: string; name: string; vision: string; rarity: number },
  allCharactersMap: Map<string, { id: string; name: string; localizedName: string; vision: string; rarity: number; iconUrl: string | null }>,
  locale: string
): CharacterTeamVariant[] {
  const charKey = character.id.toLowerCase().replace(/[^a-z0-9]/g, "-");
  let blueprints = CANONICAL_VARIANTS[charKey];

  if (!blueprints || blueprints.length === 0) {
    const specificBuild = getCharacterBuild(character.id);
    if (specificBuild?.teams && specificBuild.teams.length > 0) {
      blueprints = specificBuild.teams.map((t) => ({
        nameVi: t.nameVi,
        situationVi: t.situationVi,
        archetypeVi: t.archetypeVi,
        teammateIds: t.teammateIds,
        teammateRoles: t.teammateRoles as [
          TeamVariantMember["roleVi"],
          TeamVariantMember["roleVi"],
          TeamVariantMember["roleVi"]
        ],
        reactionsVi: t.reactionsVi,
        resonancesVi: t.resonancesVi,
      }));
    }
  }

  if (!blueprints || blueprints.length === 0) {
    // Nhóm nhân vật theo vision để thuật toán sinh tự động
    const byVision = new Map<string, Array<{ id: string; name: string; vision: string; rarity: number }>>();
    for (const c of allCharactersMap.values()) {
      const list = byVision.get(c.vision) ?? [];
      list.push(c);
      byVision.set(c.vision, list);
    }
    // Sắp xếp ưu tiên 5 sao trước, sau đó là tên
    for (const list of byVision.values()) {
      list.sort((a, b) => b.rarity - a.rarity || a.name.localeCompare(b.name));
    }

    blueprints = generateDynamicVariants(character, byVision);
  }

  const thisMember: TeamVariantMember = {
    id: character.id,
    name: character.name,
    localizedName: allCharactersMap.get(character.id)?.localizedName ?? character.name,
    iconUrl: allCharactersMap.get(character.id)?.iconUrl ?? null,
    vision: character.vision,
    rarity: character.rarity,
    roleVi: "Chủ lực (DPS)",
  };

  const markSeen = (id: string, set: Set<string>) => {
    set.add(id);
    const alias = CHARACTER_ID_ALIASES[id];
    if (alias) set.add(alias);
    const rev = Object.keys(CHARACTER_ID_ALIASES).find((k) => CHARACTER_ID_ALIASES[k] === id);
    if (rev) set.add(rev);
  };

  return blueprints.map((bp, bIdx) => {
    // Đảm bảo không trùng lặp thành viên và tối đa 1 Nhà Lữ Hành trong cả 4 vị trí
    const seenIds = new Set<string>();
    markSeen(thisMember.id, seenIds);
    let hasTraveler = isTravelerCharacter(thisMember.id);

    const teammates: TeamVariantMember[] = [];

    for (let tIdx = 0; tIdx < bp.teammateIds.length; tIdx++) {
      const rawId = bp.teammateIds[tIdx];
      let resolvedId = rawId;

      if (allCharactersMap.has(rawId)) {
        resolvedId = rawId;
      } else if (CHARACTER_ID_ALIASES[rawId] && allCharactersMap.has(CHARACTER_ID_ALIASES[rawId])) {
        resolvedId = CHARACTER_ID_ALIASES[rawId];
      } else {
        const rev = Object.keys(CHARACTER_ID_ALIASES).find((k) => CHARACTER_ID_ALIASES[k] === rawId);
        if (rev && allCharactersMap.has(rev)) {
          resolvedId = rev;
        } else {
          resolvedId = CHARACTER_ID_ALIASES[rawId] ?? rawId;
        }
      }

      let isTraveler = isTravelerCharacter(resolvedId);

      // Nếu bị trùng ID hoặc bị vi phạm quy tắc nhiều Nhà Lữ Hành hoặc không có trong map
      if (seenIds.has(resolvedId) || (isTraveler && hasTraveler) || !allCharactersMap.has(resolvedId)) {
        // Tìm 1 nhân vật Meta thay thế an toàn
        const fallbackCandidates = [
          "bennett",
          "zhongli",
          "kaedehara-kazuha",
          "kazuha",
          "xingqiu",
          "fischl",
          "nahida",
          "furina",
          "xiangling",
          "sucrose",
        ];

        const safeReplacement = fallbackCandidates.find(
          (candId) =>
            !seenIds.has(candId) &&
            candId !== character.id &&
            (!isTravelerCharacter(candId) || !hasTraveler) &&
            allCharactersMap.has(candId)
        );

        if (safeReplacement) {
          resolvedId = safeReplacement;
          isTraveler = isTravelerCharacter(resolvedId);
        }
      }

      markSeen(resolvedId, seenIds);
      if (isTraveler) hasTraveler = true;

      const dbChar = allCharactersMap.get(resolvedId);
      if (dbChar) {
        teammates.push({
          id: dbChar.id,
          name: dbChar.name,
          localizedName: dbChar.localizedName,
          iconUrl: dbChar.iconUrl,
          vision: dbChar.vision,
          rarity: dbChar.rarity,
          roleVi: bp.teammateRoles[tIdx],
        });
      } else {
        teammates.push({
          id: resolvedId,
          name: resolvedId,
          localizedName: resolvedId,
          iconUrl: null,
          vision: "Anemo",
          rarity: 4,
          roleVi: bp.teammateRoles[tIdx],
        });
      }
    }

    const fullTeam = [thisMember, ...teammates];
    const teamParam = fullTeam.map((m) => m.id).join(",");

    return {
      variantId: `variant-${bIdx + 1}`,
      nameVi: bp.nameVi,
      situationVi: bp.situationVi,
      archetypeVi: bp.archetypeVi,
      members: fullTeam,
      reactionsVi: bp.reactionsVi,
      resonancesVi: bp.resonancesVi,
      teamBuilderUrl: `/${locale}/tools/team-builder?team=${teamParam}`,
    };
  });
}
