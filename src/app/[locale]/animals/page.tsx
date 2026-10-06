import { unstable_cache } from "next/cache";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { Pagination } from "@/components/ui/Pagination";
import { LoreCard } from "@/components/lore/LoreCard";
import { LIST_PAGE_SIZE, parsePageParam, totalPagesFor } from "@/lib/ui/pagination";
import { createStaticPageMetadata } from "@/lib/seo/metadata";
import { normalizeSearch } from "@/lib/game/enemy-format";

export const dynamic = "force-dynamic";

interface AnimalsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; q?: string; cat?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createStaticPageMetadata(locale, "animals");
}

// Nhãn tiếng Việt do dự án tự đặt (không phải bản địa hoá chính thức); giữ tên gốc ở title.
const CATEGORY_LABEL: Record<string, string> = {
  Fish: "Cá",
  Beasts: "Thú",
  Birds: "Chim",
  Other: "Khác",
};

interface AnimalRaw {
  description?: string;
  sortOrder?: number;
}

/** Cache 1 giờ — toàn bộ ~220 loài, lọc/phân trang ở server. */
const getAllAnimals = unstable_cache(
  async () => {
    const rows = await prisma.animal.findMany({
      select: { id: true, name: true, categoryType: true, categoryText: true, sortOrder: true, raw: true },
    });
    return rows
      .map((r) => {
        const raw = (r.raw ?? {}) as AnimalRaw;
        return {
          id: r.id,
          name: r.name,
          category: r.categoryText || r.categoryType || "Other",
          description: raw.description ?? "",
          sortOrder: r.sortOrder ?? raw.sortOrder ?? 0,
        };
      })
      .sort(
        (a, b) =>
          a.category.localeCompare(b.category) || a.sortOrder - b.sortOrder || a.name.localeCompare(b.name)
      );
  },
  ["animals-all-v1"],
  { revalidate: 3600 }
);

export default async function AnimalsPage({ params, searchParams }: AnimalsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const page = parsePageParam(sp.page);
  const q = (sp.q ?? "").trim();
  const cat = (sp.cat ?? "").trim();

  const all = await getAllAnimals();

  const categories: Array<{ name: string; count: number }> = [];
  for (const a of all) {
    const found = categories.find((c) => c.name === a.category);
    if (found) found.count += 1;
    else categories.push({ name: a.category, count: 1 });
  }

  const query = normalizeSearch(q);
  const filtered = all.filter((a) => {
    if (cat && a.category !== cat) return false;
    if (!query) return true;
    return [a.name, a.description].some((t) => normalizeSearch(t).includes(query));
  });

  const totalPages = totalPagesFor(filtered.length);
  const pageItems = filtered.slice((page - 1) * LIST_PAGE_SIZE, page * LIST_PAGE_SIZE);

  const href = (next: { cat?: string; page?: number }) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    const c = "cat" in next ? next.cat : cat;
    if (c) p.set("cat", c);
    if (next.page && next.page > 1) p.set("page", String(next.page));
    const s = p.toString();
    return s ? `/animals?${s}` : "/animals";
  };

  const chip = (active: boolean) =>
    `px-3 py-1 rounded-full border text-sm transition-colors ${
      active
        ? "bg-bg-elevated border-accent-500 text-accent-bright font-semibold"
        : "border-border text-text-secondary hover:border-accent-500 hover:text-accent-bright"
    }`;

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-4">Động vật &amp; Sinh vật</h1>
        <p className="text-text-secondary mb-6 max-w-3xl">
          {all.length} loài động vật trong thế giới mở, kèm mô tả lore. Mô tả hiện bằng tiếng Anh.
        </p>

        <form action="" method="get" role="search" className="flex gap-2 mb-5 max-w-md">
          {cat && <input type="hidden" name="cat" value={cat} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Tìm loài hoặc nội dung mô tả..."
            aria-label="Tìm động vật"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg-input text-text-primary placeholder:text-text-muted"
          />
          <button type="submit" className="btn-primary px-4 py-2 rounded-lg">
            Tìm
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mb-6" aria-label="Lọc theo nhóm">
          <Link href={href({ cat: "" })} className={chip(!cat)}>
            Tất cả ({all.length})
          </Link>
          {categories.map((c) => (
            <Link key={c.name} href={href({ cat: c.name })} title={c.name} className={chip(cat === c.name)}>
              {CATEGORY_LABEL[c.name] ?? c.name} ({c.count})
            </Link>
          ))}
        </div>

        <p className="text-sm text-text-muted mb-4" aria-live="polite">
          {filtered.length} loài{totalPages > 1 ? ` · trang ${page}/${totalPages}` : ""}
        </p>

        {pageItems.length === 0 ? (
          <p className="text-text-secondary">Không có loài nào khớp.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageItems.map((a) => (
              <li key={a.id}>
                <LoreCard
                  name={a.name}
                  badges={[{ label: CATEGORY_LABEL[a.category] ?? a.category, title: a.category }]}
                  description={a.description}
                />
              </li>
            ))}
          </ul>
        )}

        <Pagination page={page} totalPages={totalPages} buildHref={(n) => href({ page: n })} />
      </div>
    </div>
  );
}
