import { EntityGrid, type EntityGridVariant } from "./EntityGrid";

interface ListLoadingSkeletonProps {
  count?: number;
  variant?: EntityGridVariant;
  className?: string;
}

/**
 * Skeleton loading hiển thị tức thì khi tải trang danh sách.
 * Kích thước và tỉ lệ thẻ khớp 100% với Card thật, triệt tiêu hiện tượng Layout Shift (CLS).
 */
export function ListLoadingSkeleton({
  count = 24,
  variant = "character",
  className = "",
}: ListLoadingSkeletonProps) {
  return (
    <EntityGrid variant={variant} className={className}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`skeleton-${index}`}
          className="flex flex-col h-full rounded-2xl border border-border/60 bg-bg-card/50 overflow-hidden animate-pulse"
        >
          {/* Vùng ảnh */}
          <div
            className={`w-full bg-bg-elevated/80 ${
              variant === "character"
                ? "aspect-[3/4]"
                : variant === "compact"
                ? "aspect-square"
                : "aspect-[16/9]"
            }`}
          />

          {/* Vùng thông tin bên dưới */}
          <div className="p-3 space-y-2 flex-1 flex flex-col justify-between bg-bg-card/90">
            <div className="space-y-1.5">
              <div className="h-3.5 bg-bg-elevated rounded w-4/5 mx-auto" />
              <div className="h-3 bg-bg-elevated/60 rounded w-1/2 mx-auto" />
            </div>

            <div className="pt-2 border-t border-border/30 flex items-center justify-center gap-1">
              <div className="h-2.5 bg-bg-elevated/70 rounded w-16" />
            </div>
          </div>
        </div>
      ))}
    </EntityGrid>
  );
}
