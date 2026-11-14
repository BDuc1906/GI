// src/data/character-builds-data.ts
import { DRAFT_BUILDS } from "./character-builds-draft";
// AUTO-MANAGED: Thêm/cập nhật build nhân vật ở đây.
// Chạy `npm run builds:update` để validate sau khi sửa.

export interface CharacterWeaponBuild {
  weaponId: string; // slug trong DB: "staff-of-homa"
  tier: "S" | "A" | "B" | "C";
  noteVi: string; // lý do ngắn gọn
}

export interface CharacterArtifactBuild {
  setIds: string[]; // ["4pc-set-id"] hoặc ["2pc-a", "2pc-b"]
  mode: "4pc" | "2+2";
  noteVi: string;
  priority: number; // 1 = tốt nhất
}

export interface CharacterTeamBuild {
  nameVi: string;
  archetypeVi: string;
  situationVi: string;
  teammateIds: [string, string, string];
  teammateRoles: [string, string, string];
  reactionsVi: string[];
  resonancesVi: string[];
}

/**
 * Nguồn của một build:
 *  - "curated": viết tay / đã được biên tập viên duyệt (mặc định khi không ghi `status`).
 *  - "draft"  : bản nháp soạn từ tài liệu tham khảo, CHƯA được biên tập viên duyệt.
 *  - "auto"   : không có dữ liệu ở đây, UI tự suy ra theo nguyên tố + loại vũ khí.
 */
export type BuildSource = "curated" | "draft" | "auto";

export interface CharacterBuildEntry {
  /** Bỏ trống = "curated". Đặt "draft" cho bản nháp chưa duyệt. */
  status?: "draft";
  /** Ngày soạn/duyệt gần nhất (YYYY-MM-DD) để hiển thị cho người đọc. */
  updatedAt?: string;
  weapons?: CharacterWeaponBuild[];
  artifacts?: CharacterArtifactBuild[];
  teams?: CharacterTeamBuild[];
  mainStats?: { sands: string; goblet: string; circlet: string; note: string };
  subStats?: { stats: string[]; note: string };
  talentPriority?: { order: [string, string, string]; note: string };
  playstyleNoteVi?: string;
}

export const CHARACTER_BUILDS: Record<string, CharacterBuildEntry> = {
  // ─────────────────────────── 5-STAR ───────────────────────────

  // Dendro Sword
  alhaitham: {
    weapons: [
      { weaponId: "light-of-foliar-incision", tier: "S", noteVi: "Tốt nhất - CRIT DMG cao + passive EM Spread" },
      { weaponId: "primordial-jade-cutter", tier: "S", noteVi: "CR bonus cao, stacking ATK tốt" },
      { weaponId: "haran-geppaku-futsu", tier: "A", noteVi: "Elemental Skill DMG Bonus cao" },
      { weaponId: "mistsplitter-reforged", tier: "A", noteVi: "Elemental DMG Bonus ngăn xếp" },
      { weaponId: "iron-sting", tier: "B", noteVi: "Tốt nhất F2P - EM 165 sub-stat" },
    ],
    artifacts: [
      { setIds: ["gilded-dreams"], mode: "4pc", priority: 1, noteVi: "Tăng EM + ATK tự động theo thành viên team" },
      { setIds: ["deepwood-memories"], mode: "4pc", priority: 2, noteVi: "Giảm Dendro RES 30% nếu không có Nahida" },
      { setIds: ["gilded-dreams", "deepwood-memories"], mode: "2+2", priority: 3, noteVi: "Thay thế khi thiếu 4pc" },
    ],
    mainStats: {
      sands: "EM hoặc ATK%",
      goblet: "Dendro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Alhaitham DPS trực tiếp qua Spread: CR/CD 1:2. EM >= 200 để Spread x1.6x. Nếu team Quickbloom: cân nhắc EM sands.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "Elemental Mastery (EM >= 200)", "ATK%", "Energy Recharge (ER <= 140%)", "Flat ATK"],
      note: "Spread tính CRIT bình thuong. Uu tiên CR/CD trước, sau đó EM để nhân Spread. ER 130-140% để Q liên tục.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Đòn thường (NA)", "Nguyên tố bùng phát (Q)"],
      note: "E tạo Mirror là nguồn sát thương chính. NA kích hoạt Mirror. Q ít quan trọng nhất vì CD dài.",
    },
    playstyleNoteVi:
      "Thi triển chính: Q -> E để tạo 3 Mirror -> NA spam để Mirror kích hoạt -> khi Mirror sắp hết dùng E reset. Uu tiên Spread (Dendro + Electro). Không cần nhiều ER vì Q không phải nguồn DPS chính.",
  },

  // Pyro Polearm
  arlecchino: {
    weapons: [
      { weaponId: "crimson-moon-s-semblance", tier: "S", noteVi: "Trấn tối thượng: CRIT Rate +22.1%, tăng 25% ATK và buff đến 36% sát thương khi có Khế Ước Sinh Mệnh" },
      { weaponId: "primordial-jade-winged-spear", tier: "S", noteVi: "Hòa Phác Diên: CRIT Rate +22.1%, tích lũy ATK và buff 12% sát thương toàn phần" },
      { weaponId: "staff-of-the-scarlet-sands", tier: "A", noteVi: "Quyền Trượng Cát Đỏ: CRIT Rate +44.1% cực lớn, chuyển hóa EM thành ATK trong đội Bốc Hơi" },
      { weaponId: "deathmatch", tier: "A", noteVi: "Thương Quyết Đấu: Tốt nhất 4 sao - CRIT Rate +36.8% và buff ATK liên tục" },
      { weaponId: "white-tassel", tier: "A", noteVi: "Bạch Anh Thương: Tuyệt phẩm 3 sao F2P - CRIT Rate +23.4% và tăng 48% sát thương Đòn Đánh Thường" },
    ],
    artifacts: [
      { setIds: ["fragment-of-harmonic-whimsy"], mode: "4pc", priority: 1, noteVi: "Trấn thánh di vật: Tăng 18% ATK và buff đến 54% Sát Thương toàn diện qua Khế Ước Sinh Mệnh" },
      { setIds: ["gladiator-s-finale"], mode: "4pc", priority: 2, noteVi: "Giác Đấu Sĩ: Tăng 18% ATK và 35% sát thương Đòn Đánh Thường, dễ farm và cực kỳ ổn định" },
      { setIds: ["gilded-dreams"], mode: "4pc", priority: 3, noteVi: "Giấc Mộng Hoàng Kim: Tối ưu cho đội hình Bốc Hơi (Vaporize) và Tan Chảy (Melt)" },
    ],
    mainStats: {
      sands: "ATK% (hoặc EM nếu đi đội Bốc Hơi)",
      goblet: "Pyro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Arlecchino lấy sát thương theo ATK và cơ chế Khế Ước Sinh Mệnh (Bond of Life). Cần duy trì CRIT Rate từ 70% trở lên.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Elemental Mastery (EM 80-120 nếu Vape)", "Energy Recharge (ER 110-120%)", "Flat ATK"],
      note: "Arlecchino không nhận hồi máu từ đồng đội khi chiến đấu, tập trung tối đa chỉ số công kích. Q chỉ dùng khi cần hồi máu khẩn cấp.",
    },
    talentPriority: {
      order: ["Đòn thường (NA)", "Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)"],
      note: "Đòn đánh thường (NA) là nguồn sát thương áp đảo (chiếm 85%+ DPS). Nâng E để tăng sát thương thu hồi Lệnh Thu Hoạch.",
    },
    playstyleNoteVi:
      "Quy trình chiến đấu: Dùng E khắc dấu lên kẻ địch -> đổi sang đồng đội buff ấn (Kazuha/Yelan/Bennett) khoảng 5-6 giây để dấu chuyển thành 'Nợ Máu Huyết Đỏ' -> Đổi lại Arlecchino Trọng Kích để thu hồi 130-145% Khế Ước Sinh Mệnh -> Xả chuỗi đánh thường NA dồn sát thương Hỏa cực mạnh.",
  },

  // Cryo Sword
  ayaka: {
    weapons: [
      { weaponId: "mistsplitter-reforged", tier: "S", noteVi: "Ánh Sương Đêm Sương Mù - Trấn tối thượng của Ayaka, CRIT DMG 44.1% và buff tới 28-40% Sát Thương Nguyên Tố Băng" },
      { weaponId: "haran-geppaku-futsu", tier: "S", noteVi: "Haran Geppaku Futsu - CRIT Rate 33.1% và tăng 12% sát thương nguyên tố Băng" },
      { weaponId: "primordial-jade-cutter", tier: "S", noteVi: "Bàn Nham Kết Lục - 44.1% CRIT Rate cực lớn và tăng tấn công theo HP" },
      { weaponId: "amenoma-kageuchi", tier: "S", noteVi: "Đoản Đao Amenoma R5 - Vũ khí rèn F2P số 1, giải quyết triệt để vấn đề sạc nạp Q 80 năng lượng" },
      { weaponId: "finale-of-the-deep", tier: "A", noteVi: "Đoản Đao Hải Uyên - Kiếm rèn Fontaine tăng lượng lớn ATK% qua cơ chế Khế Ước Sinh Mệnh" },
      { weaponId: "the-black-sword", tier: "A", noteVi: "Kiếm Đen - CRIT Rate và tăng 40% sát thương Trọng Kích ở R5" },
    ],
    artifacts: [
      { setIds: ["blizzard-strayer"], mode: "4pc", priority: 1, noteVi: "Dũng Sĩ Băng Giá 4 món - Tăng 15% Cryo DMG và nhận tới 40% CRIT Rate khi kẻ địch bị Đóng Băng" },
      { setIds: ["blizzard-strayer", "noblesse-oblige"], mode: "2+2", priority: 2, noteVi: "2pc Băng (+15%) + 2pc Tông Thất (+20% Nộ) - Lựa chọn tạm thời nếu chưa farm đủ bộ 4pc" },
    ],
    mainStats: {
      sands: "Tấn công (ATK%)",
      goblet: "Sát thương Băng (Cryo DMG%)",
      circlet: "Sát thương Bạo Kích (CRIT DMG)",
      note: "Nhờ hiệu ứng 40% CRIT Rate từ bộ 4 Dũng Sĩ Băng Giá và 15% từ Cộng Hưởng Băng, Ayaka chỉ cần 35-45% CRIT Rate cơ bản và dồn toàn bộ vào CRIT DMG.",
    },
    subStats: {
      stats: ["Sát thương Bạo Kích (CRIT DMG)", "Hiệu Quả Nạp (ER 130-140%)", "Tấn công (ATK%)", "Tỷ lệ Bạo Kích (CRIT Rate 35-45%)", "Flat ATK"],
      note: "Đảm bảo ER từ 130-140% (hoặc cầm Amenoma R5) để chiêu Nộ Q luôn sẵn sàng mỗi rotation.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Đòn thường (NA)", "Kỹ năng nguyên tố (E)"],
      note: "Chiêu Nộ Soumetsu chiếm trên 70% tổng sát thương chu kỳ của Ayaka (xoáy bão tuyết 20 hit). Đòn đánh thường/trọng kích nâng thứ 2.",
    },
    playstyleNoteVi:
      "Lướt Dash áp ấn Băng và nhận buff sát thương Băng -> Đánh thường/Trọng kích kết hợp E hất tung tích hạt nạp -> Bật Q tung bão tuyết Soumetsu dồn sát thương khổng lồ. Kết hợp hoàn hảo cùng Hydro (Furina/Kokomi/Mona) và Anemo (Kazuha/Venti) đóng băng vĩnh cửu.",
  },

  // Electro Polearm
  cyno: {
    weapons: [
      { weaponId: "staff-of-the-scarlet-sands", tier: "S", noteVi: "Trượng Cát Đỏ - Trấn phái tối thượng của Cyno, 44.1% CRIT Rate và chuyển hóa tới 136% EM thành chỉ số Tấn Công" },
      { weaponId: "primordial-jade-winged-spear", tier: "S", noteVi: "Hòa Phác Diên - CRIT Rate 22.1%, Base ATK cao và tích tầng tăng mạnh ATK cùng sát thương kỹ năng" },
      { weaponId: "staff-of-homa", tier: "S", noteVi: "Trượng Homa - CRIT DMG 66.2% và tăng lượng lớn ATK theo HP" },
      { weaponId: "ballad-of-the-fjords", tier: "A", noteVi: "Khúc Ca Vịnh Hẹp - 27.6% CRIT Rate và nhận tới 120-240 EM khi đội hình có từ 3 nguyên tố khác nhau" },
      { weaponId: "deathmatch", tier: "A", noteVi: "Thương Quyết Chiến - CRIT Rate 36.8% cực ổn định và buff ATK" },
      { weaponId: "white-tassel", tier: "A", noteVi: "Thương Trắng R5 - Vũ khí 3 sao F2P đỉnh cao, tăng tới 48% sát thương Đòn Đánh Thường trong trạng thái Q" },
    ],
    artifacts: [
      { setIds: ["thundering-fury"], mode: "4pc", priority: 1, noteVi: "Như Sấm Thịnh Nộ 4 món - Giảm 1s hồi chiêu E mỗi khi kích hoạt phản ứng Lôi, cho phép E liên tục trong Q" },
      { setIds: ["gilded-dreams"], mode: "4pc", priority: 2, noteVi: "Giấc Mộng Hoàng Kim 4 món - Cung cấp lượng lớn Tinh Thông Nguyên Tố (EM) và ATK% theo cấu trúc đội" },
      { setIds: ["gladiator-s-finale"], mode: "4pc", priority: 3, noteVi: "Lễ Bế Mạc Của Giác Đấu Sĩ - Tăng 35% sát thương Đòn Đánh Thường NA trong trạng thái Nộ Q" },
    ],
    mainStats: {
      sands: "Tinh Thông Nguyên Tố (EM) hoặc ATK%",
      goblet: "Sát thương Lôi (Electro DMG%)",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Cyno trong đội hình Tăng Cường (Aggravate) hoặc Nở Rộ Nhanh (Quickbloom) ưu tiên Đồng Hồ EM để tối ưu cả phản ứng và nội tại Trấn.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "Tinh Thông Nguyên Tố (EM 200-300)", "Hiệu Quả Nạp (ER 130-150%)", "Tấn công (ATK%)"],
      note: "Cần đảm bảo đủ ER 130-150% (hoặc đi cùng Fischl pin Lôi) để Q nạp đầy liên tục vì Q tiêu tốn tới 80 năng lượng.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Chiêu Nộ Q biến hóa toàn bộ đòn đánh thành sát thương Lôi diện rộng và tăng cấp đòn E. Đòn thường NA ở ngoài sân không cần nâng.",
    },
    playstyleNoteVi:
      "Cyno thi triển Q biến thân thành Sứ Giả Dẫn Linh kéo dài 18 giây, liên tục thi triển đòn đánh thường Lôi và canh đúng thời điểm 'Mắt Judication' xuất hiện trên màn hình để nhấn E tung Nghi Thức Giác Ngộ nhân đôi sát thương. Đi cùng Nahida/Baizhu và Furina/Yelan tạo thành đội Quickbloom hủy diệt.",
  },

  // Cryo Claymore
  eula: {
    weapons: [
      { weaponId: "song-of-broken-pines", tier: "S", noteVi: "Tiếng Gió Trong Rừng Thông - Trấn phái của Eula, Base ATK 741 cao nhất game, tăng Physical DMG và buff 20% ATK + 12% Tốc độ đánh cho cả đội" },
      { weaponId: "beacon-of-the-reed-sea", tier: "S", noteVi: "Hải Đăng Bờ Biển Lau - 33.1% CRIT Rate cực lớn cùng passive tăng mạnh ATK% sau khi trúng E và nhận sát thương" },
      { weaponId: "wolf-s-gravestone", tier: "S", noteVi: "Đường Cùng Của Sói - Cung cấp chỉ số ATK% khổng lồ và buff thêm 40% ATK cho toàn đội khi địch dưới 30% HP" },
      { weaponId: "serpent-spine", tier: "S", noteVi: "Kiếm Ly Cốt R5 - 27.6% CRIT Rate và gia tăng tới 50% toàn bộ sát thương gây ra" },
      { weaponId: "snow-tombed-starsilver", tier: "A", noteVi: "Tuyết Vùi Tinh Ngân - Đại kiếm rèn F2P chuẩn Vật Lý, tăng sát thương Băng và rớt thạch anh tuyết" },
      { weaponId: "tidal-shadow", tier: "A", noteVi: "Bóng Râm Thủy Triều - Đại kiếm rèn Fontaine tăng tới 48% ATK ở R5 mỗi khi nhận hồi máu" },
    ],
    artifacts: [
      { setIds: ["pale-flame"], mode: "4pc", priority: 1, noteVi: "Lửa Trắng Xám 4 món - Tích tầng hoàn hảo qua kỹ năng E, mang lại 50% Sát Thương Vật Lý và 18% Tấn Công ATK" },
      { setIds: ["pale-flame", "bloodstained-chivalry"], mode: "2+2", priority: 2, noteVi: "2pc Lửa Trắng Xám + 2pc Kỵ Sĩ Đạo Nhuốm Máu - Nhận ngay 50% Sát Thương Vật Lý cố định không cần tích tầng" },
    ],
    mainStats: {
      sands: "Tấn công (ATK%)",
      goblet: "Sát thương Vật Lý (Physical DMG%)",
      circlet: "Tỷ lệ Bạo Kích (CRIT Rate) hoặc Sát thương Bạo Kích (CRIT DMG)",
      note: "Eula thuần túy là chủ lực Vật Lý. Ly Sát Thương Vật Lý (Physical DMG%) và Đồng Hồ ATK% là sự lựa chọn bắt buộc.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "Tấn công (ATK%)", "Hiệu Quả Nạp (ER 130-150%)", "Flat ATK"],
      note: "Kiếm Ánh Sáng của chiêu Nộ Q chỉ nổ 1 lần duy nhất, nên cần duy trì CRIT Rate tối thiểu 65-75% để không bị hụt bạo kích.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Đòn thường (NA)", "Kỹ năng nguyên tố (E)"],
      note: "Chiêu Nộ Q (Kiếm Ánh Sáng) tạo ra vụ nổ sát thương vật lý hàng triệu điểm. Đòn đánh thường NA của Eula có tỷ lệ sát thương rất cao.",
    },
    playstyleNoteVi:
      "Combo chu kỳ nộ chuẩn của Eula: Nhấn E -> Q -> Đánh thường 4 đòn (N4) -> Giữ E tung 2 mảnh kiếm băng hạ kháng -> Tiếp tục đánh thường N4 tích tối đa tầng Kiếm Ánh Sáng rồi bộc phá. Luôn kết hợp cùng Lôi (Raiden Shogun/Fischl) để kích Siêu Dẫn giảm 40% kháng vật lý của kẻ địch.",
  },

  // Hydro Sword
  furina: {
    weapons: [
      { weaponId: "splendor-of-tranquil-waters", tier: "S", noteVi: "Trấn tối thượng: Sắc Nước Tĩnh Lặng - Tăng mạnh HP% và buff đến 24% Sát Thương Kỹ Năng Nguyên Tố" },
      { weaponId: "fleuve-cendre-ferryman", tier: "S", noteVi: "Phà Fleuve Cendre (Ống Nước F2P): Vũ khí F2P số 1 - Cung cấp lượng lớn Hiệu Quả Nạp và tăng 16% CRIT Rate Kỹ Năng E" },
      { weaponId: "favonius-sword", tier: "S", noteVi: "Kiếm Tây Phong: Tuyệt vời cho Furina solo Hydro (cần 180-200% ER), nạp năng lượng dồi dào cho toàn đội" },
      { weaponId: "primordial-jade-cutter", tier: "A", noteVi: "Bàn Nham Kết Lục: CRIT Rate 44.1% cực lớn và chuyển hóa HP thành ATK" },
      { weaponId: "key-of-khaj-nisut", tier: "A", noteVi: "Chìa Khóa Khaj-Nisut: Lượng HP% khổng lồ và buff EM cho toàn đội hình" },
    ],
    artifacts: [
      { setIds: ["golden-troupe"], mode: "4pc", priority: 1, noteVi: "Đoàn Kịch Hoàng Kim: Trấn thánh di vật tối thượng - Tăng 70% sát thương Salon Members từ ngoài sân" },
      { setIds: ["marechaussee-hunter"], mode: "4pc", priority: 2, noteVi: "Thợ Săn Marechaussee: Dành riêng cho Furina C6 đứng sân dồn sát thương" },
      { setIds: ["tenacity-of-the-millelith"], mode: "4pc", priority: 3, noteVi: "Thiên Nham Vững Chắc: Hỗ trợ tăng 20% HP và kích hoạt buff 20% ATK liên tục cho toàn đội" },
    ],
    mainStats: {
      sands: "HP%",
      goblet: "HP% hoặc Hydro DMG%",
      circlet: "CRIT Rate hoặc HP%",
      note: "Furina scale HP cho Salon Members và Fanfare stacks. HP% uu tiên tuyệt đối. Hydro DMG% Goblet nếu muốn DPS hybrid.",
    },
    subStats: {
      stats: ["HP%", "CRIT Rate / CRIT DMG", "Energy Recharge (ER 140%+)", "Flat HP", "ATK%"],
      note: "Furina cần ER 140%+ để Q liên tục (Q cost 60). HP cao giúp Salon Members gây nhiều DMG và Fanfare max stacks.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E tạo Salon Members (off-field sub-DPS) - nguồn sát thương chính. Q tạo buff Fanfare - quan trọng. NA ít dùng.",
    },
    playstyleNoteVi:
      "E tạo 3-4 Salon Members off-field, deal DMG và thay đổi HP đồng đội để stack Fanfare. Q kích hoạt Let the Show Begin: buff ATK + Healing Bonus theo Fanfare stacks (max 400). Cần healer để bù HP khi E drain. Baizhu/Charlotte là combo hoàn hảo.",
  },

  // Cryo Bow
  ganyu: {
    weapons: [
      { weaponId: "amos-bow", tier: "S", noteVi: "Tốt nhất - ATK% + bonus DMG theo thời gian bay" },
      { weaponId: "polar-star", tier: "S", noteVi: "ATK stack passive cực mạnh khi skill/burst" },
      { weaponId: "aqua-simulacra", tier: "A", noteVi: "HP DMG bonus luôn hoạt động" },
      { weaponId: "thundering-pulse", tier: "A", noteVi: "ATK% + NA DMG bonus tốt" },
      { weaponId: "prototype-crescent", tier: "B", noteVi: "Tốt nhất F2P - ATK buff khi headshot weakspot" },
    ],
    artifacts: [
      { setIds: ["wanderer-s-troupe"], mode: "4pc", priority: 1, noteVi: "Charged Attack DMG +35% - Ganyu CA chính" },
      { setIds: ["blizzard-strayer"], mode: "4pc", priority: 2, noteVi: "Freeze team - CR +40% khi địch đóng băng" },
      { setIds: ["wanderer-s-troupe", "blizzard-strayer"], mode: "2+2", priority: 3, noteVi: "EM +80 + Cryo DMG 15% thay thế" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Cryo DMG%",
      circlet: "CRIT DMG (vì A1 passive +20% CR khi CA)",
      note: "Ganyu A1 cho +20% CRIT Rate cho Charged Attacks. Cộng thêm Blizzard 4pc +40% thì CR dư -> uu tiên CD circlet. Melt team: giữ CR 60%+ không tính bonus.",
    },
    subStats: {
      stats: ["CRIT DMG", "CRIT Rate (đủ 60-70%)", "ATK%", "Elemental Mastery (100 nếu Melt)", "Energy Recharge (ER 130%)"],
      note: "Ganyu Melt: EM 100+ để tăng Melt multiplier. Freeze: tối đa CD sau khi đủ CR. Amos Bow cho bonus khi CA Lv2 bay.",
    },
    talentPriority: {
      order: ["Đòn thường (NA)", "Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)"],
      note: "NA (Charged Attack Lv2) là nguồn sát thương chính của Ganyu. Q tạo icicle rain diện rộng. E bait địch và trail Cryo.",
    },
    playstyleNoteVi:
      "Ganyu main DPS là bắn CA Lv2 liên tục (hold aim -> 2 giây -> release). Mỗi CA Lv2 phóng Frostflake Arrow có AoE Cryo. Melt setup: Xiangling Q áp Pyro -> Ganyu CA = Melt x2.0. Freeze setup: Mona/Kokomi wet địch -> Ganyu CA = đóng băng + Blizzard buff.",
  },

  // Pyro Polearm
  "hu-tao": {
    weapons: [
      { weaponId: "staff-of-homa", tier: "S", noteVi: "Trượng Hộ Ma: Trấn tối thượng - CRIT DMG 66.2%, tăng 20% HP và chuyển hóa HP thành ATK khủng khiếp dưới 50% HP" },
      { weaponId: "ballad-of-the-fjords", tier: "S", noteVi: "Khúc Ca Vịnh Hẹp (Nhật Ký Hành Trình): CRIT Rate 27.6% và tăng tới 240 EM khi đội hình có ít nhất 3 hệ nguyên tố" },
      { weaponId: "dragon-s-bane", tier: "S", noteVi: "Tai Ương Của Rồng R5: Vũ khí 4 sao hoàn hảo - 221 EM và tăng đến 36% sát thương lên kẻ địch dính Thủy/Hỏa" },
      { weaponId: "primordial-jade-winged-spear", tier: "A", noteVi: "Hòa Phác Diên: CRIT Rate 22.1% và tích lũy buff ATK" },
      { weaponId: "deathmatch", tier: "A", noteVi: "Thương Quyết Đấu: CRIT Rate 36.8% dễ dàng cân bằng chỉ số bạo kích" },
      { weaponId: "white-tassel", tier: "A", noteVi: "Bạch Anh Thương 3 sao F2P: CRIT Rate 23.4% và tăng 48% sát thương đòn đánh" },
    ],
    artifacts: [
      { setIds: ["crimson-witch-of-flames"], mode: "4pc", priority: 1, noteVi: "Diệm Liệt Ma Nữ Cháy Rực: Bộ thánh di vật biểu tượng - Buff 15% Sát Thương Hỏa và tăng 15% sát thương Bốc Hơi" },
      { setIds: ["marechaussee-hunter"], mode: "4pc", priority: 2, noteVi: "Thợ Săn Marechaussee: Lựa chọn tối thượng khi đi cùng Furina (tăng tới 36% CRIT Rate)" },
      { setIds: ["shimenawa-s-reminiscence"], mode: "4pc", priority: 3, noteVi: "Dòng Hồi Ức Bất Tận: Tăng 18% ATK và buff 50% sát thương Trọng Kích (đổi lại tốn năng lượng nộ)" },
      { setIds: ["gilded-dreams"], mode: "4pc", priority: 4, noteVi: "Giấc Mộng Hoàng Kim: Cung cấp lượng lớn Tinh Thông Nguyên Tố và Tấn Công trong đội phản ứng" },
    ],
    mainStats: {
      sands: "HP%",
      goblet: "Pyro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Hu Tao E scale HP: cần HP 25000-30000+. HP% sands bắt buộc. Khi HP < 50% -> Q crit DMG tăng. CR 60%+ trước khi stack CD.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "HP%", "Elemental Mastery (EM 100+ Vape)", "Flat HP", "ATK%"],
      note: "Hu Tao E gây Pyro DMG dựa trên HP. EM quan trọng nếu Vaporize thường xuyên (EM 100 = +8% Vape DMG). HP 25k+ trước khi farm CRIT.",
    },
    talentPriority: {
      order: ["Đòn thường (NA)", "Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)"],
      note: "NA là DPS chính khi E active (Pyro infusion). E scaling HP quan trọng. Q là lifesteal + burst khi HP thấp.",
    },
    playstyleNoteVi:
      "E kích hoạt Paramita Papilio: NA gây Pyro, ATK tăng theo HP. Chơi khi HP <= 50% để maximize passive. Phối Xingqiu Q off-field để Vaporize mọi NA. Q khi gần chết để lifesteal HP về. Staff of Homa passive khi HP < 50% cho bonus ATK khổng lồ.",
  },

  // Anemo Sword
  "kaedehara-kazuha": {
    weapons: [
      { weaponId: "freedom-sworn", tier: "S", noteVi: "Lời Thề Tự Do Cổ Xưa: Trấn tối thượng - Cung cấp 198 EM và buff 20% ATK + 16% sát thương đòn đánh cho toàn đội" },
      { weaponId: "xiphos-moonlight", tier: "S", noteVi: "Ánh Trăng Xiphos: Cung cấp 165 EM và chuyển hóa EM thành Hiệu Quả Nạp cho cả Kazuha lẫn toàn đội" },
      { weaponId: "favonius-sword", tier: "S", noteVi: "Kiếm Tây Phong: Tuyệt phẩm năng lượng - Giúp Kazuha và toàn đội xoay tua chiêu nộ cực kỳ ổn định" },
      { weaponId: "iron-sting", tier: "A", noteVi: "Thiết Phong Kích R1-R5 rèn F2P: Cung cấp 165 EM dễ dàng chế tạo cho người chơi F2P" },
      { weaponId: "sacrificial-sword", tier: "A", noteVi: "Kiếm Tế Lễ: Reset hồi chiêu E để nhảy hút quái và nạp 2 lần liên tiếp" },
    ],
    artifacts: [
      { setIds: ["viridescent-venerer"], mode: "4pc", priority: 1, noteVi: "Bóng Hình Màu Xanh: Trấn thánh di vật bắt buộc - Giảm 40% kháng nguyên tố được Khuếch Tán của kẻ địch trong 10s" },
      { setIds: ["viridescent-venerer", "wanderer-s-troupe"], mode: "2+2", priority: 2, noteVi: "Tạm thời khi chưa đủ bộ 4 món chuẩn chỉ số EM" },
    ],
    mainStats: {
      sands: "EM (Elemental Mastery)",
      goblet: "EM hoặc Anemo DMG%",
      circlet: "EM hoặc CRIT Rate",
      note: "Kazuha support: 3x EM slots để max Swirl DMG và A4 passive buff (+0.04% Elemental DMG per EM). EM 1000+ là mục tiêu lý tưởng.",
    },
    subStats: {
      stats: ["Elemental Mastery (EM >= 800+)", "Energy Recharge (ER 140%+)", "CRIT Rate (nếu DPS hybrid)", "ATK%", "Flat ATK"],
      note: "EM tối đa để A4 passive tăng Elemental DMG team. ER 140%+ để Q liên tục. Kazuha support không cần CRIT nhiều.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q tạo Autumn Whirlwind hút địch + Swirl liên tục. E (Plunge E) Swirl + khuếch đại. NA ít quan trọng nhất.",
    },
    playstyleNoteVi:
      "E -> lướt -> Plunge để Swirl và khuếch đại nguyên tố. Q tạo vùng hút địch + Swirl mọi nguyên tố. A4 passive: mỗi 1 EM = +0.04% Elemental DMG cho đội (EM 800 = +32% bonus). VV 4pc giảm RES 40% mọi nguyên tố Swirl được. Buffer số 1 game.",
  },

  // Dendro Catalyst
  nahida: {
    weapons: [
      { weaponId: "a-thousand-floating-dreams", tier: "S", noteVi: "Cõi Mộng Ngàn Đêm - Trấn phái tối thượng của Nahida, EM 265 cực lớn, tăng sát thương nguyên tố cá nhân và buff EM cho toàn bộ đồng đội" },
      { weaponId: "kagura-s-verity", tier: "S", noteVi: "Chân Ý Của Kagura - CRIT DMG 66.2% và buff tối đa 36% sát thương Kỹ Năng Nguyên Tố E cho Nahida đứng sân" },
      { weaponId: "sacrificial-fragments", tier: "S", noteVi: "Mảnh Chương Tế Lễ - EM 221 cực cao, giúp reset hồi chiêu E ngay lập tức khi đánh trúng kẻ địch mới xuất hiện" },
      { weaponId: "wandering-evenstar", tier: "A", noteVi: "Sao Đêm Dạo Bước - Tăng EM và chuyển hóa EM thành chỉ số Tấn Công buff cho cả Nahida lẫn đồng đội" },
      { weaponId: "the-widsith", tier: "A", noteVi: "Chương Nhạc Lang Thang - Sát thương bạo kích lớn và các khúc nhạc buff bộc phá cực mạnh" },
      { weaponId: "magic-guide", tier: "A", noteVi: "Tóm Tắt Ma Thuật R5 - Lựa chọn 3 sao F2P đỉnh cao, cung cấp 187 EM và tăng 24% sát thương lên kẻ địch dính ấn Thủy/Lôi" },
    ],
    artifacts: [
      { setIds: ["deepwood-memories"], mode: "4pc", priority: 1, noteVi: "Ký Ức Rừng Sâu 4 món - Giảm 30% kháng Thảo của kẻ địch, bắt buộc phải có ít nhất 1 người trong đội hình mang set này" },
      { setIds: ["gilded-dreams"], mode: "4pc", priority: 2, noteVi: "Giấc Mộng Hoàng Kim 4 món - Khi đồng đội khác đã mang Ký Ức Rừng Sâu, set này giúp Nahida tối đa hóa lượng EM cá nhân lên mốc 1000" },
      { setIds: ["deepwood-memories", "gilded-dreams"], mode: "2+2", priority: 3, noteVi: "2pc Thảo (+15% ST Thảo) + 2pc EM (+80 Tinh Thông) - Lựa chọn kết hợp chỉ số hoàn hảo" },
    ],
    mainStats: {
      sands: "Tinh Thông Nguyên Tố (EM)",
      goblet: "Tinh Thông Nguyên Tố (EM) hoặc Sát thương Thảo (Dendro DMG%)",
      circlet: "Tinh Thông Nguyên Tố (EM) hoặc CRIT Rate / CRIT DMG",
      note: "Mục tiêu quan trọng nhất là đạt mốc 800-1000 Tinh Thông Nguyên Tố (EM). Nếu chơi On-field đứng sân, có thể chọn Ly Sát Thương Thảo và Nón Bạo Kích.",
    },
    subStats: {
      stats: ["Tinh Thông Nguyên Tố (EM đến 800-1000)", "CRIT Rate / CRIT DMG (1:2)", "Hiệu Quả Nạp (ER 120-130%)", "Tấn công (ATK%)"],
      note: "Thiên phú cố định của Nahida chuyển hóa EM thành tối đa 24% CRIT Rate và 80% sát thương cho đòn Diệt Tịnh Tam Nghiệp.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "Kỹ năng E (Lắng Nghe Tri Kiền) liên kết kẻ địch và gây sát thương Diệt Tịnh Tam Nghiệp là 90% sát thương của Nahida. Q buff EM toàn đội.",
    },
    playstyleNoteVi:
      "Giữ E lia một vòng liên kết tối đa 8 mục tiêu, sau đó nộ Q dựng nên Cung Điện Maya tăng tới 250 EM cho đồng đội đứng sân. Dấu ấn E sẽ liên tục kích hoạt gây sát thương Thảo mỗi khi kẻ địch chịu phản ứng nguyên tố hoặc hạt Nở Rộ.",
  },

  // Geo Claymore
  navia: {
    weapons: [
      { weaponId: "verdict", tier: "S", noteVi: "Trấn tối thượng: Base ATK 674, CRIT Rate 22.1%, tăng 20% ATK và buff đến 36% sát thương Kỹ Năng Nguyên Tố khi nhận mảnh Kết Tinh" },
      { weaponId: "serpent-spine", tier: "S", noteVi: "Kiếm Ly Cốt: Tốt nhất 4 sao - CRIT Rate +27.6% và buff đến 50% toàn bộ sát thương của Navia" },
      { weaponId: "beacon-of-the-reed-sea", tier: "S", noteVi: "Hải Đăng Bờ Biển: CRIT Rate 33.1% + buff ATK lớn khi dùng E và chịu đòn" },
      { weaponId: "wolf-s-gravestone", tier: "A", noteVi: "Đường Cùng Của Sói: Cung cấp lượng ATK khổng lồ và buff tấn công cho toàn đội" },
      { weaponId: "the-unforged", tier: "A", noteVi: "Kiếm Vô Công: Tăng mạnh ATK và sát thương khi luôn được bảo hộ bởi khiên Kết Tinh" },
    ],
    artifacts: [
      { setIds: ["nighttime-whispers-in-the-echoing-woods"], mode: "4pc", priority: 1, noteVi: "Trấn thánh di vật: Tiếng Đêm Trong Rừng Vang - Tăng 18% ATK và buff đến 50% Sát Thương Nham khi có khiên Kết Tinh" },
      { setIds: ["golden-troupe"], mode: "4pc", priority: 2, noteVi: "Đoàn Kịch Hoàng Kim: Buff 70% sát thương đạn pháo Kỹ Năng Nguyên Tố khi đứng ngoài sân" },
      { setIds: ["marechaussee-hunter"], mode: "4pc", priority: 3, noteVi: "Thợ Săn Marechaussee: Dành riêng cho đội hình kết hợp cùng Furina (tăng 36% CRIT Rate)" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Geo DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Navia DPS: ATK% + Geo DMG% + CRIT. Crystallize shield quan trọng để tạo Crystallize shards cho team. CR/CD 1:2.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Energy Recharge (ER 130%+)", "Flat ATK", "DEF% (ít)"],
      note: "Navia cần Crystallize shards từ đội để charge súng (3 shards = full charge). ER để Q liên tục. Pyro/Cryo teammate để tạo shards.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E (Rosula Shardshot) là nguồn DPS chính - consume Crystallize shards để tăng DMG. Q tạo shards nhanh. NA ít dùng.",
    },
    playstyleNoteVi:
      "Thu thập Crystallize shards từ phản ứng Geo + Element để charge Elegance stacks (max 6). E consume stacks để boost Shotgun DMG. Q tạo shards và buff. Đội tốt nhất: Zhongli (khiên + Crystallize) + Pyro/Cryo để tạo shards nhanh.",
  },

  // Hydro Catalyst
  neuvillette: {
    weapons: [
      { weaponId: "tome-of-the-eternal-flow", tier: "S", noteVi: "Văn Thơ Khơi Nguồn Phù Hoa: Trấn tối thượng - CRIT DMG 88.2%, tăng 16% HP và buff đến 42% sát thương Trọng Kích" },
      { weaponId: "sacrificial-jade", tier: "S", noteVi: "Ngọc Tế Lễ (Nhật Ký Hành Trình): CRIT Rate 36.8%, buff tới 64% Max HP khi off-field, sức mạnh tiệm cận trấn 5 sao" },
      { weaponId: "prototype-amber", tier: "S", noteVi: "Mẫu Kim Phách R5 rèn F2P: Lựa chọn F2P số 1 - Cung cấp 41.3% HP, hồi 18 năng lượng nộ và hồi máu toàn đội sau Q" },
      { weaponId: "lost-prayer-to-the-sacred-winds", tier: "A", noteVi: "Điển Tích Tây Phong: CRIT Rate 33.1%, tăng tốc độ di chuyển và tích lũy sát thương nguyên tố Thủy" },
      { weaponId: "the-widsith", tier: "A", noteVi: "Chương Nhạc Lang Thang: CRIT DMG 55.1%, bùng nổ sát thương lớn khi nhận buff Hydro DMG hoặc Toàn Sát Thương" },
    ],
    artifacts: [
      { setIds: ["marechaussee-hunter"], mode: "4pc", priority: 1, noteVi: "Thợ Săn Marechaussee: Trấn thánh di vật độc quyền - Tăng 15% sát thương Trọng Kích và tự động nhận 36% CRIT Rate khi bắn tia nước tiêu hao HP" },
      { setIds: ["heart-of-depth"], mode: "4pc", priority: 2, noteVi: "Trầm Luân Trái Tim: Tăng 15% Sát Thương Thủy và 30% sát thương Trọng Kích" },
      { setIds: ["marechaussee-hunter", "heart-of-depth"], mode: "2+2", priority: 3, noteVi: "Tạm thời khi farm chỉ số tốt" },
    ],
    mainStats: {
      sands: "HP%",
      goblet: "Hydro DMG%",
      circlet: "CRIT DMG (vì Marechaussee cho +36% CR)",
      note: "Neuvillette scale HP cho Charged Attack. Marechaussee 4pc cho CR +36% khi HP thay đổi. CD circlet tối ưu. HP 40000+ là mục tiêu.",
    },
    subStats: {
      stats: ["CRIT DMG", "CRIT Rate (50%+ không tính set)", "HP%", "Energy Recharge (ER 120-130%)", "Flat HP"],
      note: "Neuvillette passive cho +110% extra Charged Attack DMG mỗi 1% HP vượt quá 30k. HP tối đa quan trọng. ER 120% đủ với 2 Hydro teammate.",
    },
    talentPriority: {
      order: ["Đòn thường (NA)", "Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)"],
      note: "NA (hold CA) là nguồn DPS chính của Neuvillette. Q sinh 3 giọt nước chase địch. E tạo môi trường Hydro và heal nhỏ.",
    },
    playstyleNoteVi:
      "Hold Charged Attack để tích nước (2.5 giây) -> 3 làn sóng Charged Attack. Khi HP thay đổi (Furina drain/heal), tự động tạo giọt nước bổ sung. Không cần đứng yên nếu dùng Charged shot từ xa. Furina + Kazuha + Baizhu là team meta số 1.",
  },

  // Electro Polearm
  "raiden-shogun": {
    weapons: [
      { weaponId: "engulfing-lightning", tier: "S", noteVi: "Đoạn Thảo Trường Đao: Trấn tối thượng - Cung cấp 55.1% ER, chuyển hóa ER vượt 100% thành ATK% và buff thêm 30% ER sau khi nộ" },
      { weaponId: "the-catch", tier: "S", noteVi: "Lao Câu Cá R5 F2P: Thần khí câu cá chuẩn mực - Tăng 45.9% ER, buff 32% sát thương chiêu Nộ Q và tăng 12% Tỷ Lệ Bạo Kích Q" },
      { weaponId: "staff-of-homa", tier: "A", noteVi: "Trượng Hộ Ma: Cung cấp 66.2% CRIT DMG và lượng lớn ATK" },
      { weaponId: "primordial-jade-winged-spear", tier: "A", noteVi: "Hòa Phác Diên: Cung cấp CRIT Rate và tích tầng tăng ATK%" },
      { weaponId: "wavebreaker-s-fin", tier: "A", noteVi: "Vây Cá Chẻ Sóng R5: Tăng cực mạnh sát thương Q dựa trên tổng năng lượng nộ toàn đội" },
    ],
    artifacts: [
      { setIds: ["emblem-of-severed-fate"], mode: "4pc", priority: 1, noteVi: "Dấu Ấn Ngăn Cách: Trấn thánh di vật bắt buộc - Chuyển hóa 25% Hiệu Quả Nạp thành Sát Thương Kỹ Năng Nộ Q (tối đa +75%)" },
      { setIds: ["gilded-dreams"], mode: "4pc", priority: 2, noteVi: "Giấc Mộng Hoàng Kim: Dành riêng cho lối chơi Raiden kích hoạt Hạt Nở Rộ (Hyperbloom Full EM)" },
    ],
    mainStats: {
      sands: "ER% (Energy Recharge)",
      goblet: "Electro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Raiden cần ER 200-250% tùy team để Q luôn sẵn sàng. Emblem 4pc: ER -> Q DMG bonus. ER% sands là bắt buộc.",
    },
    subStats: {
      stats: ["Energy Recharge (ER 200-250%)", "CRIT Rate / CRIT DMG (1:2)", "ATK%", "Flat ATK", "Elemental Mastery (EM nhỏ)"],
      note: "Raiden Q recharge energy cho team sau Q (Resolve stacks). ER requirement thay đổi theo team. Solo: 250%+. Hypercarry: 180-200%.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q Musou Isshin (7 giây) là nguồn DPS chính và recharge energy đồng đội. E tích Resolve stacks (theo party Q cost). NA ít quan trọng.",
    },
    playstyleNoteVi:
      "E off-field tích Resolve (tối đa 60 stacks từ Q đồng đội). Dùng Q của đồng đội trước -> Raiden Q cuối cùng với max Resolve -> NA trong Q = Electro DMG cực mạnh và recharge đội. Team Rational (Xingqiu + Xiangling + Bennett) là meta nhất.",
  },

  // Anemo Bow
  venti: {
    weapons: [
      { weaponId: "elegy-for-the-end", tier: "S", noteVi: "EM + team Burst Buff mạnh sau khi bắn 4 shots" },
      { weaponId: "skyward-harp", tier: "S", noteVi: "CR + Physical proc mạnh" },
      { weaponId: "aqua-simulacra", tier: "A", noteVi: "HP DMG bonus + CRIT DMG ok" },
      { weaponId: "the-stringless", tier: "A", noteVi: "EM + Skill/Burst DMG bonus tốt 4-star" },
      { weaponId: "favonius-warbow", tier: "B", noteVi: "ER - tạo energy cho team liên tục" },
    ],
    artifacts: [
      { setIds: ["viridescent-venerer"], mode: "4pc", priority: 1, noteVi: "Bắt buộc: VV 4pc giảm RES 40% + Swirl DMG +60%" },
      { setIds: ["viridescent-venerer", "wanderer-s-troupe"], mode: "2+2", priority: 2, noteVi: "VV 2pc + EM 80 thay thế khi farm" },
    ],
    mainStats: {
      sands: "EM (Elemental Mastery)",
      goblet: "EM hoặc Anemo DMG%",
      circlet: "EM hoặc CRIT Rate",
      note: "Venti support: 3x EM slots để max Swirl DMG và Q absorption DMG. EM 1000+ lý tưởng. DPS Venti: CR/CD + Anemo DMG%.",
    },
    subStats: {
      stats: ["Elemental Mastery (EM >= 700)", "Energy Recharge (ER 140-160%)", "CRIT Rate / CRIT DMG", "ATK%", "Flat ATK"],
      note: "Venti Q tạo vortex hút và Swirl liên tục. EM quan trọng nhất. ER cao vì Q cost 60 và thường xuyên cần. VV 4pc giảm 40% RES.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q Stormeye là combo hút địch + Swirl + absorption theo nguyên tố trong đội. E Swirl và Plunge. NA ít quan trọng.",
    },
    playstyleNoteVi:
      "Q hút địch vào vortex và Swirl liên tục 8 giây. Sau khi Q hút: chuyển sang DPS chính để attack vào vortex. Q có thể absorb 1 nguyên tố (Hydro/Cryo/Pyro/Electro) để deal thêm DMG đó trong suốt thời gian. Elegy buff đội sau 4 shots trong Q.",
  },

  // Anemo Polearm
  xiao: {
    weapons: [
      { weaponId: "primordial-jade-winged-spear", tier: "S", noteVi: "Hòa Phác Diên - Trấn phái kinh điển của Xiao, Base ATK 674, CRIT Rate 22.1% và tích tối đa 7 tầng tăng 22.4% ATK + 12% toàn bộ sát thương khi cắm kích liên tục" },
      { weaponId: "staff-of-homa", tier: "S", noteVi: "Trượng Homa - CRIT DMG 66.2% cực lớn và nhận thêm lượng ATK khổng lồ khi Xiao tự rút máu xuống dưới 50% HP" },
      { weaponId: "calamity-queller", tier: "A", noteVi: "Hủy Diệt - Base ATK 741 cao nhất game và tăng mạnh sát thương nguyên tố Phong" },
      { weaponId: "deathmatch", tier: "A", noteVi: "Thương Quyết Chiến - CRIT Rate 36.8% cực kỳ ổn định cho F2P/Vé Tháng" },
      { weaponId: "blackcliff-pole", tier: "A", noteVi: "Thương Hắc Nham - Sát thương bạo kích CRIT DMG 55.1% hữu dụng mua từ Cửa Hàng Tinh Trần" },
      { weaponId: "favonius-lance", tier: "B", noteVi: "Thương Tây Phong - Giải pháp sạc nạp F2P giúp Xiao luôn sẵn sàng nộ mỗi chu kỳ" },
    ],
    artifacts: [
      { setIds: ["vermillion-hereafter"], mode: "4pc", priority: 1, noteVi: "Dư Âm Tế Lễ 4 món - Trấn thánh di vật riêng của Xiao, tăng tới 66% ATK khi Xiao mất máu liên tục trong chiêu Nộ Q" },
      { setIds: ["marechaussee-hunter"], mode: "4pc", priority: 2, noteVi: "Thợ Săn Marechaussee 4 món - Tăng thẳng 36% CRIT Rate nhờ cơ chế tự tụt máu khi Xiao dậm nhảy (cực mạnh khi kẹp cùng Furina)" },
      { setIds: ["desert-pavilion-chronicle"], mode: "4pc", priority: 3, noteVi: "Sử Ký Đình Các Sa Mạc 4 món - Tăng 15% Anemo DMG và 40% sát thương đòn Tấn Công Khi Rơi (Plunge)" },
      { setIds: ["viridescent-venerer", "gladiator-s-finale"], mode: "2+2", priority: 4, noteVi: "2pc Phong (+15%) + 2pc ATK (+18%) - Bộ ghép quốc dân dễ kiếm với chỉ số phụ cực đẹp" },
    ],
    mainStats: {
      sands: "Tấn công (ATK%)",
      goblet: "Sát thương Phong (Anemo DMG%) hoặc ATK%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Nếu dùng bộ Thợ Săn Marechaussee, Xiao đã có sẵn 36% CRIT Rate nên hãy ưu tiên Nón CRIT DMG. Cần đảm bảo ER 120-135% khi đi cùng Faruzan/Xianyun.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "Tấn công (ATK%)", "Hiệu Quả Nạp (ER 120-135%)", "Flat ATK"],
      note: "Tập trung đẩy CRIT DMG lên 200%+ và duy trì CRIT Rate từ 70-85% để mọi cú dậm nhảy cắm kích đều nổ sát thương cực đại.",
    },
    talentPriority: {
      order: ["Đòn thường (NA)", "Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)"],
      note: "Đòn đánh thường NA quyết định tỷ lệ sát thương của Đòn Đánh Khi Rơi (Plunge) nên là ưu tiên số 1. Nâng Q để tăng hệ số chuyển hóa sát thương Phong. E nâng sau cùng.",
    },
    playstyleNoteVi:
      "Trước khi bật Q, tung 2 lần E lướt chém vào địch rồi nổ Q ngay lập tức để húp trọn hạt nguyên tố nạp. Trong trạng thái Mặt Nạ Dạ Xoa, Xiao dậm nhảy lên không trung và cắm kích liên tục (High Plunge). Đội hình tối thượng hiện tại là Xiao + Faruzan C6 + Xianyun + Furina.",
  },

  // Hydro Bow
  yelan: {
    weapons: [
      { weaponId: "aqua-simulacra", tier: "S", noteVi: "Signature: HP DMG bonus + CRIT DMG rất cao" },
      { weaponId: "elegy-for-the-end", tier: "A", noteVi: "EM + team burst buff nếu muốn support" },
      { weaponId: "favonius-warbow", tier: "B", noteVi: "ER support - tạo energy cho team" },
      { weaponId: "sacrificial-bow", tier: "B", noteVi: "ER + E reset để Breakthrough Barb thêm" },
      { weaponId: "recurve-bow", tier: "C", noteVi: "F2P 3-star nhưng HP sub-stat hữu ích" },
    ],
    artifacts: [
      { setIds: ["emblem-of-severed-fate"], mode: "4pc", priority: 1, noteVi: "ER -> Q DMG bonus tuyệt vời cho Yelan high Q cost" },
      { setIds: ["heart-of-depth"], mode: "4pc", priority: 2, noteVi: "Hydro DMG + Charged Attack DMG tốt" },
      { setIds: ["emblem-of-severed-fate", "tenacity-of-the-millelith"], mode: "2+2", priority: 3, noteVi: "ER + HP bonus thay thế" },
    ],
    mainStats: {
      sands: "HP%",
      goblet: "HP% hoặc Hydro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Yelan scale HP cho Q DMG. HP% sands bắt buộc. Hydro DMG% nếu muốn max Q dmg. CR/CD 1:2 theo KQM.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "HP%", "Energy Recharge (ER 160-180%)", "Flat HP", "ATK%"],
      note: "Yelan Q cost 70 và off-field, cần ER 160%+. HP scale Q. Emblem 4pc cho bonus Q DMG theo ER. CRIT sau khi đủ ER và HP.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tật (E)", "Đòn thường (NA)"],
      note: "Q Depth-Clarion Dice là nguồn DPS chính off-field. E Breakthrough Barb pierce. NA ít dùng vì chủ yếu off-field.",
    },
    playstyleNoteVi:
      "E áp Hydro (Breakthrough state) -> Breakthrough Barb CA với HP scale pierce. Q tạo Exquisite Throw theo dõi NA của active char. A4 passive: Exquisite Throw DMG tăng 3.5% mỗi giây Q active (max 50%). Combo tốt nhất với Hu Tao, Neuvillette, DPS onfield mạnh.",
  },

  // Geo Polearm
  zhongli: {
    weapons: [
      { weaponId: "black-tassel", tier: "S", noteVi: "Hắc Anh Thương 3 sao F2P: Vũ khí thuần khiên số 1 - Cung cấp +46.9% HP tối đa, đẩy độ dày của Khiên Ngọc Bích lên cực hạn" },
      { weaponId: "favonius-lance", tier: "S", noteVi: "Thương Tây Phong: Lựa chọn hỗ trợ đa dụng tốt nhất - Tạo vô số hạt nguyên tố trắng nạp cho toàn bộ đồng đội" },
      { weaponId: "staff-of-homa", tier: "S", noteVi: "Trượng Hộ Ma: Cung cấp 20% HP và 66.2% CRIT DMG - Lựa chọn số 1 cho phong cách Hybrid vừa có khiên dày vừa nuke chiêu nộ Thiên Thạch cực thốn" },
      { weaponId: "vortex-vanquisher", tier: "A", noteVi: "Giáo Nịnh Thần: Vũ khí trấn thẩm mỹ của Nham Thần - Tăng 20% hiệu quả khiên và tích lũy lượng lớn ATK%" },
      { weaponId: "the-catch", tier: "B", noteVi: "Lao Câu Cá: Cung cấp Hiệu Quả Nạp và buff sát thương nộ Q" },
    ],
    artifacts: [
      { setIds: ["tenacity-of-the-millelith"], mode: "4pc", priority: 1, noteVi: "Thiên Nham Vững Chắc: Trấn thánh di vật hỗ trợ - Tăng 20% HP và buff 20% ATK + 30% hiệu quả khiên cho toàn đội khi Cột Nham đánh trúng địch" },
      { setIds: ["instructor"], mode: "4pc", priority: 2, noteVi: "Giáo Quan: Buff 120 Tinh Thông Nguyên Tố cho toàn đội trong các đội hình phản ứng mạnh (Hu Tao, Alhaitham, Tighnari)" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 3, noteVi: "Nghi Thức Tông Thất Cổ: Buff 20% ATK cho toàn đội trong 12s sau khi thả Thiên Thạch Q" },
      { setIds: ["archaic-petra"], mode: "4pc", priority: 4, noteVi: "Phiến Đá Lâu Đời: Nhặt mảnh Kết Tinh tăng 35% Sát Thương Nguyên Tố tương ứng cho toàn đội" },
    ],
    mainStats: {
      sands: "HP%",
      goblet: "HP%",
      circlet: "HP%",
      note: "Zhongli thuần khiên (Shield Bot): 3x HP% để max Jade Shield. Mục tiêu đạt 50,000+ HP. Nếu chơi Hybrid Burst: Cát HP% / Ly Nham / Nón Bạo Kích.",
    },
    subStats: {
      stats: ["HP%", "Flat HP", "Energy Recharge (ER 130-140%)", "CRIT Rate (kích hoạt Thương Tây Phong)", "ATK%"],
      note: "Zhongli support thuần khiên: ưu tiên tuyệt đối HP% và Flat HP. Khi cầm Thương Tây Phong cần ~35-45% CRIT Rate để kích hạt nạp.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E tạo Khiên Ngọc Bích và giảm 20% toàn bộ kháng nguyên tố của địch quanh bản thân - nâng tối đa trước. Q hóa đá khống chế. NA không cần nâng.",
    },
    playstyleNoteVi:
      "Nhấn giữ E (Hold) tạo Khiên Ngọc Bích giảm 20% toàn bộ kháng nguyên tố và kháng vật lý của kẻ địch xung quanh. E nhấn để cắm Cột Nham kích hoạt 4 món Thiên Nham buff 20% ATK toàn đội. Q thả Thiên Thạch hóa đá khống chế địch 4 giây.",
  },

  // Electro Sword
  clorinde: {
    weapons: [
      { weaponId: "absolution", tier: "S", noteVi: "Xá Tội: Trấn tối thượng - CRIT DMG 44.1%, tăng 20% CRIT DMG và buff tới 48% sát thương toàn diện khi tăng Khế Ước Sinh Mệnh (Bond of Life)" },
      { weaponId: "mistsplitter-reforged", tier: "S", noteVi: "Ánh Sương Đêm Sương Mù: Base ATK 674, CRIT DMG 44.1% và buff tới 28% Sát Thương Lôi" },
      { weaponId: "primordial-jade-cutter", tier: "S", noteVi: "Bàn Nham Kết Lục: CRIT Rate 44.1% cực lớn và chuyển hóa HP thành ATK" },
      { weaponId: "the-black-sword", tier: "A", noteVi: "Kiếm Đen (Nhật Ký Hành Trình): CRIT Rate 27.6% và tăng 40% sát thương đòn đánh thường" },
      { weaponId: "finale-of-the-deep", tier: "A", noteVi: "Hải Uyên Điệu Cuối R5 rèn F2P: Tăng mạnh ATK% và tương tác hoàn hảo với cơ chế Khế Ước Sinh Mệnh" },
    ],
    artifacts: [
      { setIds: ["fragment-of-harmonic-whimsy"], mode: "4pc", priority: 1, noteVi: "Mảnh Ghép Hài Hòa Mơ Hồ: Trấn thánh di vật độc quyền - Tăng 18% ATK và buff đến 54% toàn bộ sát thương khi giá trị Khế Ước Sinh Mệnh biến động" },
      { setIds: ["thundering-fury"], mode: "4pc", priority: 2, noteVi: "Như Sấm Thịnh Nộ: Tăng 15% Sát Thương Lôi và giảm mạnh hồi chiêu E khi kích hoạt phản ứng Tăng Cường/Điện Cảm/Quá Tải" },
      { setIds: ["marechaussee-hunter"], mode: "4pc", priority: 3, noteVi: "Thợ Săn Marechaussee: Lựa chọn tối ưu khi ghép đội cùng Furina (nhận trọn 36% CRIT Rate)" },
      { setIds: ["gladiator-s-finale"], mode: "4pc", priority: 4, noteVi: "Lễ Bế Mạc Của Giác Đấu Sĩ: Tăng 18% ATK và buff 35% sát thương đòn đánh thường" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Electro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Clorinde tự nhận 20% CRIT Rate từ thiên phú nội tại A1, do đó cần cân bằng để không bị tràn tỷ lệ bạo kích khi kết hợp cùng vũ khí hoặc set Thợ Săn.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Elemental Mastery (EM 80-120 cho Tăng Cường)", "Energy Recharge (120-130%)", "Flat ATK"],
      note: "Trong đội hình Tăng Cường (Aggravate), Tinh Thông Nguyên Tố gia tăng mạnh sát thương đòn bắn súng xuyên thấu.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E (Săn Đêm Đón Ánh Sáng) chuyển hóa đòn đánh thành bắn súng phóng điện và đâm kiếm lướt - nâng tối đa đầu tiên. Q nuke sát thương diện rộng. NA cơ bản không dùng.",
    },
    playstyleNoteVi:
      "Bấm E vào trạng thái Tuần Đêm: Bắn súng thường (3 phát) để tích đầy Khế Ước Sinh Mệnh (Bond of Life >= 100%), sau đó nhấn E đâm kiếm lướt xuyên thấu hồi máu và xả sát thương bùng nổ (vòng lặp 3 bắn + 1 lướt E). Q thi triển đầu hoặc cuối chu kỳ để dồn sát thương.",
  },

  // Geo Sword
  albedo: {
    weapons: [
      { weaponId: "cinnabar-spindle", tier: "S", noteVi: "Trấn số 1 độc quyền: Thoi Châm Sinh Cọc - DEF +69% và tăng sát thương Kỹ Năng Nguyên Tố theo 80% DEF" },
      { weaponId: "uraku-misugiri", tier: "S", noteVi: "Kiếm Uraku Misugiri: CRIT DMG +88.2%, tăng DEF và nhân đôi buff Kỹ Năng Nguyên Tố khi gây sát thương Nham" },
      { weaponId: "harbinger-of-dawn", tier: "S", noteVi: "Thần kiếm 3 sao F2P: Kiếm Bình Minh - CRIT Rate +28% và CRIT DMG +46.9% khi giữ HP trên 90% (Albedo off-field bất tử buff)" },
      { weaponId: "primordial-jade-cutter", tier: "A", noteVi: "Bàn Nham Kết Lục: CRIT Rate +44.1% khổng lồ, dễ dàng cân bằng chỉ số bạo kích" },
      { weaponId: "mistsplitter-reforged", tier: "A", noteVi: "Ánh Sáng Đêm Sương Mù: Tăng sát thương nguyên tố toàn diện" },
    ],
    artifacts: [
      { setIds: ["husk-of-opulent-dreams"], mode: "4pc", priority: 1, noteVi: "Trấn thánh di vật: Giấc Mộng Phù Hoa - Tăng đến 54% DEF và 24% Sát Thương Nham khi đứng ngoài sân" },
      { setIds: ["golden-troupe"], mode: "4pc", priority: 2, noteVi: "Đoàn Kịch Hoàng Kim: Buff 70% sát thương hoa Kỹ Năng Nguyên Tố (Transient Blossom) khi off-field" },
      { setIds: ["archaic-petra"], mode: "4pc", priority: 3, noteVi: "Phiến Đá Lâu Đời: Hỗ trợ nhặt mảnh Kết Tinh để buff 35% Sát Thương Nguyên Tố tương ứng cho toàn đội" },
    ],
    mainStats: {
      sands: "DEF%",
      goblet: "Geo DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Albedo E (Transient Blossom) scale DEF. DEF% sands bắt buộc cho DPS E. Geo DMG% goblet. CR/CD circlet. DEF% sub quan trọng.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "DEF%", "Energy Recharge (ER 130%+)", "Flat DEF", "ATK%"],
      note: "Transient Blossom gây 1.336 x DEF Geo DMG. DEF% quan trọng như CRIT. ER 130% để Q liên tục. Husk 4pc: off-field DEF+Geo stack.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E Solar Isotoma là nguồn DPS chính (Transient Blossom mỗi 2 giây). Q Fatal Reckoning + buff Plunge DMG cho team. NA ít dùng.",
    },
    playstyleNoteVi:
      "E đặt Solar Isotoma trên mặt đất - off-field gây Geo DMG mỗi 2 giây khi đồng đội hit địch. Q gây burst DMG + tạo Fatal Blossom. Cần Geo teammate (Zhongli/Navia) để Geo Resonance +15% DMG. Harbinger of Dawn 3-star nếu giữ HP > 90%.",
  },

  // Dendro Catalyst
  baizhu: {
    weapons: [
      { weaponId: "jadefall-s-splendor", tier: "S", noteVi: "Signature: HP% + DMG bonus sau heal" },
      { weaponId: "prototype-amber", tier: "A", noteVi: "Tốt nhất F2P: ER + heal theo max HP" },
      { weaponId: "favonius-codex", tier: "A", noteVi: "ER support - tạo energy cho team liên tục" },
      { weaponId: "hakushin-ring", tier: "B", noteVi: "ER + Elemental DMG buff cho đội khi Electro Swirl" },
      { weaponId: "thrilling-tales-of-dragon-slayers", tier: "B", noteVi: "3-star: buff ATK 48% cho active char khi switch" },
    ],
    artifacts: [
      { setIds: ["deepwood-memories"], mode: "4pc", priority: 1, noteVi: "Giảm Dendro RES 30% khi E/Q hit - bắt buộc nếu Nahida/Alhaitham cần" },
      { setIds: ["tenacity-of-the-millelith"], mode: "4pc", priority: 2, noteVi: "HP + ATK 20% team buff khi E hits" },
      { setIds: ["ocean-hued-clam"], mode: "4pc", priority: 3, noteVi: "Heal -> Physical DMG bubble - nếu muốn Baizhu DPS hybrid" },
    ],
    mainStats: {
      sands: "HP%",
      goblet: "HP%",
      circlet: "Healing Bonus hoặc HP%",
      note: "Baizhu healer scale HP. HP% 3 slots để max heal. Healing Bonus circlet nếu muốn max heal output. Deepwood 4pc không cần CRIT.",
    },
    subStats: {
      stats: ["HP%", "Energy Recharge (ER 150-180%)", "Flat HP", "CRIT Rate (ít)", "ATK%"],
      note: "Baizhu Q cost 80 nên ER rất quan trọng. HP% để max shield và heal. Deepwood 4pc passive: giảm Dendro RES khi hit.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q tạo Pulsing Clarity liên tục heal + shield. E tạo Seamless Shield nhỏ. NA dùng để kích Prototype Amber ER.",
    },
    playstyleNoteVi:
      "Q tạo vòng Pulsing Clarity heal + shield off-field 15 giây. E tạo shield nhỏ. Dendro applicator thụ động khi đồng đội attack. Cần ER rất cao. Deepwood 4pc giảm Dendro RES để tăng Dendro reaction DMG. Thay thế Kokomi trong Hyperbloom/Bloom team.",
  },

  // Pyro Claymore
  diluc: {
    weapons: [
      { weaponId: "wolf-s-gravestone", tier: "S", noteVi: "ATK% cao nhất + party buff - tốt nhất Diluc" },
      { weaponId: "beacon-of-the-reed-sea", tier: "A", noteVi: "ATK + HP passive tốt" },
      { weaponId: "serpent-spine", tier: "A", noteVi: "Tốt nhất 4-star: CR + stack DMG" },
      { weaponId: "rainslasher", tier: "B", noteVi: "EM sub + +20% DMG khi địch Hydro/Electro" },
      { weaponId: "favonius-greatsword", tier: "C", noteVi: "ER support - không tốt lắm cho Diluc DPS" },
    ],
    artifacts: [
      { setIds: ["crimson-witch-of-flames"], mode: "4pc", priority: 1, noteVi: "Pyro DMG + Vaporize/Melt bonus stack theo E - bắt buộc Diluc" },
      { setIds: ["crimson-witch-of-flames", "noblesse-oblige"], mode: "2+2", priority: 2, noteVi: "2pc Pyro + 2pc ATK nếu không đủ 4pc tốt" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Pyro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Diluc DPS standard: ATK% + Pyro DMG% + CR/CD 1:2. E hit 3 lần stack CW 4pc. Vaporize team: thêm EM 100+ nếu thường Vape.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Elemental Mastery (EM 80-120 Vape)", "Energy Recharge (ER 130%+)", "Flat ATK"],
      note: "Crimson Witch 4pc stack mỗi E hit (tối đa 3 stack, +7.5% Pyro DMG mỗi stack). Diluc E 3 hit trong combo -> full stack nhanh.",
    },
    talentPriority: {
      order: ["Đòn thường (NA)", "Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)"],
      note: "NA chain là nguồn DPS chính với Pyro infusion sau E. Q Signature blade + buff. E tạo Pyro NA nhưng NA scale quan trọng hơn.",
    },
    playstyleNoteVi:
      "E x3 (stack CW 4pc full) -> Q (Pyro infusion 12 giây) -> NA spam Pyro. Phối Xingqiu cho Vaporize hoặc Kaeya cho Melt ngược. Diluc là DPS Pyro claymore kinh điển nhưng cần Crimson Witch 4pc để tối ưu. Bennett ATK buff bắt buộc.",
  },

  // Anemo Sword
  jean: {
    weapons: [
      { weaponId: "primordial-jade-cutter", tier: "S", noteVi: "CR 44.1% - cho Jean DPS/heal hybrid" },
      { weaponId: "mistsplitter-reforged", tier: "A", noteVi: "Elemental DMG stack tốt" },
      { weaponId: "favonius-sword", tier: "B", noteVi: "ER - tạo energy liên tục, heal từ Q" },
      { weaponId: "amenoma-kageuchi", tier: "B", noteVi: "ER + energy passive sau Elemental Skill" },
      { weaponId: "skyward-blade", tier: "B", noteVi: "ER + Crit Rate + healing bonus ok" },
    ],
    artifacts: [
      { setIds: ["viridescent-venerer"], mode: "4pc", priority: 1, noteVi: "VV 4pc: Anemo DMG + giảm RES 40% - Jean support tốt nhất" },
      { setIds: ["ocean-hued-clam"], mode: "4pc", priority: 2, noteVi: "Heal -> Physical DMG bubble nếu Jean DPS" },
      { setIds: ["viridescent-venerer", "noblesse-oblige"], mode: "2+2", priority: 3, noteVi: "VV 2pc + ATK% nếu không đủ 4pc VV" },
    ],
    mainStats: {
      sands: "ATK% hoặc ER%",
      goblet: "Anemo DMG% hoặc ATK%",
      circlet: "Healing Bonus hoặc CRIT Rate",
      note: "Jean healer: Healing Bonus circlet + ATK% cho heal cao. Jean DPS: CR/CD + Anemo DMG%. VV support: EM cho Swirl buff.",
    },
    subStats: {
      stats: ["ATK%", "Energy Recharge (ER 140-160%)", "CRIT Rate / CRIT DMG", "Flat ATK", "Elemental Mastery (EM VV support)"],
      note: "Jean Q heal = 4.51% ATK per tick. ATK% quan trọng cho cả heal lẫn DMG. ER 140%+ cho Q liên tục. VV giảm 40% RES cho team.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q (Dandelion Breeze) heal toàn đội và tạo Anemo field. E Gale Blade: hold hất địch và deal DMG. NA dùng để build energy.",
    },
    playstyleNoteVi:
      "Jean là healer/support Anemo linh hoạt. E Hold hất địch ra xa (hoặc vào tường gây fall DMG). Q tạo Anemo field heal + Swirl liên tục. VV 4pc giảm ALL element RES. Tốt nhất làm healer với VV buff trong team không có Kazuha/Venti.",
  },

  // ─────────────────────────── 4-STAR ───────────────────────────

  // Pyro Sword
  bennett: {
    weapons: [
      { weaponId: "aquila-favonia", tier: "S", noteVi: "ATK% + heal passive - max ATK để buff team nhiều hơn" },
      { weaponId: "mistsplitter-reforged", tier: "A", noteVi: "Elemental DMG buff tốt" },
      { weaponId: "skyward-blade", tier: "A", noteVi: "ER + CRIT Rate phù hợp Bennett" },
      { weaponId: "favonius-sword", tier: "A", noteVi: "ER tốt nhất F2P - energy cho team liên tục" },
      { weaponId: "sacrificial-sword", tier: "B", noteVi: "ER + E reset để heal nhanh hơn" },
    ],
    artifacts: [
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 1, noteVi: "Bắt buộc: Q -> ATK team +20%. Bennett làm tốt nhất với Noblesse." },
      { setIds: ["instructor"], mode: "4pc", priority: 2, noteVi: "EM +120 cho team khi trigger reaction - budget option" },
      { setIds: ["noblesse-oblige", "tenacity-of-the-millelith"], mode: "2+2", priority: 3, noteVi: "ATK buff + HP thay thế" },
    ],
    mainStats: {
      sands: "ER% hoặc HP%",
      goblet: "HP%",
      circlet: "Healing Bonus hoặc HP%",
      note: "Bennett Q heal scale HP (6% HP per tick). HP% quan trọng để heal đủ mạnh. ER 200%+ để Q liên tục (cost 60). Noblesse buff ATK theo ATK của Bennett.",
    },
    subStats: {
      stats: ["Energy Recharge (ER 200%+)", "HP%", "Flat HP", "CRIT Rate (nếu DPS hybrid)", "ATK%"],
      note: "Bennett support: ER uu tiên số 1 (Q cost 60, cần liên tục). HP% cho heal. ATK% không cần nhiều vì Noblesse buff dùng Base ATK của Bennett.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q (Fantastic Voyage) heal + ATK buff. Mức ATK buff = 56% x Base ATK (Level + Weapon Base ATK). E charge Q energy. NA ít dùng.",
    },
    playstyleNoteVi:
      "Q tạo vùng ATK buff (56% Base ATK) + heal liên tục cho active char. Bennett support tốt nhất game vì tăng ATK mạnh + heal. Lưu ý: C6 thêm Pyro infusion NA - có thể gây hại cho Freeze/Hydro team. ER 200%+ bắt buộc.",
  },

  // Electro Bow
  fischl: {
    weapons: [
      { weaponId: "polar-star", tier: "S", noteVi: "ATK stack passive mạnh nhất cho Fischl" },
      { weaponId: "the-stringless", tier: "A", noteVi: "EM + Skill/Burst DMG bonus - tốt nhất 4-star" },
      { weaponId: "the-viridescent-hunt", tier: "A", noteVi: "CR + grouping effect hữu ích" },
      { weaponId: "favonius-warbow", tier: "B", noteVi: "ER support team" },
      { weaponId: "alley-hunter", tier: "B", noteVi: "ATK passive khi off-field - phù hợp Fischl off-field" },
    ],
    artifacts: [
      { setIds: ["golden-troupe"], mode: "4pc", priority: 1, noteVi: "Skill DMG +70% khi off-field - Oz deal DMG liên tục off-field" },
      { setIds: ["thundering-fury"], mode: "4pc", priority: 2, noteVi: "Electro DMG + reaction bonus cho Oz" },
      { setIds: ["thundersoother"], mode: "4pc", priority: 3, noteVi: "DMG +35% khi địch dính Electro liên tục" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Electro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Fischl Sub-DPS: ATK% + Electro DMG% + CR/CD. Oz DMG scale ATK. Golden Troupe 4pc tăng Oz DMG +70%. CR/CD 1:2.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Energy Recharge (ER 130-150%)", "Flat ATK", "Elemental Mastery (EM nhỏ)"],
      note: "Fischl chủ yếu off-field qua Oz. ATK% và CRIT là uu tiên. ER để Q liên tục (cost 60). Golden Troupe 4pc: Skill DMG bonus off-field.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E triệu hồi Oz - nguồn DPS chính. Q Midnight Phantasmagoria teleport + re-summon Oz. NA dùng để thỉnh thoảng A4 Oz hit.",
    },
    playstyleNoteVi:
      "E triệu hồi Oz off-field (10 giây deal Electro DMG). Q teleport và re-summon Oz thêm 18 giây. A4 passive: khi Fischl NA, Oz cũng hit Electro thêm. Phù hợp mọi đội cần Electro off-field (Superconduct, Quicken, Hyperbloom). Rất hiệu quả với NA-heavy DPS.",
  },

  // Electro Sword
  "kuki-shinobu": {
    weapons: [
      { weaponId: "toukabou-shigure", tier: "S", noteVi: "EM sub + bonus DMG khi địch không bị Hydro - tốt nhất 4-star" },
      { weaponId: "freedom-sworn", tier: "A", noteVi: "EM + team buff rất mạnh nếu support" },
      { weaponId: "iron-sting", tier: "A", noteVi: "EM 165 sub - tốt nhất F2P cho EM build" },
      { weaponId: "favonius-sword", tier: "B", noteVi: "ER support - heal + energy cho team" },
      { weaponId: "sacrificial-sword", tier: "B", noteVi: "ER + E reset cho heal liên tục" },
    ],
    artifacts: [
      { setIds: ["flower-of-paradise-lost"], mode: "4pc", priority: 1, noteVi: "EM + Bloom/Hyperbloom DMG tăng khi có Reaction - Hyperbloom trigger" },
      { setIds: ["gilded-dreams"], mode: "4pc", priority: 2, noteVi: "EM + ATK bonus theo team - tốt cho mọi reaction build" },
      { setIds: ["tenacity-of-the-millelith"], mode: "4pc", priority: 3, noteVi: "HP + ATK buff khi support build" },
    ],
    mainStats: {
      sands: "EM (Elemental Mastery)",
      goblet: "EM hoặc HP%",
      circlet: "EM hoặc Healing Bonus",
      note: "Kuki Hyperbloom trigger: 3x EM slots (EM >= 800+). Hyperbloom scale EM của trigger. HP% nếu muốn tăng heal. Healing Bonus nếu healer role.",
    },
    subStats: {
      stats: ["Elemental Mastery (EM >= 800)", "HP%", "Energy Recharge (ER 150%+)", "Flat HP", "CRIT Rate (nếu DPS hybrid)"],
      note: "Hyperbloom DMG scale EM của Kuki (trigger). EM 1000+ làm Hyperbloom 35k+ mỗi viên. HP% cho heal. ER cao vì Q cost 60.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E Sanctifying Ring là heal chính (HP scale) + Electro aura kích Hyperbloom. Q AoE Electro. NA ít dùng.",
    },
    playstyleNoteVi:
      "E tạo Sanctifying Ring off-field heal + deal Electro liên tục. Trong Hyperbloom team: Kuki kích Electro vào hạt Bloom để tạo đạn Hyperbloom (scale EM Kuki). Phối Nahida (Dendro) + Xingqiu/Yelan (Hydro) để Hyperbloom liên tục. EM 800+ để Hyperbloom 30000+.",
  },

  // Geo Claymore
  noelle: {
    weapons: [
      { weaponId: "redhorn-stonethresher", tier: "S", noteVi: "DEF% sub + NA/CA DMG bonus scale DEF - tốt nhất Noelle" },
      { weaponId: "serpent-spine", tier: "A", noteVi: "CR + stack DMG - tốt nhất 4-star F2P" },
      { weaponId: "luxurious-sea-lord", tier: "B", noteVi: "ATK% + Q passive proc - budget option" },
      { weaponId: "favonius-greatsword", tier: "B", noteVi: "ER - giảm áp lực energy cho Q" },
      { weaponId: "whiteblind", tier: "B", noteVi: "Tốt nhất 4-star craft: DEF% + ATK stack" },
    ],
    artifacts: [
      { setIds: ["husk-of-opulent-dreams"], mode: "4pc", priority: 1, noteVi: "DEF% + Geo DMG stack off-field - tối ưu cho Noelle DPS" },
      { setIds: ["retracing-bolide"], mode: "4pc", priority: 2, noteVi: "NA/CA DMG +40% khi có shield - Noelle E shield liên tục" },
      { setIds: ["husk-of-opulent-dreams", "archaic-petra"], mode: "2+2", priority: 3, noteVi: "DEF + Geo DMG thay thế farm" },
    ],
    mainStats: {
      sands: "DEF%",
      goblet: "Geo DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Noelle Q convert NA -> Geo DMG scale DEF. DEF% sands bắt buộc. DEF 2000+ mục tiêu. Husk 4pc: DEF + Geo DMG stack passively.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "DEF%", "Energy Recharge (ER 150%+)", "Flat DEF", "ATK%"],
      note: "DEF 2000+ để NA Q deal tốt. ER rất quan trọng vì Q cost 60 và Noelle không tự generate nhiều energy. Geo Resonance +15% DMG.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Đòn thường (NA)", "Kỹ năng nguyên tố (E)"],
      note: "Q tạo Sweeping Time (Geo DMG NA scale DEF). NA trong Q là DPS chính. E tạo shield heal khi NA. Noelle C6 làm Q không tốn energy.",
    },
    playstyleNoteVi:
      "E tạo Indelible Shield heal + Geo DMG khi NA. Q Sweeping Time 15 giây: NA -> Geo DMG scale DEF. Cần ER rất cao để Q liên tục. Geo Resonance (+15% DMG + shields) mạnh. Noelle C6 là bước ngoặt lớn: Q không cần energy, DMG tăng vô hạn stack.",
  },

  // Cryo Polearm
  rosaria: {
    weapons: [
      { weaponId: "staff-of-homa", tier: "S", noteVi: "HP% + passive ATK cực mạnh cho DPS Rosaria" },
      { weaponId: "primordial-jade-winged-spear", tier: "A", noteVi: "CR + stack ATK tốt" },
      { weaponId: "deathmatch", tier: "A", noteVi: "CR 36.8% sub - tốt nhất 4-star" },
      { weaponId: "favonius-lance", tier: "B", noteVi: "ER support - tạo energy cho team" },
      { weaponId: "the-catch", tier: "B", noteVi: "ER + Q DMG bonus tốt F2P" },
    ],
    artifacts: [
      { setIds: ["blizzard-strayer"], mode: "4pc", priority: 1, noteVi: "CRIT Rate +40% khi Freeze - DPS tốt hơn" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 2, noteVi: "Support: ATK 20% team buff sau Q" },
      { setIds: ["blizzard-strayer", "noblesse-oblige"], mode: "2+2", priority: 3, noteVi: "CRIT + ATK buff thay thế" },
    ],
    mainStats: {
      sands: "ATK% hoặc ER%",
      goblet: "Cryo DMG%",
      circlet: "CRIT RATE hoặc CRIT DMG",
      note: "Rosaria DPS/Support hybrid: ATK% + Cryo DMG% + CRIT. A4 passive share CRIT Rate cho team. Blizzard 4pc + Freeze = +40% CR.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Energy Recharge (ER 160%+)", "Flat ATK", "Elemental Mastery (EM nếu Melt)"],
      note: "A4 passive: sau E backstab, Rosaria CRIT Rate tăng 12%. 15% CRIT Rate của Rosaria shared cho team. ER cao để Q liên tục.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q Night Walk tạo Cryo AoE off-field và deal DMG. E Ravaging Confession backstab + A4 CRIT share. NA ít quan trọng.",
    },
    playstyleNoteVi:
      "E backstab (attack from behind) -> A4 buff CRIT Rate 12%. Q tạo Cryo off-field aura. A4 passive: share 15% CRIT Rate đã buff cho team (max shared = 15%). Phù hợp Freeze team với Ayaka/Ganyu. Noblesse support: Q -> buff team ATK.",
  },

  // Anemo Catalyst
  sucrose: {
    weapons: [
      { weaponId: "sacrificial-fragments", tier: "S", noteVi: "EM 454 sub + E reset - best for Sucrose EM build" },
      { weaponId: "a-thousand-floating-dreams", tier: "S", noteVi: "EM + team EM buff rất mạnh" },
      { weaponId: "thrilling-tales-of-dragon-slayers", tier: "A", noteVi: "3-star: buff ATK 48% cho active char khi switch - budget" },
      { weaponId: "the-widsith", tier: "B", noteVi: "Random buff khi switch-in" },
      { weaponId: "favonius-codex", tier: "B", noteVi: "ER - energy cho team" },
    ],
    artifacts: [
      { setIds: ["viridescent-venerer"], mode: "4pc", priority: 1, noteVi: "Bắt buộc: VV 4pc giảm RES 40% + Swirl DMG. Sucrose support." },
      { setIds: ["instructor"], mode: "4pc", priority: 2, noteVi: "EM +120 cho team khi reaction - budget alternative" },
      { setIds: ["viridescent-venerer", "wanderer-s-troupe"], mode: "2+2", priority: 3, noteVi: "VV 2pc + EM 80 thay thế" },
    ],
    mainStats: {
      sands: "EM (Elemental Mastery)",
      goblet: "EM hoặc Anemo DMG%",
      circlet: "EM",
      note: "Sucrose support: 3x EM slots. A4 passive: share 20% EM cho team. EM 800+ lý tưởng. VV 4pc giảm RES. Kazuha thay thế thường nhưng Sucrose budget hơn.",
    },
    subStats: {
      stats: ["Elemental Mastery (EM >= 700+)", "Energy Recharge (ER 150-160%)", "CRIT Rate (ít)", "ATK%", "Flat ATK"],
      note: "EM quan trọng nhất. A4: 20% EM Sucrose shared cho team. ER 150%+ để Q liên tục. VV giảm 40% RES là buff lớn nhất.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q Wind's Grand Ode hút địch + absorb element + Swirl liên tục. E Astable Anemohypostasis Swirl. NA ít dùng.",
    },
    playstyleNoteVi:
      "Giống Kazuha nhưng budget hơn. E/Q Swirl -> VV 4pc giảm RES 40%. A4 share 20% EM cho team. Q absorb Hydro/Pyro/Cryo/Electro và Swirl đó. Sacrificial Fragments là weapon tốt nhất vì EM + E reset. Budget Kazuha replacement hiệu quả.",
  },

  // Pyro Polearm
  xiangling: {
    weapons: [
      { weaponId: "staff-of-homa", tier: "S", noteVi: "HP% + passive ATK - tốt nhất nếu có" },
      { weaponId: "the-catch", tier: "S", noteVi: "Tốt nhất F2P: ER + Q DMG +16% và CRIT Rate +6% cho Q" },
      { weaponId: "engulfing-lightning", tier: "A", noteVi: "ER -> ATK + ER bonus tốt cho Xiangling" },
      { weaponId: "deathmatch", tier: "A", noteVi: "CR sub tốt cho DPS" },
      { weaponId: "dragon-s-bane", tier: "A", noteVi: "EM 221 + passive vs Hydro/Pyro - Vaporize team" },
    ],
    artifacts: [
      { setIds: ["emblem-of-severed-fate"], mode: "4pc", priority: 1, noteVi: "ER -> Q DMG bonus. Xiangling Q cost 80 + off-field." },
      { setIds: ["crimson-witch-of-flames"], mode: "4pc", priority: 2, noteVi: "Pyro DMG + Vaporize/Melt bonus stack" },
      { setIds: ["emblem-of-severed-fate", "crimson-witch-of-flames"], mode: "2+2", priority: 3, noteVi: "ER + Pyro DMG thay thế" },
    ],
    mainStats: {
      sands: "ER% hoặc ATK%",
      goblet: "Pyro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Xiangling Q cost 80 - cần ER 180-200%. ER% sands nếu thiếu energy. Emblem 4pc: ER -> Q DMG +25% per 4% ER (max 75%).",
    },
    subStats: {
      stats: ["Energy Recharge (ER 180-200%)", "CRIT Rate / CRIT DMG (1:2)", "ATK%", "Elemental Mastery (EM 100+ Vape)", "Flat ATK"],
      note: "Xiangling Q Pyronado off-field cần ER 180%+ để luôn sẵn sàng. EM quan trọng nếu Vaporize team (Raiden Rational). Emblem 4pc tối ưu.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q Pyronado là nguồn DPS chính off-field (12 giây Pyro spin). E Guoba Pyro AoE. NA ít dùng khi off-field.",
    },
    playstyleNoteVi:
      "Q tạo Pyronado off-field hit địch mỗi 0.5 giây trong 12 giây. Phối Xingqiu để Vaporize mọi Pyronado hit. Raiden Rational team: Xiangling + Xingqiu + Bennett + Raiden = S tier. The Catch F2P tốt ngang signature nhiều nhân vật khác.",
  },

  // Hydro Sword
  xingqiu: {
    weapons: [
      { weaponId: "favonius-sword", tier: "S", noteVi: "ER + energy generation cho team - tốt nhất support Xingqiu" },
      { weaponId: "sacrificial-sword", tier: "S", noteVi: "ER + E reset để Rain Sword stack lại nhanh" },
      { weaponId: "skyward-blade", tier: "A", noteVi: "ER + CR passive tốt" },
      { weaponId: "iron-sting", tier: "B", noteVi: "EM 165 sub nếu muốn reaction build" },
      { weaponId: "amenoma-kageuchi", tier: "B", noteVi: "ER passive từ E cast" },
    ],
    artifacts: [
      { setIds: ["emblem-of-severed-fate"], mode: "4pc", priority: 1, noteVi: "ER -> Q DMG bonus tốt nhất cho Xingqiu off-field" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 2, noteVi: "Support: ATK 20% team buff sau Q" },
      { setIds: ["heart-of-depth"], mode: "4pc", priority: 3, noteVi: "Hydro DMG + Charged Attack DMG sau E" },
    ],
    mainStats: {
      sands: "ER% hoặc ATK%",
      goblet: "Hydro DMG% hoặc ATK%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Xingqiu Q cost 80 - ER 200%+ bắt buộc cho liên tục. Emblem 4pc: ER -> Q DMG. ATK% + Hydro DMG% nếu muốn tối đa Rain Sword DMG.",
    },
    subStats: {
      stats: ["Energy Recharge (ER 200%+)", "CRIT Rate / CRIT DMG (1:2)", "ATK%", "Flat ATK", "Elemental Mastery (EM nhỏ)"],
      note: "Xingqiu Q cost 80 cần ER rất cao (200%+ solo, 160%+ với Raiden). Rain Swords follow active char NA và apply Hydro. Favonius/Sacrificial là best.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q Guhua Sword: Rain Swords follow NA của active char và deal Hydro DMG + damage reduction. E tạo Rain Sword tạm thời. NA để build energy.",
    },
    playstyleNoteVi:
      "Q tạo Rain Swords follow NA của bất kỳ char nào on-field, deal Hydro DMG và giảm DMG received. Off-field Hydro applicator tốt nhất game cho Vaporize/Freeze. Phối Hu Tao, Diluc, Ayaka. Sacrificial Sword: reset E để Rain Swords stack lại ngay.",
  },

  // Electro Claymore
  beidou: {
    weapons: [
      { weaponId: "serpent-spine", tier: "S", noteVi: "Tốt nhất 4-star: CR + stack DMG - hoàn hảo cho Beidou" },
      { weaponId: "wolf-s-gravestone", tier: "A", noteVi: "ATK% cao + party ATK buff" },
      { weaponId: "skyward-pride", tier: "A", noteVi: "ER + Physical proc tốt" },
      { weaponId: "favonius-greatsword", tier: "B", noteVi: "ER - giảm áp lực energy" },
      { weaponId: "luxurious-sea-lord", tier: "B", noteVi: "ATK% + Q passive proc ok" },
    ],
    artifacts: [
      { setIds: ["emblem-of-severed-fate"], mode: "4pc", priority: 1, noteVi: "ER -> Q DMG bonus. Beidou Q cost 80 + off-field phụ thuộc Q." },
      { setIds: ["thundersoother"], mode: "4pc", priority: 2, noteVi: "+35% DMG khi địch dính Electro liên tục - tốt hơn trong Electro team" },
      { setIds: ["thundering-fury", "emblem-of-severed-fate"], mode: "2+2", priority: 3, noteVi: "Electro DMG + ER thay thế" },
    ],
    mainStats: {
      sands: "ER% hoặc ATK%",
      goblet: "Electro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Beidou Q cost 80, cần ER 200%+. Emblem 4pc: ER -> Q DMG. ATK% + Electro DMG% + CRIT cho Q và counter E.",
    },
    subStats: {
      stats: ["Energy Recharge (ER 200%+)", "CRIT Rate / CRIT DMG (1:2)", "ATK%", "Flat ATK", "Elemental Mastery (EM nhỏ)"],
      note: "Q cost 80, ER rất quan trọng. Q Thunder Battleaxe proc khi NA của active char. Serpent Spine là tốt nhất 4-star nếu không drop.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q tạo Thunderbeast's Targe off-field proc Electro khi NA. E counter (hold) mạnh nhất nếu parry perfectly. NA ít dùng off-field.",
    },
    playstyleNoteVi:
      "Q tạo Thunderbeast: off-field Electro proc khi active char NA (2 hit mỗi proc). E hold là counter: nếu parry perfect (absorb full stacks) -> bonus DMG lớn. Mạnh với NA-heavy DPS. Fischl + Beidou = Electro duo mạnh cho Quicken/Superconduct.",
  },

  // Cryo Bow
  diona: {
    weapons: [
      { weaponId: "sacrificial-bow", tier: "S", noteVi: "ER + E reset để Shield liên tục - tốt nhất Diona" },
      { weaponId: "favonius-warbow", tier: "A", noteVi: "ER + energy generation cho team" },
      { weaponId: "elegy-for-the-end", tier: "A", noteVi: "EM + team burst buff tốt hơn nếu support" },
      { weaponId: "recurve-bow", tier: "B", noteVi: "HP sub-stat tốt để max shield (HP scale)" },
    ],
    artifacts: [
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 1, noteVi: "Support: ATK +20% cho team sau Q. Diona support tốt nhất." },
      { setIds: ["tenacity-of-the-millelith"], mode: "4pc", priority: 2, noteVi: "HP + ATK +20% khi E hit. Diona E shield hits." },
      { setIds: ["instructor"], mode: "4pc", priority: 3, noteVi: "EM +120 cho team khi reaction - ok budget" },
    ],
    mainStats: {
      sands: "HP% hoặc ER%",
      goblet: "HP%",
      circlet: "Healing Bonus hoặc HP%",
      note: "Diona shield scale HP (7.18% HP + 769). HP% quan trọng nhất. ER 200%+ để Q liên tục. Healing Bonus circlet nếu muốn max heal.",
    },
    subStats: {
      stats: ["HP%", "Energy Recharge (ER 200%+)", "Flat HP", "CRIT Rate (ít)", "ATK%"],
      note: "Diona support: HP% + ER uu tiên. Shield HP scale. Q cost 80 + ER cao bắt buộc. Sacrificial Bow reset E -> shield liên tục hơn.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q Signature Mix: AoE heal + Cryo field. E Icy Paws: shield HP scale + Cryo. NA ít dùng. Q > E vì heal quan trọng hơn shield DMG.",
    },
    playstyleNoteVi:
      "E tạo Shield (HP scale, Cryo application). Q Signature Mix tạo vùng Cryo heal (1.5s tick) và chill. Diona C6: tăng EM 200 cho active char trong Q -> Hyperbloom/Bloom team. Freeze team: Diona shield + Cryo resonance. Noblesse support buff ATK team.",
  },

  // Cryo Sword
  kaeya: {
    weapons: [
      { weaponId: "mistsplitter-reforged", tier: "S", noteVi: "Elemental DMG stack tốt nhất cho Kaeya DPS" },
      { weaponId: "primordial-jade-cutter", tier: "A", noteVi: "CR sub cao - tốt DPS" },
      { weaponId: "favonius-sword", tier: "B", noteVi: "ER support - energy cho team Cryo" },
      { weaponId: "sacrificial-sword", tier: "B", noteVi: "ER + E reset để áp Cryo liên tục hơn" },
      { weaponId: "lion-s-roar", tier: "B", noteVi: "+20% DMG vs Pyro/Electro enemies - niche" },
    ],
    artifacts: [
      { setIds: ["blizzard-strayer"], mode: "4pc", priority: 1, noteVi: "CRIT Rate +40% khi Freeze - DPS build Kaeya" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 2, noteVi: "Support: ATK buff team sau Q" },
      { setIds: ["blizzard-strayer", "noblesse-oblige"], mode: "2+2", priority: 3, noteVi: "CRIT + ATK buff thay thế" },
    ],
    mainStats: {
      sands: "ATK% hoặc ER%",
      goblet: "Cryo DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Kaeya DPS: ATK% + Cryo DMG% + CR/CD. Blizzard 4pc Freeze team: CD circlet. Support: ER% sands. ER 180%+ để Q liên tục.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Energy Recharge (ER 160-180%)", "Flat ATK", "Elemental Mastery (EM nếu Melt)"],
      note: "Q cost 60 khá nhẹ. Cryo resonance +15% CR. Blizzard 4pc Freeze +40% CR. Kaeya tốt nhất khi Freeze team với Hydro applicator.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q Glacial Waltz: 3 icicles xoay off-field 8 giây. E Frostgnaw Cryo AoE. NA ít dùng so với Q off-field.",
    },
    playstyleNoteVi:
      "Q tạo 3 icicles xoay quanh active char, deal Cryo liên tục 8 giây. E Cryo blast. Tốt trong Freeze team với Bárbara/Xingqiu/Kokomi wet. Cryo resonance +15% CRIT Rate khi có 2 Cryo. Budget Cryo Sub-DPS/Support hiệu quả nhất early game.",
  },

  // Electro Claymore (Physical DPS)
  razor: {
    weapons: [
      { weaponId: "wolf-s-gravestone", tier: "S", noteVi: "ATK% cao nhất + party ATK buff" },
      { weaponId: "serpent-spine", tier: "A", noteVi: "CR + stack DMG - tốt nhất 4-star" },
      { weaponId: "luxurious-sea-lord", tier: "B", noteVi: "ATK% + Q passive proc ok" },
      { weaponId: "prototype-archaic", tier: "B", noteVi: "Tốt nhất F2P craft: ATK% + Physical proc" },
      { weaponId: "skyward-pride", tier: "B", noteVi: "ER + Physical Blade 80% Physical DMG" },
    ],
    artifacts: [
      { setIds: ["pale-flame"], mode: "4pc", priority: 1, noteVi: "Physical DMG + ATK stack khi E - tốt nhất Razor Physical" },
      { setIds: ["pale-flame", "bloodstained-chivalry"], mode: "2+2", priority: 2, noteVi: "+50% Physical DMG (2pc mỗi bộ)" },
      { setIds: ["thundersoother"], mode: "4pc", priority: 3, noteVi: "+35% DMG vs Electro-aura enemies - nếu Electro build" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Physical DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Razor Physical DPS: Physical DMG% goblet bắt buộc. ATK% sands. CR/CD 1:2. Superconduct (Cryo + Electro) -40% Physical RES.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Energy Recharge (ER 140%+)", "Flat ATK", "DEF% (ít)"],
      note: "Razor Q (Lighting Fang) tạo wolf: NA Electro, ER tăng, 40% Electro RES. ER 140%+ để Q liên tục. Superconduct với Kaeya/Fischl.",
    },
    talentPriority: {
      order: ["Đòn thường (NA)", "Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)"],
      note: "NA trong Q (wolf companion) là nguồn DPS chính. Q tăng ER + Electro. E tạo Electro và báo discharge Sigil. NA chính.",
    },
    playstyleNoteVi:
      "Q Lighting Fang: wolf companion theo và buff NA + Electro. NA chain trong Q nhanh hơn thường. Superconduct với Kaeya hoặc Fischl (-40% Physical RES). Không nên switch off khi Q active vì wolf biến mất. Best Physical DPS 4-star đơn giản nhất.",
  },

  // Electro Bow
  "kujou-sara": {
    weapons: [
      { weaponId: "aqua-simulacra", tier: "A", noteVi: "HP DMG bonus + CRIT DMG tốt" },
      { weaponId: "polar-star", tier: "A", noteVi: "ATK stack passive mạnh" },
      { weaponId: "the-stringless", tier: "A", noteVi: "EM + Skill/Burst DMG bonus tốt 4-star" },
      { weaponId: "the-viridescent-hunt", tier: "B", noteVi: "CR + grouping effect hữu ích" },
      { weaponId: "favonius-warbow", tier: "B", noteVi: "ER support team - energy generation" },
    ],
    artifacts: [
      { setIds: ["emblem-of-severed-fate"], mode: "4pc", priority: 1, noteVi: "ER -> Q DMG. Sara Q cost 80 + mạnh nhất khi instant cast." },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 2, noteVi: "ATK 20% team buff sau Q - support role" },
      { setIds: ["thundering-fury", "noblesse-oblige"], mode: "2+2", priority: 3, noteVi: "Electro DMG + ATK buff thay thế" },
    ],
    mainStats: {
      sands: "ATK% hoặc ER%",
      goblet: "Electro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Sara buffer: ATK buff cho team = 61.3% Sara Base ATK. ER 200%+ cho Q liên tục. Emblem 4pc tốt nhất. Noblesse nếu team chưa có.",
    },
    subStats: {
      stats: ["Energy Recharge (ER 200%+)", "CRIT Rate / CRIT DMG (1:2)", "ATK%", "Flat ATK", "Elemental Mastery (EM nhỏ)"],
      note: "Sara ATK buff scale Base ATK (weapon + level). ER quan trọng. C6 Sara cho CRIT DMG +60% Electro - đổi vai trò hoàn toàn.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q Subjugation: Titanbreaker + Stormcluster Electro DMG lớn. E buff ATK cho active char sau Tengu Juurai. NA ít dùng.",
    },
    playstyleNoteVi:
      "E: dash ra -> bắn Charged Shot nhanh -> buff ATK theo Base ATK. Q instant Electro DMG lớn. Raiden Hypercarry team: Sara E -> Q -> Kazuha Q -> Bennett Q -> Raiden Q. Sara C6 là nhảy cóc rất lớn: Electro CRIT DMG +60%.",
  },

  // Pyro Bow
  yoimiya: {
    weapons: [
      { weaponId: "thundering-pulse", tier: "S", noteVi: "NA DMG stack passive + CRIT DMG tốt nhất" },
      { weaponId: "aqua-simulacra", tier: "A", noteVi: "HP DMG bonus + CRIT DMG" },
      { weaponId: "polar-star", tier: "A", noteVi: "ATK stack passive mạnh" },
      { weaponId: "rust", tier: "B", noteVi: "Tốt nhất F2P: NA DMG +40% nhưng Charged -10%" },
      { weaponId: "the-viridescent-hunt", tier: "B", noteVi: "CR + grouping effect hữu ích" },
    ],
    artifacts: [
      { setIds: ["shimenawa-s-reminiscence"], mode: "4pc", priority: 1, noteVi: "ATK sau E + NA/CA DMG +50% khi consume Energy" },
      { setIds: ["crimson-witch-of-flames"], mode: "4pc", priority: 2, noteVi: "Pyro DMG + Vaporize bonus khi E active" },
      { setIds: ["marechaussee-hunter"], mode: "4pc", priority: 3, noteVi: "CRIT Rate stack khi HP thay đổi" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Pyro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Yoimiya NA DPS: ATK% + Pyro DMG% + CR/CD. Shimenawa 4pc: consume energy sau E -> +50% NA DMG (phải đủ energy trước E).",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Elemental Mastery (EM 100+ Vape)", "Energy Recharge (ER 120%)", "Flat ATK"],
      note: "Yoimiya NA Pyro spam với Xingqiu Hydro = Vaporize liên tục. EM 100+ cho Vaporize. Shimenawa 4pc: tối thiểu 80 energy trước E.",
    },
    talentPriority: {
      order: ["Đòn thường (NA)", "Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)"],
      note: "NA là nguồn DPS chính (Pyro infusion từ E). E tạo Pyro NA 10 giây. Q buff team + mark địch cho Aurous Blaze explosion.",
    },
    playstyleNoteVi:
      "E -> NA spam Pyro trong 10 giây. Q tạo Aurous Blaze: khi đồng đội hit địch bị mark, explode Pyro AoE. A4 passive: sau E, NA buff ATK 2% mỗi hit (tối đa 10 stack, 20%). Phối Xingqiu/Yelan để Vaporize. Zhongli shield để không bị gián đoạn khi đứng bắn.",
  },

  // Cryo Claymore
  chongyun: {
    weapons: [
      { weaponId: "wolf-s-gravestone", tier: "A", noteVi: "ATK% cao + party ATK buff" },
      { weaponId: "serpent-spine", tier: "A", noteVi: "CR + stack DMG - tốt nhất 4-star" },
      { weaponId: "sacrificial-greatsword", tier: "B", noteVi: "ER + E reset - keep Cryo Field liên tục" },
      { weaponId: "favonius-greatsword", tier: "B", noteVi: "ER support team" },
      { weaponId: "skyrider-greatsword", tier: "C", noteVi: "F2P 3-star: ATK stack ok để farm" },
    ],
    artifacts: [
      { setIds: ["blizzard-strayer"], mode: "4pc", priority: 1, noteVi: "CRIT Rate +40% khi Freeze - Melt/Freeze team" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 2, noteVi: "ATK 20% team buff sau Q - support role" },
      { setIds: ["blizzard-strayer", "noblesse-oblige"], mode: "2+2", priority: 3, noteVi: "CRIT + ATK buff thay thế" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Cryo DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Chongyun DPS/Sub-DPS: ATK% + Cryo DMG% + CR/CD. Blizzard 4pc Freeze: CD circlet. E Cryo Field convert NA -> Cryo của sword/claymore/polearm char.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Energy Recharge (ER 140-160%)", "Flat ATK", "Elemental Mastery (EM nếu Melt)"],
      note: "E tạo Cryo infusion cho Sword/Claymore/Polearm char - dùng để hỗ trợ char vật lý khi muốn Cryo. ER 140%+ để Q liên tục.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q Cloud-Parting Star: 3 Cyro shards bay ra gây AoE DMG lớn. E tạo Spirit Blade + Cryo Field. NA trong field dùng nếu main DPS.",
    },
    playstyleNoteVi:
      "E tạo Cryo Field: Sword/Claymore/Polearm char trong field -> NA Cryo. Q 3 Cyro blasts. Chủ yếu dùng làm Cryo infusion cho DPS khác hoặc Sub-DPS. Phối Xingqiu để Freeze team. Melt team: Chongyun E -> Diluc/Bennett Q Pyro = Melt. Khá budget friendly.",
  },

  // Geo Catalyst
  ningguang: {
    weapons: [
      { weaponId: "lost-prayer-to-the-sacred-winds", tier: "S", noteVi: "CR + Elemental DMG stack tốt nhất DPS" },
      { weaponId: "memory-of-dust", tier: "A", noteVi: "ATK% + shield ATK bonus rất phù hợp Geo" },
      { weaponId: "the-widsith", tier: "A", noteVi: "Random buff mạnh khi switch-in" },
      { weaponId: "skyward-atlas", tier: "A", noteVi: "ATK% + Physical proc ok" },
      { weaponId: "prototype-amber", tier: "B", noteVi: "F2P: ER + heal nhỏ khi Q" },
    ],
    artifacts: [
      { setIds: ["archaic-petra"], mode: "4pc", priority: 1, noteVi: "Geo DMG + Crystallize element buff cho team (+35% Element DMG)" },
      { setIds: ["husk-of-opulent-dreams"], mode: "4pc", priority: 2, noteVi: "DEF + Geo DMG stack tốt cho Ningguang build DEF" },
      { setIds: ["archaic-petra", "noblesse-oblige"], mode: "2+2", priority: 3, noteVi: "Geo DMG + ATK buff thay thế" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Geo DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Ningguang DPS: ATK% + Geo DMG% + CR/CD. A1: đi qua Jade Screen -> Ningguang Geo RES 12% down. Memory of Dust: +48% ATK khi có shield.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Energy Recharge (ER 130-150%)", "Flat ATK", "DEF% (ít)"],
      note: "Q Star Shards cost 40 (thấp) - ER không cần nhiều lắm. CR/CD quan trọng nhất. Jade Screen buff Geo RES. Geo Resonance +15% DMG.",
    },
    talentPriority: {
      order: ["Đòn thường (NA)", "Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)"],
      note: "NA Sparkling Scatter là DPS chính (piercing Geo projectile). Q Star Shards: tất cả Jade Screen Stones phóng vào địch. E Jade Screen buff và block.",
    },
    playstyleNoteVi:
      "E đặt Jade Screen -> A1: đi qua Screen Ningguang +12% Geo DMG. NA spam Sparkling Scatter (piercing + collect Starshade). Q consume tất cả Starshade thành Star Shards đánh AoE lớn. Tốt nhất khi kết hợp với Zhongli shield + Geo resonance. Quick swap meta tốt.",
  },

  // Geo Claymore
  "arataki-itto": {
    weapons: [
      { weaponId: "redhorn-stonethresher", tier: "S", noteVi: "DEF% sub + NA/CA DMG bonus scale DEF - bắt buộc Itto" },
      { weaponId: "serpent-spine", tier: "A", noteVi: "Tốt nhất 4-star: CR + stack DMG" },
      { weaponId: "luxurious-sea-lord", tier: "B", noteVi: "ATK% + Q passive proc ok" },
      { weaponId: "whiteblind", tier: "B", noteVi: "DEF% + ATK stack - tốt F2P" },
      { weaponId: "favonius-greatsword", tier: "C", noteVi: "ER cho team - không phải best" },
    ],
    artifacts: [
      { setIds: ["husk-of-opulent-dreams"], mode: "4pc", priority: 1, noteVi: "DEF% + Geo DMG stack passively - bắt buộc Itto" },
      { setIds: ["husk-of-opulent-dreams", "archaic-petra"], mode: "2+2", priority: 2, noteVi: "DEF + Geo DMG thay thế farm" },
    ],
    mainStats: {
      sands: "DEF%",
      goblet: "Geo DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Itto Q convert NA -> Geo DMG scale DEF. DEF% 3500+ mục tiêu. Redhorn: NA/CA DMG + DEF scale. DEF% sands bắt buộc. Husk 4pc stack DEF passively.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "DEF%", "Energy Recharge (ER 130%+)", "Flat DEF", "ATK%"],
      note: "DEF 3500+ để CA Arataki Kesagiri gây tối đa. ER 130%+ để Q liên tục. Geo Resonance +15% DMG. Husk 4pc +24% DEF khi off-field.",
    },
    talentPriority: {
      order: ["Đòn thường (NA)", "Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)"],
      note: "NA (Arataki Kesagiri CA trong Q) là nguồn DPS chính scale DEF. Q Royale Descent Bellow converts NA -> Geo DEF scale. E tạo Ushi Geo DMG.",
    },
    playstyleNoteVi:
      "Q Royale Descent: convert NA -> Geo, ATK speed tăng, gain Superlative Superstrength stacks. Dùng stacks để Arataki Kesagiri CA (không tốn stamina). Gorou phải có để buff DEF +x3 Geo char. Albedo off-field Sub-DPS. Geo Resonance +15% DMG.",
  },

  // ─── Geo Bow ───────────────────────────────────────────────────────────────

  // Gorou: Geo DEF support chuyên buff DEF cho Mono Geo — Bow
  gorou: {
    weapons: [
      { weaponId: "favonius-warbow", tier: "S", noteVi: "ER max để Q spam + energy cho team Geo" },
      { weaponId: "elegy-for-the-end", tier: "A", noteVi: "ER + buff ATK 100 và EM 100 cho team sau Q" },
      { weaponId: "sacrificial-bow", tier: "A", noteVi: "ER + E reset — giúp duy trì Q và khiên" },
      { weaponId: "end-of-the-line", tier: "B", noteVi: "ER craft 4-star tốt F2P" },
      { weaponId: "recurve-bow", tier: "C", noteVi: "ER 3-star budget" },
    ],
    artifacts: [
      { setIds: ["husk-of-opulent-dreams"], mode: "4pc", priority: 1, noteVi: "DEF% + Geo DMG — passive Gorou buff thêm DMG theo DEF" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 2, noteVi: "ATK team buff 20% khi Q — nếu không ai khác mang" },
      { setIds: ["the-exile"], mode: "4pc", priority: 3, noteVi: "ER + energy team generation — budget F2P" },
    ],
    mainStats: {
      sands: "ER%",
      goblet: "DEF%",
      circlet: "DEF% hoặc CRIT Rate",
      note: "Gorou support: ER% bắt buộc (Q cost 80, không tự gen energy). DEF% để passive buff Geo DMG Bonus cho đội. Mỗi 100 DEF = thêm 1 layer buff.",
    },
    subStats: {
      stats: ["Energy Recharge (ER 200%+)", "DEF%", "Flat DEF", "HP%", "CRIT Rate (nếu dư)"],
      note: "Gorou ưu tiên ER tuyệt đối để spam Q liên tục. DEF% tăng passive buff Geo DMG Bonus cho đồng đội Geo. Không cần ATK hay EM.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q Juuga: Forward Unto Victory buff DEF, Geo DMG, Interrupt Res theo số Geo char. Level Q càng cao buff DEF càng nhiều. E tạo Glory construct.",
    },
    playstyleNoteVi:
      "Gorou buff theo số Geo: 1 Geo = +DEF buff, 2 Geo = +Interrupt Res, 3+ Geo = +Geo DMG Bonus 15%. Q Juuga tạo aura buff liên tục. Itto + Gorou + Albedo = core Mono Geo tối ưu nhất. Gorou C4 heal theo DEF. C6 convert CRIT DMG thành Geo Skill CRIT DMG theo DEF.",
  },

  // ─── Geo Sword ─────────────────────────────────────────────────────────────

  // Chiori: Geo off-field Sub-DPS scale DEF — Sword
  chiori: {
    weapons: [
      { weaponId: "uraku-misugiri", tier: "S", noteVi: "Signature: DEF% + Elemental Skill DMG Bonus — tối ưu Chiori" },
      { weaponId: "primordial-jade-cutter", tier: "S", noteVi: "CR 44.1% + HP% — rất mạnh nếu có" },
      { weaponId: "haran-geppaku-futsu", tier: "A", noteVi: "Elemental DMG stack 3 lần + Skill DMG" },
      { weaponId: "mistsplitter-reforged", tier: "A", noteVi: "Elemental DMG stack — ok thay thế" },
      { weaponId: "festering-desire", tier: "B", noteVi: "Skill DMG + ER — tốt nhất 4-star craft F2P" },
    ],
    artifacts: [
      { setIds: ["husk-of-opulent-dreams"], mode: "4pc", priority: 1, noteVi: "DEF% + Geo DMG stack passively off-field — tối ưu vì Chiori E scale DEF" },
      { setIds: ["golden-troupe"], mode: "4pc", priority: 2, noteVi: "Elemental Skill DMG +70% khi off-field — Chiori E mạnh off-field" },
      { setIds: ["husk-of-opulent-dreams", "archaic-petra"], mode: "2+2", priority: 3, noteVi: "DEF% + Geo DMG thay thế" },
    ],
    mainStats: {
      sands: "DEF%",
      goblet: "Geo DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Chiori E (Tamoto doll) scale DEF%. DEF% sands bắt buộc. DEF 2500+ mục tiêu. Geo DMG% goblet. CR/CD circlet 1:2.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "DEF%", "Flat DEF", "Energy Recharge (ER 130%+)", "ATK%"],
      note: "DEF% và CRIT để max Tamoto DMG. ER 130% để Q liên tục. Husk 4pc stack DEF + Geo DMG khi off-field. DEF 2500+ = ngưỡng tốt.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E (Kinu + Tamoto construct off-field) là DPS chính scale DEF. Q tạo thêm Tamoto và buff Chiori. NA ít quan trọng khi off-field.",
    },
    playstyleNoteVi:
      "E tạo Tamoto doll gây Geo DMG off-field (scale DEF). Q kéo thêm Tamoto và buff. Passive: thêm Geo construct trong team (Albedo E, Zhongli pillar) trigger thêm attack tự động. Đội Chiori + Albedo + Zhongli + DPS = 3 construct Geo đồng thời — cực mạnh off-field.",
  },

  // Xilonen: Geo support heal + RES shred — Sword
  xilonen: {
    weapons: [
      { weaponId: "peak-patrol-song", tier: "S", noteVi: "Bài Ca Tuần Đỉnh - Trấn phái tối thượng của Xilonen, DEF% cực cao, tăng mạnh phòng thủ và buff tới 25.6% Sát Thương Nguyên Tố cho toàn đội" },
      { weaponId: "favonius-sword", tier: "S", noteVi: "Kiếm Tây Phong - Lựa chọn hỗ trợ chuẩn mực nhất, sạc năng lượng dồi dào cho Xilonen và toàn bộ đội hình" },
      { weaponId: "flute-of-ezpitzal", tier: "S", noteVi: "Ống Sáo Của Ezpitzal - Đơn kiếm rèn Natlan F2P tốt nhất, tăng tới 69% DEF sau khi thi triển Kỹ Năng Nguyên Tố" },
      { weaponId: "uraku-misugiri", tier: "A", noteVi: "Kiếm Uraku - Tăng DEF% và sát thương bạo kích CRIT DMG cho build Xilonen Sub-DPS" },
      { weaponId: "cinnabar-spindle", tier: "A", noteVi: "Thoi Băng Chân Nhuận - Cung cấp 69% DEF khổng lồ cho các kỹ năng scale theo Phòng Thủ" },
      { weaponId: "sacrificial-sword", tier: "B", noteVi: "Kiếm Tế Lễ - Hỗ trợ nạp ER và reset hồi chiêu E" },
    ],
    artifacts: [
      { setIds: ["scroll-of-the-hero-of-cinder-city"], mode: "4pc", priority: 1, noteVi: "Bí Cảnh Dũng Sĩ Tro Tàn 4 món - Trấn thánh di vật tối thượng, buff tới 40% sát thương nguyên tố tương ứng cho cả đội trong 20s" },
      { setIds: ["husk-of-opulent-dreams"], mode: "4pc", priority: 2, noteVi: "Giấc Mộng Phù Hoa 4 món - Tối ưu lượng Phòng Thủ DEF% và tăng cường tối đa khả năng hồi máu của chiêu Q" },
      { setIds: ["instructor"], mode: "4pc", priority: 3, noteVi: "Giáo Quan 4 món - Hỗ trợ tăng 120 Tinh Thông Nguyên Tố cho toàn đội hình trong các team phản ứng Bốc Hơi / Tan Chảy" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 4, noteVi: "Nghi Thức Tông Thất Cổ - Buff 20% ATK cho toàn đội sau khi dùng Q" },
    ],
    mainStats: {
      sands: "Phòng thủ (DEF%) hoặc Hiệu Quả Nạp (ER)",
      goblet: "Phòng thủ (DEF%) hoặc Sát thương Nham (Geo DMG%)",
      circlet: "Tăng Trị Liệu (Healing Bonus), DEF% hoặc CRIT Rate (khi cầm Tây Phong)",
      note: "Xilonen tỷ lệ thuận hoàn toàn theo Phòng thủ (DEF) để hồi máu, tăng cường khả năng sống còn và kích hoạt hiệu ứng vũ khí trấn. Đảm bảo ER từ 150-180% nếu không cầm Kiếm Tây Phong.",
    },
    subStats: {
      stats: ["Phòng thủ (DEF%)", "Hiệu Quả Nạp (ER 160-180%)", "Tỷ lệ Bạo Kích (CRIT Rate kích Tây Phong)", "DEF phẳng"],
      note: "Xilonen là hỗ trợ đa năng hàng đầu: vừa giảm 36% kháng nguyên tố Hỏa/Thủy/Băng/Lôi của kẻ địch, vừa kích hoạt buff 40% DMG từ bộ Dũng Sĩ Tro Tàn và hồi phục lượng máu lớn theo DEF.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "Kỹ năng E (Vũ Điệu Samac) giảm 36% kháng nguyên tố của kẻ địch theo Mẫu Ghi Âm Dạ Hồn là ưu tiên nâng tối đa. Chiêu Nộ Q hồi máu toàn đội theo DEF. Đòn thường NA không cần nâng.",
    },
    playstyleNoteVi:
      "Xilonen vào sân bấm E kích Dạ Hồn, đánh thường NA 2 lần để kích hoạt Mẫu Ghi Âm giảm 36% kháng nguyên tố của địch, sau đó bật Q hồi máu diện rộng rồi đổi sang chủ lực dồn sát thương. Bộ Dũng Sĩ Tro Tàn sẽ kích hoạt buff 40% sát thương nguyên tố cho toàn đội trong suốt 20 giây.",
  },

  // ─── Geo Polearm ───────────────────────────────────────────────────────────

  // Kachina: Geo Sub-DPS off-field — Polearm
  kachina: {
    weapons: [
      { weaponId: "footprint-of-the-rainbow", tier: "S", noteVi: "Dấu Chân Cầu Vồng - Vũ khí cán dài rèn Natlan trấn F2P cho Kachina, tăng tới 51.7% DEF và nhận thêm 32% DEF sau khi dùng E" },
      { weaponId: "favonius-lance", tier: "S", noteVi: "Thương Tây Phong - Cung cấp lượng lớn hạt năng lượng trắng hỗ trợ sạc Nộ cho toàn đội" },
      { weaponId: "dialogues-of-the-desert-sages", tier: "A", noteVi: "Đối Thoại Hiền Giả Sa Mạc - Cung cấp chỉ số Hiệu Quả Nạp và hồi phục năng lượng hữu ích" },
      { weaponId: "deathmatch", tier: "A", noteVi: "Thương Quyết Chiến - CRIT Rate 36.8% và tăng thêm DEF% khi đối đầu với từ 2 kẻ địch trở lên" },
      { weaponId: "the-catch", tier: "B", noteVi: "Lao Câu Cá - Tăng Hiệu Quả Nạp ER và bạo kích cho chiêu Nộ Q" },
    ],
    artifacts: [
      { setIds: ["scroll-of-the-hero-of-cinder-city"], mode: "4pc", priority: 1, noteVi: "Bí Cảnh Dũng Sĩ Tro Tàn 4 món - Kachina kích hoạt Dạ Hồn dễ dàng nhất để buff tới 40% sát thương nguyên tố cho chủ lực (Mualani, Kinich, Navia...)" },
      { setIds: ["husk-of-opulent-dreams"], mode: "4pc", priority: 2, noteVi: "Giấc Mộng Phù Hoa 4 món - Tối ưu lượng DEF% và Geo DMG nếu build Kachina gây sát thương Nham ngoài sân" },
      { setIds: ["golden-troupe"], mode: "4pc", priority: 3, noteVi: "Đoàn Kịch Hoàng Kim 4 món - Tăng tới 70% sát thương kỹ năng E của Turbo Twirly từ ngoài sân" },
    ],
    mainStats: {
      sands: "Phòng thủ (DEF%) hoặc Hiệu Quả Nạp (ER)",
      goblet: "Sát thương Nham (Geo DMG%) hoặc Phòng thủ (DEF%)",
      circlet: "CRIT Rate (kích Tây Phong), CRIT DMG hoặc DEF%",
      note: "Toàn bộ sát thương Turbo Twirly và độ bền khiên Kết Tinh của Kachina đều tính theo Phòng Thủ (DEF). Duy trì ER 130-150% để luôn sẵn sàng nộ.",
    },
    subStats: {
      stats: ["Phòng thủ (DEF%)", "Tỷ lệ Bạo Kích (CRIT Rate kích Tây Phong)", "Hiệu Quả Nạp (ER 130-150%)", "DEF phẳng", "Sát thương Bạo Kích (CRIT DMG)"],
      note: "Ưu tiên DEF% và CRIT Rate để kích hoạt Thương Tây Phong sạc năng lượng mượt mà cho toàn đội.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "Kỹ năng E triệu hồi Turbo Twirly gây sát thương Nham ngoài sân và kích hoạt Dạ Hồn là quan trọng nhất. Q tạo sàn đấu Nham mở rộng phạm vi. NA không cần nâng.",
    },
    playstyleNoteVi:
      "Kachina vào sân nhấn E thả Turbo Twirly độc lập ra sân (không cần cưỡi), thi triển Q tạo sàn đấu rồi swap ngay lập tức sang chủ lực. Cơ chế Dạ Hồn kích hoạt lập tức mang lại 40% sát thương nguyên tố cho đồng đội thông qua bộ Dũng Sĩ Tro Tàn.",
  },

  // Yun Jin: Geo Normal Attack flat DMG buffer — Polearm
  "yun-jin": {
    weapons: [
      { weaponId: "favonius-lance", tier: "S", noteVi: "ER max + energy cho team — Q cần spam liên tục" },
      { weaponId: "engulfing-lightning", tier: "A", noteVi: "ER 36.3% sub + passive ATK từ ER — rất tốt" },
      { weaponId: "prototype-starglitter", tier: "A", noteVi: "ER craft + stack NA DMG bonus — tốt nhất F2P" },
      { weaponId: "kitain-cross-spear", tier: "B", noteVi: "EM + passive energy khi E" },
      { weaponId: "black-tassel", tier: "B", noteVi: "HP% 3-star — budget nếu cần DEF cao" },
    ],
    artifacts: [
      { setIds: ["husk-of-opulent-dreams"], mode: "4pc", priority: 1, noteVi: "DEF% stack — Q buff NA scale theo DEF Yun Jin" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 2, noteVi: "ATK team buff 20% sau Q — nếu không ai khác mang" },
      { setIds: ["husk-of-opulent-dreams", "emblem-of-severed-fate"], mode: "2+2", priority: 3, noteVi: "DEF% + ER thay thế" },
    ],
    mainStats: {
      sands: "ER% hoặc DEF%",
      goblet: "DEF%",
      circlet: "DEF%",
      note: "Yun Jin Q Flying Cloud Flag Formation buff NA DMG flat (scale DEF Yun Jin). DEF% 2000+ mục tiêu. ER% để Q spam (cost 60). DEF% cả 3 slot nếu có ER từ vũ khí.",
    },
    subStats: {
      stats: ["Energy Recharge (ER 180%+)", "DEF%", "Flat DEF", "HP%", "CRIT Rate (nếu hybrid)"],
      note: "Yun Jin ưu tiên ER rất cao để spam Q (cost 60, thiếu self-energy gen). DEF% để buff NA mạnh hơn. Husk 4pc stack DEF khi off-field. Thích hợp với NA DPS nhanh như Yoimiya, Hu Tao.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q Flying Cloud Flag Formation buff NA flat DMG — level càng cao buff càng mạnh (scale DEF). E Counter Geo DMG. NA ít dùng.",
    },
    playstyleNoteVi:
      "Yun Jin Q tạo aura Flying Cloud Flag (8 hit buff NA DMG flat, scale DEF). Hoạt động tốt với NA DPS đánh nhanh: Yoimiya (Pyro Bow Charged), Cyno (Electro Polearm), Hu Tao (CA ít). E Counter: giữ E khi bị đánh release Geo DMG. Đội đa nguyên tố Yun Jin buff +1 layer mỗi element khác nhau (tối đa C6 unlock điều này).",
  },

  // ── chasca ──
  "chasca": {
    "weapons": [
        {
            "weaponId": "astral-vulture-s-crimson-plumage",
            "tier": "S",
            "noteVi": "Trấn tốt nhất - CRIT DMG 66.2%, tăng ATK% và buff sát thương Đạn Săn Bóng Đêm cực lớn"
        },
        {
            "weaponId": "the-first-great-magic",
            "tier": "S",
            "noteVi": "CRIT DMG 66.2% + buff ATK% và Tốc độ di chuyển theo đồng đội cùng hệ"
        },
        {
            "weaponId": "aqua-simulacra",
            "tier": "A",
            "noteVi": "CRIT DMG 88.2% + 20% DMG bonus toàn diện bất kể cự ly"
        },
        {
            "weaponId": "hunter-s-path",
            "tier": "A",
            "noteVi": "CRIT Rate cao 44.1% + buff sát thương trọng kích theo EM"
        },
        {
            "weaponId": "skyward-harp",
            "tier": "A",
            "noteVi": "Cung cấp cả CRIT Rate lẫn CRIT DMG cân bằng, base ATK cao"
        },
        {
            "weaponId": "chain-breaker",
            "tier": "B",
            "noteVi": "Cung rèn Natlan tốt nhất F2P - tăng ATK% và EM theo số nhân vật Natlan"
        },
        {
            "weaponId": "song-of-stillness",
            "tier": "B",
            "noteVi": "Cung rèn F2P Fontaine - tăng 32% DMG sau khi nhận hồi máu"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "obsidian-codex"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Tốt nhất Natlan - Tăng 15% DMG trong Dạ Hồn và +40% CRIT Rate cực lớn"
        },
        {
            "setIds": [
                "desert-pavilion-chronicle"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Tăng 15% Anemo DMG và 40% DMG Trọng kích/Tấn công thường"
        },
        {
            "setIds": [
                "shimenawa-s-reminiscence"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Tăng 18% ATK và 50% DMG Trọng kích khi tiêu hao năng lượng"
        },
        {
            "setIds": [
                "obsidian-codex",
                "desert-pavilion-chronicle"
            ],
            "mode": "2+2",
            "priority": 4,
            "noteVi": "2pc Dạ Hồn (+15% DMG) + 2pc Phong (+15% ST Phong)"
        },
        {
            "setIds": [
                "obsidian-codex",
                "gladiator-s-finale"
            ],
            "mode": "2+2",
            "priority": 5,
            "noteVi": "2pc Dạ Hồn (+15% DMG) + 2pc ATK% (+18% Tấn Công)"
        }
    ],
    "mainStats": {
        "sands": "ATK%",
        "goblet": "ATK% hoặc Anemo DMG%",
        "circlet": "CRIT DMG (bộ Obsidian đã cho 40% CR)",
        "note": "Chasca nạp Đạn Săn Bóng Đêm chuyển hóa thành Hỏa/Thủy/Lôi/Băng theo đồng đội, do đó Ly ATK% cạnh tranh sòng phẳng hoặc nhỉnh hơn Ly Anemo DMG%. Nón luôn ưu tiên CRIT DMG khi dùng bộ Bí Điển Obsidian."
    },
    "subStats": {
        "stats": [
            "CRIT DMG",
            "CRIT Rate (khoảng 40-50% là đủ nếu dùng 4pc Obsidian)",
            "ATK%",
            "Elemental Mastery (EM)",
            "Energy Recharge (ER 110-120%)"
        ],
        "note": "Nếu dùng bộ Bí Điển Obsidian, chỉ cần 40-50% CR cơ bản để đạt 80-90% CR khi vào trạng thái Dạ Hồn. Tập trung toàn bộ vào CRIT DMG và ATK%."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)",
            "Đòn thường (NA)"
        ],
        "note": "E kích hoạt trạng thái Lướt Gió và nạp Đạn Săn Bóng Đêm là nguồn 85%+ sát thương của Chasca. Q gây lượng lớn sát thương diện rộng. NA không cần nâng vì Chasca bắn đạn đặc biệt từ E."
    },
    "playstyleNoteVi": "Chasca là DPS On-field nguyên tố Phong nhưng gây sát thương chuyển hóa đa nguyên tố độc nhất vô nhị. Đội hình luôn cần 2-3 nhân vật Hỏa/Thủy/Lôi/Băng (PHEC) khác nhau để nạp tối đa 6 viên Đạn Săn Chuyển Hóa. Chu kỳ: Đồng đội bật buff/áp ấn -> Chasca E -> Bay lên nhắm giữ nạp đầy 6 viên đạn -> Nhả đạn gây phản ứng bùng nổ liên hoàn -> Q kết liễu."
},

  // ── mavuika ──
  "mavuika": {
    "weapons": [
        {
            "weaponId": "a-thousand-blazing-suns",
            "tier": "S",
            "noteVi": "Trấn tốt nhất - CRIT Rate cao, tăng mạnh ATK% và sát thương Dạ Hồn"
        },
        {
            "weaponId": "verdict",
            "tier": "S",
            "noteVi": "CRIT Rate 22.1% + Base ATK cực cao và buff sát thương E"
        },
        {
            "weaponId": "beacon-of-the-reed-sea",
            "tier": "A",
            "noteVi": "CRIT Rate 33.1% + buff ATK khi dùng E và khi chịu sát thương"
        },
        {
            "weaponId": "serpent-spine",
            "tier": "A",
            "noteVi": "Kiếm Ly Cốt - Tăng tối đa 50% DMG toàn diện ở R5"
        },
        {
            "weaponId": "earth-shaker",
            "tier": "B",
            "noteVi": "Đại kiếm rèn Natlan tốt nhất F2P - tăng sát thương Kỹ năng nguyên tố sau khi kích phản ứng Hỏa"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "obsidian-codex"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "DPS On-field tối ưu - Tăng 15% DMG Dạ Hồn và 40% CRIT Rate"
        },
        {
            "setIds": [
                "scroll-of-the-hero-of-cinder-city"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Sub-DPS / Hỗ trợ toàn đội - Buff 40% Sát Thương Nguyên Tố cho cả team"
        },
        {
            "setIds": [
                "crimson-witch-of-flames"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "4pc Ma Nữ - Tăng mạnh phản ứng Bốc Hơi / Tan Chảy"
        },
        {
            "setIds": [
                "obsidian-codex",
                "crimson-witch-of-flames"
            ],
            "mode": "2+2",
            "priority": 4,
            "noteVi": "2pc Dạ Hồn (+15% DMG) + 2pc Hỏa (+15% ST Hỏa)"
        },
        {
            "setIds": [
                "obsidian-codex",
                "gladiator-s-finale"
            ],
            "mode": "2+2",
            "priority": 5,
            "noteVi": "2pc Dạ Hồn (+15% DMG) + 2pc ATK (+18% Tấn Công)"
        }
    ],
    "mainStats": {
        "sands": "ATK%",
        "goblet": "Pyro DMG%",
        "circlet": "CRIT DMG hoặc CRIT Rate",
        "note": "Nếu dùng bộ Bí Điển Obsidian, ưu tiên Nón CRIT DMG. Nếu dùng bộ Dũng Sĩ Tro Tàn hoặc Ma Nữ, cân bằng CRIT Rate >= 70%."
    },
    "subStats": {
        "stats": [
            "CRIT Rate / CRIT DMG (1:2)",
            "ATK%",
            "Elemental Mastery (EM nếu chơi Bốc Hơi)",
            "Energy Recharge (ER 120-130%)",
            "Flat ATK"
        ],
        "note": "Ưu tiên tối đa CRIT và ATK. Với đội hình Bốc Hơi, bổ sung 100-150 EM."
    },
    "talentPriority": {
        "order": [
            "Nguyên tố bùng phát (Q)",
            "Kỹ năng nguyên tố (E)",
            "Đòn thường (NA)"
        ],
        "note": "Q là nguồn sát thương bùng nổ mạnh nhất. E cung cấp sát thương Hỏa off-field liên tục và buff Dạ Hồn. NA nâng sau cùng."
    },
    "playstyleNoteVi": "Mavuika linh hoạt cả On-field lẫn Off-field. Bật E lái xe máy tấn công và duy trì sát thương Hỏa off-field, tích tầng Chiến Ý khi đồng đội tiêu hao Dạ Hồn, sau đó kích hoạt Q tung cú chém mặt trời rực lửa hủy diệt toàn sàn đấu."
},

  // ── kinich ──
  "kinich": {
    "weapons": [
        {
            "weaponId": "fang-of-the-mountain-king",
            "tier": "S",
            "noteVi": "Trấn tốt nhất - CRIT Rate + buff sát thương E Pháo Xuyên Giáp cực mạnh"
        },
        {
            "weaponId": "beacon-of-the-reed-sea",
            "tier": "S",
            "noteVi": "CRIT Rate 33.1% + buff ATK lớn khi trúng E"
        },
        {
            "weaponId": "serpent-spine",
            "tier": "A",
            "noteVi": "Kiếm Ly Cốt - Tăng đến 50% DMG toàn bộ sát thương của Kinich"
        },
        {
            "weaponId": "earth-shaker",
            "tier": "B",
            "noteVi": "Đại kiếm rèn Natlan F2P - tăng sát thương E khi kích hoạt Thiêu Đốt"
        },
        {
            "weaponId": "blackcliff-slasher",
            "tier": "B",
            "noteVi": "CRIT DMG sub-stat tốt cho F2P"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "obsidian-codex"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Tốt nhất Natlan - Tăng 15% DMG Dạ Hồn và 40% CRIT Rate khi bắn Pháo"
        },
        {
            "setIds": [
                "unfinished-reverie"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Tăng 50% DMG khi kẻ địch bị thiêu đốt (Burning team)"
        },
        {
            "setIds": [
                "deepwood-memories"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Giảm 30% Thảo RES nếu trong team không có nhân vật nào khác mang"
        },
        {
            "setIds": [
                "obsidian-codex",
                "deepwood-memories"
            ],
            "mode": "2+2",
            "priority": 4,
            "noteVi": "2pc Dạ Hồn (+15% DMG) + 2pc Thảo (+15% ST Thảo)"
        },
        {
            "setIds": [
                "obsidian-codex",
                "gladiator-s-finale"
            ],
            "mode": "2+2",
            "priority": 5,
            "noteVi": "2pc Dạ Hồn (+15% DMG) + 2pc ATK (+18% Tấn Công)"
        }
    ],
    "mainStats": {
        "sands": "ATK%",
        "goblet": "Dendro DMG%",
        "circlet": "CRIT DMG (bộ Obsidian đã cho 40% CR)",
        "note": "Kinich gây sát thương Thảo trực tiếp scale theo ATK. Không cần EM nhiều như các đội Hyperbloom vì trọng tâm là Pháo Xuyên Giáp (Scalespiker Cannon)."
    },
    "subStats": {
        "stats": [
            "CRIT DMG",
            "CRIT Rate (45-55% nếu dùng Obsidian)",
            "ATK%",
            "Energy Recharge (ER 120%)",
            "Elemental Mastery"
        ],
        "note": "Tập trung đẩy CRIT DMG lên 200%+ và duy trì ATK trên 2000."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)",
            "Đòn thường (NA)"
        ],
        "note": "E Pháo Xuyên Giáp là 90% sát thương của Kinich. Q triệu hồi Ajaw phun lửa hỗ trợ. NA không dùng trong rotation."
    },
    "playstyleNoteVi": "Kinich móc dây đu quanh kẻ địch bằng E, liên tục xả đạn để tích đầy thanh Điểm Dạ Hồn, sau đó nhấn E tung phát Pháo Xuyên Giáp gây sát thương Thảo khổng lồ. Luôn ghép với đồng đội Hỏa (Bennett, Xiangling, Dehya, Thoma) để duy trì hiệu ứng Thiêu Đốt nạp Dạ Hồn thần tốc."
},

  // ── mualani ──
  "mualani": {
    "weapons": [
        {
            "weaponId": "surf-s-up",
            "tier": "S",
            "noteVi": "Trấn tốt nhất - CRIT DMG 88.2%, tăng 20% HP và buff sát thương Đòn Cắn Cá Mập"
        },
        {
            "weaponId": "tome-of-the-eternal-flow",
            "tier": "S",
            "noteVi": "CRIT DMG 88.2% + buff HP và sát thương trọng kích"
        },
        {
            "weaponId": "the-widsith",
            "tier": "A",
            "noteVi": "Chương Nhạc Lang Thang - buff cực mạnh cả 3 nốt nhạc (ATK, EM, Elemental DMG)"
        },
        {
            "weaponId": "ring-of-yaxche",
            "tier": "B",
            "noteVi": "Pháp khí rèn Natlan tốt nhất F2P - tăng HP% và buff sát thương NA theo HP tối đa"
        },
        {
            "weaponId": "ash-graven-drinking-horn",
            "tier": "B",
            "noteVi": "Vũ khí sự kiện Natlan F2P - tăng HP% và sát thương AOE"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "obsidian-codex"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Tốt nhất Natlan - +15% DMG Dạ Hồn và 40% CRIT Rate"
        },
        {
            "setIds": [
                "heart-of-depth"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Tăng 15% Thủy DMG và 30% sát thương Tấn Công Thường"
        },
        {
            "setIds": [
                "nymph-s-dream"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Tăng Thủy DMG và ATK khi stack đòn đánh"
        },
        {
            "setIds": [
                "obsidian-codex",
                "tenacity-of-the-millelith"
            ],
            "mode": "2+2",
            "priority": 4,
            "noteVi": "2pc Dạ Hồn (+15% DMG) + 2pc HP (+20% HP)"
        },
        {
            "setIds": [
                "tenacity-of-the-millelith",
                "heart-of-depth"
            ],
            "mode": "2+2",
            "priority": 5,
            "noteVi": "2pc HP (+20% HP) + 2pc Thủy (+15% ST Thủy)"
        }
    ],
    "mainStats": {
        "sands": "HP%",
        "goblet": "Hydro DMG%",
        "circlet": "CRIT DMG (bộ Obsidian đã cho 40% CR)",
        "note": "Toàn bộ sát thương của Mualani tỷ lệ theo HP tối đa, ATK hoàn toàn vô dụng. Nón ưu tiên CRIT DMG."
    },
    "subStats": {
        "stats": [
            "CRIT DMG",
            "CRIT Rate (40-50% với Obsidian)",
            "HP%",
            "Elemental Mastery (EM 150-200 cho Bốc Hơi)",
            "Flat HP"
        ],
        "note": "Mualani là nuke Bốc Hơi đơn mục tiêu mạnh nhất game hiện tại. EM từ 150-200 là tối ưu để nhân x2.0 sát thương Bốc Hơi."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)",
            "Đòn thường (NA)"
        ],
        "note": "E lướt ván và Cú Cắn Cá Mập là nguồn sát thương chính. Q gây nuke sát thương diện rộng. NA không dùng."
    },
    "playstyleNoteVi": "Bật E lướt ván cá mập đâm qua kẻ địch để tích đủ 3 tầng Sóng Cuộn, sau đó tung Cú Cắn Cá Mập vào kẻ địch đã dính ấn Hỏa để kích Bốc Hơi hàng trăm ngàn sát thương. Q dùng để kết liễu đợt quái lớn."
},

  // ── citlali ──
  "citlali": {
    "weapons": [
        {
            "weaponId": "starcaller-s-watch",
            "tier": "S",
            "noteVi": "Trấn tốt nhất - Cung cấp EM cực lớn, tăng sức mạnh khiên và buff sát thương toàn đội"
        },
        {
            "weaponId": "a-thousand-floating-dreams",
            "tier": "A",
            "noteVi": "Cõi Mộng Ngàn Đêm - EM 265 cực cao và buff nguyên tố toàn đội"
        },
        {
            "weaponId": "favonius-codex",
            "tier": "A",
            "noteVi": "Tây Phong - Đảm bảo nạp Q liên tục cho toàn đội"
        },
        {
            "weaponId": "sacrificial-fragments",
            "tier": "B",
            "noteVi": "Mảnh Chương Tế Lễ - EM 221 + reset E"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "scroll-of-the-hero-of-cinder-city"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Tốt nhất Natlan - Buff 40% Sát Thương Nguyên Tố cho toàn đội"
        },
        {
            "setIds": [
                "noblesse-oblige"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Buff 20% ATK cho toàn đội sau khi dùng Q"
        },
        {
            "setIds": [
                "blizzard-strayer"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Build Sub-DPS Băng"
        },
        {
            "setIds": [
                "scroll-of-the-hero-of-cinder-city",
                "gilded-dreams"
            ],
            "mode": "2+2",
            "priority": 4,
            "noteVi": "2pc Nạp/Buff + 2pc EM (+80 Tinh Thông)"
        }
    ],
    "mainStats": {
        "sands": "EM hoặc ER%",
        "goblet": "EM hoặc Cryo DMG%",
        "circlet": "EM hoặc CRIT Rate (nếu dùng Tây Phong)",
        "note": "Sức mạnh khiên và khả năng hỗ trợ của Citlali tỷ lệ thuận với Tinh Thông Nguyên Tố (EM). Cần duy trì ER 160%+ để nộ ổn định."
    },
    "subStats": {
        "stats": [
            "Elemental Mastery (EM)",
            "Energy Recharge (ER 160-180%)",
            "CRIT Rate (khi dùng Tây Phong)",
            "ATK%"
        ],
        "note": "Ưu tiên EM tối đa để khiên dày và buff mạnh nhất, kèm đủ ER để Q luôn sẵn sàng mỗi chu kỳ."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)",
            "Đòn thường (NA)"
        ],
        "note": "E tạo khiên Itzpapa và áp Băng diện rộng. Q triệu hồi bão tuyết hỗ trợ phản ứng. NA không nâng."
    },
    "playstyleNoteVi": "Citlali là trợ thủ đắc lực cho các đội Bốc Hơi/Tan Chảy (Mavuika, Chasca, Arlecchino). Bật E tạo khiên Băng bảo vệ và áp ấn Băng liên tục ngoài sân, kích hoạt Q để kích hoạt bộ Dũng Sĩ Tro Tàn buff 40% sát thương cho chủ lực."
},

  // ── ororon ──
  "ororon": {
    "weapons": [
        {
            "weaponId": "astral-vulture-s-crimson-plumage",
            "tier": "S",
            "noteVi": "CRIT DMG cao + buff ATK% cho cung thủ Natlan"
        },
        {
            "weaponId": "elegy-for-the-end",
            "tier": "S",
            "noteVi": "Tiếng Thở Dài Vô Tận - Nạp cao + buff 100 EM và 20% ATK cho toàn đội"
        },
        {
            "weaponId": "the-stringless",
            "tier": "A",
            "noteVi": "Tuyệt Huyền - Tăng 48% sát thương E và Q ở R5"
        },
        {
            "weaponId": "favonius-warbow",
            "tier": "B",
            "noteVi": "Cung Tây Phong - Tạo hạt năng lượng dồi dào cho đội"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "scroll-of-the-hero-of-cinder-city"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Tốt nhất Natlan - Kích Dạ Hồn buff 40% Lôi và Thủy cho đội Điện Cảm"
        },
        {
            "setIds": [
                "noblesse-oblige"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Buff 20% ATK cho toàn đội"
        },
        {
            "setIds": [
                "thundering-fury"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Tăng 15% Lôi DMG và phản ứng Điện Cảm"
        },
        {
            "setIds": [
                "scroll-of-the-hero-of-cinder-city",
                "emblem-of-severed-fate"
            ],
            "mode": "2+2",
            "priority": 4,
            "noteVi": "2pc Nạp (+20% ER) + 2pc Buff/Lôi"
        }
    ],
    "mainStats": {
        "sands": "ATK% hoặc ER%",
        "goblet": "Electro DMG%",
        "circlet": "CRIT Rate hoặc CRIT DMG",
        "note": "Ororon gây sát thương Lôi off-field khi đồng đội kích hoạt Điện Cảm hoặc tiêu hao Dạ Hồn."
    },
    "subStats": {
        "stats": [
            "CRIT Rate / CRIT DMG (1:2)",
            "ATK%",
            "Energy Recharge (ER 140-160%)",
            "Elemental Mastery"
        ],
        "note": "Duy trì ER đủ để Q hồi đúng chu kỳ, sau đó dồn toàn bộ vào CRIT và ATK%."
    },
    "talentPriority": {
        "order": [
            "Nguyên tố bùng phát (Q)",
            "Kỹ năng nguyên tố (E)",
            "Đòn thường (NA)"
        ],
        "note": "Q tạo vùng áp Lôi và gây sát thương liên tục. E ném bom bóng đêm. NA không nâng."
    },
    "playstyleNoteVi": "Ororon tỏa sáng trong đội hình Điện Cảm (Electro-Charged) và đội hình Natlan. Nội tại Tự Động Kích Hoạt Đòn Đánh Khi Đồng Đội Gây Sát Thương Điện Cảm ngoài sân, vừa sạc năng lượng Dạ Hồn vừa kích hoạt bộ Dũng Sĩ Tro Tàn buff sát thương cực mạnh."
},

  // ── xianyun ──
  "xianyun": {
    "weapons": [
        {
            "weaponId": "crane-s-echoing-call",
            "tier": "S",
            "noteVi": "Trấn tốt nhất - Base ATK 741 cực đại, tăng sát thương Tấn Công Khi Rơi 28% và hồi năng lượng"
        },
        {
            "weaponId": "skyward-atlas",
            "tier": "A",
            "noteVi": "Quyển Thiên Không - Base ATK cao 674 + ATK% sub-stat dồi dào"
        },
        {
            "weaponId": "favonius-codex",
            "tier": "A",
            "noteVi": "Tây Phong - Giải quyết triệt để nhu cầu nạp Q cho Xianyun và toàn đội"
        },
        {
            "weaponId": "the-widsith",
            "tier": "B",
            "noteVi": "Tùy chọn đa dụng cho hybrid build"
        },
        {
            "weaponId": "prototype-amber",
            "tier": "B",
            "noteVi": "Mẫu Kim Phách F2P - Hỗ trợ hồi máu và nạp Q"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "viridescent-venerer"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Bóng Hình Màu Xanh - Giảm 40% Kháng nguyên tố của kẻ địch khi Khuếch Tán"
        },
        {
            "setIds": [
                "song-of-days-past"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Khúc Ca Ngày Cũ - Tăng flat damage cho đòn đánh của nhân vật đứng sân"
        },
        {
            "setIds": [
                "noblesse-oblige"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Buff 20% ATK cho toàn đội sau Q"
        },
        {
            "setIds": [
                "gladiator-s-finale",
                "shimenawa-s-reminiscence"
            ],
            "mode": "2+2",
            "priority": 4,
            "noteVi": "2pc ATK% (+18%) + 2pc ATK% (+18%) để tối đa hóa buff của Xianyun"
        }
    ],
    "mainStats": {
        "sands": "ATK% hoặc ER%",
        "goblet": "ATK%",
        "circlet": "ATK% hoặc Trị Liệu / CRIT Rate",
        "note": "Buff Tấn Công Khi Rơi của Xianyun tỷ lệ trực tiếp theo ATK tối đa (chạm mốc 4500 ATK để max buff 9000 flat DMG). Cần duy trì ER 160-200%."
    },
    "subStats": {
        "stats": [
            "Energy Recharge (ER 170-200%)",
            "ATK%",
            "Flat ATK",
            "CRIT Rate (khi mang Tây Phong)"
        ],
        "note": "Ưu tiên số 1 là ER để Q hồi mỗi chu kỳ, sau đó dồn toàn bộ vào ATK% và Flat ATK."
    },
    "talentPriority": {
        "order": [
            "Nguyên tố bùng phát (Q)",
            "Kỹ năng nguyên tố (E)",
            "Đòn thường (NA)"
        ],
        "note": "Q là kỹ năng quan trọng nhất cho phép cả đội nhảy cao và buff sát thương khi rơi. E lướt 3 lần gây sát thương và gom quái. NA không nâng."
    },
    "playstyleNoteVi": "Xianyun biến mọi nhân vật thành DPS Tấn Công Khi Rơi đỉnh cao (Xiao, Diluc, Gaming, Hu Tao). Chu kỳ: E lướt 3 lần tạo hạt -> Q kích hoạt buff và hồi máu toàn đội -> Đổi sang DPS chính nhảy và giáng đòn khi rơi liên tục."
},

  // ── wanderer ──
  "wanderer": {
    "weapons": [
        {
            "weaponId": "tulaytullah-s-remembrance",
            "tier": "S",
            "noteVi": "Trấn tốt nhất - CRIT DMG 44.1%, tăng tốc độ đánh và tăng tối đa 48% DMG Tấn Công Thường"
        },
        {
            "weaponId": "lost-prayer-to-the-sacred-winds",
            "tier": "S",
            "noteVi": "CRIT Rate 33.1%, tăng tốc chạy và tích lũy 32% Nguyên Tố DMG khi đứng sân"
        },
        {
            "weaponId": "the-widsith",
            "tier": "A",
            "noteVi": "Chương Nhạc Lang Thang - R5 cung cấp lượng buff cực khủng trong 10s"
        },
        {
            "weaponId": "solar-pearl",
            "tier": "A",
            "noteVi": "Nhật Nguyệt Hạp - Tăng CRIT Rate và tương tác hoàn hảo giữa NA và Skill"
        },
        {
            "weaponId": "favonius-codex",
            "tier": "B",
            "noteVi": "Tùy chọn F2P nạp"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "desert-pavilion-chronicle"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Trấn tốt nhất - Tăng 15% Anemo DMG, 10% Tốc đánh và 40% DMG NA/CA sau khi Trọng Kích"
        },
        {
            "setIds": [
                "shimenawa-s-reminiscence"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Tăng 18% ATK và 50% DMG NA/CA khi tiêu hao 15 năng lượng"
        },
        {
            "setIds": [
                "marechaussee-hunter"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Cực mạnh khi đi cùng Furina - Cho 36% CRIT Rate miễn phí"
        },
        {
            "setIds": [
                "desert-pavilion-chronicle",
                "gladiator-s-finale"
            ],
            "mode": "2+2",
            "priority": 4,
            "noteVi": "2pc Phong (+15% ST Phong) + 2pc ATK (+18% Tấn Công)"
        }
    ],
    "mainStats": {
        "sands": "ATK%",
        "goblet": "Anemo DMG%",
        "circlet": "CRIT Rate hoặc CRIT DMG",
        "note": "Cân bằng tỷ lệ 1:2 chuẩn KQM (CR >= 70%, CD >= 150%). Nếu đi với Faruzan C6, CRIT DMG sẽ được buff thêm 40%."
    },
    "subStats": {
        "stats": [
            "CRIT Rate / CRIT DMG (1:2)",
            "ATK%",
            "Energy Recharge (ER 110-120%)",
            "Elemental Mastery"
        ],
        "note": "Tập trung tối đa vào CRIT và ATK%. Wanderer không phụ thuộc nhiều vào Q nên không cần đầu tư nhiều ER."
    },
    "talentPriority": {
        "order": [
            "Đòn thường (NA)",
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)"
        ],
        "note": "NA là nguồn sát thương cốt lõi được khuếch đại bởi E. E tăng hệ số sát thương khi bay. Q là đòn nuke giẫm đạp kết thúc chu kỳ."
    },
    "playstyleNoteVi": "Bật E bay lên không trung, hấp thụ nguyên tố của địch/đồng đội (Hỏa +30% ATK, Băng +20% CR, Thủy +20 điểm bay, Lôi hồi năng lượng). Tung 1 đòn Trọng Kích để kích hoạt 4pc Sử Ký Sa Mạc -> Spam đòn thường liên hoàn -> Q giẫm đạp trước khi đáp đất."
},

  // ── sangonomiya-kokomi ──
  "sangonomiya-kokomi": {
    "weapons": [
        {
            "weaponId": "everlasting-moonglow",
            "tier": "S",
            "noteVi": "Vầng Trăng Bất Diệt - Trấn Kokomi tăng HP, hiệu quả trị liệu và buff NA theo HP"
        },
        {
            "weaponId": "thrilling-tales-of-dragon-slayers",
            "tier": "S",
            "noteVi": "Câu Chuyện Diệt Rồng R5 - Buff 48% ATK cho DPS kế tiếp cực kỳ giá trị"
        },
        {
            "weaponId": "prototype-amber",
            "tier": "A",
            "noteVi": "Mẫu Kim Phách R5 - Tăng HP% và hồi 18 năng lượng cho cả đội sau Q"
        },
        {
            "weaponId": "sacrificial-fragments",
            "tier": "B",
            "noteVi": "Mảnh Chương Tế Lễ - Reset vị trí E Sứa Biển trong đội hình Đóng Băng / Nilou Bloom"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "ocean-hued-clam"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Xà Cừ Đại Dương - Tối ưu DPS Sub-Healer, nổ bọt nước gây tới 30,000 sát thương vật lý mỗi 3.5s"
        },
        {
            "setIds": [
                "tenacity-of-the-millelith"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Thiên Nham - E Sứa Biển liên tục kích hoạt buff 20% ATK cho toàn đội"
        },
        {
            "setIds": [
                "maiden-beloved"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Thiếu Nữ Đáng Yêu - Hồi máu tối đa"
        },
        {
            "setIds": [
                "tenacity-of-the-millelith",
                "ocean-hued-clam"
            ],
            "mode": "2+2",
            "priority": 4,
            "noteVi": "2pc HP (+20%) + 2pc Trị Liệu (+15% Healing Bonus)"
        }
    ],
    "mainStats": {
        "sands": "HP%",
        "goblet": "Hydro DMG% hoặc HP%",
        "circlet": "Tăng Trị Liệu (Healing Bonus)",
        "note": "Kokomi có thiên phú giảm 100% CRIT Rate, KHÔNG BAO GIỜ dùng chỉ số CRIT. Nón Tăng Trị Liệu chuyển hóa thành sát thương đòn đánh trong Q nhờ nội tại A4."
    },
    "subStats": {
        "stats": [
            "HP%",
            "Energy Recharge (ER 140-160%)",
            "Flat HP",
            "Elemental Mastery (cho Bloom)"
        ],
        "note": "Dồn tuyệt đối vào HP% và ER%. Tránh mọi dòng CRIT."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)",
            "Đòn thường (NA)"
        ],
        "note": "E triệu hồi Sứa Biển hồi máu và áp Thủy diện rộng là kỹ năng quan trọng nhất. Q làm mới thời gian tồn tại của E và buff sát thương khi đứng sân. NA nâng nếu làm Driver."
    },
    "playstyleNoteVi": "Kokomi là hạt nhân trong đội hình Đóng Băng (Ayaka/Ganyu) và Nở Rộ Sum Suê (Nilou Bloom). Thả E áp Thủy liên tục không gián đoạn, đổi sang chủ lực nhận buff Câu Chuyện Diệt Rồng. Bật Q khi E sắp hết giờ để làm mới Sứa Biển và đứng sân hồi máu cho toàn đội."
},

  // ── kamisato-ayato ──
  "kamisato-ayato": {
    "weapons": [
        {
            "weaponId": "haran-geppaku-futsu",
            "tier": "S",
            "noteVi": "Trấn tốt nhất - CRIT Rate 33.1%, tăng sát thương nguyên tố và 40% DMG Tấn Công Thường"
        },
        {
            "weaponId": "mistsplitter-reforged",
            "tier": "S",
            "noteVi": "Ánh Sáng Nơi Cắt Sương - CRIT DMG 44.1% + buff Thủy DMG cực lớn"
        },
        {
            "weaponId": "primordial-jade-cutter",
            "tier": "A",
            "noteVi": "Bàn Nham Kết Lục - CRIT Rate 44.1% + tăng ATK theo HP"
        },
        {
            "weaponId": "the-black-sword",
            "tier": "A",
            "noteVi": "Kiếm Đen - CRIT Rate + tăng 40% sát thương đòn thường ở R5"
        },
        {
            "weaponId": "amenoma-kageuchi",
            "tier": "B",
            "noteVi": "Đoản Đao Amenoma F2P - Hồi năng lượng Q hữu hiệu"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "echoes-of-an-offering"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Dư Âm Tế Lễ - Tăng 70% ATK flat damage cho Tấn Công Thường (yêu cầu ping < 80ms)"
        },
        {
            "setIds": [
                "heart-of-depth"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Trái Tim Trầm Luân - Tăng 15% Thủy DMG và 30% DMG Tấn Công Thường sau khi dùng E"
        },
        {
            "setIds": [
                "gladiator-s-finale"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Giác Đấu Sĩ - Tăng 18% ATK và 35% DMG Tấn Công Thường cực kỳ ổn định"
        },
        {
            "setIds": [
                "heart-of-depth",
                "gladiator-s-finale"
            ],
            "mode": "2+2",
            "priority": 4,
            "noteVi": "2pc Thủy (+15% ST Thủy) + 2pc ATK (+18% Tấn Công)"
        }
    ],
    "mainStats": {
        "sands": "ATK%",
        "goblet": "Hydro DMG%",
        "circlet": "CRIT Rate hoặc CRIT DMG",
        "note": "Ayato có sát thương E tăng nhẹ theo HP tối đa nhờ Sóng Sánh, nhưng ATK% Sands luôn cho DPS cao hơn HP% Sands."
    },
    "subStats": {
        "stats": [
            "CRIT Rate / CRIT DMG (1:2)",
            "ATK%",
            "Energy Recharge (ER 120-130%)",
            "HP%",
            "Elemental Mastery"
        ],
        "note": "Cân bằng CR/CD chuẩn (CR >= 70%, CD >= 150%), duy trì ER khoảng 130% để Q hồi đều đặn."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)",
            "Đòn thường (NA)"
        ],
        "note": "E Soukai Kanka biến đòn đánh thành Thuấn Thủy Kiếm là 80% sát thương của Ayato (tính theo talent level của E, KHÔNG phụ thuộc talent level của NA). Q tạo mưa Thủy diện rộng buff NA. NA không cần nâng."
    },
    "playstyleNoteVi": "Khai mở Q tạo vùng mưa Thủy diện rộng và buff 20% sát thương đòn thường cho đồng đội -> Đồng đội bật buff -> Ayato nhấn E giữ nút tấn công chém 15 nhát Thuấn Thủy Kiếm xé toạc kẻ địch trong 6 giây."
},

  // ── shenhe ──
  "shenhe": {
    "weapons": [
        {
            "weaponId": "calamity-queller",
            "tier": "S",
            "noteVi": "Hủy Diệt - Base ATK 741 cao nhất game + passive tăng tối đa ATK% khi off-field"
        },
        {
            "weaponId": "engulfing-lightning",
            "tier": "A",
            "noteVi": "Đoạn Thảo Trường Đao - ER cực cao và chuyển hóa ER thành ATK%"
        },
        {
            "weaponId": "favonius-lance",
            "tier": "A",
            "noteVi": "Thương Tây Phong - Tốt nhất cho độ mượt của đội hình, tạo hạt trắng dồi dào"
        },
        {
            "weaponId": "skyward-spine",
            "tier": "B",
            "noteVi": "Xương Sống Thiên Không - Base ATK cao 674 và cung cấp ER"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "noblesse-oblige"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Tông Thất - Buff 20% ATK cho Ayaka/Ganyu sau Q"
        },
        {
            "setIds": [
                "gladiator-s-finale",
                "shimenawa-s-reminiscence"
            ],
            "mode": "2+2",
            "priority": 2,
            "noteVi": "2pc ATK% (+18%) + 2pc ATK% (+18%) - Tối đa hóa chỉ số ATK để buff Băng Linh Icy Quills mạnh nhất"
        },
        {
            "setIds": [
                "blizzard-strayer"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Dùng cho Sub-DPS Băng cá nhân"
        }
    ],
    "mainStats": {
        "sands": "ATK% hoặc ER%",
        "goblet": "ATK%",
        "circlet": "ATK% (hoặc CRIT Rate khi dùng Thương Tây Phong)",
        "note": "Băng Linh (Icy Quills) của Shenhe cộng thẳng sát thương phẳng vào đòn đánh Băng của đồng đội tỷ lệ theo 100% ATK của Shenhe. Đẩy ATK càng cao càng tốt (mục tiêu 3500 - 4000+ ATK)."
    },
    "subStats": {
        "stats": [
            "ATK%",
            "Energy Recharge (ER 160-180%)",
            "Flat ATK",
            "CRIT Rate (đạt 40%+ nếu dùng Tây Phong)"
        ],
        "note": "Ưu tiên ATK% và ER%. Cần 160-180% ER để nộ mỗi chu kỳ (Q cost 80)."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)",
            "Đòn thường (NA)"
        ],
        "note": "E kích hoạt Băng Linh Icy Quills là kỹ năng quan trọng số 1. Q giảm kháng Băng/Vật Lý và tăng sát thương Băng. NA không nâng."
    },
    "playstyleNoteVi": "Shenhe biến mọi chủ lực Băng (Ayaka, Ganyu, Wriothesley) thành quái vật dồn sát thương. Nhấn E (5 stack Icy Quills, buff 15% Skill/Burst DMG) hoặc Giữ E (7 stack, buff 15% NA/CA DMG). Q giảm kháng và áp Băng diện rộng."
},

  // ── tartaglia ──
  "tartaglia": {
    "weapons": [
        {
            "weaponId": "polar-star",
            "tier": "S",
            "noteVi": "Ngôi Sao Cực Đông - Trấn Tartaglia, CRIT Rate 33.1% + stack tăng 48% ATK và buff E/Q"
        },
        {
            "weaponId": "thundering-pulse",
            "tier": "S",
            "noteVi": "Sấm Sét Rung Động - CRIT DMG 66.2% + buff ATK% và sát thương đòn đánh"
        },
        {
            "weaponId": "aqua-simulacra",
            "tier": "A",
            "noteVi": "Nhược Thủy - CRIT DMG 88.2% + 20% DMG toàn diện"
        },
        {
            "weaponId": "skyward-harp",
            "tier": "A",
            "noteVi": "Cánh Thiên Không - Cung cấp cả CRIT Rate lẫn CRIT DMG cân bằng"
        },
        {
            "weaponId": "the-viridescent-hunt",
            "tier": "B",
            "noteVi": "Cung Sắc Xanh Điểm Danh - CRIT Rate + lốc xoáy gom quái nhỏ cực kỳ tiện lợi"
        },
        {
            "weaponId": "rust",
            "tier": "B",
            "noteVi": "Cung Rỉ Sét - Tăng đến 80% DMG Tấn Công Thường ở R5"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "nymph-s-dream"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Giấc Mộng Thủy Tiên - Bộ tối ưu nhất, tăng tối đa 30% Thủy DMG và 25% ATK"
        },
        {
            "setIds": [
                "heart-of-depth"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Trái Tim Trầm Luân - Tăng 15% Thủy DMG và 30% DMG NA/CA sau khi bật E"
        },
        {
            "setIds": [
                "heart-of-depth",
                "gladiator-s-finale"
            ],
            "mode": "2+2",
            "priority": 3,
            "noteVi": "2pc Thủy (+15% ST Thủy) + 2pc ATK (+18% Tấn Công)"
        }
    ],
    "mainStats": {
        "sands": "ATK%",
        "goblet": "Hydro DMG%",
        "circlet": "CRIT Rate hoặc CRIT DMG",
        "note": "Tartaglia không có ICD trên Đoạn Lưu (Riptide), áp Thủy cực nhanh nên cần CRIT Rate cao (>= 75%) để kích hoạt Đoạn Lưu liên tục."
    },
    "subStats": {
        "stats": [
            "CRIT Rate / CRIT DMG (1:2)",
            "ATK%",
            "Elemental Mastery (EM 80-120 cho nuke Q Bốc Hơi)",
            "Energy Recharge (ER 120%)"
        ],
        "note": "CRIT Rate cực kỳ quan trọng. Thêm một chút EM giúp chiêu Q dạng Cận Chiến kích Bốc Hơi hàng trăm ngàn sát thương nuke."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)",
            "Đòn thường (NA)"
        ],
        "note": "E chuyển sang song đao Cận Chiến là nguồn sát thương và áp Thủy chính. Q nuke bộc phát sát thương cực lớn. NA nâng để tăng sát thương Đoạn Lưu."
    },
    "playstyleNoteVi": "Tartaglia là linh hồn của đội hình International (Tartaglia + Xiangling + Kazuha + Bennett). Áp Thủy kép bằng E, kích nuke Q dạng Tầm Xa (hoặc Cận Chiến) Bốc Hơi, sau đó chém E liên hoàn tạo phản ứng Đoạn Lưu nổ dây chuyền cho Pyronado của Xiangling liên tục Bốc Hơi x2.0."
},

  // ── lyney ──
  "lyney": {
    "weapons": [
        {
            "weaponId": "the-first-great-magic",
            "tier": "S",
            "noteVi": "Ảo Thuật Đầu Tiên - Trấn Lyney, CRIT DMG 66.2% + buff ATK% và Tốc chạy theo đồng đội hệ Hỏa"
        },
        {
            "weaponId": "aqua-simulacra",
            "tier": "S",
            "noteVi": "Nhược Thủy - CRIT DMG 88.2% + 20% DMG toàn diện"
        },
        {
            "weaponId": "thundering-pulse",
            "tier": "A",
            "noteVi": "CRIT DMG 66.2% + Base ATK cao"
        },
        {
            "weaponId": "song-of-stillness",
            "tier": "B",
            "noteVi": "Cung rèn F2P Fontaine - Tăng đến 32% DMG sau khi nhận hồi máu"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "marechaussee-hunter"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Thợ Săn Marechaussee - Tự động thay đổi HP khi bắn Mũ Mèo Cười cho 36% CRIT Rate miễn phí"
        },
        {
            "setIds": [
                "lavawalker"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Hiền Giả Bốc Lửa - Tăng 35% DMG lên kẻ địch dính ấn Hỏa (Mono Pyro)"
        },
        {
            "setIds": [
                "crimson-witch-of-flames",
                "gladiator-s-finale"
            ],
            "mode": "2+2",
            "priority": 3,
            "noteVi": "2pc Hỏa (+15% ST Hỏa) + 2pc ATK (+18% Tấn Công)"
        }
    ],
    "mainStats": {
        "sands": "ATK%",
        "goblet": "Pyro DMG%",
        "circlet": "CRIT DMG (bộ Thợ Săn đã cho 36% CR)",
        "note": "Lyney tối ưu hóa sức mạnh trong đội hình Đơn Hỏa (Mono-Pyro với Bennett, Xiangling, Dehya, Kazuha/Zhongli). Nón luôn chọn CRIT DMG."
    },
    "subStats": {
        "stats": [
            "CRIT DMG",
            "CRIT Rate (đạt ~50-60% trước khi tính 4pc Marechaussee)",
            "ATK%",
            "Energy Recharge (ER 120%)"
        ],
        "note": "Dồn chỉ số vào CRIT DMG và ATK%. Không cần EM vì lối chơi chủ đạo là Đơn Hỏa."
    },
    "talentPriority": {
        "order": [
            "Đòn thường (NA)",
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)"
        ],
        "note": "Trọng kích Mũ Mèo Cười thuộc NA là nguồn sát thương cốt lõi. E nuke dồn sát thương khi tích đủ stack Đạo Cụ. Q hóa mèo biểu diễn."
    },
    "playstyleNoteVi": "Lyney bắn Trọng Kích tạo Mũ Mèo Cười khiêu khích quái và tích tầng Đạo Cụ (tiêu hao HP nếu HP > 60%). Khi tích đủ 4-5 tầng, kích hoạt E nổ bùng sát thương diện rộng và hồi máu cho Lyney."
},

  // ── wriothesley ──
  "wriothesley": {
    "weapons": [
        {
            "weaponId": "cashflow-supervision",
            "tier": "S",
            "noteVi": "Giám Sát Dòng Tiền - Trấn Wriothesley, CRIT Rate 22.1% + buff ATK và tăng đến 48% DMG NA/CA khi HP biến động"
        },
        {
            "weaponId": "tulaytullah-s-remembrance",
            "tier": "A",
            "noteVi": "Hồi Ức Tulaytullah - CRIT DMG 44.1% + tăng tốc độ đấm và sát thương NA"
        },
        {
            "weaponId": "lost-prayer-to-the-sacred-winds",
            "tier": "A",
            "noteVi": "Điển Tích Tây Phong - CRIT Rate 33.1% + tăng tốc chạy và Băng DMG khi đứng sân"
        },
        {
            "weaponId": "the-widsith",
            "tier": "B",
            "noteVi": "Chương Nhạc Lang Thang F2P - Cực mạnh trong đội hình Tan Chảy (Melt)"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "marechaussee-hunter"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Thợ Săn Marechaussee - Tự động rút HP khi đấm E, kích hoạt trọn vẹn 36% CRIT Rate"
        },
        {
            "setIds": [
                "blizzard-strayer"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Dũng Sĩ Băng Giá - Dành riêng cho đội hình Đóng Băng (Freeze)"
        },
        {
            "setIds": [
                "shimenawa-s-reminiscence"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Dòng Hồi Ức - Tăng 50% DMG đòn đánh thường và trọng kích"
        },
        {
            "setIds": [
                "blizzard-strayer",
                "gladiator-s-finale"
            ],
            "mode": "2+2",
            "priority": 4,
            "noteVi": "2pc Băng (+15% ST Băng) + 2pc ATK (+18% Tấn Công)"
        }
    ],
    "mainStats": {
        "sands": "ATK%",
        "goblet": "Cryo DMG%",
        "circlet": "CRIT DMG (bộ Marechaussee đã cho 36% CR)",
        "note": "Wriothesley tự rút máu mỗi cú đấm trong trạng thái E, tự động kích hoạt tối đa hiệu ứng bộ Thợ Săn Marechaussee."
    },
    "subStats": {
        "stats": [
            "CRIT DMG",
            "CRIT Rate (đạt 45-60% trước buff)",
            "ATK%",
            "Elemental Mastery (nếu chơi Tan Chảy)",
            "Energy Recharge"
        ],
        "note": "Cực kỳ thích hợp chơi Tan Chảy cùng Thoma/Xiangling/Nahida, khi đó 100-150 EM đem lại lượng sát thương đột biến."
    },
    "talentPriority": {
        "order": [
            "Đòn thường (NA)",
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)"
        ],
        "note": "NA là nắm đấm sát thương chính. E gia tăng sát thương cho từng cú đấm. Q nuke 5 cú đấm liên hoàn kết thúc combo."
    },
    "playstyleNoteVi": "Bật E gia tăng sát thương quyền cước, liên tục tung combo 5 đòn thường đấm bốc cận chiến. Khi HP giảm xuống dưới 60%, kích hoạt đòn Trọng Kích cường hóa miễn phí hồi phục 30% HP và gây sát thương Băng cực lớn."
},

  // ── chevreuse ──
  "chevreuse": {
    "weapons": [
        {
            "weaponId": "rightful-reward",
            "tier": "S",
            "noteVi": "Phần Thưởng Của Công Lý - Thương rèn Fontaine tăng HP% và hồi phục năng lượng cho Chevreuse"
        },
        {
            "weaponId": "black-tassel",
            "tier": "A",
            "noteVi": "Hắc Anh Thương 3★ - Tăng đến 46.9% HP giúp dễ dàng đạt mốc 40,000 HP tối đa"
        },
        {
            "weaponId": "favonius-lance",
            "tier": "A",
            "noteVi": "Thương Tây Phong - Cung cấp hạt năng lượng cho đội hình Hỏa / Lôi"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "noblesse-oblige"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Tông Thất - Buff thêm 20% ATK cho toàn đội sau khi dùng Q"
        },
        {
            "setIds": [
                "song-of-days-past"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Khúc Ca Ngày Cũ - Tăng sát thương phẳng cho DPS đứng sân dựa trên lượng hồi máu"
        },
        {
            "setIds": [
                "tenacity-of-the-millelith",
                "vourukasha-s-glow"
            ],
            "mode": "2+2",
            "priority": 3,
            "noteVi": "2pc HP (+20%) + 2pc HP (+20%) - Đảm bảo chạm mốc 40,000 HP dễ dàng nhất"
        }
    ],
    "mainStats": {
        "sands": "HP%",
        "goblet": "HP%",
        "circlet": "HP% (hoặc Tăng Trị Liệu / CRIT Rate)",
        "note": "MỤC TIÊU CỐT LÕI: Đạt mốc 40,000 HP tối đa để kích hoạt tối đa thiên phú buff 40% ATK cho đồng đội Hỏa và Lôi (mỗi 1000 HP cho 1% ATK)."
    },
    "subStats": {
        "stats": [
            "HP%",
            "Flat HP",
            "Energy Recharge (ER 140-160%)",
            "CRIT Rate (khi dùng Tây Phong)"
        ],
        "note": "Tập trung toàn bộ vào HP để đạt mốc 40,000 HP. Cần một lượng ER vừa phải nếu muốn dùng Q mỗi chu kỳ."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)",
            "Đòn thường (NA)"
        ],
        "note": "E bắn súng tạo hồi máu và kích hoạt buff ATK cho đội là kỹ năng quan trọng nhất. Q ném lựu đạn gây sát thương và gom nhẹ quái. NA không nâng."
    },
    "playstyleNoteVi": "Chevreuse là bá chủ trong đội hình Quá Tải thuần Hỏa-Lôi (Raiden, Clorinde, Yoimiya, Xiangling). ĐIỀU KIỆN TIÊN QUYẾT: Đội hình CHỈ GỒM nhân vật Hỏa và Lôi để kích hoạt nội tại Giảm 40% Kháng Hỏa và Lôi của kẻ địch (thay thế hoàn toàn Kazuha VV). Khi xảy ra Quá Tải, nhấn giữ E bắn Đạn Tầm Cao nạp buff 40% ATK cho toàn đội."
},

  // ── emilie ──
  "emilie": {
    "weapons": [
        {
            "weaponId": "lumidouce-elegy",
            "tier": "S",
            "noteVi": "Khúc Ca Hòa Nhã - Trấn Emilie, CRIT Rate 33.1% + buff ATK% và tăng sát thương khi kẻ địch bị Thiêu Đốt"
        },
        {
            "weaponId": "staff-of-homa",
            "tier": "S",
            "noteVi": "Trượng Homa - CRIT DMG 66.2% + buff ATK dồi dào"
        },
        {
            "weaponId": "calamity-queller",
            "tier": "A",
            "noteVi": "Hủy Diệt - Base ATK cực cao và tăng ATK khi ở ngoài sân"
        },
        {
            "weaponId": "ballad-of-the-fjords",
            "tier": "A",
            "noteVi": "Vịnh Hẹp Hoa Tiêu - CRIT Rate 27.6% + buff EM khi đội có 3 nguyên tố khác nhau"
        },
        {
            "weaponId": "favonius-lance",
            "tier": "B",
            "noteVi": "Thương Tây Phong - Tùy chọn nạp F2P"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "unfinished-reverie"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Ảo Mộng Chưa Hoàn Thành - Tăng 50% DMG toàn diện khi kẻ địch bị Thiêu Đốt (Burning)"
        },
        {
            "setIds": [
                "deepwood-memories"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Ký Ức Rừng Sâu - Giảm 30% Thảo RES nếu không có đồng đội khác mang"
        },
        {
            "setIds": [
                "unfinished-reverie",
                "gladiator-s-finale"
            ],
            "mode": "2+2",
            "priority": 3,
            "noteVi": "2pc ATK (+18%) + 2pc Thảo (+15% ST Thảo)"
        }
    ],
    "mainStats": {
        "sands": "ATK%",
        "goblet": "Dendro DMG%",
        "circlet": "CRIT Rate hoặc CRIT DMG",
        "note": "Toàn bộ sát thương Chiết Xuất Nước Hoa của Emilie tỷ lệ theo ATK (mục tiêu 2200+ ATK). Cần duy trì kẻ địch bị Thiêu Đốt để hộp hương nâng lên Cấp 2."
    },
    "subStats": {
        "stats": [
            "CRIT Rate / CRIT DMG (1:2)",
            "ATK%",
            "Energy Recharge (ER 120-130%)",
            "Elemental Mastery"
        ],
        "note": "Emilie là Sub-DPS gây sát thương thuần, tập trung dồn chỉ số vào CRIT và ATK% tương tự Yelan hoặc Fischl."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)",
            "Đòn thường (NA)"
        ],
        "note": "E đặt Hộp Hương Lumidouce là nguồn 80% sát thương ngoài sân. Q làm mới Hộp Hương và thả giọt hương thơm cực mạnh. NA không nâng."
    },
    "playstyleNoteVi": "Emilie kết hợp hoàn hảo với các đội hình có yếu tố Thiêu Đốt (Kinich, Mavuika, Wriothesley Melt, Ganyu Burnmelt). Đặt E ngoài sân, khi kẻ địch bị Thiêu Đốt hộp hương sẽ thăng cấp bắn đạn liên hoàn gây sát thương Thảo cực lớn."
},

  // ── nilou ──
  "nilou": {
    "weapons": [
        {
            "weaponId": "key-of-khaj-nisut",
            "tier": "S",
            "noteVi": "Chìa Khóa Khaj-Nisut - Trấn Nilou, tăng 66.2% HP và chia sẻ EM khổng lồ cho toàn đội"
        },
        {
            "weaponId": "the-dockhand-s-assistant",
            "tier": "A",
            "noteVi": "Thợ Lặn Kỳ Bí - Kiếm 4★ tăng HP% tốt nhất cho Nilou"
        },
        {
            "weaponId": "iron-sting",
            "tier": "B",
            "noteVi": "Thiết Phong Kích F2P - Tăng Tinh Thông Nguyên Tố"
        },
        {
            "weaponId": "favonius-sword",
            "tier": "B",
            "noteVi": "Tây Phong Kiếm - Hỗ trợ nạp Q cho đội"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "tenacity-of-the-millelith",
                "vourukasha-s-glow"
            ],
            "mode": "2+2",
            "priority": 1,
            "noteVi": "2pc HP (+20%) + 2pc HP (+20%) - Tối đa hóa chỉ số HP để đạt mốc trần 74,400 HP"
        },
        {
            "setIds": [
                "flower-of-paradise-lost"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Đóa Hoa Thiên Đường Đã Mất - Tăng tối đa sát thương phản ứng Nở Rộ"
        },
        {
            "setIds": [
                "gilded-dreams"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Giấc Mộng Hoàng Kim - Tăng lượng lớn Tinh Thông Nguyên Tố"
        }
    ],
    "mainStats": {
        "sands": "HP%",
        "goblet": "HP%",
        "circlet": "HP%",
        "note": "MỤC TIÊU TRẦN: 74,400 HP tối đa. Mỗi 1000 HP vượt mốc 30,000 HP sẽ tăng 9% sát thương Hạt Nhân Căng Tràn (tối đa buff 400% DMG Hạt Nở Rộ)."
    },
    "subStats": {
        "stats": [
            "HP%",
            "Flat HP",
            "Elemental Mastery (EM)",
            "Energy Recharge"
        ],
        "note": "Dồn 100% tài nguyên vào HP% và Flat HP trên cả 5 món thánh di vật."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)",
            "Đòn thường (NA)"
        ],
        "note": "E kích hoạt Vũ Điệu Xoay Vòng và Vòng Nước Thanh Tẩy là kỹ năng cốt lõi. Q tạo hai đợt sát thương Thủy diện rộng. NA không nâng."
    },
    "playstyleNoteVi": "QUY TẮC BẮT BUỘC: Đội hình CHỈ GỒM DUY NHẤT nhân vật Thủy và Thảo (Nilou + Nahida/Baizhu/Alhaitham/Kokomi). Nhấn E 3 lần tạo Vòng Nước Thanh Tẩy quanh người, biến Hạt Thảo bình thường thành Hạt Nhân Căng Tràn nổ tức thì với bán kính cực rộng và sát thương hủy diệt hàng chục ngàn sát thương diện rộng."
},

  // ── yae-miko ──
  "yae-miko": {
    "weapons": [
        {
            "weaponId": "kagura-s-verity",
            "tier": "S",
            "noteVi": "Chân Ý Của Kagura - Trấn Yae Miko, CRIT DMG 66.2% + tích 3 stack tăng 36% Skill DMG và 12% Elemental DMG"
        },
        {
            "weaponId": "lost-prayer-to-the-sacred-winds",
            "tier": "A",
            "noteVi": "CRIT Rate 33.1% + Base ATK cao"
        },
        {
            "weaponId": "the-widsith",
            "tier": "A",
            "noteVi": "Chương Nhạc Lang Thang R5 - CRIT DMG cao và buff nổ bộc phát kinh hoàng"
        },
        {
            "weaponId": "solar-pearl",
            "tier": "B",
            "noteVi": "Nhật Nguyệt Hạp - CRIT Rate ổn định"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "golden-troupe"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Đoàn Kịch Hoàng Kim - Tăng tới 70% sát thương cho 3 trụ Sesshou Sakura ngoài sân"
        },
        {
            "setIds": [
                "gilded-dreams"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Giấc Mộng Hoàng Kim - Tăng ATK và EM trong đội hình Sinh Trưởng (Aggravate)"
        },
        {
            "setIds": [
                "thundering-fury",
                "gladiator-s-finale"
            ],
            "mode": "2+2",
            "priority": 3,
            "noteVi": "2pc Lôi (+15% ST Lôi) + 2pc ATK (+18% Tấn Công)"
        }
    ],
    "mainStats": {
        "sands": "ATK% hoặc EM",
        "goblet": "Electro DMG%",
        "circlet": "CRIT Rate hoặc CRIT DMG",
        "note": "Yae Miko có thiên phú tăng sát thương Sesshou Sakura theo EM (mỗi điểm EM tăng 0.15% DMG), trong đội Aggravate Đồng hồ EM hoàn toàn có thể cạnh tranh với ATK%."
    },
    "subStats": {
        "stats": [
            "CRIT Rate / CRIT DMG (1:2)",
            "ATK%",
            "Elemental Mastery (EM 100-150)",
            "Energy Recharge (ER 130-140%)"
        ],
        "note": "Cân bằng CR/CD chuẩn (CR >= 70%, CD >= 150%)."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)",
            "Đòn thường (NA)"
        ],
        "note": "E cắm 3 trụ Sát Sinh Anh là nguồn 70% sát thương của Yae. Q nuke 4 tia sét Thiên Hồ cực mạnh (hệ số lên tới 2000%+). NA nâng nếu đứng sân đánh thường."
    },
    "playstyleNoteVi": "Chu kỳ E-E-E lướt cắm 3 trụ tam giác giật sét tự động ngoài sân. Kết hợp cùng Thảo (Nahida, Alhaitham) để kích hoạt phản ứng Tăng Cường (Aggravate). Khi Q sẵn sàng, nổ Q phá hủy 3 trụ giáng 4 đòn sấm sét rồi lập tức E-E-E tái tạo trụ mới."
},

  // ── tighnari ──
  "tighnari": {
    "weapons": [
        {
            "weaponId": "hunter-s-path",
            "tier": "S",
            "noteVi": "Con Đường Thợ Săn - Trấn Tighnari, CRIT Rate 44.1% + buff sát thương Trọng Kích cực lớn theo EM"
        },
        {
            "weaponId": "the-first-great-magic",
            "tier": "S",
            "noteVi": "CRIT DMG 66.2% + buff ATK%"
        },
        {
            "weaponId": "aqua-simulacra",
            "tier": "A",
            "noteVi": "Nhược Thủy - CRIT DMG 88.2% + 20% DMG toàn diện"
        },
        {
            "weaponId": "slingshot",
            "tier": "A",
            "noteVi": "Ná Bắn Chim 3★ - CRIT Rate 31.2% + tăng 60% DMG đòn bắn gần, cực kỳ mạnh và rẻ cho F2P"
        },
        {
            "weaponId": "the-stringless",
            "tier": "B",
            "noteVi": "Tuyệt Huyền - Tăng EM và buff sát thương E/Q"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "gilded-dreams"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Giấc Mộng Hoàng Kim - Tăng lượng lớn EM và ATK trong đội hình Lan Tràn (Spread)"
        },
        {
            "setIds": [
                "wanderer-s-troupe"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Đoàn Hát Lang Thang - Tăng 80 EM và 35% sát thương Đòn Trọng Kích Mũi Tên Hoa Đực"
        },
        {
            "setIds": [
                "deepwood-memories"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Giảm 30% Thảo RES nếu không có đồng đội khác mang"
        },
        {
            "setIds": [
                "deepwood-memories",
                "gilded-dreams"
            ],
            "mode": "2+2",
            "priority": 4,
            "noteVi": "2pc Thảo (+15% ST Thảo) + 2pc EM (+80 Tinh Thông)"
        }
    ],
    "mainStats": {
        "sands": "EM hoặc ATK%",
        "goblet": "Dendro DMG%",
        "circlet": "CRIT Rate hoặc CRIT DMG",
        "note": "Sát thương Trọng Kích và Q của Tighnari tăng mạnh theo Tinh Thông Nguyên Tố nhờ nội tại A4 (mỗi EM tăng 0.06% DMG, max 80%). Đồng hồ EM luôn là lựa chọn hàng đầu."
    },
    "subStats": {
        "stats": [
            "CRIT Rate / CRIT DMG (1:2)",
            "Elemental Mastery (EM 250-350+)",
            "ATK%",
            "Energy Recharge (ER 120%)"
        ],
        "note": "Ưu tiên CRIT và EM. Q chỉ tốn 40 năng lượng nên gần như không bao giờ thiếu nạp."
    },
    "talentPriority": {
        "order": [
            "Đòn thường (NA)",
            "Nguyên tố bùng phát (Q)",
            "Kỹ năng nguyên tố (E)"
        ],
        "note": "NA tăng sát thương Trọng Kích Bão Tiễn Hoa Đực là nguồn sát thương số 1. Q bắn 6 mũi tên Thảo tự tìm mục tiêu. E ném bom gây ảo giác và giảm thời gian tụ lực."
    },
    "playstyleNoteVi": "Tighnari là DPS Đổi Nhanh (Quickswap) đỉnh cao kết hợp cùng Yae Miko, Fischl, Zhongli, Nahida. Chu kỳ cực nhanh trong 4 giây: E ném bom tạo ảo giác -> Bắn 3 phát Trọng Kích thần tốc không cần tụ lực -> Q bắn mưa tên Thảo Lan Tràn -> Đổi nhân vật."
},

  // ── faruzan ──
  "faruzan": {
    "weapons": [
        {
            "weaponId": "elegy-for-the-end",
            "tier": "S",
            "noteVi": "Tiếng Thở Dài Vô Tận - Nạp cao + buff 100 EM và 20% ATK cho chủ lực Phong"
        },
        {
            "weaponId": "favonius-warbow",
            "tier": "S",
            "noteVi": "Cung Tây Phong - Vũ khí thiết yếu nhất giải quyết cơn khát năng lượng của Faruzan"
        },
        {
            "weaponId": "sacrificial-bow",
            "tier": "A",
            "noteVi": "Cung Tế Lễ - Cung cấp lượng lớn nạp và reset E"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "noblesse-oblige"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Tông Thất - Buff 20% ATK cho Xiao / Wanderer sau Q"
        },
        {
            "setIds": [
                "tenacity-of-the-millelith"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Thiên Nham (YÊU CẦU C6) - Hố đen kích nổ liên tục ngoài sân duy trì 100% uptime buff 20% ATK"
        },
        {
            "setIds": [
                "viridescent-venerer"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Bóng Hình Màu Xanh - Hỗ trợ giảm kháng nguyên tố phụ cho đội hình kép"
        },
        {
            "setIds": [
                "emblem-of-severed-fate",
                "viridescent-venerer"
            ],
            "mode": "2+2",
            "priority": 4,
            "noteVi": "2pc Nạp (+20% ER) + 2pc Phong"
        }
    ],
    "mainStats": {
        "sands": "Energy Recharge (ER%)",
        "goblet": "Anemo DMG% hoặc ATK%",
        "circlet": "CRIT Rate (để kích hoạt Tây Phong)",
        "note": "YÊU CẦU NĂNG LƯỢNG SỐ 1: Faruzan trước C6 cần từ 280% - 300%+ ER! Đạt C6 giảm xuống còn 200-220% ER. Luôn dùng Đồng hồ Nạp và Nón CRIT Rate."
    },
    "subStats": {
        "stats": [
            "Energy Recharge (ER tối đa)",
            "CRIT Rate (đạt 50%+ cho Tây Phong)",
            "ATK%",
            "CRIT DMG"
        ],
        "note": "Đẩy ER lên cao nhất có thể. Dưới C6, mọi chỉ số khác đều xếp sau ER."
    },
    "talentPriority": {
        "order": [
            "Nguyên tố bùng phát (Q)",
            "Kỹ năng nguyên tố (E)",
            "Đòn thường (NA)"
        ],
        "note": "Q tung Khối Đa Diện áp giải phóng Gió Giảm Kháng Phong 30% và Buff Sát Thương Phong cho đội là kỹ năng tối thượng. E tạo hố đen. NA không nâng."
    },
    "playstyleNoteVi": "Faruzan là mảnh ghép bắt buộc nâng tầm Xiao, Wanderer, Heizou. Khối Đa Diện từ chiêu Q di chuyển hình tam giác liên tục giảm 30% Kháng Phong của kẻ địch và buff sát thương Phong trực tiếp cho chủ lực."
},

  // ── gaming ──
  "gaming": {
    "weapons": [
        {
            "weaponId": "verdict",
            "tier": "S",
            "noteVi": "Phán Quyết - Base ATK 674, CRIT Rate 22.1% + buff sát thương Kỹ năng nguyên tố"
        },
        {
            "weaponId": "serpent-spine",
            "tier": "S",
            "noteVi": "Kiếm Ly Cốt - Tăng tối đa 50% DMG toàn diện cực mạnh cho Gaming"
        },
        {
            "weaponId": "beacon-of-the-reed-sea",
            "tier": "A",
            "noteVi": "Hải Đăng Bờ Biển Lau - CRIT Rate 33.1% + buff lượng lớn ATK"
        },
        {
            "weaponId": "rainslasher",
            "tier": "B",
            "noteVi": "Vũ Tài F2P - Tăng EM và 36% DMG lên kẻ địch dính Thủy (Bốc Hơi)"
        },
        {
            "weaponId": "tidal-shadow",
            "tier": "B",
            "noteVi": "Bóng Râm Sóng Nước F2P - Tăng đến 48% ATK sau khi nhận hồi máu"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "marechaussee-hunter"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Thợ Săn Marechaussee - Tự động rút và hồi máu liên tục khi nhảy múa kích hoạt trọn vẹn 36% CRIT Rate"
        },
        {
            "setIds": [
                "crimson-witch-of-flames"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Diệm Liệt Ma Nữ - Tăng tối đa sát thương phản ứng Bốc Hơi / Tan Chảy"
        },
        {
            "setIds": [
                "crimson-witch-of-flames",
                "gladiator-s-finale"
            ],
            "mode": "2+2",
            "priority": 3,
            "noteVi": "2pc Hỏa (+15% ST Hỏa) + 2pc ATK (+18% Tấn Công)"
        }
    ],
    "mainStats": {
        "sands": "ATK% hoặc EM",
        "goblet": "Pyro DMG%",
        "circlet": "CRIT DMG (bộ Marechaussee đã cho 36% CR)",
        "note": "Gaming luôn chơi kèm phản ứng Bốc Hơi/Tan Chảy (Vaporize/Melt). Nếu đồng đội đã buff nhiều ATK (Bennett), Đồng hồ EM sẽ cho sát thương cao hơn hẳn ATK%."
    },
    "subStats": {
        "stats": [
            "CRIT DMG",
            "CRIT Rate (đạt 45-55% với Marechaussee)",
            "Elemental Mastery (EM 120-200)",
            "ATK%",
            "Energy Recharge (ER 120%)"
        ],
        "note": "Cực kỳ ăn ý khi đi cùng Xianyun và Furina tạo thành bộ ba hủy diệt La Hoàn."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)",
            "Đòn thường (NA)"
        ],
        "note": "E Tấn Công Khi Rơi Đạp Đất Nghê Thú là 90% sát thương của Gaming (scale theo Talent Level của E, không phụ thuộc NA). Q triệu hồi Man Chai hồi lại E liên tục. NA không nâng."
    },
    "playstyleNoteVi": "Bật Q triệu hồi Man Chai, khi Man Chai chạy về chạm vào Gaming sẽ làm mới ngay lập tức hồi chiêu của E. Gaming liên tục tung E bay lên không trung giáng cú Đạp Đất Nghê Thú Bốc Hơi hàng trăm ngàn sát thương diện rộng."
},

  // ── dehya ──
  "dehya": {
    "weapons": [
        {
            "weaponId": "beacon-of-the-reed-sea",
            "tier": "S",
            "noteVi": "Hải Đăng Bờ Biển Lau - Trấn Dehya, CRIT Rate 33.1% + tăng ATK và HP khi chịu sát thương"
        },
        {
            "weaponId": "wolf-s-gravestone",
            "tier": "A",
            "noteVi": "Đường Cùng Của Sói - Cung cấp lượng lớn ATK cho Dehya và buff toàn đội"
        },
        {
            "weaponId": "serpent-spine",
            "tier": "A",
            "noteVi": "Kiếm Ly Cốt - Tăng CRIT Rate và sát thương tổng"
        },
        {
            "weaponId": "favonius-greatsword",
            "tier": "B",
            "noteVi": "Đại Kiếm Tây Phong - Tốt nhất cho build Support chống gián đoạn và nạp năng lượng"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "vourukasha-s-glow"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Vầng Sáng Vourukasha - Tăng HP và tối đa 50% sát thương E/Q khi Dehya nhận sát thương từ Ranh Giới Lửa"
        },
        {
            "setIds": [
                "emblem-of-severed-fate"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Dấu Ấn Ngăn Cách - Tối ưu cho lối chơi Burst DPS xả quyền cước Q"
        },
        {
            "setIds": [
                "tenacity-of-the-millelith"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Thiên Nham Vững Chắc - Hỗ trợ tạo khiên kháng gián đoạn và liên tục buff 20% ATK cho toàn đội"
        }
    ],
    "mainStats": {
        "sands": "HP% hoặc ATK% (ER% nếu dùng Dấu Ấn)",
        "goblet": "Pyro DMG%",
        "circlet": "CRIT Rate hoặc CRIT DMG (HP% nếu thuần Support)",
        "note": "Dehya scale song song cả ATK và HP. Đạt C1 trở đi, lượng HP sẽ chuyển hóa thành sát thương cực kỳ mạnh mẽ."
    },
    "subStats": {
        "stats": [
            "CRIT Rate / CRIT DMG",
            "HP%",
            "ATK%",
            "Energy Recharge (ER 160%+ nếu dùng Q)",
            "Elemental Mastery"
        ],
        "note": "Nếu dùng trong đội hình Thiêu Đốt / Bung Tỏa (Burgeon) cho Ganyu, Kinich, Neuvillette, tập trung vào HP% và Kháng Gián Đoạn."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)",
            "Đòn thường (NA)"
        ],
        "note": "E tạo Ranh Giới Lửa kháng gián đoạn 100% và gánh chịu sát thương thay đồng đội là giá trị lớn nhất. Q đấm bốc liên hoàn. NA không nâng."
    },
    "playstyleNoteVi": "Dehya mang lại khả năng chống gián đoạn tuyệt đối tương đương Khiên Zhongli trong 9 giây đầu của E mà không sợ bị phá khiên bởi đòn đánh lớn. Cực kỳ thích hợp bảo vệ Ganyu ngắm bắn hoặc Neuvillette xả tia nước, đồng thời áp Hỏa off-field cho phản ứng Thiêu Đốt."
},

  // ── kirara ──
  "kirara": {
    "weapons": [
        {
            "weaponId": "key-of-khaj-nisut",
            "tier": "S",
            "noteVi": "Chìa Khóa Khaj-Nisut - Tăng lượng lớn HP% giúp khiên Hộp Mèo dày nhất game"
        },
        {
            "weaponId": "the-dockhand-s-assistant",
            "tier": "A",
            "noteVi": "Thợ Lặn Kỳ Bí - Kiếm 4★ tăng HP% tốt nhất cho Kirara"
        },
        {
            "weaponId": "favonius-sword",
            "tier": "A",
            "noteVi": "Tây Phong Kiếm - Cung cấp hạt năng lượng dồi dào cho đội"
        },
        {
            "weaponId": "sacrificial-sword",
            "tier": "B",
            "noteVi": "Kiếm Tế Lễ - Reset E để tạo 2 lớp khiên liên tiếp"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "tenacity-of-the-millelith",
                "vourukasha-s-glow"
            ],
            "mode": "2+2",
            "priority": 1,
            "noteVi": "2pc HP (+20%) + 2pc HP (+20%) - Tối đa hóa độ dày của Khiên Hộp Mèo Chuyển Phát"
        },
        {
            "setIds": [
                "deepwood-memories"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Ký Ức Rừng Sâu - Giảm 30% Thảo RES cho đội hình Dendro"
        },
        {
            "setIds": [
                "noblesse-oblige"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Buff 20% ATK cho toàn đội sau khi ném Hộp Đạn Q"
        }
    ],
    "mainStats": {
        "sands": "HP%",
        "goblet": "HP%",
        "circlet": "HP% (hoặc CRIT Rate khi dùng Tây Phong)",
        "note": "Sức mạnh khiên của Kirara tỷ lệ thuận 100% theo HP tối đa. Đẩy HP càng cao thì khiên càng bất tử."
    },
    "subStats": {
        "stats": [
            "HP%",
            "Flat HP",
            "Energy Recharge (ER 140%)",
            "CRIT Rate (khi dùng Tây Phong)"
        ],
        "note": "Tập trung tuyệt đối vào chỉ số HP."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)",
            "Đòn thường (NA)"
        ],
        "note": "E tạo khiên và hóa Hộp Mèo lướt nhanh là kỹ năng cốt lõi. Q ném kiện hàng nổ bom Thảo. NA không nâng."
    },
    "playstyleNoteVi": "Nhấn giữ E hóa thành Hộp Mèo Chuyển Phát tung tăng leo núi và tông vào kẻ địch để áp Thảo và tạo lớp khiên dày cộp bảo vệ đồng đội trong 12 giây."
},

  // ── layla ──
  "layla": {
    "weapons": [
        {
            "weaponId": "key-of-khaj-nisut",
            "tier": "S",
            "noteVi": "Chìa Khóa Khaj-Nisut - HP% cực đại cho khiên ngủ say dày ngang khiên Zhongli"
        },
        {
            "weaponId": "the-dockhand-s-assistant",
            "tier": "A",
            "noteVi": "Thợ Lặn Kỳ Bí 4★ - Cung cấp HP% lớn"
        },
        {
            "weaponId": "favonius-sword",
            "tier": "A",
            "noteVi": "Tây Phong Kiếm - Hỗ trợ nạp Q và tạo hạt trắng cho đội"
        },
        {
            "weaponId": "harbinger-of-dawn",
            "tier": "B",
            "noteVi": "Thần Kiếm Lê Minh 3★ - Cung cấp lượng lớn CRIT Rate/DMG khi luôn được khiên bảo vệ > 90% HP"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "tenacity-of-the-millelith"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Thiên Nham Vững Chắc - Sao Đêm từ khiên liên tục bắn trúng địch duy trì 100% uptime buff 20% ATK và 30% độ dày khiên"
        },
        {
            "setIds": [
                "tenacity-of-the-millelith",
                "vourukasha-s-glow"
            ],
            "mode": "2+2",
            "priority": 2,
            "noteVi": "2pc HP (+20%) + 2pc HP (+20%) - Tối đa hóa lượng HP cơ bản"
        },
        {
            "setIds": [
                "noblesse-oblige"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Tông Thất - Buff 20% ATK cho toàn đội sau khi bật Q"
        }
    ],
    "mainStats": {
        "sands": "HP%",
        "goblet": "HP%",
        "circlet": "HP% (hoặc CRIT Rate nếu dùng Tây Phong)",
        "note": "Khiên Màn Đêm của Layla có thời gian duy trì 12s và hồi chiêu chỉ 12s (100% Uptime), sức mạnh khiên tỷ lệ hoàn toàn theo HP tối đa."
    },
    "subStats": {
        "stats": [
            "HP%",
            "Flat HP",
            "Energy Recharge (ER 130-140%)",
            "CRIT Rate (khi dùng Tây Phong)"
        ],
        "note": "Ưu tiên dồn toàn bộ vào HP% và Flat HP."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)",
            "Đòn thường (NA)"
        ],
        "note": "E tạo khiên Màn Đêm Ngủ Say là kỹ năng quan trọng nhất. Q tạo quả cầu ánh sáng bắn sao Băng. NA không nâng."
    },
    "playstyleNoteVi": "Layla là shielder Băng số 1 trong game hiện tại với 100% thời gian duy trì khiên. Bật E tạo khiên -> Q tạo vùng sao rơi áp Băng liên tục -> Đổi sang DPS đứng sân nhận khiên và buff 20% ATK từ Thiên Nham."
},

  // ── yaoyao ──
  "yaoyao": {
    "weapons": [
        {
            "weaponId": "favonius-lance",
            "tier": "S",
            "noteVi": "Thương Tây Phong - Tốt nhất cho việc nạp năng lượng liên tục cho đội Thảo"
        },
        {
            "weaponId": "black-tassel",
            "tier": "A",
            "noteVi": "Hắc Anh Thương 3★ - Tăng 46.9% HP tối đa hóa lượng hồi máu"
        },
        {
            "weaponId": "rightful-reward",
            "tier": "A",
            "noteVi": "Phần Thưởng Của Công Lý - Thương rèn Fontaine tăng HP và hồi năng lượng"
        },
        {
            "weaponId": "kitain-cross-spear",
            "tier": "B",
            "noteVi": "Thập Tự Thập Ngữ - Tăng EM và hồi năng lượng thụ động"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "deepwood-memories"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Ký Ức Rừng Sâu - Yuegui ném củ cải liên tục kích hoạt giảm 30% Thảo RES cho đội"
        },
        {
            "setIds": [
                "tenacity-of-the-millelith"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Thiên Nham - Yuegui duy trì kích hoạt buff 20% ATK cho toàn đội"
        },
        {
            "setIds": [
                "maiden-beloved"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Thiếu Nữ - Hồi phục tối đa"
        },
        {
            "setIds": [
                "tenacity-of-the-millelith",
                "ocean-hued-clam"
            ],
            "mode": "2+2",
            "priority": 4,
            "noteVi": "2pc HP (+20%) + 2pc Trị Liệu (+15% Healing Bonus)"
        }
    ],
    "mainStats": {
        "sands": "HP% hoặc ER%",
        "goblet": "HP%",
        "circlet": "Tăng Trị Liệu (Healing Bonus) hoặc HP%",
        "note": "Hồi máu của Yaoyao tỷ lệ theo HP tối đa. Q tốn 80 năng lượng nên cần duy trì ER 160-200% nếu muốn dùng Q thường xuyên."
    },
    "subStats": {
        "stats": [
            "HP%",
            "Energy Recharge (ER 160-180%)",
            "Flat HP",
            "CRIT Rate (khi dùng Tây Phong)"
        ],
        "note": "Cân bằng giữa HP% để hồi máu dày và ER% để chiêu nộ hồi đúng chu kỳ."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)",
            "Đòn thường (NA)"
        ],
        "note": "E ném thỏ Yuegui hồi máu và áp Thảo off-field là kỹ năng chính. Q triệu hồi bầy thỏ khi Yaoyao chạy vòng quanh cấp cứu toàn đội. NA không nâng."
    },
    "playstyleNoteVi": "Thả E Yuegui ném củ cải hồi máu đơn mục tiêu và áp Thảo liên tục ngoài sân. Khi cả đội tụt máu hiểm nghèo, bật Q hóa thân thành thỏ chạy nhảy vòng quanh sân trong 5 giây hồi đầy cây máu cho cả 4 thành viên."
},

  // ── sethos ──
  "sethos": {
    "weapons": [
        {
            "weaponId": "hunter-s-path",
            "tier": "S",
            "noteVi": "Con Đường Thợ Săn - Trấn tối thượng cho cung thủ phụ thuộc EM và Trọng Kích"
        },
        {
            "weaponId": "the-first-great-magic",
            "tier": "S",
            "noteVi": "Ảo Thuật Đầu Tiên - CRIT DMG 66.2% + buff ATK%"
        },
        {
            "weaponId": "slingshot",
            "tier": "A",
            "noteVi": "Ná Bắn Chim 3★ - CRIT Rate 31.2% + tăng 60% DMG cực kỳ bá đạo cho F2P"
        },
        {
            "weaponId": "scion-of-the-blazing-sun",
            "tier": "A",
            "noteVi": "Gậy Mặt Trời Bốc Lửa - CRIT Rate + buff sát thương trọng kích"
        },
        {
            "weaponId": "cloudforged",
            "tier": "B",
            "noteVi": "Cung Dệt Mây F2P sự kiện - Tăng lượng lớn Tinh Thông Nguyên Tố"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "wanderer-s-troupe"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Đoàn Hát Lang Thang - Tăng 80 EM và 35% sát thương Trọng Kích Mũi Tên Đổ Bóng"
        },
        {
            "setIds": [
                "gilded-dreams"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Giấc Mộng Hoàng Kim - Cung cấp lượng EM khổng lồ cho phản ứng Tăng Cường (Aggravate)"
        },
        {
            "setIds": [
                "thundering-fury"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Như Sấm Thịnh Nộ - Tăng 15% Lôi DMG và giảm thời gian hồi E"
        },
        {
            "setIds": [
                "gilded-dreams",
                "thundering-fury"
            ],
            "mode": "2+2",
            "priority": 4,
            "noteVi": "2pc EM (+80 Tinh Thông) + 2pc Lôi (+15% ST Lôi)"
        }
    ],
    "mainStats": {
        "sands": "Elemental Mastery (EM)",
        "goblet": "Electro DMG%",
        "circlet": "CRIT Rate hoặc CRIT DMG",
        "note": "Sát thương Mũi Tên Đổ Bóng Cấp 2 của Sethos tỷ lệ cực mạnh theo Tinh Thông Nguyên Tố (EM). Đồng hồ EM là lựa chọn bắt buộc."
    },
    "subStats": {
        "stats": [
            "CRIT Rate / CRIT DMG (1:2)",
            "Elemental Mastery (EM 300+)",
            "Energy Recharge",
            "ATK%"
        ],
        "note": "Dồn chỉ số vào CRIT và EM. Sethos tiêu hao năng lượng nguyên tố để sạc nhanh mũi tên Trọng Kích nên cần một lượng ER vừa đủ."
    },
    "talentPriority": {
        "order": [
            "Đòn thường (NA)",
            "Nguyên tố bùng phát (Q)",
            "Kỹ năng nguyên tố (E)"
        ],
        "note": "NA tăng sát thương Trọng Kích là nguồn sát thương cốt lõi. Q biến đòn đánh thành tia sét Twilight Bolt. E giật sét hồi năng lượng."
    },
    "playstyleNoteVi": "Sethos có hai lối chơi: Lối chơi Trọng Kích (sử dụng năng lượng để tụ lực bắn đạn Mũi Tên Đổ Bóng xuyên thấu cực mạnh) hoặc Lối chơi Q (bật nộ spam đòn bắn thường sấm sét tốc độ cao). Kết hợp cùng Thảo (Nahida/Baizhu) để kích hoạt Tăng Cường hủy diệt."
},

  // ── yanfei ──
  "yanfei": {
    "weapons": [
        {
            "weaponId": "lost-prayer-to-the-sacred-winds",
            "tier": "S",
            "noteVi": "Điển Tích Tây Phong - CRIT Rate 33.1% + tăng tốc chạy và tích lũy sát thương nguyên tố khi đứng sân"
        },
        {
            "weaponId": "tome-of-the-eternal-flow",
            "tier": "S",
            "noteVi": "Văn Khúc Lưu Chuyển - CRIT DMG 88.2% + buff Trọng Kích"
        },
        {
            "weaponId": "the-widsith",
            "tier": "A",
            "noteVi": "Chương Nhạc Lang Thang R5 - CRIT DMG cao và buff cực khủng"
        },
        {
            "weaponId": "solar-pearl",
            "tier": "A",
            "noteVi": "Nhật Nguyệt Hạp - Cung cấp CRIT Rate"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "crimson-witch-of-flames"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Diệm Liệt Ma Nữ - Tăng tối đa sát thương Bốc Hơi / Tan Chảy"
        },
        {
            "setIds": [
                "wanderer-s-troupe"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Đoàn Hát Lang Thang - Tăng 80 EM và 35% sát thương Đan Hỏa Ấn Trọng Kích"
        },
        {
            "setIds": [
                "crimson-witch-of-flames",
                "gladiator-s-finale"
            ],
            "mode": "2+2",
            "priority": 3,
            "noteVi": "2pc Hỏa (+15% ST Hỏa) + 2pc ATK (+18% Tấn Công)"
        }
    ],
    "mainStats": {
        "sands": "ATK% hoặc EM",
        "goblet": "Pyro DMG%",
        "circlet": "CRIT Rate hoặc CRIT DMG",
        "note": "Yanfei liên tục kích Bốc Hơi với Xingqiu/Yelan. Cân bằng CRIT Rate >= 65% để kích hoạt thiên phú A4 (đòn trọng kích chí mạng gây thêm 80% ATK sát thương AOE)."
    },
    "subStats": {
        "stats": [
            "CRIT Rate / CRIT DMG (1:2)",
            "ATK%",
            "Elemental Mastery (EM 100-150 cho Bốc Hơi)",
            "Energy Recharge (ER 130%)"
        ],
        "note": "CRIT Rate đặc biệt quan trọng cho thiên phú phụ nổ thêm đòn đánh phụ."
    },
    "talentPriority": {
        "order": [
            "Đòn thường (NA)",
            "Nguyên tố bùng phát (Q)",
            "Kỹ năng nguyên tố (E)"
        ],
        "note": "NA tăng sát thương Trọng Kích Đan Hỏa Ấn là nguồn 70% sát thương. Q tạo hiệu ứng Đan Thư buff Trọng Kích và cấp ấn tối đa. E gây sát thương và cấp đầy ấn ngay tức khắc."
    },
    "playstyleNoteVi": "Quy trình combo chuẩn: Đánh thường 3 đòn (tích 3-4 Đan Hỏa Ấn) -> Giáng Trọng Kích Bốc Hơi tiêu hao ít thể lực -> Nhấn E cấp đầy ấn -> Giáng tiếp Trọng Kích -> Bật Q buff liên tục tạo ấn."
},

  // ── shikanoin-heizou ──
  "shikanoin-heizou": {
    "weapons": [
        {
            "weaponId": "tulaytullah-s-remembrance",
            "tier": "S",
            "noteVi": "Hồi Ức Tulaytullah - CRIT DMG 44.1% + Base ATK 674 và buff đòn đánh thường"
        },
        {
            "weaponId": "lost-prayer-to-the-sacred-winds",
            "tier": "S",
            "noteVi": "Điển Tích Tây Phong - CRIT Rate 33.1% + tăng sát thương Phong khi đứng sân"
        },
        {
            "weaponId": "the-widsith",
            "tier": "A",
            "noteVi": "Chương Nhạc Lang Thang - R5 nuke Kỹ năng nguyên tố hàng trăm ngàn sát thương"
        },
        {
            "weaponId": "solar-pearl",
            "tier": "A",
            "noteVi": "Nhật Nguyệt Hạp - Tương tác hoàn hảo giữa đòn đánh thường và Quyền Lực Tâm Ý"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "viridescent-venerer"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Bóng Hình Màu Xanh - Giảm 40% kháng nguyên tố đồng đội đồng thời tăng sát thương Khuếch Tán"
        },
        {
            "setIds": [
                "desert-pavilion-chronicle"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Sử Ký Đình Các Sa Mạc - Tăng 15% Phong DMG và 40% sát thương đòn đánh"
        },
        {
            "setIds": [
                "viridescent-venerer",
                "gladiator-s-finale"
            ],
            "mode": "2+2",
            "priority": 3,
            "noteVi": "2pc Phong (+15% ST Phong) + 2pc ATK (+18% Tấn Công)"
        }
    ],
    "mainStats": {
        "sands": "ATK%",
        "goblet": "Anemo DMG%",
        "circlet": "CRIT Rate hoặc CRIT DMG",
        "note": "Heizou là võ sĩ quyền pháp Phong gây sát thương bộc phát cực mạnh từ E Quyền Lực Tâm Ý khi tích đủ 4 tầng Biến Chuyển."
    },
    "subStats": {
        "stats": [
            "CRIT Rate / CRIT DMG (1:2)",
            "ATK%",
            "Elemental Mastery",
            "Energy Recharge (ER 120%)"
        ],
        "note": "Cân bằng CR/CD chuẩn (CR >= 70%, CD >= 140%)."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Đòn thường (NA)",
            "Nguyên tố bùng phát (Q)"
        ],
        "note": "E Quyền Lực Tâm Ý (tích đủ 4 tầng Biến Chuyển tung cú đấm Chính Niệm) là nuke sát thương lớn nhất. NA nâng nếu làm Driver đứng sân. Q ném quả cầu gió gom quái."
    },
    "playstyleNoteVi": "Tung đòn đánh thường hoặc trọng kích kích hoạt phản ứng Khuếch Tán để tích nhanh 4 tầng Biến Chuyển -> Nhấn giữ nhẹ E tung cú Đấm Chính Niệm hủy diệt -> Q đá quả cầu gió bộc phát sát thương diện rộng."
},

  // ── keqing ──
  "keqing": {
    "weapons": [
        {
            "weaponId": "mistsplitter-reforged",
            "tier": "S",
            "noteVi": "Trấn tốt nhất - Base ATK cao, tăng 44.1% CRIT DMG và buff tối đa 28% Sát Thương Nguyên Tố"
        },
        {
            "weaponId": "primordial-jade-cutter",
            "tier": "S",
            "noteVi": "44.1% CRIT Rate cực lớn, tăng HP và chuyển hóa thành ATK dồi dào"
        },
        {
            "weaponId": "light-of-foliar-incision",
            "tier": "S",
            "noteVi": "88.2% CRIT DMG, tăng mạnh sát thương đánh thường & kỹ năng theo Tinh Thông Nguyên Tố"
        },
        {
            "weaponId": "the-black-sword",
            "tier": "A",
            "noteVi": "Kiếm Đen Nhật Ký Hành Trình - Tăng 27.6% CRIT Rate và buff sát thương Trọng Kích"
        },
        {
            "weaponId": "lion-s-roar",
            "tier": "A",
            "noteVi": "Tiếng Hét Của Rồng - Tăng 36% sát thương lên kẻ địch bị dính ấn Lôi hoặc Hỏa ở R5"
        },
        {
            "weaponId": "iron-sting",
            "tier": "B",
            "noteVi": "Thiết Phong Kích rèn F2P - Cung cấp Tinh Thông Nguyên Tố cho phản ứng Tăng Cường"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "thundering-fury"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Tối ưu nhất - Tăng 15% ST Lôi, tăng 20% ST Tăng Cường và giảm liên tục hồi chiêu E"
        },
        {
            "setIds": [
                "gilded-dreams"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Tăng 80 EM và buff thêm một lượng lớn ATK% cùng EM theo đồng đội"
        },
        {
            "setIds": [
                "thundersoother"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Tăng 35% toàn bộ sát thương lên kẻ địch bị đính kèm ấn Lôi"
        },
        {
            "setIds": [
                "thundering-fury",
                "gladiator-s-finale"
            ],
            "mode": "2+2",
            "priority": 4,
            "noteVi": "2pc Như Sấm (+15% ST Lôi) + 2pc Giác Đấu (+18% Tấn Công)"
        },
        {
            "setIds": [
                "thundering-fury",
                "gilded-dreams"
            ],
            "mode": "2+2",
            "priority": 5,
            "noteVi": "2pc Như Sấm (+15% ST Lôi) + 2pc Hoàng Kim (+80 Tinh Thông)"
        }
    ],
    "mainStats": {
        "sands": "ATK% hoặc Tinh Thông Nguyên Tố (EM)",
        "goblet": "Electro DMG%",
        "circlet": "CRIT Rate hoặc CRIT DMG",
        "note": "Trong đội hình Tăng Cường (Aggravate), Đồng hồ EM cạnh tranh sòng phẳng hoặc nhỉnh hơn Đồng hồ ATK% nếu đã có buff ATK từ đồng đội."
    },
    "subStats": {
        "stats": [
            "CRIT Rate / CRIT DMG (1:2)",
            "Tấn công (ATK%)",
            "Tinh Thông Nguyên Tố (100-200 EM)",
            "Hiệu Quả Nạp (110-120%)"
        ],
        "note": "Ưu tiên đạt tỉ lệ CRIT chuẩn (ít nhất 70% CR / 140% CD), Keqing có nội tại tự tăng 15% CRIT Rate sau khi dùng Q."
    },
    "talentPriority": {
        "order": [
            "Đòn thường (NA)",
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)"
        ],
        "note": "Trọng kích đòn thường là nguồn sát thương dồn liên tục lớn nhất. E dịch chuyển chém nuke và Q quét kiếm diện rộng."
    },
    "playstyleNoteVi": "Keqing lột xác thành top DPS khi đi cùng hệ Thảo kích hoạt phản ứng Tăng Cường (Aggravate). Chu kỳ: Đồng đội gắn ấn Thảo & khuếch tán Lôi -> Keqing E ném kiếm -> Q bộc phát sát thương chém quét -> E lao tới kích hoạt đính kèm Lôi -> Spam Trọng kích dồn sát thương liên tục."
},

  // ── mona ──
  "mona": {
    "weapons": [
        {
            "weaponId": "thrilling-tales-of-dragon-slayers",
            "tier": "S",
            "noteVi": "Câu Chuyện Diệt Rồng R5 - Buff 48% ATK cho DPS đứng sân sau khi chuyển đổi nhân vật"
        },
        {
            "weaponId": "favonius-codex",
            "tier": "S",
            "noteVi": "Tây Phong Mật Điển - Nạp năng lượng dồi dào đảm bảo luôn có Q mỗi chu kỳ rotation"
        },
        {
            "weaponId": "the-widsith",
            "tier": "A",
            "noteVi": "Chương Nhạc Lang Thang - Sát thương bạo kích và buff ngẫu nhiên cực mạnh khi build Mona Nuke Q"
        },
        {
            "weaponId": "skyward-atlas",
            "tier": "A",
            "noteVi": "Quyển Thiên Không - Tăng mạnh Base ATK và sát thương nguyên tố toàn diện"
        },
        {
            "weaponId": "prototype-amber",
            "tier": "B",
            "noteVi": "Mẫu Kim Phách rèn F2P - Giúp Mona kiêm luôn vai trò hồi máu toàn đội khi dùng Q"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "noblesse-oblige"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Chuẩn nhất - Tăng 20% sát thương Q và buff thêm 20% ATK cho toàn đội sau khi dùng Q"
        },
        {
            "setIds": [
                "emblem-of-severed-fate"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Tăng 20% Hiệu quả nạp và chuyển hóa tối đa 75% nạp thành sát thương Bùng Phát Q"
        },
        {
            "setIds": [
                "tenacity-of-the-millelith"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Tăng 20% HP và E Phantom giật sát thương liên tục kích hoạt 20% ATK cho đội"
        }
    ],
    "mainStats": {
        "sands": "Hiệu Quả Nạp (ER)",
        "goblet": "Hydro DMG% hoặc ATK%",
        "circlet": "CRIT Rate hoặc CRIT DMG (hoặc Healing Bonus nếu cầm Kim Phách)",
        "note": "Nội tại Mona tự chuyển hóa 20% Hiệu Quả Nạp thành Sát Thương Thủy, nên Đồng hồ ER vừa giải quyết bài toán nạp vừa tăng trực tiếp sát thương."
    },
    "subStats": {
        "stats": [
            "Hiệu Quả Nạp (200-240% ER)",
            "CRIT Rate (để kích hoạt Tây Phong)",
            "CRIT DMG",
            "ATK%",
            "Tinh Thông Nguyên Tố"
        ],
        "note": "Chỉ số quan trọng nhất của Mona là Hiệu Quả Nạp (ER). Luôn duy trì trên 200% ER để không bao giờ bị trễ nhịp Q."
    },
    "talentPriority": {
        "order": [
            "Nguyên tố bùng phát (Q)",
            "Kỹ năng nguyên tố (E)",
            "Đòn thường (NA)"
        ],
        "note": "Q Quỹ Đạo Tinh Mệnh là giá trị cốt lõi (tạo hiệu ứng Điềm Báo Omen tăng 60% sát thương nhận vào của địch). NA không cần nâng."
    },
    "playstyleNoteVi": "Mona áp dụng hiệu ứng Điềm Báo (Omen) khuếch đại sát thương nhận vào của kẻ địch lên đến 60%. Trong đội hình Đóng Băng (Morgana), hiệu ứng Đóng Băng giữ trạng thái Omen kéo dài tới 13 giây. Chu kỳ: E thả ảo ảnh áp ấn Thủy -> Q trói bóng nước -> DPS chính lao vào nuke hủy diệt kẻ địch."
},

  // ── klee ──
  "klee": {
    "weapons": [
        {
            "weaponId": "lost-prayer-to-the-sacred-winds",
            "tier": "S",
            "noteVi": "Điển Tích Tây Phong - 33.1% CRIT Rate, tăng tốc độ di chuyển và buff dồn dập sát thương nguyên tố"
        },
        {
            "weaponId": "tome-of-the-eternal-flow",
            "tier": "S",
            "noteVi": "88.2% CRIT DMG, tăng mạnh sát thương Trọng Kích khi có biến động lượng máu"
        },
        {
            "weaponId": "the-widsith",
            "tier": "S",
            "noteVi": "Chương Nhạc Lang Thang R5 - CRIT DMG cao, 3 dòng buff ngẫu nhiên (ATK/DMG/EM) đều cực kỳ hữu ích"
        },
        {
            "weaponId": "sacrificial-jade",
            "tier": "A",
            "noteVi": "Ngọc Tế Lễ Nhật Ký Hành Trình - CRIT Rate 36.8% và tăng EM/HP khi ở ngoài sân"
        },
        {
            "weaponId": "dodoco-tales",
            "tier": "A",
            "noteVi": "Tuyển Tập Dodoco - Vũ khí kỷ niệm chuẩn phong cách Klee, buff qua lại giữa đánh thường và trọng kích"
        },
        {
            "weaponId": "solar-pearl",
            "tier": "A",
            "noteVi": "Nhật Nguyệt Hắc Ám - CRIT Rate cân bằng, kích hoạt buff đòn đánh thường và kỹ năng"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "crimson-witch-of-flames"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Tối ưu nhất - Tăng 15% ST Hỏa, tăng mạnh phản ứng Bốc Hơi/Tan Chảy và tích tầng từ 2 lần E"
        },
        {
            "setIds": [
                "lavawalker"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Tốt nhất đội Monopyro - Tăng 35% toàn bộ sát thương lên kẻ địch bị dính ấn Hỏa liên tục"
        },
        {
            "setIds": [
                "shimenawa-s-reminiscence"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Tăng 18% ATK và buff 50% sát thương Trọng Kích cực lớn khi dùng E"
        },
        {
            "setIds": [
                "crimson-witch-of-flames",
                "gladiator-s-finale"
            ],
            "mode": "2+2",
            "priority": 4,
            "noteVi": "2pc Ma Nữ (+15% ST Hỏa) + 2pc Giác Đấu (+18% Tấn Công)"
        }
    ],
    "mainStats": {
        "sands": "ATK%",
        "goblet": "Pyro DMG%",
        "circlet": "CRIT Rate hoặc CRIT DMG",
        "note": "Klee có Base ATK cao và tần suất gắn ấn Hỏa quá dày đặc, Ly Pyro DMG% và Đồng hồ ATK% là sự kết hợp tiêu chuẩn tối ưu nhất."
    },
    "subStats": {
        "stats": [
            "CRIT Rate / CRIT DMG (1:2)",
            "Tấn công (ATK%)",
            "Hiệu Quả Nạp (120-130% ER)",
            "Tinh Thông Nguyên Tố"
        ],
        "note": "Klee cần duy trì tỉ lệ CRIT cao (>= 70%) vì mỗi khi Trọng kích bạo kích, nội tại sẽ hồi năng lượng cho toàn bộ đội hình."
    },
    "talentPriority": {
        "order": [
            "Đòn thường (NA)",
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)"
        ],
        "note": "Đòn đánh thường & Trọng kích là nguồn sát thương số 1. E ném bom nảy và Q gọi hoa lửa bắn tự động đều cần nâng đều."
    },
    "playstyleNoteVi": "Klee là pháp sư ném bom áp ấn Hỏa dày đặc nhất game với khả năng phá vỡ thế trận và đánh bật quái (Stagger) cực kỳ bá đạo. Chu kỳ: Đồng đội gom quái & bật buff Hỏa -> Klee E ném Bom Nảy x2 -> Q bật mưa hoa lửa -> Đánh thường tạo Tia Lửa Bùng Nổ -> Trọng Kích hất tung đối thủ mà không tốn thể lực."
},

  // ── qiqi ──
  "qiqi": {
    "weapons": [
        {
            "weaponId": "sacrificial-sword",
            "tier": "S",
            "noteVi": "Kiếm Tế Lễ - Khắc phục điểm yếu hồi chiêu 30s của E, nạp năng lượng và cho phép gọi E liên tục"
        },
        {
            "weaponId": "favonius-sword",
            "tier": "S",
            "noteVi": "Kiếm Tây Phong - Sạc năng lượng dồi dào cho Qiqi và toàn bộ đồng đội"
        },
        {
            "weaponId": "amenoma-kageuchi",
            "tier": "A",
            "noteVi": "Đoản Đao Amenoma rèn Inazuma - Tăng mạnh ATK% để hồi máu và hồi phục năng lượng sau khi dùng Q"
        },
        {
            "weaponId": "skyward-blade",
            "tier": "A",
            "noteVi": "Thiên Không Kiếm - Base ATK cao, tăng Hiệu Quả Nạp và một ít CRIT Rate"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "ocean-hued-clam"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Tối thượng cho Qiqi - Biến lượng hồi máu khổng lồ thành bọt nước nổ 27,000 - 30,000 sát thương vật lý liên tục"
        },
        {
            "setIds": [
                "tenacity-of-the-millelith"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Hồn Ma E quay xung quanh trúng địch kích hoạt liên tục +20% ATK cho toàn đội"
        },
        {
            "setIds": [
                "maiden-beloved"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Bộ Thiếu Nữ tăng lượng hồi máu tối đa (khuyên dùng Xà Cừ để có thêm sát thương)"
        }
    ],
    "mainStats": {
        "sands": "Hiệu Quả Nạp (ER) hoặc ATK%",
        "goblet": "ATK%",
        "circlet": "Tăng Trị Liệu (Healing Bonus) hoặc CRIT Rate (nếu dùng Tây Phong)",
        "note": "Toàn bộ lượng máu hồi của Qiqi tỉ lệ thuận theo chỉ số Tấn Công (ATK). Nón Tăng Trị Liệu giúp nạp đầy thanh bọt nước Xà Cừ nhanh nhất."
    },
    "subStats": {
        "stats": [
            "Hiệu Quả Nạp (ER 180-220%)",
            "Tấn công (ATK%)",
            "Tấn công phẳng (Flat ATK)",
            "CRIT Rate (để kích nạp Tây Phong)"
        ],
        "note": "Qiqi không tự tạo ra hạt nguyên tố khi bật E, do đó chỉ số Hiệu Quả Nạp là ưu tiên hàng đầu để có thể dùng Q cứu sinh mệnh khi cần."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)",
            "Đòn thường (NA)"
        ],
        "note": "E quay linh hồn hồi máu cho đồng đội đứng sân và hồi toàn đội khi Qiqi chém. Q đóng dấu Bùa Phù Hiệu hồi máu khi đánh quái."
    },
    "playstyleNoteVi": "Qiqi sở hữu lượng hồi máu đơn mục tiêu và toàn đội mạnh bậc nhất Genshin Impact. Với bộ Xà Cừ Đại Dương, Qiqi biến lượng hồi máu dư thừa thành các vụ nổ bong bóng 30,000 sát thương vật lý mỗi 3.5 giây. Rất hiệu quả khi đi cùng Furina để kích hoạt tối đa tầng Ná Nức (Fanfare) hoặc kẹp Siêu Dẫn."
},

  // ── sigewinne ──
  "sigewinne": {
    "weapons": [
        {
            "weaponId": "silvershower-heartstrings",
            "tier": "S",
            "noteVi": "Trấn tốt nhất - Cung cấp tới 66% HP và buff thêm CRIT Rate cho chiêu Q"
        },
        {
            "weaponId": "recurve-bow",
            "tier": "S",
            "noteVi": "Cung Tái Sinh 3★ - Lựa chọn F2P tuyệt vời nhất cung cấp tới 46.9% HP tối đa"
        },
        {
            "weaponId": "elegy-for-the-end",
            "tier": "A",
            "noteVi": "Tiếng Thở Dài Vô Tận - Nạp năng lượng và kích hoạt buff 100 EM + 20% ATK toàn đội"
        },
        {
            "weaponId": "favonius-warbow",
            "tier": "A",
            "noteVi": "Cung Tây Phong - Sạc năng lượng hiệu quả cho các đội hình hao tổn mana"
        },
        {
            "weaponId": "sacrificial-bow",
            "tier": "B",
            "noteVi": "Cung Tế Lễ - Cho phép bắn 2 lần bong bóng E tích thêm hồi máu và nạp"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "song-of-days-past"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Tốt nhất - Tích lũy lượng hồi máu dồi dào của E để buff flat damage cho đòn đánh của đồng đội"
        },
        {
            "setIds": [
                "ocean-hued-clam"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Tạo bọt nước nổ sát thương vật lý liên tục theo lượng hồi máu dồi dào"
        },
        {
            "setIds": [
                "tenacity-of-the-millelith",
                "song-of-days-past"
            ],
            "mode": "2+2",
            "priority": 3,
            "noteVi": "2pc Thiên Nham (+20% HP) + 2pc Ngày Cũ (+15% Trị Liệu) hoặc 2pc Vourukasha (+20% HP)"
        }
    ],
    "mainStats": {
        "sands": "HP%",
        "goblet": "HP%",
        "circlet": "HP% hoặc Tăng Trị Liệu (Healing Bonus)",
        "note": "Mục tiêu quan trọng nhất của Sigewinne là chạm mốc 65,000 HP để kích hoạt tối đa hạn mức buff sát thương kỹ năng nguyên tố E (+2,800 flat dmg)."
    },
    "subStats": {
        "stats": [
            "HP%",
            "HP phẳng",
            "Hiệu Quả Nạp (ER 160-180%)",
            "CRIT Rate (nếu dùng Tây Phong)"
        ],
        "note": "Dồn toàn lực vào chỉ số HP% trên tất cả các dòng phụ để sớm chạm trần 65k HP buff kỹ năng."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)",
            "Đòn thường (NA)"
        ],
        "note": "E Bắn Bong Bóng Phục Dược là kỹ năng cốt lõi chứa toàn bộ hồi máu và buff sát thương đồng đội ngoài sân. Q chỉ bắn xịt nước phụ trợ."
    },
    "playstyleNoteVi": "Sigewinne giữ E để nạp viên bong bóng khổng lồ nảy 5 lần hồi máu toàn đội và tự động buff sát thương phẳng (Flat DMG) cực lớn cho Kỹ Năng Nguyên Tố của đồng đội ngoài sân (như Furina E, Chiori búp bê, Nahida Tri-Karma, Fischl Oz, Yae Miko lôi đài)."
},

  // ── thoma ──
  "thoma": {
    "weapons": [
        {
            "weaponId": "kitain-cross-spear",
            "tier": "S",
            "noteVi": "Thập Tự Kitain rèn Inazuma - Cung cấp Tinh Thông Nguyên Tố và nội tại tự hồi phục năng lượng cho Q"
        },
        {
            "weaponId": "dragon-s-bane",
            "tier": "S",
            "noteVi": "Tai Ương Của Rồng - Cho lượng EM khổng lồ 221 điểm, tối ưu hóa sát thương nổ Hạt Nở Rộ (Burgeon)"
        },
        {
            "weaponId": "favonius-lance",
            "tier": "A",
            "noteVi": "Thương Tây Phong - Tốt nhất cho lối chơi build Khiên Hỏa thuần túy, giải quyết bài toán nạp mana"
        },
        {
            "weaponId": "rightful-reward",
            "tier": "A",
            "noteVi": "Thưởng Phạt Công Minh rèn Fontaine - Cung cấp HP% và hồi năng lượng khi được hồi máu"
        },
        {
            "weaponId": "black-tassel",
            "tier": "B",
            "noteVi": "Hắc Anh Thương 3★ - Cung cấp tới 46.9% HP tối đa cho khiên dày nhất"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "flower-of-paradise-lost"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Tối ưu nhất cho Thoma Bung Tỏa (Burgeon) - Tăng tối đa 80% sát thương phản ứng Nở Rộ"
        },
        {
            "setIds": [
                "gilded-dreams"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Tăng 80 EM và buff thêm một lượng lớn Tinh Thông Nguyên Tố theo đồng đội"
        },
        {
            "setIds": [
                "noblesse-oblige"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Tốt nhất khi build Thoma thuần hỗ trợ khiên - Buff 20% ATK cho toàn đội khi Q"
        },
        {
            "setIds": [
                "gilded-dreams",
                "flower-of-paradise-lost"
            ],
            "mode": "2+2",
            "priority": 4,
            "noteVi": "2pc Hoàng Kim (+80 EM) + 2pc Đóa Hoa (+80 EM) — Dễ ghép chỉ số nạp"
        }
    ],
    "mainStats": {
        "sands": "Hiệu Quả Nạp (ER) hoặc Tinh Thông Nguyên Tố (EM)",
        "goblet": "Tinh Thông Nguyên Tố (EM) hoặc HP% (khiên)",
        "circlet": "Tinh Thông Nguyên Tố (EM) hoặc HP% (khiên)",
        "note": "Với lối chơi Bung Tỏa (Burgeon), nếu nạp chưa đủ 200% ER thì Đồng hồ Nạp là bắt buộc trước khi dồn vào EM Ly và Nón."
    },
    "subStats": {
        "stats": [
            "Hiệu Quả Nạp (180-220% ER)",
            "Tinh Thông Nguyên Tố (700-900 EM)",
            "Máu (HP%)",
            "CRIT Rate (nếu dùng Tây Phong)"
        ],
        "note": "Thoma Q tốn 80 năng lượng. Đảm bảo ER đủ xoay vòng chiêu trước khi tối đa hóa EM."
    },
    "talentPriority": {
        "order": [
            "Nguyên tố bùng phát (Q)",
            "Kỹ năng nguyên tố (E)",
            "Đòn thường (NA)"
        ],
        "note": "Q tạo Chiến Giáp Lửa Đỏ liên tục phun lửa theo đòn đánh thường là nguồn kích hoạt hạt thảo và hồi lớp khiên. E bổ sung khiên."
    },
    "playstyleNoteVi": "Thoma là vị vua kích hoạt phản ứng Bung Tỏa (Burgeon). Khi đồng đội tạo ra các Hạt Thảo trên sân, Thoma Q sẽ bắn luồng sóng lửa diện rộng theo đòn đánh thường để kích nổ đồng loạt các hạt thảo gây sát thương diện rộng cực lớn. Chu kỳ: Tạo hạt thảo -> Thoma Q -> E -> Đánh thường liên tục."
},

  // ── collei ──
  "collei": {
    "weapons": [
        {
            "weaponId": "elegy-for-the-end",
            "tier": "S",
            "noteVi": "Tiếng Thở Dài Vô Tận - 55.1% Hiệu Quả Nạp, kích hoạt buff 100 EM và 20% ATK cho cả đội"
        },
        {
            "weaponId": "the-stringless",
            "tier": "S",
            "noteVi": "Tuyệt Huyền - Tăng 165 EM và buff tới 48% sát thương cho kỹ năng E và Q ở R5"
        },
        {
            "weaponId": "favonius-warbow",
            "tier": "S",
            "noteVi": "Cung Tây Phong F2P - Đảm bảo Collei luôn sạc đầy chiêu Q mỗi chu kỳ"
        },
        {
            "weaponId": "sacrificial-bow",
            "tier": "A",
            "noteVi": "Cung Tế Lễ - Reset kỹ năng E ném thêm một lần Boomerang Thảo"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "deepwood-memories"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Trang bị chuẩn mực - Giảm 30% Kháng Thảo của kẻ địch trúng đòn cho toàn đội"
        },
        {
            "setIds": [
                "noblesse-oblige"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Tăng 20% sát thương Q và buff thêm 20% ATK cho toàn đội trong 12 giây"
        },
        {
            "setIds": [
                "gilded-dreams",
                "deepwood-memories"
            ],
            "mode": "2+2",
            "priority": 3,
            "noteVi": "2pc Rừng Sâu (+15% ST Thảo) + 2pc Hoàng Kim (+80 EM)"
        }
    ],
    "mainStats": {
        "sands": "Hiệu Quả Nạp (ER) hoặc ATK%",
        "goblet": "Dendro DMG%",
        "circlet": "CRIT Rate hoặc CRIT DMG",
        "note": "Ưu tiên đảm bảo đủ 180-200% Hiệu Quả Nạp trước khi tối ưu hóa sát thương cá nhân của Collei."
    },
    "subStats": {
        "stats": [
            "Hiệu Quả Nạp (180-200% ER)",
            "CRIT Rate / CRIT DMG",
            "Tinh Thông Nguyên Tố",
            "Tấn công (ATK%)"
        ],
        "note": "Cân bằng CRIT Rate từ 50-60% để kích hoạt hạt năng lượng từ Cung Tây Phong."
    },
    "talentPriority": {
        "order": [
            "Nguyên tố bùng phát (Q)",
            "Kỹ năng nguyên tố (E)",
            "Đòn thường (NA)"
        ],
        "note": "Q ném chú mèo Cuollein-Anbar nhảy nhót tạo vùng ấn Thảo liên tục. E ném phi tiêu boomerang. NA không nâng."
    },
    "playstyleNoteVi": "Collei là nhân vật cấp ấn Thảo tầm xa nhanh nhẹn. Kỹ năng E ném phi tiêu kèm nội tại Vòng Lá Mầm gắn ấn Thảo quanh nhân vật, kết hợp Q tạo vùng bùng nổ liên hoàn. Rất ăn ý trong đội hình Nilou Sum Suê, Keqing Tăng Cường hoặc Cyno Sinh Trưởng."
},

  // ── kaveh ──
  "kaveh": {
    "weapons": [
        {
            "weaponId": "mailed-flower",
            "tier": "S",
            "noteVi": "Bông Hoa Bọc Thép - Tăng mạnh Tinh Thông Nguyên Tố và ATK% sau khi dùng kỹ năng"
        },
        {
            "weaponId": "favonius-greatsword",
            "tier": "S",
            "noteVi": "Đại Kiếm Tây Phong - Giải quyết triệt để nhu cầu 80 năng lượng nguyên tố của chiêu Q"
        },
        {
            "weaponId": "makhaira-aquamarine",
            "tier": "A",
            "noteVi": "Thủy Tinh Makhaira - Tăng EM và chia sẻ lượng ATK buff cho đồng đội"
        },
        {
            "weaponId": "bloodtainted-greatsword",
            "tier": "B",
            "noteVi": "Kiếm Huyết Rồng 3★ - Cung cấp tới 187 EM giá rẻ dễ kiếm"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "deepwood-memories"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Giảm 30% kháng Thảo của kẻ địch, tối ưu hóa sát thương nổ Hạt Thảo của cả đội"
        },
        {
            "setIds": [
                "flower-of-paradise-lost"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Tăng tối đa 80% sát thương nổ hạt Sum Suê khi Kaveh đứng sân kích hoạt"
        },
        {
            "setIds": [
                "gilded-dreams"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Cung cấp lượng EM khổng lồ cho Kaveh khi đứng sân điều phối"
        },
        {
            "setIds": [
                "ocean-hued-clam"
            ],
            "mode": "4pc",
            "priority": 4,
            "noteVi": "Tận dụng nội tại tự hồi máu khi hạt nổ trúng mình để tạo bọt nước sát thương vật lý"
        }
    ],
    "mainStats": {
        "sands": "Hiệu Quả Nạp (ER) hoặc Tinh Thông Nguyên Tố (EM)",
        "goblet": "Tinh Thông Nguyên Tố (EM)",
        "circlet": "Tinh Thông Nguyên Tố (EM)",
        "note": "Đồng hồ ER giúp Kaveh duy trì trạng thái đính kèm Thảo của Q liên tục 100% thời gian đứng sân."
    },
    "subStats": {
        "stats": [
            "Hiệu Quả Nạp (180-200% ER)",
            "Tinh Thông Nguyên Tố (700-900 EM)",
            "Tấn công (ATK%)",
            "Máu (HP%)"
        ],
        "note": "Nội tại Kaveh tự hồi máu dựa trên 300% lượng Tinh Thông Nguyên Tố (EM) khi chịu sát thương hạt Thảo nổ."
    },
    "talentPriority": {
        "order": [
            "Nguyên tố bùng phát (Q)",
            "Đòn thường (NA)",
            "Kỹ năng nguyên tố (E)"
        ],
        "note": "Q đính kèm Thảo cho đòn đánh thường và tăng sát thương nổ hạt. NA nâng để tăng sát thương chém quét."
    },
    "playstyleNoteVi": "Kaveh là Kiến Trúc Sư kiêm Driver đứng sân hoàn hảo của đội hình Sum Suê (Bloom). Khi bật Q, đòn đánh của Kaveh chuyển thành sát thương Thảo diện rộng; kỹ năng E quét kích nổ ngay lập tức mọi Hạt Thảo xung quanh mà không cần chờ 6 giây. Hạt nổ trúng Kaveh sẽ tự hồi phục sinh mệnh."
},

  // ── lynette ──
  "lynette": {
    "weapons": [
        {
            "weaponId": "freedom-sworn",
            "tier": "S",
            "noteVi": "Lời Thề Tự Do Cổ Xưa - Cung cấp EM và buff 20% ATK cùng 16% sát thương đòn đánh cho cả đội"
        },
        {
            "weaponId": "fleuve-cendre-ferryman",
            "tier": "S",
            "noteVi": "Ống Nước Fontaine F2P - Cung cấp 45.9% ER và tăng tới 16% CRIT Rate cho kỹ năng E"
        },
        {
            "weaponId": "favonius-sword",
            "tier": "S",
            "noteVi": "Kiếm Tây Phong - Sạc năng lượng mượt mà cho toàn bộ đội hình"
        },
        {
            "weaponId": "sacrificial-sword",
            "tier": "A",
            "noteVi": "Kiếm Tế Lễ - Reset chiêu E lướt chém 2 lần liên tiếp tích năng lượng"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "viridescent-venerer"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Bắt buộc - Giảm 40% kháng nguyên tố của kẻ địch bị Khuếch Tán, nâng tầm toàn bộ DPS nguyên tố"
        },
        {
            "setIds": [
                "noblesse-oblige"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Buff 20% ATK cho toàn đội sau khi ném Hộp Mèo Q"
        }
    ],
    "mainStats": {
        "sands": "Hiệu Quả Nạp (ER) hoặc ATK%",
        "goblet": "Anemo DMG%",
        "circlet": "CRIT Rate hoặc CRIT DMG",
        "note": "Cần đảm bảo ER khoảng 180-210% (hoặc 160% nếu cầm Kiếm Tây Phong / Ống Nước)."
    },
    "subStats": {
        "stats": [
            "Hiệu Quả Nạp (180-210% ER)",
            "CRIT Rate / CRIT DMG",
            "Tấn công (ATK%)",
            "Tinh Thông Nguyên Tố"
        ],
        "note": "Duy trì tỉ lệ CRIT từ 60% trở lên để tối đa hóa sát thương từ Hộp Mèo bắn đạn nguyên tố hấp thụ."
    },
    "talentPriority": {
        "order": [
            "Nguyên tố bùng phát (Q)",
            "Kỹ năng nguyên tố (E)",
            "Đòn thường (NA)"
        ],
        "note": "Q ném Hộp Mèo Burlap là kỹ năng quan trọng nhất để gom quái, khiêu khích và bắn đạn khuếch tán. NA chỉ nâng khi đạt C6."
    },
    "playstyleNoteVi": "Lynette đảm nhiệm vị trí Khuếch Tán giảm kháng cực kỳ cơ động. E lướt nhanh kích hoạt sát thương Ousia phá giải các cơ quan Fontaine; Q quẳng Hộp Mèo Kỳ Ảo khiêu khích thu hút toàn bộ hỏa lực của quái vật, đồng thời liên tục chuyển hóa nguyên tố và bắn đạn rỉa máu diện rộng."
},

  // ── freminet ──
  "freminet": {
    "weapons": [
        {
            "weaponId": "song-of-broken-pines",
            "tier": "S",
            "noteVi": "Tiếng Thở Dài Của Gió Tây - Base ATK 741 cực cao, tăng sát thương Vật Lý và Tốc Độ Đánh"
        },
        {
            "weaponId": "wolf-s-gravestone",
            "tier": "S",
            "noteVi": "Đường Cùng Của Sói - Cung cấp lượng lớn ATK% dồi dào cho Freminet và cả đội"
        },
        {
            "weaponId": "serpent-spine",
            "tier": "S",
            "noteVi": "Kiếm Ly Cốt - Tăng tới 50% sát thương toàn diện ở R5 cùng chỉ số CRIT Rate cao"
        },
        {
            "weaponId": "tidal-shadow",
            "tier": "A",
            "noteVi": "Bóng Hình Thủy Triều rèn Fontaine - Nhận lượng lớn ATK% mỗi khi nhận hồi máu"
        },
        {
            "weaponId": "snow-tombed-starsilver",
            "tier": "B",
            "noteVi": "Tuyết Vùi Tinh Ngân rèn F2P Dragonspine - Tăng sát thương Vật lý và thả cột băng"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "pale-flame"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Tốt nhất - Tăng tối đa 50% ST Vật Lý và 18% ATK nhờ cơ chế kích hoạt E liên tục"
        },
        {
            "setIds": [
                "blizzard-strayer"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Dành cho lối chơi Băng thuần túy - Cung cấp tới 40% CRIT Rate khi địch bị Đóng Băng"
        },
        {
            "setIds": [
                "pale-flame",
                "bloodstained-chivalry"
            ],
            "mode": "2+2",
            "priority": 3,
            "noteVi": "2pc Lửa Trắng Xám (+25% ST Vật Lý) + 2pc Kỵ Sĩ (+25% ST Vật Lý)"
        }
    ],
    "mainStats": {
        "sands": "ATK%",
        "goblet": "Physical DMG% (hoặc Cryo DMG% nếu chơi Băng)",
        "circlet": "CRIT Rate hoặc CRIT DMG",
        "note": "Đa số trường hợp Ly Sát Thương Vật Lý là phương án gây sát thương cao nhất từ cú Đập Áp Suất Cấp 4 của Pers."
    },
    "subStats": {
        "stats": [
            "CRIT Rate / CRIT DMG (1:2)",
            "Tấn công (ATK%)",
            "Hiệu Quả Nạp (120-140% ER)",
            "Tinh Thông Nguyên Tố"
        ],
        "note": "Cân bằng CRIT chuẩn (ít nhất 65% CR / 130% CD) để các đòn đập áp suất luôn đạt bạo kích."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Đòn thường (NA)",
            "Nguyên tố bùng phát (Q)"
        ],
        "note": "E Đồng Hồ Áp Suất Pers là nguồn 70%+ sát thương. Đánh thường NA giúp tích tầng áp suất nhanh chóng."
    },
    "playstyleNoteVi": "Freminet kết hợp độc đáo giữa Siêu Dẫn (Superconduct) và Phá Băng (Shatter). Kỹ năng E kích hoạt chim cánh cụt Pers: đánh thường 4 lần để đẩy thanh áp suất lên Cấp 4 rồi tung cú chém Vật lý hủy diệt. Bật Q sẽ giảm hồi chiêu E và cho phép tích tầng áp suất nhanh gấp đôi."
},

  // ── charlotte ──
  "charlotte": {
    "weapons": [
        {
            "weaponId": "favonius-codex",
            "tier": "S",
            "noteVi": "Tây Phong Mật Điển - Nạp năng lượng tối ưu cho chiêu Q 80 mana và sạc cho cả đội"
        },
        {
            "weaponId": "prototype-amber",
            "tier": "S",
            "noteVi": "Mẫu Kim Phách rèn F2P - Hồi thêm năng lượng và lượng máu khổng lồ sau khi dùng Q"
        },
        {
            "weaponId": "thrilling-tales-of-dragon-slayers",
            "tier": "A",
            "noteVi": "Câu Chuyện Diệt Rồng R5 - Buff 48% ATK cho DPS đứng sân"
        },
        {
            "weaponId": "oathsworn-eye",
            "tier": "A",
            "noteVi": "Con Mắt Tuyên Thệ - Tăng mạnh ATK% và cộng thêm 48% Hiệu Quả Nạp sau khi dùng E"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "noblesse-oblige"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Chuẩn nhất - Tăng sát thương Q và buff 20% ATK cho toàn đội trong 12 giây"
        },
        {
            "setIds": [
                "ocean-hued-clam"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Biến lượng hồi máu toàn đội khổng lồ của Q thành bọt nước nổ sát thương vật lý"
        },
        {
            "setIds": [
                "song-of-days-past"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Tích lũy lượng hồi máu dồi dào để buff sát thương phẳng cho DPS"
        },
        {
            "setIds": [
                "emblem-of-severed-fate",
                "gladiator-s-finale"
            ],
            "mode": "2+2",
            "priority": 4,
            "noteVi": "2pc Dấu Ấn (+20% ER) + 2pc ATK (+18% Tấn Công)"
        }
    ],
    "mainStats": {
        "sands": "Hiệu Quả Nạp (ER)",
        "goblet": "ATK%",
        "circlet": "Tăng Trị Liệu (Healing Bonus) hoặc CRIT Rate (nếu dùng Tây Phong)",
        "note": "Lượng máu hồi của Charlotte scale theo ATK. Đồng hồ ER là bắt buộc để duy trì Q liên tục."
    },
    "subStats": {
        "stats": [
            "Hiệu Quả Nạp (200-240% ER)",
            "Tấn công (ATK%)",
            "CRIT Rate (để kích hoạt Tây Phong)",
            "Tấn công phẳng"
        ],
        "note": "Cần đạt tối thiểu 200-220% ER nếu đi 1 Băng, hoặc 180% ER nếu đi cùng Furina / Wriothesley / Ayaka."
    },
    "talentPriority": {
        "order": [
            "Nguyên tố bùng phát (Q)",
            "Kỹ năng nguyên tố (E)",
            "Đòn thường (NA)"
        ],
        "note": "Q là chiêu thức cốt lõi hồi phục ngay lập tức thanh máu cho toàn bộ 4 thành viên. E chụp ảnh đánh dấu quái."
    },
    "playstyleNoteVi": "Charlotte là phóng viên ảnh tòa soạn Chim Bồ Câu với chiêu Q chụp hình toàn cảnh hồi phục tức thời 100% máu cho cả 4 nhân vật (tương tự Jean). Là đồng đội hoàn hảo nhất của Furina ở phân khúc 4 sao để kích đầy 300 tầng Ná Nức (Fanfare) trong 1 giây."
},

  // ── mika ──
  "mika": {
    "weapons": [
        {
            "weaponId": "favonius-lance",
            "tier": "S",
            "noteVi": "Thương Tây Phong - Cung cấp Hiệu Quả Nạp dồi dào và sinh hạt nguyên tố cho DPS vật lý"
        },
        {
            "weaponId": "rightful-reward",
            "tier": "A",
            "noteVi": "Thưởng Phạt Công Minh rèn Fontaine - Cho HP% để hồi máu dày hơn và tự hồi năng lượng"
        },
        {
            "weaponId": "black-tassel",
            "tier": "B",
            "noteVi": "Hắc Anh Thương 3★ - Lựa chọn F2P cung cấp lượng HP% cao nhất"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "noblesse-oblige"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Buff 20% ATK cho toàn đội sau khi bật Q lông vũ hồi máu"
        },
        {
            "setIds": [
                "ocean-hued-clam"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Gia tăng lượng hồi máu và tạo bọt nước nổ sát thương vật lý phụ trợ"
        },
        {
            "setIds": [
                "emblem-of-severed-fate",
                "tenacity-of-the-millelith"
            ],
            "mode": "2+2",
            "priority": 3,
            "noteVi": "2pc Dấu Ấn (+20% ER) + 2pc Thiên Nham (+20% HP)"
        }
    ],
    "mainStats": {
        "sands": "Hiệu Quả Nạp (ER)",
        "goblet": "HP%",
        "circlet": "Tăng Trị Liệu (Healing Bonus) hoặc CRIT Rate (Tây Phong)",
        "note": "Mika cần nạp rất cao để bật Q ổn định; nón CRIT Rate giúp kích hoạt hiệu ứng sạc của Thương Tây Phong."
    },
    "subStats": {
        "stats": [
            "Hiệu Quả Nạp (180-220% ER)",
            "Máu (HP%)",
            "CRIT Rate (40-50%)",
            "HP phẳng"
        ],
        "note": "Tập trung đẩy ER lên mốc an toàn 200% để luôn sẵn sàng nộ xoay tua rotation."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)",
            "Đòn thường (NA)"
        ],
        "note": "E bắn đạn nỏ tăng Tốc Độ Đánh (ATK SPD) lên đến 25% và buff sát thương Vật lý. Q hồi máu toàn đội."
    },
    "playstyleNoteVi": "Mika là hỗ trợ chuyên dụng số 1 cho các DPS đánh thường Vật Lý (Eula, Freminet, Razor, Keqing vật lý). Kỹ năng E tăng tới 25% tốc độ tấn công giúp Eula chém thêm 3-4 stack nổ kiếm ánh sáng Q, đồng thời buff thêm tối đa 50% sát thương Vật lý và hồi phục sinh mệnh liên tục."
},

  // ── sayu ──
  "sayu": {
    "weapons": [
        {
            "weaponId": "favonius-greatsword",
            "tier": "S",
            "noteVi": "Đại Kiếm Tây Phong - Giải quyết trọn vẹn nhu cầu nạp 80 năng lượng cho chiêu Q Daruma"
        },
        {
            "weaponId": "katsuragikiri-nagamasa",
            "tier": "S",
            "noteVi": "Thập Tự Katsuragikiri - Tăng sát thương kỹ năng E và tự động hồi phục mana dồi dào"
        },
        {
            "weaponId": "mailed-flower",
            "tier": "A",
            "noteVi": "Bông Hoa Bọc Thép - Tăng Tinh Thông Nguyên Tố để hồi máu và khuếch tán mạnh hơn"
        },
        {
            "weaponId": "bloodtainted-greatsword",
            "tier": "B",
            "noteVi": "Kiếm Huyết Rồng 3★ - Cung cấp 187 EM giá rẻ dễ kiếm"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "viridescent-venerer"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Bắt buộc - Giảm 40% kháng nguyên tố của kẻ địch bị Khuếch Tán, nâng tầm toàn đội"
        },
        {
            "setIds": [
                "ocean-hued-clam"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Tận dụng lượng hồi máu dồi dào từ hình nộm Daruma để nổ bọt nước sát thương"
        }
    ],
    "mainStats": {
        "sands": "Hiệu Quả Nạp (ER) hoặc Tinh Thông Nguyên Tố (EM)",
        "goblet": "Tinh Thông Nguyên Tố (EM) hoặc ATK%",
        "circlet": "Tinh Thông Nguyên Tố (EM) hoặc Tăng Trị Liệu",
        "note": "Sayu C6 sẽ biến lượng Tinh Thông Nguyên Tố (EM) thành cả sát thương lẫn khả năng hồi máu khổng lồ."
    },
    "subStats": {
        "stats": [
            "Hiệu Quả Nạp (180-210% ER)",
            "Tinh Thông Nguyên Tố",
            "Tấn công (ATK%)",
            "CRIT Rate (nếu dùng Tây Phong)"
        ],
        "note": "Cần tối thiểu 180% ER nếu có 2 Phong trong đội, hoặc 200%+ ER nếu là Phong đơn lẻ."
    },
    "talentPriority": {
        "order": [
            "Nguyên tố bùng phát (Q)",
            "Kỹ năng nguyên tố (E)",
            "Đòn thường (NA)"
        ],
        "note": "Q triệu hồi hình nộm Muji-Muji Daruma hồi máu và xoáy gió. E lăn bánh xe phong tốc độ cao."
    },
    "playstyleNoteVi": "Sayu là ninja Shuumatsuban tiện ích bậc nhất thế giới mở: kỹ năng E cuộn thành bánh xe lăn vùn vụt không tốn thể lực và không làm kinh động chim muông; khi vào giao tranh, Q thả hình nộm Daruma hồi máu liên tục và kích hoạt bộ Bóng Hình Màu Xanh giảm 40% kháng nguyên tố."
},

  // ── candace ──
  "candace": {
    "weapons": [
        {
            "weaponId": "favonius-lance",
            "tier": "S",
            "noteVi": "Thương Tây Phong - Cung cấp Hiệu Quả Nạp và sạc hạt năng lượng cho toàn đội"
        },
        {
            "weaponId": "the-catch",
            "tier": "A",
            "noteVi": "Lao Câu Cá - 45.9% ER và tăng sát thương bạo kích cho chiêu nộ Q"
        },
        {
            "weaponId": "black-tassel",
            "tier": "A",
            "noteVi": "Hắc Anh Thương 3★ - Cho tới 46.9% HP tối đa, gia tăng lượng buff đòn đánh thường"
        },
        {
            "weaponId": "rightful-reward",
            "tier": "B",
            "noteVi": "Thưởng Phạt Công Minh - Tăng HP% và hồi mana khi được nhận trị liệu"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "noblesse-oblige"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Tốt nhất - Buff thêm 20% ATK cho toàn đội sau khi bật Màn Nước Đỏ Q"
        },
        {
            "setIds": [
                "instructor"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Bộ Giáo Quan buff 120 Tinh Thông cho toàn đội khi kích hoạt phản ứng Thủy"
        },
        {
            "setIds": [
                "tenacity-of-the-millelith",
                "emblem-of-severed-fate"
            ],
            "mode": "2+2",
            "priority": 3,
            "noteVi": "2pc Thiên Nham (+20% HP) + 2pc Dấu Ấn (+20% ER)"
        }
    ],
    "mainStats": {
        "sands": "Hiệu Quả Nạp (ER) hoặc HP%",
        "goblet": "HP%",
        "circlet": "HP% hoặc CRIT Rate (nếu dùng Thương Tây Phong)",
        "note": "Lượng sát thương đòn đánh thường buff cho đồng đội tỉ lệ thuận với lượng HP tối đa của Candace."
    },
    "subStats": {
        "stats": [
            "Hiệu Quả Nạp (180-210% ER)",
            "Máu (HP%)",
            "CRIT Rate (40-50%)",
            "HP phẳng"
        ],
        "note": "Đảm bảo đủ nạp để bật Q mỗi chu kỳ rotation 15 giây."
    },
    "talentPriority": {
        "order": [
            "Nguyên tố bùng phát (Q)",
            "Kỹ năng nguyên tố (E)",
            "Đòn thường (NA)"
        ],
        "note": "Q Nghi Lễ Thánh Động là kỹ năng đính kèm nguyên tố Thủy và buff sát thương đánh thường. E giơ khiên phản đòn."
    },
    "playstyleNoteVi": "Candace Q phủ Màn Nước Đỏ đính kèm nguyên tố Thủy (Hydro Infusion) cho tất cả nhân vật sử dụng Kiếm đơn/Trọng kiếm/Vũ khí cán dài, đồng thời buff tới 40%+ sát thương đòn đánh thường nguyên tố dựa theo lượng HP tối đa. Là mảnh ghép tuyệt vời cho Ayato, Yoimiya hoặc Arlecchino/Nilou."
},

  // ── dori ──
  "dori": {
    "weapons": [
        {
            "weaponId": "favonius-greatsword",
            "tier": "S",
            "noteVi": "Đại Kiếm Tây Phong - Sạc năng lượng dồi dào đưa khả năng làm pin năng lượng lên đỉnh cao"
        },
        {
            "weaponId": "sacrificial-greatsword",
            "tier": "S",
            "noteVi": "Đại Kiếm Tế Lễ - Cho phép bắn 2 lần súng E tích năng lượng tức thì"
        },
        {
            "weaponId": "forest-regalia",
            "tier": "A",
            "noteVi": "Vương Khí Rừng Sâu rèn Sumeru - Cung cấp ER và thả Lá Rừng Phục Sinh buff 120 EM"
        },
        {
            "weaponId": "the-bell",
            "tier": "B",
            "noteVi": "Kiếm Chuông - Cung cấp HP% gia tăng khả năng hồi phục sinh mệnh"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "noblesse-oblige"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Buff 20% ATK cho toàn đội mỗi khi gọi Thần Đèn Jinni Q"
        },
        {
            "setIds": [
                "ocean-hued-clam"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Tận dụng sợi dây truyền máu liên tục để kích hoạt nổ bọt nước 27k sát thương"
        },
        {
            "setIds": [
                "gilded-dreams"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Tối ưu hóa khi chơi Dori kích nổ Hạt Nở Rộ (Hyperbloom) bằng tia dây điện"
        },
        {
            "setIds": [
                "emblem-of-severed-fate",
                "tenacity-of-the-millelith"
            ],
            "mode": "2+2",
            "priority": 4,
            "noteVi": "2pc Dấu Ấn (+20% ER) + 2pc Thiên Nham (+20% HP)"
        }
    ],
    "mainStats": {
        "sands": "Hiệu Quả Nạp (ER)",
        "goblet": "HP% (hoặc Tinh Thông EM nếu kích Hyperbloom)",
        "circlet": "Tăng Trị Liệu (Healing Bonus) hoặc CRIT Rate",
        "note": "Dori tiêu hao 80 năng lượng nguyên tố, đồng hồ ER là bắt buộc để duy trì sợi dây kết nối liên tục."
    },
    "subStats": {
        "stats": [
            "Hiệu Quả Nạp (200-240% ER)",
            "Máu (HP%)",
            "Tinh Thông Nguyên Tố",
            "CRIT Rate"
        ],
        "note": "Chỉ số nạp từ 200% trở lên là điều kiện tiên quyết để Dori hoàn thành tốt nhiệm vụ."
    },
    "talentPriority": {
        "order": [
            "Nguyên tố bùng phát (Q)",
            "Kỹ năng nguyên tố (E)",
            "Đòn thường (NA)"
        ],
        "note": "Q Điểm Sáng Dược Liệu thả thần đèn kết nối sợi dây điện hồi máu và nạp mana trực tiếp. E bắn pháo đạn."
    },
    "playstyleNoteVi": "Dori là cục pin sạc dự phòng sống của Teyvat: chiêu Q gọi Thần Đèn Jinni nối sợi dây năng lượng truyền liên tục Năng Lượng Nguyên Tố (tối đa hồi 15+ flat energy) và hồi máu mỗi giây cho nhân vật đứng sân. Sợi dây điện khi quét qua kẻ địch hoặc hạt thảo có thể kích nổ Nở Rộ cực kỳ độc đáo."
},

  // ── barbara ──
  "barbara": {
    "weapons": [
        {
            "weaponId": "thrilling-tales-of-dragon-slayers",
            "tier": "S",
            "noteVi": "Câu Chuyện Diệt Rồng R5 - Lựa chọn 3★ thần thánh buff 48% ATK cho chủ lực"
        },
        {
            "weaponId": "sacrificial-fragments",
            "tier": "S",
            "noteVi": "Mảnh Chương Tế Lễ - 221 EM và reset thời gian hồi chiêu dài của vòng nước E"
        },
        {
            "weaponId": "prototype-amber",
            "tier": "A",
            "noteVi": "Mẫu Kim Phách rèn F2P - Hồi thêm năng lượng và lượng máu khổng lồ cho đội"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "ocean-hued-clam"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Biến toàn bộ lượng hồi máu khổng lồ thành bọt nước nổ 27k-30k sát thương vật lý liên tục"
        },
        {
            "setIds": [
                "maiden-beloved"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Bộ Thiếu Nữ tăng lượng trị liệu thuần túy cao nhất cho người mới bắt đầu"
        },
        {
            "setIds": [
                "instructor"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Bộ Giáo Quan buff 120 EM toàn đội trong đội hình Nilou Sum Suê hoặc Bốc Hơi"
        },
        {
            "setIds": [
                "tenacity-of-the-millelith",
                "maiden-beloved"
            ],
            "mode": "2+2",
            "priority": 4,
            "noteVi": "2pc Thiên Nham (+20% HP) + 2pc Thiếu Nữ (+15% Trị Liệu)"
        }
    ],
    "mainStats": {
        "sands": "HP% hoặc Hiệu Quả Nạp (ER)",
        "goblet": "HP%",
        "circlet": "Tăng Trị Liệu (Healing Bonus) hoặc HP%",
        "note": "Toàn bộ lượng máu hồi của Barbara scale theo HP tối đa. Nón Tăng Trị Liệu cho chỉ số hồi máu vượt trội nón HP%."
    },
    "subStats": {
        "stats": [
            "Máu (HP%)",
            "HP phẳng",
            "Hiệu Quả Nạp (140-160% ER)",
            "Tinh Thông Nguyên Tố"
        ],
        "note": "Nếu sử dụng trong đội hình Nilou Sum Suê, hãy ưu tiên thêm chỉ số Tinh Thông Nguyên Tố (EM) để tăng sát thương hạt nổ."
    },
    "talentPriority": {
        "order": [
            "Kỹ năng nguyên tố (E)",
            "Nguyên tố bùng phát (Q)",
            "Đòn thường (NA)"
        ],
        "note": "E tạo vòng nước nhảy múa áp ấn Thủy và hồi máu liên tục. Q nuke hồi đầy 100% thanh máu toàn đội ngay lập tức."
    },
    "playstyleNoteVi": "Thần tượng âm nhạc Mondstadt Barbara là vị cứu tinh miễn phí của mọi tài khoản. Kỹ năng E tạo Vòng Ca Khúc áp ấn Thủy sát mục tiêu và hồi máu liên tục; chiêu Q nạp đầy thanh sinh mệnh cho cả 4 thành viên trong tích tắc. Cầm Câu Chuyện Diệt Rồng buff 48% ATK cho DPS chính."
},

  // ── lisa ──
  "lisa": {
    "weapons": [
        {
            "weaponId": "kagura-s-verity",
            "tier": "S",
            "noteVi": "Chân Ý Của Kagura - 66.2% CRIT DMG, tăng mạnh sát thương cho kỹ năng nguyên tố E"
        },
        {
            "weaponId": "the-widsith",
            "tier": "S",
            "noteVi": "Chương Nhạc Lang Thang - Sát thương bạo kích và lượng buff ngẫu nhiên cực lớn"
        },
        {
            "weaponId": "hakushin-ring",
            "tier": "S",
            "noteVi": "Vòng Hakushin rèn Inazuma - Tăng ER và buff tới 20% sát thương nguyên tố cho đồng đội sau khi tạo phản ứng Lôi"
        },
        {
            "weaponId": "favonius-codex",
            "tier": "A",
            "noteVi": "Tây Phong Mật Điển - Đảm bảo luôn sạc đầy chiêu Q 80 năng lượng mỗi vòng xoay tua"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "thundering-fury"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Tối ưu nhất khi đứng sân Tăng Cường - Tăng 15% ST Lôi, buff 20% ST Tăng Cường và giảm hồi chiêu E"
        },
        {
            "setIds": [
                "emblem-of-severed-fate"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Tốt nhất khi chơi Sub-DPS ngoài sân - Giải quyết bài toán nạp và tăng mạnh sát thương Q"
        },
        {
            "setIds": [
                "noblesse-oblige"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Buff 20% ATK cho toàn đội khi bật Q giảm phòng ngự địch"
        },
        {
            "setIds": [
                "gilded-dreams"
            ],
            "mode": "4pc",
            "priority": 4,
            "noteVi": "Cung cấp lượng EM lớn cho phản ứng Tăng Cường hoặc Siêu Nở Rộ"
        }
    ],
    "mainStats": {
        "sands": "Hiệu Quả Nạp (ER) hoặc ATK% / Tinh Thông Nguyên Tố",
        "goblet": "Electro DMG%",
        "circlet": "CRIT Rate hoặc CRIT DMG",
        "note": "Nếu đi vị trí hỗ trợ giảm DEF ngoài sân, Đồng hồ ER là bắt buộc (cần ít nhất 180-200% ER)."
    },
    "subStats": {
        "stats": [
            "Hiệu Quả Nạp (160-200% ER)",
            "CRIT Rate / CRIT DMG",
            "Tinh Thông Nguyên Tố",
            "Tấn công (ATK%)"
        ],
        "note": "Duy trì tỉ lệ bạo kích ổn định để lồng điện Q liên tục kích hoạt sát thương Tăng Cường."
    },
    "talentPriority": {
        "order": [
            "Nguyên tố bùng phát (Q)",
            "Kỹ năng nguyên tố (E)",
            "Đòn thường (NA)"
        ],
        "note": "Q Hoa Hồng Sấm Sét là kỹ năng giá trị nhất sở hữu nội tại giảm 15% Phòng Ngự của kẻ địch. E tụ lực nung sét."
    },
    "playstyleNoteVi": "Thủ thư Lisa sở hữu debuff quý giá bậc nhất Genshin Impact: nội tại tự động Giảm 15% DEF (Phòng Ngự) của mọi kẻ địch trong vùng chiêu nộ Q suốt 15 giây. Trong các đội hình Raiden Shogun Nuke hoặc Alhaitham/Tighnari Tăng Cường, Lisa là quân bài hỗ trợ và kích hoạt phản ứng cực kỳ mạnh mẽ."
},

  // ── amber ──
  "amber": {
    "weapons": [
        {
            "weaponId": "elegy-for-the-end",
            "tier": "S",
            "noteVi": "Tiếng Thở Dài Vô Tận - 55.1% ER, kích hoạt buff 100 EM và 20% ATK cho toàn đội siêu nhanh bằng chiêu Q"
        },
        {
            "weaponId": "favonius-warbow",
            "tier": "S",
            "noteVi": "Cung Tây Phong - Sạc năng lượng liên tục với chiêu Q hồi nhanh"
        },
        {
            "weaponId": "the-stringless",
            "tier": "A",
            "noteVi": "Tuyệt Huyền - Tăng Tinh Thông Nguyên Tố và tăng mạnh sát thương nuke cho Q và Baron Bunny"
        },
        {
            "weaponId": "sharpshooter-s-oath",
            "tier": "B",
            "noteVi": "Lời Thề Xạ Thủ 3★ - 46.9% CRIT DMG và tăng 48% sát thương khi bắn trúng điểm yếu"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "noblesse-oblige"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Tốt nhất - Chiêu Q chỉ tốn 40 năng lượng giúp kích hoạt liên tục buff 20% ATK toàn đội"
        },
        {
            "setIds": [
                "instructor"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Bộ Giáo Quan buff 120 EM toàn đội trong đội hình Hu Tao Bốc Hơi / Tan Chảy"
        },
        {
            "setIds": [
                "wanderer-s-troupe"
            ],
            "mode": "4pc",
            "priority": 3,
            "noteVi": "Dành riêng cho lối chơi ngắm bắn trọng kích điểm yếu của Amber"
        }
    ],
    "mainStats": {
        "sands": "Hiệu Quả Nạp (ER) hoặc ATK%",
        "goblet": "Pyro DMG%",
        "circlet": "CRIT Rate hoặc CRIT DMG",
        "note": "Q chỉ cần 40 năng lượng nên chỉ cần khoảng 140-160% ER là có thể xả chiêu liên tục mỗi rotation."
    },
    "subStats": {
        "stats": [
            "Hiệu Quả Nạp (140-160% ER)",
            "CRIT Rate / CRIT DMG",
            "Tấn công (ATK%)",
            "Tinh Thông Nguyên Tố"
        ],
        "note": "Nếu cầm Cung Tây Phong, hãy ưu tiên đẩy CRIT Rate lên 50-60%."
    },
    "talentPriority": {
        "order": [
            "Nguyên tố bùng phát (Q)",
            "Kỹ năng nguyên tố (E)",
            "Đòn thường (NA)"
        ],
        "note": "Q Mưa Tên bắn 18 mũi tên lửa phá khiên Băng trong 2 giây. E quẳng Baron Bunny dụ quái khiêu khích."
    },
    "playstyleNoteVi": "Kỵ Sĩ Trinh Sát Amber là chuyên gia phá khiên Băng thần tốc và kích hoạt trang bị hỗ trợ nhanh nhất game. Với chiêu Q chỉ tốn 40 năng lượng và tung ra 18 đòn đánh Hỏa trong 2 giây, Amber kích hoạt trọn vẹn 4 tầng Tiếng Thở Dài Vô Tận và buff bộ Tông Thất/Giáo Quan chỉ sau 1 lần bấm nút."
},

  // ── xinyan ──
  "xinyan": {
    "weapons": [
        {
            "weaponId": "redhorn-stonethresher",
            "tier": "S",
            "noteVi": "Xích Giác Phá Thạch Đao - 88.2% CRIT DMG, tăng mạnh DEF và tăng sát thương đòn đánh theo DEF"
        },
        {
            "weaponId": "wolf-s-gravestone",
            "tier": "S",
            "noteVi": "Đường Cùng Của Sói - Cung cấp lượng lớn ATK% cho Xinyan và buff thêm ATK cho cả đội"
        },
        {
            "weaponId": "serpent-spine",
            "tier": "S",
            "noteVi": "Kiếm Ly Cốt - Tăng tới 50% toàn bộ sát thương đòn đánh và cung cấp 27.6% CRIT Rate"
        },
        {
            "weaponId": "whiteblind",
            "tier": "A",
            "noteVi": "Bạch Ảnh Kiếm rèn F2P - Cung cấp DEF% dồi dào để tối đa hóa độ dày của Khiên Lửa"
        },
        {
            "weaponId": "sacrificial-greatsword",
            "tier": "A",
            "noteVi": "Đại Kiếm Tế Lễ - Reset kỹ năng E để luôn giữ khiên và duy trì buff sát thương vật lý"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "pale-flame"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Tối ưu cho DPS Vật Lý - Tăng 50% ST Vật Lý và 18% ATK"
        },
        {
            "setIds": [
                "tenacity-of-the-millelith"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Tối ưu cho hỗ trợ Khiên - Khiên Cấp 3 phát nổ liên tục kích hoạt +20% ATK toàn đội"
        },
        {
            "setIds": [
                "pale-flame",
                "bloodstained-chivalry"
            ],
            "mode": "2+2",
            "priority": 3,
            "noteVi": "2pc Lửa Trắng Xám (+25% ST Vật Lý) + 2pc Kỵ Sĩ (+25% ST Vật Lý) - Đơn giản nuke Q cực mạnh"
        }
    ],
    "mainStats": {
        "sands": "ATK% hoặc DEF%",
        "goblet": "Physical DMG% (hoặc DEF% nếu thuần khiên)",
        "circlet": "CRIT DMG (Cung Mệnh 2 giúp Q luôn bạo kích 100%)",
        "note": "Cung Mệnh 2 của Xinyan đảm bảo sát thương Vật lý từ chiêu Q đạt tỉ lệ bạo kích 100%, cho phép bạn dồn toàn bộ vào Nón CRIT DMG mà không cần CRIT Rate."
    },
    "subStats": {
        "stats": [
            "Sát Thương Bạo Kích (CRIT DMG)",
            "Phòng Ngự (DEF%)",
            "Tấn công (ATK%)",
            "Hiệu Quả Nạp (140-160% ER)"
        ],
        "note": "Dồn tối đa vào CRIT DMG và DEF% để cú nuke Q đạt sát thương hàng trăm ngàn điểm."
    },
    "talentPriority": {
        "order": [
            "Nguyên tố bùng phát (Q)",
            "Kỹ năng nguyên tố (E)",
            "Đòn thường (NA)"
        ],
        "note": "Q Riff Nổi Loạn gây sát thương nuke vật lý diện rộng cực lớn. E tạo khiên lửa và buff 15% ST Vật lý."
    },
    "playstyleNoteVi": "Xinyan là nghệ sĩ nhạc Rock với phong cách nuke Vật Lý bộc phát. Cung Mệnh 2 biến chiêu Q thành đòn đánh 100% bạo kích và tự động tạo khiên lửa Cấp 3. Kỹ năng E tạo khiên lửa tăng 15% sát thương Vật lý và giảm 15% kháng Vật lý của đối thủ trúng đòn."
},

  // ── aloy ──
  "aloy": {
    "weapons": [
        {
            "weaponId": "thundering-pulse",
            "tier": "S",
            "noteVi": "Sấm Sét Rung Động - 66.2% CRIT DMG, tăng 20% ATK và buff sát thương đòn đánh thường Băng"
        },
        {
            "weaponId": "polar-star",
            "tier": "S",
            "noteVi": "Ngôi Sao Cực Đông - CRIT Rate cao 33.1%, tăng sát thương cho kỹ năng E/Q và buff dồn dập ATK%"
        },
        {
            "weaponId": "the-stringless",
            "tier": "A",
            "noteVi": "Tuyệt Huyền - Tăng 165 EM và buff tới 48% sát thương cho chiêu nuke Q Tan Chảy (Reverse Melt)"
        },
        {
            "weaponId": "sacrificial-bow",
            "tier": "A",
            "noteVi": "Cung Tế Lễ - Ném 2 lần bom E để tích nhanh 4 cuộn dây chuyển hóa đòn đánh thường Băng"
        }
    ],
    "artifacts": [
        {
            "setIds": [
                "blizzard-strayer"
            ],
            "mode": "4pc",
            "priority": 1,
            "noteVi": "Tối ưu nhất cho đội Đóng Băng - Tăng 15% ST Băng và nhận tới 40% CRIT Rate miễn phí"
        },
        {
            "setIds": [
                "noblesse-oblige"
            ],
            "mode": "4pc",
            "priority": 2,
            "noteVi": "Q chỉ tốn 40 năng lượng, buff liên tục 20% ATK cho toàn đội"
        },
        {
            "setIds": [
                "blizzard-strayer",
                "gladiator-s-finale"
            ],
            "mode": "2+2",
            "priority": 3,
            "noteVi": "2pc Dũng Sĩ Băng (+15% ST Băng) + 2pc Giác Đấu (+18% Tấn Công)"
        }
    ],
    "mainStats": {
        "sands": "ATK% (hoặc Tinh Thông EM nếu chơi nuke Tan Chảy)",
        "goblet": "Cryo DMG%",
        "circlet": "CRIT Rate hoặc CRIT DMG",
        "note": "Nếu đi cùng đội hình có Hỏa để Aloy Q nuke Tan Chảy, Đồng hồ EM hoặc Ly Cryo DMG cho sát thương đột biến."
    },
    "subStats": {
        "stats": [
            "CRIT Rate / CRIT DMG (1:2)",
            "Tấn công (ATK%)",
            "Tinh Thông Nguyên Tố",
            "Hiệu Quả Nạp (120-140% ER)"
        ],
        "note": "Chiêu Q của Aloy chỉ tiêu tốn 40 năng lượng nên không đòi hỏi quá nhiều chỉ số nạp."
    },
    "talentPriority": {
        "order": [
            "Nguyên tố bùng phát (Q)",
            "Kỹ năng nguyên tố (E)",
            "Đòn thường (NA)"
        ],
        "note": "Q Pháo Tiên Tri ném pin nhiên liệu gây lượng sát thương Băng nuke diện rộng khổng lồ. E quẳng bom đông lạnh."
    },
    "playstyleNoteVi": "Aloy là thợ săn viễn chinh với kỹ năng Q Pháo Tiên Tri chỉ tốn 40 năng lượng gây sát thương Băng bộc phát cực mạnh khi kết hợp phản ứng Tan Chảy (Reverse Melt x1.5). Kỹ năng E ném bom đóng băng chia thành các quả bom nhỏ tích 4 cuộn dây để chuyển hóa đòn đánh thường thành sát thương Băng."
},

  "traveler-dendro": {
    weapons: [
      { weaponId: "favonius-sword", tier: "S", noteVi: "Kiếm Tây Phong - Tốt nhất đảm bảo nạp hạt cho Q 80 năng lượng" },
      { weaponId: "sacrificial-sword", tier: "S", noteVi: "Kiếm Tế Lễ - Reset hồi chiêu E tạo 2 đợt hạt nguyên tố" },
      { weaponId: "freedom-sworn", tier: "S", noteVi: "Lời Thề Tự Do Cổ Xưa - Buff EM và sát thương cho đồng đội" },
      { weaponId: "sapwood-blade", tier: "A", noteVi: "Kiếm Gỗ Sumeru rèn F2P - Tăng ER và thả Lá Sinh Mệnh buff 120 EM" },
      { weaponId: "skyward-blade", tier: "A", noteVi: "Thiên Không Kiếm - Cung cấp lượng lớn Hiệu Quả Nạp" },
    ],
    artifacts: [
      { setIds: ["deepwood-memories"], mode: "4pc", priority: 1, noteVi: "Chuẩn nhất - Giảm 30% kháng Thảo của kẻ địch cho toàn đội Hyperbloom/Bloom/Spread" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 2, noteVi: "Tăng 20% ATK cho toàn đội khi thi triển Q (nếu đội đã có người mang Ký Ức Rừng Sâu)" },
      { setIds: ["emblem-of-severed-fate"], mode: "4pc", priority: 3, noteVi: "Tối ưu hóa khả năng nạp và sát thương bộc phát từ Q" },
    ],
    mainStats: {
      sands: "Hiệu Quả Nạp (ER)",
      goblet: "Dendro DMG% hoặc Tinh Thông Nguyên Tố (EM)",
      circlet: "CRIT Rate (để kích nội tại Kiếm Tây Phong) hoặc EM",
      note: "Yêu cầu tiên quyết là duy trì Q liên tục mỗi chu kỳ rotation, do đó Đồng Hồ ER là bắt buộc.",
    },
    subStats: {
      stats: ["Hiệu Quả Nạp (200-240% ER)", "CRIT Rate (40-60%)", "Tinh Thông Nguyên Tố (EM)", "Tấn công (ATK%)"],
      note: "Khi đi một mình một hệ Thảo, Nhà Lữ Hành cần tối thiểu 220% ER. Nếu có đồng đội Thảo thứ 2 (Nahida/Baizhu), mốc nạp giảm xuống 180%.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q Vòm Lá Sen Cỏ là cốt lõi cấp ấn Thảo liên tục từ ngoài sân. E tạo 2.5 - 3 hạt năng lượng. NA không nâng.",
    },
    playstyleNoteVi:
      "Nhà Lữ Hành Thảo là trụ cột cấp ấn Thảo F2P hàng đầu cho các đội hình Nở Rộ (Hyperbloom) và Bung Tỏa (Burgeon). Lưu ý: Q Vòm Lá Sen Cỏ sẽ bị nổ và biến mất nếu tiếp xúc với ấn Hỏa trước khi được Thủy hoặc Lôi tiếp xúc! Do đó luôn gắn ấn Thủy/Lôi vào Vòm Sen trước.",
  },

  "traveler-anemo": {
    weapons: [
      { weaponId: "favonius-sword", tier: "S", noteVi: "Kiếm Tây Phong - Nạp hạt cho toàn đội" },
      { weaponId: "iron-sting", tier: "S", noteVi: "Thiết Phong Kích - Tăng mạnh Tinh Thông Nguyên Tố cho phản ứng Khuếch Tán" },
      { weaponId: "freedom-sworn", tier: "S", noteVi: "Lời Thề Tự Do Cổ Xưa - Vũ khí hỗ trợ 5 sao hoàn hảo" },
      { weaponId: "sacrificial-sword", tier: "A", noteVi: "Kiếm Tế Lễ - Gom quái liên tục" },
    ],
    artifacts: [
      { setIds: ["viridescent-venerer"], mode: "4pc", priority: 1, noteVi: "Bắt buộc - Giảm 40% kháng nguyên tố được khuếch tán trong 10 giây" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 2, noteVi: "Tăng 20% tấn công toàn đội sau khi dùng Q" },
    ],
    mainStats: {
      sands: "Tinh Thông Nguyên Tố (EM) hoặc ER%",
      goblet: "Tinh Thông Nguyên Tố (EM) hoặc Anemo DMG%",
      circlet: "Tinh Thông Nguyên Tố (EM) hoặc CRIT Rate",
      note: "Build Full EM (3 món Sands, Goblet, Circlet) tối đa hóa sát thương phản ứng Khuếch Tán.",
    },
    subStats: {
      stats: ["Tinh Thông Nguyên Tố (EM)", "Hiệu Quả Nạp (160-180% ER)", "CRIT Rate", "ATK%"],
      note: "Đảm bảo nạp ổn định để thả Lốc Xoáy Q gom quái.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E hút và hất văng quái. Q cuốn phăng kẻ địch nhỏ đi xa.",
    },
    playstyleNoteVi:
      "Tận dụng set 4 Bóng Hình Màu Xanh (VV) để giảm kháng nguyên tố chủ lực của đội. Giữ E gom quái và Q tạo lốc hút nguyên tố.",
  },

  "traveler-geo": {
    weapons: [
      { weaponId: "primordial-jade-cutter", tier: "S", noteVi: "Bàn Nhan Kết Lục - CRIT Rate khổng lồ và tăng ATK" },
      { weaponId: "mistsplitter-reforged", tier: "S", noteVi: "Ánh Sương Đêm Sương Mù - Sát thương bạo kích và sát thương Nham cực lớn" },
      { weaponId: "festering-desire", tier: "A", noteVi: "Răng Nanh Rỉ Sét - Tăng mạnh sát thương và CRIT Rate kỹ năng E" },
      { weaponId: "harbinger-of-dawn", tier: "A", noteVi: "Thần Kiếm Lê Minh R5 - Vũ khí 3 sao F2P cực mạnh nếu giữ máu trên 90%" },
    ],
    artifacts: [
      { setIds: ["golden-troupe"], mode: "4pc", priority: 1, noteVi: "Đoàn Kịch Hoàng Kim - Buff tối đa 70% sát thương nuke cho Sao Băng E" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 2, noteVi: "Nghi Thức Tông Thất - Tăng 20% ATK cho toàn đội sau khi dựng Thành Trì Q" },
    ],
    mainStats: {
      sands: "Tấn công (ATK%)",
      goblet: "Geo DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Q chỉ tốn 60 năng lượng và hoàn lại 15 năng lượng nên không cần đồng hồ ER.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "Tấn công (ATK%)", "Hiệu Quả Nạp (120-130%)"],
      note: "Kỹ năng E có tỉ lệ scale cực lớn lên tới 500%+ ATK ở cấp cao, hãy dồn chỉ số Crit để nuke.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E Thức Kiếm Sao Băng nuke sát thương Nham khủng khiếp. Q dựng tường đá buff 10% CRIT Rate cho đồng đội đứng trong vòng.",
    },
    playstyleNoteVi:
      "Thả E tạo tảng đá nuke sát thương và chặn đường quái. Bật Q tạo vùng thành trì đá buff thêm 10% CRIT Rate và kháng gián đoạn cho đồng đội.",
  },

  "traveler-electro": {
    weapons: [
      { weaponId: "favonius-sword", tier: "S", noteVi: "Kiếm Tây Phong - Siêu sạc năng lượng" },
      { weaponId: "sacrificial-sword", tier: "S", noteVi: "Kiếm Tế Lễ - Tạo gấp đôi Magatama" },
      { weaponId: "skyward-blade", tier: "A", noteVi: "Cung cấp ER dồi dào" },
    ],
    artifacts: [
      { setIds: ["emblem-of-severed-fate"], mode: "4pc", priority: 1, noteVi: "Dấu Ấn Ngăn Cách - Chuyển hóa ER thành sát thương Q" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 2, noteVi: "Buff 20% ATK cho toàn đội" },
    ],
    mainStats: {
      sands: "Hiệu Quả Nạp (ER)",
      goblet: "Electro DMG% hoặc ATK%",
      circlet: "CRIT Rate",
      note: "Càng nhiều ER thì bùa Magatama truyền cho đồng đội càng nạp được nhiều năng lượng.",
    },
    subStats: {
      stats: ["Hiệu Quả Nạp (250%+ ER)", "CRIT Rate", "ATK%"],
      note: "Stack ER tối đa có thể.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E thả 3 bùa Magatama sạc năng lượng khi đồng đội nhặt.",
    },
    playstyleNoteVi:
      "Dùng làm sạc pin chuyên dụng cho các nhân vật nộ đắt (Eula, Xiao, Xiangling). E tạo bùa nạp rồi đổi sang chủ lực nhặt bùa.",
  },

  "traveler-hydro": {
    weapons: [
      { weaponId: "favonius-sword", tier: "S", noteVi: "Kiếm Tây Phong - Đảm bảo năng lượng" },
      { weaponId: "fleuve-cendre-ferryman", tier: "S", noteVi: "Ống Nước Fontaine F2P - Tăng CRIT Rate và ER cho chiêu E" },
      { weaponId: "sacrificial-sword", tier: "A", noteVi: "Kiếm Tế Lễ" },
    ],
    artifacts: [
      { setIds: ["golden-troupe"], mode: "4pc", priority: 1, noteVi: "Tăng 70% sát thương bắn nước kỹ năng E" },
      { setIds: ["nymph-s-dream"], mode: "4pc", priority: 2, noteVi: "Tăng sát thương Thủy và ATK" },
    ],
    mainStats: {
      sands: "HP% hoặc Hiệu Quả Nạp (ER)",
      goblet: "Hydro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Chiêu E bắn đạn nước tiêu hao HP của bản thân.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "HP%", "Hiệu Quả Nạp (180%)", "ATK%"],
      note: "Cân bằng giữa sát thương và nạp.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E ngắm bắn Giọt Nước Xối Xả. Q thả bóng nước trôi về phía trước.",
    },
    playstyleNoteVi:
      "Giữ E để ngắm bắn đạn nước tầm xa tiêu hao HP, nhặt Giọt Nước Tinh Khiết hồi phục HP. Bật Q thả bóng nước gây sát thương Thủy liên tục.",
  },

  "traveler-pyro": {
    weapons: [
      { weaponId: "peak-patrol-song", tier: "S", noteVi: "Trấn hỗ trợ tăng DEF và sát thương nguyên tố toàn đội" },
      { weaponId: "favonius-sword", tier: "S", noteVi: "Kiếm Tây Phong - Chuẩn mực sạc hạt" },
      { weaponId: "flute-of-ezpitzal", tier: "A", noteVi: "Ống Sáo Natlan rèn F2P" },
    ],
    artifacts: [
      { setIds: ["scroll-of-the-hero-of-cinder-city"], mode: "4pc", priority: 1, noteVi: "Bí Cảnh Natlan - Buff 40% sát thương nguyên tố phản ứng toàn đội" },
      { setIds: ["obsidian-codex"], mode: "4pc", priority: 2, noteVi: "Hắc Diệu Bí Điển - Tăng 40% CRIT Rate trong trạng thái Dạ Hồn" },
    ],
    mainStats: {
      sands: "ATK% hoặc Hiệu Quả Nạp (ER)",
      goblet: "Pyro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Sử dụng cơ chế Dạ Hồn đặc trưng của vùng đất Natlan.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "Tấn công (ATK%)", "Hiệu Quả Nạp (160-180%)", "Tinh Thông Nguyên Tố"],
      note: "Tối ưu hóa sát thương phản ứng Hỏa.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E kích hoạt trạng thái Dạ Hồn thiêu đốt đối thủ.",
    },
    playstyleNoteVi:
      "Kích hoạt trạng thái Dạ Hồn bằng E để cấp ấn Hỏa và buff sát thương nguyên tố cho đồng đội với bộ Thánh Di Vật Dũng Sĩ Tro Tàn.",
  },

  "lan-yan": {
    weapons: [
      { weaponId: "sacrificial-fragments", tier: "S", noteVi: "Mảnh Chương Tế Lễ - Tinh thông 221 EM và reset hồi chiêu E" },
      { weaponId: "favonius-codex", tier: "S", noteVi: "Tây Phong Mật Điển - Nạp năng lượng toàn đội mượt mà" },
      { weaponId: "a-thousand-floating-dreams", tier: "S", noteVi: "Cõi Mộng Ngàn Đêm - Tinh thông nguyên tố khổng lồ" },
      { weaponId: "hakushin-ring", tier: "A", noteVi: "Vòng Bạch Anh rèn F2P - Buff sát thương Lôi/Phong khi kích hoạt phản ứng" },
    ],
    artifacts: [
      { setIds: ["viridescent-venerer"], mode: "4pc", priority: 1, noteVi: "4pc Bóng Hình Màu Xanh (VV) - Giảm 40% kháng nguyên tố được khuếch tán" },
      { setIds: ["song-of-days-past"], mode: "4pc", priority: 2, noteVi: "Khúc Ca Ngày Cũ - Tăng sát thương phẳng theo lượng trị liệu" },
    ],
    mainStats: {
      sands: "Tinh Thông Nguyên Tố (EM) hoặc ER%",
      goblet: "Tinh Thông Nguyên Tố (EM) hoặc Anemo DMG%",
      circlet: "Tinh Thông Nguyên Tố (EM) hoặc CRIT Rate",
      note: "Build Full EM để tối đa hóa sát thương phản ứng Khuếch Tán và chia sẻ chỉ số.",
    },
    subStats: {
      stats: ["Tinh Thông Nguyên Tố (EM)", "Hiệu Quả Nạp (160-180% ER)", "CRIT Rate", "ATK%"],
      note: "Lan Yan mang pháp khí hệ Phong 4 sao linh hoạt.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E lướt né và kéo gom kẻ địch. Q mở lân quang phong trường.",
    },
    playstyleNoteVi:
      "Lan Yan (Lục Lân) là hỗ trợ Pháp Khí hệ Phong cơ động, có khả năng kích hoạt 4VV giảm kháng nhanh chóng và khống chế quái vật nhẹ nhàng.",
  },

  "mitya": {
    weapons: [
      { weaponId: "starsealed-edict", tier: "S", noteVi: "Sắc Lệnh Phong Ấn Sao - Vũ khí trấn 5 sao độc quyền phiên bản 7.2 (CRIT DMG 66.2%)" },
      { weaponId: "kagura-s-verity", tier: "S", noteVi: "Chân Ý Của Kagura - CRIT DMG cực lớn và buff liên tục sát thương Kỹ Năng Nguyên Tố" },
      { weaponId: "lost-prayer-to-the-sacred-winds", tier: "S", noteVi: "Điển Tích Tây Phong - CRIT Rate 33.1% và tăng tốc chạy + buff sát thương nguyên tố Lôi" },
      { weaponId: "the-widsith", tier: "A", noteVi: "Chương Nhạc Lang Thang R5 - CRIT DMG 55.1%, bùng nổ sát thương cực mạnh khi đứng sân" },
      { weaponId: "flowing-purity", tier: "A", noteVi: "Dòng Chảy Thuần Khiết R5 rèn F2P - Tăng tấn công và sát thương nguyên tố" },
    ],
    artifacts: [
      { setIds: ["thundering-fury"], mode: "4pc", priority: 1, noteVi: "Như Sấm Thịnh Nộ - Tăng sát thương phản ứng Tăng Cường/Điện Cảm/Quá Tải và giảm hồi chiêu E liên tục" },
      { setIds: ["gilded-dreams"], mode: "4pc", priority: 2, noteVi: "Giấc Mộng Hoàng Kim - Buff khổng lồ Tinh Thông Nguyên Tố và Tấn Công cho đội hình Lôi - Thảo" },
      { setIds: ["golden-troupe"], mode: "4pc", priority: 3, noteVi: "Đoàn Kịch Hoàng Kim - Tối đa hóa sát thương đòn đánh từ kỹ năng nguyên tố E" },
    ],
    mainStats: {
      sands: "Tấn công (ATK%) hoặc Tinh Thông Nguyên Tố (EM)",
      goblet: "Sát thương Lôi (Electro DMG%)",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Mitya là DPS Pháp Khí hệ Lôi chủ lực của phiên bản 7.2.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "Tấn công (ATK%)", "Tinh Thông Nguyên Tố", "Hiệu Quả Nạp (120-130%)"],
      note: "Duy trì tỷ lệ Crit vàng 70% CR : 140%+ CD để tối ưu hóa đòn đánh tia chớp.",
    },
    talentPriority: {
      order: ["Đòn thường (NA)", "Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)"],
      note: "Đòn đánh thường và trọng kích phóng tia chớp năng lượng cao là nguồn sát thương đứng sân chính.",
    },
    playstyleNoteVi:
      "Mitya là chuyên gia năng lượng Snezhnaya sử dụng Pháp Khí hệ Lôi. Thi triển đòn đánh thường và trọng kích phóng tia chớp năng lượng cao, kết hợp kỹ năng nguyên tố E kích hoạt trường điện từ và chiêu Nộ Q phóng luồng xung kích Lôi hủy diệt kẻ địch.",
  },

  "valeriy": {
    weapons: [
      { weaponId: "freedom-sworn", tier: "S", noteVi: "Lời Thề Tự Do Cổ Xưa - Vũ khí hỗ trợ đỉnh cao, tăng EM và buff 20% ATK + 16% sát thương đòn đánh cho toàn đội" },
      { weaponId: "primordial-jade-cutter", tier: "S", noteVi: "Bàn Nham Kết Lục - CRIT Rate 44.1% cực lớn và chuyển hóa HP thành ATK" },
      { weaponId: "favonius-sword", tier: "S", noteVi: "Kiếm Tây Phong - Sạc năng lượng liên tục cho Valeriy và đồng đội" },
      { weaponId: "fleuve-cendre-ferryman", tier: "A", noteVi: "Phà Fleuve Cendre (Ống Nước) F2P - Tăng hiệu quả nạp và 16% CRIT Rate kỹ năng E" },
      { weaponId: "sacrificial-sword", tier: "A", noteVi: "Kiếm Tế Lễ - Reset hồi chiêu E và cung cấp lượng lớn Hiệu Quả Nạp" },
    ],
    artifacts: [
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 1, noteVi: "Nghi Thức Tông Thất Cổ - Buff 20% ATK cho toàn đội sau khi thi triển Kỹ Năng Nộ" },
      { setIds: ["thundering-fury"], mode: "4pc", priority: 2, noteVi: "Như Sấm Thịnh Nộ - Gia tăng sát thương phản ứng Lôi và hỗ trợ kích hoạt hiệu ứng nhanh" },
      { setIds: ["emblem-of-severed-fate"], mode: "4pc", priority: 3, noteVi: "Dấu Ấn Ngăn Cách - Chuyển hóa toàn bộ Hiệu Quả Nạp thành sát thương Nộ Lôi" },
    ],
    mainStats: {
      sands: "Hiệu Quả Nạp (ER) hoặc ATK%",
      goblet: "Sát thương Lôi (Electro DMG%)",
      circlet: "CRIT Rate (kích Tây Phong) hoặc CRIT DMG",
      note: "Valeriy là chiến binh Đơn Kiếm hệ Lôi phiên bản 7.2 thuộc Snezhnaya, hỗ trợ nạp và cấp ấn Lôi diện rộng.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "Hiệu Quả Nạp (ER >= 180%)", "Tấn công (ATK%)"],
      note: "Đảm bảo ER từ 180% trở lên để luôn sẵn sàng nộ mỗi chu kỳ tác chiến.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Chiêu Nộ Q phóng điện trường bảo hộ và cấp ấn Lôi ngoài sân là ưu tiên số 1.",
    },
    playstyleNoteVi:
      "Valeriy chỉ huy tiểu đoàn nhiệm vụ đặc biệt Snezhnaya, sử dụng Đơn Kiếm hệ Lôi để cấp ấn Lôi ngoài sân, sạc năng lượng cho chủ lực và gia tăng sát thương cho toàn đội.",
  },

  "vesna": {
    weapons: [
      { weaponId: "mistsplitter-reforged", tier: "S", noteVi: "Ánh Sương Đêm Sương Mù - Đỉnh cao Đơn Kiếm với lượng CRIT DMG và buff sát thương nguyên tố dồi dào" },
      { weaponId: "freedom-sworn", tier: "S", noteVi: "Lời Thề Tự Do Cổ Xưa - Cung cấp Tinh Thông Nguyên Tố và buff toàn diện cho đội hình Khuếch Tán" },
      { weaponId: "uraku-misugiri", tier: "S", noteVi: "Kiếm Uraku - CRIT DMG cực lớn cho DPS Phong đứng sân" },
      { weaponId: "fleuve-cendre-ferryman", tier: "A", noteVi: "Hải Uyên Điệu Cuối / Phà Fleuve Cendre rèn & câu cá F2P" },
      { weaponId: "amenoma-kageuchi", tier: "A", noteVi: "Đoản Đao Amenoma - Hỗ trợ hồi năng lượng tối đa" },
    ],
    artifacts: [
      { setIds: ["viridescent-venerer"], mode: "4pc", priority: 1, noteVi: "Bóng Hình Màu Xanh - Giảm 40% kháng nguyên tố của kẻ địch khi kích hoạt Khuếch Tán" },
      { setIds: ["desert-pavilion-chronicle"], mode: "4pc", priority: 2, noteVi: "Sử Ký Đình Các Sa Mạc - Tăng 15% Anemo DMG và 40% sát thương đòn đánh thường/trọng kích" },
    ],
    mainStats: {
      sands: "Tấn công (ATK%) hoặc Tinh Thông Nguyên Tố (EM)",
      goblet: "Sát thương Phong (Anemo DMG%)",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Vesna là Đơn Kiếm hệ Phong 5 sao Snezhnaya.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "Tấn công (ATK%)", "Tinh Thông Nguyên Tố", "Hiệu Quả Nạp (130%)"],
      note: "Cân bằng tỷ lệ Bạo Kích và Tấn Công/Tinh Thông theo vai trò DPS hay Hỗ Trợ.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "Kỹ năng E lướt bão tố và chiêu Q lốc xoáy chân không gom quái diện rộng.",
    },
    playstyleNoteVi:
      "Vesna (5 sao Phong) thống lĩnh Druzhna Snezhnaya, sử dụng Đơn Kiếm bọc bão tố chân không, khống chế diện rộng và kích hoạt phản ứng Khuếch Tán liên tục.",
  },

  "vodyanitsa": {
    weapons: [
      { weaponId: "surf-s-up", tier: "S", noteVi: "Thuyền Lướt Bão - CRIT DMG 88.2% và buff mạnh HP tối đa + sát thương đánh thường" },
      { weaponId: "tome-of-the-eternal-flow", tier: "S", noteVi: "Điển Tích Dòng Chảy Vĩnh Hằng - CRIT DMG 88.2% và hồi năng lượng theo biến động HP" },
      { weaponId: "sacrificial-jade", tier: "S", noteVi: "Ngọc Tế Lễ Nhật Ký Hành Trình - Tăng 36.8% CRIT Rate và 64% Max HP khi rời sân" },
      { weaponId: "the-widsith", tier: "A", noteVi: "Chương Nhạc Lang Thang R5 - Lựa chọn 4 sao dồn sát thương bùng nổ" },
      { weaponId: "prototype-amber", tier: "A", noteVi: "Kim Phách Mẫu F2P - Tăng mạnh HP% và hồi phục năng lượng + hồi máu toàn đội" },
    ],
    artifacts: [
      { setIds: ["golden-troupe"], mode: "4pc", priority: 1, noteVi: "Đoàn Kịch Hoàng Kim - Tăng tới 70% sát thương Kỹ Năng Nguyên Tố ngoài sân" },
      { setIds: ["nymph-s-dream"], mode: "4pc", priority: 2, noteVi: "Giấc Mơ Thủy Tiên - Tăng sát thương Thủy và Tấn Công cộng dồn" },
      { setIds: ["heart-of-depth"], mode: "4pc", priority: 3, noteVi: "Trầm Luân Trong Nước - Tăng 15% Hydro DMG và sát thương đánh thường" },
    ],
    mainStats: {
      sands: "HP%",
      goblet: "Sát thương Thủy (Hydro DMG%)",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Sát thương tỉ lệ thuận với lượng Máu tối đa (Max HP).",
    },
    subStats: {
      stats: ["HP%", "CRIT Rate / CRIT DMG (1:2)", "Hiệu Quả Nạp (140-160%)", "Tinh Thông Nguyên Tố"],
      note: "HP% là chỉ số sát thương hàng đầu của Vodyanitsa.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E tạo sóng ngầm sát thương liên tục từ ngoài sân là nguồn sát thương cốt lõi.",
    },
    playstyleNoteVi:
      "Vodyanitsa (5 sao Thủy) điều khiển thủy triều áp đảo kẻ địch, cấp ấn Thủy diện rộng và khuếch đại sức mạnh cho toàn bộ đội hình.",
  },

  "yumemizuki-mizuki": {
    weapons: [
      {
        weaponId: "a-thousand-floating-dreams",
        tier: "S",
        noteVi: "Trấn tốt nhất - Cung cấp 265 EM khổng lồ và buff Elemental DMG cho đồng đội",
      },
      {
        weaponId: "sacrificial-fragments",
        tier: "S",
        noteVi: "Mảnh Chương Tế Lễ 4★ tốt nhất - 221 EM và hồi chiêu E ngay lập tức",
      },
      {
        weaponId: "wandering-evenstar",
        tier: "A",
        noteVi: "Sao Đêm Rong Ruổi - Tăng EM và chia sẻ ATK cho toàn đội dựa trên EM",
      },
      {
        weaponId: "the-widsith",
        tier: "A",
        noteVi: "Chương Nhạc Lang Thang - Sát thương bạo kích và buff chỉ số ngẫu nhiên cực mạnh",
      },
      {
        weaponId: "favonius-codex",
        tier: "B",
        noteVi: "Tây Phong - Đảm bảo sạc nạp Q mượt mà và sinh hạt nguyên tố cho team",
      },
      {
        weaponId: "magic-guide",
        tier: "B",
        noteVi: "Tóm Tắt Ma Pháp 3★ F2P - EM cao và tăng sát thương lên kẻ địch nhiễm Thủy/Lôi",
      },
    ],
    artifacts: [
      {
        setIds: ["viridescent-venerer"],
        mode: "4pc",
        priority: 1,
        noteVi: "Bóng Hình Màu Xanh 4 món - Giảm 40% kháng nguyên tố của mục tiêu khi Khuếch Tán",
      },
      {
        setIds: ["gilded-dreams"],
        mode: "4pc",
        priority: 2,
        noteVi: "Giấc Mộng Hoàng Kim 4 món - Tối đa hóa Tinh Thông Nguyên Tố cho chuỗi phản ứng",
      },
      {
        setIds: ["desert-pavilion-chronicle"],
        mode: "4pc",
        priority: 3,
        noteVi: "Sử thi Đình Các Sa Mạc - Lựa chọn cho phong cách On-field DPS Anemo tốc đánh cao",
      },
    ],
    mainStats: {
      sands: "Tinh Thông Nguyên Tố (EM) hoặc Hiệu Quả Nạp (ER%)",
      goblet: "Tinh Thông Nguyên Tố (EM) hoặc Sát Thương Phong (Anemo DMG%)",
      circlet: "Tinh Thông Nguyên Tố (EM) hoặc Tỷ Lệ Bạo Kích (CRIT Rate)",
      note: "Hướng build Full EM (EM/EM/EM) là tối ưu nhất cho hiệu quả Khuếch Tán và buff đội hình.",
    },
    subStats: {
      stats: ["Tinh Thông Nguyên Tố (EM)", "Hiệu Quả Nạp (ER%)", "Tỷ Lệ Bạo Kích (CRIT Rate)", "Sát Thương Bạo Kích (CRIT DMG)", "Tấn Công (ATK%)"],
      note: "Ưu tiên đạt 140-160% ER để nạp Q liên tục, sau đó dồn toàn lực vào Tinh Thông Nguyên Tố (EM).",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Kỹ năng nộ (Q)", "Đòn đánh thường (NA)"],
      note: "Kỹ năng E là nguồn kích hoạt Khuếch Tán và gom ấn chính, nâng Q song song để hỗ trợ toàn diện.",
    },
    playstyleNoteVi:
      "Yumemizuki Mizuki (5 sao Pháp Khí hệ Phong từ Inazuma) chuyên gia ru ngủ ác mộng và trị liệu tâm lý. Đóng vai trò Driver đứng sân hoặc Hỗ Trợ Khuếch Tán giảm kháng diện rộng cực kỳ xuất sắc với bộ Bóng Hình Màu Xanh.",
  },

};


const ID_ALIASES: Record<string, string> = {
  "yumemizuki-mizuki": "yumemizuki-mizuki",
  "mizuki": "yumemizuki-mizuki",
  "yumemizuki": "yumemizuki-mizuki",
  "traveler-boy-dendro": "traveler-dendro",
  "traveler-girl-dendro": "traveler-dendro",
  "traveler-dendro": "traveler-dendro",
  "traveler-boy-anemo": "traveler-anemo",
  "traveler-girl-anemo": "traveler-anemo",
  "traveler-anemo": "traveler-anemo",
  "traveler-boy-geo": "traveler-geo",
  "traveler-girl-geo": "traveler-geo",
  "traveler-geo": "traveler-geo",
  "traveler-boy-electro": "traveler-electro",
  "traveler-girl-electro": "traveler-electro",
  "traveler-electro": "traveler-electro",
  "traveler-boy-hydro": "traveler-hydro",
  "traveler-girl-hydro": "traveler-hydro",
  "traveler-hydro": "traveler-hydro",
  "traveler-boy-pyro": "traveler-pyro",
  "traveler-girl-pyro": "traveler-pyro",
  "traveler-pyro": "traveler-pyro",
  "aether": "traveler-dendro",
  "lumine": "traveler-dendro",
  "lan-yan": "lan-yan",
  "lanyan": "lan-yan",
  "mitya": "mitya",
  "valeriy": "valeriy",
  "vesna": "vesna",
  "vodyanitsa": "vodyanitsa",
  "kamisato-ayaka": "ayaka",
  "ayaka": "ayaka",
  "kamisato-ayato": "ayato",
  "sangonomiya-kokomi": "kokomi",
  "kokomi": "sangonomiya-kokomi",
  "kazuha": "kaedehara-kazuha",
  "kaedehara-kazuha": "kaedehara-kazuha",
  "itto": "arataki-itto",
  "arataki-itto": "arataki-itto",
  "sara": "kujou-sara",
  "kujou-sara": "kujou-sara",
  "shinobu": "kuki-shinobu",
  "kuki-shinobu": "kuki-shinobu",
  "heizou": "shikanoin-heizou",
  "shikanoin-heizou": "shikanoin-heizou",
  "raiden": "raiden-shogun",
  "raiden-shogun": "raiden-shogun",
  "childe": "tartaglia",
  "hutao": "hu-tao",
  "hu-tao": "hu-tao",
  "yae": "yae-miko",
  "yae-miko": "yae-miko",
  "scaramouche": "wanderer",
  "kunikuzushi": "wanderer",
  "yunjin": "yun-jin",
  "goroubow": "gorou",
};

/**
 * Lấy cấu hình build chuyên sâu của nhân vật, hỗ trợ cả alias và ID chuẩn.
 * Ưu tiên build viết tay (CHARACTER_BUILDS); nếu không có mới dùng bản nháp.
 */
export function getCharacterBuild(characterId: string): CharacterBuildEntry | undefined {
  const normalized = characterId.toLowerCase().trim();
  const alias = ID_ALIASES[normalized];
  return (
    CHARACTER_BUILDS[normalized] ??
    (alias ? CHARACTER_BUILDS[alias] : undefined) ??
    DRAFT_BUILDS[normalized] ??
    (alias ? DRAFT_BUILDS[alias] : undefined)
  );
}

/** Cho biết build đang hiển thị thuộc loại nào (để gắn nhãn trên UI). */
export function getBuildSource(characterId: string): BuildSource {
  const build = getCharacterBuild(characterId);
  if (!build) return "auto";
  return build.status === "draft" ? "draft" : "curated";
}
