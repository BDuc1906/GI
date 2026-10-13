import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { routing } from "@/i18n/routing";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { PLAYABLE_CHARACTER_FILTER } from "@/core/game/character-catalog";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { META_TIER_LIST } from "@/core/game/tier-list-data";
import { TierListClient, type EnrichedTierCharacter } from "@/features/tier-list";
import { getTierListTranslations } from "./tier-list-i18n";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = getTierListTranslations(locale);

  return createLocalizedMetadata({
    locale,
    pathname: "tier-list",
    title: t.metaTitle,
    description: t.metaDescription,
  });
}

export default async function TierListPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = getTierListTranslations(locale);

  // Truy vấn toàn bộ nhân vật có thể chơi từ PostgreSQL Prisma DB
  const dbCharacters = await withDbRetry(() =>
    prisma.character.findMany({
      where: PLAYABLE_CHARACTER_FILTER,
      select: {
        id: true,
        name: true,
        nameTranslations: true,
        iconUrl: true,
        vision: true,
        weaponType: true,
        rarity: true,
      },
    })
  );

  const charMap = new Map(dbCharacters.map((c) => [c.id, c]));

  // Hợp nhất dữ liệu Meta Tier List với dữ liệu thật từ DB
  const enrichedCharacters: EnrichedTierCharacter[] = [];

  for (const entry of META_TIER_LIST) {
    const dbChar = charMap.get(entry.characterId);
    if (dbChar) {
      enrichedCharacters.push({
        ...entry,
        name: dbChar.name,
        localizedName: getLocalizedName(dbChar, locale),
        iconUrl: dbChar.iconUrl,
        vision: dbChar.vision,
        weaponType: dbChar.weaponType,
        rarity: dbChar.rarity,
      });
    }
  }

  const breadcrumbs = [
    { name: "LEIBO", path: "/" },
    { name: t.breadcrumbTierList, path: "/tier-list" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <BreadcrumbJsonLd locale={locale} items={breadcrumbs} />
      <Breadcrumb items={breadcrumbs} />

      {/* Header trang */}
      <div className="space-y-2">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-text-primary tracking-tight">
          {t.pageTitle}
        </h1>
        <p className="text-sm text-text-secondary max-w-3xl leading-relaxed">
          {t.pageSubtitle}
        </p>
      </div>

      {/* Component tương tác chính */}
      <TierListClient
        characters={enrichedCharacters}
        locale={locale}
        translations={{
          title: t.pageTitle,
          subtitle: t.pageSubtitle,
          modeAbyss: t.modeAbyss,
          modeTheater: t.modeTheater,
          filterRole: t.filterRole,
          filterElement: t.filterElement,
          filterWeapon: t.filterWeapon,
          searchPlaceholder: t.searchPlaceholder,
          all: t.all,
          clearFilters: t.clearFilters,
          noResults: t.noResults,
          bestWeaponLabel: t.bestWeaponLabel,
          bestArtifactLabel: t.bestArtifactLabel,
          viewDetails: t.viewDetails,
        }}
      />
    </div>
  );
}
