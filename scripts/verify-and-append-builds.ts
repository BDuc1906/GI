import { prisma } from "../src/lib/db/prisma";
import type { CharacterBuildEntry } from "../src/data/character-builds-data";

export const NEW_BUILDS: Record<string, CharacterBuildEntry> = {
  // ── Chasca: Anemo Bow (Natlan On-field Multi-element DPS) ──
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
};

async function main() {
  console.log("Kiem tra tinh hop le cua cac ID moi...");
  const [dbWeapons, dbArtifacts] = await Promise.all([
    prisma.weapon.findMany({ select: { id: true } }),
    prisma.artifactSet.findMany({ select: { id: true } }),
  ]);
  const wSet = new Set(dbWeapons.map((w) => w.id));
  const aSet = new Set(dbArtifacts.map((a) => a.id));

  let errors = 0;
  for (const [charId, build] of Object.entries(NEW_BUILDS)) {
    for (const w of build.weapons || []) {
      if (!wSet.has(w.weaponId)) {
        console.error(`[ERROR] Char ${charId} has invalid weaponId: '${w.weaponId}'`);
        errors++;
      }
    }
    for (const a of build.artifacts || []) {
      for (const setId of a.setIds) {
        if (!aSet.has(setId)) {
          console.error(`[ERROR] Char ${charId} has invalid setId: '${setId}'`);
          errors++;
        }
      }
    }
  }

  if (errors === 0) {
    console.log("Tat ca ID vu khi va thanh di vat deu HOP LE 100% trong Prisma DB!");
  } else {
    console.error(`Phat hien ${errors} loi ID!`);
    process.exit(1);
  }
}

main().finally(() => process.exit(0));
