import { getTranslations } from "next-intl/server";
import { SafeImage } from "@/components/ui/SafeImage";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { GlossaryText } from "@/features/glossary/GlossaryText";
import { TalentMaterialSlider } from "./TalentMaterialSlider";
import { getTalentLabel, type Talent, type TalentMaterialLevel } from "@/core/game/character-helpers";
import { getCharacterTalentPriority } from "@/core/game/talent-priority";

export interface CharacterTalentsProps {
  talents: Talent[];
  talentMaterials: TalentMaterialLevel[];
  materialIconRecord: Record<string, { iconUrl: string | null; localizedName: string } | undefined>;
  elementColor: string;
  locale: string;
  character?: {
    id: string;
    name: string;
    weaponType: string;
    vision: string;
  };
}

export async function CharacterTalents({
  talents,
  talentMaterials,
  materialIconRecord,
  elementColor: el,
  locale,
  character,
}: CharacterTalentsProps) {
  if (!talents || talents.length === 0) return null;

  const t = await getTranslations({ locale, namespace: "CharacterDetail" });
  const priority = character ? getCharacterTalentPriority(character) : null;

  return (
    <section className="mb-10">
      <SectionHeading elementColor={el}>{t("skills")}</SectionHeading>

      {priority && (
        <div className="surface-card p-4 rounded-xl border border-accent-500/40 bg-bg-elevated/70 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="text-eyebrow text-accent-bright mb-1 flex items-center gap-1.5">
                <span>⭐</span>
                <span>Thứ tự ưu tiên nâng cấp Thiên Phú</span>
              </div>
              <div className="font-display font-bold text-base sm:text-lg text-text-primary tracking-wide">
                {priority.displayOrderVi}
              </div>
            </div>
            <p className="text-xs text-text-secondary max-w-lg leading-relaxed bg-bg-overlay/60 p-2.5 rounded-lg border border-border">
              {priority.summaryVi}
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {talents.map((tal) => {
          const priorityItem =
            priority && (tal.key === "normalAttack" || tal.key === "elementalSkill" || tal.key === "elementalBurst")
              ? priority.items[tal.key]
              : null;

          return (
            <div key={tal.key} className="surface-card p-5">
              <div className="flex items-start gap-3 mb-2">
                <span className="relative w-10 h-10 shrink-0 rounded skill-icon-frame border overflow-hidden">
                  {tal.icon ? (
                    <SafeImage src={tal.icon} alt={tal.name ?? ""} fill className="object-contain p-1" sizes="40px" />
                  ) : null}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-eyebrow">{getTalentLabel(t, tal.key)}</div>
                  <div className="font-display font-semibold text-base text-text-primary">{tal.name}</div>

                  {priorityItem && (
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                          priorityItem.rank === 1
                            ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
                            : priorityItem.rank === 2
                              ? "bg-purple-500/20 text-purple-300 border-purple-500/40"
                              : priorityItem.canLeaveAtLevel1
                                ? "bg-bg-elevated text-text-muted border-border"
                                : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                        }`}
                      >
                        {priorityItem.rank === 1
                          ? "👑 Ưu tiên #1 (Vương Miện)"
                          : priorityItem.rank === 2
                            ? "⚡ Ưu tiên #2 (Cần thiết)"
                            : priorityItem.canLeaveAtLevel1
                              ? "💤 Có thể để Lv. 1"
                              : "🔹 Tùy chọn (Lv. 6)"}
                      </span>
                      <span className="text-[11px] text-text-secondary italic">
                        {priorityItem.recommendationNote}
                      </span>
                    </div>
                  )}
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
          );
        })}
      </div>
    </section>
  );
}
