"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ElementIcon } from "@/components/ElementIcon";
import {
  ELEMENTAL_REACTIONS,
  ELEMENT_ICON_URLS,
  ELEMENTAL_RESONANCES,
  LUNAR_RESONANCE,
  HEXEREI_INFO,
  HEXEREI_WAVE_1,
  HEXEREI_WAVE_2,
  HEXEREI_NEW_WITCHES,
  WITCH_REVELATION_INFO,
  WITCH_REVELATION_CHARACTERS,
  DAMAGE_FORMULAS,
  TRANSFORMATIVE_BASE_COEFFICIENT,
  elementColor,
  type ReactionCategory,
  type DamageFormulaCategory,
} from "@/lib/element-reactions-data";

const CATEGORY_COLOR: Record<ReactionCategory, string> = {
  amplifying: "border-orange-500/50 bg-orange-500/10 text-orange-300",
  transformative: "border-purple-500/50 bg-purple-500/10 text-purple-300",
  additive: "border-emerald-500/50 bg-emerald-500/10 text-emerald-300",
  lunar: "border-sky-400/50 bg-sky-400/10 text-sky-300",
  stellar: "border-fuchsia-400/50 bg-fuchsia-400/10 text-fuchsia-300",
};

const STANDARD_REACTIONS = ELEMENTAL_REACTIONS.filter((r) => r.category !== "lunar" && r.category !== "stellar");
const LUNAR_REACTIONS = ELEMENTAL_REACTIONS.filter((r) => r.category === "lunar");
const STELLAR_REACTIONS = ELEMENTAL_REACTIONS.filter((r) => r.category === "stellar");

/**
 * ReactionTabs — 1 thanh tab bấm chuyển giữa: phản ứng nguyên tố thường /
 * phản ứng Nguyệt / Tinh Vực (Stellar Glimmer) / Cộng hưởng & Phe phái —
 * không cần cuộn trang.
 *
 * LƯU Ý VỀ PHẠM VI DỊCH: chỉ phần "khung" UI (tên tab, nhãn category, tiêu
 * đề mục) đi qua next-intl ở đây. Nội dung MÔ TẢ THẬT của từng phản ứng
 * (r.nameVi, r.description, tên/mô tả cộng hưởng...) nằm trong dữ liệu tĩnh
 * ở src/lib/element-reactions-data.ts — vẫn chỉ có tiếng Việt, cần một đợt
 * dịch dữ liệu riêng (không phải messages/*.json) nếu muốn đa ngôn ngữ đầy
 * đủ 100% cho cả nội dung cơ chế game, không chỉ khung UI.
 */
export function ReactionTabs() {
  const t = useTranslations("ReactionTabs");

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
              {tab.label}{tab.reactions.length > 0 ? ` (${tab.reactions.length})` : ""}
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
              <ReactionCard key={r.id} r={r} categoryLabel={CATEGORY_LABEL} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function ReactionCard({
  r,
  categoryLabel,
}: {
  r: (typeof ELEMENTAL_REACTIONS)[number];
  categoryLabel: Record<ReactionCategory, string>;
}) {
  const t = useTranslations("ReactionTabs");
  // Tên phản ứng Nguyệt/Tinh Vực tô màu theo nguyên tố ĐẶC TRƯNG của
  // biến thể đó (accentElement) — vd Nguyệt-Điện Cảm màu tím (Lôi),
  // Nguyệt-Sum Suê màu xanh lá (Thảo), Nguyệt-Kết Tinh màu vàng (Nham) —
  // thay vì tất cả cùng 1 màu xanh dương/tím cố định như trước.
  const titleColor = r.accentElement ? elementColor(r.accentElement) : undefined;

  return (
    <div className="relic-frame bg-bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <span className="font-display font-bold" style={titleColor ? { color: titleColor } : undefined}>
            {r.nameVi}
          </span>
          {r.nameVi !== r.name && <span className="text-text-muted text-xs ml-2">({r.name})</span>}
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium shrink-0 ${CATEGORY_COLOR[r.category]}`}>
          {categoryLabel[r.category]}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mb-2">
        {r.elements.map((elName, i) => (
          <span key={elName} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-text-muted text-xs">+</span>}
            <ElementIcon vision={elName} iconUrl={ELEMENT_ICON_URLS[elName]} size={18} />
          </span>
        ))}
      </div>
      <p className="text-sm text-text-secondary mb-2">{r.description}</p>
      {r.requiresCharacters && (
        <div className="text-[11px] text-text-muted pt-2 border-t border-border/60">
          {t("charactersLabel")}: {r.requiresCharacters}
        </div>
      )}
    </div>
  );
}

function ResonanceAndFactionPanel() {
  const t = useTranslations("ReactionTabs");

  return (
    <div className="space-y-8">
      {/* Cộng hưởng Nguyên tố */}
      <div>
        <h3 className="font-display font-bold text-gold-bright mb-1">{t("elementalResonanceTitle")}</h3>
        <p className="text-xs text-text-muted mb-3">{t("elementalResonanceNote")}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {ELEMENTAL_RESONANCES.map((res) => (
            <div key={res.id} className="relic-frame bg-bg-card border border-border rounded-xl p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <ElementIcon vision={res.element} iconUrl={ELEMENT_ICON_URLS[res.element]} size={18} />
                <span className="font-semibold text-text-primary text-sm">{res.nameVi}</span>
              </div>
              <p className="text-xs text-text-secondary">{res.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Cộng hưởng Nguyệt */}
      <div>
        <h3 className="font-display font-bold text-gold-bright mb-1">{LUNAR_RESONANCE.nameVi}</h3>
        <p className="text-xs text-text-muted mb-1">{LUNAR_RESONANCE.requirement}</p>
        <p className="text-sm text-text-secondary mb-3">{LUNAR_RESONANCE.description}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {LUNAR_RESONANCE.scalings.map((s, i) => (
            <div key={i} className="relic-frame bg-bg-card border border-border rounded-lg p-3 text-sm">
              <div className="flex items-center gap-1.5 mb-1">
                {s.elements.map((elName) => (
                  <ElementIcon key={elName} vision={elName} iconUrl={ELEMENT_ICON_URLS[elName]} size={16} />
                ))}
              </div>
              <div className="text-text-secondary mb-1">{s.statLabel}: <span className="text-gold-bright font-medium">{s.ratePerUnit}</span></div>
              <div className="text-[11px] text-text-muted italic">{t("exampleAbbrev")}: {s.example}</div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-text-muted mt-2">
          {t("maxBonusPerActivation", { max: LUNAR_RESONANCE.maxBonus })} · {t("releasedInVersion", { version: LUNAR_RESONANCE.gameVersion })}
        </p>
      </div>

      {/* Hexerei */}
      <div>
        <h3 className="font-display font-bold text-gold-bright mb-1">{HEXEREI_INFO.nameVi}</h3>
        <p className="text-xs text-text-muted mb-1">{HEXEREI_INFO.requirement}</p>
        <p className="text-sm text-text-secondary mb-3">{HEXEREI_INFO.description}</p>
        <CharacterGroup label={t("wave1")} names={HEXEREI_WAVE_1} />
        <CharacterGroup label={t("wave2")} names={HEXEREI_WAVE_2} />
        <CharacterGroup label={t("newWitchesWithHexerei")} names={HEXEREI_NEW_WITCHES} />
      </div>

      {/* Khải Huyền Của Ma Nữ (Witch's Revelation) */}
      <div>
        <h3 className="font-display font-bold text-gold-bright mb-1">{WITCH_REVELATION_INFO.nameVi}</h3>
        <p className="text-xs text-text-muted mb-1">{WITCH_REVELATION_INFO.requirement}</p>
        <p className="text-sm text-text-secondary mb-3">{WITCH_REVELATION_INFO.description}</p>
        <CharacterGroup label={t("versionLabel", { version: WITCH_REVELATION_INFO.gameVersion })} names={WITCH_REVELATION_CHARACTERS} color="fuchsia" />
        <p className="text-[11px] text-text-muted mt-2">{t("witchRevelationNote")}</p>
      </div>
    </div>
  );
}

function CharacterGroup({ label, names, color = "purple" }: { label: string; names: readonly string[]; color?: "purple" | "fuchsia" }) {
  const colorClass = color === "fuchsia"
    ? "border-fuchsia-500/50 bg-fuchsia-500/10 text-fuchsia-300"
    : "border-purple-500/50 bg-purple-500/10 text-purple-300";
  return (
    <div className="mb-3">
      <div className="text-[11px] text-text-muted mb-1.5">{label}</div>
      <div className="flex flex-wrap gap-2">
        {names.map((name) => (
          <span key={name} className={`text-xs px-3 py-1.5 rounded-full border font-medium ${colorClass}`}>
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

const FORMULA_ORDER: DamageFormulaCategory[] = ["amplifying", "transformative", "additive"];

const REACTION_NAME_VI: Record<string, string> = Object.fromEntries(
  ELEMENTAL_REACTIONS.map((r) => [r.id, r.nameVi])
);

/**
 * Bảng công thức tính sát thương phản ứng — số liệu tra cứu trực tiếp từ
 * KeQingMains Theorycrafting Library + Genshin Impact Wiki chính thức
 * (xem trích dẫn nguồn ngay trong dữ liệu ở element-reactions-data.ts).
 * Link nguồn hiển thị công khai để người đọc tự đối chiếu, không yêu cầu
 * tin suông số liệu ở đây.
 */
function DamageFormulaPanel() {
  const t = useTranslations("ReactionTabs");

  return (
    <div className="space-y-6">
      <p className="text-xs text-text-muted -mt-1">{t("formulaIntro")}</p>

      {FORMULA_ORDER.map((cat) => {
        const f = DAMAGE_FORMULAS[cat];
        return (
          <div key={cat} className="relic-frame bg-bg-card border border-border rounded-xl p-4">
            <h3 className={`font-display font-bold mb-2 ${CATEGORY_COLOR[cat].split(" ")[2]}`}>{f.titleVi}</h3>
            <div className="bg-bg-elevated border border-border/60 rounded-lg px-3 py-2 mb-2 font-mono text-xs text-gold-bright overflow-x-auto whitespace-nowrap">
              {f.formulaLatex}
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-2">{f.explanationVi}</p>
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
                    {REACTION_NAME_VI[id] ?? id}
                    {id === "frozen" ? ` (${t("shatterNote")})` : ""}
                  </td>
                  <td className="py-1.5 px-3 text-center text-gold-bright font-semibold tabular-nums">{coef.toFixed(2)}×</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


