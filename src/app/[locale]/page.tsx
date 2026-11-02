import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { WikiHero } from "../../components/layout/WikiHero";
import { FeaturedBanners } from "../../components/layout/FeaturedBanners";
import { WikiToolsHub } from "../../components/layout/WikiToolsHub";
import { VersionHub } from "../../components/layout/VersionHub";
import { ServerTimers } from "../../components/layout/ServerTimers";
import { TeyvatCompendium } from "../../components/layout/TeyvatCompendium";
import type { Metadata } from "next";
import { createLocalizedMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

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

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* 1. Hero banner with global search and falling maple leaves */}
      <Suspense fallback={null}>
        <WikiHero />
      </Suspense>

      {/* 2. Live Server Reset Timers (Compact HUD) */}
      <ServerTimers />

      {/* 3. Featured Tactical Spotlight Banner (Tier List) */}
      <FeaturedBanners />

      {/* 4. Tactical Bento Tools Hub (DPS Calculator, Team Builder, Enka Sync...) */}
      <WikiToolsHub />

      {/* 5. Phiên Bản Hiện Tại: Điểm tin bản cập nhật, nhân vật & vũ khí mới */}
      <VersionHub />

      {/* 6. Unified Teyvat Compendium (Trung tâm dữ liệu 22 danh mục Teyvat) */}
      <TeyvatCompendium />

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 md:px-8 py-12 border-t border-border/60 text-center text-sm text-text-muted">
        <p>{t("footerNote")}</p>
      </footer>
    </div>
  );
}
