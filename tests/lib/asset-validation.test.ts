/**
 * tests/lib/asset-validation.test.ts
 *
 * Bộ kiểm thử toàn diện cho Hệ Thống Quản Lý & Kiểm Định Asset (LEIBO Asset System).
 * Kiểm thử việc thực thi nghiêm ngặt nguyên tắc:
 * "Không tự động chọn hình ảnh gần giống để thay thế khi không tìm thấy ảnh chính xác.
 *  Thà hiển thị placeholder còn hơn hiển thị nhân vật, vũ khí hay artwork phiên bản không liên quan."
 */

import { describe, it, expect } from "vitest";
import {
  createAssetEntry,
  getCanonicalAssetPath,
} from "@/core/assets/asset-manifest";
import { getAssetRule } from "@/core/assets/asset-rules";
import { validateAssetEntry } from "@/core/assets/asset-validator";
import { resolveValidatedAsset } from "@/core/assets/asset-resolver";

describe("LEIBO Asset Validation & Mapping", () => {
  it("builds canonical asset paths deterministically without ambiguity", () => {
    expect(getCanonicalAssetPath("character", "albedo", "icon")).toBe(
      "/local-genshin-assets/characters/icon/albedo.png"
    );
    expect(getCanonicalAssetPath("character", "furina", "splash")).toBe(
      "/local-genshin-assets/characters/splash/furina.webp"
    );
    expect(getCanonicalAssetPath("version", "7.2", "keyArt")).toBe(
      "/images/versions/7.2.webp"
    );
    expect(getCanonicalAssetPath("weapon", "staff-of-homa", "icon")).toBe(
      "/local-genshin-assets/weapons/staff-of-homa.png"
    );
    expect(getCanonicalAssetPath("artifact", "deepwood-memories", "set")).toBe(
      "/local-genshin-assets/artifacts/sets/deepwood-memories.png"
    );
  });

  it("strictly enforces validation rules for version backgrounds (anti-confusion)", () => {
    const versionRule = getAssetRule("version", "keyArt");
    expect(versionRule?.requireLandscape).toBe(true);
    expect(versionRule?.disallowCharacterSplash).toBe(true);

    // Rule prohibits character splash and avatar icons from being used as version background
    expect(versionRule?.prohibitedSubstrings).toContain("/characters/splash/");
    expect(versionRule?.prohibitedSubstrings).toContain("/characters/icon/");
  });

  it("fails validation if an entry attempts to use character splash as a version key art", async () => {
    const invalidEntry = createAssetEntry(
      "version",
      "7.2",
      "keyArt",
      "Key Visual",
      "/local-genshin-assets/characters/splash/capitano.webp"
    );

    const result = await validateAssetEntry(invalidEntry);
    expect(result.isValid).toBe(false);
    expect(result.entry.status).toBe("INVALID");
    expect(result.errors.some((e) => e.includes("Tuyệt đối không dùng ảnh nhân vật làm background"))).toBe(true);
  });

  it("fails validation when asset file does not exist on disk and marks as MISSING", async () => {
    const missingEntry = createAssetEntry(
      "weapon",
      "non-existent-weapon-xyz",
      "icon",
      "Vũ Khí Lạ",
      "/local-genshin-assets/weapons/non-existent-weapon-xyz.png"
    );

    const result = await validateAssetEntry(missingEntry);
    expect(result.isValid).toBe(false);
    expect(result.entry.status).toBe("MISSING");
    expect(result.errors[0]).toContain("File không tồn tại");
  });

  it("successfully verifies authentic 16:9 landscape Key Visual for Version 7.2", async () => {
    const entry = createAssetEntry(
      "version",
      "7.2",
      "keyArt",
      "Version 7.2 Key Visual",
      "/images/versions/7.2.webp"
    );

    const result = await validateAssetEntry(entry);
    expect(result.isValid).toBe(true);
    expect(result.entry.status).toBe("VERIFIED");
    expect(result.entry.metadata?.actualFormat).toBe("webp");
    expect(result.entry.metadata?.aspectRatio).toBeGreaterThanOrEqual(1.33);
  });

  describe("Runtime Asset Resolver - Strict Placeholder Principle", () => {
    it("returns verified URL when asset is valid on disk", () => {
      const resolved = resolveValidatedAsset("version", "7.2", "keyArt");
      expect(resolved.isPlaceholder).toBe(false);
      expect(resolved.src).toMatch(/\/images\/versions\/7\.2\.(webp|jpg)/);
      expect(resolved.status).toBe("VERIFIED");
    });

    it("NEVER substitutes an unknown version with a random character splash art", () => {
      const resolved = resolveValidatedAsset("version", "99.9", "keyArt");
      // Must be a safe placeholder or theme cover, NEVER a character splash art!
      if (resolved.isPlaceholder) {
        expect(resolved.src).toBeNull();
      } else {
        expect(resolved.src).not.toContain("/characters/");
      }
    });

    it("returns placeholder for non-existent weapons instead of guessing a nearby weapon", () => {
      const resolved = resolveValidatedAsset("weapon", "fake-sword-123", "icon");
      expect(resolved.isPlaceholder).toBe(true);
      expect(resolved.src).toBeNull();
      expect(resolved.status).toBe("MISSING");
    });
  });
});
