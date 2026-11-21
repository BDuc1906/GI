import type { ReactNode, CSSProperties } from "react";
import { Link } from "@/i18n/navigation";

interface BaseFilterChipProps {
  label: ReactNode;
  active?: boolean;
  icon?: ReactNode;
  count?: number;
  className?: string;
  style?: CSSProperties;
  size?: "sm" | "md";
  title?: string;
  type?: "button" | "submit";
}

interface LinkFilterChipProps extends BaseFilterChipProps {
  href: string;
  onClick?: never;
}

interface ButtonFilterChipProps extends BaseFilterChipProps {
  href?: never;
  onClick: () => void;
}

export type FilterChipProps = LinkFilterChipProps | ButtonFilterChipProps;

/**
 * Nút lọc chuẩn (Pill/Chip) dùng chung cho mọi bộ lọc trên LEIBO.
 * Tương thích cả SSR Next.js Link và tương tác client button.
 */
export function FilterChip({
  label,
  active = false,
  icon,
  count,
  className = "",
  style,
  size = "md",
  title,
  href,
  onClick,
  type = "button",
}: FilterChipProps) {
  const sizeClasses =
    size === "sm"
      ? "px-2.5 py-1 text-xs gap-1.5"
      : "px-3 py-1.5 text-xs sm:text-sm gap-2";

  const stateClasses = active
    ? "bg-accent-500 text-bg-primary font-semibold shadow-sm border-accent-500"
    : "bg-bg-elevated/70 text-text-secondary border-border hover:border-accent-500/50 hover:text-text-primary";

  const combinedClasses = `inline-flex items-center rounded-xl border transition-all duration-150 select-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent-500/30 ${sizeClasses} ${stateClasses} ${className}`;

  const content = (
    <>
      {icon && <span className="shrink-0 flex items-center justify-center">{icon}</span>}
      <span className="truncate">{label}</span>
      {typeof count === "number" && (
        <span
          className={`text-[11px] tabular-nums font-mono ${
            active ? "text-bg-primary/80 font-bold" : "text-text-muted"
          }`}
        >
          ({count})
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={combinedClasses}
        style={style}
        aria-pressed={active}
        title={title}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={combinedClasses}
      style={style}
      aria-pressed={active}
      title={title}
    >
      {content}
    </button>
  );
}
