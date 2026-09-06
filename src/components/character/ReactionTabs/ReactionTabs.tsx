"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactionCategory } from "@/lib/game/element-reactions-data";
import { STANDARD_REACTIONS, LUNAR_REACTIONS, STELLAR_REACTIONS } from "./constants";
import { ReactionCard } from "./ReactionCard";
import { ResonanceAndFactionPanel } from "./ResonanceAndFactionPanel";
import { DamageFormulaPanel } from "./DamageFormulaPanel";

/**
 * ReactionTabs — 1 thanh tab bấm chuyển giữa: phản ứng nguyên tố thường /
 * phản ứng Nguyệt / Tinh Vực (Stellar Glimmer) / Cộng hưởng & Phe phái —
 * không cần cuộn trang.
 *
 * ĐA NGÔN NGỮ (2026-08): khung UI (tên tab, nhãn category, tiêu đề mục)
 * vẫn đi qua next-intl như trước. Nội dung MÔ TẢ THẬT của từng phản ứng
 * (tên/mô tả phản ứng, cộng hưởng, công thức...) giờ đọc qua các hàm
 * getReactionName/getReactionDescription/... trong element-reactions-data.ts
 * — đã có bản dịch tiếng Anh đầy đủ (verify thuật ngữ chính thức + dịch
 * tay mô tả cơ chế), các ngôn ngữ khác (ja/ko/zh-CN...) tạm fallback về
 * tiếng Anh cho tới khi có bản dịch riêng, KHÔNG còn hiện tiếng Việt cho
 * người dùng ngôn ngữ khác nữa.
 *
 * File này chỉ còn phần "khung tab" — các panel nội dung (ReactionCard,
 * ResonanceAndFactionPanel, DamageFormulaPanel) đã tách sang file riêng
 * trong cùng thư mục để dễ maintain từng phần độc lập.
 */
export function ReactionTabs() {
  const t = useTranslations("ReactionTabs");
  const locale = useLocale();

  const CATEGORY_LABEL: Record<ReactionCategory, string> = {
    amplifying: t("categoryAmplifying"),
    transformative: t("categoryTransformative"),
    additive: t("categoryAdditive"),
    lunar: t("categoryLunar"),
    stellar: t("categoryStellar"),
  };

  const REACTION_TABS = [
    { key: "standard" as const, label: t("tabStandard"), reactions: STANDARD_REACTIONS, note: t("noteStandard") },
    { key: "lunar" as const, label: t("tabLunar"), reactions: LUNAR_REACTIONS, note: t("noteLunar") },
    { key: "stellar" as const, label: t("tabStellar"), reactions: STELLAR_REACTIONS, note: t("noteStellar") },
    { key: "resonance" as const, label: t("tabResonance"), reactions: [], note: "" },
    { key: "formula" as const, label: t("tabFormula"), reactions: [], note: "" },
  ] as const;

  const [active, setActive] = useState<(typeof REACTION_TABS)[number]["key"]>("standard");
  const current = REACTION_TABS.find((tab) => tab.key === active)!;

  return (
    <section className="mb-10">
      <div className="flex flex-wrap gap-2 mb-4 border-b border-border pb-3">
        {REACTION_TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActive(tab.key)}
              className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${
                isActive
                  ? "border-gold bg-gold/20 text-gold-bright"
                  : "border-border bg-bg-card/60 hover:border-gold/50 text-text-primary"
              }`}
            >
              {tab.label}
              {tab.reactions.length > 0 ? ` (${tab.reactions.length})` : ""}
            </button>
          );
        })}
      </div>

      {current.key === "resonance" ? (
        <ResonanceAndFactionPanel />
      ) : current.key === "formula" ? (
        <DamageFormulaPanel />
      ) : (
        <>
          <p className="text-xs text-text-muted mb-4">{current.note}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {current.reactions.map((r) => (
              <ReactionCard key={r.id} r={r} categoryLabel={CATEGORY_LABEL} locale={locale} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
