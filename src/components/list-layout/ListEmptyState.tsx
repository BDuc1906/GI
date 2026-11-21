import type { ReactNode } from "react";
import { Link } from "@/i18n/navigation";

interface BaseEmptyStateProps {
  title?: string;
  description?: ReactNode;
  icon?: ReactNode;
  resetLabel?: string;
  className?: string;
}

interface LinkEmptyStateProps extends BaseEmptyStateProps {
  resetHref?: string;
  onReset?: never;
}

interface ButtonEmptyStateProps extends BaseEmptyStateProps {
  resetHref?: never;
  onReset?: () => void;
}

export type ListEmptyStateProps = LinkEmptyStateProps | ButtonEmptyStateProps;

/**
 * Trạng thái trống đồng bộ cho toàn bộ danh sách khi không có kết quả khớp với tìm kiếm/bộ lọc.
 */
export function ListEmptyState({
  title = "Không tìm thấy dữ liệu",
  description = "Không có mục nào khớp với bộ lọc hiện tại. Hãy thử tìm từ khóa khác hoặc đặt lại bộ lọc.",
  icon,
  resetLabel = "Đặt lại bộ lọc",
  resetHref,
  onReset,
  className = "",
}: ListEmptyStateProps) {
  const defaultIcon = (
    <svg
      className="w-12 h-12 text-text-muted/60"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
      />
    </svg>
  );

  return (
    <div
      className={`w-full py-16 px-6 text-center rounded-2xl border border-dashed border-border/80 bg-bg-card/40 backdrop-blur-sm flex flex-col items-center justify-center space-y-4 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="w-16 h-16 rounded-2xl bg-bg-elevated/70 border border-border flex items-center justify-center shadow-inner">
        {icon || defaultIcon}
      </div>

      <div className="space-y-1.5 max-w-md">
        <h3 className="text-base sm:text-lg font-semibold text-text-primary">
          {title}
        </h3>
        {description && (
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {(resetHref || onReset) && (
        <div className="pt-2">
          {resetHref ? (
            <Link
              href={resetHref}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-accent-500 text-bg-primary hover:bg-accent-bright transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500/40"
            >
              <span>↺</span>
              <span>{resetLabel}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-accent-500 text-bg-primary hover:bg-accent-bright transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-accent-500/40"
            >
              <span>↺</span>
              <span>{resetLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
