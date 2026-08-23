import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Terms" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Terms" });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 prose-invert">
      <h1 className="font-display text-3xl font-bold text-text-primary mb-6">{t("title")}</h1>

      <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-2">{t("aboutTitle")}</h2>
          <p>{t("aboutBody")}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-2">{t("copyrightTitle")}</h2>
          <p>{t("copyrightBody")}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-2">{t("disclaimerTitle")}</h2>
          <p>{t("disclaimerBody")}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-2">{t("shutdownTitle")}</h2>
          <p>{t("shutdownBody")}</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-text-primary mb-2">{t("takedownTitle")}</h2>
          <p>{t("takedownBody")}</p>
        </section>
      </div>
    </div>
  );
}
