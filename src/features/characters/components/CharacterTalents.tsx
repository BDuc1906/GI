import { getTranslations } from "next-intl/server";
import { SafeImage } from "@/components/ui/SafeImage";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { GlossaryText } from "@/features/glossary/GlossaryText";
import { TalentMaterialSlider } from "./TalentMaterialSlider";
import { getTalentLabel, type Talent, type TalentMaterialLevel } from "@/core/game/character-helpers";

export interface CharacterTalentsProps {
  talents: Talent[];
  talentMaterials: TalentMaterialLevel[];
  materialIconRecord: Record<string, { iconUrl: string | null; localizedName: string } | undefined>;
  elementColor: string;
  locale: string;
}

export async function CharacterTalents({
  talents,
  talentMaterials,
  materialIconRecord,
  elementColor: el,
  locale,
}: CharacterTalentsProps) {
  if (!talents || talents.length === 0) return null;

  const t = await getTranslations({ locale, namespace: "CharacterDetail" });

  return (
    <section className="mb-10">
      <SectionHeading elementColor={el}>{t("skills")}</SectionHeading>
      <div className="space-y-4">
        {talents.map((tal) => (
          <div key={tal.key} className="surface-card p-5">
            <div className="flex items-start gap-3 mb-2">
              <span className="relative w-10 h-10 shrink-0 rounded skill-icon-frame border overflow-hidden">
                {tal.icon ? (
                  <SafeImage src={tal.icon} alt={tal.name ?? ""} fill className="object-contain p-1" sizes="40px" />
                ) : null}
              </span>
              <div>
                <div className="text-eyebrow">{getTalentLabel(t, tal.key)}</div>
                <div className="font-display font-semibold text-base text-text-primary">{tal.name}</div>
              </div>
            </div>

            {tal.description && (
              <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line mb-3">
                <GlossaryText text={tal.description} />
              </p>
            )}

            {tal.attributes && tal.attributes.length > 0 && (
              <div className="overflow-x-auto mb-1 rounded-lg border border-border">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr>
                      <th className="py-1.5 px-3 text-left font-semibold whitespace-nowrap border-r border-border">
                        {t("level")}
                      </th>
                      {Array.from(
                        { length: Math.max(...tal.attributes.map((r) => r.values.length)) },
                        (_, i) => i + 1
                      ).map((lv) => (
                        <th key={lv} className="py-1.5 px-2 text-center font-semibold whitespace-nowrap tabular-nums">
                          {lv}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tal.attributes.map((row, i) => (
                      <tr key={i}>
                        <td className="py-1.5 px-3 text-text-muted whitespace-nowrap align-top border-r border-border">
                          {row.label}
                        </td>
                        {row.values.map((v, j) => (
                          <td key={j} className="py-1.5 px-2 text-center text-text-primary whitespace-nowrap tabular-nums">
                            {v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {talentMaterials.length > 0 &&
              ["normalAttack", "elementalSkill", "elementalBurst"].includes(tal.key) && (
                <TalentMaterialSlider
                  talentMaterials={talentMaterials}
                  materialIconMap={materialIconRecord}
                  elementColor={el}
                />
              )}
          </div>
        ))}
      </div>
    </section>
  );
}
