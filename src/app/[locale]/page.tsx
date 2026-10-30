import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";
import { WikiHero } from "../../components/layout/WikiHero";
import { FeaturedBanners } from "../../components/layout/FeaturedBanners";
import { WikiToolsHub } from "../../components/layout/WikiToolsHub";
import { VersionHub } from "../../components/layout/VersionHub";
import { ServerTimers } from "../../components/layout/ServerTimers";
import { BeginnerGuides } from "../../components/layout/BeginnerGuides";
import { TeyvatCompendium } from "../../components/layout/TeyvatCompendium";
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

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* 1. Kazuha Hero Banner with Smart Search & Falling Maple Leaves */}
      <Suspense fallback={null}>
        <WikiHero />
      </Suspense>

      {/* 2. Live Server Reset Timers (Compact HUD) */}
      <ServerTimers />

      {/* 3. Featured Tactical Banners (Game8 / Prydwen cinematic wide visual banners) */}
      <FeaturedBanners />

      {/* 4. Tactical Bento Tools Hub */}
      <WikiToolsHub />

      {/* 4. Phiên Bản Hiện Tại: Chỉ hiển thị Nhân vật mới & Vũ khí mới của bản hiện tại */}
      <VersionHub />

      {/* 5. Unified Teyvat Compendium (21 Categories with Smart Filter Tabs) */}
      <TeyvatCompendium />

      {/* 6. Cẩm nang dành cho người mới */}
      <BeginnerGuides />

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 md:px-8 py-12 border-t border-border/60 text-center text-sm text-text-muted">
        <p>{t("footerNote")}</p>
      </footer>
    </div>
  );
}