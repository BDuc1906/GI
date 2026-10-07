import { unstable_cache } from "next/cache";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { Pagination } from "@/components/ui/Pagination";
import { LoreCard } from "@/components/lore/LoreCard";
import { LIST_PAGE_SIZE, parsePageParam, totalPagesFor } from "@/lib/ui/pagination";
import { createStaticPageMetadata } from "@/lib/seo/metadata";
import { EntityThumb } from "@/components/ui/EntityThumb";
import { imageFor } from "@/lib/game/image-urls";
import geographyImages from "@/data/images/geography.json";
import { normalizeSearch } from "@/lib/game/enemy-format";

export const dynamic = "force-dynamic";

interface GeographyPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; q?: string; region?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createStaticPageMetadata(locale, "geography");
}

interface GeoRaw {
  description?: string;
  sortOrder?: number;
  showOnlyUnlocked?: boolean;
}

/** Cache 1 giờ — toàn bộ ~270 mục, lọc/phân trang ở server. */
const getAllGeography = unstable_cache(
  async () => {
    const rows = await prisma.geography.findMany({
      select: { id: true, name: true, areaName: true, regionId: true, regionName: true, raw: true },
    });
    return rows
      .map((r) => {
        const raw = (r.raw ?? {}) as GeoRaw;
        return {
          id: r.id,
          name: r.name,
          areaName: r.areaName,
          regionId: r.regionId,
          regionName: r.regionName ?? "Khác",
          description: raw.description ?? "",
          sortOrder: raw.sortOrder ?? 0,
          onlyUnlocked: Boolean(raw.showOnlyUnlocked),
        };
      })
      .sort(
        (a, b) =>
          Number(a.regionId ?? 999) - Number(b.regionId ?? 999) ||
          a.sortOrder - b.sortOrder ||
          a.name.localeCompare(b.name)
      );
  },
  ["geography-all-v1"],
  { revalidate: 3600 }
);

export default async function GeographyPage({ params, searchParams }: GeographyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const page = parsePageParam(sp.page);
  const q = (sp.q ?? "").trim();
  const region = (sp.region ?? "").trim();

  const all = await getAllGeography();

  // Danh sách vùng theo thứ tự trong game (regionId tăng dần) kèm số mục.
  const regionList: Array<{ name: string; count: number }> = [];
  for (const g of all) {
    const found = regionList.find((r) => r.name === g.regionName);
    if (found) found.count += 1;
    else regionList.push({ name: g.regionName, count: 1 });
  }

  const query = normalizeSearch(q);
  const filtered = all.filter((g) => {
    if (region && g.regionName !== region) return false;
    if (!query) return true;
    return [g.name, g.areaName ?? "", g.description].some((t) => normalizeSearch(t).includes(query));
  });

  const totalPages = totalPagesFor(filtered.length);
  const pageItems = filtered.slice((page - 1) * LIST_PAGE_SIZE, page * LIST_PAGE_SIZE);

  const href = (next: { region?: string; page?: number }) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    const r = "region" in next ? next.region : region;
    if (r) p.set("region", r);
    if (next.page && next.page > 1) p.set("page", String(next.page));
    const s = p.toString();
    return s ? `/geography?${s}` : "/geography";
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
        <h1 className="font-display text-4xl font-bold text-text-primary mb-4">Địa lý</h1>
        <p className="text-text-secondary mb-6 max-w-3xl">
          {all.length} mục địa danh trong sách tra cứu của game, kèm mô tả lore. Mô tả hiện bằng tiếng Anh.
        </p>

        <form action="" method="get" role="search" className="flex gap-2 mb-5 max-w-md">
          {region && <input type="hidden" name="region" value={region} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Tìm địa danh hoặc nội dung mô tả..."
            aria-label="Tìm địa danh"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg-input text-text-primary placeholder:text-text-muted"
          />
          <button type="submit" className="btn-primary px-4 py-2 rounded-lg">
            Tìm
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mb-6" aria-label="Lọc theo vùng">
          <Link href={href({ region: "" })} className={chip(!region)}>
            Tất cả ({all.length})
          </Link>
          {regionList.map((r) => (
            <Link key={r.name} href={href({ region: r.name })} className={chip(region === r.name)}>
              {r.name} ({r.count})
            </Link>
          ))}
        </div>

        <p className="text-sm text-text-muted mb-4" aria-live="polite">
          {filtered.length} mục{totalPages > 1 ? ` · trang ${page}/${totalPages}` : ""}
        </p>

        {pageItems.length === 0 ? (
          <p className="text-text-secondary">Không có địa danh nào khớp.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pageItems.map((g) => (
              <li key={g.id}>
                <LoreCard
                  name={g.name}
                  banner={
                    <EntityThumb
                      candidates={imageFor(geographyImages, g.id)}
                      alt={g.name}
                      size="banner"
                      fit="cover"
                    />
                  }
                  subtitle={[g.regionName, g.areaName].filter(Boolean).join(" · ")}
                  badges={
                    g.onlyUnlocked
                      ? [{ label: "Mục mở khoá", title: "Nguồn dữ liệu đánh dấu showOnlyUnlocked" }]
                      : undefined
                  }
                  description={g.description}
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
