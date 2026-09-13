"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  ELEMENTAL_REACTIONS,
  DAMAGE_FORMULAS,
  TRANSFORMATIVE_BASE_COEFFICIENT,
  getReactionName,
  getFormulaTitle,
  getFormulaExplanation,
} from "@/lib/game/element-reactions-data";
import { FORMULA_ORDER, FORMULA_TITLE_COLOR } from "./constants";

/**
 * Bảng công thức tính sát thương phản ứng — số liệu tra cứu trực tiếp từ
 * KeQingMains Theorycrafting Library + Genshin Impact Wiki chính thức
 * (xem trích dẫn nguồn ngay trong dữ liệu ở element-reactions-data.ts).
 * Link nguồn hiển thị công khai để người đọc tự đối chiếu, không yêu cầu
 * tin suông số liệu ở đây.
 */
export function DamageFormulaPanel() {
  const t = useTranslations("ReactionTabs");
  const locale = useLocale();

  const reactionName: Record<string, string> = Object.fromEntries(
    ELEMENTAL_REACTIONS.map((r) => [r.id, getReactionName(r, locale)])
  );

  return (
    <div className="space-y-6">
      <p className="text-xs text-text-muted -mt-1">{t("formulaIntro")}</p>

      {FORMULA_ORDER.map((cat) => {
        const f = DAMAGE_FORMULAS[cat];
        return (
          <div key={cat} className="relic-frame bg-bg-card border border-border rounded-xl p-4">
            <h3 className={`font-display font-bold mb-2 ${FORMULA_TITLE_COLOR[cat]}`}>{getFormulaTitle(f, locale)}</h3>
            <div className="bg-bg-elevated border border-border/60 rounded-lg px-3 py-2 mb-2 font-mono text-xs text-gold-bright overflow-x-auto whitespace-nowrap">
              {f.formulaLatex}
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-2">{getFormulaExplanation(f, locale)}</p>
            <a
              href={f.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-text-muted hover:text-gold-bright underline underline-offset-2"
            >
              {t("sourceLabel")}: {f.sourceUrl.replace(/^https?:\/\//, "")}
            </a>
          </div>
        );
      })}

      <div>
        <h3 className="font-display font-bold text-gold-bright mb-1">{t("baseCoefficientTableTitle")}</h3>
        <p className="text-xs text-text-muted mb-3">{t("baseCoefficientTableNote")}</p>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-bg-elevated">
                <th className="py-2 px-3 text-left font-semibold border-r border-border">{t("reactionColumn")}</th>
                <th className="py-2 px-3 text-center font-semibold whitespace-nowrap">{t("coefficientColumn")}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(TRANSFORMATIVE_BASE_COEFFICIENT).map(([id, coef]) => (
                <tr key={id} className="border-t border-border">
                  <td className="py-1.5 px-3 text-text-primary border-r border-border">
                    {reactionName[id] ?? id}
                    {id === "frozen" ? ` (${t("shatterNote")})` : ""}
                  </td>
                  <td className="py-1.5 px-3 text-center text-gold-bright font-semibold tabular-nums">
                    {coef.toFixed(2)}×
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
