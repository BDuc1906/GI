import { describe, it, expect } from "vitest";
import { evaluateCharacterBuild } from "@/features/enka/services/build-evaluator";
import type { EnkaShowcaseCharacter } from "@/features/enka/types";

describe("BuildEvaluator Service", () => {
  it("đánh giá đúng Kazuha Full EM (không phạt crit thấp, yêu cầu ER và EM cao)", () => {
    const mockKazuha: EnkaShowcaseCharacter = {
      avatarId: 10000047,
      characterId: "kaedehara-kazuha",
      characterName: "Kaedehara Kazuha",
      iconUrl: "https://enka.network/ui/UI_AvatarIcon_Kazuha.png",
      vision: "Anemo",
      level: 90,
      constellations: 0,
      talentLevels: [10, 10, 10],
      fightProps: {
        hp: 19999,
        baseHp: 13348,
        atk: 1200,
        baseAtk: 608,
        def: 800,
        baseDef: 807,
        critRate: 15.5, // Thấp nhưng là Full EM Buffer!
        critDmg: 70.2,
        er: 165.4, // Đạt mốc ER 165%
        em: 920,   // Đạt mốc EM 900+
        damageBonus: 0,
        healingBonus: 0,
      },
      weapon: {
        name: "Freedom-Sworn",
        iconUrl: "https://enka.network/ui/UI_EquipIcon_Sword_Widsith.png",
        iconKey: "UI_EquipIcon_Sword_Widsith",
        level: 90,
        refinement: 1,
        rarity: 5,
      },
      artifacts: [
        {
          slot: "flower",
          slotName: "Hoa",
          name: "Hoa Sự Sống",
          setName: "Bóng Hình Màu Xanh",
          iconUrl: null,
          rarity: 5,
          level: 20,
          mainStat: { prop: "FIGHT_PROP_HP", label: "HP", value: "4,780" },
          substats: [{ prop: "FIGHT_PROP_ELEMENTAL_MASTERY", label: "Tinh Thông Nguyên Tố", value: "+80", rollValue: 100 }],
          critRate: 0,
          critDmg: 7,
          critValue: 7,
          rollValue: 350,
          cvRating: "Bình Thường",
        },
        {
          slot: "plume",
          slotName: "Lông",
          name: "Lông Tử Thần",
          setName: "Bóng Hình Màu Xanh",
          iconUrl: null,
          rarity: 5,
          level: 20,
          mainStat: { prop: "FIGHT_PROP_ATTACK", label: "Tấn Công", value: "311" },
          substats: [{ prop: "FIGHT_PROP_ELEMENTAL_MASTERY", label: "Tinh Thông Nguyên Tố", value: "+75", rollValue: 90 }],
          critRate: 0,
          critDmg: 7,
          critValue: 7,
          rollValue: 320,
          cvRating: "Bình Thường",
        },
        {
          slot: "sands",
          slotName: "Đồng hồ",
          name: "Đồng Hồ Thời Gian",
          setName: "Bóng Hình Màu Xanh",
          iconUrl: null,
          rarity: 5,
          level: 20,
          mainStat: { prop: "FIGHT_PROP_ELEMENTAL_MASTERY", label: "Tinh Thông Nguyên Tố", value: "187" },
          substats: [{ prop: "FIGHT_PROP_CHARGE_EFFICIENCY", label: "Hiệu Quả Nạp", value: "+11.7%", rollValue: 80 }],
          critRate: 0,
          critDmg: 0,
          critValue: 0,
          rollValue: 340,
          cvRating: "Bình Thường",
        },
        {
          slot: "goblet",
          slotName: "Ly",
          name: "Ly Không Gian",
          setName: "Bóng Hình Màu Xanh",
          iconUrl: null,
          rarity: 5,
          level: 20,
          mainStat: { prop: "FIGHT_PROP_ELEMENTAL_MASTERY", label: "Tinh Thông Nguyên Tố", value: "187" },
          substats: [{ prop: "FIGHT_PROP_CHARGE_EFFICIENCY", label: "Hiệu Quả Nạp", value: "+10.4%", rollValue: 80 }],
          critRate: 0,
          critDmg: 7,
          critValue: 7,
          rollValue: 330,
          cvRating: "Bình Thường",
        },
        {
          slot: "circlet",
          slotName: "Nón",
          name: "Nón Lý Trí",
          setName: "Bóng Hình Màu Xanh",
          iconUrl: null,
          rarity: 5,
          level: 20,
          mainStat: { prop: "FIGHT_PROP_ELEMENTAL_MASTERY", label: "Tinh Thông Nguyên Tố", value: "187" },
          substats: [{ prop: "FIGHT_PROP_CHARGE_EFFICIENCY", label: "Hiệu Quả Nạp", value: "+12.3%", rollValue: 90 }],
          critRate: 0,
          critDmg: 0,
          critValue: 0,
          rollValue: 360,
          cvRating: "Bình Thường",
        },
      ],
      totalCritValue: 28,
      totalRollValue: 1700,
      totalCvRating: "Chuẩn Thi Đấu",
      activeSetSummary: ["Bóng Hình Màu Xanh (4)"],
    };

    const result = evaluateCharacterBuild(mockKazuha);

    expect(result.activeProfileId).toBe("kazuha-full-em");
    expect(result.weapon.matchTier).toBe("BiS / S-Tier");
    expect(result.artifactSet.matchStatus).toBe("Tối ưu chuẩn bộ 4 món");
    expect(result.mainStats.matchCount).toBe(3);
    // Kazuha support không bị phạt "Lệch tỉ lệ" do thiếu crit
    expect(result.statBenchmarks.critRatio.rating).toBe("Không ưu tiên Bạo (Support / EM)");
    expect(result.statBenchmarks.energyRecharge.isMet).toBe(true);
    expect(result.overallGrade).toBe("Tối Ưu Hoàn Hảo (S)");
  });
});
