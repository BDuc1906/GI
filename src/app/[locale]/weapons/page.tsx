
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { rarityStars, rarityColorVar } from "@/lib/ui/theme";
import { WeaponIcon } from "@/components/weapon/WeaponIcon";
import { EntityCard } from "@/components/ui/EntityCard";
import { Pagination } from "@/components/ui/Pagination";
import { LIST_PAGE_SIZE, parsePageParam, totalPagesFor } from "@/lib/ui/pagination";
import type { Metadata } from "next";
import { withDbRetry } from "@/lib/db/db-retry";
import { getLocalizedName } from "@/lib/i18n/entity-name";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Weapons" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string; rarity?: string; q?: string; page?: string }>;
}

// Cùng mật độ lưới với /characters — nhất quán toàn site, tận dụng màn
// hình rộng thay vì dừng ở lg:6 như bản cũ.
const DENSE_GRID = "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3";

export default async function WeaponsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Weapons" });
  const tWeaponType = await getTranslations({ locale, namespace: "WeaponType" });

  const { type, rarity, q, page: pageRaw } = await searchParams;
  const page = parsePageParam(pageRaw);

  const where: Prisma.WeaponWhereInput = {};
  if (type) where.type = { equals: type, mode: "insensitive" };
  if (rarity) where.rarity = Number(rarity);
  if (q) where.name = { contains: q, mode: "insensitive" };

  // BUG ĐÃ SỬA: cùng lớp lỗi P1017 đã sửa ở trang chủ/characters/domains.
  const [weapons, total] = await withDbRetry(() =>
    Promise.all([
      prisma.weapon.findMany({
        where,
        orderBy: [{ rarity: "desc" }, { name: "asc" }],
        skip: (page - 1) * LIST_PAGE_SIZE,
        take: LIST_PAGE_SIZE,
      }),
      prisma.weapon.count({ where }),
    ])
  );
  const totalPages = totalPagesFor(total);
  const types = ["Sword", "Claymore", "Polearm", "Bow", "Catalyst"];

  const buildQuery = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    if (type) sp.set("type", type);
    if (rarity) sp.set("rarity", rarity);
    if (q) sp.set("q", q);
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v);
      else sp.delete(k);
    });
    return sp.toString();
  };
  const buildPageHref = (p: number) => `/weapons?${buildQuery({ page: p > 1 ? String(p) : undefined })}`;
  const hasActiveFilters = Boolean(type || rarity || q);

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

      <form method="GET" className="flex gap-2 mb-5">
        {type && <input type="hidden" name="type" value={type} />}
        {rarity && <input type="hidden" name="rarity" value={rarity} />}
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
        <div className="flex items-start gap-3 py-2.5 border-b border-border">
          <span className="text-xs text-text-muted font-medium w-24 shrink-0 pt-1.5">{t("filterType")}</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {types.map((weaponType) => {
              const active = type === weaponType;
              return (
                <Link
                  key={weaponType}
                  href={`/weapons?${buildQuery({ type: active ? undefined : weaponType })}`}
                  aria-pressed={active}
                  className="chip px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs"
                >
                  <WeaponIcon type={weaponType} size={14} />
                  {tWeaponType(weaponType as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst")}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-start gap-3 py-2.5">
          <span className="text-xs text-text-muted font-medium w-24 shrink-0 pt-1.5">{t("filterRarity")}</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {[5, 4, 3].map((r) => {
              const active = rarity === String(r);
              return (
                <Link
                  key={r}
                  href={`/weapons?${buildQuery({ rarity: active ? undefined : String(r) })}`}
                  aria-pressed={active}
                  className="chip px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={active ? { color: rarityColorVar(r), borderColor: rarityColorVar(r) } : undefined}
                >
                  {rarityStars(r)}
                </Link>
              );
            })}
            {hasActiveFilters && (
              <Link
                href="/weapons"
                className="ml-2 text-xs text-text-muted hover:text-text-primary transition-colors underline underline-offset-2"
              >
                {t("clearAllFilters")}
              </Link>
            )}
          </div>
        </div>
      </div>

      {weapons.length === 0 ? (
        <div className="text-center py-20 text-text-muted text-sm">
          {t("noResults")}{" "}
          <Link href="/weapons" className="underline underline-offset-2 hover:text-text-primary">
            {t("clearFilters")}
          </Link>
        </div>
      ) : (
        <div className={DENSE_GRID}>
          {weapons.map((w, index) => (
            <EntityCard
              key={w.id}
              href={`/weapons/${w.id}`}
              name={getLocalizedName(w, locale)}
              subtitle={w.type}
              rarity={w.rarity}
              imageSrc={w.iconUrl}
              imageFit="contain"
              compact
              priority={index < 10}
              elementColor={rarityColorVar(w.rarity)}
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} buildHref={buildPageHref} />
    </div>
  );
}
