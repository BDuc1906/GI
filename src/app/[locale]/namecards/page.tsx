import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { Pagination } from "@/components/ui/Pagination";
import { EntityThumb } from "@/components/ui/EntityThumb";
import { LIST_PAGE_SIZE, parsePageParam, totalPagesFor } from "@/lib/ui/pagination";
import { createStaticPageMetadata } from "@/lib/seo/metadata";
import { normalizeSearch } from "@/core/game/enemy-format";
import { imageFor } from "@/core/game/image-urls";
import namecardIcons from "@/data/images/namecards.json";
import namecardBackgrounds from "@/data/images/namecard-backgrounds.json";

export const dynamic = "force-dynamic";

interface NamecardsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createStaticPageMetadata(locale, "namecards");
}

export default async function NamecardsPage({ params, searchParams }: NamecardsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const page = parsePageParam(sp.page);
  const q = (sp.q ?? "").trim();

  const all = await withDbRetry(() =>
    prisma.namecard.findMany({
      select: { id: true, name: true, source: true, version: true },
      orderBy: { name: "asc" },
    })
  );

  const query = normalizeSearch(q);
  const filtered = query
    ? all.filter((n) => [n.name, n.source ?? ""].some((t) => normalizeSearch(t).includes(query)))
    : all;
  const totalPages = totalPagesFor(filtered.length);
  const items = filtered.slice((page - 1) * LIST_PAGE_SIZE, page * LIST_PAGE_SIZE);

  const href = (n: number) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (n > 1) p.set("page", String(n));
    const s = p.toString();
    return s ? `/namecards?${s}` : "/namecards";
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-4">Danh thiếp</h1>
        <p className="text-text-secondary mb-6">
          Danh sách danh thiếp trong game — tổng {all.length} mẫu.
        </p>

        <form action="" method="get" role="search" className="flex gap-2 mb-6 max-w-md">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Tìm danh thiếp hoặc cách nhận..."
            aria-label="Tìm danh thiếp"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg-input text-text-primary placeholder:text-text-muted"
          />
          <button type="submit" className="btn-primary px-4 py-2 rounded-lg">
            Tìm
          </button>
        </form>

        <p className="text-sm text-text-muted mb-4" aria-live="polite">
          {filtered.length} mẫu{totalPages > 1 ? ` · trang ${page}/${totalPages}` : ""}
        </p>

        {items.length === 0 ? (
          <p className="text-text-secondary">Không có danh thiếp nào khớp.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((namecard) => (
              <li key={namecard.id}>
                <article className="h-full bg-bg-card border-2 border-border rounded-xl p-3 hover:border-accent-500 transition-all">
                  {/* Ưu tiên ảnh nền ngang; không có thì dùng icon danh thiếp */}
                  <EntityThumb
                    candidates={[
                      ...imageFor(namecardBackgrounds, namecard.id),
                      ...imageFor(namecardIcons, namecard.id),
                    ]}
                    alt={namecard.name}
                    size="banner"
                    fit="cover"
                    className="mb-3"
                  />
                  <h3 className="font-semibold text-text-primary mb-1">{namecard.name}</h3>
                  {namecard.source && (
                    <p className="text-sm text-text-secondary">{namecard.source}</p>
                  )}
                  {namecard.version && /^\d+\.\d+$/.test(namecard.version) ? (
                    <p className="text-xs text-text-muted mt-1">
                      <Link href={`/versions/${namecard.version}`} className="underline hover:text-accent-bright">
                        Phiên bản {namecard.version}
                      </Link>
                    </p>
                  ) : namecard.version ? (
                    <p className="text-xs text-text-muted mt-1">{namecard.version}</p>
                  ) : null}
                </article>
              </li>
            ))}
          </ul>
        )}

        <Pagination page={page} totalPages={totalPages} buildHref={href} />
      </div>
    </div>
  );
}
