"use client";

import React, { useMemo } from "react";
import { SafeImage } from "@/components/ui/SafeImage";
import { getCanonicalAssetPath } from "@/core/assets/asset-manifest";
import type { AssetCategory, AssetType } from "@/core/assets/types";

export type EntityType =
  | "character"
  | "weapon"
  | "artifact"
  | "material"
  | "domain"
  | "version"
  | "element"
  | "enemy";

export type EntityImageType = "icon" | "side" | "splash" | "keyArt" | "piece";

export interface EntityVisualProps {
  entityType: EntityType;
  entityId: string;
  imageType?: EntityImageType;
  alt: string;
  /** Tên hiển thị nhãn phụ khi hover hoặc placeholder */
  label?: string;
  /** URL ảnh ban đầu từ DB (nếu có) */
  initialSrc?: string | null;
  /** Danh sách URL dự phòng bổ sung (vd: iconUrlOriginal) */
  fallbackSrcs?: Array<string | null | undefined>;
  /** Kích thước chuẩn định sẵn hoặc custom (dùng wrapperClassName) */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "fill" | "custom";
  /** Tỷ lệ khung hình cố định chống layout shift */
  aspectRatio?: "square" | "portrait" | "landscape" | "auto";
  /** Kiểu lấp đầy ảnh: cover hoặc contain */
  fit?: "contain" | "cover";
  /** Mảnh thánh di vật (flower, feather, sands, goblet, circlet) */
  piece?: "flower" | "feather" | "sands" | "goblet" | "circlet";
  priority?: boolean;
  unoptimized?: boolean;
  className?: string;
  wrapperClassName?: string;
  /** Màu nguyên tố/độ hiếm dùng cho viền/nền */
  elementColor?: string;
  sizes?: string;
}

const SIZE_MAP: Record<"xs" | "sm" | "md" | "lg" | "xl" | "2xl", { class: string; px: string }> = {
  xs: { class: "w-6 h-6", px: "24px" },
  sm: { class: "w-8 h-8", px: "32px" },
  md: { class: "w-12 h-12", px: "48px" },
  lg: { class: "w-16 h-16", px: "64px" },
  xl: { class: "w-24 h-24", px: "96px" },
  "2xl": { class: "w-32 h-32", px: "128px" },
};

/**
 * Component hình ảnh dùng chung cho mọi thực thể dữ liệu trong LEIBO.
 *
 * Thực thi nguyên tắc chỉ đạo:
 * 1. Dữ liệu nào có hình ảnh đại diện chính thức thì phải ưu tiên hiển thị hình ảnh đó.
 * 2. Fallback đúng loại ảnh: Entity Icon -> Canonical Local Asset -> Category Placeholder.
 * 3. Tuyệt đối KHÔNG gán ảnh chéo giữa các entity (không lấy ảnh nhân vật khác hay vũ khí khác).
 * 4. Tự động kiểm soát tỷ lệ (Aspect Ratio) và kích thước chống CLS (Cumulative Layout Shift).
 */
export function EntityVisual({
  entityType,
  entityId,
  imageType,
  alt,
  label,
  initialSrc,
  fallbackSrcs = [],
  size = "md",
  aspectRatio,
  fit,
  piece,
  priority = false,
  unoptimized,
  className = "",
  wrapperClassName = "",
  elementColor,
  sizes,
}: EntityVisualProps) {
  // 1. Xác định imageType mặc định theo entityType
  const resolvedImageType: EntityImageType =
    imageType ??
    (entityType === "version"
      ? "keyArt"
      : piece
        ? "piece"
        : "icon");

  // 2. Tính toán đường dẫn cục bộ quy chuẩn (Canonical Local Path)
  const canonicalLocalPath = useMemo(() => {
    try {
      const category: AssetCategory =
        entityType === "enemy" ? "character" : (entityType as AssetCategory);
      const assetType: AssetType =
        resolvedImageType === "piece" ? "piece" : (resolvedImageType as AssetType);
      return getCanonicalAssetPath(category, entityId, assetType, { piece });
    } catch {
      return null;
    }
  }, [entityType, entityId, resolvedImageType, piece]);

  // 3. Chuỗi ứng viên fallback có trật tự nghiêm ngặt (Order of Precedence)
  const candidates = useMemo(() => {
    const list: string[] = [];
    if (initialSrc) list.push(initialSrc);
    if (canonicalLocalPath && !list.includes(canonicalLocalPath)) {
      list.push(canonicalLocalPath);
    }
    for (const fb of fallbackSrcs) {
      if (fb && !list.includes(fb)) list.push(fb);
    }
    return list;
  }, [initialSrc, canonicalLocalPath, fallbackSrcs]);

  // 4. Xác định object-fit phù hợp
  const resolvedFit =
    fit ??
    (resolvedImageType === "splash" || resolvedImageType === "keyArt"
      ? "cover"
      : entityType === "character" && resolvedImageType === "icon"
        ? "cover"
        : "contain");

  // 5. Xác định tỷ lệ khung hình
  const resolvedAspect =
    aspectRatio ??
    (resolvedImageType === "splash"
      ? "portrait"
      : resolvedImageType === "keyArt"
        ? "landscape"
        : "square");

  const aspectClass =
    resolvedAspect === "portrait"
      ? "aspect-[3/4]"
      : resolvedAspect === "landscape"
        ? "aspect-[16/9]"
        : resolvedAspect === "square"
          ? "aspect-square"
          : "";

  const sizeClass = size === "fill" ? "w-full h-full" : size === "custom" ? "" : SIZE_MAP[size].class;
  const computedSizes = sizes ?? (size === "fill" ? "100vw" : size === "custom" ? "48px" : SIZE_MAP[size].px);

  // 6. Placeholder đặc trưng theo từng loại thực thể (Entity-Type SVG Silhouette)
  const renderPlaceholder = () => {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center p-1 text-text-muted/60 select-none bg-bg-elevated/40"
        title={label || alt || entityId}
      >
        {entityType === "character" && (
          <svg className="w-1/2 h-1/2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        )}
        {entityType === "weapon" && (
          <svg className="w-1/2 h-1/2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-10.5m0 0l3 3m-3-3l-7.5 7.5m7.5-7.5l3 3m-3-3l-4.5 4.5m4.5-4.5L18 7.5m2.25 2.25l-1.5 1.5m0 0l-7.5 7.5m0 0l-1.5 1.5m-3-3l1.5-1.5m-1.5 1.5L3 21" />
          </svg>
        )}
        {entityType === "artifact" && (
          <svg className="w-1/2 h-1/2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        )}
        {entityType === "material" && (
          <svg className="w-1/2 h-1/2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
          </svg>
        )}
        {entityType === "domain" && (
          <svg className="w-1/2 h-1/2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h6M9 10.5h6M9 14.25h6" />
          </svg>
        )}
        {entityType === "version" && (
          <svg className="w-1/2 h-1/2 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        )}
        {entityType === "element" && (
          <div className="w-3 h-3 rounded-full border border-current opacity-40" />
        )}
      </div>
    );
  };

  return (
    <div
      className={`relative shrink-0 overflow-hidden ${sizeClass} ${aspectClass} ${wrapperClassName}`}
      style={
        elementColor
          ? { borderColor: `color-mix(in srgb, ${elementColor} 45%, var(--border-color))` }
          : undefined
      }
    >
      <SafeImage
        src={candidates[0]}
        fallbackSrcs={candidates.slice(1)}
        alt={alt}
        fill
        sizes={computedSizes}
        priority={priority}
        unoptimized={unoptimized}
        className={`${
          resolvedFit === "cover" ? "object-cover" : "object-contain p-0.5"
        } ${className}`}
        fallback={renderPlaceholder()}
      />
    </div>
  );
}
