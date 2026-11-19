/**
 * src/core/assets/asset-rules.ts
 *
 * Quy chuẩn kiểm định kỹ thuật & tính nhất quán (Validation Rules) cho từng nhóm Asset trong LEIBO.
 * Ngăn chặn tuyệt đối việc:
 * 1. Lấy splash art / icon nhân vật cắt ghép làm background phiên bản.
 * 2. Dùng ảnh dọc (portrait) cho banner ngang 16:9.
 * 3. File định dạng sai (ví dụ: file WebP nhưng đặt tên đuôi .jpg khiến trình duyệt/NextJS giải mã mờ/lỗi).
 * 4. Dùng icon loại dữ liệu này gán bừa cho loại dữ liệu khác.
 */

import type { AssetCategory, AssetRule, AssetType } from "./types";

export const ASSET_RULES: Partial<Record<`${AssetCategory}:${AssetType}`, AssetRule>> = {
  // ── 1. Phiên bản (Version) ──
  "version:keyArt": {
    allowedExtensions: [".webp", ".jpg", ".jpeg", ".png"],
    minWidth: 800,
    minHeight: 450,
    aspectRatioRange: [1.33, 2.5], // Phải là tỷ lệ ngang chuẩn (Landscape ~16:9, tối thiểu 4:3)
    requireLandscape: true,
    disallowCharacterSplash: true,
    prohibitedSubstrings: [
      "/characters/splash/",
      "/characters/icon/",
      "/characters/side/",
      "UI_AvatarIcon",
      "UI_Gacha_AvatarImg",
      "UI_Costume",
    ],
  },

  // ── 2. Nhân vật (Character) ──
  "character:icon": {
    allowedExtensions: [".png", ".webp"],
    minWidth: 64,
    minHeight: 64,
    aspectRatioRange: [0.85, 1.18], // Phải là ảnh vuông chuẩn Avatar
    requireSquare: true,
    prohibitedSubstrings: ["/weapons/", "/artifacts/", "/materials/"],
  },
  "character:side": {
    allowedExtensions: [".png", ".webp"],
    minWidth: 64,
    minHeight: 64,
    prohibitedSubstrings: ["/weapons/", "/artifacts/"],
  },
  "character:splash": {
    allowedExtensions: [".webp", ".png", ".jpg", ".jpeg"],
    minWidth: 500,
    minHeight: 500,
    prohibitedSubstrings: ["/weapons/", "/materials/"],
  },

  // ── 3. Vũ khí (Weapon) ──
  "weapon:icon": {
    allowedExtensions: [".png", ".webp"],
    minWidth: 64,
    minHeight: 64,
    aspectRatioRange: [0.85, 1.18],
    requireSquare: true,
    prohibitedSubstrings: ["/characters/", "/artifacts/", "/materials/"],
  },

  // ── 4. Thánh di vật (Artifact) ──
  "artifact:set": {
    allowedExtensions: [".png", ".webp"],
    minWidth: 64,
    minHeight: 64,
    aspectRatioRange: [0.85, 1.18],
    requireSquare: true,
    prohibitedSubstrings: ["/characters/", "/weapons/"],
  },
  "artifact:piece": {
    allowedExtensions: [".png", ".webp"],
    minWidth: 64,
    minHeight: 64,
    aspectRatioRange: [0.85, 1.18],
    requireSquare: true,
    prohibitedSubstrings: ["/characters/", "/weapons/"],
  },

  // ── 5. Nguyên liệu (Material) ──
  "material:icon": {
    allowedExtensions: [".png", ".webp"],
    minWidth: 48,
    minHeight: 48,
    aspectRatioRange: [0.85, 1.18],
    requireSquare: true,
  },

  // ── 6. Nguyên tố (Element) ──
  "element:elementIcon": {
    allowedExtensions: [".png", ".svg", ".webp"],
    minWidth: 32,
    minHeight: 32,
    requireSquare: true,
  },

  // ── 7. UI chung ──
  "ui:uiIcon": {
    allowedExtensions: [".png", ".svg", ".webp"],
    minWidth: 24,
    minHeight: 24,
  },
};

/**
 * Lấy quy tắc kiểm định theo category và assetType
 */
export function getAssetRule(category: AssetCategory, assetType: AssetType): AssetRule | undefined {
  const key = `${category}:${assetType}` as const;
  return ASSET_RULES[key];
}
