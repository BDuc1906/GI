import { Link } from "@/i18n/navigation";
import { SafeImage } from "@/components/ui/SafeImage";

export interface SimilarListItem {
  id: string;
  href: string;
  name: string;
  iconUrl: string | null;
  iconUrlOriginal?: string | null;
  meta: string;
  shared?: string | null;
  round?: boolean;
}

export function SimilarList({ items }: { items: SimilarListItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className="group flex items-center gap-3 rounded-xl border border-border bg-bg-elevated p-3 transition-colors hover:border-accent-500/70 hover:bg-bg-surface"
        >
          <span
            className={`relative block shrink-0 overflow-hidden border border-border bg-bg-base ${item.round ? "h-12 w-12 rounded-full" : "h-12 w-12 rounded-lg"}`}
          >
            {item.iconUrl ? (
              <SafeImage
                src={item.iconUrl}
                alt={item.name}
                fill
                className="object-cover"
                sizes="48px"
                fallbackSrcs={item.iconUrlOriginal ? [item.iconUrlOriginal] : undefined}
              />
            ) : null}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-medium text-text-primary">{item.name}</span>
            <span className="block truncate text-xs text-text-muted">{item.meta}</span>
            {item.shared ? <span className="block text-[11px] text-accent">{item.shared}</span> : null}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function SimilarNote() {
  return (
    <p className="mt-3 text-xs text-text-muted">
      Gợi ý này giúp bạn tìm nhân vật có cùng nguyên tố hoặc kỹ năng tương đồng khi bạn chưa sở hữu lựa chọn ban đầu.
    </p>
  );
}
