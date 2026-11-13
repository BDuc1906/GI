import { describe, it, expect } from "vitest";
import { resolveVersionBackgroundArt, VERSION_KEY_ART_MAP, VERSION_THEMES } from "@/core/game/version-art";

describe("version-art", () => {
  it("resolves curated version key art for mapped versions", () => {
    expect(resolveVersionBackgroundArt("7.1")).toBe(VERSION_KEY_ART_MAP["7.1"]);
    expect(resolveVersionBackgroundArt("7.2")).toBe(VERSION_KEY_ART_MAP["7.2"]);
    expect(resolveVersionBackgroundArt("5.3")).toBe("/local-genshin-assets/characters/splash/mavuika.webp");
  });

  it("resolves 5-star character splash art when available for unmapped versions", () => {
    const art = resolveVersionBackgroundArt("9.9", [
      { id: "amber", meta: "4★" },
      { id: "zhongli", meta: "5★" },
    ]);
    expect(art).toBe("/local-genshin-assets/characters/splash/zhongli.webp");
  });

  it("falls back to default version cover if no characters match", () => {
    const art = resolveVersionBackgroundArt("99.0", []);
    expect(art).toBe("/images/home-cards/versions.webp");
  });

  it("provides localized themes for major versions", () => {
    expect(VERSION_THEMES["7.1"].vi).toBe("Vũ Điệu Băng Tuyết");
    expect(VERSION_THEMES["7.2"].vi).toBe("Chân Trời Băng Đóng");
    expect(VERSION_THEMES["5.3"].vi).toBe("Khúc Khải Hoàn Hồi Sinh");
  });
});
