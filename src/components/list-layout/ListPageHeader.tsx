import type { ReactNode } from "react";

interface ListPageHeaderProps {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  totalCount?: number;
  countLabel?: string;
  badge?: ReactNode;
  actions?: ReactNode;
}

/**
 * Phần tiêu đề thống nhất cho toàn bộ trang danh sách LEIBO.
 * Bao gồm: Biểu tượng thực thể, Tên trang (H1), Mô tả, Badge đếm tổng số, và Actions tùy chọn.
 */
export function ListPageHeader({
  icon,
  title,
  description,
  totalCount,
  countLabel,
  badge,
  actions,
}: ListPageHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-border/40">
      <div className="space-y-1.5 max-w-3xl">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-accent-500/10 border border-accent-500/20 text-accent-bright flex items-center justify-center shrink-0 shadow-sm">
              {icon}
            </div>
          )}
          <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-text-primary">
            {title}
          </h1>
          {typeof totalCount === "number" && (
            <span
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-bg-elevated text-accent-bright border border-border tabular-nums shadow-sm"
              title={countLabel ? `${countLabel}: ${totalCount}` : `Tổng số: ${totalCount}`}
            >
              {totalCount}
            </span>
          )}
          {badge}
        </div>

        {description && (
          <div className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {description}
          </div>
        )}
      </div>

      {actions && (
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
}
