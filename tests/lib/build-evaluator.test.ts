import { describe, it, expect } from "vitest";
import { evaluateCharacterBuild } from "@/features/enka/services/build-evaluator";
import type { EnkaShowcaseCharacter } from "@/features/enka/types";

describe("BuildEvaluator Service", () => {
  it("đánh giá đúng Kazuha Full EM (không phạt crit thấp, yêu cầu ER và EM cao)", () => {
    const mockKazuha: EnkaShowcaseCharacter = {
      avatarId: 10000047,
      characterId: "kaedehara-kazuha",
      name: "Kaedehara Kazuha",
      level: 90,
      friendship: 10,
      constellation: 0,
      element: "Anemo",
      rarity: 5,
      fightProps: {
        hp: 19999,
        atk: 1200,
        def: 800,
        critRate: 15.5, // Thấp nhưng là Full EM Buffer!
        critDmg: 70.2,
        er: 165.4, // Đạt mốc ER 165%
        em: 920,   // Đạt mốc EM 900+
      },
      weapon: {
        name: "Freedom-Sworn",
        icon: "https://enka.network/ui/UI_EquipIcon_Sword_Widsith.png",
        type: "Sword",
        rarity: 5,
        level: 90,
        refinement: 1,
        baseAtk: 608,
        subStat: { label: "Tinh Thông Nguyên Tố", value: "198" },
      },
      artifacts: [
        {
          id: 1,
          name: "Hoa",
          setName: "Bóng Hình Màu Xanh",
          slot: "flower",
          rarity: 5,
          level: 20,
          mainStat: { label: "HP", value: "4,780" },
          subStats: [{ label: "Tinh Thông Nguyên Tố", value: "+80" }],
          rollValue: 350,
          critValue: 14,
        },
        {
          id: 2,
          name: "Lông",
          setName: "Bóng Hình Màu Xanh",
          slot: "plume",
          rarity: 5,
          level: 20,
          mainStat: { label: "Tấn Công", value: "311" },
          subStats: [{ label: "Tinh Thông Nguyên Tố", value: "+75" }],
          rollValue: 320,
          critValue: 12,
        },
        {
          id: 3,
          name: "Đồng hồ",
          setName: "Bóng Hình Màu Xanh",
          slot: "sands",
          rarity: 5,
          level: 20,
          mainStat: { label: "Tinh Thông Nguyên Tố", value: "187" },
          subStats: [{ label: "Hiệu Quả Nạp", value: "+11.7%" }],
          rollValue: 340,
          critValue: 0,
        },
        {
          id: 4,
          name: "Ly",
          setName: "Bóng Hình Màu Xanh",
          slot: "goblet",
          rarity: 5,
          level: 20,
          mainStat: { label: "Tinh Thông Nguyên Tố", value: "187" },
          subStats: [{ label: "Hiệu Quả Nạp", value: "+10.4%" }],
          rollValue: 330,
          critValue: 7,
        },
        {
          id: 5,
          name: "Nón",
          setName: "Bóng Hình Màu Xanh",
          slot: "circlet",
          rarity: 5,
          level: 20,
          mainStat: { label: "Tinh Thông Nguyên Tố", value: "187" },
          subStats: [{ label: "Hiệu Quả Nạp", value: "+12.3%" }],
          rollValue: 360,
          critValue: 0,
        },
      ],
      activeSetSummary: ["Bóng Hình Màu Xanh (4)"],
      skills: [],
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
