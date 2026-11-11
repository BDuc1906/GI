import { TeyvatCompendium } from "@/components/layout/TeyvatCompendium";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { getTranslations, setRequestLocale } from "next-intl/server";

interface WikiPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: WikiPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return createLocalizedMetadata({
    locale,
    pathname: "wiki",
    title: t("Navigation.title"),
    description: t("Hero.description"),
  });
}

export default async function WikiPage({ params }: WikiPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-bg-primary">
      <TeyvatCompendium />
    </main>
  );
}
