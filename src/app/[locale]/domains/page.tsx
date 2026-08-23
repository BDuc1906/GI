import Link from "next/link";
import { Prisma } from "@prisma/client";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { SafeImage } from "@/components/SafeImage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { Pagination } from "@/components/Pagination";
import { LIST_PAGE_SIZE, parsePageParam, totalPagesFor } from "@/lib/pagination";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Domains" });
  return { title: t("metaTitle"), description: t("metaDescription") };
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

  const [domains, total] = await Promise.all([
    prisma.domain.findMany({
      where,
      orderBy: [{ category: "asc" }, { name: "asc" }],
      skip: (page - 1) * LIST_PAGE_SIZE,
      take: LIST_PAGE_SIZE,
      select: { id: true, name: true, category: true, regionName: true, imageUrl: true, imageUrlOriginal: true },
    }),
    prisma.domain.count({ where }),
  ]);
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

      <div className="surface-glass border border-border rounded-xl mb-8 px-4">
        <div className="flex items-start gap-3 py-2.5">
          <span className="text-xs text-text-muted font-medium w-24 shrink-0 pt-1.5">{t("filterCategory")}</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const isActive = category === c;
              return (
                <Link
                  key={c}
                  href={`/domains?${buildQuery({ category: isActive ? undefined : c })}`}
                  aria-pressed={isActive}
                  className="chip px-2.5 py-1 rounded-full text-xs"
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {domains.map((d) => (
            <Link key={d.id} href={`/domains/${d.id}`} className="surface-card overflow-hidden group flex gap-3 p-3">
              <div className="relative w-16 h-16 shrink-0 rounded-lg bg-bg-elevated overflow-hidden">
                {d.imageUrl ? (
                  <SafeImage
                    src={d.imageUrl}
                    fallbackSrcs={[d.imageUrlOriginal]}
                    alt={d.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted text-[10px]">—</div>
                )}
              </div>
              <div className="min-w-0 flex flex-col justify-center">
                <div className="text-eyebrow mb-1">{CATEGORY_LABEL[d.category] ?? d.category}</div>
                <div className="font-semibold truncate text-text-primary group-hover:text-accent-bright transition-colors text-sm">
                  {d.name}
                </div>
                {d.regionName && <div className="text-xs text-text-muted mt-0.5">{d.regionName}</div>}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} buildHref={buildPageHref} />
    </div>
  );
}
