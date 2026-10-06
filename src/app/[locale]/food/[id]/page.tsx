import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { SafeImage } from "@/components/ui/SafeImage";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { paragraphs } from "@/lib/game/enemy-format";
import {
  FOOD_FILTER_LABEL,
  FOOD_TYPE_LABEL,
  QUALITY_LABEL,
  readFoodRaw,
  stars,
} from "@/lib/game/food-format";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const f = await prisma.food.findUnique({ where: { id }, select: { id: true, name: true, raw: true } });
  if (!f) {
    return createLocalizedMetadata({
      locale,
      pathname: `food/${id}`,
      title: "Không tìm thấy món ăn — LEIBO",
      robots: { index: false, follow: false },
    });
  }
  const effect = readFoodRaw(f.raw).effect;
  return createLocalizedMetadata({
    locale,
    pathname: `food/${id}`,
    title: `${f.name} — Món ăn Genshin Impact | LEIBO`,
    description: effect ? effect.slice(0, 155) : `${f.name}: hiệu ứng, nguyên liệu và công thức.`,
  });
}

export default async function FoodDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const food = await withDbRetry(() =>
    prisma.food.findUnique({
      where: { id },
      select: { id: true, name: true, rarity: true, foodtype: true, filterType: true, raw: true },
    })
  );
  if (!food) return notFound();

  const raw = readFoodRaw(food.raw);
  const ingredients = raw.ingredients ?? [];
  const ingNames = ingredients.map((i) => i.name);

  const [materials, character, baseDish, variants] = await withDbRetry(() =>
    Promise.all([
      ingNames.length
        ? prisma.material.findMany({
            where: { name: { in: ingNames } },
            select: { id: true, name: true, nameTranslations: true, iconUrl: true, iconUrlOriginal: true },
          })
        : Promise.resolve([]),
      raw.characterName
        ? prisma.character.findFirst({
            where: { name: raw.characterName },
            select: { id: true, name: true, nameTranslations: true, iconUrl: true, iconUrlOriginal: true },
          })
        : Promise.resolve(null),
      raw.baseDishName
        ? prisma.food.findFirst({ where: { name: raw.baseDishName }, select: { id: true, name: true } })
        : Promise.resolve(null),
      // Các món đặc biệt được làm từ món này (baseDishName trùng tên món hiện tại).
      prisma.food
        .findMany({
          where: { raw: { path: ["baseDishName"], equals: food.name } },
          select: { id: true, name: true, raw: true },
          orderBy: { name: "asc" },
        })
        .catch(() => []),
    ])
  );
  const matByName = new Map(materials.map((m) => [m.name, m]));

  const breadcrumbItems = [
    { name: "LEIBO", path: "/" },
    { name: "Món ăn", path: "/food" },
    { name: food.name, path: `/food/${food.id}` },
  ];

  const tiers = (["suspicious", "normal", "delicious"] as const).filter((k) => raw[k]?.effect);
  const descParas = paragraphs(raw.description);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <BreadcrumbJsonLd locale={locale} items={breadcrumbItems} />
      <Breadcrumb items={breadcrumbItems} />

      <header className="mb-8">
        <h1 className="font-display text-display-2 font-semibold text-text-primary">
          {food.name} <span className="text-rarity-5 text-xl align-middle">{stars(food.rarity)}</span>
        </h1>
        <div className="flex flex-wrap gap-2 mt-3 text-xs">
          {food.foodtype && (
            <span className="px-2.5 py-1 rounded-full bg-bg-elevated text-accent-bright font-semibold">
              {FOOD_TYPE_LABEL[food.foodtype] ?? food.foodtype}
            </span>
          )}
          {food.filterType && (
            <Link
              href={`/food?filter=${food.filterType}`}
              title={raw.filterText}
              className="px-2.5 py-1 rounded-full border border-border text-text-secondary hover:border-accent-500 hover:text-accent-bright"
            >
              {FOOD_FILTER_LABEL[food.filterType] ?? raw.filterText}
            </Link>
          )}
        </div>
      </header>

      {raw.effect && (
        <section className="mb-6 surface-card p-4 max-w-3xl">
          <h2 className="font-display text-lg font-bold text-accent-bright mb-1">Hiệu ứng</h2>
          <p className="text-text-primary">{raw.effect}</p>
        </section>
      )}

      {descParas.length > 0 && (
        <section className="mb-8 max-w-3xl space-y-2 text-text-secondary">
          {descParas.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
      )}

      {(character || baseDish || variants.length > 0) && (
        <section className="mb-10">
          <h2 className="font-display text-xl font-bold mb-4 text-accent-bright border-b border-border pb-2">
            Liên quan
          </h2>
          <div className="flex flex-wrap gap-3">
            {character && (
              <Link href={`/characters/${character.id}`} className="surface-card p-3 flex items-center gap-3 group">
                <div className="relative w-10 h-10 rounded-full bg-bg-elevated overflow-hidden shrink-0">
                  <SafeImage
                    src={character.iconUrl}
                    fallbackSrcs={[character.iconUrlOriginal]}
                    alt={getLocalizedName(character, locale)}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <div className="text-[11px] text-text-muted">Món đặc biệt của</div>
                  <div className="text-sm font-medium text-text-primary group-hover:text-accent-bright transition-colors">
                    {getLocalizedName(character, locale)}
                  </div>
                </div>
              </Link>
            )}
            {baseDish && (
              <Link href={`/food/${baseDish.id}`} className="surface-card p-3 group">
                <div className="text-[11px] text-text-muted">Món gốc</div>
                <div className="text-sm font-medium text-text-primary group-hover:text-accent-bright transition-colors">
                  {baseDish.name}
                </div>
              </Link>
            )}
            {variants.map((v) => (
              <Link key={v.id} href={`/food/${v.id}`} className="surface-card p-3 group">
                <div className="text-[11px] text-text-muted">
                  Món đặc biệt{readFoodRaw(v.raw).characterName ? ` của ${readFoodRaw(v.raw).characterName}` : ""}
                </div>
                <div className="text-sm font-medium text-text-primary group-hover:text-accent-bright transition-colors">
                  {v.name}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {ingredients.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-xl font-bold mb-4 text-accent-bright border-b border-border pb-2">
            Nguyên liệu
            <span className="ml-2 text-sm font-normal text-text-muted">({ingredients.length})</span>
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {ingredients.map((ing) => {
              const mat = matByName.get(ing.name);
              const label = mat ? getLocalizedName(mat, locale) : ing.name;
              const body = (
                <>
                  <div className="relative w-10 h-10 rounded-lg bg-bg-elevated overflow-hidden shrink-0">
                    {mat && (
                      <SafeImage
                        src={mat.iconUrl}
                        fallbackSrcs={[mat.iconUrlOriginal]}
                        alt={label}
                        fill
                        sizes="40px"
                        className="object-contain p-0.5"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate group-hover/ing:text-accent-bright transition-colors">
                      {label}
                    </div>
                    {typeof ing.count === "number" && (
                      <div className="text-[11px] text-text-muted">× {ing.count}</div>
                    )}
                  </div>
                </>
              );
              return (
                <li key={`${ing.id ?? ing.name}`}>
                  {mat ? (
                    <Link href={`/materials/${mat.id}`} className="surface-card p-3 flex items-center gap-3 group/ing">
                      {body}
                    </Link>
                  ) : (
                    <div className="surface-card p-3 flex items-center gap-3 group/ing">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {tiers.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-xl font-bold mb-4 text-accent-bright border-b border-border pb-2">
            Hiệu ứng theo chất lượng
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {tiers.map((k) => (
              <div key={k} className="surface-card p-3">
                <div className="text-xs font-semibold text-text-muted mb-1">{QUALITY_LABEL[k]}</div>
                <p className="text-sm text-text-primary">{raw[k]?.effect}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
