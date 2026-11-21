import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { imageFor } from "@/core/game/image-urls";
import enemyImages from "@/data/images/enemies.json";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import {
  ListPageLayout,
  ListPageHeader,
  ListFilterToolbar,
  FilterChip,
  EntityGrid,
  ListEmptyState,
} from "@/components/list-layout";
import { EnemyCard } from "@/features/enemies/components/EnemyCard";
import {
  ENEMY_CATEGORY_LABEL,
  ENEMY_TYPE_LABEL,
  normalizeSearch,
  readEnemyRaw,
} from "@/core/game/enemy-format";

export const dynamic = "force-dynamic";

interface EnemiesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; type?: string; cat?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Enemies" });
  return createLocalizedMetadata({
    locale,
    pathname: "enemies",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

const TYPE_ORDER = ["COMMON", "ELITE", "BOSS"] as const;

export default async function EnemiesPage({ params, searchParams }: EnemiesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Enemies" });
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const type = (TYPE_ORDER as readonly string[]).includes(sp.type ?? "") ? sp.type! : "";
  const cat = sp.cat && sp.cat in ENEMY_CATEGORY_LABEL ? sp.cat : "";

  // Chọn field tường minh; raw cần để lấy tên gọi khác
  const all = await withDbRetry(() =>
    prisma.enemy.findMany({
      select: {
        id: true,
        name: true,
        enemyType: true,
        categoryType: true,
        categoryText: true,
        raw: true,
      },
      orderBy: { name: "asc" },
    })
  );

  const query = normalizeSearch(q);
  const enemies = all.filter((e) => {
    if (type && e.enemyType !== type) return false;
    if (cat && e.categoryType !== cat) return false;
    if (query) {
      const special = readEnemyRaw(e.raw).specialNames ?? [];
      return [e.name, ...special].some((n) => normalizeSearch(n).includes(query));
    }
    return true;
  });

  const count = (pred: (e: (typeof all)[number]) => boolean) => all.filter(pred).length;

  /** Dựng URL giữ các bộ lọc khác, đổi 1 bộ lọc. */
  const href = (next: { type?: string; cat?: string }) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    const nextType = "type" in next ? next.type : type;
    const nextCat = "cat" in next ? next.cat : cat;
    if (nextType) p.set("type", nextType);
    if (nextCat) p.set("cat", nextCat);
    const s = p.toString();
    return s ? `/enemies?${s}` : "/enemies";
  };

  const activeCount = (type ? 1 : 0) + (cat ? 1 : 0) + (q ? 1 : 0);

  const breadcrumbs = [
    { name: "LEIBO", path: "/" },
    { name: t("title"), path: "/enemies" },
  ];

  const enemyIcon = (
    <Image
      src="/local-genshin-assets/ui/enemy.png"
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
        icon={enemyIcon}
        title={t("title")}
        description={t("description")}
        totalCount={all.length}
        countLabel={t("title")}
      />

      <ListFilterToolbar
        activeCount={activeCount}
        clearHref="/enemies"
        clearLabel={t("clearAllFilters")}
        mobileFilterLabel="Bộ lọc"
        searchSlot={
          <form action="" method="get" role="search" className="flex gap-2 w-full max-w-md">
            {type && <input type="hidden" name="type" value={type} />}
            {cat && <input type="hidden" name="cat" value={cat} />}
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchPlaceholder")}
              className="flex-1 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-border bg-bg-elevated text-text-primary placeholder:text-text-muted focus:border-accent-500 focus:outline-none transition-colors"
            />
            <button type="submit" className="btn-accent px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold shrink-0">
              {t("searchButton")}
            </button>
          </form>
        }
      >
        <div className="space-y-4 pt-2">
          {/* Cấp độ */}
          <div>
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
              {t("filterType")}:
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <FilterChip
                label={t("allTypes")}
                count={all.length}
                active={!type}
                href={href({ type: "" })}
                size="sm"
              />
              {TYPE_ORDER.map((tKey) => (
                <FilterChip
                  key={tKey}
                  label={ENEMY_TYPE_LABEL[tKey] ?? tKey}
                  count={count((e) => e.enemyType === tKey)}
                  active={type === tKey}
                  href={href({ type: tKey })}
                  size="sm"
                />
              ))}
            </div>
          </div>

          {/* Nhóm */}
          <div>
            <div className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
              {t("filterCategory")}:
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <FilterChip
                label={t("allCategories")}
                active={!cat}
                href={href({ cat: "" })}
                size="sm"
              />
              {Object.entries(ENEMY_CATEGORY_LABEL).map(([key, label]) => (
                <FilterChip
                  key={key}
                  label={label}
                  count={count((e) => e.categoryType === key)}
                  active={cat === key}
                  href={href({ cat: key })}
                  size="sm"
                />
              ))}
            </div>
          </div>
        </div>
      </ListFilterToolbar>

      {/* Thống kê kết quả */}
      <div className="flex items-center justify-between text-xs text-text-muted px-1">
        <span>
          {t.rich("foundCount", {
            count: enemies.length,
            b: (chunks) => <strong className="text-accent-bright font-semibold tabular-nums">{chunks}</strong>,
          })}
        </span>
      </div>

      {/* Lưới hiển thị kẻ địch */}
      {enemies.length === 0 ? (
        <ListEmptyState
          title={t("noResults")}
          resetHref="/enemies"
          resetLabel={t("resetFilters")}
        />
      ) : (
        <EntityGrid variant="detailed">
          {enemies.map((enemy) => {
            const raw = readEnemyRaw(enemy.raw);
            const special = raw.specialNames?.[0];
            const typeLabel = enemy.enemyType ? ENEMY_TYPE_LABEL[enemy.enemyType] ?? enemy.enemyType : null;
            const categoryLabel = enemy.categoryType ? ENEMY_CATEGORY_LABEL[enemy.categoryType] ?? enemy.categoryText : null;
            const candidates = imageFor(enemyImages, enemy.id);

            return (
              <div key={enemy.id} className="h-full">
                <EnemyCard
                  id={enemy.id}
                  name={enemy.name}
                  specialName={special}
                  typeLabel={typeLabel}
                  categoryLabel={categoryLabel}
                  enemyType={enemy.enemyType}
                  candidates={candidates}
                />
              </div>
            );
          })}
        </EntityGrid>
      )}
    </ListPageLayout>
  );
}
