import Link from "next/link";
import { Prisma } from "@prisma/client";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { rarityColorVar } from "@/lib/ui/theme";
import { EntityCard } from "@/components/ui/EntityCard";
import { Pagination } from "@/components/ui/Pagination";
import { LIST_PAGE_SIZE, parsePageParam, totalPagesFor } from "@/lib/ui/pagination";
import type { Metadata } from "next";
import { withDbRetry } from "@/lib/db/db-retry";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Artifacts" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}

// Cùng mật độ lưới với /characters, /weapons — nhất quán toàn site.
const DENSE_GRID = "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3";

export default async function ArtifactsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Artifacts" });

  const { q, page: pageRaw } = await searchParams;
  const page = parsePageParam(pageRaw);

  const where: Prisma.ArtifactSetWhereInput = {};
  if (q) where.name = { contains: q, mode: "insensitive" };

  // BUG ĐÃ SỬA: cùng lớp lỗi P1017 đã sửa ở trang chủ/characters/domains/weapons.
  const [sets, total] = await withDbRetry(() =>
    Promise.all([
      prisma.artifactSet.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * LIST_PAGE_SIZE,
        take: LIST_PAGE_SIZE,
      }),
      prisma.artifactSet.count({ where }),
    ])
  );
  const totalPages = totalPagesFor(total);

  const buildQuery = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v);
      else sp.delete(k);
    });
    return sp.toString();
  };
  const buildPageHref = (p: number) => `/artifacts?${buildQuery({ page: p > 1 ? String(p) : undefined })}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-7">
        <h1 className="font-display text-display-2 font-semibold text-text-primary mb-2">{t("title")}</h1>
        <p className="text-sm text-text-secondary">
          {t.rich("foundCount", {
            count: total,
            b: (chunks) => <span className="text-accent-bright font-semibold tabular-nums">{chunks}</span>,
          })}
        </p>
      </div>

      <form method="GET" className="flex gap-2 mb-8">
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
        {q && (
          <Link href={`/artifacts?${buildQuery({ q: undefined })}`} className="chip rounded-lg px-4 py-2 text-sm">
            {t("clearShort")}
          </Link>
        )}
      </form>

      {sets.length === 0 ? (
        <div className="text-center py-20 text-text-muted text-sm">
          {t("noResults")}{" "}
          <Link href="/artifacts" className="underline underline-offset-2 hover:text-text-primary">
            {t("clearFilters")}
          </Link>
        </div>
      ) : (
        <div className={DENSE_GRID}>
          {sets.map((a, index) => {
            const range = a.rarityRange as number[];
            const maxRarity = Math.max(...range, 4);
            return (
              <EntityCard
                key={a.id}
                href={`/artifacts/${a.id}`}
                name={a.name}
                subtitle={t("rarityBadge", { range: range.join("–") })}
                rarity={maxRarity}
                imageSrc={a.iconUrl}
                imageFit="contain"
                compact
                priority={index < 10}
                elementColor={rarityColorVar(maxRarity)}
              />
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} buildHref={buildPageHref} />
    </div>
  );
}
