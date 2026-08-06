
import Link from "next/link";

interface PaginationProps {
  page: number;
  totalPages: number;
  /** Build query string cho 1 trang cụ thể — thường là hàm `buildQuery` đã có sẵn ở mỗi trang list (giữ nguyên filter hiện tại, chỉ đổi `page`). */
  buildHref: (page: number) => string;
}

/**
 * Thanh phân trang dùng chung cho /characters, /weapons, /artifacts —
 * Server Component thuần (chỉ <Link>, không cần "use client") vì điều
 * hướng trang chỉ là đổi query string qua GET, không cần state phía client.
 *
 * Không render gì khi chỉ có 1 trang — tránh 1 thanh phân trang trống/thừa
 * hiện ra mỗi khi bộ lọc thu hẹp kết quả xuống dưới 1 trang.
 */
export function Pagination({ page, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <nav
      aria-label="Điều hướng trang"
      className="flex items-center justify-center gap-2 mt-10 text-sm"
    >
      <PageLink
        href={buildHref(page - 1)}
        disabled={prevDisabled}
        label="Trang trước"
      >
        &larr; Trước
      </PageLink>

      <span className="px-3 py-1.5 text-secondary">
        Trang <span className="text-gold-bright font-semibold">{page}</span> / {totalPages}
      </span>

      <PageLink
        href={buildHref(page + 1)}
        disabled={nextDisabled}
        label="Trang sau"
      >
        Sau &rarr;
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string;
  disabled: boolean;
  label: string;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span
        aria-label={label}
        aria-disabled="true"
        className="px-3 py-1.5 rounded-full border border-border text-muted cursor-not-allowed opacity-50"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      aria-label={label}
      className="px-3 py-1.5 rounded-full border border-border bg-card/60 hover:border-gold/50 text-primary transition-all"
    >
      {children}
    </Link>
  );
}
