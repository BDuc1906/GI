// src/data/character-builds-data.ts
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

export interface CharacterBuildEntry {
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
      { weaponId: "staff-of-homa", tier: "S", noteVi: "Tốt nhất - HP% sub + passive HP bonus" },
      { weaponId: "deathmatch", tier: "A", noteVi: "CR 36.8% sub-stat, tốt nhất 4-star" },
      { weaponId: "primordial-jade-winged-spear", tier: "A", noteVi: "CRIT Rate 22.1% passive stack" },
      { weaponId: "calamity-queller", tier: "A", noteVi: "ATK% cao sau Q" },
      { weaponId: "blackcliff-pole", tier: "B", noteVi: "CD sub-stat tốt nếu có" },
    ],
    artifacts: [
      { setIds: ["crimson-witch-of-flames"], mode: "4pc", priority: 1, noteVi: "4pc stack Pyro DMG + Vaporize/Melt bonus" },
      { setIds: ["marechaussee-hunter"], mode: "4pc", priority: 2, noteVi: "CR +36% khi HP thay đổi - rất phù hợp passive Arlecchino" },
      { setIds: ["crimson-witch-of-flames", "shimenawa-s-reminiscence"], mode: "2+2", priority: 3, noteVi: "2pc Pyro + 2pc ATK% thay the" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Pyro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Arlecchino lấy HP từ passive, không cần HP% artifacts. Tập trung ATK% + Pyro DMG% + CRIT. CR >= 70% trước khi stack CD.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Flat ATK", "Energy Recharge (ER <= 120%)", "Elemental Mastery (EM 80-100 nếu Vape)"],
      note: "Arlecchino không nhận heal từ đội, nên HP pool từ passive rất quan trọng. EM nếu thường xuyên Vaporize. ER thấp vì Q cost 60.",
    },
    talentPriority: {
      order: ["Đòn thường (NA)", "Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)"],
      note: "NA là nguồn DPS chính sau khi có Bond of Life. Q để reset Bond và gain. E để áp Pyro + tạo Bond.",
    },
    playstyleNoteVi:
      "Dùng E để áp Pyro lên địch và tạo Bond of Life. NA khi có Bond để gây Pyro DMG tăng theo HP. Q reset Bond và gain mới. Không nhận heal từ đồng đội - dùng Zhongli hoặc tự heal qua passive. Mục tiêu: Bond >= 100% để NA đánh Pyro.",
  },

  // Cryo Sword
  ayaka: {
    weapons: [
      { weaponId: "mistsplitter-reforged", tier: "S", noteVi: "Tốt nhất - Elemental DMG 3 stack rất mạnh" },
      { weaponId: "haran-geppaku-futsu", tier: "A", noteVi: "CRIT Rate 66.2% + Skill DMG Bonus" },
      { weaponId: "primordial-jade-cutter", tier: "A", noteVi: "CR 44.1% sub rất ổn" },
      { weaponId: "amenoma-kageuchi", tier: "B", noteVi: "Tốt nhất F2P - ER passive hữu ích" },
      { weaponId: "favonius-sword", tier: "B", noteVi: "Support build - tạo energy cho team" },
    ],
    artifacts: [
      { setIds: ["blizzard-strayer"], mode: "4pc", priority: 1, noteVi: "CR +40% khi địch đóng băng - bá đạo với Freeze team" },
      { setIds: ["blizzard-strayer", "noblesse-oblige"], mode: "2+2", priority: 2, noteVi: "Nếu không đủ CRIT để dùng 4pc hiệu quả" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Cryo DMG%",
      circlet: "CRIT DMG (vì 4pc Blizzard cho +40% CR)",
      note: "Với 4pc Blizzard Strayer + Cryo resonance + Freeze: CR cộng thêm 40%+15%, dùng CD circlet. Không có Freeze team thì CR circlet.",
    },
    subStats: {
      stats: ["CRIT DMG", "CRIT Rate (đủ ~60% không tính set)", "ATK%", "Energy Recharge (ER 130-140%)", "Flat ATK"],
      note: "Freeze team với Blizzard 4pc: uu tiên CD vì CR tự động rất cao. ER 130-140% để Q liên tục (80 cost). Ayaka cần ER khá nhiều.",
    },
    talentPriority: {
      order: ["Đòn thường (NA)", "Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)"],
      note: "NA là nguồn DPS chính + Dash áp Cryo. Q là sát thương bột phát lớn nhất. E ít quan trọng nhất.",
    },
    playstyleNoteVi:
      "Combo: Dash (áp Cryo) -> NA spam -> Q khi đủ energy. Dash không tốn stamina khi underwater. Q của Ayaka là snowstorm 20 hit trong 5 giây rất nguy hiểm. Cần Hydro/Cryo teammate để duy trì Freeze. Kazuha group + Kokomi wet là meta.",
  },

  // Electro Polearm
  cyno: {
    weapons: [
      { weaponId: "staff-of-homa", tier: "S", noteVi: "Tốt nhất - HP% passive cộng ATK theo HP" },
      { weaponId: "primordial-jade-winged-spear", tier: "A", noteVi: "CRIT Rate + passive stack ATK" },
      { weaponId: "deathmatch", tier: "A", noteVi: "CR 36.8% sub - dùng solo hiệu quả" },
      { weaponId: "the-catch", tier: "B", noteVi: "Tốt nhất F2P - ER + Q DMG bonus" },
      { weaponId: "blackcliff-pole", tier: "B", noteVi: "CD sub, ok nếu có" },
    ],
    artifacts: [
      { setIds: ["thundering-fury"], mode: "4pc", priority: 1, noteVi: "Giảm CD E 1 giây mỗi lần kích phản ứng - combo liên tục trong Q" },
      { setIds: ["gilded-dreams"], mode: "4pc", priority: 2, noteVi: "EM cao + ATK bonus theo team vision" },
      { setIds: ["gilded-dreams", "thundering-fury"], mode: "2+2", priority: 3, noteVi: "2pc mỗi set thay thế" },
    ],
    mainStats: {
      sands: "ATK% hoặc EM",
      goblet: "Electro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Cyno trong Quicken team: cân nhắc EM sands nếu muốn Aggravate lớn. ATK% sands nếu build DPS thuần.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "Elemental Mastery (EM 100-200)", "ATK%", "Energy Recharge (ER >= 160%)", "Flat ATK"],
      note: "Cyno cần ER rất cao (160%+) vì Q cost 80 và thường xuyên dùng. Aggravate team: EM quan trọng. CR/CD là uu tiên số 1.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)", "Đòn thường (NA)"],
      note: "Trong trạng thái Q Pactsworn, tất cả đòn NA đều là Electro. Q scaling là nguồn chính. E giảm CD cho Q.",
    },
    playstyleNoteVi:
      "Cyno đặc biệt: Q kéo dài 18 giây và mọi đòn NA trong Q đều gây Electro DMG. Trong Q, dùng E liên tục để kéo dài hiệu ứng. Cần Dendro teammate (Nahida/Baizhu) để kích Quicken/Aggravate. Không nên dùng mà không có Dendro.",
  },

  // Cryo Claymore
  eula: {
    weapons: [
      { weaponId: "beacon-of-the-reed-sea", tier: "S", noteVi: "Tốt nhất - ATK + HP stack và Physical DMG" },
      { weaponId: "wolf-s-gravestone", tier: "A", noteVi: "ATK% cao + party ATK buff" },
      { weaponId: "redhorn-stonethresher", tier: "A", noteVi: "DEF% + NA/CA DMG bonus - ok nếu co" },
      { weaponId: "serpent-spine", tier: "A", noteVi: "Tốt nhất 4-star BP - CRIT Rate + stack DMG" },
      { weaponId: "skyward-pride", tier: "B", noteVi: "ER + Physical Blade proc 80% Physical DMG" },
    ],
    artifacts: [
      { setIds: ["pale-flame"], mode: "4pc", priority: 1, noteVi: "E proc mỗi hit - stack full ATK+Physical trong Q" },
      { setIds: ["pale-flame", "bloodstained-chivalry"], mode: "2+2", priority: 2, noteVi: "2pc Physical mỗi set = +50% Physical DMG" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Physical DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Eula build Physical hoàn toàn. Pale Flame 4pc khi E hit -> +9% ATK x2 stacks. Physical DMG% Goblet là bắt buộc.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Energy Recharge (ER 140-160%)", "Flat ATK", "DEF% (ít cần)"],
      note: "Eula Q cost 80 và cần dùng liên tục nên ER 140%+ quan trọng. Pale Flame 4pc full stack cho +18% ATK + +50% Physical.",
    },
    talentPriority: {
      order: ["Nguyên tố bùng phát (Q)", "Đòn thường (NA)", "Kỹ năng nguyên tố (E)"],
      note: "Q là nguồn sát thương chính (Lightfall Sword). NA + E tạo Grimheart stacks và chia sẻ Physical bonus. E không scale nhiều.",
    },
    playstyleNoteVi:
      "Q tạo Lightfall Sword, tích lũy stacks trong 7 giây rồi phát nổ Physical DMG cực lớn. Combo: E (2 charges) + Q + NA spam + E lại để max stacks trước khi Q hết hạn. Dùng Superconduct (Cryo + Electro) để giảm Physical RES 40%. Fischl + Eula là combo tốt.",
  },

  // Hydro Sword
  furina: {
    weapons: [
      { weaponId: "splendor-of-tranquil-waters", tier: "S", noteVi: "Signature - HP% + Elemental Skill DMG bonus tuyệt vời" },
      { weaponId: "primordial-jade-cutter", tier: "A", noteVi: "CR 44.1% + HP% passive thứ 2 tốt nhất" },
      { weaponId: "key-of-khaj-nisut", tier: "A", noteVi: "HP% + EM team buff khi E hits" },
      { weaponId: "favonius-sword", tier: "B", noteVi: "ER support build - tạo energy cho team" },
      { weaponId: "sacrificial-sword", tier: "B", noteVi: "ER + E reset giữ Salon Members liên tục" },
    ],
    artifacts: [
      { setIds: ["golden-troupe"], mode: "4pc", priority: 1, noteVi: "Off-field Skill DMG +70% - Salon Members liên tục" },
      { setIds: ["marechaussee-hunter"], mode: "4pc", priority: 2, noteVi: "CR +36% khi HP thay đổi - rất phù hợp Furina mechanic" },
      { setIds: ["tenacity-of-the-millelith"], mode: "4pc", priority: 3, noteVi: "Support build: +20% HP + ATK team buff" },
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
      { weaponId: "staff-of-homa", tier: "S", noteVi: "Tốt nhất - HP% + passive khi HP < 50%" },
      { weaponId: "deathmatch", tier: "A", noteVi: "CR 36.8% sub - tốt nhất 4-star" },
      { weaponId: "dragon-s-bane", tier: "A", noteVi: "EM 221 sub + passive Vaporize bonus" },
      { weaponId: "blackcliff-pole", tier: "B", noteVi: "CD sub tốt nếu co" },
      { weaponId: "white-tassel", tier: "C", noteVi: "Tốt nhất 3-star cho beginner" },
    ],
    artifacts: [
      { setIds: ["crimson-witch-of-flames"], mode: "4pc", priority: 1, noteVi: "4pc stack Pyro + Vaporize/Melt bonus, phù hợp E spam" },
      { setIds: ["shimenawa-s-reminiscence"], mode: "4pc", priority: 2, noteVi: "ATK% sau E nhưng giảm Q DMG" },
      { setIds: ["crimson-witch-of-flames", "tenacity-of-the-millelith"], mode: "2+2", priority: 3, noteVi: "2pc Pyro + 2pc HP% thay thế" },
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
      { weaponId: "freedom-sworn", tier: "S", noteVi: "Tốt nhất support - EM + team Elemental DMG + ATK buff" },
      { weaponId: "primordial-jade-cutter", tier: "A", noteVi: "CR sub nếu muốn build DPS hybrid" },
      { weaponId: "iron-sting", tier: "B", noteVi: "EM 165 sub - tốt nhất F2P nếu không có better" },
      { weaponId: "favonius-sword", tier: "B", noteVi: "ER support - tạo energy cho đội" },
      { weaponId: "sacrificial-sword", tier: "B", noteVi: "ER + E reset để Swirl nhiều hơn" },
    ],
    artifacts: [
      { setIds: ["viridescent-venerer"], mode: "4pc", priority: 1, noteVi: "Bắt buộc: giảm Element RES 40% + Swirl DMG tăng 60%" },
      { setIds: ["viridescent-venerer", "wanderer-s-troupe"], mode: "2+2", priority: 2, noteVi: "VV 2pc + EM 80 nếu không đủ 4pc tốt" },
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
      { weaponId: "kagura-s-verity", tier: "S", noteVi: "Tốt nhất - Elemental Skill stack DMG bonus tuyệt vời" },
      { weaponId: "a-thousand-floating-dreams", tier: "S", noteVi: "Signature - EM + team EM buff, tốt không kém" },
      { weaponId: "solar-pearl", tier: "A", noteVi: "CR + NA DMG và Skill DMG bonus tốt" },
      { weaponId: "the-widsith", tier: "A", noteVi: "Random buff mạnh khi switch-in" },
      { weaponId: "mappa-mare", tier: "B", noteVi: "Tốt nhất F2P - EM 110 sub + passive EM stack" },
    ],
    artifacts: [
      { setIds: ["deepwood-memories"], mode: "4pc", priority: 1, noteVi: "Bắt buộc nếu không có ai khác giảm Dendro RES -30%" },
      { setIds: ["gilded-dreams"], mode: "4pc", priority: 2, noteVi: "Khi team đã có Deepwood: EM + ATK theo team composition" },
      { setIds: ["deepwood-memories", "gilded-dreams"], mode: "2+2", priority: 3, noteVi: "2pc mỗi bộ thay thế" },
    ],
    mainStats: {
      sands: "EM (Elemental Mastery)",
      goblet: "Dendro DMG% hoặc EM",
      circlet: "CRIT Rate hoặc EM",
      note: "Nahida DPS/Reaction: EM 3 slots để max Spread/Bloom/Hyperbloom. Nếu direct DPS: CR/CD + Dendro DMG%. EM 1000+ cho Reaction build.",
    },
    subStats: {
      stats: ["Elemental Mastery (EM >= 800)", "CRIT Rate / CRIT DMG", "ATK%", "Energy Recharge (ER 130-140%)", "Flat ATK"],
      note: "Nahida A1/A4 passive dựa vào EM và Q timer. EM quan trọng nhất cho Reaction team. CR/CD nếu direct Dendro DPS.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E All Schemes to Know là nguồn sát thương chính (seed DMG mỗi 2.5s). Q buff team và tăng EM. NA ít quan trọng.",
    },
    playstyleNoteVi:
      "E: Hold để select enemies và apply Dendro marker. Seed gây DMG mỗi 2.5 giây và kích phản ứng. Q: buff team theo Hydro/Electro/Pyro trong đội. A1 passive: EM/ATK/CR của Nahida tăng theo team. Đặc biệt mạnh làm buffer/reaction trigger off-field.",
  },

  // Geo Claymore
  navia: {
    weapons: [
      { weaponId: "beacon-of-the-reed-sea", tier: "S", noteVi: "Tốt nhất - ATK + HP stack sau khi sử dụng skill" },
      { weaponId: "wolf-s-gravestone", tier: "A", noteVi: "ATK% cao nhất game + party ATK buff" },
      { weaponId: "the-unforged", tier: "A", noteVi: "ATK% + shield bonus DMG rất phù hợp" },
      { weaponId: "serpent-spine", tier: "A", noteVi: "Tốt nhất 4-star - CR + stack DMG" },
      { weaponId: "favonius-greatsword", tier: "B", noteVi: "ER support team - energy generation" },
    ],
    artifacts: [
      { setIds: ["nighttime-whispers-in-the-echoing-woods"], mode: "4pc", priority: 1, noteVi: "Signature set: Geo DMG + Crystallize bonus" },
      { setIds: ["golden-troupe"], mode: "4pc", priority: 2, noteVi: "Elemental Skill DMG +70% nếu off-field" },
      { setIds: ["husk-of-opulent-dreams", "noblesse-oblige"], mode: "2+2", priority: 3, noteVi: "Geo DMG + ATK tăng thay thế" },
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
      { weaponId: "tome-of-the-eternal-flow", tier: "S", noteVi: "Signature: HP% + bonus Charged DMG khi HP thay đổi" },
      { weaponId: "kagura-s-verity", tier: "A", noteVi: "Skill DMG stack + CR tốt" },
      { weaponId: "the-widsith", tier: "A", noteVi: "Burst buff mạnh khi switch-in" },
      { weaponId: "skyward-atlas", tier: "A", noteVi: "ATK + Physical proc ok" },
      { weaponId: "prototype-amber", tier: "B", noteVi: "ER + heal nhỏ hữu ích F2P" },
    ],
    artifacts: [
      { setIds: ["marechaussee-hunter"], mode: "4pc", priority: 1, noteVi: "CRIT Rate +36% khi HP thay đổi - Neuvillette passive thay đổi HP liên tục" },
      { setIds: ["heart-of-depth"], mode: "4pc", priority: 2, noteVi: "Hydro DMG + Charged Attack DMG tốt thay thế" },
      { setIds: ["marechaussee-hunter", "heart-of-depth"], mode: "2+2", priority: 3, noteVi: "2pc mỗi bộ thay thế khi farm" },
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
      { weaponId: "engulfing-lightning", tier: "S", noteVi: "Signature - ER -> ATK bonus + ER 30% vượt requirement" },
      { weaponId: "staff-of-homa", tier: "A", noteVi: "HP% + ATK passive rất mạnh khi HP thấp" },
      { weaponId: "primordial-jade-winged-spear", tier: "A", noteVi: "CRIT Rate + stack ATK tốt" },
      { weaponId: "the-catch", tier: "B", noteVi: "Tốt nhất F2P - ER + Q DMG +16% và CRIT Rate +6%" },
      { weaponId: "deathmatch", tier: "B", noteVi: "CR sub nếu không cần ER nhiều" },
    ],
    artifacts: [
      { setIds: ["emblem-of-severed-fate"], mode: "4pc", priority: 1, noteVi: "ER -> Q DMG +25% per 4% ER (tối đa 75%). Bắt buộc cho Raiden." },
      { setIds: ["emblem-of-severed-fate", "thundering-fury"], mode: "2+2", priority: 2, noteVi: "2pc ER + 2pc Electro DMG thay thế farm" },
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
      { weaponId: "staff-of-homa", tier: "S", noteVi: "Tốt nhất - HP% + passive ATK khi HP thấp (Xiao thường < 50%)" },
      { weaponId: "primordial-jade-winged-spear", tier: "S", noteVi: "Stack ATK passive khi hit - rất phù hợp Plunge spam" },
      { weaponId: "calamity-queller", tier: "A", noteVi: "ATK% cao sau Q + off-field stack" },
      { weaponId: "blackcliff-pole", tier: "A", noteVi: "CD sub-stat tốt sau kill" },
      { weaponId: "favonius-lance", tier: "B", noteVi: "ER support nhưng Xiao không cần nhiều" },
    ],
    artifacts: [
      { setIds: ["vermillion-hereafter"], mode: "4pc", priority: 1, noteVi: "ATK stack sau Q - tương tác hoàn hảo khi HP giảm" },
      { setIds: ["desert-pavilion-chronicle"], mode: "4pc", priority: 2, noteVi: "Anemo DMG + Plunge DMG bonus sau Charged Attack" },
      { setIds: ["viridescent-venerer", "vermillion-hereafter"], mode: "2+2", priority: 3, noteVi: "Anemo DMG + ATK% thay thế" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Anemo DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Xiao Plunge DPS: ATK% sands. Anemo DMG% goblet bắt buộc vì Q convert NA -> Plunge Anemo. CR/CD 1:2 chuẩn.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Energy Recharge (ER 140-160%)", "Flat ATK", "Elemental Mastery (EM nhỏ)"],
      note: "Xiao Q drain HP liên tục trong 15 giây. ER 140%+ để Q liên tục. CRIT là uu tiên số 1. Xianyun làm Plunge buff rất mạnh.",
    },
    talentPriority: {
      order: ["Đòn thường (NA)", "Nguyên tố bùng phát (Q)", "Kỹ năng nguyên tố (E)"],
      note: "NA (Plunge Attack trong Q) là nguồn DPS chính. Q tăng DMG +5% mỗi stack và convert NA. E tạo energy và blink.",
    },
    playstyleNoteVi:
      "Q Bane of All Evil: tăng Plunge DMG, convert NA -> Anemo Plunge, drain HP. Combo: E x2 (energy) -> Q -> Plunge spam từ trên cao. Xianyun makes Xiao meta vì tăng Plunge DMG +200% và free heal. Faruzan giảm Anemo RES 30%.",
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
      { weaponId: "staff-of-homa", tier: "S", noteVi: "HP% + passive khi HP < 50% - max khiên và Q DMG" },
      { weaponId: "primordial-jade-winged-spear", tier: "A", noteVi: "ATK% + stack passive - ok nếu không có Homa" },
      { weaponId: "vortex-vanquisher", tier: "A", noteVi: "Signature: HP% + ATK stack - rất phù hợp Zhongli" },
      { weaponId: "favonius-lance", tier: "B", noteVi: "ER support - tạo energy cho team liên tục" },
      { weaponId: "the-catch", tier: "B", noteVi: "ER + Q DMG bonus tốt F2P" },
    ],
    artifacts: [
      { setIds: ["tenacity-of-the-millelith"], mode: "4pc", priority: 1, noteVi: "HP% + ATK team buff 20% khi E hits - bắt buộc nếu support" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 2, noteVi: "ATK team buff 20% khi Q - thay thế tốt" },
      { setIds: ["tenacity-of-the-millelith", "archaic-petra"], mode: "2+2", priority: 3, noteVi: "HP + Geo DMG thay thế" },
    ],
    mainStats: {
      sands: "HP%",
      goblet: "HP%",
      circlet: "HP%",
      note: "Zhongli support: 3x HP% để max Jade Shield (2.506% HP per sec, HP% scale). Shield strength = 12.96% HP + 1505. HP 50000+ là mục tiêu.",
    },
    subStats: {
      stats: ["HP%", "Flat HP", "Energy Recharge (ER 140%+)", "CRIT Rate (nếu DPS hybrid)", "ATK%"],
      note: "Zhongli support: chỉ cần HP và ER. Shield scale HP nên HP% uu tiên tuyệt đối. Tenacity 4pc tự động buff khi E pillar hits.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E tạo Jade Shield (HP scale) và Stone Stele gây sát thương + giảm ALL RES 20%. Q Petrify khống chế. NA ít quan trọng.",
    },
    playstyleNoteVi:
      "E Hold để tạo khiên Jade và giảm ALL Element RES 20% (bao gồm Physical). E Press tạo Stone Stele off-field. Q Petrify 3.6 giây. Khiên HP-based không phụ thuộc lvl địch. Tenacity 4pc buff ATK 20% cho team khi pillar hits. Support hoàn hảo nhất game.",
  },

  // Electro Sword
  clorinde: {
    weapons: [
      { weaponId: "absolution", tier: "S", noteVi: "Signature: CRIT DMG + bonus DMG khi Bond of Life" },
      { weaponId: "primordial-jade-cutter", tier: "A", noteVi: "CR 44.1% + HP% passive tốt" },
      { weaponId: "mistsplitter-reforged", tier: "A", noteVi: "Elemental DMG stack 3 lần" },
      { weaponId: "light-of-foliar-incision", tier: "A", noteVi: "CRIT DMG + EM passive tốt" },
      { weaponId: "the-black-sword", tier: "B", noteVi: "CR sub + NA healing nhỏ" },
    ],
    artifacts: [
      { setIds: ["thundering-fury"], mode: "4pc", priority: 1, noteVi: "Electro DMG + khi phản ứng giảm CD E -> combo liên tục" },
      { setIds: ["marechaussee-hunter"], mode: "4pc", priority: 2, noteVi: "CR +36% khi HP thay đổi - Bond of Life trigger liên tục" },
      { setIds: ["golden-troupe"], mode: "4pc", priority: 3, noteVi: "Skill DMG +70% nếu off-field" },
    ],
    mainStats: {
      sands: "ATK%",
      goblet: "Electro DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Clorinde DPS qua Bond of Life và E shots. ATK% + Electro DMG% + CRIT. Marechaussee 4pc: CD circlet vì CR tự cộng.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "Energy Recharge (ER 140%+)", "Elemental Mastery (EM 100+ Quicken)", "Flat ATK"],
      note: "Thundering Fury 4pc: khi Quicken Aggravate/Superconduct giảm E CD, cần EM 100+ để tăng Aggravate DMG. ER 140% cho Q.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E là nguồn DPS chính: tạo Bond of Life -> gun shots. Q buff và reset. NA ít dùng khi E active.",
    },
    playstyleNoteVi:
      "E tạo Bond of Life và switch sang gun mode. E shots tiêu thụ Bond để gây Electro DMG. Khi Bond full -> passive buff. Quicken team (Nahida + Fischl) làm Clorinde Aggravate DMG rất lớn. Q reset E và buff. Thundering Fury 4pc rất mạnh khi Aggravate.",
  },

  // Geo Sword
  albedo: {
    weapons: [
      { weaponId: "primordial-jade-cutter", tier: "S", noteVi: "CR 44.1% + HP% passive - Albedo scale DEF nhưng CR vẫn cần" },
      { weaponId: "harbinger-of-dawn", tier: "S", noteVi: "Tốt nhất 3-star! CR 28% + CRIT DMG 46% khi HP > 90%" },
      { weaponId: "mistsplitter-reforged", tier: "A", noteVi: "Elemental DMG stack tốt" },
      { weaponId: "cinnabar-spindle", tier: "S", noteVi: "Signature: DEF% sub + Skill DMG bonus - bắt buộc nếu có" },
      { weaponId: "iron-sting", tier: "B", noteVi: "EM sub + passive ok nếu không có better" },
    ],
    artifacts: [
      { setIds: ["husk-of-opulent-dreams"], mode: "4pc", priority: 1, noteVi: "DEF% + Geo DMG stack passively - tối ưu cho Albedo" },
      { setIds: ["husk-of-opulent-dreams", "archaic-petra"], mode: "2+2", priority: 2, noteVi: "DEF + Geo DMG thay thế" },
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
      { weaponId: "peak-patrol-song", tier: "S", noteVi: "Signature: DEF% + heal + Elemental RES shred — hoàn hảo cho Xilonen" },
      { weaponId: "primordial-jade-cutter", tier: "A", noteVi: "CR + HP% passive — heal mạnh hơn" },
      { weaponId: "festering-desire", tier: "A", noteVi: "Skill DMG + ER — tốt nhất 4-star" },
      { weaponId: "favonius-sword", tier: "B", noteVi: "ER + energy cho team — budget support" },
      { weaponId: "sacrificial-sword", tier: "B", noteVi: "ER + E reset — ok nếu cần E nhiều hơn" },
    ],
    artifacts: [
      { setIds: ["scroll-of-the-hero-of-cinder-city"], mode: "4pc", priority: 1, noteVi: "Signature set Xilonen: buff Elemental DMG team khi Crystallize — cực mạnh" },
      { setIds: ["noblesse-oblige"], mode: "4pc", priority: 2, noteVi: "ATK team buff 20% sau Q" },
      { setIds: ["maiden-beloved"], mode: "4pc", priority: 3, noteVi: "Healing Bonus +15%+20% — nếu ưu tiên heal hơn buff" },
    ],
    mainStats: {
      sands: "HP% hoặc ER%",
      goblet: "HP%",
      circlet: "Healing Bonus hoặc HP%",
      note: "Xilonen support heal + shred: HP% để max heal scale. ER% nếu thiếu năng lượng. Healing Bonus circlet tốt nhất thuần support. Scroll 4pc active khi Crystallize.",
    },
    subStats: {
      stats: ["Energy Recharge (ER 180%+)", "HP%", "Flat HP", "DEF%", "CRIT Rate (nếu hybrid)"],
      note: "Xilonen ưu tiên ER để Q liên tục (cost 70). HP% tăng heal. DEF% để sống dai. Scroll 4pc: khi tạo Crystallize, buff Elemental DMG cho team theo nguyên tố Crystallize.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E tạo Ocelot Roller shred Elemental RES địch. Q heal + Geo aura. E level cao = shred nhiều hơn. NA ít quan trọng.",
    },
    playstyleNoteVi:
      "Xilonen E tạo Ocelot Roller shred Elemental RES địch (Pyro/Cryo/Hydro/Electro). Q heal team và Geo aura. Scroll 4pc: Crystallize tạo ra buff Elemental DMG cho team. Tối ưu với đội Pyro/Cryo/Hydro có Zhongli tạo Crystallize liên tục. Không cần vào field nhiều — on-field ngắn E+Q rồi swap.",
  },

  // ─── Geo Polearm ───────────────────────────────────────────────────────────

  // Kachina: Geo Sub-DPS off-field — Polearm
  kachina: {
    weapons: [
      { weaponId: "staff-of-homa", tier: "S", noteVi: "HP% + passive DMG khi HP thấp — tốt nhất polearm" },
      { weaponId: "primordial-jade-winged-spear", tier: "A", noteVi: "CRIT Rate + stack passive ATK" },
      { weaponId: "missive-windspear", tier: "B", noteVi: "ATK% + EM buff sau reaction — tốt craft" },
      { weaponId: "favonius-lance", tier: "B", noteVi: "ER + energy cho team" },
      { weaponId: "black-tassel", tier: "C", noteVi: "HP% 3-star — budget nếu build HP" },
    ],
    artifacts: [
      { setIds: ["husk-of-opulent-dreams"], mode: "4pc", priority: 1, noteVi: "DEF% + Geo DMG stack off-field — nếu Kachina scale DEF" },
      { setIds: ["golden-troupe"], mode: "4pc", priority: 2, noteVi: "Elemental Skill DMG +70% khi off-field" },
      { setIds: ["archaic-petra", "husk-of-opulent-dreams"], mode: "2+2", priority: 3, noteVi: "Geo DMG + DEF thay thế" },
    ],
    mainStats: {
      sands: "ATK% hoặc DEF%",
      goblet: "Geo DMG%",
      circlet: "CRIT Rate hoặc CRIT DMG",
      note: "Kachina Geo polearm: tùy kit scale ATK hay DEF, check ingame. Geo DMG% goblet. CRIT circlet 1:2.",
    },
    subStats: {
      stats: ["CRIT Rate / CRIT DMG (1:2)", "ATK%", "DEF%", "Energy Recharge (ER 140%+)", "Flat ATK"],
      note: "ER để Q liên tục. Geo Resonance (+15% DMG khi shield). Team 2+ Geo tối ưu.",
    },
    talentPriority: {
      order: ["Kỹ năng nguyên tố (E)", "Nguyên tố bùng phát (Q)", "Đòn thường (NA)"],
      note: "E off-field Geo DMG là DPS chính. Q buff và Geo aura. NA ít quan trọng khi off-field.",
    },
    playstyleNoteVi:
      "Kachina Geo off-field sub-DPS. E tạo construct Geo off-field. Q tạo Geo field buff. Geo Resonance (2+ Geo char) +15% DMG và giảm Geo RES địch. Kết hợp với Gorou hoặc Zhongli để buff.",
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

};


const ID_ALIASES: Record<string, string> = {
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
 */
export function getCharacterBuild(characterId: string): CharacterBuildEntry | undefined {
  const normalized = characterId.toLowerCase().trim();
  if (CHARACTER_BUILDS[normalized]) {
    return CHARACTER_BUILDS[normalized];
  }
  const alias = ID_ALIASES[normalized];
  if (alias && CHARACTER_BUILDS[alias]) {
    return CHARACTER_BUILDS[alias];
  }
  return undefined;
}
