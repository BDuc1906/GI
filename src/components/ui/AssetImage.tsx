/**
 * src/components/ui/AssetImage.tsx
 *
 * Component hiển thị hình ảnh chuẩn kiểm định (Validated Asset Image) cho LEIBO.
 *
 * Tuân thủ tuyệt đối nguyên tắc:
 * "Không tự động chọn hình ảnh gần giống để thay thế khi không tìm thấy ảnh chính xác.
 *  Thà hiển thị placeholder còn hơn hiển thị một nhân vật, vũ khí hay artwork phiên bản không liên quan."
 *
 * Tích hợp trực tiếp với Hệ Thống Kiểm Định Asset:
 * - Tự động tra cứu và kiểm tra asset hợp lệ
 * - Không bao giờ hiển thị ảnh sai loại hoặc ảnh nhầm lẫn
 * - Khi chưa có ảnh chính xác -> Render Placeholder có định danh rõ ràng
 */

import React from "react";
import Image from "next/image";
import { resolveValidatedAsset } from "@/core/assets/asset-resolver";
import type { AssetCategory, AssetType } from "@/core/assets/types";

interface AssetImageProps {
  category: AssetCategory;
  id: string;
  assetType: AssetType;
  alt: string;
  label?: string;
  piece?: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  unoptimized?: boolean;
}

export function AssetImage({
  category,
  id,
  assetType,
  alt,
  label,
  piece,
  className = "",
  fill = false,
  width,
  height,
  priority = false,
  sizes,
  unoptimized,
}: AssetImageProps) {
  const resolved = resolveValidatedAsset(category, id, assetType, {
    piece,
    label,
  });

  // Nếu asset chưa có hoặc không hợp lệ -> Hiển thị Placeholder thanh lịch, không tự gán ảnh khác!
  if (resolved.isPlaceholder || !resolved.src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-surface-card border border-border/60 text-text-muted select-none overflow-hidden rounded-[inherit] ${className}`}
        style={fill ? undefined : { width: width ?? "100%", height: height ?? "100%" }}
        title={resolved.errorReason || `Chưa có ảnh: ${label || id}`}
      >
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent-bright/80">
          {category === "version" ? "Phiên Bản" : category.toUpperCase()}
        </span>
        <span className="text-[11px] font-medium text-text-secondary/70 truncate max-w-[90%] px-1">
          {label || id}
        </span>
      </div>
    );
  }

  // Nếu là local webp trong public/ -> Bật unoptimized mặc định để giữ độ sắc nét tối đa, không bị nén mờ
  const isLocalWebp = resolved.src.endsWith(".webp") || resolved.src.startsWith("/local-genshin-assets/");
  const shouldUnoptimize = unoptimized ?? isLocalWebp;

  if (fill) {
    return (
      <Image
        src={resolved.src}
        alt={alt}
        fill
        className={className}
        priority={priority}
        sizes={sizes ?? "(max-width: 1280px) 100vw, 1280px"}
        unoptimized={shouldUnoptimize}
      />
    );
  }

  return (
    <Image
      src={resolved.src}
      alt={alt}
      width={width ?? 128}
      height={height ?? 128}
      className={className}
      priority={priority}
      sizes={sizes}
      unoptimized={shouldUnoptimize}
    />
  );
}
