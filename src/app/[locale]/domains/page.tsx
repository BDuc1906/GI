
import type { Metadata } from "next";
import Image from "next/image";
import { Prisma } from "@prisma/client";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { Pagination } from "@/components/ui/Pagination";
import { LIST_PAGE_SIZE, parsePageParam, totalPagesFor } from "@/lib/ui/pagination";
import {
  ListPageLayout,
  ListPageHeader,
  ListFilterToolbar,
  FilterChip,
  EntityGrid,
  ListEmptyState,
} from "@/components/list-layout";
import { DomainCard, type DomainMaterialReward } from "@/features/domains/components/DomainCard";

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
  searchParams: Promise<{ category?: string; region?: string; schedule?: string; q?: string; page?: string }>;
}

const CATEGORIES = ["artifact", "weapon", "talent", "trounce", "challenge"] as const;
const REGIONS = ["Mondstadt", "Liyue", "Inazuma", "Sumeru", "Fontaine", "Natlan"] as const;

export default async function DomainsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Domains" });

  const CATEGORY_LABEL: Record<string, string> = {
    artifact: t("categoryArtifact"),
    weapon: t("categoryWeapon"),
    talent: t("categoryTalent"),
    trounce: t("categoryTrounce"),
    challenge: t("categoryChallenge"),
  };

  const SCHEDULE_OPTIONS = [
    { id: "daily", label: t("scheduleDaily") },
    { id: "mon-thu", label: t("scheduleMonThu") },
    { id: "tue-fri", label: t("scheduleTueFri") },
    { id: "wed-sat", label: t("scheduleWedSat") },
  ] as const;

  const { category, region, schedule, q, page: pageRaw } = await searchParams;
  const page = parsePageParam(pageRaw);

  const where: Prisma.DomainWhereInput = {};
  if (category && CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    where.category = category;
  }
  if (region && REGIONS.includes(region as (typeof REGIONS)[number])) {
    where.regionName = region;
  }
  if (schedule) {
    if (schedule === "daily") {
      where.OR = [
        { daysOfWeek: { isEmpty: true } },
        { daysOfWeek: { hasEvery: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] } },
      ];
    } else if (schedule === "mon-thu") {
      where.daysOfWeek = { has: "Monday" };
    } else if (schedule === "tue-fri") {
      where.daysOfWeek = { has: "Tuesday" };
    } else if (schedule === "wed-sat") {
      where.daysOfWeek = { has: "Wednesday" };
    }
  }
  if (q) where.name = { contains: q, mode: "insensitive" };

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
          recommendedLevel: true,
        },
      }),
      prisma.domain.count({ where }),
    ])
  );
  const totalPages = totalPagesFor(total);

  const buildQuery = (paramsRecord: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    if (category) sp.set("category", category);
    if (region) sp.set("region", region);
    if (schedule) sp.set("schedule", schedule);
    if (q) sp.set("q", q);
    Object.entries(paramsRecord).forEach(([k, v]) => {
      if (v) sp.set(k, v);
      else sp.delete(k);
    });
    return sp.toString();
  };
  const buildPageHref = (p: number) => `/domains?${buildQuery({ page: p > 1 ? String(p) : undefined })}`;

  const activeCount = (category ? 1 : 0) + (region ? 1 : 0) + (schedule ? 1 : 0) + (q ? 1 : 0);

  const breadcrumbs = [
    { name: "LEIBO", path: "/" },
    { name: t("title"), path: "/domains" },
  ];

  const domainIcon = (
    <Image
      src="/local-genshin-assets/ui/domain.png"
      alt=""
      width={24}
      height={24}
      className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
    />
  );

  return (
    <ListPageLayout>
      <BreadcrumbJsonLd locale={locale} items={breadcrumbs} />

      <ListPageHeader
        icon={domainIcon}
        title={t("title")}
        description={t.rich("foundCount", {
          count: total,
          b: (chunks) => <span className="text-accent-bright font-semibold tabular-nums">{chunks}</span>,
        })}
        totalCount={total}
        countLabel={t("title")}
      />

      {/* Thanh tìm kiếm & bộ lọc */}
      <ListFilterToolbar
        activeCount={activeCount}
        clearHref="/domains"
        clearLabel={t("clearAllFilters")}
        mobileFilterLabel="Bộ lọc"
        searchSlot={
          <form method="GET" className="flex gap-2 w-full max-w-md">
            {category && <input type="hidden" name="category" value={category} />}
            {region && <input type="hidden" name="region" value={region} />}
            {schedule && <input type="hidden" name="schedule" value={schedule} />}
            <input
              type="text"
              name="q"
              defaultValue={q || ""}
              placeholder={t("searchPlaceholder")}
              className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-border bg-bg-elevated text-text-primary placeholder:text-text-muted focus:border-accent-500 focus:outline-none transition-colors"
            />
            <button type="submit" className="btn-accent px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shrink-0">
              {t("searchButton")}
            </button>
          </form>
        }
      >
        <div className="space-y-4 pt-2">
          {/* Hàng 1: Loại Bí Cảnh */}
          <div>
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
              {t("filterCategory")}:
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <FilterChip
                label="Tất cả"
                active={!category}
                href={`/domains?${buildQuery({ category: undefined, page: undefined })}`}
                size="sm"
              />
              {CATEGORIES.map((c) => {
                const isActive = category === c;
                return (
                  <FilterChip
                    key={c}
                    label={CATEGORY_LABEL[c]}
                    active={isActive}
                    href={`/domains?${buildQuery({ category: isActive ? undefined : c, page: undefined })}`}
                    size="sm"
                  />
                );
              })}
            </div>
          </div>

          {/* Hàng 2: Khu Vực / Quốc Gia */}
          <div>
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
              {t("filterRegion")}:
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <FilterChip
                label={t("regionAll")}
                active={!region}
                href={`/domains?${buildQuery({ region: undefined, page: undefined })}`}
                size="sm"
              />
              {REGIONS.map((r) => {
                const isActive = region === r;
                return (
                  <FilterChip
                    key={r}
                    label={r}
                    active={isActive}
                    href={`/domains?${buildQuery({ region: isActive ? undefined : r, page: undefined })}`}
                    size="sm"
                  />
                );
              })}
            </div>
          </div>

          {/* Hàng 3: Lịch Mở / Lịch Farm */}
          <div>
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
              {t("filterSchedule")}:
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              <FilterChip
                label={t("scheduleAll")}
                active={!schedule}
                href={`/domains?${buildQuery({ schedule: undefined, page: undefined })}`}
                size="sm"
              />
              {SCHEDULE_OPTIONS.map((s) => {
                const isActive = schedule === s.id;
                return (
                  <FilterChip
                    key={s.id}
                    label={s.label}
                    active={isActive}
                    href={`/domains?${buildQuery({ schedule: isActive ? undefined : s.id, page: undefined })}`}
                    size="sm"
                  />
                );
              })}
            </div>
          </div>
        </div>
      </ListFilterToolbar>

      {/* Thống kê kết quả */}
      <div className="flex items-center justify-between text-xs text-text-muted px-1">
        <span>
          {t.rich("foundCount", {
            count: total,
            b: (chunks) => <strong className="text-accent-bright font-semibold tabular-nums">{chunks}</strong>,
          })}
        </span>
      </div>

      {domains.length === 0 ? (
        <ListEmptyState
          title={t("noResults")}
          resetHref="/domains"
          resetLabel={t("clearFilters")}
        />
      ) : (
        <EntityGrid variant="detailed">
          {domains.map((d) => {
            const rawMats = (d.materials as unknown as DomainMaterialReward[]) ?? [];

            return (
              <div key={d.id} className="h-full">
                <DomainCard
                  id={d.id}
                  name={getLocalizedName(d, locale)}
                  categoryLabel={CATEGORY_LABEL[d.category] ?? d.category}
                  regionName={d.regionName}
                  recommendedLevel={d.recommendedLevel}
                  imageUrl={d.imageUrl}
                  imageUrlOriginal={d.imageUrlOriginal}
                  materials={rawMats}
                />
              </div>
            );
          })}
        </EntityGrid>
      )}

      <Pagination page={page} totalPages={totalPages} buildHref={buildPageHref} />
    </ListPageLayout>
  );
}
