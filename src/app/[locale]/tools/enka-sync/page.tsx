import { setRequestLocale, getTranslations } from "next-intl/server";
import { EnkaImporterClient } from "@/features/enka";
import { createLocalizedMetadata } from "@/lib/seo/metadata";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Tools.enkaSync" });
  return createLocalizedMetadata({
    locale,
    pathname: "tools/enka-sync",
    title: `${t("title")} | LEIBO`,
    description: t("description"),
  });
}

export default async function EnkaSyncPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Tools.enkaSync");

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-2">
          {t("title")}
        </h1>
        <p className="text-text-secondary mb-8">
          {t("description")}
        </p>

        <EnkaImporterClient />
      </div>
    </div>
  );
}
