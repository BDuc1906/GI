import { getTranslations } from "next-intl/server";
import { SafeImage } from "@/components/ui/SafeImage";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { GlossaryText } from "@/features/glossary/GlossaryText";
import type { Constellation } from "@/core/game/character-helpers";

export interface CharacterConstellationsProps {
  constellations: Constellation[];
  locale: string;
}

export async function CharacterConstellations({
  constellations,
  locale,
}: CharacterConstellationsProps) {
  if (!constellations || constellations.length === 0) return null;

  const t = await getTranslations({ locale, namespace: "CharacterDetail" });

  return (
    <section className="mb-10">
      <SectionHeading elementColor="var(--rarity-4)">
        {t("constellationSystem")}
      </SectionHeading>
      <div className="space-y-4">
        {constellations.map((cs, i: number) => (
          <div key={i} className="surface-card p-5">
            <div className="flex items-start gap-3 mb-2">
              <span className="relative w-10 h-10 shrink-0 rounded skill-icon-frame border overflow-hidden">
                {cs.icon ? (
                  <SafeImage
                    src={cs.icon}
                    alt={cs.name ?? ""}
                    fill
                    className="object-contain p-1"
                    sizes="40px"
                  />
                ) : null}
              </span>
              <div className="font-display font-semibold text-base text-[color:var(--rarity-4)]">
                C{i + 1} · {cs.name}
              </div>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
              <GlossaryText text={cs.description} />
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
