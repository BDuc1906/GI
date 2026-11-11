import { getTranslations, setRequestLocale } from "next-intl/server";
import { WikiHero } from "../../components/layout/WikiHero";
import { VersionHub } from "../../components/layout/VersionHub";
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
      <WikiHero />
      <VersionHub />

      <footer className="max-w-7xl mx-auto px-4 md:px-8 py-12 border-t border-border/60 text-center text-sm text-text-muted">
        <p>{t("footerNote")}</p>
      </footer>
    </div>
  );
}
