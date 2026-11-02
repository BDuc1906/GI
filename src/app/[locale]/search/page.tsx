
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type AppLocale } from "@/i18n/routing";
import { elementColorVar, rarityColorVar } from "@/lib/ui/theme";
import { ElementIcon } from "@/features/characters/components/ElementIcon";
import { SafeImage } from "@/components/ui/SafeImage";
import { EntityCard } from "@/components/ui/EntityCard";
import { SearchService } from "@/features/search/service";
import { searchRepository } from "@/features/search/repository";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { createLocalizedMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}

const MAX_RESULTS_PER_TYPE = 24;
const searchService = new SearchService(searchRepository);

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  const t = await getTranslations({ locale, namespace: "Search" });
  return createLocalizedMetadata({
    locale,
    pathname: "search",
    title: query ? t("metaTitleQuery", { query }) : t("metaTitleEmpty"),
    description: t("metaDescription"),
    robots: { index: false, follow: true },
  });
}

export default async function SearchPage({ params, searchParams }: PageProps) {
  const { locale: localeParam } = await params;
  if (!hasLocale(routing.locales, localeParam)) notFound();
  const locale: AppLocale = localeParam;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Search" });
  const tWeaponType = await getTranslations({ locale, namespace: "WeaponType" });

  const { q } = await searchParams;
  const query = (q ?? "").trim();

  if (!query) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-display-2 font-semibold text-text-primary mb-3">{t("title")}</h1>
        <p className="text-sm text-text-secondary">{t("emptyPrompt")}</p>
      </div>
    );
  }

  const { characters, weapons, artifacts, domains, materials } = await searchService.search(query, {
    limit: MAX_RESULTS_PER_TYPE,
    locale,
  });

  const totalResults =
    characters.length + weapons.length + artifacts.length + domains.length + materials.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-display-2 font-semibold text-text-primary mb-2">{t("resultsTitle")}</h1>
        <p className="text-sm text-text-secondary">
          {totalResults > 0 ? (
            t.rich("foundFor", {
              count: totalResults,
              query,
              b: (chunks) => <span className="text-accent-bright font-semibold tabular-nums">{chunks}</span>,
              q: (chunks) => <span className="text-accent-bright font-semibold">&ldquo;{chunks}&rdquo;</span>,
            })
          ) : (
            t.rich("noneFor", {
              query,
              q: (chunks) => <span className="text-accent-bright font-semibold">&ldquo;{chunks}&rdquo;</span>,
            })
          )}
        </p>
      </div>

      {characters.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-display-3 font-semibold text-text-primary mb-4">{t("sectionCharacters", { count: characters.length })}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {characters.map((c) => (
              <EntityCard
                key={c.id}
                href={`/characters/${c.id}`}
                name={getLocalizedName(c, locale)}
                subtitle={tWeaponType(c.weaponType as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst")}
                rarity={c.rarity}
                imageSrc={c.iconUrl}
                elementColor={elementColorVar(c.vision)}
                cornerBadge={<ElementIcon vision={c.vision} iconUrl={c.elementIcon} size={16} />}
              />
            ))}
          </div>
        </section>
      )}

      {weapons.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-display-3 font-semibold text-text-primary mb-4">{t("sectionWeapons", { count: weapons.length })}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {weapons.map((w) => (
              <EntityCard
                key={w.id}
                href={`/weapons/${w.id}`}
                name={getLocalizedName(w, locale)}
                subtitle={tWeaponType(w.type as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst")}
                rarity={w.rarity}
                imageSrc={w.iconUrl}
                imageFit="contain"
                elementColor={rarityColorVar(w.rarity)}
              />
            ))}
          </div>
        </section>
      )}

      {artifacts.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-display-3 font-semibold text-text-primary mb-4">{t("sectionArtifacts", { count: artifacts.length })}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {artifacts.map((a) => {
              const rarityRange = a.rarityRange as number[];
              const maxRarity = rarityRange.length ? Math.max(...rarityRange) : 4;
              return (
                <EntityCard
                  key={a.id}
                  href={`/artifacts/${a.id}`}
                  name={getLocalizedName(a, locale)}
                  subtitle={`${rarityRange.join("–")}★`}
                  rarity={maxRarity}
                  imageSrc={a.iconUrl}
                  imageFit="contain"
                  elementColor={rarityColorVar(maxRarity)}
                />
              );
            })}
          </div>
        </section>
      )}

      {domains.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-display-3 font-semibold text-text-primary mb-4">{t("sectionDomains", { count: domains.length })}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {domains.map((d) => (
              <Link key={d.id} href={`/domains/${d.id}`} className="surface-card overflow-hidden group flex gap-3 p-3">
                <div className="relative w-14 h-14 shrink-0 rounded-lg bg-bg-elevated overflow-hidden">
                  {d.imageUrl ? (
                    <SafeImage src={d.imageUrl} fallbackSrcs={[d.imageUrlOriginal]} alt={d.name} fill sizes="56px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted text-[10px]">—</div>
                  )}
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                  <div className="font-semibold truncate text-text-primary group-hover:text-accent-bright transition-colors text-sm">{getLocalizedName(d, locale)}</div>
                  <div className="text-eyebrow mt-1">{d.category}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {materials.length > 0 && (
        <section>
          <h2 className="font-display text-display-3 font-semibold text-text-primary mb-4">
            {t("sectionMaterials", { count: materials.length })}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {materials.map((material) => (
              <Link
                key={material.id}
                href={`/materials/${material.id}`}
                className="surface-card flex items-center gap-3 p-3 hover:border-accent-500/60 transition-colors"
              >
                <span className="relative w-12 h-12 shrink-0 rounded-lg bg-bg-elevated overflow-hidden">
                  {material.iconUrl && (
                    <SafeImage
                      src={material.iconUrl}
                      fallbackSrcs={[material.iconUrlOriginal]}
                      alt={getLocalizedName(material, locale)}
                      fill
                      sizes="48px"
                      className="object-contain"
                    />
                  )}
                </span>
                <span className="min-w-0 text-sm font-medium text-text-primary line-clamp-2">
                  {getLocalizedName(material, locale)}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {totalResults === 0 && (
        <p className="text-sm text-text-muted text-center py-16">{t("tryAnotherKeyword")}</p>
      )}
    </div>
  );
}
