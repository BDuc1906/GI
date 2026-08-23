import Link from "next/link";
import { getTranslations } from "next-intl/server";

interface PaginationProps {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

// Server Component (không "use client") render bên trong cây [locale] đã
// gọi setRequestLocale(locale) ở trang cha — getTranslations() không cần
// tham số locale tường minh vẫn lấy đúng ngôn ngữ hiện tại của request.
export async function Pagination({ page, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const t = await getTranslations("Pagination");
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <nav aria-label={t("navLabel")} className="flex items-center justify-center gap-2 mt-10 text-sm">
      <PageLink href={buildHref(page - 1)} disabled={prevDisabled} label={t("prevLabel")}>
        &larr; {t("prev")}
      </PageLink>

      <span className="px-3 py-1.5 text-text-secondary tabular-nums">
        {t.rich("pageOf", {
          page,
          totalPages,
          b: (chunks) => <span className="text-accent-bright font-semibold">{chunks}</span>,
        })}
      </span>

      <PageLink href={buildHref(page + 1)} disabled={nextDisabled} label={t("nextLabel")}>
        {t("next")} &rarr;
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
      <span aria-label={label} aria-disabled="true" className="px-3 py-1.5 rounded-full border border-border text-text-muted cursor-not-allowed opacity-50">
        {children}
      </span>
    );
  }

  return (
    <Link href={href} aria-label={label} className="px-3 py-1.5 rounded-full border border-border bg-bg-card hover:border-border-strong text-text-primary transition-all">
      {children}
    </Link>
  );
}