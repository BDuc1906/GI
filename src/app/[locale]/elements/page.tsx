
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ElementIcon } from "@/components/character/ElementIcon";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { ReactionTabs } from "@/components/character/ReactionTabs";
import {
  ELEMENTS,
  ELEMENT_ICON_URLS,
  reactionsInvolving,
  reactionPillStyle,
  getElementName,
  getReactionName,
} from "@/lib/game/element-reactions-data";
import { ReactionPillLink } from "@/components/glossary/ReactionPillLink";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Elements" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

export default async function ElementsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Elements" });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <BreadcrumbJsonLd
        items={[
          { name: "LEIBO", path: "/" },
          { name: t("title"), path: "/elements" },
        ]}
      />

      <h1 className="text-3xl font-bold text-gold-bright mb-2">{t("title")}</h1>
      <p className="text-text-secondary mb-8 max-w-2xl">{t("subtitle")}</p>

      {/* 7 nguyên tố */}
      <section className="mb-10">
        <h2 className="font-display text-xl font-bold mb-4 text-gold border-b border-border pb-2">{t("sevenElements")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {ELEMENTS.map((el) => {
            const displayName = getElementName(el, locale);
            return (
              <a
                key={el.id}
                href={`#reactions-${el.id}`}
                className="relic-frame bg-bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-gold/50 transition-colors"
              >
                <ElementIcon vision={el.name} iconUrl={ELEMENT_ICON_URLS[el.name]} size={40} />
                <div className="text-center">
                  <div className="font-semibold text-text-primary text-sm">{displayName}</div>
                  {displayName !== el.name && <div className="text-xs text-text-muted">{el.name}</div>}
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* Phản ứng — 1 thanh tab bấm chuyển giữa 3 nhóm, không cần cuộn */}
      <ReactionTabs />

      {/* Phản ứng theo từng nguyên tố */}
      <section>
        <h2 className="font-display text-xl font-bold mb-4 text-gold border-b border-border pb-2">{t("lookupByElement")}</h2>
        <div className="space-y-6">
          {ELEMENTS.map((el) => {
            const reactions = reactionsInvolving(el.name);
            if (reactions.length === 0) return null;
            const elDisplayName = getElementName(el, locale);
            return (
              <div key={el.id} id={`reactions-${el.id}`} className="scroll-mt-24">
                <div className="flex items-center gap-2 mb-3">
                  <ElementIcon vision={el.name} iconUrl={ELEMENT_ICON_URLS[el.name]} size={24} />
                  <h3 className="font-semibold text-text-primary">
                    {elDisplayName !== el.name ? `${elDisplayName} (${el.name})` : el.name}
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {reactions.map((r) => {
                    const rDisplayName = getReactionName(r, locale);
                    return (
                      <ReactionPillLink
                        key={r.id}
                        id={r.id}
                        label={rDisplayName !== r.name ? `${rDisplayName} (${r.name})` : r.name}
                        style={reactionPillStyle(el.name)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
