import { describe, it, expect } from "vitest";
import {
  getLocalizedDescription,
  getLocalizedTalents,
  getLocalizedConstellations,
  getLocalizedRefinements,
  type Talent,
  type Constellation,
} from "@/lib/i18n/localized-content";

describe("Game Content Multi-Language Localization", () => {
  const mockTalents: Talent[] = [
    {
      key: "normalAttack",
      name: "Soloist's Solicitation",
      description: "Normal attack english",
      icon: null,
      attributes: null,
    },
    {
      key: "elementalSkill",
      name: "Salon Solitaire",
      description: "Elemental skill english",
      icon: null,
      attributes: null,
    },
    {
      key: "elementalBurst",
      name: "Let the People Rejoice",
      description: "Elemental burst english",
      icon: null,
      attributes: null,
    },
  ];

  it("trả về mô tả nhân vật bằng tiếng Việt chính thức của Hoyoverse", () => {
    const descVi = getLocalizedDescription(
      {
        name: "Furina",
        description: "The absolute focus of the stage of judgment...",
        descriptionTranslations: null,
      },
      "vi"
    );
    expect(descVi).toContain("sân khấu xét xử");
  });

  it("trả về chiêu thức kỹ năng bằng tiếng Việt chính thức", () => {
    const localized = getLocalizedTalents(mockTalents, null, "vi", "Furina");
    expect(localized[0].name).toBe("Lời Mời Độc Diễn");
    expect(localized[1].name).toBe("Salon Cô Độc");
    expect(localized[2].name).toBe("Chúng Dân Reo Hò");
  });

  it("trả về chiêu thức kỹ năng bằng tiếng Nhật (ja) chính thức", () => {
    const localized = getLocalizedTalents(mockTalents, null, "ja", "Furina");
    expect(localized[0].name).toBe("ソリストの誘い");
    expect(localized[1].name).toBe("サロン·ソリティア");
  });

  it("trả về chiêu thức kỹ năng bằng tiếng Trung giản thể (zh-CN) chính thức", () => {
    const localized = getLocalizedTalents(mockTalents, null, "zh-CN", "Furina");
    expect(localized[0].name).toBe("独舞之邀");
    expect(localized[1].name).toBe("孤心沙龙");
  });

  it("trả về cung mệnh tiếng Nga (ru) chính thức", () => {
    const mockConstellations: Constellation[] = [
      {
        level: 1,
        name: '"Love Is a Rebellious Bird That None Can Tame"',
        description: "English C1",
        icon: null,
      },
    ];

    const localized = getLocalizedConstellations(mockConstellations, null, "ru", "Furina");
    expect(localized[0].name).toContain("У любви");
  });

  it("trả về hiệu ứng tinh luyện vũ khí bằng tiếng Việt chính thức", () => {
    const mockRefinements = [
      { description: "HP increased by 20%..." },
    ];

    const localized = getLocalizedRefinements(mockRefinements, null, "vi", "Staff of Homa");
    expect(localized[0].description).toContain("HP tăng 20%");
  });
});
