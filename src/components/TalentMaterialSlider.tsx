"use client";

import { useMemo, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { SafeImage } from "@/components/SafeImage";
import type { TalentMaterialLevel } from "@/lib/character-helpers";

interface Props {
  talentMaterials: TalentMaterialLevel[];
  materialIconMap: Record<string, string | null | undefined>;
  /** Màu nguyên tố của nhân vật — nhuộm thanh trượt và nhãn cấp hiện tại. */
  elementColor?: string;
}

const MATERIAL_LEVELS = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const MAX_TOTAL_LEVEL = 15;
const CONSTELLATION_LEVELS = [11, 12, 13];
const PASSIVE_LEVELS = [14, 15];

export function TalentMaterialSlider({ talentMaterials, materialIconMap, elementColor }: Props) {
  const t = useTranslations("TalentMaterialSlider");
  const locale = useLocale();
  const el = elementColor ?? "var(--accent-500)";

  function levelSourceLabel(level: number): string | null {
    if (level === 1) return t("baseLevel");
    if (MATERIAL_LEVELS.includes(level)) return null;
    if (CONSTELLATION_LEVELS.includes(level)) return t("fromConstellation");
    if (PASSIVE_LEVELS.includes(level)) return t("fromPassiveTalent");
    return null;
  }

  const byLevel = useMemo(() => {
    const map = new Map<number, TalentMaterialLevel>();
    for (const entry of talentMaterials) map.set(entry.level, entry);
    return map;
  }, [talentMaterials]);

  const [level, setLevel] = useState(10);
  const current = byLevel.get(level);
  const materials = current?.materials ?? [];
  const isMaterialLevel = MATERIAL_LEVELS.includes(level);
  const sourceLabel = levelSourceLabel(level);
  const isConstellationOrPassive = CONSTELLATION_LEVELS.includes(level) || PASSIVE_LEVELS.includes(level);

  return (
    <div className="mt-4 bg-bg-elevated border border-border rounded-xl p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-eyebrow" style={{ color: el }}>
          {level === 1 ? t("level1") : t("levelRange", { from: level - 1, to: level })}
          {sourceLabel && <span className="text-text-muted font-normal normal-case"> &middot; {sourceLabel}</span>}
        </span>
      </div>

      <input
        type="range"
        min={1}
        max={MAX_TOTAL_LEVEL}
        step={1}
        value={level}
        onChange={(e) => setLevel(Number(e.target.value))}
        className="w-full mb-3"
        style={{ accentColor: el }}
        aria-label={t("ariaSelectTalentLevel")}
      />

      <div className="flex flex-wrap gap-1.5 mb-3">
        {Array.from({ length: MAX_TOTAL_LEVEL }, (_, i) => i + 1).map((lv) => {
          const needsData = MATERIAL_LEVELS.includes(lv);
          const hasData = byLevel.has(lv);
          const missing = needsData && !hasData;
          const isCurrent = level === lv;
          const style = isCurrent
            ? { borderColor: el, color: el }
            : missing
            ? { borderColor: "rgba(220,80,80,0.5)", color: "rgba(220,80,80,0.75)", borderStyle: "dashed" as const }
            : CONSTELLATION_LEVELS.includes(lv) || PASSIVE_LEVELS.includes(lv)
            ? { borderColor: "color-mix(in srgb, var(--rarity-4) 45%, transparent)", color: "color-mix(in srgb, var(--rarity-4) 80%, var(--text-secondary))" }
            : { borderColor: "var(--border-color)", color: "var(--text-muted)" };
          return (
            <button
              key={lv}
              type="button"
              onClick={() => setLevel(lv)}
              title={missing ? t("missingMaterialData") : undefined}
              className="px-2 py-0.5 rounded text-xs border transition-colors tabular-nums"
              style={style}
            >
              {lv}
            </button>
          );
        })}
      </div>

      {level === 1 && <p className="text-xs text-text-muted">{t("baseLevelNote")}</p>}

      {isMaterialLevel && (
        <div className="flex flex-wrap gap-2">
          {!current && (
            <span className="text-xs" style={{ color: "rgba(220,80,80,0.85)" }}>
              {t("missingMaterialForLevel", { from: level - 1, to: level })}
            </span>
          )}
          {current && materials.length === 0 && <span className="text-xs text-text-muted">{t("noMaterialDataForLevel")}</span>}
          {materials.map((m, idx) => {
            const iconUrl = m.materialId ? materialIconMap[m.materialId] : null;
            const formattedCount = m.count ? m.count.toLocaleString(locale) : "";
            return (
              <span key={idx} className="flex items-center gap-1.5 bg-bg-card px-2.5 py-1 rounded-full border border-border text-xs">
                <span className="relative w-5 h-5 shrink-0">
                  {iconUrl ? <SafeImage src={iconUrl} alt={m.name || ""} fill className="object-contain" sizes="20px" /> : null}
                </span>
                <span className="text-text-secondary">{m.name}</span>
                <span className="text-text-primary font-medium tabular-nums">×{formattedCount}</span>
              </span>
            );
          })}
        </div>
      )}

      {isConstellationOrPassive && (
        <p className="text-xs" style={{ color: "color-mix(in srgb, var(--rarity-4) 85%, var(--text-secondary))" }}>
          {CONSTELLATION_LEVELS.includes(level) ? t("costsNoMaterialConstellation") : t("costsNoMaterialPassive")}
        </p>
      )}

      <p className="text-[11px] text-text-muted mt-3 leading-relaxed border-t border-border pt-2">
        {t.rich("maxTotalNote", {
          b: (chunks) => <span className="text-text-primary font-medium">{chunks}</span>,
        })}
      </p>
    </div>
  );
}
