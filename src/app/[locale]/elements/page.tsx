import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ElementIcon } from "@/components/ElementIcon";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import { ReactionTabs } from "@/components/ReactionTabs";
import {
  ELEMENTS,
  ELEMENT_ICON_URLS,
  reactionsInvolving,
  type ReactionCategory,
} from "@/lib/element-reactions-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Elements" });
  return { title: t("metaTitle"), description: t("metaDescription") };
}

// Trùng với CATEGORY_COLOR trong ReactionTabs.tsx (cố ý không tách export
// dùng chung — chỉ 5 dòng màu, tách ra thêm 1 file/export dùng chung sẽ
// rườm rà hơn giá trị nó mang lại).
const CATEGORY_COLOR: Record<ReactionCategory, string> = {
  amplifying: "border-orange-500/50 bg-orange-500/10 text-orange-300",
  transformative: "border-purple-500/50 bg-purple-500/10 text-purple-300",
  additive: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
  lunar: "border-sky-400/50 bg-sky-400/10 text-sky-300",
  stellar: "border-fuchsia-400/50 bg-fuchsia-400/10 text-fuchsia-300",
};

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
          {ELEMENTS.map((el) => (
            <a
              key={el.id}
              href={`#reactions-${el.id}`}
              className="relic-frame bg-bg-card border border-border rounded-xl p-4 flex flex-col items-center gap-2 hover:border-gold/50 transition-colors"
            >
              <ElementIcon vision={el.name} iconUrl={ELEMENT_ICON_URLS[el.name]} size={40} />
              <div className="text-center">
                <div className="font-semibold text-text-primary text-sm">{el.name}</div>
                <div className="text-xs text-text-muted">{el.nameVi}</div>
              </div>
            </a>
          ))}
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
            return (
              <div key={el.id} id={`reactions-${el.id}`} className="scroll-mt-24">
                <div className="flex items-center gap-2 mb-3">
                  <ElementIcon vision={el.name} iconUrl={ELEMENT_ICON_URLS[el.name]} size={24} />
                  <h3 className="font-semibold text-text-primary">{el.name} ({el.nameVi})</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {reactions.map((r) => (
                    <span
                      key={r.id}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium ${CATEGORY_COLOR[r.category]}`}
                    >
                      {r.nameVi} ({r.name})
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}