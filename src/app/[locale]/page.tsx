import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { prisma } from "../../lib/db/prisma";
import { WikiHero } from "../../components/layout/WikiHero";
import { QuickNavigation } from "../../components/layout/QuickNavigation";
import { WikiToolsHub } from "../../components/layout/WikiToolsHub";
import { VersionHub } from "../../components/layout/VersionHub";
import { ServerTimers } from "../../components/layout/ServerTimers";
import { BeginnerGuides } from "../../components/layout/BeginnerGuides";
import { ExtendedDatabase } from "../../components/layout/ExtendedDatabase";
import { HomeCharacterExplorer } from "../../components/layout/HomeCharacterExplorer";
import { withDbRetry } from "@/lib/db/db-retry";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import type { Metadata } from "next";
import { createLocalizedMetadata } from "@/lib/seo/metadata";

export const revalidate = 60;

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return createLocalizedMetadata({
    locale,
    pathname: "",
    title: t("title"),
    description: t("description"),
  });
}

export default async function Home({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Home" });
  const tWeaponType = await getTranslations({ locale, namespace: "WeaponType" });

  // Fetch data: Lấy 24 nhân vật đại diện đủ các hệ nguyên tố cho bộ lọc
  const [charCount, rawCharacters] = await withDbRetry(() =>
    Promise.all([
      prisma.character.count(),
      prisma.character.findMany({
        take: 24,
        orderBy: [{ rarity: 'desc' }, { updatedAt: 'desc' }],
        select: { id: true, name: true, nameTranslations: true, vision: true, weaponType: true, rarity: true, iconUrl: true },
      }),
    ])
  );

  const localizedCharacters = rawCharacters.map((c) => ({
    id: c.id,
    name: getLocalizedName(c, locale),
    vision: c.vision,
    weaponType: tWeaponType(c.weaponType as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst"),
    rarity: c.rarity,
    iconUrl: c.iconUrl,
  }));

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* 1. Kazuha Hero Banner with Smart Search */}
      <Suspense fallback={null}>
        <WikiHero />
      </Suspense>

      {/* 2. Live Server Reset Timers (Compact HUD) */}
      <ServerTimers />

      {/* 3. Interactive Character Explorer with 7-Element Filter Bar */}
      <HomeCharacterExplorer
        characters={localizedCharacters}
        charCount={charCount}
        locale={locale}
      />

      {/* 4. Tactical Bento Tools Hub */}
      <WikiToolsHub />

      {/* 5. Teyvat Database Quick Navigation */}
      <QuickNavigation />

      {/* 6. Essential Beginner Guides */}
      <BeginnerGuides />

      {/* 7. Current Version Patch Highlight */}
      <VersionHub />

      {/* 8. Extended Database Compendium */}
      <ExtendedDatabase />

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 md:px-8 py-12 border-t border-border/60 text-center text-sm text-text-muted">
        <p>{t("footerNote")}</p>
      </footer>
    </div>
  );
}