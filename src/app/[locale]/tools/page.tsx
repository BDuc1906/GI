import { WikiToolsHub } from "@/components/layout/WikiToolsHub";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { getTranslations, setRequestLocale } from "next-intl/server";

interface ToolsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: ToolsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  return createLocalizedMetadata({
    locale,
    pathname: "tools",
    title: t("Tools.title"),
    description: t("Home.toolEnkaDescription"),
  });
}

export default async function ToolsPage({ params }: ToolsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="min-h-screen bg-bg-primary">
      <WikiToolsHub />
    </main>
  );
}
