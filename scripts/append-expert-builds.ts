import "dotenv/config";
import fs from "fs";
import path from "path";
import { prisma } from "../src/lib/db/prisma";
import { CHARACTER_BUILDS, type CharacterBuildEntry } from "../src/data/character-builds-data";

export const EXPERT_BUILDS: Record<string, CharacterBuildEntry> = {
  // ── Chasca: Anemo Bow (Natlan Multi-element Burst DPS) ──
  chasca: {
    weapons: [
      { weaponId: "astral-vulture-s-crimson-plumage", tier: "S", noteVi: "Trấn tốt nhất - CRIT DMG 66.2%, tăng ATK% và buff sát thương Đạn Săn Bóng Đêm cực lớn" },
      { weaponId: "the-first-great-magic", tier: "S", noteVi: "CRIT DMG 66.2% + buff ATK% và Tốc độ di chuyển theo đồng đội cùng hệ" },
      { weaponId: "aqua-simulacra", tier: "A", noteVi: "CRIT DMG 88.2% + 20% DMG bonus toàn diện bất kể cự ly" },
      { weaponId: "hunter-s-path", tier: "A", noteVi: "CRIT Rate cao 44.1% + buff sát thương trọng kích theo EM" },
      { weaponId: "skyward-harp", tier: "A", noteVi: "Cung cấp cả CRIT Rate lẫn CRIT DMG cân bằng, base ATK cao" },
      { weaponId: "chain-breaker", tier: "B", noteVi: "Cung rèn Natlan tốt nhất F2P - tăng ATK% và EM theo số nhân vật Natlan" },
      { weaponId: "song-of-stillness", tier: "B", noteVi: "Cung rèn F2P Fontaine - tăng 32% DMG sau khi nhận hồi máu" },
    ],
    artifacts: [
      { setIds: ["obsidian-codex"], mode: "4pc", priority: 1, noteVi: "Tốt nhất Natlan - Tăng 15% DMG trong Dạ Hồn và +40% CRIT Rate cực lớn" },
      { setIds: ["desert-pavilion-chronicle"], mode: "4pc", priority: 2, noteVi: "Tăng 15% Anemo DMG và 40% DMG Trọng kích/Tấn công thường" },
      { setIds: ["shimenawa-s-reminiscence"], mode: "4pc", priority: 3, noteVi: "Tăng 18% ATK và 50% DMG Trọng kích khi tiêu hao năng lượng" },
      { setIds: ["obsidian-codex", "desert-pavilion-chronicle"], mode: "2+2", priority: 4, noteVi: "2pc Dạ Hồn (+15% DMG) + 2pc Phong (+15% ST Phong)" },
      { setIds: ["obsidian-codex", "gladiator-s-finale"], mode: "2+2", priority: 5, noteVi: "2pc Dạ Hồn (+15% DMG) + 2pc ATK% (+18% Tấn Công)" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "ATK% hoặc Anemo DMG%",
      circlet: "CRIT DMG (bộ Obsidian đã cho 40% CR)",
      note: "Chasca nạp Đạn Săn Bóng Đêm chuyển hóa thành Hỏa/Thủy/Lôi/Băng theo đồng đội, do đó Ly ATK% cạnh tranh sòng phẳng hoặc nhỉnh hơn Ly Anemo DMG%. Nón luôn ưu tiên CRIT DMG khi dùng bộ Bí Điển Obsidian.",
    },
    subStats: {
      stats: ["CRIT DMG", "CRIT Rate (khoảng 40-50% là đủ nếu dùng 4pc Obsidian)", "ATK%", "Elemental Mastery (EM)", "Energy Recharge (ER 110-120%)"],
      note: "Nếu dùng bộ Bí Điển Obsidian, chỉ cần 40-50% CR cơ bản để đạt 80-90% CR khi vào trạng thái Dạ Hồn. Tập trung toàn bộ vào CRIT DMG và ATK%.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E kích hoạt trạng thái Lướt Gió và nạp Đạn Săn Bóng Đêm là nguồn 85%+ sát thương của Chasca. Q gây lượng lớn sát thương diện rộng. NA không cần nâng vì Chasca bắn đạn đặc biệt từ E.",
    },
    playstyleNoteVi:
      "Chasca là DPS On-field nguyên tố Phong nhưng gây sát thương chuyển hóa đa nguyên tố độc nhất vô nhị. Đội hình luôn cần 2-3 nhân vật Hỏa/Thủy/Lôi/Băng (PHEC) khác nhau để nạp tối đa 6 viên Đạn Săn Chuyển Hóa. Chu kỳ: Đồng đội bật buff/áp ấn -> Chasca E -> Bay lên nhắm giữ nạp đầy 6 viên đạn -> Nhả đạn gây phản ứng bùng nổ liên hoàn -> Q kết liễu.",
  },

  // ── Mavuika: Pyro Claymore (Hỏa Thần Natlan DPS / Sub-DPS / Buffer) ──
  mavuika: {
    weapons: [
      { weaponId: "a-thousand-blazing-suns", tier: "S", noteVi: "Trấn tốt nhất - CRIT Rate cao, tăng mạnh ATK% và sát thương Dạ Hồn" },
      { weaponId: "verdict", tier: "S", noteVi: "CRIT Rate 22.1% + Base ATK cực cao và buff sát thương E" },
      { weaponId: "beacon-of-the-reed-sea", tier: "A", noteVi: "CRIT Rate 33.1% + buff ATK khi dùng E và khi chịu sát thương" },
      { weaponId: "serpent-spine", tier: "A", noteVi: "Kiếm Ly Cốt - Tăng tối đa 50% DMG toàn diện ở R5" },
      { weaponId: "earth-shaker", tier: "B", noteVi: "Đại kiếm rèn Natlan tốt nhất F2P - tăng sát thương Kỹ năng nguyên tố sau khi kích phản ứng Hỏa" },
    ],
    artifacts: [
      { setIds: ["obsidian-codex"], mode: "4pc", priority: 1, noteVi: "DPS On-field tối ưu - Tăng 15% DMG Dạ Hồn và 40% CRIT Rate" },
      { setIds: ["scroll-of-the-hero-of-cinder-city"], mode: "4pc", priority: 2, noteVi: "Sub-DPS / Hỗ trợ toàn đội - Buff 40% Sát Thương Nguyên Tố cho cả team" },
      { setIds: ["crimson-witch-of-flames"], mode: "4pc", priority: 3, noteVi: "4pc Ma Nữ - Tăng mạnh phản ứng Bốc Hơi / Tan Chảy" },
      { setIds: ["obsidian-codex", "crimson-witch-of-flames"], mode: "2+2", priority: 4, noteVi: "2pc Dạ Hồn (+15% DMG) + 2pc Hỏa (+15% ST Hỏa)" },
      { setIds: ["obsidian-codex", "gladiator-s-finale"], mode: "2+2", priority: 5, noteVi: "2pc Dạ Hồn (+15% DMG) + 2pc ATK (+18% Tấn Công)" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Pyro DMG%",
      circlet: "CRIT DMG hoặc CRIT Rate",
      note: "Nếu dùng bộ Bí Điển Obsidian, ưu tiên Nón CRIT DMG. Nếu dùng bộ Dũng Sĩ Tro Tàn hoặc Ma Nữ, cân bằng CRIT Rate >= 70%.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Elemental Mastery (EM nếu chơi Bốc Hơi)", "Energy Recharge (ER 120-130%)", "Flat ATK"],
      note: "Ưu tiên tối đa CRIT và ATK. Với đội hình Bốc Hơi, bổ sung 100-150 EM.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q là nguồn sát thương bùng nổ mạnh nhất. E cung cấp sát thương Hỏa off-field liên tục và buff Dạ Hồn. NA nâng sau cùng.",
    },
    playstyleNoteVi:
      "Mavuika linh hoạt cả On-field lẫn Off-field. Bật E lái xe máy tấn công và duy trì sát thương Hỏa off-field, tích tầng Chiến Ý khi đồng đội tiêu hao Dạ Hồn, sau đó kích hoạt Q tung cú chém mặt trời rực lửa hủy diệt toàn sàn đấu.",
  },

  // ── Kinich: Dendro Claymore (Natlan On-field Dendro DPS) ──
  kinich: {
    weapons: [
      { weaponId: "fang-of-the-mountain-king", tier: "S", noteVi: "Trấn tốt nhất - CRIT Rate + buff sát thương E Pháo Xuyên Giáp cực mạnh" },
      { weaponId: "beacon-of-the-reed-sea", tier: "S", noteVi: "CRIT Rate 33.1% + buff ATK lớn khi trúng E" },
      { weaponId: "serpent-spine", tier: "A", noteVi: "Kiếm Ly Cốt - Tăng đến 50% DMG toàn bộ sát thương của Kinich" },
      { weaponId: "earth-shaker", tier: "B", noteVi: "Đại kiếm rèn Natlan F2P - tăng sát thương E khi kích hoạt Thiêu Đốt" },
      { weaponId: "blackcliff-slasher", tier: "B", noteVi: "CRIT DMG sub-stat tốt cho F2P" },
    ],
    artifacts: [
      { setIds: ["obsidian-codex"], mode: "4pc", priority: 1, noteVi: "Tốt nhất Natlan - Tăng 15% DMG Dạ Hồn và 40% CRIT Rate khi bắn Pháo" },
      { setIds: ["unfinished-reverie"], mode: "4pc", priority: 2, noteVi: "Tăng 50% DMG khi kẻ địch bị thiêu đốt (Burning team)" },
      { setIds: ["deepwood-memories"], mode: "4pc", priority: 3, noteVi: "Giảm 30% Thảo RES nếu trong team không có nhân vật nào khác mang" },
      { setIds: ["obsidian-codex", "deepwood-memories"], mode: "2+2", priority: 4, noteVi: "2pc Dạ Hồn (+15% DMG) + 2pc Thảo (+15% ST Thảo)" },
      { setIds: ["obsidian-codex", "gladiator-s-finale"], mode: "2+2", priority: 5, noteVi: "2pc Dạ Hồn (+15% DMG) + 2pc ATK (+18% Tấn Công)" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Dendro DMG%",
      circlet: "CRIT DMG (bộ Obsidian đã cho 40% CR)",
      note: "Kinich gây sát thương Thảo trực tiếp scale theo ATK. Không cần EM nhiều như các đội Hyperbloom vì trọng tâm là Pháo Xuyên Giáp (Scalespiker Cannon).",
    },
    subStats: {
      stats: ["CRIT DMG", "CRIT Rate (45-55% nếu dùng Obsidian)", "ATK%", "Energy Recharge (ER 120%)", "Elemental Mastery"],
      note: "Tập trung đẩy CRIT DMG lên 200%+ và duy trì ATK trên 2000.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E Pháo Xuyên Giáp là 90% sát thương của Kinich. Q triệu hồi Ajaw phun lửa hỗ trợ. NA không dùng trong rotation.",
    },
    playstyleNoteVi:
      "Kinich móc dây đu quanh kẻ địch bằng E, liên tục xả đạn để tích đầy thanh Điểm Dạ Hồn, sau đó nhấn E tung phát Pháo Xuyên Giáp gây sát thương Thảo khổng lồ. Luôn ghép với đồng đội Hỏa (Bennett, Xiangling, Dehya, Thoma) để duy trì hiệu ứng Thiêu Đốt nạp Dạ Hồn thần tốc.",
  },

  // ── Mualani: Hydro Catalyst (Natlan On-field Vaporize DPS) ──
  mualani: {
    weapons: [
      { weaponId: "surf-s-up", tier: "S", noteVi: "Trấn tốt nhất - CRIT DMG 88.2%, tăng 20% HP và buff sát thương Đòn Cắn Cá Mập" },
      { weaponId: "tome-of-the-eternal-flow", tier: "S", noteVi: "CRIT DMG 88.2% + buff HP và sát thương trọng kích" },
      { weaponId: "the-widsith", tier: "A", noteVi: "Chương Nhạc Lang Thang - buff cực mạnh cả 3 nốt nhạc (ATK, EM, Elemental DMG)" },
      { weaponId: "ring-of-yaxche", tier: "B", noteVi: "Pháp khí rèn Natlan tốt nhất F2P - tăng HP% và buff sát thương NA theo HP tối đa" },
      { weaponId: "ash-graven-drinking-horn", tier: "B", noteVi: "Vũ khí sự kiện Natlan F2P - tăng HP% và sát thương AOE" },
    ],
    artifacts: [
      { setIds: ["obsidian-codex"], mode: "4pc", priority: 1, noteVi: "Tốt nhất Natlan - +15% DMG Dạ Hồn và 40% CRIT Rate" },
      { setIds: ["heart-of-depth"], mode: "4pc", priority: 2, noteVi: "Tăng 15% Thủy DMG và 30% sát thương Tấn Công Thường" },
      { setIds: ["nymph-s-dream"], mode: "4pc", priority: 3, noteVi: "Tăng Thủy DMG và ATK khi stack đòn đánh" },
      { setIds: ["obsidian-codex", "tenacity-of-the-millelith"], mode: "2+2", priority: 4, noteVi: "2pc Dạ Hồn (+15% DMG) + 2pc HP (+20% HP)" },
      { setIds: ["tenacity-of-the-millelith", "heart-of-depth"], mode: "2+2", priority: 5, noteVi: "2pc HP (+20% HP) + 2pc Thủy (+15% ST Thủy)" },
    ],
    mainStats: {
      sands: "HP%",
      goblet: "Hydro DMG%",
      circlet: "CRIT DMG (bộ Obsidian đã cho 40% CR)",
      note: "Toàn bộ sát thương của Mualani tỷ lệ theo HP tối đa, ATK hoàn toàn vô dụng. Nón ưu tiên CRIT DMG.",
    },
    subStats: {
      stats: ["CRIT DMG", "CRIT Rate (40-50% với Obsidian)", "HP%", "Elemental Mastery (EM 150-200 cho Bốc Hơi)", "Flat HP"],
      note: "Mualani là nuke Bốc Hơi đơn mục tiêu mạnh nhất game hiện tại. EM từ 150-200 là tối ưu để nhân x2.0 sát thương Bốc Hơi.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E lướt ván và Cú Cắn Cá Mập là nguồn sát thương chính. Q gây nuke sát thương diện rộng. NA không dùng.",
    },
    playstyleNoteVi:
      "Bật E lướt ván cá mập đâm qua kẻ địch để tích đủ 3 tầng Sóng Cuộn, sau đó tung Cú Cắn Cá Mập vào kẻ địch đã dính ấn Hỏa để kích Bốc Hơi hàng trăm ngàn sát thương. Q dùng để kết liễu đợt quái lớn.",
  },

  // ── Citlali: Cryo Catalyst (Natlan Shielder / Buffer / Sub-DPS) ──
  citlali: {
    weapons: [
      { weaponId: "starcaller-s-watch", tier: "S", noteVi: "Trấn tốt nhất - Cung cấp EM cực lớn, tăng sức mạnh khiên và buff sát thương toàn đội" },
      { weaponId: "a-thousand-floating-dreams", tier: "A", noteVi: "Cõi Mộng Ngàn Đêm - EM 265 cực cao và buff nguyên tố toàn đội" },
      { weaponId: "favonius-codex", tier: "A", noteVi: "Tây Phong - Đảm bảo nạp Q liên tục cho toàn đội" },
      { weaponId: "sacrificial-fragments", tier: "B", noteVi: "Mảnh Chương Tế Lễ - EM 221 + reset E" },
    ],
    artifacts: [
      { setIds: ["scroll-of-the-hero-of-cinder-city"], mode: "4pc", priority: 1, noteVi: "Tốt nhất Natlan - Buff 40% Sát Thương Nguyên Tố cho toàn đội" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 2, noteVi: "Buff 20% ATK cho toàn đội sau khi dùng Q" },
      { setIds: ["blizzard-strayer"], mode: "4pc", priority: 3, noteVi: "Build Sub-DPS Băng" },
      { setIds: ["scroll-of-the-hero-of-cinder-city", "gilded-dreams"], mode: "2+2", priority: 4, noteVi: "2pc Nạp/Buff + 2pc EM (+80 Tinh Thông)" },
    ],
    mainStats: {
      sands: "EM hoặc ER%",
      goblet: "EM hoặc Cryo DMG%",
      circlet: "EM hoặc CRIT Rate (nếu dùng Tây Phong)",
      note: "Sức mạnh khiên và khả năng hỗ trợ của Citlali tỷ lệ thuận với Tinh Thông Nguyên Tố (EM). Cần duy trì ER 160%+ để nộ ổn định.",
    },
    subStats: {
      stats: ["Elemental Mastery (EM)", "Energy Recharge (ER 160-180%)", "CRIT Rate (khi dùng Tây Phong)", "ATK%"],
      note: "Ưu tiên EM tối đa để khiên dày và buff mạnh nhất, kèm đủ ER để Q luôn sẵn sàng mỗi chu kỳ.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E tạo khiên Itzpapa và áp Băng diện rộng. Q triệu hồi bão tuyết hỗ trợ phản ứng. NA không nâng.",
    },
    playstyleNoteVi:
      "Citlali là trợ thủ đắc lực cho các đội Bốc Hơi/Tan Chảy (Mavuika, Chasca, Arlecchino). Bật E tạo khiên Băng bảo vệ và áp ấn Băng liên tục ngoài sân, kích hoạt Q để kích hoạt bộ Dũng Sĩ Tro Tàn buff 40% sát thương cho chủ lực.",
  },

  // ── Ororon: Electro Bow (Natlan Off-field Electro Sub-DPS / Nightsoul Battery) ──
  ororon: {
    weapons: [
      { weaponId: "astral-vulture-s-crimson-plumage", tier: "S", noteVi: "CRIT DMG cao + buff ATK% cho cung thủ Natlan" },
      { weaponId: "elegy-for-the-end", tier: "S", noteVi: "Tiếng Thở Dài Vô Tận - Nạp cao + buff 100 EM và 20% ATK cho toàn đội" },
      { weaponId: "the-stringless", tier: "A", noteVi: "Tuyệt Huyền - Tăng 48% sát thương E và Q ở R5" },
      { weaponId: "favonius-warbow", tier: "B", noteVi: "Cung Tây Phong - Tạo hạt năng lượng dồi dào cho đội" },
    ],
    artifacts: [
      { setIds: ["scroll-of-the-hero-of-cinder-city"], mode: "4pc", priority: 1, noteVi: "Tốt nhất Natlan - Kích Dạ Hồn buff 40% Lôi và Thủy cho đội Điện Cảm" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 2, noteVi: "Buff 20% ATK cho toàn đội" },
      { setIds: ["thundering-fury"], mode: "4pc", priority: 3, noteVi: "Tăng 15% Lôi DMG và phản ứng Điện Cảm" },
      { setIds: ["scroll-of-the-hero-of-cinder-city", "emblem-of-severed-fate"], mode: "2+2", priority: 4, noteVi: "2pc Nạp (+20% ER) + 2pc Buff/Lôi" },
    ],
    mainStats: {
      sands: "ATK% hoặc ER%",
      goblet: "Electro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Ororon gây sát thương Lôi off-field khi đồng đội kích hoạt Điện Cảm hoặc tiêu hao Dạ Hồn.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Energy Recharge (ER 140-160%)", "Elemental Mastery"],
      note: "Duy trì ER đủ để Q hồi đúng chu kỳ, sau đó dồn toàn bộ vào CRIT và ATK%.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q tạo vùng áp Lôi và gây sát thương liên tục. E ném bom bóng đêm. NA không nâng.",
    },
    playstyleNoteVi:
      "Ororon tỏa sáng trong đội hình Điện Cảm (Electro-Charged) và đội hình Natlan. Nội tại Tự Động Kích Hoạt Đòn Đánh Khi Đồng Đội Gây Sát Thương Điện Cảm ngoài sân, vừa sạc năng lượng Dạ Hồn vừa kích hoạt bộ Dũng Sĩ Tro Tàn buff sát thương cực mạnh.",
  },

  // ── Xianyun: Anemo Catalyst (Plunging Attack Buffer / Team Healer) ──
  xianyun: {
    weapons: [
      { weaponId: "crane-s-echoing-call", tier: "S", noteVi: "Trấn tốt nhất - Base ATK 741 cực đại, tăng sát thương Tấn Công Khi Rơi 28% và hồi năng lượng" },
      { weaponId: "skyward-atlas", tier: "A", noteVi: "Quyển Thiên Không - Base ATK cao 674 + ATK% sub-stat dồi dào" },
      { weaponId: "favonius-codex", tier: "A", noteVi: "Tây Phong - Giải quyết triệt để nhu cầu nạp Q cho Xianyun và toàn đội" },
      { weaponId: "the-widsith", tier: "B", noteVi: "Tùy chọn đa dụng cho hybrid build" },
      { weaponId: "prototype-amber", tier: "B", noteVi: "Mẫu Kim Phách F2P - Hỗ trợ hồi máu và nạp Q" },
    ],
    artifacts: [
      { setIds: ["viridescent-venerer"], mode: "4pc", priority: 1, noteVi: "Bóng Hình Màu Xanh - Giảm 40% Kháng nguyên tố của kẻ địch khi Khuếch Tán" },
      { setIds: ["song-of-days-past"], mode: "4pc", priority: 2, noteVi: "Khúc Ca Ngày Cũ - Tăng flat damage cho đòn đánh của nhân vật đứng sân" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 3, noteVi: "Buff 20% ATK cho toàn đội sau Q" },
      { setIds: ["gladiator-s-finale", "shimenawa-s-reminiscence"], mode: "2+2", priority: 4, noteVi: "2pc ATK% (+18%) + 2pc ATK% (+18%) để tối đa hóa buff của Xianyun" },
    ],
    mainStats: {
      sands: "ATK% hoặc ER%",
      goblet: "ATK%",
      circlet: "ATK% hoặc Trị Liệu / CRIT Rate",
      note: "Buff Tấn Công Khi Rơi của Xianyun tỷ lệ trực tiếp theo ATK tối đa (chạm mốc 4500 ATK để max buff 9000 flat DMG). Cần duy trì ER 160-200%.",
    },
    subStats: {
      stats: ["Energy Recharge (ER 170-200%)", "ATK%", "Flat ATK", "CRIT Rate (khi mang Tây Phong)"],
      note: "Ưu tiên số 1 là ER để Q hồi mỗi chu kỳ, sau đó dồn toàn bộ vào ATK% và Flat ATK.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q là kỹ năng quan trọng nhất cho phép cả đội nhảy cao và buff sát thương khi rơi. E lướt 3 lần gây sát thương và gom quái. NA không nâng.",
    },
    playstyleNoteVi:
      "Xianyun biến mọi nhân vật thành DPS Tấn Công Khi Rơi đỉnh cao (Xiao, Diluc, Gaming, Hu Tao). Chu kỳ: E lướt 3 lần tạo hạt -> Q kích hoạt buff và hồi máu toàn đội -> Đổi sang DPS chính nhảy và giáng đòn khi rơi liên tục.",
  },

  // ── Wanderer: Anemo Catalyst (On-field Flying Normal / Charged Attack DPS) ──
  wanderer: {
    weapons: [
      { weaponId: "tulaytullah-s-remembrance", tier: "S", noteVi: "Trấn tốt nhất - CRIT DMG 44.1%, tăng tốc độ đánh và tăng tối đa 48% DMG Tấn Công Thường" },
      { weaponId: "lost-prayer-to-the-sacred-winds", tier: "S", noteVi: "CRIT Rate 33.1%, tăng tốc chạy và tích lũy 32% Nguyên Tố DMG khi đứng sân" },
      { weaponId: "the-widsith", tier: "A", noteVi: "Chương Nhạc Lang Thang - R5 cung cấp lượng buff cực khủng trong 10s" },
      { weaponId: "solar-pearl", tier: "A", noteVi: "Nhật Nguyệt Hạp - Tăng CRIT Rate và tương tác hoàn hảo giữa NA và Skill" },
      { weaponId: "favonius-codex", tier: "B", noteVi: "Tùy chọn F2P nạp" },
    ],
    artifacts: [
      { setIds: ["desert-pavilion-chronicle"], mode: "4pc", priority: 1, noteVi: "Trấn tốt nhất - Tăng 15% Anemo DMG, 10% Tốc đánh và 40% DMG NA/CA sau khi Trọng Kích" },
      { setIds: ["shimenawa-s-reminiscence"], mode: "4pc", priority: 2, noteVi: "Tăng 18% ATK và 50% DMG NA/CA khi tiêu hao 15 năng lượng" },
      { setIds: ["marechaussee-hunter"], mode: "4pc", priority: 3, noteVi: "Cực mạnh khi đi cùng Furina - Cho 36% CRIT Rate miễn phí" },
      { setIds: ["desert-pavilion-chronicle", "gladiator-s-finale"], mode: "2+2", priority: 4, noteVi: "2pc Phong (+15% ST Phong) + 2pc ATK (+18% Tấn Công)" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Anemo DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Cân bằng tỷ lệ 1:2 chuẩn KQM (CR >= 70%, CD >= 150%). Nếu đi với Faruzan C6, CRIT DMG sẽ được buff thêm 40%.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Energy Recharge (ER 110-120%)", "Elemental Mastery"],
      note: "Tập trung tối đa vào CRIT và ATK%. Wanderer không phụ thuộc nhiều vào Q nên không cần đầu tư nhiều ER.",
    },
    talentPriority: {
      order: ["Đòn thường (NA)", "Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)"],
      note: "NA là nguồn sát thương cốt lõi được khuếch đại bởi E. E tăng hệ số sát thương khi bay. Q là đòn nuke giẫm đạp kết thúc chu kỳ.",
    },
    playstyleNoteVi:
      "Bật E bay lên không trung, hấp thụ nguyên tố của địch/đồng đội (Hỏa +30% ATK, Băng +20% CR, Thủy +20 điểm bay, Lôi hồi năng lượng). Tung 1 đòn Trọng Kích để kích hoạt 4pc Sử Ký Sa Mạc -> Spam đòn thường liên hoàn -> Q giẫm đạp trước khi đáp đất.",
  },

  // ── Sangonomiya Kokomi: Hydro Catalyst (Healer / Hydro Enabler / Driver) ──
  "sangonomiya-kokomi": {
    weapons: [
      { weaponId: "everlasting-moonglow", tier: "S", noteVi: "Vầng Trăng Bất Diệt - Trấn Kokomi tăng HP, hiệu quả trị liệu và buff NA theo HP" },
      { weaponId: "thrilling-tales-of-dragon-slayers", tier: "S", noteVi: "Câu Chuyện Diệt Rồng R5 - Buff 48% ATK cho DPS kế tiếp cực kỳ giá trị" },
      { weaponId: "prototype-amber", tier: "A", noteVi: "Mẫu Kim Phách R5 - Tăng HP% và hồi 18 năng lượng cho cả đội sau Q" },
      { weaponId: "sacrificial-fragments", tier: "B", noteVi: "Mảnh Chương Tế Lễ - Reset vị trí E Sứa Biển trong đội hình Đóng Băng / Nilou Bloom" },
    ],
    artifacts: [
      { setIds: ["ocean-hued-clam"], mode: "4pc", priority: 1, noteVi: "Xà Cừ Đại Dương - Tối ưu DPS Sub-Healer, nổ bọt nước gây tới 30,000 sát thương vật lý mỗi 3.5s" },
      { setIds: ["tenacity-of-the-millelith"], mode: "4pc", priority: 2, noteVi: "Thiên Nham - E Sứa Biển liên tục kích hoạt buff 20% ATK cho toàn đội" },
      { setIds: ["maiden-beloved"], mode: "4pc", priority: 3, noteVi: "Thiếu Nữ Đáng Yêu - Hồi máu tối đa" },
      { setIds: ["tenacity-of-the-millelith", "ocean-hued-clam"], mode: "2+2", priority: 4, noteVi: "2pc HP (+20%) + 2pc Trị Liệu (+15% Healing Bonus)" },
    ],
    mainStats: {
      sands: "HP%",
      goblet: "Hydro DMG% hoặc HP%",
      circlet: "Tăng Trị Liệu (Healing Bonus)",
      note: "Kokomi có thiên phú giảm 100% CRIT Rate, KHÔNG BAO GIỜ dùng chỉ số CRIT. Nón Tăng Trị Liệu chuyển hóa thành sát thương đòn đánh trong Q nhờ nội tại A4.",
    },
    subStats: {
      stats: ["HP%", "Energy Recharge (ER 140-160%)", "Flat HP", "Elemental Mastery (cho Bloom)"],
      note: "Dồn tuyệt đối vào HP% và ER%. Tránh mọi dòng CRIT.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E triệu hồi Sứa Biển hồi máu và áp Thủy diện rộng là kỹ năng quan trọng nhất. Q làm mới thời gian tồn tại của E và buff sát thương khi đứng sân. NA nâng nếu làm Driver.",
    },
    playstyleNoteVi:
      "Kokomi là hạt nhân trong đội hình Đóng Băng (Ayaka/Ganyu) và Nở Rộ Sum Suê (Nilou Bloom). Thả E áp Thủy liên tục không gián đoạn, đổi sang chủ lực nhận buff Câu Chuyện Diệt Rồng. Bật Q khi E sắp hết giờ để làm mới Sứa Biển và đứng sân hồi máu cho toàn đội.",
  },

  // ── Kamisato Ayato: Hydro Sword (On-field Normal Attack Hydro DPS) ──
  "kamisato-ayato": {
    weapons: [
      { weaponId: "haran-geppaku-futsu", tier: "S", noteVi: "Trấn tốt nhất - CRIT Rate 33.1%, tăng sát thương nguyên tố và 40% DMG Tấn Công Thường" },
      { weaponId: "mistsplitter-reforged", tier: "S", noteVi: "Ánh Sáng Nơi Cắt Sương - CRIT DMG 44.1% + buff Thủy DMG cực lớn" },
      { weaponId: "primordial-jade-cutter", tier: "A", noteVi: "Bàn Nham Kết Lục - CRIT Rate 44.1% + tăng ATK theo HP" },
      { weaponId: "the-black-sword", tier: "A", noteVi: "Kiếm Đen - CRIT Rate + tăng 40% sát thương đòn thường ở R5" },
      { weaponId: "amenoma-kageuchi", tier: "B", noteVi: "Đoản Đao Amenoma F2P - Hồi năng lượng Q hữu hiệu" },
    ],
    artifacts: [
      { setIds: ["echoes-of-an-offering"], mode: "4pc", priority: 1, noteVi: "Dư Âm Tế Lễ - Tăng 70% ATK flat damage cho Tấn Công Thường (yêu cầu ping < 80ms)" },
      { setIds: ["heart-of-depth"], mode: "4pc", priority: 2, noteVi: "Trái Tim Trầm Luân - Tăng 15% Thủy DMG và 30% DMG Tấn Công Thường sau khi dùng E" },
      { setIds: ["gladiator-s-finale"], mode: "4pc", priority: 3, noteVi: "Giác Đấu Sĩ - Tăng 18% ATK và 35% DMG Tấn Công Thường cực kỳ ổn định" },
      { setIds: ["heart-of-depth", "gladiator-s-finale"], mode: "2+2", priority: 4, noteVi: "2pc Thủy (+15% ST Thủy) + 2pc ATK (+18% Tấn Công)" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Hydro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Ayato có sát thương E tăng nhẹ theo HP tối đa nhờ Sóng Sánh, nhưng ATK% Sands luôn cho DPS cao hơn HP% Sands.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Energy Recharge (ER 120-130%)", "HP%", "Elemental Mastery"],
      note: "Cân bằng CR/CD chuẩn (CR >= 70%, CD >= 150%), duy trì ER khoảng 130% để Q hồi đều đặn.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E Soukai Kanka biến đòn đánh thành Thuấn Thủy Kiếm là 80% sát thương của Ayato (tính theo talent level của E, KHÔNG phụ thuộc talent level của NA). Q tạo mưa Thủy diện rộng buff NA. NA không cần nâng.",
    },
    playstyleNoteVi:
      "Khai mở Q tạo vùng mưa Thủy diện rộng và buff 20% sát thương đòn thường cho đồng đội -> Đồng đội bật buff -> Ayato nhấn E giữ nút tấn công chém 15 nhát Thuấn Thủy Kiếm xé toạc kẻ địch trong 6 giây.",
  },

  // ── Shenhe: Cryo Polearm (Premier Cryo Buffer / Shredder) ──
  shenhe: {
    weapons: [
      { weaponId: "calamity-queller", tier: "S", noteVi: "Hủy Diệt - Base ATK 741 cao nhất game + passive tăng tối đa ATK% khi off-field" },
      { weaponId: "engulfing-lightning", tier: "A", noteVi: "Đoạn Thảo Trường Đao - ER cực cao và chuyển hóa ER thành ATK%" },
      { weaponId: "favonius-lance", tier: "A", noteVi: "Thương Tây Phong - Tốt nhất cho độ mượt của đội hình, tạo hạt trắng dồi dào" },
      { weaponId: "skyward-spine", tier: "B", noteVi: "Xương Sống Thiên Không - Base ATK cao 674 và cung cấp ER" },
    ],
    artifacts: [
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 1, noteVi: "Tông Thất - Buff 20% ATK cho Ayaka/Ganyu sau Q" },
      { setIds: ["gladiator-s-finale", "shimenawa-s-reminiscence"], mode: "2+2", priority: 2, noteVi: "2pc ATK% (+18%) + 2pc ATK% (+18%) - Tối đa hóa chỉ số ATK để buff Băng Linh Icy Quills mạnh nhất" },
      { setIds: ["blizzard-strayer"], mode: "4pc", priority: 3, noteVi: "Dùng cho Sub-DPS Băng cá nhân" },
    ],
    mainStats: {
      sands: "ATK% hoặc ER%",
      goblet: "ATK%",
      circlet: "ATK% (hoặc CRIT Rate khi dùng Thương Tây Phong)",
      note: "Băng Linh (Icy Quills) của Shenhe cộng thẳng sát thương phẳng vào đòn đánh Băng của đồng đội tỷ lệ theo 100% ATK của Shenhe. Đẩy ATK càng cao càng tốt (mục tiêu 3500 - 4000+ ATK).",
    },
    subStats: {
      stats: ["ATK%", "Energy Recharge (ER 160-180%)", "Flat ATK", "CRIT Rate (đạt 40%+ nếu dùng Tây Phong)"],
      note: "Ưu tiên ATK% và ER%. Cần 160-180% ER để nộ mỗi chu kỳ (Q cost 80).",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E kích hoạt Băng Linh Icy Quills là kỹ năng quan trọng số 1. Q giảm kháng Băng/Vật Lý và tăng sát thương Băng. NA không nâng.",
    },
    playstyleNoteVi:
      "Shenhe biến mọi chủ lực Băng (Ayaka, Ganyu, Wriothesley) thành quái vật dồn sát thương. Nhấn E (5 stack Icy Quills, buff 15% Skill/Burst DMG) hoặc Giữ E (7 stack, buff 15% NA/CA DMG). Q giảm kháng và áp Băng diện rộng.",
  },

  // ── Tartaglia: Hydro Bow (On-field Vaporize Enabler & Nuke Burst DPS) ──
  tartaglia: {
    weapons: [
      { weaponId: "polar-star", tier: "S", noteVi: "Ngôi Sao Cực Đông - Trấn Tartaglia, CRIT Rate 33.1% + stack tăng 48% ATK và buff E/Q" },
      { weaponId: "thundering-pulse", tier: "S", noteVi: "Sấm Sét Rung Động - CRIT DMG 66.2% + buff ATK% và sát thương đòn đánh" },
      { weaponId: "aqua-simulacra", tier: "A", noteVi: "Nhược Thủy - CRIT DMG 88.2% + 20% DMG toàn diện" },
      { weaponId: "skyward-harp", tier: "A", noteVi: "Cánh Thiên Không - Cung cấp cả CRIT Rate lẫn CRIT DMG cân bằng" },
      { weaponId: "the-viridescent-hunt", tier: "B", noteVi: "Cung Sắc Xanh Điểm Danh - CRIT Rate + lốc xoáy gom quái nhỏ cực kỳ tiện lợi" },
      { weaponId: "rust", tier: "B", noteVi: "Cung Rỉ Sét - Tăng đến 80% DMG Tấn Công Thường ở R5" },
    ],
    artifacts: [
      { setIds: ["nymph-s-dream"], mode: "4pc", priority: 1, noteVi: "Giấc Mộng Thủy Tiên - Bộ tối ưu nhất, tăng tối đa 30% Thủy DMG và 25% ATK" },
      { setIds: ["heart-of-depth"], mode: "4pc", priority: 2, noteVi: "Trái Tim Trầm Luân - Tăng 15% Thủy DMG và 30% DMG NA/CA sau khi bật E" },
      { setIds: ["heart-of-depth", "gladiator-s-finale"], mode: "2+2", priority: 3, noteVi: "2pc Thủy (+15% ST Thủy) + 2pc ATK (+18% Tấn Công)" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Hydro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Tartaglia không có ICD trên Đoạn Lưu (Riptide), áp Thủy cực nhanh nên cần CRIT Rate cao (>= 75%) để kích hoạt Đoạn Lưu liên tục.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Elemental Mastery (EM 80-120 cho nuke Q Bốc Hơi)", "Energy Recharge (ER 120%)"],
      note: "CRIT Rate cực kỳ quan trọng. Thêm một chút EM giúp chiêu Q dạng Cận Chiến kích Bốc Hơi hàng trăm ngàn sát thương nuke.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E chuyển sang song đao Cận Chiến là nguồn sát thương và áp Thủy chính. Q nuke bộc phát sát thương cực lớn. NA nâng để tăng sát thương Đoạn Lưu.",
    },
    playstyleNoteVi:
      "Tartaglia là linh hồn của đội hình International (Tartaglia + Xiangling + Kazuha + Bennett). Áp Thủy kép bằng E, kích nuke Q dạng Tầm Xa (hoặc Cận Chiến) Bốc Hơi, sau đó chém E liên hoàn tạo phản ứng Đoạn Lưu nổ dây chuyền cho Pyronado của Xiangling liên tục Bốc Hơi x2.0.",
  },

  // ── Lyney: Pyro Bow (Fontaine On-field Mono-Pyro Charged Attack DPS) ──
  lyney: {
    weapons: [
      { weaponId: "the-first-great-magic", tier: "S", noteVi: "Ảo Thuật Đầu Tiên - Trấn Lyney, CRIT DMG 66.2% + buff ATK% và Tốc chạy theo đồng đội hệ Hỏa" },
      { weaponId: "aqua-simulacra", tier: "S", noteVi: "Nhược Thủy - CRIT DMG 88.2% + 20% DMG toàn diện" },
      { weaponId: "thundering-pulse", tier: "A", noteVi: "CRIT DMG 66.2% + Base ATK cao" },
      { weaponId: "song-of-stillness", tier: "B", noteVi: "Cung rèn F2P Fontaine - Tăng đến 32% DMG sau khi nhận hồi máu" },
    ],
    artifacts: [
      { setIds: ["marechaussee-hunter"], mode: "4pc", priority: 1, noteVi: "Thợ Săn Marechaussee - Tự động thay đổi HP khi bắn Mũ Mèo Cười cho 36% CRIT Rate miễn phí" },
      { setIds: ["lavawalker"], mode: "4pc", priority: 2, noteVi: "Hiền Giả Bốc Lửa - Tăng 35% DMG lên kẻ địch dính ấn Hỏa (Mono Pyro)" },
      { setIds: ["crimson-witch-of-flames", "gladiator-s-finale"], mode: "2+2", priority: 3, noteVi: "2pc Hỏa (+15% ST Hỏa) + 2pc ATK (+18% Tấn Công)" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Pyro DMG%",
      circlet: "CRIT DMG (bộ Thợ Săn đã cho 36% CR)",
      note: "Lyney tối ưu hóa sức mạnh trong đội hình Đơn Hỏa (Mono-Pyro với Bennett, Xiangling, Dehya, Kazuha/Zhongli). Nón luôn chọn CRIT DMG.",
    },
    subStats: {
      stats: ["CRIT DMG", "CRIT Rate (đạt ~50-60% trước khi tính 4pc Marechaussee)", "ATK%", "Energy Recharge (ER 120%)"],
      note: "Dồn chỉ số vào CRIT DMG và ATK%. Không cần EM vì lối chơi chủ đạo là Đơn Hỏa.",
    },
    talentPriority: {
      order: ["Đòn thường (NA)", "Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)"],
      note: "Trọng kích Mũ Mèo Cười thuộc NA là nguồn sát thương cốt lõi. E nuke dồn sát thương khi tích đủ stack Đạo Cụ. Q hóa mèo biểu diễn.",
    },
    playstyleNoteVi:
      "Lyney bắn Trọng Kích tạo Mũ Mèo Cười khiêu khích quái và tích tầng Đạo Cụ (tiêu hao HP nếu HP > 60%). Khi tích đủ 4-5 tầng, kích hoạt E nổ bùng sát thương diện rộng và hồi máu cho Lyney.",
  },

  // ── Wriothesley: Cryo Catalyst (Fontaine On-field Cryo Boxer DPS) ──
  wriothesley: {
    weapons: [
      { weaponId: "cashflow-supervision", tier: "S", noteVi: "Giám Sát Dòng Tiền - Trấn Wriothesley, CRIT Rate 22.1% + buff ATK và tăng đến 48% DMG NA/CA khi HP biến động" },
      { weaponId: "tulaytullah-s-remembrance", tier: "A", noteVi: "Hồi Ức Tulaytullah - CRIT DMG 44.1% + tăng tốc độ đấm và sát thương NA" },
      { weaponId: "lost-prayer-to-the-sacred-winds", tier: "A", noteVi: "Điển Tích Tây Phong - CRIT Rate 33.1% + tăng tốc chạy và Băng DMG khi đứng sân" },
      { weaponId: "the-widsith", tier: "B", noteVi: "Chương Nhạc Lang Thang F2P - Cực mạnh trong đội hình Tan Chảy (Melt)" },
    ],
    artifacts: [
      { setIds: ["marechaussee-hunter"], mode: "4pc", priority: 1, noteVi: "Thợ Săn Marechaussee - Tự động rút HP khi đấm E, kích hoạt trọn vẹn 36% CRIT Rate" },
      { setIds: ["blizzard-strayer"], mode: "4pc", priority: 2, noteVi: "Dũng Sĩ Băng Giá - Dành riêng cho đội hình Đóng Băng (Freeze)" },
      { setIds: ["shimenawa-s-reminiscence"], mode: "4pc", priority: 3, noteVi: "Dòng Hồi Ức - Tăng 50% DMG đòn đánh thường và trọng kích" },
      { setIds: ["blizzard-strayer", "gladiator-s-finale"], mode: "2+2", priority: 4, noteVi: "2pc Băng (+15% ST Băng) + 2pc ATK (+18% Tấn Công)" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Cryo DMG%",
      circlet: "CRIT DMG (bộ Marechaussee đã cho 36% CR)",
      note: "Wriothesley tự rút máu mỗi cú đấm trong trạng thái E, tự động kích hoạt tối đa hiệu ứng bộ Thợ Săn Marechaussee.",
    },
    subStats: {
      stats: ["CRIT DMG", "CRIT Rate (đạt 45-60% trước buff)", "ATK%", "Elemental Mastery (nếu chơi Tan Chảy)", "Energy Recharge"],
      note: "Cực kỳ thích hợp chơi Tan Chảy cùng Thoma/Xiangling/Nahida, khi đó 100-150 EM đem lại lượng sát thương đột biến.",
    },
    talentPriority: {
      order: ["Đòn thường (NA)", "Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)"],
      note: "NA là nắm đấm sát thương chính. E gia tăng sát thương cho từng cú đấm. Q nuke 5 cú đấm liên hoàn kết thúc combo.",
    },
    playstyleNoteVi:
      "Bật E gia tăng sát thương quyền cước, liên tục tung combo 5 đòn thường đấm bốc cận chiến. Khi HP giảm xuống dưới 60%, kích hoạt đòn Trọng Kích cường hóa miễn phí hồi phục 30% HP và gây sát thương Băng cực lớn.",
  },

  // ── Chevreuse: Pyro Polearm (Overload Niche Support & Shredder) ──
  chevreuse: {
    weapons: [
      { weaponId: "rightful-reward", tier: "S", noteVi: "Phần Thưởng Của Công Lý - Thương rèn Fontaine tăng HP% và hồi phục năng lượng cho Chevreuse" },
      { weaponId: "black-tassel", tier: "A", noteVi: "Hắc Anh Thương 3★ - Tăng đến 46.9% HP giúp dễ dàng đạt mốc 40,000 HP tối đa" },
      { weaponId: "favonius-lance", tier: "A", noteVi: "Thương Tây Phong - Cung cấp hạt năng lượng cho đội hình Hỏa / Lôi" },
    ],
    artifacts: [
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 1, noteVi: "Tông Thất - Buff thêm 20% ATK cho toàn đội sau khi dùng Q" },
      { setIds: ["song-of-days-past"], mode: "4pc", priority: 2, noteVi: "Khúc Ca Ngày Cũ - Tăng sát thương phẳng cho DPS đứng sân dựa trên lượng hồi máu" },
      { setIds: ["tenacity-of-the-millelith", "vourukasha-s-glow"], mode: "2+2", priority: 3, noteVi: "2pc HP (+20%) + 2pc HP (+20%) - Đảm bảo chạm mốc 40,000 HP dễ dàng nhất" },
    ],
    mainStats: {
      sands: "HP%",
      goblet: "HP%",
      circlet: "HP% (hoặc Tăng Trị Liệu / CRIT Rate)",
      note: "MỤC TIÊU CỐT LÕI: Đạt mốc 40,000 HP tối đa để kích hoạt tối đa thiên phú buff 40% ATK cho đồng đội Hỏa và Lôi (mỗi 1000 HP cho 1% ATK).",
    },
    subStats: {
      stats: ["HP%", "Flat HP", "Energy Recharge (ER 140-160%)", "CRIT Rate (khi dùng Tây Phong)"],
      note: "Tập trung toàn bộ vào HP để đạt mốc 40,000 HP. Cần một lượng ER vừa phải nếu muốn dùng Q mỗi chu kỳ.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E bắn súng tạo hồi máu và kích hoạt buff ATK cho đội là kỹ năng quan trọng nhất. Q ném lựu đạn gây sát thương và gom nhẹ quái. NA không nâng.",
    },
    playstyleNoteVi:
      "Chevreuse là bá chủ trong đội hình Quá Tải thuần Hỏa-Lôi (Raiden, Clorinde, Yoimiya, Xiangling). ĐIỀU KIỆN TIÊN QUYẾT: Đội hình CHỈ GỒM nhân vật Hỏa và Lôi để kích hoạt nội tại Giảm 40% Kháng Hỏa và Lôi của kẻ địch (thay thế hoàn toàn Kazuha VV). Khi xảy ra Quá Tải, nhấn giữ E bắn Đạn Tầm Cao nạp buff 40% ATK cho toàn đội.",
  },

  // ── Emilie: Dendro Polearm (Off-field Burning Sub-DPS) ──
  emilie: {
    weapons: [
      { weaponId: "lumidouce-elegy", tier: "S", noteVi: "Khúc Ca Hòa Nhã - Trấn Emilie, CRIT Rate 33.1% + buff ATK% và tăng sát thương khi kẻ địch bị Thiêu Đốt" },
      { weaponId: "staff-of-homa", tier: "S", noteVi: "Trượng Homa - CRIT DMG 66.2% + buff ATK dồi dào" },
      { weaponId: "calamity-queller", tier: "A", noteVi: "Hủy Diệt - Base ATK cực cao và tăng ATK khi ở ngoài sân" },
      { weaponId: "ballad-of-the-fjords", tier: "A", noteVi: "Vịnh Hẹp Hoa Tiêu - CRIT Rate 27.6% + buff EM khi đội có 3 nguyên tố khác nhau" },
      { weaponId: "favonius-lance", tier: "B", noteVi: "Thương Tây Phong - Tùy chọn nạp F2P" },
    ],
    artifacts: [
      { setIds: ["unfinished-reverie"], mode: "4pc", priority: 1, noteVi: "Ảo Mộng Chưa Hoàn Thành - Tăng 50% DMG toàn diện khi kẻ địch bị Thiêu Đốt (Burning)" },
      { setIds: ["deepwood-memories"], mode: "4pc", priority: 2, noteVi: "Ký Ức Rừng Sâu - Giảm 30% Thảo RES nếu không có đồng đội khác mang" },
      { setIds: ["unfinished-reverie", "gladiator-s-finale"], mode: "2+2", priority: 3, noteVi: "2pc ATK (+18%) + 2pc Thảo (+15% ST Thảo)" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Dendro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Toàn bộ sát thương Chiết Xuất Nước Hoa của Emilie tỷ lệ theo ATK (mục tiêu 2200+ ATK). Cần duy trì kẻ địch bị Thiêu Đốt để hộp hương nâng lên Cấp 2.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Energy Recharge (ER 120-130%)", "Elemental Mastery"],
      note: "Emilie là Sub-DPS gây sát thương thuần, tập trung dồn chỉ số vào CRIT và ATK% tương tự Yelan hoặc Fischl.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E đặt Hộp Hương Lumidouce là nguồn 80% sát thương ngoài sân. Q làm mới Hộp Hương và thả giọt hương thơm cực mạnh. NA không nâng.",
    },
    playstyleNoteVi:
      "Emilie kết hợp hoàn hảo với các đội hình có yếu tố Thiêu Đốt (Kinich, Mavuika, Wriothesley Melt, Ganyu Burnmelt). Đặt E ngoài sân, khi kẻ địch bị Thiêu Đốt hộp hương sẽ thăng cấp bắn đạn liên hoàn gây sát thương Thảo cực lớn.",
  },

  // ── Nilou: Hydro Sword (Bountiful Bloom Core Enabler) ──
  nilou: {
    weapons: [
      { weaponId: "key-of-khaj-nisut", tier: "S", noteVi: "Chìa Khóa Khaj-Nisut - Trấn Nilou, tăng 66.2% HP và chia sẻ EM khổng lồ cho toàn đội" },
      { weaponId: "the-dockhand-s-assistant", tier: "A", noteVi: "Thợ Lặn Kỳ Bí - Kiếm 4★ tăng HP% tốt nhất cho Nilou" },
      { weaponId: "iron-sting", tier: "B", noteVi: "Thiết Phong Kích F2P - Tăng Tinh Thông Nguyên Tố" },
      { weaponId: "favonius-sword", tier: "B", noteVi: "Tây Phong Kiếm - Hỗ trợ nạp Q cho đội" },
    ],
    artifacts: [
      { setIds: ["tenacity-of-the-millelith", "vourukasha-s-glow"], mode: "2+2", priority: 1, noteVi: "2pc HP (+20%) + 2pc HP (+20%) - Tối đa hóa chỉ số HP để đạt mốc trần 74,400 HP" },
      { setIds: ["flower-of-paradise-lost"], mode: "4pc", priority: 2, noteVi: "Đóa Hoa Thiên Đường Đã Mất - Tăng tối đa sát thương phản ứng Nở Rộ" },
      { setIds: ["gilded-dreams"], mode: "4pc", priority: 3, noteVi: "Giấc Mộng Hoàng Kim - Tăng lượng lớn Tinh Thông Nguyên Tố" },
    ],
    mainStats: {
      sands: "HP%",
      goblet: "HP%",
      circlet: "HP%",
      note: "MỤC TIÊU TRẦN: 74,400 HP tối đa. Mỗi 1000 HP vượt mốc 30,000 HP sẽ tăng 9% sát thương Hạt Nhân Căng Tràn (tối đa buff 400% DMG Hạt Nở Rộ).",
    },
    subStats: {
      stats: ["HP%", "Flat HP", "Elemental Mastery (EM)", "Energy Recharge"],
      note: "Dồn 100% tài nguyên vào HP% và Flat HP trên cả 5 món thánh di vật.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E kích hoạt Vũ Điệu Xoay Vòng và Vòng Nước Thanh Tẩy là kỹ năng cốt lõi. Q tạo hai đợt sát thương Thủy diện rộng. NA không nâng.",
    },
    playstyleNoteVi:
      "QUY TẮC BẮT BUỘC: Đội hình CHỈ GỒM DUY NHẤT nhân vật Thủy và Thảo (Nilou + Nahida/Baizhu/Alhaitham/Kokomi). Nhấn E 3 lần tạo Vòng Nước Thanh Tẩy quanh người, biến Hạt Thảo bình thường thành Hạt Nhân Căng Tràn nổ tức thì với bán kính cực rộng và sát thương hủy diệt hàng chục ngàn sát thương diện rộng.",
  },

  // ── Yae Miko: Electro Catalyst (Off-field Totem Sub-DPS & Burst Nuke) ──
  "yae-miko": {
    weapons: [
      { weaponId: "kagura-s-verity", tier: "S", noteVi: "Chân Ý Của Kagura - Trấn Yae Miko, CRIT DMG 66.2% + tích 3 stack tăng 36% Skill DMG và 12% Elemental DMG" },
      { weaponId: "lost-prayer-to-the-sacred-winds", tier: "A", noteVi: "CRIT Rate 33.1% + Base ATK cao" },
      { weaponId: "the-widsith", tier: "A", noteVi: "Chương Nhạc Lang Thang R5 - CRIT DMG cao và buff nổ bộc phát kinh hoàng" },
      { weaponId: "solar-pearl", tier: "B", noteVi: "Nhật Nguyệt Hạp - CRIT Rate ổn định" },
    ],
    artifacts: [
      { setIds: ["golden-troupe"], mode: "4pc", priority: 1, noteVi: "Đoàn Kịch Hoàng Kim - Tăng tới 70% sát thương cho 3 trụ Sesshou Sakura ngoài sân" },
      { setIds: ["gilded-dreams"], mode: "4pc", priority: 2, noteVi: "Giấc Mộng Hoàng Kim - Tăng ATK và EM trong đội hình Sinh Trưởng (Aggravate)" },
      { setIds: ["thundering-fury", "gladiator-s-finale"], mode: "2+2", priority: 3, noteVi: "2pc Lôi (+15% ST Lôi) + 2pc ATK (+18% Tấn Công)" },
    ],
    mainStats: {
      sands: "ATK% hoặc EM",
      goblet: "Electro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Yae Miko có thiên phú tăng sát thương Sesshou Sakura theo EM (mỗi điểm EM tăng 0.15% DMG), trong đội Aggravate Đồng hồ EM hoàn toàn có thể cạnh tranh với ATK%.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Elemental Mastery (EM 100-150)", "Energy Recharge (ER 130-140%)"],
      note: "Cân bằng CR/CD chuẩn (CR >= 70%, CD >= 150%).",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E cắm 3 trụ Sát Sinh Anh là nguồn 70% sát thương của Yae. Q nuke 4 tia sét Thiên Hồ cực mạnh (hệ số lên tới 2000%+). NA nâng nếu đứng sân đánh thường.",
    },
    playstyleNoteVi:
      "Chu kỳ E-E-E lướt cắm 3 trụ tam giác giật sét tự động ngoài sân. Kết hợp cùng Thảo (Nahida, Alhaitham) để kích hoạt phản ứng Tăng Cường (Aggravate). Khi Q sẵn sàng, nổ Q phá hủy 3 trụ giáng 4 đòn sấm sét rồi lập tức E-E-E tái tạo trụ mới.",
  },

  // ── Tighnari: Dendro Bow (Quickswap Spread Burst DPS) ──
  tighnari: {
    weapons: [
      { weaponId: "hunter-s-path", tier: "S", noteVi: "Con Đường Thợ Săn - Trấn Tighnari, CRIT Rate 44.1% + buff sát thương Trọng Kích cực lớn theo EM" },
      { weaponId: "the-first-great-magic", tier: "S", noteVi: "CRIT DMG 66.2% + buff ATK%" },
      { weaponId: "aqua-simulacra", tier: "A", noteVi: "Nhược Thủy - CRIT DMG 88.2% + 20% DMG toàn diện" },
      { weaponId: "slingshot", tier: "A", noteVi: "Ná Bắn Chim 3★ - CRIT Rate 31.2% + tăng 60% DMG đòn bắn gần, cực kỳ mạnh và rẻ cho F2P" },
      { weaponId: "the-stringless", tier: "B", noteVi: "Tuyệt Huyền - Tăng EM và buff sát thương E/Q" },
    ],
    artifacts: [
      { setIds: ["gilded-dreams"], mode: "4pc", priority: 1, noteVi: "Giấc Mộng Hoàng Kim - Tăng lượng lớn EM và ATK trong đội hình Lan Tràn (Spread)" },
      { setIds: ["wanderer-s-troupe"], mode: "4pc", priority: 2, noteVi: "Đoàn Hát Lang Thang - Tăng 80 EM và 35% sát thương Đòn Trọng Kích Mũi Tên Hoa Đực" },
      { setIds: ["deepwood-memories"], mode: "4pc", priority: 3, noteVi: "Giảm 30% Thảo RES nếu không có đồng đội khác mang" },
      { setIds: ["deepwood-memories", "gilded-dreams"], mode: "2+2", priority: 4, noteVi: "2pc Thảo (+15% ST Thảo) + 2pc EM (+80 Tinh Thông)" },
    ],
    mainStats: {
      sands: "EM hoặc ATK%",
      goblet: "Dendro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Sát thương Trọng Kích và Q của Tighnari tăng mạnh theo Tinh Thông Nguyên Tố nhờ nội tại A4 (mỗi EM tăng 0.06% DMG, max 80%). Đồng hồ EM luôn là lựa chọn hàng đầu.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "Elemental Mastery (EM 250-350+)", "ATK%", "Energy Recharge (ER 120%)"],
      note: "Ưu tiên CRIT và EM. Q chỉ tốn 40 năng lượng nên gần như không bao giờ thiếu nạp.",
    },
    talentPriority: {
      order: ["Đòn thường (NA)", "Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)"],
      note: "NA tăng sát thương Trọng Kích Bão Tiễn Hoa Đực là nguồn sát thương số 1. Q bắn 6 mũi tên Thảo tự tìm mục tiêu. E ném bom gây ảo giác và giảm thời gian tụ lực.",
    },
    playstyleNoteVi:
      "Tighnari là DPS Đổi Nhanh (Quickswap) đỉnh cao kết hợp cùng Yae Miko, Fischl, Zhongli, Nahida. Chu kỳ cực nhanh trong 4 giây: E ném bom tạo ảo giác -> Bắn 3 phát Trọng Kích thần tốc không cần tụ lực -> Q bắn mưa tên Thảo Lan Tràn -> Đổi nhân vật.",
  },

  // ── Faruzan: Anemo Bow (Dedicated Anemo Hyper-Buffer & Shredder) ──
  faruzan: {
    weapons: [
      { weaponId: "elegy-for-the-end", tier: "S", noteVi: "Tiếng Thở Dài Vô Tận - Nạp cao + buff 100 EM và 20% ATK cho chủ lực Phong" },
      { weaponId: "favonius-warbow", tier: "S", noteVi: "Cung Tây Phong - Vũ khí thiết yếu nhất giải quyết cơn khát năng lượng của Faruzan" },
      { weaponId: "sacrificial-bow", tier: "A", noteVi: "Cung Tế Lễ - Cung cấp lượng lớn nạp và reset E" },
    ],
    artifacts: [
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 1, noteVi: "Tông Thất - Buff 20% ATK cho Xiao / Wanderer sau Q" },
      { setIds: ["tenacity-of-the-millelith"], mode: "4pc", priority: 2, noteVi: "Thiên Nham (YÊU CẦU C6) - Hố đen kích nổ liên tục ngoài sân duy trì 100% uptime buff 20% ATK" },
      { setIds: ["viridescent-venerer"], mode: "4pc", priority: 3, noteVi: "Bóng Hình Màu Xanh - Hỗ trợ giảm kháng nguyên tố phụ cho đội hình kép" },
      { setIds: ["emblem-of-severed-fate", "viridescent-venerer"], mode: "2+2", priority: 4, noteVi: "2pc Nạp (+20% ER) + 2pc Phong" },
    ],
    mainStats: {
      sands: "Energy Recharge (ER%)",
      goblet: "Anemo DMG% hoặc ATK%",
      circlet: "CRIT Rate (để kích hoạt Tây Phong)",
      note: "YÊU CẦU NĂNG LƯỢNG SỐ 1: Faruzan trước C6 cần từ 280% - 300%+ ER! Đạt C6 giảm xuống còn 200-220% ER. Luôn dùng Đồng hồ Nạp và Nón CRIT Rate.",
    },
    subStats: {
      stats: ["Energy Recharge (ER tối đa)", "CRIT Rate (đạt 50%+ cho Tây Phong)", "ATK%", "CRIT DMG"],
      note: "Đẩy ER lên cao nhất có thể. Dưới C6, mọi chỉ số khác đều xếp sau ER.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Q tung Khối Đa Diện áp giải phóng Gió Giảm Kháng Phong 30% và Buff Sát Thương Phong cho đội là kỹ năng tối thượng. E tạo hố đen. NA không nâng.",
    },
    playstyleNoteVi:
      "Faruzan là mảnh ghép bắt buộc nâng tầm Xiao, Wanderer, Heizou. Khối Đa Diện từ chiêu Q di chuyển hình tam giác liên tục giảm 30% Kháng Phong của kẻ địch và buff sát thương Phong trực tiếp cho chủ lực.",
  },

  // ── Gaming: Pyro Claymore (Plunging Attack Pyro Hypercarry) ──
  gaming: {
    weapons: [
      { weaponId: "verdict", tier: "S", noteVi: "Phán Quyết - Base ATK 674, CRIT Rate 22.1% + buff sát thương Kỹ năng nguyên tố" },
      { weaponId: "serpent-spine", tier: "S", noteVi: "Kiếm Ly Cốt - Tăng tối đa 50% DMG toàn diện cực mạnh cho Gaming" },
      { weaponId: "beacon-of-the-reed-sea", tier: "A", noteVi: "Hải Đăng Bờ Biển Lau - CRIT Rate 33.1% + buff lượng lớn ATK" },
      { weaponId: "rainslasher", tier: "B", noteVi: "Vũ Tài F2P - Tăng EM và 36% DMG lên kẻ địch dính Thủy (Bốc Hơi)" },
      { weaponId: "tidal-shadow", tier: "B", noteVi: "Bóng Râm Sóng Nước F2P - Tăng đến 48% ATK sau khi nhận hồi máu" },
    ],
    artifacts: [
      { setIds: ["marechaussee-hunter"], mode: "4pc", priority: 1, noteVi: "Thợ Săn Marechaussee - Tự động rút và hồi máu liên tục khi nhảy múa kích hoạt trọn vẹn 36% CRIT Rate" },
      { setIds: ["crimson-witch-of-flames"], mode: "4pc", priority: 2, noteVi: "Diệm Liệt Ma Nữ - Tăng tối đa sát thương phản ứng Bốc Hơi / Tan Chảy" },
      { setIds: ["crimson-witch-of-flames", "gladiator-s-finale"], mode: "2+2", priority: 3, noteVi: "2pc Hỏa (+15% ST Hỏa) + 2pc ATK (+18% Tấn Công)" },
    ],
    mainStats: {
      sands: "ATK% hoặc EM",
      goblet: "Pyro DMG%",
      circlet: "CRIT DMG (bộ Marechaussee đã cho 36% CR)",
      note: "Gaming luôn chơi kèm phản ứng Bốc Hơi/Tan Chảy (Vaporize/Melt). Nếu đồng đội đã buff nhiều ATK (Bennett), Đồng hồ EM sẽ cho sát thương cao hơn hẳn ATK%.",
    },
    subStats: {
      stats: ["CRIT DMG", "CRIT Rate (đạt 45-55% với Marechaussee)", "Elemental Mastery (EM 120-200)", "ATK%", "Energy Recharge (ER 120%)"],
      note: "Cực kỳ ăn ý khi đi cùng Xianyun và Furina tạo thành bộ ba hủy diệt La Hoàn.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E Tấn Công Khi Rơi Đạp Đất Nghê Thú là 90% sát thương của Gaming (scale theo Talent Level của E, không phụ thuộc NA). Q triệu hồi Man Chai hồi lại E liên tục. NA không nâng.",
    },
    playstyleNoteVi:
      "Bật Q triệu hồi Man Chai, khi Man Chai chạy về chạm vào Gaming sẽ làm mới ngay lập tức hồi chiêu của E. Gaming liên tục tung E bay lên không trung giáng cú Đạp Đất Nghê Thú Bốc Hơi hàng trăm ngàn sát thương diện rộng.",
  },

  // ── Dehya: Pyro Claymore (Damage Mitigation / Interruption Resistance / Pyro Driver) ──
  dehya: {
    weapons: [
      { weaponId: "beacon-of-the-reed-sea", tier: "S", noteVi: "Hải Đăng Bờ Biển Lau - Trấn Dehya, CRIT Rate 33.1% + tăng ATK và HP khi chịu sát thương" },
      { weaponId: "wolf-s-gravestone", tier: "A", noteVi: "Đường Cùng Của Sói - Cung cấp lượng lớn ATK cho Dehya và buff toàn đội" },
      { weaponId: "serpent-spine", tier: "A", noteVi: "Kiếm Ly Cốt - Tăng CRIT Rate và sát thương tổng" },
      { weaponId: "favonius-greatsword", tier: "B", noteVi: "Đại Kiếm Tây Phong - Tốt nhất cho build Support chống gián đoạn và nạp năng lượng" },
    ],
    artifacts: [
      { setIds: ["vourukasha-s-glow"], mode: "4pc", priority: 1, noteVi: "Vầng Sáng Vourukasha - Tăng HP và tối đa 50% sát thương E/Q khi Dehya nhận sát thương từ Ranh Giới Lửa" },
      { setIds: ["emblem-of-severed-fate"], mode: "4pc", priority: 2, noteVi: "Dấu Ấn Ngăn Cách - Tối ưu cho lối chơi Burst DPS xả quyền cước Q" },
      { setIds: ["tenacity-of-the-millelith"], mode: "4pc", priority: 3, noteVi: "Thiên Nham Vững Chắc - Hỗ trợ tạo khiên kháng gián đoạn và liên tục buff 20% ATK cho toàn đội" },
    ],
    mainStats: {
      sands: "HP% hoặc ATK% (ER% nếu dùng Dấu Ấn)",
      goblet: "Pyro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG (HP% nếu thuần Support)",
      note: "Dehya scale song song cả ATK và HP. Đạt C1 trở đi, lượng HP sẽ chuyển hóa thành sát thương cực kỳ mạnh mẽ.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG", "HP%", "ATK%", "Energy Recharge (ER 160%+ nếu dùng Q)", "Elemental Mastery"],
      note: "Nếu dùng trong đội hình Thiêu Đốt / Bung Tỏa (Burgeon) cho Ganyu, Kinich, Neuvillette, tập trung vào HP% và Kháng Gián Đoạn.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E tạo Ranh Giới Lửa kháng gián đoạn 100% và gánh chịu sát thương thay đồng đội là giá trị lớn nhất. Q đấm bốc liên hoàn. NA không nâng.",
    },
    playstyleNoteVi:
      "Dehya mang lại khả năng chống gián đoạn tuyệt đối tương đương Khiên Zhongli trong 9 giây đầu của E mà không sợ bị phá khiên bởi đòn đánh lớn. Cực kỳ thích hợp bảo vệ Ganyu ngắm bắn hoặc Neuvillette xả tia nước, đồng thời áp Hỏa off-field cho phản ứng Thiêu Đốt.",
  },

  // ── Kirara: Dendro Sword (Shield Delivery / Dendro Enabler) ──
  kirara: {
    weapons: [
      { weaponId: "key-of-khaj-nisut", tier: "S", noteVi: "Chìa Khóa Khaj-Nisut - Tăng lượng lớn HP% giúp khiên Hộp Mèo dày nhất game" },
      { weaponId: "the-dockhand-s-assistant", tier: "A", noteVi: "Thợ Lặn Kỳ Bí - Kiếm 4★ tăng HP% tốt nhất cho Kirara" },
      { weaponId: "favonius-sword", tier: "A", noteVi: "Tây Phong Kiếm - Cung cấp hạt năng lượng dồi dào cho đội" },
      { weaponId: "sacrificial-sword", tier: "B", noteVi: "Kiếm Tế Lễ - Reset E để tạo 2 lớp khiên liên tiếp" },
    ],
    artifacts: [
      { setIds: ["tenacity-of-the-millelith", "vourukasha-s-glow"], mode: "2+2", priority: 1, noteVi: "2pc HP (+20%) + 2pc HP (+20%) - Tối đa hóa độ dày của Khiên Hộp Mèo Chuyển Phát" },
      { setIds: ["deepwood-memories"], mode: "4pc", priority: 2, noteVi: "Ký Ức Rừng Sâu - Giảm 30% Thảo RES cho đội hình Dendro" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 3, noteVi: "Buff 20% ATK cho toàn đội sau khi ném Hộp Đạn Q" },
    ],
    mainStats: {
      sands: "HP%",
      goblet: "HP%",
      circlet: "HP% (hoặc CRIT Rate khi dùng Tây Phong)",
      note: "Sức mạnh khiên của Kirara tỷ lệ thuận 100% theo HP tối đa. Đẩy HP càng cao thì khiên càng bất tử.",
    },
    subStats: {
      stats: ["HP%", "Flat HP", "Energy Recharge (ER 140%)", "CRIT Rate (khi dùng Tây Phong)"],
      note: "Tập trung tuyệt đối vào chỉ số HP.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E tạo khiên và hóa Hộp Mèo lướt nhanh là kỹ năng cốt lõi. Q ném kiện hàng nổ bom Thảo. NA không nâng.",
    },
    playstyleNoteVi:
      "Nhấn giữ E hóa thành Hộp Mèo Chuyển Phát tung tăng leo núi và tông vào kẻ địch để áp Thảo và tạo lớp khiên dày cộp bảo vệ đồng đội trong 12 giây.",
  },

  // ── Layla: Cryo Sword (Premier Cryo Shielder / Off-field Cryo Applicator) ──
  layla: {
    weapons: [
      { weaponId: "key-of-khaj-nisut", tier: "S", noteVi: "Chìa Khóa Khaj-Nisut - HP% cực đại cho khiên ngủ say dày ngang khiên Zhongli" },
      { weaponId: "the-dockhand-s-assistant", tier: "A", noteVi: "Thợ Lặn Kỳ Bí 4★ - Cung cấp HP% lớn" },
      { weaponId: "favonius-sword", tier: "A", noteVi: "Tây Phong Kiếm - Hỗ trợ nạp Q và tạo hạt trắng cho đội" },
      { weaponId: "harbinger-of-dawn", tier: "B", noteVi: "Thần Kiếm Lê Minh 3★ - Cung cấp lượng lớn CRIT Rate/DMG khi luôn được khiên bảo vệ > 90% HP" },
    ],
    artifacts: [
      { setIds: ["tenacity-of-the-millelith"], mode: "4pc", priority: 1, noteVi: "Thiên Nham Vững Chắc - Sao Đêm từ khiên liên tục bắn trúng địch duy trì 100% uptime buff 20% ATK và 30% độ dày khiên" },
      { setIds: ["tenacity-of-the-millelith", "vourukasha-s-glow"], mode: "2+2", priority: 2, noteVi: "2pc HP (+20%) + 2pc HP (+20%) - Tối đa hóa lượng HP cơ bản" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 3, noteVi: "Tông Thất - Buff 20% ATK cho toàn đội sau khi bật Q" },
    ],
    mainStats: {
      sands: "HP%",
      goblet: "HP%",
      circlet: "HP% (hoặc CRIT Rate nếu dùng Tây Phong)",
      note: "Khiên Màn Đêm của Layla có thời gian duy trì 12s và hồi chiêu chỉ 12s (100% Uptime), sức mạnh khiên tỷ lệ hoàn toàn theo HP tối đa.",
    },
    subStats: {
      stats: ["HP%", "Flat HP", "Energy Recharge (ER 130-140%)", "CRIT Rate (khi dùng Tây Phong)"],
      note: "Ưu tiên dồn toàn bộ vào HP% và Flat HP.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E tạo khiên Màn Đêm Ngủ Say là kỹ năng quan trọng nhất. Q tạo quả cầu ánh sáng bắn sao Băng. NA không nâng.",
    },
    playstyleNoteVi:
      "Layla là shielder Băng số 1 trong game hiện tại với 100% thời gian duy trì khiên. Bật E tạo khiên -> Q tạo vùng sao rơi áp Băng liên tục -> Đổi sang DPS đứng sân nhận khiên và buff 20% ATK từ Thiên Nham.",
  },

  // ── Yaoyao: Dendro Polearm (Team Dendro Healer / Off-field Enabler) ──
  yaoyao: {
    weapons: [
      { weaponId: "favonius-lance", tier: "S", noteVi: "Thương Tây Phong - Tốt nhất cho việc nạp năng lượng liên tục cho đội Thảo" },
      { weaponId: "black-tassel", tier: "A", noteVi: "Hắc Anh Thương 3★ - Tăng 46.9% HP tối đa hóa lượng hồi máu" },
      { weaponId: "rightful-reward", tier: "A", noteVi: "Phần Thưởng Của Công Lý - Thương rèn Fontaine tăng HP và hồi năng lượng" },
      { weaponId: "kitain-cross-spear", tier: "B", noteVi: "Thập Tự Thập Ngữ - Tăng EM và hồi năng lượng thụ động" },
    ],
    artifacts: [
      { setIds: ["deepwood-memories"], mode: "4pc", priority: 1, noteVi: "Ký Ức Rừng Sâu - Yuegui ném củ cải liên tục kích hoạt giảm 30% Thảo RES cho đội" },
      { setIds: ["tenacity-of-the-millelith"], mode: "4pc", priority: 2, noteVi: "Thiên Nham - Yuegui duy trì kích hoạt buff 20% ATK cho toàn đội" },
      { setIds: ["maiden-beloved"], mode: "4pc", priority: 3, noteVi: "Thiếu Nữ - Hồi phục tối đa" },
      { setIds: ["tenacity-of-the-millelith", "ocean-hued-clam"], mode: "2+2", priority: 4, noteVi: "2pc HP (+20%) + 2pc Trị Liệu (+15% Healing Bonus)" },
    ],
    mainStats: {
      sands: "HP% hoặc ER%",
      goblet: "HP%",
      circlet: "Tăng Trị Liệu (Healing Bonus) hoặc HP%",
      note: "Hồi máu của Yaoyao tỷ lệ theo HP tối đa. Q tốn 80 năng lượng nên cần duy trì ER 160-200% nếu muốn dùng Q thường xuyên.",
    },
    subStats: {
      stats: ["HP%", "Energy Recharge (ER 160-180%)", "Flat HP", "CRIT Rate (khi dùng Tây Phong)"],
      note: "Cân bằng giữa HP% để hồi máu dày và ER% để chiêu nộ hồi đúng chu kỳ.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E ném thỏ Yuegui hồi máu và áp Thảo off-field là kỹ năng chính. Q triệu hồi bầy thỏ khi Yaoyao chạy vòng quanh cấp cứu toàn đội. NA không nâng.",
    },
    playstyleNoteVi:
      "Thả E Yuegui ném củ cải hồi máu đơn mục tiêu và áp Thảo liên tục ngoài sân. Khi cả đội tụt máu hiểm nghèo, bật Q hóa thân thành thỏ chạy nhảy vòng quanh sân trong 5 giây hồi đầy cây máu cho cả 4 thành viên.",
  },

  // ── Sethos: Electro Bow (Charged Attack Electro DPS) ──
  sethos: {
    weapons: [
      { weaponId: "hunter-s-path", tier: "S", noteVi: "Con Đường Thợ Săn - Trấn tối thượng cho cung thủ phụ thuộc EM và Trọng Kích" },
      { weaponId: "the-first-great-magic", tier: "S", noteVi: "Ảo Thuật Đầu Tiên - CRIT DMG 66.2% + buff ATK%" },
      { weaponId: "slingshot", tier: "A", noteVi: "Ná Bắn Chim 3★ - CRIT Rate 31.2% + tăng 60% DMG cực kỳ bá đạo cho F2P" },
      { weaponId: "scion-of-the-blazing-sun", tier: "A", noteVi: "Gậy Mặt Trời Bốc Lửa - CRIT Rate + buff sát thương trọng kích" },
      { weaponId: "cloudforged", tier: "B", noteVi: "Cung Dệt Mây F2P sự kiện - Tăng lượng lớn Tinh Thông Nguyên Tố" },
    ],
    artifacts: [
      { setIds: ["wanderer-s-troupe"], mode: "4pc", priority: 1, noteVi: "Đoàn Hát Lang Thang - Tăng 80 EM và 35% sát thương Trọng Kích Mũi Tên Đổ Bóng" },
      { setIds: ["gilded-dreams"], mode: "4pc", priority: 2, noteVi: "Giấc Mộng Hoàng Kim - Cung cấp lượng EM khổng lồ cho phản ứng Tăng Cường (Aggravate)" },
      { setIds: ["thundering-fury"], mode: "4pc", priority: 3, noteVi: "Như Sấm Thịnh Nộ - Tăng 15% Lôi DMG và giảm thời gian hồi E" },
      { setIds: ["gilded-dreams", "thundering-fury"], mode: "2+2", priority: 4, noteVi: "2pc EM (+80 Tinh Thông) + 2pc Lôi (+15% ST Lôi)" },
    ],
    mainStats: {
      sands: "Elemental Mastery (EM)",
      goblet: "Electro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Sát thương Mũi Tên Đổ Bóng Cấp 2 của Sethos tỷ lệ cực mạnh theo Tinh Thông Nguyên Tố (EM). Đồng hồ EM là lựa chọn bắt buộc.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "Elemental Mastery (EM 300+)", "Energy Recharge", "ATK%"],
      note: "Dồn chỉ số vào CRIT và EM. Sethos tiêu hao năng lượng nguyên tố để sạc nhanh mũi tên Trọng Kích nên cần một lượng ER vừa đủ.",
    },
    talentPriority: {
      order: ["Đòn thường (NA)", "Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)"],
      note: "NA tăng sát thương Trọng Kích là nguồn sát thương cốt lõi. Q biến đòn đánh thành tia sét Twilight Bolt. E giật sét hồi năng lượng.",
    },
    playstyleNoteVi:
      "Sethos có hai lối chơi: Lối chơi Trọng Kích (sử dụng năng lượng để tụ lực bắn đạn Mũi Tên Đổ Bóng xuyên thấu cực mạnh) hoặc Lối chơi Q (bật nộ spam đòn bắn thường sấm sét tốc độ cao). Kết hợp cùng Thảo (Nahida/Baizhu) để kích hoạt Tăng Cường hủy diệt.",
  },

  // ── Yanfei: Pyro Catalyst (On-field Charged Attack Pyro DPS) ──
  yanfei: {
    weapons: [
      { weaponId: "lost-prayer-to-the-sacred-winds", tier: "S", noteVi: "Điển Tích Tây Phong - CRIT Rate 33.1% + tăng tốc chạy và tích lũy sát thương nguyên tố khi đứng sân" },
      { weaponId: "tome-of-the-eternal-flow", tier: "S", noteVi: "Văn Khúc Lưu Chuyển - CRIT DMG 88.2% + buff Trọng Kích" },
      { weaponId: "the-widsith", tier: "A", noteVi: "Chương Nhạc Lang Thang R5 - CRIT DMG cao và buff cực khủng" },
      { weaponId: "solar-pearl", tier: "A", noteVi: "Nhật Nguyệt Hạp - Cung cấp CRIT Rate" },
    ],
    artifacts: [
      { setIds: ["crimson-witch-of-flames"], mode: "4pc", priority: 1, noteVi: "Diệm Liệt Ma Nữ - Tăng tối đa sát thương Bốc Hơi / Tan Chảy" },
      { setIds: ["wanderer-s-troupe"], mode: "4pc", priority: 2, noteVi: "Đoàn Hát Lang Thang - Tăng 80 EM và 35% sát thương Đan Hỏa Ấn Trọng Kích" },
      { setIds: ["crimson-witch-of-flames", "gladiator-s-finale"], mode: "2+2", priority: 3, noteVi: "2pc Hỏa (+15% ST Hỏa) + 2pc ATK (+18% Tấn Công)" },
    ],
    mainStats: {
      sands: "ATK% hoặc EM",
      goblet: "Pyro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Yanfei liên tục kích Bốc Hơi với Xingqiu/Yelan. Cân bằng CRIT Rate >= 65% để kích hoạt thiên phú A4 (đòn trọng kích chí mạng gây thêm 80% ATK sát thương AOE).",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Elemental Mastery (EM 100-150 cho Bốc Hơi)", "Energy Recharge (ER 130%)"],
      note: "CRIT Rate đặc biệt quan trọng cho thiên phú phụ nổ thêm đòn đánh phụ.",
    },
    talentPriority: {
      order: ["Đòn thường (NA)", "Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)"],
      note: "NA tăng sát thương Trọng Kích Đan Hỏa Ấn là nguồn 70% sát thương. Q tạo hiệu ứng Đan Thư buff Trọng Kích và cấp ấn tối đa. E gây sát thương và cấp đầy ấn ngay tức khắc.",
    },
    playstyleNoteVi:
      "Quy trình combo chuẩn: Đánh thường 3 đòn (tích 3-4 Đan Hỏa Ấn) -> Giáng Trọng Kích Bốc Hơi tiêu hao ít thể lực -> Nhấn E cấp đầy ấn -> Giáng tiếp Trọng Kích -> Bật Q buff liên tục tạo ấn.",
  },

  // ── Shikanoin Heizou: Anemo Catalyst (Melee Anemo Martial Artist DPS) ──
  "shikanoin-heizou": {
    weapons: [
      { weaponId: "tulaytullah-s-remembrance", tier: "S", noteVi: "Hồi Ức Tulaytullah - CRIT DMG 44.1% + Base ATK 674 và buff đòn đánh thường" },
      { weaponId: "lost-prayer-to-the-sacred-winds", tier: "S", noteVi: "Điển Tích Tây Phong - CRIT Rate 33.1% + tăng sát thương Phong khi đứng sân" },
      { weaponId: "the-widsith", tier: "A", noteVi: "Chương Nhạc Lang Thang - R5 nuke Kỹ năng nguyên tố hàng trăm ngàn sát thương" },
      { weaponId: "solar-pearl", tier: "A", noteVi: "Nhật Nguyệt Hạp - Tương tác hoàn hảo giữa đòn đánh thường và Quyền Lực Tâm Ý" },
    ],
    artifacts: [
      { setIds: ["viridescent-venerer"], mode: "4pc", priority: 1, noteVi: "Bóng Hình Màu Xanh - Giảm 40% kháng nguyên tố đồng đội đồng thời tăng sát thương Khuếch Tán" },
      { setIds: ["desert-pavilion-chronicle"], mode: "4pc", priority: 2, noteVi: "Sử Ký Đình Các Sa Mạc - Tăng 15% Phong DMG và 40% sát thương đòn đánh" },
      { setIds: ["viridescent-venerer", "gladiator-s-finale"], mode: "2+2", priority: 3, noteVi: "2pc Phong (+15% ST Phong) + 2pc ATK (+18% Tấn Công)" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Anemo DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Heizou là võ sĩ quyền pháp Phong gây sát thương bộc phát cực mạnh từ E Quyền Lực Tâm Ý khi tích đủ 4 tầng Biến Chuyển.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Elemental Mastery", "Energy Recharge (ER 120%)"],
      note: "Cân bằng CR/CD chuẩn (CR >= 70%, CD >= 140%).",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Đòn thường (NA)", "Nguyên tố bùng phát (Q)"],
      note: "E Quyền Lực Tâm Ý (tích đủ 4 tầng Biến Chuyển tung cú đấm Chính Niệm) là nuke sát thương lớn nhất. NA nâng nếu làm Driver đứng sân. Q ném quả cầu gió gom quái.",
    },
    playstyleNoteVi:
      "Tung đòn đánh thường hoặc trọng kích kích hoạt phản ứng Khuếch Tán để tích nhanh 4 tầng Biến Chuyển -> Nhấn giữ nhẹ E tung cú Đấm Chính Niệm hủy diệt -> Q đá quả cầu gió bộc phát sát thương diện rộng.",
  },
};

async function main() {
  console.log("Kiem tra tinh hop le cua 24 nhan vat build moi...");
  const [dbWeapons, dbArtifacts, dbCharacters] = await Promise.all([
    prisma.weapon.findMany({ select: { id: true } }),
    prisma.artifactSet.findMany({ select: { id: true } }),
    prisma.character.findMany({ select: { id: true } }),
  ]);
  const wSet = new Set(dbWeapons.map((w) => w.id));
  const aSet = new Set(dbArtifacts.map((a) => a.id));
  const cSet = new Set(dbCharacters.map((c) => c.id));

  let errors = 0;
  for (const [charId, build] of Object.entries(EXPERT_BUILDS)) {
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

  console.log("Tat ca ID vu khi, bo TDV, va nhan vat deu CHINH XAC 100% trong Prisma DB!");

  // Cap nhat file src/data/character-builds-data.ts
  const dataPath = path.resolve(__dirname, "../src/data/character-builds-data.ts");
  let content = fs.readFileSync(dataPath, "utf-8");

  // Format cac object moi thanh TypeScript code
  let newEntriesCode = "";
  for (const [charId, build] of Object.entries(EXPERT_BUILDS)) {
    // Neu da co thi bo qua
    if (content.includes(`"${charId}": {`) || content.includes(`  ${charId}: {`)) {
      console.log(`Bo qua '${charId}' vi da ton tai trong file.`);
      continue;
    }
    newEntriesCode += `  // ${charId}\n  "${charId}": ${JSON.stringify(build, null, 4)},\n\n`;
  }

  if (newEntriesCode) {
    // Chen truoc closing tag `};` cua `CHARACTER_BUILDS`
    const insertIndex = content.lastIndexOf("};");
    if (insertIndex === -1) {
      throw new Error("Khong tim thay dau ket thuc '};' cua CHARACTER_BUILDS");
    }
    const updatedContent = content.slice(0, insertIndex) + newEntriesCode + content.slice(insertIndex);
    fs.writeFileSync(dataPath, updatedContent, "utf-8");
    console.log("Da them thanh cong tat ca cac build moi vao character-builds-data.ts!");
  } else {
    console.log("Khong co build moi nao can chen.");
  }
}

main().finally(() => process.exit(0));
