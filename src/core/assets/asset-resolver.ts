/**
 * src/core/assets/asset-resolver.ts
 *
 * Bộ phân giải Asset runtime (Runtime Asset Resolver) cho LEIBO.
 *
 * Thực thi nguyên tắc chỉ đạo:
 * "Không được tự động chọn một hình ảnh gần giống để thay thế khi không tìm thấy ảnh chính xác.
 *  Thà hiển thị placeholder còn hơn hiển thị một nhân vật, vũ khí hay artwork phiên bản không liên quan."
 *
 * Khi một asset chưa có hoặc không hợp lệ:
 * - Trả về `src: null` và `isPlaceholder: true`
 * - Ghi nhận lý do lỗi
 * - Tuyệt đối không tự fallback sang splash art của nhân vật khác hay vũ khí khác.
 */

import fs from "fs";
import path from "path";
import { getAssetRule } from "./asset-rules";
import { getCanonicalAssetPath } from "./asset-manifest";
import type { AssetCategory, AssetType, ResolvedAsset } from "./types";

/**
 * Kiểm tra nhanh đường dẫn asset trên đĩa cục bộ
 */
function isAssetAvailableOnDisk(webPath: string): boolean {
  try {
    const clean = webPath.startsWith("/") ? webPath.slice(1) : webPath;
    const diskPath = path.resolve(process.cwd(), "public", clean);
    return fs.existsSync(diskPath) && fs.statSync(diskPath).size > 500;
  } catch {
    return false;
  }
}

/**
 * Phân giải asset theo cơ chế kiểm định nghiêm ngặt
 */
export function resolveValidatedAsset(
  category: AssetCategory,
  id: string,
  assetType: AssetType,
  options?: { piece?: string; label?: string }
): ResolvedAsset {
  const cleanId = id.toLowerCase().trim();
  const rule = getAssetRule(category, assetType);
  const canonicalPath = getCanonicalAssetPath(category, cleanId, assetType, {
    piece: options?.piece,
  });

  // 1. Kiểm tra tính nhất quán ngữ nghĩa theo quy tắc (Anti-confusion)
  if (rule?.prohibitedSubstrings) {
    for (const sub of rule.prohibitedSubstrings) {
      if (canonicalPath.toLowerCase().includes(sub.toLowerCase())) {
        return {
          src: null,
          isPlaceholder: true,
          placeholderLabel: options?.label || cleanId,
          category,
          status: "INVALID",
          errorReason: `Đường dẫn chứa thành phần bị cấm "${sub}" cho ${category}:${assetType}. Không cho phép tự gán bừa.`,
        };
      }
    }
  }

  // 2. Với Version Key Art: Kiểm tra WebP trước, fallback sang JPG nếu có
  if (category === "version" && assetType === "keyArt") {
    const webpPath = `/images/versions/${cleanId}.webp`;
    const jpgPath = `/images/versions/${cleanId}.jpg`;

    if (isAssetAvailableOnDisk(webpPath)) {
      return {
        src: webpPath,
        isPlaceholder: false,
        category: "version",
        status: "VERIFIED",
        aspectRatio: 1.778, // 16:9
      };
    }

    if (isAssetAvailableOnDisk(jpgPath)) {
      return {
        src: jpgPath,
        isPlaceholder: false,
        category: "version",
        status: "VERIFIED",
        aspectRatio: 1.778, // 16:9
      };
    }

    // Nếu cả WebP và JPG đều không có -> Trả về Placeholder!
    // TUYỆT ĐỐI KHÔNG GÁN SPLASH ART NHÂN VẬT THAY THẾ!
    return {
      src: null,
      isPlaceholder: true,
      placeholderLabel: options?.label || `Phiên bản ${cleanId}`,
      category: "version",
      status: "PLACEHOLDER",
      errorReason: `Chưa có Key Visual chính thức 16:9 cho Phiên bản ${cleanId}. Hiển thị placeholder chuẩn.`,
    };
  }

  // 3. Với Character Splash: Kiểm tra WebP trước, sau đó PNG
  if (category === "character" && assetType === "splash") {
    const webpPath = `/local-genshin-assets/characters/splash/${cleanId}.webp`;
    const pngPath = `/local-genshin-assets/characters/splash/${cleanId}.png`;

    if (isAssetAvailableOnDisk(webpPath)) {
      return {
        src: webpPath,
        isPlaceholder: false,
        category: "character",
        status: "VERIFIED",
      };
    }

    if (isAssetAvailableOnDisk(pngPath)) {
      return {
        src: pngPath,
        isPlaceholder: false,
        category: "character",
        status: "VERIFIED",
      };
    }

    return {
      src: null,
      isPlaceholder: true,
      placeholderLabel: options?.label || cleanId,
      category: "character",
      status: "PLACEHOLDER",
      errorReason: `Chưa có Splash Art chính thức cho nhân vật ${cleanId}.`,
    };
  }

  // 4. Với Icon thông thường
  if (isAssetAvailableOnDisk(canonicalPath)) {
    return {
      src: canonicalPath,
      isPlaceholder: false,
      category,
      status: "VERIFIED",
    };
  }

  // 5. Nếu không tồn tại trên đĩa -> Không tự gán bừa ảnh khác!
  return {
    src: null,
    isPlaceholder: true,
    placeholderLabel: options?.label || cleanId,
    category,
    status: "MISSING",
    errorReason: `File ${canonicalPath} không tồn tại trên ổ đĩa. Sử dụng placeholder an toàn.`,
  };
}
