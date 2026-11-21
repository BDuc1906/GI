import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCharacterListing, parseCharacterFilters } from "@/features/characters/listing";
import { CharacterFilterBar } from "@/features/characters/components/CharacterFilterBar";
import { CharacterListingGrid } from "@/features/characters/components/CharacterListingGrid";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { ListPageLayout, ListPageHeader } from "@/components/list-layout";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Characters" });
  return createLocalizedMetadata({
    locale,
    pathname: "characters",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ vision?: string; weapon?: string; region?: string; rarity?: string; q?: string }>;
}

export default async function CharactersPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Characters" });

  const filters = parseCharacterFilters(await searchParams);
  const listing = await getCharacterListing(filters);

  const characterIcon = (
    <svg
      className="w-5 h-5 text-accent-bright"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
      />
    </svg>
  );

  return (
    <ListPageLayout>
      <ListPageHeader
        icon={characterIcon}
        title={t("title")}
        description={t.rich("foundCount", {
          count: listing.displayCount,
          b: (chunks) => <span className="text-accent-bright font-semibold">{chunks}</span>,
        })}
        totalCount={listing.displayCount}
        countLabel="Nhân vật"
      />

      <CharacterFilterBar
        locale={locale}
        filters={filters}
        visionRows={listing.visionRows}
        regionRows={listing.regionRows}
        weaponTypes={listing.weaponTypes}
      />

      <CharacterListingGrid locale={locale} grouping={listing} />
    </ListPageLayout>
  );
}
