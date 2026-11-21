/**
 * src/core/assets/asset-manifest.ts
 *
 * Quản lý Asset Mapping Manifest cho toàn bộ dữ liệu game trong LEIBO.
 * Ánh xạ chính xác từ ID dữ liệu ổn định (Stable ID) sang file ảnh cụ thể.
 *
 * Tuyệt đối tuân theo quy định:
 * - 1 ID thực thể duy nhất -> 1 đường dẫn file ảnh xác định duy nhất.
 * - Không cho phép đường dẫn mập mờ hoặc trỏ lung tung.
 */

import type {
  AssetCategory,
  AssetMappingEntry,
  AssetManifest,
  AssetManifestStats,
  AssetType,
} from "./types";

/**
 * Sinh khóa định danh duy nhất trong manifest: `${category}:${id}:${assetType}`
 */
export function buildAssetKey(category: AssetCategory, id: string, assetType: AssetType): string {
  return `${category}:${id.toLowerCase().trim()}:${assetType}`;
}

/**
 * Quy định đường dẫn quy chuẩn (Canonical Path) cho từng loại asset
 */
export function getCanonicalAssetPath(
  category: AssetCategory,
  id: string,
  assetType: AssetType,
  options?: { piece?: string; preferWebp?: boolean }
): string {
  const cleanId = id.toLowerCase().trim();

  switch (category) {
    case "character": {
      const normalizedIconId = cleanId.startsWith("traveler-boy-")
        ? "aether"
        : cleanId.startsWith("traveler-girl-")
          ? "lumine"
          : cleanId;

      if (assetType === "icon") {
        return `/local-genshin-assets/characters/icon/${normalizedIconId}.png`;
      }
      if (assetType === "side") {
        return `/local-genshin-assets/characters/side/${normalizedIconId}.png`;
      }
      if (assetType === "splash") {
        return `/local-genshin-assets/characters/splash/${cleanId}.webp`;
      }
      return `/local-genshin-assets/characters/icon/${normalizedIconId}.png`;
    }

    case "version": {
      // Key visual phiên bản luôn ưu tiên WebP chất lượng cao 16:9, fallback sang JPG nếu có sẵn
      return options?.preferWebp === false
        ? `/images/versions/${cleanId}.jpg`
        : `/images/versions/${cleanId}.webp`;
    }

    case "weapon": {
      return `/local-genshin-assets/weapons/${cleanId}.png`;
    }

    case "artifact": {
      if (assetType === "piece" && options?.piece) {
        return `/local-genshin-assets/artifacts/pieces/${cleanId}-${options.piece}.png`;
      }
      return `/local-genshin-assets/artifacts/sets/${cleanId}.png`;
    }

    case "material": {
      return `/local-genshin-assets/materials/${cleanId}.png`;
    }

    case "element": {
      return `/local-genshin-assets/elements/${cleanId}.png`;
    }

    case "ui": {
      return `/local-genshin-assets/ui/${cleanId}.png`;
    }

    default:
      return `/local-genshin-assets/ui/unknown.png`;
  }
}

/**
 * Tạo một bản ghi AssetMappingEntry chuẩn
 */
export function createAssetEntry(
  category: AssetCategory,
  id: string,
  assetType: AssetType,
  label: string,
  targetPath: string
): AssetMappingEntry {
  return {
    key: buildAssetKey(category, id, assetType),
    id: id.toLowerCase().trim(),
    category,
    assetType,
    label,
    targetPath,
    status: "VALID",
    errors: [],
  };
}

/**
 * Khởi tạo cấu trúc thống kê rỗng
 */
export function createEmptyManifestStats(): AssetManifestStats {
  const categories: AssetCategory[] = [
    "character",
    "version",
    "weapon",
    "artifact",
    "material",
    "element",
    "ui",
  ];

  const byCategory = {} as AssetManifestStats["byCategory"];
  for (const cat of categories) {
    byCategory[cat] = { total: 0, valid: 0, invalid: 0, missing: 0 };
  }

  return {
    total: 0,
    verified: 0,
    valid: 0,
    invalid: 0,
    missing: 0,
    placeholder: 0,
    byCategory,
  };
}

/**
 * Tính toán số liệu thống kê cho Manifest
 */
export function computeManifestStats(entries: Record<string, AssetMappingEntry>): AssetManifestStats {
  const stats = createEmptyManifestStats();

  for (const entry of Object.values(entries)) {
    stats.total++;
    const cat = entry.category;
    if (!stats.byCategory[cat]) {
      stats.byCategory[cat] = { total: 0, valid: 0, invalid: 0, missing: 0 };
    }
    stats.byCategory[cat].total++;

    switch (entry.status) {
      case "VERIFIED":
        stats.verified++;
        stats.valid++;
        stats.byCategory[cat].valid++;
        break;
      case "VALID":
        stats.valid++;
        stats.byCategory[cat].valid++;
        break;
      case "INVALID":
        stats.invalid++;
        stats.byCategory[cat].invalid++;
        break;
      case "MISSING":
        stats.missing++;
        stats.byCategory[cat].missing++;
        break;
      case "PLACEHOLDER":
        stats.placeholder++;
        break;
    }
  }

  return stats;
}

/**
 * Tạo cấu trúc Manifest hoàn chỉnh
 */
export function buildManifest(entries: Record<string, AssetMappingEntry>): AssetManifest {
  return {
    manifestVersion: "2.0.0",
    generatedAt: new Date().toISOString(),
    stats: computeManifestStats(entries),
    entries,
  };
}
