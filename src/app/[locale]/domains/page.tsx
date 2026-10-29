
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { SafeImage } from "@/components/ui/SafeImage";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { Pagination } from "@/components/ui/Pagination";
import { LIST_PAGE_SIZE, parsePageParam, totalPagesFor } from "@/lib/ui/pagination";
import type { Metadata } from "next";
import { withDbRetry } from "@/lib/db/db-retry";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { createLocalizedMetadata } from "@/lib/seo/metadata";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Domains" });
  return createLocalizedMetadata({
    locale,
    pathname: "domains",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
}

const CATEGORIES = ["artifact", "weapon", "talent"] as const;

export default async function DomainsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Domains" });

  const CATEGORY_LABEL: Record<string, string> = {
    artifact: t("categoryArtifact"),
    weapon: t("categoryWeapon"),
    talent: t("categoryTalent"),
  };

  const { category, q, page: pageRaw } = await searchParams;
  const page = parsePageParam(pageRaw);

  const where: Prisma.DomainWhereInput = {};
  if (category && CATEGORIES.includes(category as (typeof CATEGORIES)[number])) where.category = category;
  if (q) where.name = { contains: q, mode: "insensitive" };

  // BUG ĐÃ SỬA: cùng lớp lỗi P1017 "Server has closed the connection" ở
  // trang chủ/characters — bọc withDbRetry để chịu được đúng lúc Neon
  // free tier vừa suspend compute xong.
  const [domains, total] = await withDbRetry(() =>
    Promise.all([
      prisma.domain.findMany({
        where,
        orderBy: [{ category: "asc" }, { name: "asc" }],
        skip: (page - 1) * LIST_PAGE_SIZE,
        take: LIST_PAGE_SIZE,
        select: {
          id: true,
          name: true,
          nameTranslations: true,
          category: true,
          regionName: true,
          imageUrl: true,
          imageUrlOriginal: true,
          materials: true,
        },
      }),
      prisma.domain.count({ where }),
    ])
  );
  const totalPages = totalPagesFor(total);

  const buildQuery = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    if (category) sp.set("category", category);
    if (q) sp.set("q", q);
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v);
      else sp.delete(k);
    });
    return sp.toString();
  };
  const buildPageHref = (p: number) => `/domains?${buildQuery({ page: p > 1 ? String(p) : undefined })}`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: "LEIBO", path: "/" },
          { name: t("title"), path: "/domains" },
        ]}
      />

      <div className="mb-7">
        <h1 className="font-display text-display-2 font-semibold text-text-primary mb-2">{t("title")}</h1>
        <p className="text-sm text-text-secondary">
          {t.rich("foundCount", {
            count: total,
            b: (chunks) => <span className="text-accent-bright font-semibold tabular-nums">{chunks}</span>,
          })}
        </p>
      </div>

      <form method="GET" className="flex gap-2 mb-5">
        {category && <input type="hidden" name="category" value={category} />}
        <input
          type="text"
          name="q"
          defaultValue={q || ""}
          placeholder={t("searchPlaceholder")}
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm placeholder:text-text-muted focus:outline-none focus:border-border-strong transition-colors"
        />
        <button type="submit" className="btn-accent rounded-lg px-4 py-2 text-sm">
          {t("searchButton")}
        </button>
      </form>

      <div className="surface-glass border border-border rounded-xl mb-6 p-3 sm:px-4 sm:py-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
          <span className="text-xs text-text-muted font-medium shrink-0">{t("filterCategory")}</span>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {CATEGORIES.map((c) => {
              const isActive = category === c;
              return (
                <Link
                  key={c}
                  href={`/domains?${buildQuery({ category: isActive ? undefined : c })}`}
                  aria-pressed={isActive}
                  className="chip px-3 py-1 rounded-full text-xs"
                >
                  {CATEGORY_LABEL[c]}
                </Link>
              );
            })}
            {category && (
              <Link
                href={`/domains?${buildQuery({ category: undefined })}`}
                className="ml-2 text-xs text-text-muted hover:text-text-primary transition-colors underline underline-offset-2"
              >
                {t("clearAllFilters")}
              </Link>
            )}
          </div>
        </div>
      </div>

      {domains.length === 0 ? (
        <div className="text-center py-20 text-text-muted text-sm">
          {t("noResults")}{" "}
          <Link href="/domains" className="underline underline-offset-2 hover:text-text-primary">
            {t("clearFilters")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {domains.map((d) => {
            const rawMats = (d.materials as unknown as Array<{ name: string; artifactSetId?: string; materialId?: string }>) ?? [];
            const previewMats = rawMats.slice(0, 3);
            return (
              <Link
                key={d.id}
                href={`/domains/${d.id}`}
                className="surface-card rounded-2xl overflow-hidden group border border-border/60 hover:border-accent-500/70 transition-all duration-300 hover:shadow-xl flex flex-col"
              >
                {/* Art full ô - tràn viền phần trên thẻ */}
                <div className="relative w-full aspect-[16/9] sm:h-44 bg-bg-elevated overflow-hidden">
                  <SafeImage
                    src={d.imageUrl || "/local-genshin-assets/ui/domain.png"}
                    fallbackSrcs={[d.imageUrlOriginal, "/local-genshin-assets/ui/domain.png"]}
                    alt={getLocalizedName(d, locale)}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    fallback={
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src="/local-genshin-assets/ui/domain.png"
                        alt=""
                        className="w-12 h-12 object-contain opacity-70 m-auto mt-12"
                      />
                    }
                  />
                  {/* Lớp phủ gradient tối dần xuống dưới */}
                  <div className="absolute inset-0 bg-gradient-to-t from-bg-primary/90 via-bg-primary/20 to-black/25 pointer-events-none" />

                  {/* Huy hiệu danh mục & khu vực nổi trên ảnh */}
                  <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-2 pointer-events-none">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide bg-black/60 backdrop-blur-md text-accent-bright border border-white/10 uppercase">
                      {CATEGORY_LABEL[d.category] ?? d.category}
                    </span>
                    {d.regionName && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-black/50 backdrop-blur-md text-text-secondary border border-white/10">
                        {d.regionName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Nội dung thông tin bí cảnh */}
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h2 className="font-display font-semibold text-text-primary text-base group-hover:text-accent-bright transition-colors line-clamp-2">
                      {getLocalizedName(d, locale)}
                    </h2>
                  </div>

                  {previewMats.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40">
                      <span className="text-[11px] text-text-muted">Rớt:</span>
                      {previewMats.map((m, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] px-2 py-0.5 rounded-md bg-bg-elevated/80 border border-border/60 text-text-secondary truncate max-w-[140px]"
                        >
                          {m.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} buildHref={buildPageHref} />
    </div>
  );
}
