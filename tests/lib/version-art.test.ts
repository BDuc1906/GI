import { describe, it, expect } from "vitest";
import { resolveVersionBackgroundArt, getVersionTheme, VERSION_KEY_ART_MAP, VERSION_THEMES } from "@/core/game/version-art";

describe("version-art", () => {
  it("resolves official version key art for mapped versions", () => {
    expect(resolveVersionBackgroundArt("7.2")).toBe("/images/versions/7.2.jpg");
    expect(resolveVersionBackgroundArt("5.3")).toBe("/images/versions/5.3.jpg");
    expect(resolveVersionBackgroundArt("5.4")).toBe("/images/versions/5.4.jpg");
    expect(resolveVersionBackgroundArt("4.2")).toBe("/images/versions/4.2.jpg");
    expect(resolveVersionBackgroundArt("1.0")).toBe("/images/versions/1.0.jpg");
  });

  it("resolves Snezhnaya key visual for 7.x versions", () => {
    expect(resolveVersionBackgroundArt("7.1")).toBe("/images/versions/7.1.jpg");
    expect(resolveVersionBackgroundArt("7.9")).toBe("/images/versions/7.2.jpg");
  });

  it("falls back to default version cover if no version matches", () => {
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
