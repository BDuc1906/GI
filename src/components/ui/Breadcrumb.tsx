import { Link } from "@/i18n/navigation";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className = "" }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-2 mb-6 text-sm ${className}`}
    >
      <ol className="flex items-center gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-2">
            {item.href ? (
              <Link
                href={item.href}
                className="text-text-secondary hover:text-accent-bright transition-colors underline-offset-2 hover:underline"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-text-primary font-medium">{item.label}</span>
            )}
            {index < items.length - 1 && (
              <span aria-hidden className="text-text-muted">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
