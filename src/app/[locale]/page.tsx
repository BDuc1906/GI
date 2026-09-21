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
import { CommunitySection } from "../../components/layout/CommunitySection";
import { PatchTimeline } from "../../components/layout/PatchTimeline";
import { ElementThemeToggle } from "../../components/layout/ElementThemeToggle";
import { EntityCard } from "../../components/ui/EntityCard";
import { withDbRetry } from "@/lib/db/db-retry";
import { getLocalizedName } from "@/lib/i18n/entity-name";

export const revalidate = 60;

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Home" });
  const tWeaponType = await getTranslations({ locale, namespace: "WeaponType" });

  // Fetch data tối giản
  const [charCount, featuredCharacter, trendingCharacters] = await withDbRetry(() =>
    Promise.all([
      prisma.character.count(),
      prisma.character.findFirst({
        orderBy: { rarity: 'desc' },
        select: { id: true, name: true, nameTranslations: true, vision: true, weaponType: true, rarity: true, iconUrl: true },
      }),
      prisma.character.findMany({
        take: 6,
        orderBy: { updatedAt: 'desc' },
        select: { id: true, name: true, nameTranslations: true, vision: true, weaponType: true, rarity: true, iconUrl: true },
      }),
    ])
  );

  return (
    <div className="min-h-screen bg-bg-primary">
      <ElementThemeToggle />
      <Suspense fallback={null}>
        <WikiHero />
      </Suspense>

      {/* Server Timers */}
      <ServerTimers />

      {/* Quick Navigation Categories */}
      <QuickNavigation />

      {/* Wiki Tools Hub */}
      <WikiToolsHub />

      {/* Version Hub & Banners */}
      <VersionHub />

      {/* Beginner Guides */}
      <BeginnerGuides />

      {/* Extended Database */}
      <ExtendedDatabase />

      {/* Community Section */}
      <CommunitySection />

      {/* Featured Character */}
      {featuredCharacter && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
              ⭐ Nhân vật nổi bật
            </h2>
            <p className="text-text-secondary">Character với độ hiếm cao nhất</p>
          </div>
          <div className="max-w-md mx-auto">
            <EntityCard
              href={`/characters/${featuredCharacter.id}`}
              name={getLocalizedName(featuredCharacter, locale)}
              subtitle={tWeaponType(featuredCharacter.weaponType as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst")}
              rarity={featuredCharacter.rarity}
              imageSrc={featuredCharacter.iconUrl}
              imageFit="contain"
              element={featuredCharacter.vision}
              frameStyle="premium"
              backgroundType="elemental-gradient"
              imageGrow={true}
              sizes="(max-width: 768px) 100vw, 400px"
            />
          </div>
        </section>
      )}

      {/* Trending Characters */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
              Nhân vật mới cập nhật
            </h2>
            <p className="text-text-secondary">Cập nhật gần đây</p>
          </div>
          <div className="flex items-center gap-4 text-sm text-text-muted">
            <span>Tổng: {charCount} nhân vật</span>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {trendingCharacters.map((c) => (
            <EntityCard
              key={c.id}
              href={`/characters/${c.id}`}
              name={getLocalizedName(c, locale)}
              subtitle={tWeaponType(c.weaponType as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst")}
              rarity={c.rarity}
              imageSrc={c.iconUrl}
              imageFit="contain"
              element={c.vision}
              frameStyle="simple"
              backgroundType="solid"
            />
          ))}
        </div>
      </section>

      {/* Patch Timeline */}
      <PatchTimeline />

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 md:px-8 py-12 border-t border-border text-center text-sm text-text-muted">
        <p>{t("footerNote")}</p>
      </footer>
    </div>
  );
}