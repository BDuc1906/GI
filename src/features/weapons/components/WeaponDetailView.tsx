/**
 * src/features/weapons/components/WeaponDetailView.tsx
 *
 * Presentation Component hiển thị chi tiết vũ khí: Hero, Chỉ số cơ bản,
 * Nguyên liệu đột phá, Hiệu ứng tinh luyện và Nhân vật khuyên dùng.
 */

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { SafeImage } from "@/components/ui/SafeImage";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { WeaponLevelSlider } from "@/features/weapons/components/WeaponLevelSlider";
import { formatNumber } from "@/core/game/character-stats-format";
import { translateStatName } from "@/core/game/stat-name-translations";
import { rarityStars, rarityTextClass } from "@/lib/ui/theme";
import { GlossaryText } from "@/features/glossary/GlossaryText";
import { WeaponRecommendedCharacters } from "@/features/weapons/components/WeaponRecommendedCharacters";
import type { WeaponDetailPageData } from "../types";

interface WeaponDetailViewProps {
  data: WeaponDetailPageData;
  locale: string;
}

export function WeaponDetailView({ data, locale }: WeaponDetailViewProps) {
  const t = useTranslations("WeaponDetail");
  const {
    weapon: w,
    localizedName,
    weaponTypeLabel,
    rarityColor: rc,
    refinements,
    ascensionMaterials,
    materialMap,
    statsByLevel,
    breadcrumbItems,
  } = data;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <BreadcrumbJsonLd locale={locale} items={breadcrumbItems} />
      <Breadcrumb items={breadcrumbItems} />

      {/* ── 1. Hero Card ── */}
      <div
        className="surface-card overflow-hidden mb-10"
        style={{ borderTop: `2.5px solid ${rc}` }}
      >
        <div className="p-6 flex flex-col sm:flex-row gap-6">
          {w.iconUrl && (
            <div
              className="relative w-40 h-40 rounded-xl bg-bg-elevated shrink-0"
              style={{
                border: `1px solid color-mix(in srgb, ${rc} 35%, var(--border-color))`,
              }}
            >
              <SafeImage
                src={w.iconUrl}
                alt={w.name}
                fill
                sizes="160px"
                className="object-contain p-3"
                fallbackClassName="w-full h-full flex items-center justify-center text-text-muted text-[10px]"
              />
            </div>
          )}
          <div className="flex flex-col justify-center min-w-0">
            <span className="text-eyebrow mb-2">{weaponTypeLabel}</span>
            <h1 className="font-display text-display-2 font-semibold text-text-primary mb-2">
              {localizedName}
            </h1>
            <p className={`text-lg mb-4 ${rarityTextClass(w.rarity)}`}>
              {rarityStars(w.rarity)}
            </p>
            {w.description && (
              <p className="text-sm text-text-primary max-w-xl leading-relaxed bg-bg-elevated p-3 rounded-lg border border-border italic">
                {w.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. Chỉ số cơ bản & Tăng trưởng ── */}
      <section className="mb-10">
        <SectionHeading elementColor={rc}>{t("baseStats")}</SectionHeading>
        {statsByLevel && statsByLevel.length > 0 ? (
          <WeaponLevelSlider
            statsByLevel={statsByLevel}
            subStatName={w.subStatName}
            elementColor={rc}
          />
        ) : (
          <div className="surface-card p-5 flex gap-8 text-sm">
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wide mb-1">
                {t("baseAtk")}
              </div>
              <div className="text-lg font-semibold text-text-primary tabular-nums">
                {formatNumber(w.baseAtk, locale)}
              </div>
            </div>
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wide mb-1">
                {w.subStatName ? translateStatName(w.subStatName, locale) : t("subStat")}
              </div>
              <div className="text-lg font-semibold text-text-primary tabular-nums">
                {w.subStatValue ?? "—"}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── 3. Nguyên liệu đột phá ── */}
      {ascensionMaterials.length > 0 && (
        <section className="mb-10">
          <SectionHeading elementColor={rc}>{t("ascensionMaterials")}</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ascensionMaterials.map((phase) => (
              <div key={phase.phase} className="surface-card p-4">
                <div className="text-eyebrow mb-3" style={{ color: rc }}>
                  {t("phase", { phase: phase.phase })}
                </div>
                <ul className="space-y-1.5 text-sm">
                  {phase.materials.map((m, j: number) => {
                    const material = m.materialId ? materialMap[m.materialId] : null;
                    return (
                      <li key={j} className="flex items-center justify-between gap-3">
                        {m.materialId ? (
                          <Link
                            href={`/materials/${m.materialId}`}
                            className="group/mat flex items-center gap-2 min-w-0 hover:text-accent-bright transition-colors"
                          >
                            <span className="relative w-6 h-6 shrink-0 rounded bg-bg-elevated border border-border overflow-hidden group-hover/mat:border-accent-500 transition-colors">
                              {material?.iconUrl ? (
                                <SafeImage
                                  src={material.iconUrl}
                                  alt={material?.localizedName ?? m.name ?? ""}
                                  fill
                                  sizes="24px"
                                  className="object-contain"
                                />
                              ) : null}
                            </span>
                            <span className="text-text-secondary group-hover/mat:text-accent-bright truncate transition-colors">
                              {material?.localizedName ?? m.name}
                            </span>
                          </Link>
                        ) : (
                          <span className="flex items-center gap-2 min-w-0">
                            <span className="relative w-6 h-6 shrink-0 rounded bg-bg-elevated border border-border overflow-hidden">
                              {material?.iconUrl ? (
                                <SafeImage
                                  src={material.iconUrl}
                                  alt={material?.localizedName ?? m.name ?? ""}
                                  fill
                                  sizes="24px"
                                  className="object-contain"
                                />
                              ) : null}
                            </span>
                            <span className="text-text-secondary truncate">
                              {material?.localizedName ?? m.name}
                            </span>
                          </span>
                        )}
                        <span className="font-semibold text-text-primary shrink-0 tabular-nums">
                          {m.count ? `x${m.count.toLocaleString(locale)}` : ""}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 4. Hiệu ứng tinh luyện ── */}
      {w.effectName && refinements.length > 0 && (
        <section className="mb-10">
          <SectionHeading elementColor={rc}>{w.effectName}</SectionHeading>
          <div className="space-y-3">
            {refinements.map((r) => (
              <div key={r.refinement} className="surface-card p-4">
                <div
                  className="font-display font-semibold mb-1"
                  style={{ color: rc }}
                >
                  {t("refinement", { n: r.refinement })}
                </div>
                <p className="text-sm text-text-secondary whitespace-pre-line">
                  <GlossaryText text={r.description} />
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 5. Nhân vật khuyên dùng ── */}
      <WeaponRecommendedCharacters weapon={w} locale={locale} weaponColor={rc} />
    </div>
  );
}
