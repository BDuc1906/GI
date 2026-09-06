
import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { rarityStars, rarityTextClass, elementColorVar } from "@/lib/ui/theme";
import { ElementIcon } from "@/components/character/ElementIcon";
import { SafeImage } from "@/components/ui/SafeImage";
import { CharacterLevelSlider } from "@/components/character/CharacterLevelSlider";
import { TalentMaterialSlider } from "@/components/character/TalentMaterialSlider";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { GlossaryText } from "@/components/glossary/GlossaryText";
import type { Metadata } from "next";
import {
  getTalentLabel,
  resolveTravelerSibling,
  resolveCharacterCardImage,
  type AscensionMaterialPhase,
  type Constellation,
  type StatByLevelRow,
  type Talent,
  type TalentMaterialLevel,
  type VoiceActors,
} from "@/lib/game/character-helpers";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { getElementNameByKey } from "@/lib/game/element-reactions-data";
import {
  getLocalizedDescription,
  getLocalizedTalents,
  getLocalizedConstellations,
} from "@/lib/i18n/localized-content";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

async function tWeaponTypeMeta(type: string, locale: string): Promise<string> {
  const t = await getTranslations({ locale, namespace: "WeaponType" });
  return t(type as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "CharacterDetail" });
  const c = await prisma.character.findUnique({ where: { id } });
  if (!c) return { title: t("notFoundTitle") };
  return {
    title: `${getLocalizedName(c, locale)} — LEIBO`,
    description: getLocalizedDescription(c, locale) ?? `${getElementNameByKey(c.vision, locale)} · ${await tWeaponTypeMeta(c.weaponType, locale)} · ${c.rarity}★`,
  };
}

export default async function CharacterDetail({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const tWeaponType = await getTranslations({ locale, namespace: "WeaponType" });
  const tRegion = await getTranslations({ locale, namespace: "Region" });
  const t = await getTranslations({ locale, namespace: "CharacterDetail" });
  // "traveler" chỉ có bản dịch trong namespace Characters (dùng chung với
  // trang danh sách nhân vật) — namespace CharacterDetail không có key
  // này, gọi t("traveler") ở đây từng in ra literal "CharacterDetail.traveler"
  // trên MỌI ngôn ngữ. Lấy đúng namespace thay vì tạo bản dịch trùng lặp.
  const tCharacters = await getTranslations({ locale, namespace: "Characters" });
  const c = await prisma.character.findUnique({ where: { id } });
  if (!c) return notFound();

  const { isTraveler, boySplash, girlSplash } = await resolveTravelerSibling(c);
  const el = elementColorVar(c.vision);

  const constellations = getLocalizedConstellations(
    (c.constellations as unknown as Constellation[]) ?? [],
    c.constellationsTranslations,
    locale
  );
  const talents = getLocalizedTalents(
    (c.talents as unknown as Talent[]) ?? [],
    c.talentsTranslations,
    locale
  );
  const localizedDescription = getLocalizedDescription(c, locale);
  const ascensionMaterials = (c.ascensionMaterials as unknown as AscensionMaterialPhase[]) ?? [];
  const statsByLevel = (c.statsByLevel as unknown as StatByLevelRow[]) ?? [];
  const voiceActors = (c.voiceActors as unknown as VoiceActors) ?? null;
  const talentMaterials = (c.talentMaterials as unknown as TalentMaterialLevel[]) ?? [];

  const materialIds = new Set<string>();
  for (const phase of ascensionMaterials) for (const m of phase.materials) if (m.materialId) materialIds.add(m.materialId);
  for (const levelData of talentMaterials) for (const m of levelData.materials) if (m.materialId) materialIds.add(m.materialId);
  // BUG ĐÃ SỬA (2026-09): trước đây chỉ select iconUrl — tên nguyên liệu
  // hiển thị (cả ở phần đột phá lẫn TalentMaterialSlider) dùng snapshot
  // tiếng Anh cứng trong JSON, không bao giờ được dịch. Giờ select thêm
  // name+nameTranslations và dịch qua getLocalizedName.
  const materialRows = await prisma.material.findMany({
    where: { id: { in: Array.from(materialIds) } },
    select: { id: true, iconUrl: true, name: true, nameTranslations: true },
  });
  const materialIconMap = new Map(
    materialRows.map((m) => [m.id, { iconUrl: m.iconUrl, localizedName: getLocalizedName(m, locale) }])
  );
  const materialIconRecord: Record<string, { iconUrl: string | null; localizedName: string } | undefined> =
    Object.fromEntries(materialIconMap);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <BreadcrumbJsonLd
        items={[
          { name: "LEIBO", path: "/" },
          { name: t("breadcrumbCharacters"), path: "/characters" },
          { name: isTraveler ? `${tCharacters("traveler")} (${getElementNameByKey(c.vision, locale)})` : getLocalizedName(c, locale), path: `/characters/${c.id}` },
        ]}
      />

      {/* Hero — viền trên nhuộm đúng màu nguyên tố của nhân vật này, thay
          cho glow vàng chung của bản cũ. Đây là điểm chạm đầu tiên nhắc
          người xem: mỗi nhân vật thuộc về 1 nguyên tố cụ thể. */}
      <div
        className="surface-card overflow-hidden mb-10"
        style={{ borderTop: `2.5px solid ${el}` }}
      >
        <div className="p-6 flex flex-col sm:flex-row gap-6">
          {isTraveler ? (
            <div
              className="relative w-full sm:w-56 aspect-[3/4] rounded-lg overflow-hidden bg-bg-elevated shrink-0"
              style={{ border: `1px solid color-mix(in srgb, ${el} 35%, var(--border-color))` }}
            >
              {boySplash && girlSplash ? (
                <>
                  <div className="absolute inset-0" style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}>
                    <SafeImage src={boySplash} alt={`${c.name} - ${t("boy")}`} fill className="object-cover" sizes="(max-width: 640px) 100vw, 224px" fallbackSrcs={[c.iconUrl, c.iconUrlOriginal]} />
                  </div>
                  <div className="absolute inset-0" style={{ clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)" }}>
                    <SafeImage src={girlSplash} alt={`${c.name} - ${t("girl")}`} fill className="object-cover" sizes="(max-width: 640px) 100vw, 224px" fallbackSrcs={[c.iconUrl, c.iconUrlOriginal]} />
                  </div>
                  <div className="absolute top-0 bottom-0 left-1/2 w-px bg-black/40 -translate-x-1/2" />
                </>
              ) : (
                <SafeImage
                  src={boySplash || girlSplash || c.iconUrl}
                  alt={c.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 224px"
                  priority
                  fallbackSrcs={[c.iconUrl, c.iconUrlOriginal]}
                />
              )}
            </div>
          ) : (
            <div
              className="relative w-full sm:w-56 aspect-[3/4] rounded-lg overflow-hidden bg-bg-elevated shrink-0"
              style={{ border: `1px solid color-mix(in srgb, ${el} 35%, var(--border-color))` }}
            >
              <SafeImage
                src={resolveCharacterCardImage(c)}
                alt={c.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 224px"
                priority
                fallbackSrcs={[c.iconUrl, c.splashUrlOriginal, c.iconUrlOriginal]}
              />
            </div>
          )}

          <div className="flex flex-col justify-center min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <ElementIcon vision={c.vision} iconUrl={c.elementIcon} size={22} />
              <span className="text-eyebrow" style={{ color: el }}>
                {getElementNameByKey(c.vision, locale)} · {tWeaponType(c.weaponType as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst")}
              </span>
            </div>

            <h1 className="font-display text-display-2 font-semibold text-text-primary mb-1">
              {isTraveler ? `${tCharacters("traveler")} (${getElementNameByKey(c.vision, locale)})` : getLocalizedName(c, locale)}
            </h1>

            {c.title && <p className="text-sm text-text-muted italic mb-3">&ldquo;{c.title}&rdquo;</p>}

            <p className={`text-lg mb-4 ${rarityTextClass(c.rarity)}`}>{rarityStars(c.rarity)}</p>

            {(c.region || c.affiliation) && (
              <p className="text-xs text-text-muted mb-2 font-medium uppercase tracking-wider">
                {c.region && <>{t("region")}: <span className="text-text-primary">{tRegion(c.region as "Mondstadt" | "Liyue" | "Inazuma" | "Sumeru" | "Fontaine" | "Natlan" | "Snezhnaya" | "Nod-Krai")}</span></>}
                {c.region && c.affiliation && <span className="mx-2 text-border">·</span>}
                {c.affiliation && <>{t("affiliation")}: <span className="text-text-primary">{c.affiliation}</span></>}
              </p>
            )}

            {(c.birthday || c.constellationName || c.gameVersion) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted mb-3">
                {c.birthday && <span>{t("birthday")}: <span className="text-text-primary">{c.birthday}</span></span>}
                {c.constellationName && <span>{t("constellationName")}: <span className="text-text-primary">{c.constellationName}</span></span>}
                {c.gameVersion && <span>{t("releaseVersion")}: <span className="text-text-primary">{c.gameVersion}</span></span>}
              </div>
            )}

            {localizedDescription && (
              <p className="text-sm text-text-primary max-w-xl leading-relaxed bg-bg-elevated p-3 rounded-lg border border-border italic mb-3">
                {localizedDescription}
              </p>
            )}

            {voiceActors && (voiceActors.japanese || voiceActors.english || voiceActors.chinese || voiceActors.korean) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-text-muted mb-2">
                {voiceActors.japanese && <span>🇯🇵 {voiceActors.japanese}</span>}
                {voiceActors.english && <span>🇬🇧 {voiceActors.english}</span>}
                {voiceActors.chinese && <span>🇨🇳 {voiceActors.chinese}</span>}
                {voiceActors.korean && <span>🇰🇷 {voiceActors.korean}</span>}
              </div>
            )}

            {c.wikiUrl && (
              <a href={c.wikiUrl} target="_blank" rel="noopener noreferrer" className="text-xs underline underline-offset-2 w-fit" style={{ color: el }}>
                {t("viewOnWiki")} &rarr;
              </a>
            )}
          </div>
        </div>
      </div>

      {statsByLevel.length > 0 && (
        <section className="mb-10">
          <SectionHeading elementColor={el}>{t("statsByLevel")}</SectionHeading>
          <CharacterLevelSlider statsByLevel={statsByLevel} ascensionStat={c.ascensionStat} elementColor={el} />
        </section>
      )}

      {ascensionMaterials.length > 0 && (
        <section className="mb-10">
          <SectionHeading elementColor={el}>{t("ascensionMaterials")}</SectionHeading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ascensionMaterials.map((phase) => (
              <div key={phase.phase} className="surface-card p-4">
                <div className="text-eyebrow mb-3" style={{ color: el }}>{t("phase", { phase: phase.phase })}</div>
                <ul className="space-y-1.5 text-sm">
                  {phase.materials.map((m, j) => {
                    const material = m.materialId ? materialIconMap.get(m.materialId) : null;
                    return (
                      <li key={j} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 min-w-0">
                          <span className="relative w-6 h-6 shrink-0 rounded bg-bg-elevated border border-border overflow-hidden">
                            {material?.iconUrl ? <SafeImage src={material.iconUrl} alt={material?.localizedName ?? m.name ?? ""} fill className="object-contain" sizes="24px" /> : null}
                          </span>
                          <span className="text-text-secondary truncate">{material?.localizedName ?? m.name}</span>
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

      {talents.length > 0 && (
        <section className="mb-10">
          <SectionHeading elementColor={el}>{t("skills")}</SectionHeading>
          <div className="space-y-4">
            {talents.map((tal) => (
              <div key={tal.key} className="surface-card p-5">
                <div className="flex items-start gap-3 mb-2">
                  <span className="relative w-10 h-10 shrink-0 rounded skill-icon-frame border overflow-hidden">
                    {tal.icon ? <SafeImage src={tal.icon} alt={tal.name ?? ""} fill className="object-contain p-1" sizes="40px" /> : null}
                  </span>
                  <div>
                    <div className="text-eyebrow">{getTalentLabel(t, tal.key)}</div>
                    <div className="font-display font-semibold text-base text-text-primary">{tal.name}</div>
                  </div>
                </div>

                {tal.description && (
                  <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line mb-3"><GlossaryText text={tal.description} /></p>
                )}

                {tal.attributes && tal.attributes.length > 0 && (
                  <div className="overflow-x-auto mb-1 rounded-lg border border-border">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr>
                          <th className="py-1.5 px-3 text-left font-semibold whitespace-nowrap border-r border-border">{t("level")}</th>
                          {Array.from({ length: Math.max(...tal.attributes.map((r) => r.values.length)) }, (_, i) => i + 1).map((lv) => (
                            <th key={lv} className="py-1.5 px-2 text-center font-semibold whitespace-nowrap tabular-nums">{lv}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {tal.attributes.map((row, i) => (
                          <tr key={i}>
                            <td className="py-1.5 px-3 text-text-muted whitespace-nowrap align-top border-r border-border">{row.label}</td>
                            {row.values.map((v, j) => (
                              <td key={j} className="py-1.5 px-2 text-center text-text-primary whitespace-nowrap tabular-nums">{v}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {talentMaterials.length > 0 && ["normalAttack", "elementalSkill", "elementalBurst"].includes(tal.key) && (
                  <TalentMaterialSlider talentMaterials={talentMaterials} materialIconMap={materialIconRecord} elementColor={el} />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {constellations.length > 0 && (
        <section className="mb-10">
          <SectionHeading elementColor="var(--rarity-4)">{t("constellationSystem")}</SectionHeading>
          <div className="space-y-4">
            {constellations.map((cs, i: number) => (
              <div key={i} className="surface-card p-5">
                <div className="flex items-start gap-3 mb-2">
                  <span className="relative w-10 h-10 shrink-0 rounded skill-icon-frame border overflow-hidden">
                    {cs.icon ? <SafeImage src={cs.icon} alt={cs.name ?? ""} fill className="object-contain p-1" sizes="40px" /> : null}
                  </span>
                  <div className="font-display font-semibold text-base text-[color:var(--rarity-4)]">
                    C{i + 1} · {cs.name}
                  </div>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line"><GlossaryText text={cs.description} /></p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
