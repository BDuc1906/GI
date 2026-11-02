import "dotenv/config";
import fs from "fs";
import path from "path";
import { prisma } from "../src/lib/db/prisma";
import type { CharacterBuildEntry } from "../src/data/character-builds-data";

export const REMAINING_EXPERT_BUILDS: Record<string, CharacterBuildEntry> = {
  // ── Keqing: Electro Sword (Aggravate On-field DPS) ──
  keqing: {
    weapons: [
      { weaponId: "mistsplitter-reforged", tier: "S", noteVi: "Trấn tốt nhất - Base ATK cao, tăng 44.1% CRIT DMG và buff tối đa 28% Sát Thương Nguyên Tố" },
      { weaponId: "primordial-jade-cutter", tier: "S", noteVi: "44.1% CRIT Rate cực lớn, tăng HP và chuyển hóa thành ATK dồi dào" },
      { weaponId: "light-of-foliar-incision", tier: "S", noteVi: "88.2% CRIT DMG, tăng mạnh sát thương đánh thường & kỹ năng theo Tinh Thông Nguyên Tố" },
      { weaponId: "the-black-sword", tier: "A", noteVi: "Kiếm Đen Nhật Ký Hành Trình - Tăng 27.6% CRIT Rate và buff sát thương Trọng Kích" },
      { weaponId: "lion-s-roar", tier: "A", noteVi: "Tiếng Hét Của Rồng - Tăng 36% sát thương lên kẻ địch bị dính ấn Lôi hoặc Hỏa ở R5" },
      { weaponId: "iron-sting", tier: "B", noteVi: "Thiết Phong Kích rèn F2P - Cung cấp Tinh Thông Nguyên Tố cho phản ứng Tăng Cường" },
    ],
    artifacts: [
      { setIds: ["thundering-fury"], mode: "4pc", priority: 1, noteVi: "Tối ưu nhất - Tăng 15% ST Lôi, tăng 20% ST Tăng Cường và giảm liên tục hồi chiêu E" },
      { setIds: ["gilded-dreams"], mode: "4pc", priority: 2, noteVi: "Tăng 80 EM và buff thêm một lượng lớn ATK% cùng EM theo đồng đội" },
      { setIds: ["thundersoother"], mode: "4pc", priority: 3, noteVi: "Tăng 35% toàn bộ sát thương lên kẻ địch bị đính kèm ấn Lôi" },
      { setIds: ["thundering-fury", "gladiator-s-finale"], mode: "2+2", priority: 4, noteVi: "2pc Như Sấm (+15% ST Lôi) + 2pc Giác Đấu (+18% Tấn Công)" },
      { setIds: ["thundering-fury", "gilded-dreams"], mode: "2+2", priority: 5, noteVi: "2pc Như Sấm (+15% ST Lôi) + 2pc Hoàng Kim (+80 Tinh Thông)" },
    ],
    mainStats: {
      sands: "ATK% hoặc Tinh Thông Nguyên Tố (EM)",
      goblet: "Electro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Trong đội hình Tăng Cường (Aggravate), Đồng hồ EM cạnh tranh sòng phẳng hoặc nhỉnh hơn Đồng hồ ATK% nếu đã có buff ATK từ đồng đội.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "Tấn công (ATK%)", "Tinh Thông Nguyên Tố (100-200 EM)", "Hiệu Quả Nạp (110-120%)"],
      note: "Ưu tiên đạt tỉ lệ CRIT chuẩn (ít nhất 70% CR / 140% CD), Keqing có nội tại tự tăng 15% CRIT Rate sau khi dùng Q.",
    },
    talentPriority: {
      order: ["Đòn thường (NA)", "Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)"],
      note: "Trọng kích đòn thường là nguồn sát thương dồn liên tục lớn nhất. E dịch chuyển chém nuke và Q quét kiếm diện rộng.",
    },
    playstyleNoteVi:
      "Keqing lột xác thành top DPS khi đi cùng hệ Thảo kích hoạt phản ứng Tăng Cường (Aggravate). Chu kỳ: Đồng đội gắn ấn Thảo & khuếch tán Lôi -> Keqing E ném kiếm -> Q bộc phát sát thương chém quét -> E lao tới kích hoạt đính kèm Lôi -> Spam Trọng kích dồn sát thương liên tục.",
  },

  // ── Mona: Hydro Catalyst (Omen DMG Buffer & Nuke Sub-DPS) ──
  mona: {
    weapons: [
      { weaponId: "thrilling-tales-of-dragon-slayers", tier: "S", noteVi: "Câu Chuyện Diệt Rồng R5 - Buff 48% ATK cho DPS đứng sân sau khi chuyển đổi nhân vật" },
      { weaponId: "favonius-codex", tier: "S", noteVi: "Tây Phong Mật Điển - Nạp năng lượng dồi dào đảm bảo luôn có Q mỗi chu kỳ rotation" },
      { weaponId: "the-widsith", tier: "A", noteVi: "Chương Nhạc Lang Thang - Sát thương bạo kích và buff ngẫu nhiên cực mạnh khi build Mona Nuke Q" },
      { weaponId: "skyward-atlas", tier: "A", noteVi: "Quyển Thiên Không - Tăng mạnh Base ATK và sát thương nguyên tố toàn diện" },
      { weaponId: "prototype-amber", tier: "B", noteVi: "Mẫu Kim Phách rèn F2P - Giúp Mona kiêm luôn vai trò hồi máu toàn đội khi dùng Q" },
    ],
    artifacts: [
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 1, noteVi: "Chuẩn nhất - Tăng 20% sát thương Q và buff thêm 20% ATK cho toàn đội sau khi dùng Q" },
      { setIds: ["emblem-of-severed-fate"], mode: "4pc", priority: 2, noteVi: "Tăng 20% Hiệu quả nạp và chuyển hóa tối đa 75% nạp thành sát thương Bùng Phát Q" },
      { setIds: ["tenacity-of-the-millelith"], mode: "4pc", priority: 3, noteVi: "Tăng 20% HP và E Phantom giật sát thương liên tục kích hoạt 20% ATK cho đội" },
    ],
    mainStats: {
      sands: "Hiệu Quả Nạp (ER)",
      goblet: "Hydro DMG% hoặc ATK%",
      circlet: "CRIT Rate hoặc CRIT DMG (hoặc Healing Bonus nếu cầm Kim Phách)",
      note: "Nội tại Mona tự chuyển hóa 20% Hiệu Quả Nạp thành Sát Thương Thủy, nên Đồng hồ ER vừa giải quyết bài toán nạp vừa tăng trực tiếp sát thương.",
    },
    subStats: {
      stats: ["Hiệu Quả Nạp (200-240% ER)", "CRIT Rate (để kích hoạt Tây Phong)", "CRIT DMG", "ATK%", "Tinh Thông Nguyên Tố"],
      note: "Chỉ số quan trọng nhất của Mona là Hiệu Quả Nạp (ER). Luôn duy trì trên 200% ER để không bao giờ bị trễ nhịp Q.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q Quỹ Đạo Tinh Mệnh là giá trị cốt lõi (tạo hiệu ứng Điềm Báo Omen tăng 60% sát thương nhận vào của địch). NA không cần nâng.",
    },
    playstyleNoteVi:
      "Mona áp dụng hiệu ứng Điềm Báo (Omen) khuếch đại sát thương nhận vào của kẻ địch lên đến 60%. Trong đội hình Đóng Băng (Morgana), hiệu ứng Đóng Băng giữ trạng thái Omen kéo dài tới 13 giây. Chu kỳ: E thả ảo ảnh áp ấn Thủy -> Q trói bóng nước -> DPS chính lao vào nuke hủy diệt kẻ địch.",
  },

  // ── Klee: Pyro Catalyst (Monopyro / Vaporize On-field DPS) ──
  klee: {
    weapons: [
      { weaponId: "lost-prayer-to-the-sacred-winds", tier: "S", noteVi: "Điển Tích Tây Phong - 33.1% CRIT Rate, tăng tốc độ di chuyển và buff dồn dập sát thương nguyên tố" },
      { weaponId: "tome-of-the-eternal-flow", tier: "S", noteVi: "88.2% CRIT DMG, tăng mạnh sát thương Trọng Kích khi có biến động lượng máu" },
      { weaponId: "the-widsith", tier: "S", noteVi: "Chương Nhạc Lang Thang R5 - CRIT DMG cao, 3 dòng buff ngẫu nhiên (ATK/DMG/EM) đều cực kỳ hữu ích" },
      { weaponId: "sacrificial-jade", tier: "A", noteVi: "Ngọc Tế Lễ Nhật Ký Hành Trình - CRIT Rate 36.8% và tăng EM/HP khi ở ngoài sân" },
      { weaponId: "dodoco-tales", tier: "A", noteVi: "Tuyển Tập Dodoco - Vũ khí kỷ niệm chuẩn phong cách Klee, buff qua lại giữa đánh thường và trọng kích" },
      { weaponId: "solar-pearl", tier: "A", noteVi: "Nhật Nguyệt Hắc Ám - CRIT Rate cân bằng, kích hoạt buff đòn đánh thường và kỹ năng" },
    ],
    artifacts: [
      { setIds: ["crimson-witch-of-flames"], mode: "4pc", priority: 1, noteVi: "Tối ưu nhất - Tăng 15% ST Hỏa, tăng mạnh phản ứng Bốc Hơi/Tan Chảy và tích tầng từ 2 lần E" },
      { setIds: ["lavawalker"], mode: "4pc", priority: 2, noteVi: "Tốt nhất đội Monopyro - Tăng 35% toàn bộ sát thương lên kẻ địch bị dính ấn Hỏa liên tục" },
      { setIds: ["shimenawa-s-reminiscence"], mode: "4pc", priority: 3, noteVi: "Tăng 18% ATK và buff 50% sát thương Trọng Kích cực lớn khi dùng E" },
      { setIds: ["crimson-witch-of-flames", "gladiator-s-finale"], mode: "2+2", priority: 4, noteVi: "2pc Ma Nữ (+15% ST Hỏa) + 2pc Giác Đấu (+18% Tấn Công)" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Pyro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Klee có Base ATK cao và tần suất gắn ấn Hỏa quá dày đặc, Ly Pyro DMG% và Đồng hồ ATK% là sự kết hợp tiêu chuẩn tối ưu nhất.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "Tấn công (ATK%)", "Hiệu Quả Nạp (120-130% ER)", "Tinh Thông Nguyên Tố"],
      note: "Klee cần duy trì tỉ lệ CRIT cao (>= 70%) vì mỗi khi Trọng kích bạo kích, nội tại sẽ hồi năng lượng cho toàn bộ đội hình.",
    },
    talentPriority: {
      order: ["Đòn thường (NA)", "Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)"],
      note: "Đòn đánh thường & Trọng kích là nguồn sát thương số 1. E ném bom nảy và Q gọi hoa lửa bắn tự động đều cần nâng đều.",
    },
    playstyleNoteVi:
      "Klee là pháp sư ném bom áp ấn Hỏa dày đặc nhất game với khả năng phá vỡ thế trận và đánh bật quái (Stagger) cực kỳ bá đạo. Chu kỳ: Đồng đội gom quái & bật buff Hỏa -> Klee E ném Bom Nảy x2 -> Q bật mưa hoa lửa -> Đánh thường tạo Tia Lửa Bùng Nổ -> Trọng Kích hất tung đối thủ mà không tốn thể lực.",
  },

  // ── Qiqi: Cryo Sword (Healer & Ocean-Hued Clam Physical Driver) ──
  qiqi: {
    weapons: [
      { weaponId: "sacrificial-sword", tier: "S", noteVi: "Kiếm Tế Lễ - Khắc phục điểm yếu hồi chiêu 30s của E, nạp năng lượng và cho phép gọi E liên tục" },
      { weaponId: "favonius-sword", tier: "S", noteVi: "Kiếm Tây Phong - Sạc năng lượng dồi dào cho Qiqi và toàn bộ đồng đội" },
      { weaponId: "amenoma-kageuchi", tier: "A", noteVi: "Đoản Đao Amenoma rèn Inazuma - Tăng mạnh ATK% để hồi máu và hồi phục năng lượng sau khi dùng Q" },
      { weaponId: "skyward-blade", tier: "A", noteVi: "Thiên Không Kiếm - Base ATK cao, tăng Hiệu Quả Nạp và một ít CRIT Rate" },
    ],
    artifacts: [
      { setIds: ["ocean-hued-clam"], mode: "4pc", priority: 1, noteVi: "Tối thượng cho Qiqi - Biến lượng hồi máu khổng lồ thành bọt nước nổ 27,000 - 30,000 sát thương vật lý liên tục" },
      { setIds: ["tenacity-of-the-millelith"], mode: "4pc", priority: 2, noteVi: "Hồn Ma E quay xung quanh trúng địch kích hoạt liên tục +20% ATK cho toàn đội" },
      { setIds: ["maiden-beloved"], mode: "4pc", priority: 3, noteVi: "Bộ Thiếu Nữ tăng lượng hồi máu tối đa (khuyên dùng Xà Cừ để có thêm sát thương)" },
    ],
    mainStats: {
      sands: "Hiệu Quả Nạp (ER) hoặc ATK%",
      goblet: "ATK%",
      circlet: "Tăng Trị Liệu (Healing Bonus) hoặc CRIT Rate (nếu dùng Tây Phong)",
      note: "Toàn bộ lượng máu hồi của Qiqi tỉ lệ thuận theo chỉ số Tấn Công (ATK). Nón Tăng Trị Liệu giúp nạp đầy thanh bọt nước Xà Cừ nhanh nhất.",
    },
    subStats: {
      stats: ["Hiệu Quả Nạp (ER 180-220%)", "Tấn công (ATK%)", "Tấn công phẳng (Flat ATK)", "CRIT Rate (để kích nạp Tây Phong)"],
      note: "Qiqi không tự tạo ra hạt nguyên tố khi bật E, do đó chỉ số Hiệu Quả Nạp là ưu tiên hàng đầu để có thể dùng Q cứu sinh mệnh khi cần.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E quay linh hồn hồi máu cho đồng đội đứng sân và hồi toàn đội khi Qiqi chém. Q đóng dấu Bùa Phù Hiệu hồi máu khi đánh quái.",
    },
    playstyleNoteVi:
      "Qiqi sở hữu lượng hồi máu đơn mục tiêu và toàn đội mạnh bậc nhất Genshin Impact. Với bộ Xà Cừ Đại Dương, Qiqi biến lượng hồi máu dư thừa thành các vụ nổ bong bóng 30,000 sát thương vật lý mỗi 3.5 giây. Rất hiệu quả khi đi cùng Furina để kích hoạt tối đa tầng Ná Nức (Fanfare) hoặc kẹp Siêu Dẫn.",
  },

  // ── Sigewinne: Hydro Bow (Skill DMG Buffer & Team Healer) ──
  sigewinne: {
    weapons: [
      { weaponId: "silvershower-heartstrings", tier: "S", noteVi: "Trấn tốt nhất - Cung cấp tới 66% HP và buff thêm CRIT Rate cho chiêu Q" },
      { weaponId: "recurve-bow", tier: "S", noteVi: "Cung Tái Sinh 3★ - Lựa chọn F2P tuyệt vời nhất cung cấp tới 46.9% HP tối đa" },
      { weaponId: "elegy-for-the-end", tier: "A", noteVi: "Tiếng Thở Dài Vô Tận - Nạp năng lượng và kích hoạt buff 100 EM + 20% ATK toàn đội" },
      { weaponId: "favonius-warbow", tier: "A", noteVi: "Cung Tây Phong - Sạc năng lượng hiệu quả cho các đội hình hao tổn mana" },
      { weaponId: "sacrificial-bow", tier: "B", noteVi: "Cung Tế Lễ - Cho phép bắn 2 lần bong bóng E tích thêm hồi máu và nạp" },
    ],
    artifacts: [
      { setIds: ["song-of-days-past"], mode: "4pc", priority: 1, noteVi: "Tốt nhất - Tích lũy lượng hồi máu dồi dào của E để buff flat damage cho đòn đánh của đồng đội" },
      { setIds: ["ocean-hued-clam"], mode: "4pc", priority: 2, noteVi: "Tạo bọt nước nổ sát thương vật lý liên tục theo lượng hồi máu dồi dào" },
      { setIds: ["tenacity-of-the-millelith", "song-of-days-past"], mode: "2+2", priority: 3, noteVi: "2pc Thiên Nham (+20% HP) + 2pc Ngày Cũ (+15% Trị Liệu) hoặc 2pc Vourukasha (+20% HP)" },
    ],
    mainStats: {
      sands: "HP%",
      goblet: "HP%",
      circlet: "HP% hoặc Tăng Trị Liệu (Healing Bonus)",
      note: "Mục tiêu quan trọng nhất của Sigewinne là chạm mốc 65,000 HP để kích hoạt tối đa hạn mức buff sát thương kỹ năng nguyên tố E (+2,800 flat dmg).",
    },
    subStats: {
      stats: ["HP%", "HP phẳng", "Hiệu Quả Nạp (ER 160-180%)", "CRIT Rate (nếu dùng Tây Phong)"],
      note: "Dồn toàn lực vào chỉ số HP% trên tất cả các dòng phụ để sớm chạm trần 65k HP buff kỹ năng.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E Bắn Bong Bóng Phục Dược là kỹ năng cốt lõi chứa toàn bộ hồi máu và buff sát thương đồng đội ngoài sân. Q chỉ bắn xịt nước phụ trợ.",
    },
    playstyleNoteVi:
      "Sigewinne giữ E để nạp viên bong bóng khổng lồ nảy 5 lần hồi máu toàn đội và tự động buff sát thương phẳng (Flat DMG) cực lớn cho Kỹ Năng Nguyên Tố của đồng đội ngoài sân (như Furina E, Chiori búp bê, Nahida Tri-Karma, Fischl Oz, Yae Miko lôi đài).",
  },

  // ── Thoma: Pyro Polearm (Burgeon Trigger & Shield Support) ──
  thoma: {
    weapons: [
      { weaponId: "kitain-cross-spear", tier: "S", noteVi: "Thập Tự Kitain rèn Inazuma - Cung cấp Tinh Thông Nguyên Tố và nội tại tự hồi phục năng lượng cho Q" },
      { weaponId: "dragon-s-bane", tier: "S", noteVi: "Tai Ương Của Rồng - Cho lượng EM khổng lồ 221 điểm, tối ưu hóa sát thương nổ Hạt Nở Rộ (Burgeon)" },
      { weaponId: "favonius-lance", tier: "A", noteVi: "Thương Tây Phong - Tốt nhất cho lối chơi build Khiên Hỏa thuần túy, giải quyết bài toán nạp mana" },
      { weaponId: "rightful-reward", tier: "A", noteVi: "Thưởng Phạt Công Minh rèn Fontaine - Cung cấp HP% và hồi năng lượng khi được hồi máu" },
      { weaponId: "black-tassel", tier: "B", noteVi: "Hắc Anh Thương 3★ - Cung cấp tới 46.9% HP tối đa cho khiên dày nhất" },
    ],
    artifacts: [
      { setIds: ["flower-of-paradise-lost"], mode: "4pc", priority: 1, noteVi: "Tối ưu nhất cho Thoma Bung Tỏa (Burgeon) - Tăng tối đa 80% sát thương phản ứng Nở Rộ" },
      { setIds: ["gilded-dreams"], mode: "4pc", priority: 2, noteVi: "Tăng 80 EM và buff thêm một lượng lớn Tinh Thông Nguyên Tố theo đồng đội" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 3, noteVi: "Tốt nhất khi build Thoma thuần hỗ trợ khiên - Buff 20% ATK cho toàn đội khi Q" },
      { setIds: ["gilded-dreams", "flower-of-paradise-lost"], mode: "2+2", priority: 4, noteVi: "2pc Hoàng Kim (+80 EM) + 2pc Đóa Hoa (+80 EM) — Dễ ghép chỉ số nạp" },
    ],
    mainStats: {
      sands: "Hiệu Quả Nạp (ER) hoặc Tinh Thông Nguyên Tố (EM)",
      goblet: "Tinh Thông Nguyên Tố (EM) hoặc HP% (khiên)",
      circlet: "Tinh Thông Nguyên Tố (EM) hoặc HP% (khiên)",
      note: "Với lối chơi Bung Tỏa (Burgeon), nếu nạp chưa đủ 200% ER thì Đồng hồ Nạp là bắt buộc trước khi dồn vào EM Ly và Nón.",
    },
    subStats: {
      stats: ["Hiệu Quả Nạp (180-220% ER)", "Tinh Thông Nguyên Tố (700-900 EM)", "Máu (HP%)", "CRIT Rate (nếu dùng Tây Phong)"],
      note: "Thoma Q tốn 80 năng lượng. Đảm bảo ER đủ xoay vòng chiêu trước khi tối đa hóa EM.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q tạo Chiến Giáp Lửa Đỏ liên tục phun lửa theo đòn đánh thường là nguồn kích hoạt hạt thảo và hồi lớp khiên. E bổ sung khiên.",
    },
    playstyleNoteVi:
      "Thoma là vị vua kích hoạt phản ứng Bung Tỏa (Burgeon). Khi đồng đội tạo ra các Hạt Thảo trên sân, Thoma Q sẽ bắn luồng sóng lửa diện rộng theo đòn đánh thường để kích nổ đồng loạt các hạt thảo gây sát thương diện rộng cực lớn. Chu kỳ: Tạo hạt thảo -> Thoma Q -> E -> Đánh thường liên tục.",
  },

  // ── Collei: Dendro Bow (Dendro Enabler & Deepwood Support) ──
  collei: {
    weapons: [
      { weaponId: "elegy-for-the-end", tier: "S", noteVi: "Tiếng Thở Dài Vô Tận - 55.1% Hiệu Quả Nạp, kích hoạt buff 100 EM và 20% ATK cho cả đội" },
      { weaponId: "the-stringless", tier: "S", noteVi: "Tuyệt Huyền - Tăng 165 EM và buff tới 48% sát thương cho kỹ năng E và Q ở R5" },
      { weaponId: "favonius-warbow", tier: "S", noteVi: "Cung Tây Phong F2P - Đảm bảo Collei luôn sạc đầy chiêu Q mỗi chu kỳ" },
      { weaponId: "sacrificial-bow", tier: "A", noteVi: "Cung Tế Lễ - Reset kỹ năng E ném thêm một lần Boomerang Thảo" },
    ],
    artifacts: [
      { setIds: ["deepwood-memories"], mode: "4pc", priority: 1, noteVi: "Trang bị chuẩn mực - Giảm 30% Kháng Thảo của kẻ địch trúng đòn cho toàn đội" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 2, noteVi: "Tăng 20% sát thương Q và buff thêm 20% ATK cho toàn đội trong 12 giây" },
      { setIds: ["gilded-dreams", "deepwood-memories"], mode: "2+2", priority: 3, noteVi: "2pc Rừng Sâu (+15% ST Thảo) + 2pc Hoàng Kim (+80 EM)" },
    ],
    mainStats: {
      sands: "Hiệu Quả Nạp (ER) hoặc ATK%",
      goblet: "Dendro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Ưu tiên đảm bảo đủ 180-200% Hiệu Quả Nạp trước khi tối ưu hóa sát thương cá nhân của Collei.",
    },
    subStats: {
      stats: ["Hiệu Quả Nạp (180-200% ER)", "CRIT Rate / CRIT DMG", "Tinh Thông Nguyên Tố", "Tấn công (ATK%)"],
      note: "Cân bằng CRIT Rate từ 50-60% để kích hoạt hạt năng lượng từ Cung Tây Phong.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q ném chú mèo Cuollein-Anbar nhảy nhót tạo vùng ấn Thảo liên tục. E ném phi tiêu boomerang. NA không nâng.",
    },
    playstyleNoteVi:
      "Collei là nhân vật cấp ấn Thảo tầm xa nhanh nhẹn. Kỹ năng E ném phi tiêu kèm nội tại Vòng Lá Mầm gắn ấn Thảo quanh nhân vật, kết hợp Q tạo vùng bùng nổ liên hoàn. Rất ăn ý trong đội hình Nilou Sum Suê, Keqing Tăng Cường hoặc Cyno Sinh Trưởng.",
  },

  // ── Kaveh: Dendro Claymore (Bloom Driver & Shatterbloom DPS) ──
  kaveh: {
    weapons: [
      { weaponId: "mailed-flower", tier: "S", noteVi: "Bông Hoa Bọc Thép - Tăng mạnh Tinh Thông Nguyên Tố và ATK% sau khi dùng kỹ năng" },
      { weaponId: "favonius-greatsword", tier: "S", noteVi: "Đại Kiếm Tây Phong - Giải quyết triệt để nhu cầu 80 năng lượng nguyên tố của chiêu Q" },
      { weaponId: "makhaira-aquamarine", tier: "A", noteVi: "Thủy Tinh Makhaira - Tăng EM và chia sẻ lượng ATK buff cho đồng đội" },
      { weaponId: "bloodtainted-greatsword", tier: "B", noteVi: "Kiếm Huyết Rồng 3★ - Cung cấp tới 187 EM giá rẻ dễ kiếm" },
    ],
    artifacts: [
      { setIds: ["deepwood-memories"], mode: "4pc", priority: 1, noteVi: "Giảm 30% kháng Thảo của kẻ địch, tối ưu hóa sát thương nổ Hạt Thảo của cả đội" },
      { setIds: ["flower-of-paradise-lost"], mode: "4pc", priority: 2, noteVi: "Tăng tối đa 80% sát thương nổ hạt Sum Suê khi Kaveh đứng sân kích hoạt" },
      { setIds: ["gilded-dreams"], mode: "4pc", priority: 3, noteVi: "Cung cấp lượng EM khổng lồ cho Kaveh khi đứng sân điều phối" },
      { setIds: ["ocean-hued-clam"], mode: "4pc", priority: 4, noteVi: "Tận dụng nội tại tự hồi máu khi hạt nổ trúng mình để tạo bọt nước sát thương vật lý" },
    ],
    mainStats: {
      sands: "Hiệu Quả Nạp (ER) hoặc Tinh Thông Nguyên Tố (EM)",
      goblet: "Tinh Thông Nguyên Tố (EM)",
      circlet: "Tinh Thông Nguyên Tố (EM)",
      note: "Đồng hồ ER giúp Kaveh duy trì trạng thái đính kèm Thảo của Q liên tục 100% thời gian đứng sân.",
    },
    subStats: {
      stats: ["Hiệu Quả Nạp (180-200% ER)", "Tinh Thông Nguyên Tố (700-900 EM)", "Tấn công (ATK%)", "Máu (HP%)"],
      note: "Nội tại Kaveh tự hồi máu dựa trên 300% lượng Tinh Thông Nguyên Tố (EM) khi chịu sát thương hạt Thảo nổ.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Đòn thường (NA)", "Kỹ năng nguyên tố (E)"],
      note: "Q đính kèm Thảo cho đòn đánh thường và tăng sát thương nổ hạt. NA nâng để tăng sát thương chém quét.",
    },
    playstyleNoteVi:
      "Kaveh là Kiến Trúc Sư kiêm Driver đứng sân hoàn hảo của đội hình Sum Suê (Bloom). Khi bật Q, đòn đánh của Kaveh chuyển thành sát thương Thảo diện rộng; kỹ năng E quét kích nổ ngay lập tức mọi Hạt Thảo xung quanh mà không cần chờ 6 giây. Hạt nổ trúng Kaveh sẽ tự hồi phục sinh mệnh.",
  },

  // ── Lynette: Anemo Sword (VV Shredder & Taunt Sub-DPS) ──
  lynette: {
    weapons: [
      { weaponId: "freedom-sworn", tier: "S", noteVi: "Lời Thề Tự Do Cổ Xưa - Cung cấp EM và buff 20% ATK cùng 16% sát thương đòn đánh cho cả đội" },
      { weaponId: "fleuve-cendre-ferryman", tier: "S", noteVi: "Ống Nước Fontaine F2P - Cung cấp 45.9% ER và tăng tới 16% CRIT Rate cho kỹ năng E" },
      { weaponId: "favonius-sword", tier: "S", noteVi: "Kiếm Tây Phong - Sạc năng lượng mượt mà cho toàn bộ đội hình" },
      { weaponId: "sacrificial-sword", tier: "A", noteVi: "Kiếm Tế Lễ - Reset chiêu E lướt chém 2 lần liên tiếp tích năng lượng" },
    ],
    artifacts: [
      { setIds: ["viridescent-venerer"], mode: "4pc", priority: 1, noteVi: "Bắt buộc - Giảm 40% kháng nguyên tố của kẻ địch bị Khuếch Tán, nâng tầm toàn bộ DPS nguyên tố" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 2, noteVi: "Buff 20% ATK cho toàn đội sau khi ném Hộp Mèo Q" },
    ],
    mainStats: {
      sands: "Hiệu Quả Nạp (ER) hoặc ATK%",
      goblet: "Anemo DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Cần đảm bảo ER khoảng 180-210% (hoặc 160% nếu cầm Kiếm Tây Phong / Ống Nước).",
    },
    subStats: {
      stats: ["Hiệu Quả Nạp (180-210% ER)", "CRIT Rate / CRIT DMG", "Tấn công (ATK%)", "Tinh Thông Nguyên Tố"],
      note: "Duy trì tỉ lệ CRIT từ 60% trở lên để tối đa hóa sát thương từ Hộp Mèo bắn đạn nguyên tố hấp thụ.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q ném Hộp Mèo Burlap là kỹ năng quan trọng nhất để gom quái, khiêu khích và bắn đạn khuếch tán. NA chỉ nâng khi đạt C6.",
    },
    playstyleNoteVi:
      "Lynette đảm nhiệm vị trí Khuếch Tán giảm kháng cực kỳ cơ động. E lướt nhanh kích hoạt sát thương Ousia phá giải các cơ quan Fontaine; Q quẳng Hộp Mèo Kỳ Ảo khiêu khích thu hút toàn bộ hỏa lực của quái vật, đồng thời liên tục chuyển hóa nguyên tố và bắn đạn rỉa máu diện rộng.",
  },

  // ── Freminet: Cryo Claymore (Shatter & Physical DPS) ──
  freminet: {
    weapons: [
      { weaponId: "song-of-broken-pines", tier: "S", noteVi: "Tiếng Thở Dài Của Gió Tây - Base ATK 741 cực cao, tăng sát thương Vật Lý và Tốc Độ Đánh" },
      { weaponId: "wolf-s-gravestone", tier: "S", noteVi: "Đường Cùng Của Sói - Cung cấp lượng lớn ATK% dồi dào cho Freminet và cả đội" },
      { weaponId: "serpent-spine", tier: "S", noteVi: "Kiếm Ly Cốt - Tăng tới 50% sát thương toàn diện ở R5 cùng chỉ số CRIT Rate cao" },
      { weaponId: "tidal-shadow", tier: "A", noteVi: "Bóng Hình Thủy Triều rèn Fontaine - Nhận lượng lớn ATK% mỗi khi nhận hồi máu" },
      { weaponId: "snow-tombed-starsilver", tier: "B", noteVi: "Tuyết Vùi Tinh Ngân rèn F2P Dragonspine - Tăng sát thương Vật lý và thả cột băng" },
    ],
    artifacts: [
      { setIds: ["pale-flame"], mode: "4pc", priority: 1, noteVi: "Tốt nhất - Tăng tối đa 50% ST Vật Lý và 18% ATK nhờ cơ chế kích hoạt E liên tục" },
      { setIds: ["blizzard-strayer"], mode: "4pc", priority: 2, noteVi: "Dành cho lối chơi Băng thuần túy - Cung cấp tới 40% CRIT Rate khi địch bị Đóng Băng" },
      { setIds: ["pale-flame", "bloodstained-chivalry"], mode: "2+2", priority: 3, noteVi: "2pc Lửa Trắng Xám (+25% ST Vật Lý) + 2pc Kỵ Sĩ (+25% ST Vật Lý)" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Physical DMG% (hoặc Cryo DMG% nếu chơi Băng)",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Đa số trường hợp Ly Sát Thương Vật Lý là phương án gây sát thương cao nhất từ cú Đập Áp Suất Cấp 4 của Pers.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "Tấn công (ATK%)", "Hiệu Quả Nạp (120-140% ER)", "Tinh Thông Nguyên Tố"],
      note: "Cân bằng CRIT chuẩn (ít nhất 65% CR / 130% CD) để các đòn đập áp suất luôn đạt bạo kích.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Đòn thường (NA)", "Nguyên tố bùng phát (Q)"],
      note: "E Đồng Hồ Áp Suất Pers là nguồn 70%+ sát thương. Đánh thường NA giúp tích tầng áp suất nhanh chóng.",
    },
    playstyleNoteVi:
      "Freminet kết hợp độc đáo giữa Siêu Dẫn (Superconduct) và Phá Băng (Shatter). Kỹ năng E kích hoạt chim cánh cụt Pers: đánh thường 4 lần để đẩy thanh áp suất lên Cấp 4 rồi tung cú chém Vật lý hủy diệt. Bật Q sẽ giảm hồi chiêu E và cho phép tích tầng áp suất nhanh gấp đôi.",
  },

  // ── Charlotte: Cryo Catalyst (Teamwide Healer & Freeze Enabler) ──
  charlotte: {
    weapons: [
      { weaponId: "favonius-codex", tier: "S", noteVi: "Tây Phong Mật Điển - Nạp năng lượng tối ưu cho chiêu Q 80 mana và sạc cho cả đội" },
      { weaponId: "prototype-amber", tier: "S", noteVi: "Mẫu Kim Phách rèn F2P - Hồi thêm năng lượng và lượng máu khổng lồ sau khi dùng Q" },
      { weaponId: "thrilling-tales-of-dragon-slayers", tier: "A", noteVi: "Câu Chuyện Diệt Rồng R5 - Buff 48% ATK cho DPS đứng sân" },
      { weaponId: "oathsworn-eye", tier: "A", noteVi: "Con Mắt Tuyên Thệ - Tăng mạnh ATK% và cộng thêm 48% Hiệu Quả Nạp sau khi dùng E" },
    ],
    artifacts: [
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 1, noteVi: "Chuẩn nhất - Tăng sát thương Q và buff 20% ATK cho toàn đội trong 12 giây" },
      { setIds: ["ocean-hued-clam"], mode: "4pc", priority: 2, noteVi: "Biến lượng hồi máu toàn đội khổng lồ của Q thành bọt nước nổ sát thương vật lý" },
      { setIds: ["song-of-days-past"], mode: "4pc", priority: 3, noteVi: "Tích lũy lượng hồi máu dồi dào để buff sát thương phẳng cho DPS" },
      { setIds: ["emblem-of-severed-fate", "gladiator-s-finale"], mode: "2+2", priority: 4, noteVi: "2pc Dấu Ấn (+20% ER) + 2pc ATK (+18% Tấn Công)" },
    ],
    mainStats: {
      sands: "Hiệu Quả Nạp (ER)",
      goblet: "ATK%",
      circlet: "Tăng Trị Liệu (Healing Bonus) hoặc CRIT Rate (nếu dùng Tây Phong)",
      note: "Lượng máu hồi của Charlotte scale theo ATK. Đồng hồ ER là bắt buộc để duy trì Q liên tục.",
    },
    subStats: {
      stats: ["Hiệu Quả Nạp (200-240% ER)", "Tấn công (ATK%)", "CRIT Rate (để kích hoạt Tây Phong)", "Tấn công phẳng"],
      note: "Cần đạt tối thiểu 200-220% ER nếu đi 1 Băng, hoặc 180% ER nếu đi cùng Furina / Wriothesley / Ayaka.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q là chiêu thức cốt lõi hồi phục ngay lập tức thanh máu cho toàn bộ 4 thành viên. E chụp ảnh đánh dấu quái.",
    },
    playstyleNoteVi:
      "Charlotte là phóng viên ảnh tòa soạn Chim Bồ Câu với chiêu Q chụp hình toàn cảnh hồi phục tức thời 100% máu cho cả 4 nhân vật (tương tự Jean). Là đồng đội hoàn hảo nhất của Furina ở phân khúc 4 sao để kích đầy 300 tầng Ná Nức (Fanfare) trong 1 giây.",
  },

  // ── Mika: Cryo Polearm (Physical & ATK SPD Dedicated Buffer) ──
  mika: {
    weapons: [
      { weaponId: "favonius-lance", tier: "S", noteVi: "Thương Tây Phong - Cung cấp Hiệu Quả Nạp dồi dào và sinh hạt nguyên tố cho DPS vật lý" },
      { weaponId: "rightful-reward", tier: "A", noteVi: "Thưởng Phạt Công Minh rèn Fontaine - Cho HP% để hồi máu dày hơn và tự hồi năng lượng" },
      { weaponId: "black-tassel", tier: "B", noteVi: "Hắc Anh Thương 3★ - Lựa chọn F2P cung cấp lượng HP% cao nhất" },
    ],
    artifacts: [
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 1, noteVi: "Buff 20% ATK cho toàn đội sau khi bật Q lông vũ hồi máu" },
      { setIds: ["ocean-hued-clam"], mode: "4pc", priority: 2, noteVi: "Gia tăng lượng hồi máu và tạo bọt nước nổ sát thương vật lý phụ trợ" },
      { setIds: ["emblem-of-severed-fate", "tenacity-of-the-millelith"], mode: "2+2", priority: 3, noteVi: "2pc Dấu Ấn (+20% ER) + 2pc Thiên Nham (+20% HP)" },
    ],
    mainStats: {
      sands: "Hiệu Quả Nạp (ER)",
      goblet: "HP%",
      circlet: "Tăng Trị Liệu (Healing Bonus) hoặc CRIT Rate (Tây Phong)",
      note: "Mika cần nạp rất cao để bật Q ổn định; nón CRIT Rate giúp kích hoạt hiệu ứng sạc của Thương Tây Phong.",
    },
    subStats: {
      stats: ["Hiệu Quả Nạp (180-220% ER)", "Máu (HP%)", "CRIT Rate (40-50%)", "HP phẳng"],
      note: "Tập trung đẩy ER lên mốc an toàn 200% để luôn sẵn sàng nộ xoay tua rotation.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E bắn đạn nỏ tăng Tốc Độ Đánh (ATK SPD) lên đến 25% và buff sát thương Vật lý. Q hồi máu toàn đội.",
    },
    playstyleNoteVi:
      "Mika là hỗ trợ chuyên dụng số 1 cho các DPS đánh thường Vật Lý (Eula, Freminet, Razor, Keqing vật lý). Kỹ năng E tăng tới 25% tốc độ tấn công giúp Eula chém thêm 3-4 stack nổ kiếm ánh sáng Q, đồng thời buff thêm tối đa 50% sát thương Vật lý và hồi phục sinh mệnh liên tục.",
  },

  // ── Sayu: Anemo Claymore (VV Shred & Rolling Healer) ──
  sayu: {
    weapons: [
      { weaponId: "favonius-greatsword", tier: "S", noteVi: "Đại Kiếm Tây Phong - Giải quyết trọn vẹn nhu cầu nạp 80 năng lượng cho chiêu Q Daruma" },
      { weaponId: "katsuragikiri-nagamasa", tier: "S", noteVi: "Thập Tự Katsuragikiri - Tăng sát thương kỹ năng E và tự động hồi phục mana dồi dào" },
      { weaponId: "mailed-flower", tier: "A", noteVi: "Bông Hoa Bọc Thép - Tăng Tinh Thông Nguyên Tố để hồi máu và khuếch tán mạnh hơn" },
      { weaponId: "bloodtainted-greatsword", tier: "B", noteVi: "Kiếm Huyết Rồng 3★ - Cung cấp 187 EM giá rẻ dễ kiếm" },
    ],
    artifacts: [
      { setIds: ["viridescent-venerer"], mode: "4pc", priority: 1, noteVi: "Bắt buộc - Giảm 40% kháng nguyên tố của kẻ địch bị Khuếch Tán, nâng tầm toàn đội" },
      { setIds: ["ocean-hued-clam"], mode: "4pc", priority: 2, noteVi: "Tận dụng lượng hồi máu dồi dào từ hình nộm Daruma để nổ bọt nước sát thương" },
    ],
    mainStats: {
      sands: "Hiệu Quả Nạp (ER) hoặc Tinh Thông Nguyên Tố (EM)",
      goblet: "Tinh Thông Nguyên Tố (EM) hoặc ATK%",
      circlet: "Tinh Thông Nguyên Tố (EM) hoặc Tăng Trị Liệu",
      note: "Sayu C6 sẽ biến lượng Tinh Thông Nguyên Tố (EM) thành cả sát thương lẫn khả năng hồi máu khổng lồ.",
    },
    subStats: {
      stats: ["Hiệu Quả Nạp (180-210% ER)", "Tinh Thông Nguyên Tố", "Tấn công (ATK%)", "CRIT Rate (nếu dùng Tây Phong)"],
      note: "Cần tối thiểu 180% ER nếu có 2 Phong trong đội, hoặc 200%+ ER nếu là Phong đơn lẻ.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q triệu hồi hình nộm Muji-Muji Daruma hồi máu và xoáy gió. E lăn bánh xe phong tốc độ cao.",
    },
    playstyleNoteVi:
      "Sayu là ninja Shuumatsuban tiện ích bậc nhất thế giới mở: kỹ năng E cuộn thành bánh xe lăn vùn vụt không tốn thể lực và không làm kinh động chim muông; khi vào giao tranh, Q thả hình nộm Daruma hồi máu liên tục và kích hoạt bộ Bóng Hình Màu Xanh giảm 40% kháng nguyên tố.",
  },

  // ── Candace: Hydro Polearm (Hydro Infusion & NA Buffer) ──
  candace: {
    weapons: [
      { weaponId: "favonius-lance", tier: "S", noteVi: "Thương Tây Phong - Cung cấp Hiệu Quả Nạp và sạc hạt năng lượng cho toàn đội" },
      { weaponId: "the-catch", tier: "A", noteVi: "Lao Câu Cá - 45.9% ER và tăng sát thương bạo kích cho chiêu nộ Q" },
      { weaponId: "black-tassel", tier: "A", noteVi: "Hắc Anh Thương 3★ - Cho tới 46.9% HP tối đa, gia tăng lượng buff đòn đánh thường" },
      { weaponId: "rightful-reward", tier: "B", noteVi: "Thưởng Phạt Công Minh - Tăng HP% và hồi mana khi được nhận trị liệu" },
    ],
    artifacts: [
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 1, noteVi: "Tốt nhất - Buff thêm 20% ATK cho toàn đội sau khi bật Màn Nước Đỏ Q" },
      { setIds: ["instructor"], mode: "4pc", priority: 2, noteVi: "Bộ Giáo Quan buff 120 Tinh Thông cho toàn đội khi kích hoạt phản ứng Thủy" },
      { setIds: ["tenacity-of-the-millelith", "emblem-of-severed-fate"], mode: "2+2", priority: 3, noteVi: "2pc Thiên Nham (+20% HP) + 2pc Dấu Ấn (+20% ER)" },
    ],
    mainStats: {
      sands: "Hiệu Quả Nạp (ER) hoặc HP%",
      goblet: "HP%",
      circlet: "HP% hoặc CRIT Rate (nếu dùng Thương Tây Phong)",
      note: "Lượng sát thương đòn đánh thường buff cho đồng đội tỉ lệ thuận với lượng HP tối đa của Candace.",
    },
    subStats: {
      stats: ["Hiệu Quả Nạp (180-210% ER)", "Máu (HP%)", "CRIT Rate (40-50%)", "HP phẳng"],
      note: "Đảm bảo đủ nạp để bật Q mỗi chu kỳ rotation 15 giây.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q Nghi Lễ Thánh Động là kỹ năng đính kèm nguyên tố Thủy và buff sát thương đánh thường. E giơ khiên phản đòn.",
    },
    playstyleNoteVi:
      "Candace Q phủ Màn Nước Đỏ đính kèm nguyên tố Thủy (Hydro Infusion) cho tất cả nhân vật sử dụng Kiếm đơn/Trọng kiếm/Vũ khí cán dài, đồng thời buff tới 40%+ sát thương đòn đánh thường nguyên tố dựa theo lượng HP tối đa. Là mảnh ghép tuyệt vời cho Ayato, Yoimiya hoặc Arlecchino/Nilou.",
  },

  // ── Dori: Electro Claymore (Energy Battery & Hyperbloom Trigger) ──
  dori: {
    weapons: [
      { weaponId: "favonius-greatsword", tier: "S", noteVi: "Đại Kiếm Tây Phong - Sạc năng lượng dồi dào đưa khả năng làm pin năng lượng lên đỉnh cao" },
      { weaponId: "sacrificial-greatsword", tier: "S", noteVi: "Đại Kiếm Tế Lễ - Cho phép bắn 2 lần súng E tích năng lượng tức thì" },
      { weaponId: "forest-regalia", tier: "A", noteVi: "Vương Khí Rừng Sâu rèn Sumeru - Cung cấp ER và thả Lá Rừng Phục Sinh buff 120 EM" },
      { weaponId: "the-bell", tier: "B", noteVi: "Kiếm Chuông - Cung cấp HP% gia tăng khả năng hồi phục sinh mệnh" },
    ],
    artifacts: [
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 1, noteVi: "Buff 20% ATK cho toàn đội mỗi khi gọi Thần Đèn Jinni Q" },
      { setIds: ["ocean-hued-clam"], mode: "4pc", priority: 2, noteVi: "Tận dụng sợi dây truyền máu liên tục để kích hoạt nổ bọt nước 27k sát thương" },
      { setIds: ["gilded-dreams"], mode: "4pc", priority: 3, noteVi: "Tối ưu hóa khi chơi Dori kích nổ Hạt Nở Rộ (Hyperbloom) bằng tia dây điện" },
      { setIds: ["emblem-of-severed-fate", "tenacity-of-the-millelith"], mode: "2+2", priority: 4, noteVi: "2pc Dấu Ấn (+20% ER) + 2pc Thiên Nham (+20% HP)" },
    ],
    mainStats: {
      sands: "Hiệu Quả Nạp (ER)",
      goblet: "HP% (hoặc Tinh Thông EM nếu kích Hyperbloom)",
      circlet: "Tăng Trị Liệu (Healing Bonus) hoặc CRIT Rate",
      note: "Dori tiêu hao 80 năng lượng nguyên tố, đồng hồ ER là bắt buộc để duy trì sợi dây kết nối liên tục.",
    },
    subStats: {
      stats: ["Hiệu Quả Nạp (200-240% ER)", "Máu (HP%)", "Tinh Thông Nguyên Tố", "CRIT Rate"],
      note: "Chỉ số nạp từ 200% trở lên là điều kiện tiên quyết để Dori hoàn thành tốt nhiệm vụ.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q Điểm Sáng Dược Liệu thả thần đèn kết nối sợi dây điện hồi máu và nạp mana trực tiếp. E bắn pháo đạn.",
    },
    playstyleNoteVi:
      "Dori là cục pin sạc dự phòng sống của Teyvat: chiêu Q gọi Thần Đèn Jinni nối sợi dây năng lượng truyền liên tục Năng Lượng Nguyên Tố (tối đa hồi 15+ flat energy) và hồi máu mỗi giây cho nhân vật đứng sân. Sợi dây điện khi quét qua kẻ địch hoặc hạt thảo có thể kích nổ Nở Rộ cực kỳ độc đáo.",
  },

  // ── Barbara: Hydro Catalyst (Team Healer & F2P TTDS Enabler) ──
  barbara: {
    weapons: [
      { weaponId: "thrilling-tales-of-dragon-slayers", tier: "S", noteVi: "Câu Chuyện Diệt Rồng R5 - Lựa chọn 3★ thần thánh buff 48% ATK cho chủ lực" },
      { weaponId: "sacrificial-fragments", tier: "S", noteVi: "Mảnh Chương Tế Lễ - 221 EM và reset thời gian hồi chiêu dài của vòng nước E" },
      { weaponId: "prototype-amber", tier: "A", noteVi: "Mẫu Kim Phách rèn F2P - Hồi thêm năng lượng và lượng máu khổng lồ cho đội" },
    ],
    artifacts: [
      { setIds: ["ocean-hued-clam"], mode: "4pc", priority: 1, noteVi: "Biến toàn bộ lượng hồi máu khổng lồ thành bọt nước nổ 27k-30k sát thương vật lý liên tục" },
      { setIds: ["maiden-beloved"], mode: "4pc", priority: 2, noteVi: "Bộ Thiếu Nữ tăng lượng trị liệu thuần túy cao nhất cho người mới bắt đầu" },
      { setIds: ["instructor"], mode: "4pc", priority: 3, noteVi: "Bộ Giáo Quan buff 120 EM toàn đội trong đội hình Nilou Sum Suê hoặc Bốc Hơi" },
      { setIds: ["tenacity-of-the-millelith", "maiden-beloved"], mode: "2+2", priority: 4, noteVi: "2pc Thiên Nham (+20% HP) + 2pc Thiếu Nữ (+15% Trị Liệu)" },
    ],
    mainStats: {
      sands: "HP% hoặc Hiệu Quả Nạp (ER)",
      goblet: "HP%",
      circlet: "Tăng Trị Liệu (Healing Bonus) hoặc HP%",
      note: "Toàn bộ lượng máu hồi của Barbara scale theo HP tối đa. Nón Tăng Trị Liệu cho chỉ số hồi máu vượt trội nón HP%.",
    },
    subStats: {
      stats: ["Máu (HP%)", "HP phẳng", "Hiệu Quả Nạp (140-160% ER)", "Tinh Thông Nguyên Tố"],
      note: "Nếu sử dụng trong đội hình Nilou Sum Suê, hãy ưu tiên thêm chỉ số Tinh Thông Nguyên Tố (EM) để tăng sát thương hạt nổ.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E tạo vòng nước nhảy múa áp ấn Thủy và hồi máu liên tục. Q nuke hồi đầy 100% thanh máu toàn đội ngay lập tức.",
    },
    playstyleNoteVi:
      "Thần tượng âm nhạc Mondstadt Barbara là vị cứu tinh miễn phí của mọi tài khoản. Kỹ năng E tạo Vòng Ca Khúc áp ấn Thủy sát mục tiêu và hồi máu liên tục; chiêu Q nạp đầy thanh sinh mệnh cho cả 4 thành viên trong tích tắc. Cầm Câu Chuyện Diệt Rồng buff 48% ATK cho DPS chính.",
  },

  // ── Lisa: Electro Catalyst (DEF Shredder & Aggravate Driver) ──
  lisa: {
    weapons: [
      { weaponId: "kagura-s-verity", tier: "S", noteVi: "Chân Ý Của Kagura - 66.2% CRIT DMG, tăng mạnh sát thương cho kỹ năng nguyên tố E" },
      { weaponId: "the-widsith", tier: "S", noteVi: "Chương Nhạc Lang Thang - Sát thương bạo kích và lượng buff ngẫu nhiên cực lớn" },
      { weaponId: "hakushin-ring", tier: "S", noteVi: "Vòng Hakushin rèn Inazuma - Tăng ER và buff tới 20% sát thương nguyên tố cho đồng đội sau khi tạo phản ứng Lôi" },
      { weaponId: "favonius-codex", tier: "A", noteVi: "Tây Phong Mật Điển - Đảm bảo luôn sạc đầy chiêu Q 80 năng lượng mỗi vòng xoay tua" },
    ],
    artifacts: [
      { setIds: ["thundering-fury"], mode: "4pc", priority: 1, noteVi: "Tối ưu nhất khi đứng sân Tăng Cường - Tăng 15% ST Lôi, buff 20% ST Tăng Cường và giảm hồi chiêu E" },
      { setIds: ["emblem-of-severed-fate"], mode: "4pc", priority: 2, noteVi: "Tốt nhất khi chơi Sub-DPS ngoài sân - Giải quyết bài toán nạp và tăng mạnh sát thương Q" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 3, noteVi: "Buff 20% ATK cho toàn đội khi bật Q giảm phòng ngự địch" },
      { setIds: ["gilded-dreams"], mode: "4pc", priority: 4, noteVi: "Cung cấp lượng EM lớn cho phản ứng Tăng Cường hoặc Siêu Nở Rộ" },
    ],
    mainStats: {
      sands: "Hiệu Quả Nạp (ER) hoặc ATK% / Tinh Thông Nguyên Tố",
      goblet: "Electro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Nếu đi vị trí hỗ trợ giảm DEF ngoài sân, Đồng hồ ER là bắt buộc (cần ít nhất 180-200% ER).",
    },
    subStats: {
      stats: ["Hiệu Quả Nạp (160-200% ER)", "CRIT Rate / CRIT DMG", "Tinh Thông Nguyên Tố", "Tấn công (ATK%)"],
      note: "Duy trì tỉ lệ bạo kích ổn định để lồng điện Q liên tục kích hoạt sát thương Tăng Cường.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q Hoa Hồng Sấm Sét là kỹ năng giá trị nhất sở hữu nội tại giảm 15% Phòng Ngự của kẻ địch. E tụ lực nung sét.",
    },
    playstyleNoteVi:
      "Thủ thư Lisa sở hữu debuff quý giá bậc nhất Genshin Impact: nội tại tự động Giảm 15% DEF (Phòng Ngự) của mọi kẻ địch trong vùng chiêu nộ Q suốt 15 giây. Trong các đội hình Raiden Shogun Nuke hoặc Alhaitham/Tighnari Tăng Cường, Lisa là quân bài hỗ trợ và kích hoạt phản ứng cực kỳ mạnh mẽ.",
  },

  // ── Amber: Pyro Bow (Shield Breaker & Elegy / Noblesse Buffer) ──
  amber: {
    weapons: [
      { weaponId: "elegy-for-the-end", tier: "S", noteVi: "Tiếng Thở Dài Vô Tận - 55.1% ER, kích hoạt buff 100 EM và 20% ATK cho toàn đội siêu nhanh bằng chiêu Q" },
      { weaponId: "favonius-warbow", tier: "S", noteVi: "Cung Tây Phong - Sạc năng lượng liên tục với chiêu Q hồi nhanh" },
      { weaponId: "the-stringless", tier: "A", noteVi: "Tuyệt Huyền - Tăng Tinh Thông Nguyên Tố và tăng mạnh sát thương nuke cho Q và Baron Bunny" },
      { weaponId: "sharpshooter-s-oath", tier: "B", noteVi: "Lời Thề Xạ Thủ 3★ - 46.9% CRIT DMG và tăng 48% sát thương khi bắn trúng điểm yếu" },
    ],
    artifacts: [
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 1, noteVi: "Tốt nhất - Chiêu Q chỉ tốn 40 năng lượng giúp kích hoạt liên tục buff 20% ATK toàn đội" },
      { setIds: ["instructor"], mode: "4pc", priority: 2, noteVi: "Bộ Giáo Quan buff 120 EM toàn đội trong đội hình Hu Tao Bốc Hơi / Tan Chảy" },
      { setIds: ["wanderer-s-troupe"], mode: "4pc", priority: 3, noteVi: "Dành riêng cho lối chơi ngắm bắn trọng kích điểm yếu của Amber" },
    ],
    mainStats: {
      sands: "Hiệu Quả Nạp (ER) hoặc ATK%",
      goblet: "Pyro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Q chỉ cần 40 năng lượng nên chỉ cần khoảng 140-160% ER là có thể xả chiêu liên tục mỗi rotation.",
    },
    subStats: {
      stats: ["Hiệu Quả Nạp (140-160% ER)", "CRIT Rate / CRIT DMG", "Tấn công (ATK%)", "Tinh Thông Nguyên Tố"],
      note: "Nếu cầm Cung Tây Phong, hãy ưu tiên đẩy CRIT Rate lên 50-60%.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q Mưa Tên bắn 18 mũi tên lửa phá khiên Băng trong 2 giây. E quẳng Baron Bunny dụ quái khiêu khích.",
    },
    playstyleNoteVi:
      "Kỵ Sĩ Trinh Sát Amber là chuyên gia phá khiên Băng thần tốc và kích hoạt trang bị hỗ trợ nhanh nhất game. Với chiêu Q chỉ tốn 40 năng lượng và tung ra 18 đòn đánh Hỏa trong 2 giây, Amber kích hoạt trọn vẹn 4 tầng Tiếng Thở Dài Vô Tận và buff bộ Tông Thất/Giáo Quan chỉ sau 1 lần bấm nút.",
  },

  // ── Xinyan: Pyro Claymore (Physical Nuke & Shield Buffer) ──
  xinyan: {
    weapons: [
      { weaponId: "redhorn-stonethresher", tier: "S", noteVi: "Xích Giác Phá Thạch Đao - 88.2% CRIT DMG, tăng mạnh DEF và tăng sát thương đòn đánh theo DEF" },
      { weaponId: "wolf-s-gravestone", tier: "S", noteVi: "Đường Cùng Của Sói - Cung cấp lượng lớn ATK% cho Xinyan và buff thêm ATK cho cả đội" },
      { weaponId: "serpent-spine", tier: "S", noteVi: "Kiếm Ly Cốt - Tăng tới 50% toàn bộ sát thương đòn đánh và cung cấp 27.6% CRIT Rate" },
      { weaponId: "whiteblind", tier: "A", noteVi: "Bạch Ảnh Kiếm rèn F2P - Cung cấp DEF% dồi dào để tối đa hóa độ dày của Khiên Lửa" },
      { weaponId: "sacrificial-greatsword", tier: "A", noteVi: "Đại Kiếm Tế Lễ - Reset kỹ năng E để luôn giữ khiên và duy trì buff sát thương vật lý" },
    ],
    artifacts: [
      { setIds: ["pale-flame"], mode: "4pc", priority: 1, noteVi: "Tối ưu cho DPS Vật Lý - Tăng 50% ST Vật Lý và 18% ATK" },
      { setIds: ["tenacity-of-the-millelith"], mode: "4pc", priority: 2, noteVi: "Tối ưu cho hỗ trợ Khiên - Khiên Cấp 3 phát nổ liên tục kích hoạt +20% ATK toàn đội" },
      { setIds: ["pale-flame", "bloodstained-chivalry"], mode: "2+2", priority: 3, noteVi: "2pc Lửa Trắng Xám (+25% ST Vật Lý) + 2pc Kỵ Sĩ (+25% ST Vật Lý) - Đơn giản nuke Q cực mạnh" },
    ],
    mainStats: {
      sands: "ATK% hoặc DEF%",
      goblet: "Physical DMG% (hoặc DEF% nếu thuần khiên)",
      circlet: "CRIT DMG (Cung Mệnh 2 giúp Q luôn bạo kích 100%)",
      note: "Cung Mệnh 2 của Xinyan đảm bảo sát thương Vật lý từ chiêu Q đạt tỉ lệ bạo kích 100%, cho phép bạn dồn toàn bộ vào Nón CRIT DMG mà không cần CRIT Rate.",
    },
    subStats: {
      stats: ["Sát Thương Bạo Kích (CRIT DMG)", "Phòng Ngự (DEF%)", "Tấn công (ATK%)", "Hiệu Quả Nạp (140-160% ER)"],
      note: "Dồn tối đa vào CRIT DMG và DEF% để cú nuke Q đạt sát thương hàng trăm ngàn điểm.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q Riff Nổi Loạn gây sát thương nuke vật lý diện rộng cực lớn. E tạo khiên lửa và buff 15% ST Vật lý.",
    },
    playstyleNoteVi:
      "Xinyan là nghệ sĩ nhạc Rock với phong cách nuke Vật Lý bộc phát. Cung Mệnh 2 biến chiêu Q thành đòn đánh 100% bạo kích và tự động tạo khiên lửa Cấp 3. Kỹ năng E tạo khiên lửa tăng 15% sát thương Vật lý và giảm 15% kháng Vật lý của đối thủ trúng đòn.",
  },

  // ── Aloy: Cryo Bow (Burst Nuke & Melt Sub-DPS) ──
  aloy: {
    weapons: [
      { weaponId: "thundering-pulse", tier: "S", noteVi: "Sấm Sét Rung Động - 66.2% CRIT DMG, tăng 20% ATK và buff sát thương đòn đánh thường Băng" },
      { weaponId: "polar-star", tier: "S", noteVi: "Ngôi Sao Cực Đông - CRIT Rate cao 33.1%, tăng sát thương cho kỹ năng E/Q và buff dồn dập ATK%" },
      { weaponId: "the-stringless", tier: "A", noteVi: "Tuyệt Huyền - Tăng 165 EM và buff tới 48% sát thương cho chiêu nuke Q Tan Chảy (Reverse Melt)" },
      { weaponId: "sacrificial-bow", tier: "A", noteVi: "Cung Tế Lễ - Ném 2 lần bom E để tích nhanh 4 cuộn dây chuyển hóa đòn đánh thường Băng" },
    ],
    artifacts: [
      { setIds: ["blizzard-strayer"], mode: "4pc", priority: 1, noteVi: "Tối ưu nhất cho đội Đóng Băng - Tăng 15% ST Băng và nhận tới 40% CRIT Rate miễn phí" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 2, noteVi: "Q chỉ tốn 40 năng lượng, buff liên tục 20% ATK cho toàn đội" },
      { setIds: ["blizzard-strayer", "gladiator-s-finale"], mode: "2+2", priority: 3, noteVi: "2pc Dũng Sĩ Băng (+15% ST Băng) + 2pc Giác Đấu (+18% Tấn Công)" },
    ],
    mainStats: {
      sands: "ATK% (hoặc Tinh Thông EM nếu chơi nuke Tan Chảy)",
      goblet: "Cryo DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Nếu đi cùng đội hình có Hỏa để Aloy Q nuke Tan Chảy, Đồng hồ EM hoặc Ly Cryo DMG cho sát thương đột biến.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "Tấn công (ATK%)", "Tinh Thông Nguyên Tố", "Hiệu Quả Nạp (120-140% ER)"],
      note: "Chiêu Q của Aloy chỉ tiêu tốn 40 năng lượng nên không đòi hỏi quá nhiều chỉ số nạp.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q Pháo Tiên Tri ném pin nhiên liệu gây lượng sát thương Băng nuke diện rộng khổng lồ. E quẳng bom đông lạnh.",
    },
    playstyleNoteVi:
      "Aloy là thợ săn viễn chinh với kỹ năng Q Pháo Tiên Tri chỉ tốn 40 năng lượng gây sát thương Băng bộc phát cực mạnh khi kết hợp phản ứng Tan Chảy (Reverse Melt x1.5). Kỹ năng E ném bom đóng băng chia thành các quả bom nhỏ tích 4 cuộn dây để chuyển hóa đòn đánh thường thành sát thương Băng.",
  },
};

async function main() {
  console.log("Kiem tra tinh hop le cua 20 nhan vat build moi...");
  const [dbWeapons, dbArtifacts, dbCharacters] = await Promise.all([
    prisma.weapon.findMany({ select: { id: true } }),
    prisma.artifactSet.findMany({ select: { id: true } }),
    prisma.character.findMany({ select: { id: true } }),
  ]);
  const wSet = new Set(dbWeapons.map((w) => w.id));
  const aSet = new Set(dbArtifacts.map((a) => a.id));
  const cSet = new Set(dbCharacters.map((c) => c.id));

  let errors = 0;
  for (const [charId, build] of Object.entries(REMAINING_EXPERT_BUILDS)) {
    if (!cSet.has(charId)) {
      console.error(`[ERROR] Character '${charId}' khong ton tai trong DB!`);
      errors++;
    }
    for (const w of build.weapons || []) {
      if (!wSet.has(w.weaponId)) {
        console.error(`[ERROR] Nhan vat '${charId}' co vu khi khong hop le: '${w.weaponId}'`);
        errors++;
      }
    }
    for (const a of build.artifacts || []) {
      for (const setId of a.setIds) {
        if (!aSet.has(setId)) {
          console.error(`[ERROR] Nhan vat '${charId}' co bo TDV khong hop le: '${setId}'`);
          errors++;
        }
      }
    }
  }

  if (errors > 0) {
    console.error(`Dung lai vi co ${errors} loi!`);
    process.exit(1);
  }

  console.log("Tat ca ID vu khi, bo TDV, va nhan vat cua 20 build moi deu CHINH XAC 100% trong Prisma DB!");

  // Cap nhat file src/data/character-builds-data.ts
  const dataPath = path.resolve(process.cwd(), "src/data/character-builds-data.ts");
  const content = fs.readFileSync(dataPath, "utf-8");

  let added = 0;
  let newEntriesCode = "";
  for (const [charId, build] of Object.entries(REMAINING_EXPERT_BUILDS)) {
    if (content.includes(`"${charId}": {`) || content.includes(`  ${charId}: {`)) {
      console.log(`Bo qua '${charId}' vi da ton tai.`);
      continue;
    }
    newEntriesCode += `  // ── ${charId} ──\n  "${charId}": ${JSON.stringify(build, null, 4)},\n\n`;
    added++;
  }

  if (newEntriesCode) {
    const aliasIndex = content.indexOf("const ID_ALIASES");
    if (aliasIndex === -1) {
      throw new Error("Khong tim thay marker 'const ID_ALIASES'");
    }
    // Tìm dấu `};` gần nhất trước `const ID_ALIASES`
    const insertIndex = content.lastIndexOf("};", aliasIndex);
    if (insertIndex === -1) {
      throw new Error("Khong tim thay dau ket thuc '};' truoc ID_ALIASES");
    }
    const updatedContent = content.slice(0, insertIndex) + newEntriesCode + content.slice(insertIndex);
    fs.writeFileSync(dataPath, updatedContent, "utf-8");
    console.log(`\n🎉 Da them thanh cong ${added} build chuyen gia moi vao character-builds-data.ts!`);
  } else {
    console.log("Khong co build moi nao can chen.");
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit(0));
