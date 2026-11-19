/**
 * src/core/assets/types.ts
 *
 * Định nghĩa kiểu dữ liệu cho Hệ Thống Quản Lý & Kiểm Định Asset (LEIBO Asset Management & Validation).
 * Tuân thủ quy trình 8 bước và nguyên tắc:
 * "Không tự động gán ảnh gần giống khi không tìm thấy ảnh chính xác.
 *  Thà hiển thị placeholder còn hơn hiển thị nhân vật, vũ khí hay artwork phiên bản không liên quan."
 */

export type AssetCategory =
  | "character"
  | "version"
  | "weapon"
  | "artifact"
  | "material"
  | "element"
  | "ui";

export type AssetType =
  | "icon"
  | "side"
  | "splash"
  | "keyArt"
  | "set"
  | "piece"
  | "elementIcon"
  | "uiIcon";

export type AssetVerificationStatus =
  | "VERIFIED"     // Đã kiểm tra qua kiểm định nghiêm ngặt: file có thật, đúng định dạng, đúng tỉ lệ, đạt chuẩn sản phẩm
  | "VALID"        // Hợp lệ, đạt yêu cầu kỹ thuật cơ bản
  | "INVALID"      // Lỗi kiểm định: sai định dạng, sai tỉ lệ, hoặc dùng nhầm ảnh nhân vật làm background phiên bản
  | "MISSING"      // File không tồn tại trên ổ đĩa
  | "PLACEHOLDER"; // Được chỉ định tường minh sử dụng placeholder (không tự gán bừa)

export interface AssetMetadata {
  width: number;
  height: number;
  aspectRatio: number;
  actualFormat: "webp" | "png" | "jpeg" | "svg" | "unknown";
  fileSizeBytes: number;
  checksumMd5?: string;
}

export interface AssetRule {
  allowedExtensions: readonly string[];
  minWidth?: number;
  minHeight?: number;
  aspectRatioRange?: readonly [min: number, max: number];
  prohibitedSubstrings?: readonly string[];
  requireLandscape?: boolean;
  requireSquare?: boolean;
  disallowCharacterSplash?: boolean;
}

export interface AssetMappingEntry {
  /** Unique key: `${category}:${id}:${assetType}` */
  key: string;
  id: string;
  category: AssetCategory;
  assetType: AssetType;
  /** Tên định danh (vd: "Albedo", "Version 7.2", "Trượng Hộ Ma") */
  label: string;
  /** Đường dẫn file công khai (vd: "/local-genshin-assets/characters/icon/albedo.png") */
  targetPath: string;
  status: AssetVerificationStatus;
  metadata?: AssetMetadata;
  errors?: string[];
  verifiedAt?: string;
}

export interface AssetManifestStats {
  total: number;
  verified: number;
  valid: number;
  invalid: number;
  missing: number;
  placeholder: number;
  byCategory: Record<AssetCategory, { total: number; valid: number; invalid: number; missing: number }>;
}

export interface AssetManifest {
  manifestVersion: string;
  generatedAt: string;
  stats: AssetManifestStats;
  entries: Record<string, AssetMappingEntry>;
}

export interface AssetAuditResult {
  isValid: boolean;
  entry: AssetMappingEntry;
  errors: string[];
}

export interface ResolvedAsset {
  src: string | null;
  isPlaceholder: boolean;
  placeholderLabel?: string;
  category: AssetCategory;
  status: AssetVerificationStatus;
  aspectRatio?: number;
  width?: number;
  height?: number;
  errorReason?: string;
}
