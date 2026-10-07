import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { Pagination } from "@/components/ui/Pagination";
import { EntityThumb } from "@/components/ui/EntityThumb";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { LIST_PAGE_SIZE, parsePageParam, totalPagesFor } from "@/lib/ui/pagination";
import { createStaticPageMetadata } from "@/lib/seo/metadata";
import { normalizeSearch } from "@/core/game/enemy-format";

export const dynamic = "force-dynamic";

interface CraftsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; q?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createStaticPageMetadata(locale, "crafts");
}

interface RecipeItem {
  name: string;
  count?: number;
}

export default async function CraftsPage({ params, searchParams }: CraftsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const page = parsePageParam(sp.page);
  const q = (sp.q ?? "").trim();

  const all = await withDbRetry(() =>
    prisma.craft.findMany({
      select: { id: true, name: true, unlockRank: true, moraCost: true, resultCount: true, raw: true },
      orderBy: [{ unlockRank: "asc" }, { name: "asc" }],
    })
  );

  const query = normalizeSearch(q);
  const filtered = query ? all.filter((c) => normalizeSearch(c.name).includes(query)) : all;
  const totalPages = totalPagesFor(filtered.length);
  const items = filtered.slice((page - 1) * LIST_PAGE_SIZE, page * LIST_PAGE_SIZE);

  const recipeOf = (raw: unknown): RecipeItem[] =>
    (((raw as { recipe?: RecipeItem[] } | null)?.recipe ?? []) as RecipeItem[]).filter((r) => r?.name);

  // Ảnh lấy từ bảng Material: vật phẩm tạo ra và từng nguyên liệu trong công thức (khớp theo tên).
  const names = Array.from(new Set(items.flatMap((c) => [c.name, ...recipeOf(c.raw).map((r) => r.name)])));
  const materials = names.length
    ? await withDbRetry(() =>
        prisma.material.findMany({
          where: { name: { in: names } },
          select: { id: true, name: true, nameTranslations: true, iconUrl: true, iconUrlOriginal: true },
        })
      )
    : [];
  const matByName = new Map(materials.map((m) => [m.name, m]));
  const iconOf = (name: string) => {
    const m = matByName.get(name);
    return m ? [m.iconUrl, m.iconUrlOriginal].filter((u): u is string => Boolean(u)) : [];
  };

  const href = (n: number) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (n > 1) p.set("page", String(n));
    const s = p.toString();
    return s ? `/crafts?${s}` : "/crafts";
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-4">Công thức chế tạo</h1>
        <p className="text-text-secondary mb-6">
          Danh sách công thức chế tạo (Adventurer Handbook) — tổng {all.length} mục.
        </p>

        <form action="" method="get" role="search" className="flex gap-2 mb-6 max-w-md">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Tìm công thức..."
            aria-label="Tìm công thức"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg-input text-text-primary placeholder:text-text-muted"
          />
          <button type="submit" className="btn-primary px-4 py-2 rounded-lg">
            Tìm
          </button>
        </form>

        <p className="text-sm text-text-muted mb-4" aria-live="polite">
          {filtered.length} công thức{totalPages > 1 ? ` · trang ${page}/${totalPages}` : ""}
        </p>

        {items.length === 0 ? (
          <p className="text-text-secondary">Không có công thức nào khớp.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((craft) => {
              const result = matByName.get(craft.name);
              const recipe = recipeOf(craft.raw);
              const title = result ? getLocalizedName(result, locale) : craft.name;
              return (
                <li key={craft.id}>
                  <article className="h-full bg-bg-card border-2 border-border rounded-xl p-4 hover:border-accent-500 transition-all">
                    <div className="flex items-start gap-3 mb-3">
                      <EntityThumb candidates={iconOf(craft.name)} alt={title} size="md" />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-text-primary">
                          {result ? (
                            <Link href={`/materials/${result.id}`} className="hover:text-accent-bright">
                              {title}
                            </Link>
                          ) : (
                            title
                          )}
                        </h3>
                        <div className="space-y-0.5 text-xs text-text-secondary mt-1">
                          {craft.unlockRank != null && <div>Mở khoá: Cấp phiêu lưu {craft.unlockRank}</div>}
                          {craft.moraCost != null && (
                            <div>Chi phí: {craft.moraCost.toLocaleString("vi-VN")} Mora</div>
                          )}
                          {craft.resultCount != null && craft.resultCount > 1 && (
                            <div>Số lượng: ×{craft.resultCount}</div>
                          )}
                        </div>
                      </div>
                    </div>
                    {recipe.length > 0 && (
                      <ul className="flex flex-wrap gap-2" aria-label="Nguyên liệu">
                        {recipe.map((r) => (
                          <li
                            key={r.name}
                            title={r.name}
                            className="flex items-center gap-1.5 pr-2 rounded-full border border-border text-xs text-text-secondary"
                          >
                            <EntityThumb candidates={iconOf(r.name)} alt={r.name} size="sm" round className="!w-7 !h-7" />
                            {typeof r.count === "number" ? `× ${r.count}` : ""}
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                </li>
              );
            })}
          </ul>
        )}

        <Pagination page={page} totalPages={totalPages} buildHref={href} />
      </div>
    </div>
  );
}
