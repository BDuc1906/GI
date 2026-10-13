import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { elementColorVar } from "@/lib/ui/theme";
import { CharacterLevelSlider } from "@/features/characters/components/CharacterLevelSlider";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { CharacterHero } from "@/features/characters/components/CharacterHero";
import { CharacterAscension } from "@/features/characters/components/CharacterAscension";
import { CharacterTalents } from "@/features/characters/components/CharacterTalents";
import { CharacterConstellations } from "@/features/characters/components/CharacterConstellations";
import { CharacterSimilarSection } from "@/features/characters/components/CharacterSimilarSection";
import type { Metadata } from "next";
import {
  resolveTravelerSibling,
  type AscensionMaterialPhase,
  type Constellation,
  type StatByLevelRow,
  type Talent,
  type TalentMaterialLevel,
  type VoiceActors,
} from "@/core/game/character-helpers";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { getElementNameByKey } from "@/core/game/element-reactions-data";
import {
  getLocalizedDescription,
  getLocalizedTalents,
  getLocalizedConstellations,
} from "@/lib/i18n/localized-content";
import { isNonPlayableCharacterId } from "@/core/game/character-catalog";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { Link } from "@/i18n/navigation";
import { getSimilarCharacters } from "@/features/similarity/similarity-service";

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
  if (isNonPlayableCharacterId(id)) {
    return createLocalizedMetadata({
      locale,
      pathname: `characters/${id}`,
      title: t("notFoundTitle"),
      robots: { index: false, follow: false },
    });
  }
  const c = await prisma.character.findUnique({ where: { id } });
  if (!c) {
    return createLocalizedMetadata({
      locale,
      pathname: `characters/${id}`,
      title: t("notFoundTitle"),
      robots: { index: false, follow: false },
    });
  }
  const title = `${getLocalizedName(c, locale)} — LEIBO`;
  const description =
    getLocalizedDescription(c, locale) ??
    `${getElementNameByKey(c.vision, locale)} · ${await tWeaponTypeMeta(c.weaponType, locale)} · ${c.rarity}★`;
  return createLocalizedMetadata({
    locale,
    pathname: `characters/${id}`,
    imagePath: `characters/${id}/opengraph-image`,
    title,
    description,
  });
}

export default async function CharacterDetail({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  if (isNonPlayableCharacterId(id)) return notFound();

  const c = await prisma.character.findUnique({ where: { id } });
  if (!c) return notFound();

  const t = await getTranslations({ locale, namespace: "CharacterDetail" });
  const tCharacters = await getTranslations({ locale, namespace: "Characters" });

  const { isTraveler, boySplash, girlSplash } = await resolveTravelerSibling(c);
  const el = elementColorVar(c.vision);
  const similar = await getSimilarCharacters(c.id);

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
  for (const phase of ascensionMaterials) {
    for (const m of phase.materials) {
      if (m.materialId) materialIds.add(m.materialId);
    }
  }
  for (const levelData of talentMaterials) {
    for (const m of levelData.materials) {
      if (m.materialId) materialIds.add(m.materialId);
    }
  }

  const materialRows = await prisma.material.findMany({
    where: { id: { in: Array.from(materialIds) } },
    select: { id: true, iconUrl: true, name: true, nameTranslations: true },
  });
  const materialIconMap = new Map(
    materialRows.map((m) => [m.id, { iconUrl: m.iconUrl, localizedName: getLocalizedName(m, locale) }])
  );
  const materialIconRecord = Object.fromEntries(materialIconMap);

  const characterName = isTraveler
    ? `${tCharacters("traveler")} (${getElementNameByKey(c.vision, locale)})`
    : getLocalizedName(c, locale);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <BreadcrumbJsonLd
        locale={locale}
        items={[
          { name: "LEIBO", path: "/" },
          { name: t("breadcrumbCharacters"), path: "/characters" },
          { name: characterName, path: `/characters/${c.id}` },
        ]}
      />

      <CharacterHero
        character={c}
        isTraveler={isTraveler}
        boySplash={boySplash}
        girlSplash={girlSplash}
        locale={locale}
        elementColor={el}
        localizedDescription={localizedDescription}
        voiceActors={voiceActors}
      />

      {statsByLevel.length > 0 && (
        <section className="mb-10">
          <SectionHeading elementColor={el}>{t("statsByLevel")}</SectionHeading>
          <CharacterLevelSlider statsByLevel={statsByLevel} ascensionStat={c.ascensionStat} elementColor={el} />
        </section>
      )}

      <CharacterAscension
        ascensionMaterials={ascensionMaterials}
        materialIconMap={materialIconMap}
        elementColor={el}
        locale={locale}
      />

      <CharacterTalents
        talents={talents}
        talentMaterials={talentMaterials}
        materialIconRecord={materialIconRecord}
        elementColor={el}
        locale={locale}
      />

      <CharacterConstellations
        constellations={constellations}
        locale={locale}
      />

      <CharacterSimilarSection
        similar={similar}
        vision={c.vision}
        elementColor={el}
        locale={locale}
      />

      <section className="mb-10">
        <Link
          href={`/tools/team-builder?main=${c.id}`}
          className="inline-block px-4 py-2 rounded-lg border border-accent-500/60 bg-bg-elevated text-accent-bright font-medium hover:border-accent-500 transition-colors"
        >
          Dựng đội hình với {getLocalizedName(c, locale)}
        </Link>
      </section>
    </div>
  );
}