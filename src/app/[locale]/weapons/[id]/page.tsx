import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SafeImage } from "@/components/ui/SafeImage";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { WeaponLevelSlider, type WeaponStatByLevelRow } from "@/components/weapon/WeaponLevelSlider";
import { formatNumber } from "@/lib/game/character-stats-format";
import { rarityStars, rarityTextClass, rarityColorVar } from "@/lib/ui/theme";
import type { AscensionMaterialPhase } from "@/lib/game/character-helpers";
import { GlossaryText } from "@/components/glossary/GlossaryText";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "WeaponDetail" });
  const w = await prisma.weapon.findUnique({ where: { id } });
  if (!w) return { title: t("notFoundTitle") };
  return {
    title: `${w.name} — LEIBO`,
    description: w.description ?? t("metaDescriptionFallback", { type: w.type, rarity: w.rarity }),
  };
}

export default async function WeaponDetail({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "WeaponDetail" });
  const w = await prisma.weapon.findUnique({ where: { id } });
  if (!w) return notFound();

  const refinements = (w.passiveByRefinement as unknown[]) ?? [];
  const ascensionMaterials = (w.ascensionMaterials as unknown as AscensionMaterialPhase[]) ?? [];
  const statsByLevel = (w.statsByLevel as unknown as WeaponStatByLevelRow[] | null) ?? null;
  const rc = rarityColorVar(w.rarity);

  const breadcrumbItems = [
    { name: "LEIBO", path: "/" },
    { name: t("breadcrumbWeapons"), path: "/weapons" },
    { name: w.name, path: `/weapons/${w.id}` },
  ];

  const materialIds = new Set<string>();
  for (const phase of ascensionMaterials) for (const m of phase.materials) if (m.materialId) materialIds.add(m.materialId);
  const materialIcons = await prisma.material.findMany({
    where: { id: { in: Array.from(materialIds) } },
    select: { id: true, iconUrl: true },
  });
  const materialIconMap = new Map(materialIcons.map((m) => [m.id, m.iconUrl]));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <Breadcrumb items={breadcrumbItems} />

      {/* Hero — viền trên nhuộm màu phẩm cấp (rarity), là yếu tố định danh
          thật của vũ khí (vũ khí không có nguyên tố). */}
      <div className="surface-card overflow-hidden mb-10" style={{ borderTop: `2.5px solid ${rc}` }}>
        <div className="p-6 flex flex-col sm:flex-row gap-6">
          {w.iconUrl && (
            <div
              className="relative w-40 h-40 rounded-xl bg-bg-elevated shrink-0"
              style={{ border: `1px solid color-mix(in srgb, ${rc} 35%, var(--border-color))` }}
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
            <span className="text-eyebrow mb-2">{w.type}</span>
            <h1 className="font-display text-display-2 font-semibold text-text-primary mb-2">{w.name}</h1>
            <p className={`text-lg mb-4 ${rarityTextClass(w.rarity)}`}>{rarityStars(w.rarity)}</p>
            {w.description && <p className="text-sm text-text-primary max-w-xl leading-relaxed bg-bg-elevated p-3 rounded-lg border border-border italic">{w.description}</p>}
          </div>
        </div>
      </div>

      <section className="mb-10">
        <SectionHeading elementColor={rc}>{t("baseStats")}</SectionHeading>
        {statsByLevel && statsByLevel.length > 0 ? (
          <WeaponLevelSlider statsByLevel={statsByLevel} subStatName={w.subStatName} elementColor={rc} />
        ) : (
          <div className="surface-card p-5 flex gap-8 text-sm">
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wide mb-1">{t("baseAtk")}</div>
              <div className="text-lg font-semibold text-text-primary tabular-nums">{formatNumber(w.baseAtk)}</div>
            </div>
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wide mb-1">{w.subStatName ?? t("subStat")}</div>
              <div className="text-lg font-semibold text-text-primary tabular-nums">{w.subStatValue ?? "—"}</div>
            </div>
          </div>
        )}
      </section>

      {ascensionMaterials.length > 0 && (
        <section className="mb-10">
          <SectionHeading elementColor={rc}>{t("ascensionMaterials")}</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ascensionMaterials.map((phase) => (
              <div key={phase.phase} className="surface-card p-4">
                <div className="text-eyebrow mb-3" style={{ color: rc }}>{t("phase", { phase: phase.phase })}</div>
                <ul className="space-y-1.5 text-sm">
                  {phase.materials.map((m, j: number) => {
                    const iconUrl = m.materialId ? materialIconMap.get(m.materialId) : null;
                    return (
                      <li key={j} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 min-w-0">
                          <span className="relative w-6 h-6 shrink-0 rounded bg-bg-elevated border border-border overflow-hidden">
                            {iconUrl ? <SafeImage src={iconUrl} alt={m.name ?? ""} fill sizes="24px" className="object-contain" /> : null}
                          </span>
                          <span className="text-text-secondary truncate">{m.name}</span>
                        </span>
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

      {w.effectName && refinements.length > 0 && (
        <section>
          <SectionHeading elementColor={rc}>{w.effectName}</SectionHeading>
          <div className="space-y-3">
            {refinements.map((r, i) => (
              <div key={i} className="surface-card p-4">
                <div className="font-display font-semibold mb-1" style={{ color: rc }}>
                  {t("refinement", { n: i + 1 })}
                </div>
                <p className="text-sm text-text-secondary whitespace-pre-line">
                  <GlossaryText text={(r as { description?: string } | null)?.description ?? "—"} />
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
