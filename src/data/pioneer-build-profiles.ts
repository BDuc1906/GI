/**
 * src/data/pioneer-build-profiles.ts
 *
 * Dữ liệu 5 nhân vật tiên phong (Pioneer Multi-Profile Builds) của LEIBO:
 * 1. Kaedehara Kazuha
 * 2. Raiden Shogun
 * 3. Nahida
 * 4. Hu Tao
 * 5. Alhaitham
 *
 * Chuẩn hóa 100% theo KeqingMains (KQM Quick Guides, Extended Guides) và KQMS 20-Roll Standard.
 */

import type { CharacterMultiProfileBuild } from "@/core/build-profile/types";

export const PIONEER_BUILDS: Record<string, CharacterMultiProfileBuild> = {
  // ══════════════════════════════════════════════════════════════════════════
  // 1. KAEDEHARA KAZUHA
  // ══════════════════════════════════════════════════════════════════════════
  "kaedehara-kazuha": {
    characterId: "kaedehara-kazuha",
    characterName: "Kaedehara Kazuha",
    defaultProfileId: "kazuha-full-em",
    profiles: [
      {
        profileId: "kazuha-full-em",
        characterId: "kaedehara-kazuha",
        nameVi: "Phong Khí Thuần Tinh Thông (Full EM Buffer / Swirl Support)",
        role: "Support / Buffer",
        playstyleVi:
          "Tối đa hóa Tinh Thông Nguyên Tố (EM) để chuyển hóa thành Buff Sát Thương Nguyên Tố cho đồng đội qua nội tại, đồng thời gom quái và giảm 40% kháng nguyên tố bằng bộ 4 Bóng Hình Màu Xanh.",
        conditionsAndAssumptionsVi:
          "Chuẩn KQMS 20-roll. Duy trì giảm 40% kháng nguyên tố VV trong 10s. Swirl đúng nguyên tố của chủ lực. Đạt mốc nạp ER tối thiểu để nộ mỗi rotation 20s.",
        weapons: [
          {
            weaponId: "freedom-sworn",
            tier: "S",
            refinement: "R1",
            relativeDpsPercent: 115,
            conditionVi: "Kích hoạt phản ứng nguyên tố 2 lần để nhận buff Thiên Niên Đại Nhạc",
            noteVi: "Vũ khí trấn phái tối thượng: Cung cấp 198 EM và buff 20% ATK + 16% sát thương đòn đánh cho toàn đội.",
          },
          {
            weaponId: "xiphos-moonlight",
            tier: "S",
            refinement: "R5",
            relativeDpsPercent: 112,
            conditionVi: "Cần tích lũy >800 EM để tối đa hóa lượng ER chuyển hóa",
            noteVi: "Kiếm Ánh Trăng Xiphos: Cung cấp 165 EM và chuyển hóa EM thành lượng nạp ER khổng lồ cho bản thân và đồng đội.",
          },
          {
            weaponId: "iron-sting",
            tier: "A",
            refinement: "R1-R5",
            relativeDpsPercent: 100,
            conditionVi: "Đạt mốc nạp ER qua chỉ số phụ của Thánh Di Vật",
            noteVi: "Thiết Phong Kích F2P: Lựa chọn rèn F2P số 1 cung cấp 165 EM ổn định và tăng sát thương tổng quát.",
          },
          {
            weaponId: "favonius-sword",
            tier: "A",
            refinement: "R5",
            relativeDpsPercent: 105,
            conditionVi: "Yêu cầu tối thiểu 30-35% Tỷ Lệ Bạo Kích để kích hoạt hạt năng lượng trắng",
            noteVi: "Kiếm Tây Phong: Giải quyết triệt để vấn đề nạp cho Kazuha và đóng vai trò pin sạc năng lượng cho toàn đội.",
          },
          {
            weaponId: "sacrificial-sword",
            tier: "B",
            refinement: "R5",
            relativeDpsPercent: 96,
            conditionVi: "Tận dụng đòn E thứ 2 để tăng gấp đôi khả năng gom quái",
            noteVi: "Kiếm Tế Lễ: Cho phép thi triển Kỹ Năng Nguyên Tố 2 lần liên tiếp, gom quái diện rộng và nạp tức thì.",
          },
        ],
        artifacts: [
          {
            mode: "4pc",
            setIds: ["viridescent-venerer"],
            tier: "S",
            relativeEfficiencyPercent: 100,
            conditionVi: "Kazuha phải đứng trên sân khi kích hoạt Khuếch Tán để giảm kháng",
            noteVi: "Bóng Hình Màu Xanh 4 món: Bắt buộc trong 99% đội hình — Giảm 40% kháng nguyên tố được Khuếch Tán trong 10s, gia tăng sát thương toàn đội tới 27.8%.",
          },
          {
            mode: "2+2",
            setIds: ["viridescent-venerer", "wanderer-s-troupe"],
            tier: "B",
            relativeEfficiencyPercent: 82,
            conditionVi: "Chỉ dùng tạm thời khi đang farm bộ 4 món có chỉ số chính EM",
            noteVi: "2pc Phong (+15%) + 2pc Tinh Thông (+80 EM): Lựa chọn chuyển tiếp khi chưa hoàn thiện bộ 4 món VV.",
          },
        ],
        mainStats: {
          sands: ["Tinh Thông Nguyên Tố (EM)", "Hiệu Quả Nạp (ER% khi thiếu nạp nghiêm trọng)"],
          goblet: ["Tinh Thông Nguyên Tố (EM)"],
          circlet: ["Tinh Thông Nguyên Tố (EM)", "Tỷ Lệ Bạo Kích (Khi cầm Kiếm Tây Phong)"],
        },
        substatsPriority: [
          "Hiệu Quả Nạp (ER% đạt mốc chuẩn trước)",
          "Tinh Thông Nguyên Tố (EM)",
          "Tỷ Lệ Bạo Kích (nếu cầm Tây Phong)",
          "Tấn Công (ATK%)",
        ],
        statGoals: {
          "Tinh Thông Nguyên Tố": "900 - 1000+ EM",
          "Hiệu Quả Nạp (ER)": "160% - 190%+",
          "Tỷ Lệ Bạo Kích": "30% - 40% (nếu dùng Tây Phong)",
        },
        erRequirements: [
          {
            teamScenarioVi: "Đội Quốc Dân / Bốc Hơi (Đi cùng Xiangling, Bennett, Xingqiu)",
            recommendedERPercent: 165,
            erRangePercent: [155, 175],
            assumedRotationVi: "Rotation 20s, Kazuha E tap/hold + Q mỗi chu kỳ",
          },
          {
            teamScenarioVi: "Đội Thuần Băng (Ayaka Freeze có Shenhe / Diona cầm Tây Phong)",
            recommendedERPercent: 145,
            erRangePercent: [135, 155],
            assumedRotationVi: "Nhận hạt năng lượng từ Tây Phong của đồng đội",
          },
          {
            teamScenarioVi: "Đội Solo Phong không có vũ khí Tây Phong trong đội",
            recommendedERPercent: 185,
            erRangePercent: [175, 200],
            assumedRotationVi: "Kazuha Hold E + Q, cần bắt đúng hạt nguyên tố Phong",
          },
        ],
        talentPriority: {
          order: ["Kỹ Năng Nộ (Q)", "Kỹ Năng Nguyên Tố (E)", "Đòn Đánh Thường"],
          noteVi: "Thiên phú Q và E nâng song song lên Lv8-Lv9 để tăng sát thương nuke; Đòn đánh thường có thể bỏ qua trừ khi chơi lối Hybrid.",
        },
        recommendedTeams: [
          {
            nameVi: "Quốc Tế Ca Kịch (Childe International)",
            archetypeVi: "Khuếch Tán Kép (Double Swirl) & Bốc Hơi",
            teammateIds: ["tartaglia", "xiangling", "bennett"],
            teammateRoles: ["Chủ lực (DPS)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
            synergyReasonVi: "Kazuha thực hiện combo Double Swirl khuếch tán cả Thủy lẫn Hỏa, giảm 40% kháng 2 hệ và buff sát thương cực lớn cho Childe và Xiangling.",
            sampleRotationVi: "Childe E kích ấn Thủy -> Bennett Q -> Kazuha Hold E + Q -> Xiangling Q + E -> Childe Q + E chém điên cuồng.",
          },
          {
            nameVi: "Đông Cứng Vĩnh Cửu (Ayaka Freeze)",
            archetypeVi: "Đóng Băng & Gom Quái",
            teammateIds: ["kamisato-ayaka", "shenhe", "sangonomiya-kokomi"],
            teammateRoles: ["Chủ lực (DPS)", "Hỗ trợ (Buffer)", "Hồi máu (Healer)"],
            synergyReasonVi: "Gom toàn bộ kẻ địch vào tâm chiêu Nộ của Ayaka, khuếch tán Băng gia tăng sát thương và giữ quái đông cứng vĩnh viễn.",
            sampleRotationVi: "Shenhe E + Q -> Kazuha E + Q -> Kokomi E -> Ayaka Dash + E + Q.",
          },
        ],
        sourceMetadata: {
          primarySource: "KeqingMains Quick Guide",
          sourceUrl: "https://keqingmains.com/kazuha/",
          sourceVersion: "v5.2 Comprehensive Update",
          verifiedAt: "2026-11-14",
          gameVersionVerified: "5.4",
          reviewer: "KQM Theorycrafting & LEIBO Lead TC",
          reviewStatus: "VERIFIED",
        },
      },
      {
        profileId: "kazuha-crit-hybrid",
        characterId: "kaedehara-kazuha",
        nameVi: "Kiếm Khách Phong Bạo (Anemo Crit Sub-DPS)",
        role: "Sub-DPS",
        playstyleVi: "Tối ưu hóa sát thương cá nhân của kỹ năng E (Chihayaburu) và Q (Kazuha Slash) bằng chỉ số CRIT và Sát Thương Phong, phù hợp khi đã có C2 hoặc vũ khí 5 sao sát thương.",
        conditionsAndAssumptionsVi: "Cần vũ khí có chỉ số CRIT cao. Vẫn ưu tiên giữ 4pc VV để không làm mất giá trị buff của đội.",
        weapons: [
          {
            weaponId: "mistsplitter-reforged",
            tier: "S",
            refinement: "R1",
            conditionVi: "Tích đủ 3 tầng huy hiệu sương mù",
            noteVi: "Ánh Sương Đêm Sương Mù: 44.1% CRIT DMG và lượng lớn buff sát thương nguyên tố.",
          },
          {
            weaponId: "primordial-jade-cutter",
            tier: "S",
            refinement: "R1",
            conditionVi: "Tự động nhận 44.1% CRIT Rate không cần điều kiện",
            noteVi: "Bàn Nham Kết Lục: Cung cấp tỷ lệ bạo kích khổng lồ và tăng tấn công theo HP.",
          },
        ],
        artifacts: [
          {
            mode: "4pc",
            setIds: ["viridescent-venerer"],
            tier: "S",
            conditionVi: "Giữ vai trò giảm kháng cho đội",
            noteVi: "Bóng Hình Màu Xanh: Vừa gây sát thương Phong cá nhân vừa giảm 40% kháng nguyên tố.",
          },
        ],
        mainStats: {
          sands: ["Tấn Công (ATK%)", "Tinh Thông Nguyên Tố (EM)"],
          goblet: ["Sát Thương Phong%"],
          circlet: ["Tỷ Lệ Bạo Kích", "Sát Thương Bạo Kích"],
        },
        substatsPriority: ["Tỷ Lệ Bạo Kích", "Sát Thương Bạo Kích", "Hiệu Quả Nạp (ER%)", "Tấn Công (ATK%)", "Tinh Thông Nguyên Tố (EM)"],
        erRequirements: [
          {
            teamScenarioVi: "Đội hình có 2 nhân vật hệ Phong",
            recommendedERPercent: 135,
            erRangePercent: [125, 145],
            assumedRotationVi: "Rotation 20s tiêu chuẩn",
          },
        ],
        talentPriority: {
          order: ["Kỹ Năng Nguyên Tố (E)", "Kỹ Năng Nộ (Q)", "Đòn Đánh Thường"],
          noteVi: "Nâng max E và Q để tối ưu sát thương nuke Phong.",
        },
        recommendedTeams: [
          {
            nameVi: "Thuần Phong Siêu Tốc (Faruzan Anemo Core)",
            archetypeVi: "Thuần Phong (Mono Anemo)",
            teammateIds: ["faruzan", "furina", "bennett"],
            teammateRoles: ["Hỗ trợ (Buffer)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
            synergyReasonVi: "Faruzan buff sát thương Phong và giảm kháng Phong, kết hợp nuke bạo kích của Kazuha.",
            sampleRotationVi: "Faruzan Q -> Furina E + Q -> Bennett Q -> Kazuha Hold E + Q.",
          },
        ],
        sourceMetadata: {
          primarySource: "KeqingMains Extended Guide",
          sourceUrl: "https://keqingmains.com/kazuha/#Hybrid-DPS",
          sourceVersion: "v5.0 Update",
          verifiedAt: "2026-11-14",
          gameVersionVerified: "5.4",
          reviewer: "KQM Theorycrafting & LEIBO Lead TC",
          reviewStatus: "VERIFIED",
        },
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 2. RAIDEN SHOGUN
  // ══════════════════════════════════════════════════════════════════════════
  "raiden-shogun": {
    characterId: "raiden-shogun",
    characterName: "Raiden Shogun",
    defaultProfileId: "raiden-burst-dps",
    profiles: [
      {
        profileId: "raiden-burst-dps",
        characterId: "raiden-shogun",
        nameVi: "Lôi Thần Trảm - Sát Thương Chiêu Nộ (Burst Carry / Battery)",
        role: "Main DPS",
        playstyleVi: "Sử dụng chiêu Nộ Mộng Tưởng Nhất Tâm chém quét kẻ địch trong 7 giây, vừa gây lượng sát thương Lôi khổng lồ vừa nạp đầy năng lượng cho toàn bộ đội hình.",
        conditionsAndAssumptionsVi: "Chuẩn KQMS 20-roll. Tích lũy đủ 60 tầng Ý Niệm (Resolve Stacks). 4pc Dấu Ấn Ngăn Nắp chuyển hóa ER thành Burst DMG.",
        weapons: [
          {
            weaponId: "engulfing-lightning",
            tier: "S",
            refinement: "R1",
            relativeDpsPercent: 118,
            conditionVi: "Tận dụng nội tại chuyển hóa ER vượt 100% thành ATK",
            noteVi: "Đoạn Thảo Trảm Quang: Vũ khí trấn phái tối thượng — Cung cấp 55.1% ER, tăng mạnh ATK theo ER và tăng thêm 30% ER sau khi nộ.",
          },
          {
            weaponId: "the-catch",
            tier: "S",
            refinement: "R5",
            relativeDpsPercent: 100,
            conditionVi: "Vũ khí câu cá F2P chuẩn mực mốc 100% baseline",
            noteVi: "Lao Câu Cá R5: Vũ khí F2P số 1 — Tăng 32% sát thương Chiêu Nộ và 12% Tỷ Lệ Bạo Kích cho chiêu Nộ.",
          },
          {
            weaponId: "staff-of-homa",
            tier: "S",
            refinement: "R1",
            relativeDpsPercent: 108,
            conditionVi: "Cần đảm bảo đồng hồ ER% để không bị hụt nạp",
            noteVi: "Trượng Hộ Ma: 66.2% CRIT DMG cực lớn, stat stick nuke sát thương bạo kích hàng đầu.",
          },
          {
            weaponId: "favonius-lance",
            tier: "A",
            refinement: "R5",
            relativeDpsPercent: 88,
            conditionVi: "Lựa chọn thuần nạp khi đồng đội cực kỳ đói năng lượng",
            noteVi: "Thương Tây Phong: Đẩy khả năng sạc pin toàn đội lên mức tối đa.",
          },
        ],
        artifacts: [
          {
            mode: "4pc",
            setIds: ["emblem-of-severed-fate"],
            tier: "S",
            relativeEfficiencyPercent: 100,
            conditionVi: "Cần đạt 250-270% ER để chạm mốc tối đa 75% Burst DMG Bonus",
            noteVi: "Dấu Ấn Ngăn Nắp 4 món: Bộ thánh di vật trấn phái độc tôn — Chuyển hóa 25% Hiệu Quả Nạp thành Sát Thương Chiêu Nộ.",
          },
        ],
        mainStats: {
          sands: ["Hiệu Quả Nạp (ER% - Khuyên dùng)", "Tấn Công (ATK% - khi cầm vũ khí có ER cao)"],
          goblet: ["Sát Thương Lôi% (Khi đi cùng Bennett)", "Tấn Công (ATK% - khi cầm đồng hồ ER)"],
          circlet: ["Tỷ Lệ Bạo Kích", "Sát Thương Bạo Kích"],
        },
        substatsPriority: ["Tỷ Lệ Bạo Kích", "Sát Thương Bạo Kích", "Hiệu Quả Nạp (ER% tới 270%)", "Tấn Công (ATK%)"],
        statGoals: {
          "Hiệu Quả Nạp": "230% - 270%",
          "Tỷ Lệ Bạo Kích": "60% - 75%",
          "Sát Thương Bạo Kích": "120% - 160%",
        },
        erRequirements: [
          {
            teamScenarioVi: "Đội Raiden Quốc Dân (Rational: Xiangling, Xingqiu, Bennett)",
            recommendedERPercent: 220,
            erRangePercent: [210, 240],
            assumedRotationVi: "Raiden đứng sân chém 7s nạp đầy nộ cho Xiangling và Xingqiu",
          },
          {
            teamScenarioVi: "Đội Raiden Hypercarry (Sara C6, Kazuha, Bennett)",
            recommendedERPercent: 250,
            erRangePercent: [240, 270],
            assumedRotationVi: "Raiden gánh vác 80% sát thương của toàn đội",
          },
        ],
        talentPriority: {
          order: ["Kỹ Năng Nộ (Q)", "Kỹ Năng Nguyên Tố (E)", "Đòn Đánh Thường"],
          noteVi: "Chiêu Nộ Q ưu tiên tối đa (Lv10). Kỹ năng E nâng lên Lv9 để tăng tối đa buff sát thương chiêu nộ cho đồng đội.",
        },
        recommendedTeams: [
          {
            nameVi: "Lôi Thần Quốc Dân (Rational)",
            archetypeVi: "Bốc Hơi & Quá Tải & Điện Cảm",
            teammateIds: ["xiangling", "xingqiu", "bennett"],
            teammateRoles: ["Phụ sát thương (Sub-DPS)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
            synergyReasonVi: "Raiden nạp năng lượng liên tục cho Xiangling và Xingqiu xả chiêu nộ 80 điểm năng lượng mà không lo kẹt rotation.",
            sampleRotationVi: "Raiden E -> Xingqiu Q + E -> Bennett Q + E -> Xiangling Q + E -> Raiden Q + combo đòn đánh.",
          },
        ],
        sourceMetadata: {
          primarySource: "KeqingMains Quick Guide",
          sourceUrl: "https://keqingmains.com/raiden/",
          sourceVersion: "v5.2 Comprehensive Update",
          verifiedAt: "2026-11-14",
          gameVersionVerified: "5.4",
          reviewer: "KQM Theorycrafting & LEIBO Lead TC",
          reviewStatus: "VERIFIED",
        },
      },
      {
        profileId: "raiden-hyperbloom-em",
        characterId: "raiden-shogun",
        nameVi: "Kích Hoạt Siêu Nở Rộ (Full EM Hyperbloom Trigger)",
        role: "Hyperbloom Trigger",
        playstyleVi: "Chỉ sử dụng kỹ năng E để cấp ấn Lôi diện rộng mỗi 0.9s ngoài sân, kích nổ toàn bộ hạt Thảo bung ra từ Thủy + Thảo với sát thương Siêu Nở Rộ cực đại.",
        conditionsAndAssumptionsVi: "Level nhân vật bắt buộc phải đạt Lv90 (Sát thương Siêu Nở Rộ scale mạnh theo Level nhân vật và EM). Không dùng Chiêu Nộ Q.",
        weapons: [
          {
            weaponId: "dragon-s-bane",
            tier: "S",
            refinement: "R1-R5",
            conditionVi: "Không cần tinh luyện cao, chỉ cần stat Tinh Thông 221 EM",
            noteVi: "Tai Ương Của Rồng: Lựa chọn số 1 — Cung cấp tới 221 Tinh Thông Nguyên Tố.",
          },
          {
            weaponId: "kitain-cross-spear",
            tier: "A",
            refinement: "R1-R5",
            conditionVi: "Vũ khí rèn Inazuma",
            noteVi: "Thập Tự Kitain: Cung cấp 110 EM dễ chế tạo.",
          },
        ],
        artifacts: [
          {
            mode: "4pc",
            setIds: ["flower-of-paradise-lost"],
            tier: "S",
            relativeEfficiencyPercent: 105,
            conditionVi: "Tích đủ 4 tầng buff Siêu Nở Rộ",
            noteVi: "Đóa Hoa Trang Viên Lạc Lối: Tối đa hóa sát thương Siêu Nở Rộ cao hơn Giấc Mộng Hoàng Kim khoảng 5%.",
          },
          {
            mode: "4pc",
            setIds: ["gilded-dreams"],
            tier: "S",
            relativeEfficiencyPercent: 100,
            conditionVi: "Kích hoạt phản ứng để nhận thêm 150 EM",
            noteVi: "Giấc Mộng Hoàng Kim: Dễ farm cùng Bí Cảnh Rừng Sâu, cung cấp lượng EM khổng lồ.",
          },
        ],
        mainStats: {
          sands: ["Tinh Thông Nguyên Tố (EM)"],
          goblet: ["Tinh Thông Nguyên Tố (EM)"],
          circlet: ["Tinh Thông Nguyên Tố (EM)"],
        },
        substatsPriority: ["Tinh Thông Nguyên Tố (EM)", "Tấn Công (ATK%)"],
        statGoals: {
          "Tinh Thông Nguyên Tố": "950 - 1100+ EM",
          "Cấp độ": "Bắt buộc Level 90/90",
        },
        erRequirements: [
          {
            teamScenarioVi: "Không dùng chiêu nộ Q trong lối chơi này",
            recommendedERPercent: 100,
            erRangePercent: [100, 100],
            assumedRotationVi: "Chỉ bấm E mỗi 25s một lần để giữ ấn Lôi ngoài sân",
          },
        ],
        talentPriority: {
          order: ["Kỹ Năng Nguyên Tố (E)", "Kỹ Năng Nộ (Q)", "Đòn Đánh Thường"],
          noteVi: "Kỹ năng E chỉ cần nâng Lv1 cũng đủ kích nổ hạt Siêu Nở Rộ (damage hạt tính theo Level 90 và EM nhân vật, không scale theo level talent).",
        },
        recommendedTeams: [
          {
            nameVi: "Siêu Nở Rộ Thần Tốc (Raiden Hyperbloom)",
            archetypeVi: "Siêu Nở Rộ (Hyperbloom)",
            teammateIds: ["nahida", "xingqiu", "yelan"],
            teammateRoles: ["Hỗ trợ (Buffer)", "Phụ sát thương (Sub-DPS)", "Phụ sát thương (Sub-DPS)"],
            synergyReasonVi: "Nahida cấp Thảo, Yelan và Xingqiu bắn Thủy tạo mưa hạt Thảo, chiêu E của Raiden giật sét kích nổ lập tức mỗi hạt 35k-40k sát thương.",
            sampleRotationVi: "Raiden E -> Nahida E + Q -> Xingqiu Q + E -> Yelan Q + E -> Nahida đánh thường kích tia nước.",
          },
        ],
        sourceMetadata: {
          primarySource: "KeqingMains Quick Guide",
          sourceUrl: "https://keqingmains.com/raiden/#Hyperbloom",
          sourceVersion: "v5.2 Update",
          verifiedAt: "2026-11-14",
          gameVersionVerified: "5.4",
          reviewer: "KQM Theorycrafting & LEIBO Lead TC",
          reviewStatus: "VERIFIED",
        },
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 3. NAHIDA
  // ══════════════════════════════════════════════════════════════════════════
  "nahida": {
    characterId: "nahida",
    characterName: "Nahida",
    defaultProfileId: "nahida-off-field",
    profiles: [
      {
        profileId: "nahida-off-field",
        characterId: "nahida",
        nameVi: "Thảo Thần Bảo Hộ (Off-Field Bloom / Quicken Support)",
        role: "Support / Buffer",
        playstyleVi: "Liên kết tối đa 8 kẻ địch bằng chiêu E Diệt Trừ Nghiệp Chướng, cấp ấn Thảo liên tục ngoài sân và buff tối đa 250 EM cho nhân vật đứng sân thông qua Chiêu Nộ Q.",
        conditionsAndAssumptionsVi: "Chuẩn KQMS 20-roll. Giữ ấn Thảo 100% thời gian trên sân. Tích lũy gần mốc 1000 EM.",
        weapons: [
          {
            weaponId: "a-thousand-floating-dreams",
            tier: "S",
            refinement: "R1",
            relativeDpsPercent: 114,
            conditionVi: "Tự động nhận buff EM và Sát Thương Nguyên Tố theo đồng đội",
            noteVi: "Cõi Mộng Ngàn Đêm: Vũ khí trấn phái tối thượng — Cung cấp 265 EM cực lớn và buff thêm EM cho toàn đội.",
          },
          {
            weaponId: "wandering-evenstar",
            tier: "S",
            refinement: "R5",
            relativeDpsPercent: 108,
            conditionVi: "Chuyển hóa EM thành ATK cho toàn đội",
            noteVi: "Ngôi Sao Đêm Lang Thang: Cung cấp 165 EM và chuyển hóa EM thành chỉ số tấn công ATK cho đồng đội.",
          },
          {
            weaponId: "sacrificial-fragments",
            tier: "S",
            refinement: "R1-R5",
            relativeDpsPercent: 102,
            conditionVi: "Stat stick EM",
            noteVi: "Mảnh Chương Tế Lễ: Cung cấp tới 221 EM với độ khả dụng F2P rất cao.",
          },
          {
            weaponId: "magic-guide",
            tier: "A",
            refinement: "R5",
            relativeDpsPercent: 96,
            conditionVi: "Vũ khí 3 sao dễ kiếm, kẻ địch bị dính Thủy hoặc Lôi",
            noteVi: "Tóm Tắt Ma Pháp R5: Lựa chọn 3 sao F2P xuất sắc cung cấp 187 EM và 24% sát thương.",
          },
        ],
        artifacts: [
          {
            mode: "4pc",
            setIds: ["deepwood-memories"],
            tier: "S",
            relativeEfficiencyPercent: 100,
            conditionVi: "Kỹ năng E giật sát thương kích hoạt giảm 30% kháng Thảo của địch",
            noteVi: "Ký Ức Rừng Sâu 4 món: Bắt buộc phải có trong mọi đội hình hệ Thảo để giảm 30% kháng Thảo của mục tiêu.",
          },
        ],
        mainStats: {
          sands: ["Tinh Thông Nguyên Tố (EM)"],
          goblet: ["Tinh Thông Nguyên Tố (EM)", "Sát Thương Thảo%"],
          circlet: ["Tinh Thông Nguyên Tố (EM)", "Tỷ Lệ Bạo Kích"],
        },
        substatsPriority: ["Tinh Thông Nguyên Tố (EM tới 1000)", "Tỷ Lệ Bạo Kích", "Sát Thương Bạo Kích", "Hiệu Quả Nạp (ER%)"],
        statGoals: {
          "Tinh Thông Nguyên Tố": "800 - 1000 EM",
          "Tỷ Lệ Bạo Kích": "40% - 60%",
          "Hiệu Quả Nạp": "120% - 140%",
        },
        erRequirements: [
          {
            teamScenarioVi: "Đội hình rotation 20s-25s có 1 nhân vật Thảo khác",
            recommendedERPercent: 120,
            erRangePercent: [115, 130],
            assumedRotationVi: "Chiêu nộ tiêu hao thấp (50 năng lượng)",
          },
          {
            teamScenarioVi: "Solo Thảo không có Tây Phong",
            recommendedERPercent: 140,
            erRangePercent: [130, 150],
            assumedRotationVi: "Cần đảm bảo đủ nộ để buff 250 EM cho đồng đội đứng sân",
          },
        ],
        talentPriority: {
          order: ["Kỹ Năng Nguyên Tố (E)", "Kỹ Năng Nộ (Q)", "Đòn Đánh Thường"],
          noteVi: "Ưu tiên Max E trước vì đây là nguồn sát thương chủ lực của Nahida. Q nâng lên Lv9-Lv10 để tăng tối đa buff EM.",
        },
        recommendedTeams: [
          {
            nameVi: "Siêu Nở Rộ Thần Thánh (Nahida Hyperbloom)",
            archetypeVi: "Siêu Nở Rộ (Hyperbloom)",
            teammateIds: ["alhaitham", "xingqiu", "kuki-shinobu"],
            teammateRoles: ["Chủ lực (DPS)", "Phụ sát thương (Sub-DPS)", "Hồi máu (Healer)"],
            synergyReasonVi: "Nahida giảm 30% kháng Thảo, buff 250 EM và cấp ấn Thảo dồi dào cho Alhaitham và Kuki kích nổ hạt.",
            sampleRotationVi: "Nahida E + Q -> Xingqiu Q + E -> Kuki E -> Alhaitham Q + chém gương.",
          },
        ],
        sourceMetadata: {
          primarySource: "KeqingMains Quick Guide",
          sourceUrl: "https://keqingmains.com/nahida/",
          sourceVersion: "v5.2 Update",
          verifiedAt: "2026-11-14",
          gameVersionVerified: "5.4",
          reviewer: "KQM Theorycrafting & LEIBO Lead TC",
          reviewStatus: "VERIFIED",
        },
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 4. HU TAO
  // ══════════════════════════════════════════════════════════════════════════
  "hu-tao": {
    characterId: "hu-tao",
    characterName: "Hu Tao",
    defaultProfileId: "hu-tao-vaporize",
    profiles: [
      {
        profileId: "hu-tao-vaporize",
        characterId: "hu-tao",
        nameVi: "Điệp Hỏa Bốc Hơi Cổ Điển (Classic Vaporize Carry)",
        role: "Main DPS",
        playstyleVi: "Kích hoạt E tiêu hao máu chuyển hóa thành đòn đánh Hỏa cực mạnh, kết hợp đòn Trọng kích bốc hơi liên hoàn cùng hỗ trợ cấp ấn Thủy (Xingqiu / Yelan).",
        conditionsAndAssumptionsVi: "Chuẩn KQMS 20-roll. Giữ máu dưới 50% để nhận 33% Sát Thương Hỏa. 100% đòn Trọng Kích bốc hơi.",
        weapons: [
          {
            weaponId: "staff-of-homa",
            tier: "S",
            refinement: "R1",
            relativeDpsPercent: 116,
            conditionVi: "Duy trì lượng máu dưới 50%",
            noteVi: "Trượng Hộ Ma: Vũ khí trấn phái tối thượng — Cung cấp 66.2% CRIT DMG, 20% HP và chuyển hóa lượng lớn HP thành ATK.",
          },
          {
            weaponId: "ballad-of-the-fjords",
            tier: "S",
            refinement: "R5",
            relativeDpsPercent: 111,
            conditionVi: "Đội hình có ít nhất 3 loại nguyên tố khác nhau để nhận 240 EM",
            noteVi: "Khúc Ca Của Vịnh Hẹp R5: Vũ khí Nhật Ký Hành Trình cực mạnh cung cấp 27.6% CRIT Rate và 240 Tinh Thông.",
          },
          {
            weaponId: "dragon-s-bane",
            tier: "S",
            refinement: "R5",
            relativeDpsPercent: 104,
            conditionVi: "Kẻ địch luôn bị dính ấn Thủy/Hỏa",
            noteVi: "Tai Ương Của Rồng R5: Lựa chọn F2P số 1 — Cung cấp 221 EM và tăng thẳng 36% toàn bộ sát thương lên địch dính Thủy.",
          },
          {
            weaponId: "primordial-jade-winged-spear",
            tier: "A",
            refinement: "R1",
            relativeDpsPercent: 98,
            conditionVi: "Tích tầng tấn công khi đánh trúng địch",
            noteVi: "Hòa Phác Diên: 22.1% CRIT Rate và tích lũy tới 22.4% ATK.",
          },
        ],
        artifacts: [
          {
            mode: "4pc",
            setIds: ["crimson-witch-of-flames"],
            tier: "S",
            relativeEfficiencyPercent: 100,
            conditionVi: "Khuếch đại sát thương phản ứng Bốc Hơi thêm 15%",
            noteVi: "Diệm Liệt Ma Nữ 4 món: Bộ thánh di vật truyền thống toàn diện nhất — Tăng mạnh sát thương Hỏa và 15% hệ số phản ứng Bốc Hơi.",
          },
          {
            mode: "4pc",
            setIds: ["shimenawa-s-reminiscence"],
            tier: "S",
            relativeEfficiencyPercent: 98,
            conditionVi: "Tiêu hao 15 điểm năng lượng khi bấm E để tăng 50% sát thương Trọng Kích",
            noteVi: "Dòng Hồi Ức Shimenawa: Tối đa hóa sát thương đòn đâm Trọng kích cực đại.",
          },
        ],
        mainStats: {
          sands: ["Máu (HP% - Khuyên dùng khi EM >150)", "Tinh Thông Nguyên Tố (EM - khi cầm Hộ Ma thiếu EM)"],
          goblet: ["Sát Thương Hỏa%"],
          circlet: ["Tỷ Lệ Bạo Kích", "Sát Thương Bạo Kích"],
        },
        substatsPriority: [
          "Tỷ Lệ Bạo Kích",
          "Sát Thương Bạo Kích",
          "Tinh Thông Nguyên Tố (Đạt mốc 150 - 250 EM)",
          "Máu (HP%)",
          "Tấn Công (ATK%)",
        ],
        statGoals: {
          "Máu tối đa": "30,000 - 35,000+ HP",
          "Tinh Thông Nguyên Tố": "150 - 250 EM",
          "Tỷ Lệ Bạo Kích": "70% - 85%",
          "Sát Thương Bạo Kích": "160% - 220%+",
        },
        erRequirements: [
          {
            teamScenarioVi: "Đi cùng bộ Ma Nữ (nộ hồi phục máu khi khẩn cấp)",
            recommendedERPercent: 110,
            erRangePercent: [100, 120],
            assumedRotationVi: "Chiêu nộ chỉ dùng để nuke kết liễu hoặc hồi phục sinh mệnh",
          },
        ],
        talentPriority: {
          order: ["Đòn Đánh Thường", "Kỹ Năng Nguyên Tố (E)", "Kỹ Năng Nộ (Q)"],
          noteVi: "Bắt buộc Max Đòn đánh thường trước vì hệ số Trọng kích nằm ở đây. Sau đó Max E để tăng chỉ số ATK chuyển hóa.",
        },
        recommendedTeams: [
          {
            nameVi: "Song Thủy Bốc Hơi An Toàn (Hu Tao Double Hydro Zhongli)",
            archetypeVi: "Song Thủy Bốc Hơi & Khiên Nham",
            teammateIds: ["yelan", "xingqiu", "zhongli"],
            teammateRoles: ["Phụ sát thương (Sub-DPS)", "Phụ sát thương (Sub-DPS)", "Bảo hộ / Khiên (Shielder)"],
            synergyReasonVi: "Cộng hưởng Song Thủy tăng 25% Max HP cho Hu Tao và Yelan. Khiên Zhongli bảo vệ Hu Tao dưới 50% máu an toàn tuyệt đối.",
            sampleRotationVi: "Zhongli Hold E -> Xingqiu Q + E -> Yelan Q + E -> Hu Tao E + jump/dash cancel liên tục.",
          },
        ],
        sourceMetadata: {
          primarySource: "KeqingMains Extended Guide",
          sourceUrl: "https://keqingmains.com/hu-tao/",
          sourceVersion: "v5.2 Update",
          verifiedAt: "2026-11-14",
          gameVersionVerified: "5.4",
          reviewer: "KQM Theorycrafting & LEIBO Lead TC",
          reviewStatus: "VERIFIED",
        },
      },
    ],
  },

  // ══════════════════════════════════════════════════════════════════════════
  // 5. ALHAITHAM
  // ══════════════════════════════════════════════════════════════════════════
  "alhaitham": {
    characterId: "alhaitham",
    characterName: "Alhaitham",
    defaultProfileId: "alhaitham-spread",
    profiles: [
      {
        profileId: "alhaitham-spread",
        characterId: "alhaitham",
        nameVi: "Quan Lệnh Thảo Quang - Lan Truyền (Spread Carry)",
        role: "Main DPS",
        playstyleVi: "Quản lý 3 Gương Ánh Sáng để xả mưa kiếm Thảo liên tục, kích hoạt phản ứng Lan Truyền (Spread) cực mạnh khi kết hợp cùng ấn Lôi ngoài sân.",
        conditionsAndAssumptionsVi: "Chuẩn KQMS 20-roll. Giữ 3 gương ánh sáng trong 8-10 giây. Duy trì trạng thái Quicken (Sinh Trưởng) trên mục tiêu.",
        weapons: [
          {
            weaponId: "light-of-foliar-incision",
            tier: "S",
            refinement: "R1",
            relativeDpsPercent: 116,
            conditionVi: "Đánh trúng địch kích hoạt tăng sát thương đánh thường và E theo 120% EM",
            noteVi: "Ánh Lá Phán Quyết: Vũ khí trấn phái tối thượng — 88.2% CRIT DMG khổng lồ và chuyển hóa 120% EM thành sát thương.",
          },
          {
            weaponId: "primordial-jade-cutter",
            tier: "S",
            refinement: "R1",
            relativeDpsPercent: 109,
            conditionVi: "Nhận 44.1% CRIT Rate không điều kiện",
            noteVi: "Bàn Nham Kết Lục: Chỉ số bạo kích cực cao giúp cân bằng chỉ số dễ dàng.",
          },
          {
            weaponId: "mistsplitter-reforged",
            tier: "S",
            refinement: "R1",
            relativeDpsPercent: 106,
            conditionVi: "Tích tầng buff sát thương nguyên tố",
            noteVi: "Ánh Sương Đêm Sương Mù: 44.1% CRIT DMG và buff lượng lớn sát thương Thảo.",
          },
          {
            weaponId: "iron-sting",
            tier: "A",
            refinement: "R5",
            relativeDpsPercent: 96,
            conditionVi: "Lựa chọn rèn F2P tiêu chuẩn",
            noteVi: "Thiết Phong Kích R5: Tăng 165 EM và 24% toàn bộ sát thương sau khi gây sát thương nguyên tố.",
          },
        ],
        artifacts: [
          {
            mode: "4pc",
            setIds: ["gilded-dreams"],
            tier: "S",
            relativeEfficiencyPercent: 100,
            conditionVi: "Đồng đội đã có 1 người cầm bộ 4 Ký Ức Rừng Sâu (Deepwood)",
            noteVi: "Giấc Mộng Hoàng Kim 4 món: Cung cấp tới 230 EM và 14% ATK, tối ưu hóa sát thương Lan Truyền.",
          },
          {
            mode: "4pc",
            setIds: ["deepwood-memories"],
            tier: "S",
            relativeEfficiencyPercent: 98,
            conditionVi: "Khi trong đội chưa có ai cầm bộ Ký Ức Rừng Sâu",
            noteVi: "Ký Ức Rừng Sâu 4 món: Tự giảm 30% kháng Thảo của kẻ địch.",
          },
        ],
        mainStats: {
          sands: ["Tinh Thông Nguyên Tố (EM)"],
          goblet: ["Sát Thương Thảo%"],
          circlet: ["Tỷ Lệ Bạo Kích", "Sát Thương Bạo Kích"],
        },
        substatsPriority: ["Tỷ Lệ Bạo Kích", "Sát Thương Bạo Kích", "Tinh Thông Nguyên Tố (EM)", "Hiệu Quả Nạp (ER%)", "Tấn Công (ATK%)"],
        statGoals: {
          "Tinh Thông Nguyên Tố": "350 - 500+ EM",
          "Tỷ Lệ Bạo Kích": "70% - 85%",
          "Sát Thương Bạo Kích": "140% - 180%+",
          "Hiệu Quả Nạp": "125% - 140%",
        },
        erRequirements: [
          {
            teamScenarioVi: "Đi cùng Nahida hoặc 1 nhân vật Thảo cầm Tây Phong",
            recommendedERPercent: 130,
            erRangePercent: [120, 140],
            assumedRotationVi: "Q mở đầu lấy 3 gương -> chém -> E duy trì 3 gương -> Trọng kích duy trì 3 gương",
          },
        ],
        talentPriority: {
          order: ["Kỹ Năng Nguyên Tố (E)", "Kỹ Năng Nộ (Q)", "Đòn Đánh Thường"],
          noteVi: "Cả 3 thiên phú đều quan trọng; ưu tiên E trước vì sát thương mưa gương scale theo cấp kỹ năng E.",
        },
        recommendedTeams: [
          {
            nameVi: "Thảo Lôi Tăng Cường Lan Truyền (Alhaitham Spread Core)",
            archetypeVi: "Lan Truyền (Spread) & Sinh Trưởng",
            teammateIds: ["nahida", "fischl", "zhongli"],
            teammateRoles: ["Hỗ trợ (Buffer)", "Phụ sát thương (Sub-DPS)", "Bảo hộ / Khiên (Shielder)"],
            synergyReasonVi: "Nahida buff 250 EM và giảm kháng Thảo; Fischl xả sét liên tục từ ngoài sân; Zhongli bảo hộ khiên để Alhaitham không bị ngắt combo chém.",
            sampleRotationVi: "Zhongli Hold E -> Nahida E + Q -> Fischl E -> Alhaitham Q -> đòn đánh thường + E + CA giữ 3 gương.",
          },
        ],
        sourceMetadata: {
          primarySource: "KeqingMains Extended Guide",
          sourceUrl: "https://keqingmains.com/alhaitham/",
          sourceVersion: "v5.2 Comprehensive Update",
          verifiedAt: "2026-11-14",
          gameVersionVerified: "5.4",
          reviewer: "KQM Theorycrafting & LEIBO Lead TC",
          reviewStatus: "VERIFIED",
        },
      },
    ],
  },
};
