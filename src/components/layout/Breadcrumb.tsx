import Link from "next/link";

interface Crumb {
  name: string;
  /** Đường dẫn tương đối, vd "/weapons" — dùng chung format với BreadcrumbJsonLd. */
  path: string;
}

/**
 * Breadcrumb HIỂN THỊ (khác BreadcrumbJsonLd — component đó chỉ sinh
 * <script type="application/ld+json"> cho Google, không render UI nào).
 * Dùng chung 1 mảng `items` cho cả 2 component ở trang gọi, tránh định
 * nghĩa đường dẫn 2 lần lệch nhau.
 */
export function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4 text-xs text-text-muted flex items-center gap-1.5 flex-wrap">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={item.path} className="flex items-center gap-1.5">
            {index > 0 && (
              <span aria-hidden className="text-text-muted">
                /
              </span>
            )}
            {isLast ? (
              <span className="text-text-secondary" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link href={item.path} className="hover:text-text-primary transition-colors">
                {item.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
