"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ElementIcon } from "@/components/character/ElementIcon";
import { GlossaryText } from "@/components/glossary/GlossaryText";
import {
  ELEMENTS,
  ELEMENT_ICON_URLS,
  CATEGORY_COLOR,
  elementColor,
  getReactionName,
  getReactionDescription,
  type ReactionCategory,
} from "@/lib/game/element-reactions-data";
import { STANDARD_REACTIONS, LUNAR_REACTIONS, STELLAR_REACTIONS } from "./constants";
import { ResonanceAndFactionPanel } from "./ResonanceAndFactionPanel";
import { DamageFormulaPanel } from "./DamageFormulaPanel";

/**
 * ReactionTabs — 1 thanh tab bấm chuyển giữa: phản ứng nguyên tố thường /
 * phản ứng Nguyệt / Tinh Vực (Stellar Glimmer) / Cộng hưởng & Phe phái —
 * không cần cuộn trang.
 *
 * BỘ LỌC THEO NGUYÊN TỐ (mới): mỗi tab phản ứng (thường/Nguyệt/Tinh Vực)
 * có thể chứa tới hơn chục thẻ — thay vì bắt người xem cuộn qua hết, thêm
 * 1 hàng chip nguyên tố ngay trên lưới để tự thu hẹp danh sách (vd bấm
 * "Hydro" chỉ còn Vaporize/Frozen/Electro-Charged/Bloom...). Danh sách
 * chip chỉ liệt kê nguyên tố THỰC SỰ xuất hiện trong tab đang xem, không
 * hiện chip nào rồi lọc ra rỗng.
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
  const [elementFilter, setElementFilter] = useState<string | null>(null);
  const current = REACTION_TABS.find((tab) => tab.key === active)!;

  // Nguyên tố nào thực sự xuất hiện trong tab đang mở — chỉ hiện đúng
  // các chip đó, theo đúng thứ tự chuẩn trong ELEMENTS (không xáo trộn).
  const availableElements = useMemo(
    () => ELEMENTS.map((e) => e.name).filter((name) => current.reactions.some((r) => r.elements.includes(name))),
    [current]
  );

  const visibleReactions = elementFilter
    ? current.reactions.filter((r) => r.elements.includes(elementFilter))
    : current.reactions;

  function switchTab(key: (typeof REACTION_TABS)[number]["key"]) {
    setActive(key);
    setElementFilter(null);
  }

  return (
    <section className="mb-10">
      <div className="flex flex-wrap gap-2 mb-4 border-b border-border pb-3">
        {REACTION_TABS.map((tab) => {
          const isActive = tab.key === active;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => switchTab(tab.key)}
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
          <p className="text-sm text-text-muted mb-4">{current.note}</p>

          {availableElements.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => setElementFilter(null)}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                  elementFilter === null
                    ? "border-gold bg-gold/20 text-gold-bright"
                    : "border-border bg-bg-card/60 text-text-secondary hover:border-gold/50"
                }`}
              >
                All
              </button>
              {availableElements.map((name) => {
                const isActive = elementFilter === name;
                const color = elementColor(name);
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setElementFilter(isActive ? null : name)}
                    className="flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors"
                    style={
                      isActive
                        ? { borderColor: color, background: `color-mix(in srgb, ${color} 18%, transparent)`, color }
                        : { borderColor: "var(--border)" }
                    }
                  >
                    <ElementIcon vision={name} iconUrl={ELEMENT_ICON_URLS[name]} size={15} glow={false} />
                    {name}
                  </button>
                );
              })}
            </div>
          )}

          {visibleReactions.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-bg-elevated">
                    <th className="border-r border-border px-4 py-3 text-left font-semibold">{t("reactionColumn")}</th>
                    <th className="w-32 border-r border-border px-4 py-3 text-left font-semibold">Category</th>
                    <th className="px-4 py-3 text-left font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleReactions.map((r) => {
                    // Tên phản ứng Nguyệt/Tinh Vực tô màu theo nguyên tố
                    // ĐẶC TRƯNG của biến thể đó (accentElement) thay vì 1
                    // màu cố định cho tất cả.
                    const titleColor = r.accentElement ? elementColor(r.accentElement) : undefined;
                    const displayName = getReactionName(r, locale);
                    const description = getReactionDescription(r, locale);

                    return (
                      <tr key={r.id} className="border-t border-border align-top">
                        <td className="border-r border-border px-4 py-3.5">
                          <div className="mb-1.5 flex items-center gap-1.5">
                            {r.elements.map((elName, i) => (
                              <span key={elName} className="flex items-center gap-1.5">
                                {i > 0 && <span className="text-xs text-text-muted">+</span>}
                                <ElementIcon vision={elName} iconUrl={ELEMENT_ICON_URLS[elName]} size={18} glow={false} />
                              </span>
                            ))}
                          </div>
                          <span className="font-display text-base font-bold" style={titleColor ? { color: titleColor } : undefined}>
                            {displayName}
                          </span>
                          {displayName !== r.name && (
                            <span className="ml-1 text-xs text-text-muted">({r.name})</span>
                          )}
                        </td>
                        <td className="border-r border-border px-4 py-3.5">
                          <span
                            className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-1 text-xs font-medium ${CATEGORY_COLOR[r.category]}`}
                          >
                            {CATEGORY_LABEL[r.category]}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 leading-relaxed text-text-secondary">
                          <GlossaryText text={description} excludeId={r.id} />
                          {r.requiresCharacters && (
                            <div className="mt-1.5 text-xs text-text-muted">
                              {t("charactersLabel")}: {r.requiresCharacters}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-text-muted py-6 text-center">
              No {current.label.toLowerCase()} reactions involve {elementFilter}.
            </p>
          )}
        </>
      )}
    </section>
  );
}
