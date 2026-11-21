import type { ReactNode } from "react";

export type EntityGridVariant = "character" | "compact" | "detailed";

interface EntityGridProps {
  children: ReactNode;
  variant?: EntityGridVariant;
  className?: string;
  id?: string;
}

/**
 * Hệ thống lưới (CSS Grid) tự thích ứng theo độ rộng màn hình.
 * Tuân thủ nghiêm ngặt LEIBO List Page Design Specification v1.0:
 * - 320-374px: 2 cột
 * - 375-639px: 2-3 cột
 * - 640-767px: 3-4 cột
 * - 768-1023px: 4-5 cột
 * - 1024-1279px: 5-6 cột
 * - 1280-1439px: 6-7 cột
 * - >=1440px: Tối đa 8 cột (Loại bỏ triệt để tình trạng nhồi nhét 10 cột)
 */
export function EntityGrid({
  children,
  variant = "character",
  className = "",
  id,
}: EntityGridProps) {
  let gridVariantClasses = "";

  switch (variant) {
    case "character":
      // Chuẩn cho thẻ dọc tỉ lệ ~3:4 / ~4:5
      gridVariantClasses =
        "grid grid-cols-2 min-[420px]:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 min-[920px]:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-4";
      break;
    case "compact":
      // Chuẩn cho vũ khí, thánh di vật, nguyên liệu
      gridVariantClasses =
        "grid grid-cols-2 min-[420px]:grid-cols-3 sm:grid-cols-3 md:grid-cols-4 min-[920px]:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 sm:gap-3.5";
      break;
    case "detailed":
      // Chuẩn cho kẻ địch, bí cảnh (card nội dung rộng hơn)
      gridVariantClasses =
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-4";
      break;
  }

  return (
    <div id={id} className={`w-full ${gridVariantClasses} ${className}`}>
      {children}
    </div>
  );
}
