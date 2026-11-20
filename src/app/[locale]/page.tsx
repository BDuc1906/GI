import { getTranslations, setRequestLocale } from "next-intl/server";
import { WikiHero } from "../../components/layout/WikiHero";
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

  return (
    <div className="min-h-screen bg-bg-primary pb-8">
      <WikiHero />
      <VersionHub />
      <ServerTimers />
      <TeyvatCompendium />
    </div>
  );
}
