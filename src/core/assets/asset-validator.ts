/**
 * src/core/assets/asset-validator.ts
 *
 * Bộ máy kiểm định Asset (Asset Validation Engine) cho LEIBO.
 * Thực thi các kiểm tra tự động:
 * 1. File tồn tại thực tế trên đĩa (public/...)
 * 2. Kích thước file (> 500 bytes, loại trừ file rỗng hoặc lỗi tải 404/HTML)
 * 3. Định dạng thực tế từ magic bytes (qua sharp metadata) khớp với phần mở rộng
 * 4. Kích thước (width, height) và Tỷ lệ khung hình (aspectRatio)
 * 5. Tính nhất quán ngữ nghĩa:
 *    - Tuyệt đối cấm dùng splash art nhân vật (/characters/splash/) làm background phiên bản
 *    - Tuyệt đối cấm ảnh dọc (portrait) cho banner phiên bản (phải là landscape >= 1.33)
 *    - Tuyệt đối cấm gán ảnh chéo giữa các loại dữ liệu
 *
 * Nguyên tắc bất di bất dịch:
 * "Không tự động chọn một hình ảnh gần giống để thay thế khi không tìm thấy ảnh chính xác.
 *  Thà hiển thị placeholder còn hơn hiển thị nhân vật, vũ khí hay artwork phiên bản không liên quan."
 */

import fs from "fs";
import path from "path";
import sharp from "sharp";
import { getAssetRule } from "./asset-rules";
import type {
  AssetAuditResult,
  AssetMappingEntry,
  AssetMetadata,
  AssetVerificationStatus,
} from "./types";

/**
 * Đổi đường dẫn public web (vd: "/images/versions/7.2.webp") thành đường dẫn đĩa vật lý tuyệt đối
 */
export function resolvePublicDiskPath(webPath: string): string {
  const clean = webPath.startsWith("/") ? webPath.slice(1) : webPath;
  return path.resolve(process.cwd(), "public", clean);
}

/**
 * Kiểm tra file có tồn tại trên đĩa hay không
 */
export function assetFileExists(webPath: string): boolean {
  try {
    const diskPath = resolvePublicDiskPath(webPath);
    return fs.existsSync(diskPath) && fs.statSync(diskPath).isFile();
  } catch {
    return false;
  }
}

/**
 * Đọc metadata thực tế của file ảnh qua sharp
 */
export async function readAssetMetadata(diskPath: string): Promise<AssetMetadata | null> {
  try {
    const stat = fs.statSync(diskPath);
    if (stat.size < 500) {
      // File quá nhỏ thường là file hỏng, HTML 404 hoặc file rỗng
      return null;
    }

    const image = sharp(diskPath);
    const meta = await image.metadata();

    if (!meta.width || !meta.height) {
      return null;
    }

    let actualFormat: AssetMetadata["actualFormat"] = "unknown";
    if (meta.format === "webp") actualFormat = "webp";
    else if (meta.format === "png") actualFormat = "png";
    else if (meta.format === "jpeg") actualFormat = "jpeg";
    else if (meta.format === "svg") actualFormat = "svg";

    return {
      width: meta.width,
      height: meta.height,
      aspectRatio: Number((meta.width / meta.height).toFixed(3)),
      actualFormat,
      fileSizeBytes: stat.size,
    };
  } catch {
    return null;
  }
}

/**
 * Kiểm định 1 AssetMappingEntry duy nhất
 */
export async function validateAssetEntry(entry: AssetMappingEntry): Promise<AssetAuditResult> {
  const errors: string[] = [];
  const diskPath = resolvePublicDiskPath(entry.targetPath);
  const rule = getAssetRule(entry.category, entry.assetType);

  // 1. Kiểm tra chuỗi bị cấm trước (Semantic Consistency: Tuyệt đối cấm dùng splash art nhân vật cho version)
  if (rule?.prohibitedSubstrings) {
    for (const sub of rule.prohibitedSubstrings) {
      if (entry.targetPath.toLowerCase().includes(sub.toLowerCase())) {
        errors.push(
          `Vi phạm tính nhất quán ngữ nghĩa: Đường dẫn chứa chuỗi bị cấm "${sub}" cho ${entry.category}:${entry.assetType}. Tuyệt đối không dùng ảnh nhân vật làm background phiên bản!`
        );
      }
    }
    if (errors.length > 0) {
      return {
        isValid: false,
        entry: {
          ...entry,
          status: "INVALID",
          errors,
        },
        errors,
      };
    }
  }

  // 2. Kiểm tra file tồn tại
  if (!fs.existsSync(diskPath) || !fs.statSync(diskPath).isFile()) {
    return {
      isValid: false,
      entry: {
        ...entry,
        status: "MISSING",
        errors: [`File không tồn tại trên ổ đĩa: ${entry.targetPath}`],
      },
      errors: [`File không tồn tại: ${entry.targetPath}`],
    };
  }

  // 3. Đọc metadata thực tế từ file
  const meta = await readAssetMetadata(diskPath);
  if (!meta) {
    errors.push(`File hỏng hoặc không phải ảnh hợp lệ (dung lượng < 500 bytes hoặc không parse được)`);
    return {
      isValid: false,
      entry: {
        ...entry,
        status: "INVALID",
        errors,
      },
      errors,
    };
  }

  // 4. Kiểm tra phần mở rộng file so với định dạng thực tế
  const ext = path.extname(entry.targetPath).toLowerCase();
  if (rule?.allowedExtensions && !rule.allowedExtensions.includes(ext)) {
    errors.push(
      `Phần mở rộng file "${ext}" không nằm trong danh sách cho phép [${rule.allowedExtensions.join(", ")}]`
    );
  }

  // Kiểm tra không đồng nhất giữa định dạng thực tế và đuôi file
  // (ví dụ: file là WebP nhưng lại đặt tên đuôi .jpg)
  if (
    (meta.actualFormat === "webp" && ext === ".jpg") ||
    (meta.actualFormat === "webp" && ext === ".jpeg") ||
    (meta.actualFormat === "jpeg" && ext === ".webp") ||
    (meta.actualFormat === "png" && ext === ".webp")
  ) {
    errors.push(
      `Cảnh báo định dạng không đồng nhất: Nội dung thực tế là ${meta.actualFormat.toUpperCase()} nhưng tên file có đuôi ${ext}. Cần đồng bộ phần mở rộng để tránh Next.js giải mã sai làm mờ ảnh!`
    );
  }

  // 5. Kiểm tra kích thước tối thiểu
  if (rule?.minWidth && meta.width < rule.minWidth) {
    errors.push(
      `Độ phân giải chiều rộng quá nhỏ (${meta.width}px < yêu cầu tối thiểu ${rule.minWidth}px). Sẽ gây hiện tượng ảnh bị vỡ và mờ khi hiển thị!`
    );
  }
  if (rule?.minHeight && meta.height < rule.minHeight) {
    errors.push(
      `Độ phân giải chiều cao quá nhỏ (${meta.height}px < yêu cầu tối thiểu ${rule.minHeight}px)`
    );
  }

  // 6. Kiểm tra tỷ lệ khung hình (Aspect Ratio)
  if (rule?.requireLandscape && meta.aspectRatio < 1.33) {
    errors.push(
      `Tỷ lệ khung hình không hợp lệ (${meta.aspectRatio}:1). Yêu cầu ảnh ngang (Landscape >= 1.33:1, chuẩn 16:9). Tuyệt đối không dùng ảnh dọc (portrait/splash art) cho banner ngang!`
    );
  }

  if (rule?.requireSquare && (meta.aspectRatio < 0.8 || meta.aspectRatio > 1.25)) {
    errors.push(
      `Tỷ lệ khung hình không vuông (${meta.aspectRatio}:1). Yêu cầu icon vuông xấp xỉ 1:1.`
    );
  }

  if (rule?.aspectRatioRange) {
    const [minRatio, maxRatio] = rule.aspectRatioRange;
    if (meta.aspectRatio < minRatio || meta.aspectRatio > maxRatio) {
      errors.push(
        `Tỷ lệ khung hình ${meta.aspectRatio}:1 nằm ngoài khoảng cho phép [${minRatio}, ${maxRatio}]`
      );
    }
  }

  const isValid = errors.length === 0;
  const status: AssetVerificationStatus = isValid ? "VERIFIED" : "INVALID";

  return {
    isValid,
    entry: {
      ...entry,
      status,
      metadata: meta,
      errors: errors.length > 0 ? errors : undefined,
      verifiedAt: new Date().toISOString(),
    },
    errors,
  };
}

/**
 * Kiểm định toàn bộ Manifest
 */
export async function validateAllManifestEntries(
  entries: Record<string, AssetMappingEntry>
): Promise<{
  validatedEntries: Record<string, AssetMappingEntry>;
  allResults: AssetAuditResult[];
  hasInvalid: boolean;
}> {
  const validatedEntries: Record<string, AssetMappingEntry> = {};
  const allResults: AssetAuditResult[] = [];
  let hasInvalid = false;

  for (const entry of Object.values(entries)) {
    const res = await validateAssetEntry(entry);
    allResults.push(res);
    validatedEntries[entry.key] = res.entry;
    if (!res.isValid) {
      hasInvalid = true;
    }
  }

  return { validatedEntries, allResults, hasInvalid };
}
