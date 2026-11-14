import { describe, it, expect } from "vitest";
import { resolveVersionBackgroundArt, getVersionTheme, VERSION_KEY_ART_MAP, VERSION_THEMES } from "@/core/game/version-art";

describe("version-art", () => {
  it("resolves curated version key art for mapped versions", () => {
    expect(resolveVersionBackgroundArt("7.2")).toBe("/images/versions/7.2.jpg");
    expect(resolveVersionBackgroundArt("5.3")).toBe("/local-genshin-assets/characters/splash/mavuika.webp");
    expect(resolveVersionBackgroundArt("5.4")).toBe(VERSION_KEY_ART_MAP["5.4"]);
  });

  it("resolves 5-star character splash art when available for unmapped versions", () => {
    const art = resolveVersionBackgroundArt("9.9", [
      { id: "amber", meta: "4★" },
      { id: "mitya", meta: "5★" },
    ]);
    expect(art).toBe("/local-genshin-assets/characters/splash/mitya.webp");
  });

  it("falls back to default version cover if no characters match", () => {
    const art = resolveVersionBackgroundArt("99.0", []);
    expect(art).toBe("/images/home-cards/versions.webp");
  });

  it("provides localized themes for major versions and dynamic fallbacks for new versions", () => {
    expect(VERSION_THEMES["7.2"].vi).toBe("Giờ Khắc Diệt Vong");
    expect(VERSION_THEMES["5.3"].vi).toBe("Khúc Khải Hoàn Hồi Sinh");
    expect(getVersionTheme("9.9")).toEqual({
      vi: "Cập Nhật Phiên Bản 9.9",
      en: "Version 9.9 Update",
    });
  });
});
