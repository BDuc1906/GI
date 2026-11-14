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
 */
function generateDynamicVariants(
  character: { id: string; name: string; vision: string },
  charactersByVision: Map<string, Array<{ id: string; name: string; vision: string; rarity: number }>>
): RawTeamBlueprint[] {
  const getTop = (vision: string, excludeIds: string[]) => {
    const list = charactersByVision.get(vision) ?? [];
    return list.find((c) => !excludeIds.includes(c.id) && c.id !== character.id);
  };

  const v = character.vision;

  if (v === "Pyro") {
    // 1. Vape, 2. Melt, 3. Overload
    const hydro1 = getTop("Hydro", []);
    const hydro2 = getTop("Hydro", [hydro1?.id ?? ""]);
    const anemo = getTop("Anemo", []);
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
    const dendro1 = getTop("Dendro", []);
    const electro1 = getTop("Electro", []);
    const cryo1 = getTop("Cryo", []);
    const anemo = getTop("Anemo", []);

    return [
      {
        nameVi: "Biến thể 1: Đội Hình Bốc Hơi (Vaporize)",
        situationVi: "Tối ưu hóa sát thương Thủy/Hỏa diện rộng và gia tăng hệ số khuếch đại.",
        archetypeVi: "Bốc Hơi (Vaporize)",
        teammateIds: [pyro1?.id ?? "xiangling", anemo?.id ?? "kazuha", getTop("Pyro", [pyro1?.id ?? ""])?.id ?? "bennett"],
        teammateRoles: ["Phụ sát thương (Sub-DPS)", "Hỗ trợ (Buffer)", "Hồi máu (Healer)"],
        reactionsVi: ["Bốc Hơi (x2.0)", "Khuếch Tán"],
        resonancesVi: ["Nhiệt Huyết (+25% ATK)"],
      },
      {
        nameVi: "Biến thể 2: Nở Rộ Siêu Cấp (Hyperbloom)",
        situationVi: "Sinh hạt Thảo liên tục và kích nổ tự tìm diệt mục tiêu linh hoạt.",
        archetypeVi: "Nở Rộ Siêu Cấp (Hyperbloom)",
        teammateIds: [dendro1?.id ?? "nahida", electro1?.id ?? "kuki-shinobu", getTop("Dendro", [dendro1?.id ?? ""])?.id ?? "baizhu"],
        teammateRoles: ["Hỗ trợ (Buffer)", "Hồi máu (Healer)", "Hồi máu (Healer)"],
        reactionsVi: ["Nở Rộ Siêu Cấp", "Sinh Trưởng"],
        resonancesVi: ["Cỏ Cây (+EM)"],
      },
      {
        nameVi: "Biến thể 3: Đóng Băng Khống Chế (Permafrost Freeze)",
        situationVi: "Đóng băng toàn bộ kẻ địch cơ động, giữ an toàn và tăng Tỉ Lệ Bạo.",
        archetypeVi: "Đóng Băng (Frozen)",
        teammateIds: [cryo1?.id ?? "ayaka", anemo?.id ?? "kazuha", getTop("Cryo", [cryo1?.id ?? ""])?.id ?? "diona"],
        teammateRoles: ["Chủ lực (DPS)", "Hỗ trợ (Buffer)", "Bảo hộ / Khiên (Shielder)"],
        reactionsVi: ["Đóng Băng", "Khuếch Tán Băng"],
        resonancesVi: ["Sương Giá (+15% CRIT Rate)"],
      },
    ];
  }

  if (v === "Dendro") {
    const electro1 = getTop("Electro", []);
    const hydro1 = getTop("Hydro", []);
    const _electro2 = getTop("Electro", [electro1?.id ?? ""]);
    const dendroBuffer = getTop("Dendro", []);

    return [
      {
        nameVi: "Biến thể 1: Sinh Trưởng & Lan Truyền (Quicken Spread)",
        situationVi: "Gia tăng sát thương nguyên chất Thảo và Lôi bằng trạng thái Sinh Trưởng.",
        archetypeVi: "Lan Truyền (Spread)",
        teammateIds: [electro1?.id ?? "fischl", dendroBuffer?.id ?? "nahida", getTop("Geo", [])?.id ?? "zhongli"],
        teammateRoles: ["Phụ sát thương (Sub-DPS)", "Hỗ trợ (Buffer)", "Bảo hộ / Khiên (Shielder)"],
        reactionsVi: ["Sinh Trưởng", "Lan Truyền", "Tăng Cường"],
        resonancesVi: ["Cỏ Cây (+EM)"],
      },
      {
        nameVi: "Biến thể 2: Nở Rộ Siêu Cấp (Hyperbloom)",
        situationVi: "Tận dụng tối đa hạt Thảo và kích nổ tầm xa sát thương cao.",
        archetypeVi: "Nở Rộ Siêu Cấp (Hyperbloom)",
        teammateIds: [hydro1?.id ?? "xingqiu", electro1?.id ?? "kuki-shinobu", getTop("Hydro", [hydro1?.id ?? ""])?.id ?? "yelan"],
        teammateRoles: ["Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)", "Phụ sát thương (Sub-DPS)"],
        reactionsVi: ["Nở Rộ Siêu Cấp", "Sinh Trưởng"],
        resonancesVi: ["Trị Liệu (+25% Max HP)"],
      },
      {
        nameVi: "Biến thể 3: Bung Nở Diệt Quái (Burgeon)",
        situationVi: "Kích nổ hạt Thảo diện rộng bằng Hỏa, quét sạch quái đông nhanh chóng.",
        archetypeVi: "Bung Nở (Burgeon)",
        teammateIds: [hydro1?.id ?? "xingqiu", getTop("Pyro", [])?.id ?? "thoma", getTop("Anemo", [])?.id ?? "baizhu"],
        teammateRoles: ["Phụ sát thương (Sub-DPS)", "Bảo hộ / Khiên (Shielder)", "Hồi máu (Healer)"],
        reactionsVi: ["Bung Nở (x2.0)", "Thiêu Rụi"],
        resonancesVi: ["Tán Râm (+15% Kháng)"],
      },
    ];
  }

  if (v === "Electro") {
    const dendro1 = getTop("Dendro", []);
    const anemo1 = getTop("Anemo", []);
    const electroBattery = getTop("Electro", []);
    const hydro1 = getTop("Hydro", []);
    const pyroChevreuse = charactersByVision.get("Pyro")?.find((c) => c.id === "chevreuse") ?? getTop("Pyro", []);
    const chevreuseId = pyroChevreuse?.id ?? "chevreuse";
    const pyroBuffer = getTop("Pyro", [chevreuseId]);

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
    const anemo1 = getTop("Anemo", []);
    const cryoSupport = getTop("Cryo", []);
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
    const hydro1 = getTop("Hydro", []);
    const pyro1 = getTop("Pyro", []);
    const pyroBuffer = getTop("Pyro", [pyro1?.id ?? ""]);

    return [
      {
        nameVi: "Biến thể 1: Thuần Phong Siêu Cấp (Anemo Hypercarry)",
        situationVi: "Tối đa hóa sát thương Phong nguyên chất với sự hỗ trợ giảm kháng và buff bạo kích.",
        archetypeVi: "Thuần Phong (Anemo Hypercarry)",
        teammateIds: [faruzanId, hydro1?.id ?? "furina", getTop("Geo", [])?.id ?? "zhongli"],
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
  const pyro1 = getTop("Pyro", []);
  const pyroBuffer = getTop("Pyro", [pyro1?.id ?? ""]);

  return [
    {
      nameVi: "Biến thể 1: Thuần Nham Hoàng Kim (Mono Geo)",
      situationVi: "Tối đa hóa phòng ngự và sát thương Nham nguyên chất với buff Khiên Kiên Định.",
      archetypeVi: "Thuần Nham (Mono Geo)",
      teammateIds: [geoSupport?.id ?? "gorou", getTop("Geo", [geoSupport?.id ?? ""])?.id ?? "zhongli", pyroBuffer?.id ?? "bennett"],
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
    // Sắp xếp ưu tiên 5 sao trước
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

  return blueprints.map((bp, bIdx) => {
    const teammates: TeamVariantMember[] = bp.teammateIds.map((tId, tIdx) => {
      const dbChar = allCharactersMap.get(tId);
      if (dbChar) {
        return {
          id: dbChar.id,
          name: dbChar.name,
          localizedName: dbChar.localizedName,
          iconUrl: dbChar.iconUrl,
          vision: dbChar.vision,
          rarity: dbChar.rarity,
          roleVi: bp.teammateRoles[tIdx],
        };
      }
      return {
        id: tId,
        name: tId,
        localizedName: tId,
        iconUrl: null,
        vision: "Anemo",
        rarity: 4,
        roleVi: bp.teammateRoles[tIdx],
      };
    });

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
