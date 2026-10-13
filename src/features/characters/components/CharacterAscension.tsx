import { getTranslations } from "next-intl/server";
import { SafeImage } from "@/components/ui/SafeImage";
import { SectionHeading } from "@/components/layout/SectionHeading";
import type { AscensionMaterialPhase } from "@/core/game/character-helpers";

export interface CharacterAscensionProps {
  ascensionMaterials: AscensionMaterialPhase[];
  materialIconMap: Map<string, { iconUrl: string | null; localizedName: string }>;
  elementColor: string;
  locale: string;
}

export async function CharacterAscension({
  ascensionMaterials,
  materialIconMap,
  elementColor: el,
  locale,
}: CharacterAscensionProps) {
  if (!ascensionMaterials || ascensionMaterials.length === 0) return null;

  const t = await getTranslations({ locale, namespace: "CharacterDetail" });

  return (
    <section className="mb-10">
      <SectionHeading elementColor={el}>{t("ascensionMaterials")}</SectionHeading>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ascensionMaterials.map((phase) => (
          <div key={phase.phase} className="surface-card p-4">
            <div className="text-eyebrow mb-3" style={{ color: el }}>
              {t("phase", { phase: phase.phase })}
            </div>
            <ul className="space-y-1.5 text-sm">
              {phase.materials.map((m, j) => {
                const material = m.materialId ? materialIconMap.get(m.materialId) : null;
                return (
                  <li key={j} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="relative w-6 h-6 shrink-0 rounded bg-bg-elevated border border-border overflow-hidden">
                        {material?.iconUrl ? (
                          <SafeImage
                            src={material.iconUrl}
                            alt={material?.localizedName ?? m.name ?? ""}
                            fill
                            className="object-contain"
                            sizes="24px"
                          />
                        ) : null}
                      </span>
                      <span className="text-text-secondary truncate">
                        {material?.localizedName ?? m.name}
                      </span>
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
  );
}
