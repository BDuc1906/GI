import {
  getCharacterById,
  getCachedMaterialsByIds,
  getCachedAllPlayableCharacters,
} from "@/lib/db/cached-queries";
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
import { RecommendedBuildTab } from "@/features/characters/components/RecommendedBuildTab";
import { CharacterTeamVariants } from "@/features/characters/components/CharacterTeamVariants";
import { CharacterStickerGallery } from "@/features/characters/components/CharacterStickerGallery";
import { CharacterAnchorNav } from "@/features/characters/components/CharacterAnchorNav";
import { ReportIssueModal } from "@/components/ui/ReportIssueModal";
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

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const characters = await getCachedAllPlayableCharacters();
    return characters.flatMap((c) => [
      { locale: "vi", id: c.id },
      { locale: "en", id: c.id },
    ]);
  } catch {
    return [];
  }
}

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
  const c = await getCharacterById(id);
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

  const c = await getCharacterById(id);
  if (!c) return notFound();

  const t = await getTranslations({ locale, namespace: "CharacterDetail" });
  const tCharacters = await getTranslations({ locale, namespace: "Characters" });

  const { isTraveler, boySplash, girlSplash } = await resolveTravelerSibling(c);
  const el = elementColorVar(c.vision);

  const constellations = getLocalizedConstellations(
    (c.constellations as unknown as Constellation[]) ?? [],
    c.constellationsTranslations,
    locale,
    c.name
  );
  const talents = getLocalizedTalents(
    (c.talents as unknown as Talent[]) ?? [],
    c.talentsTranslations,
    locale,
    c.name
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

  const materialRows = await getCachedMaterialsByIds(Array.from(materialIds).sort());
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

      <div id="hero">
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
      </div>

      <CharacterAnchorNav elementColor={el} />

      {/* 2. Build khuyên dùng (Đưa lên đầu ngay dưới Hero / Anchor) */}
      <div id="build" className="scroll-mt-24">
        <RecommendedBuildTab
          character={c}
          locale={locale}
          elementColor={el}
        />
      </div>

      {/* 3. Đội hình đề xuất */}
      <div id="teams" className="scroll-mt-24">
        <CharacterTeamVariants
          character={c}
          locale={locale}
          elementColor={el}
        />
      </div>

      {/* 4. Chỉ số nhân vật */}
      {statsByLevel.length > 0 && (
        <div id="stats" className="scroll-mt-24">
          <section className="mb-10">
            <SectionHeading elementColor={el}>{t("statsByLevel")}</SectionHeading>
            <CharacterLevelSlider statsByLevel={statsByLevel} ascensionStat={c.ascensionStat} elementColor={el} />
          </section>
        </div>
      )}



      {/* 5. Thiên phú */}
      <div id="talents" className="scroll-mt-24">
        <CharacterTalents
          talents={talents}
          talentMaterials={talentMaterials}
          materialIconRecord={materialIconRecord}
          elementColor={el}
          locale={locale}
          character={c}
        />
      </div>

      {/* 6. Cung mệnh */}
      <div id="constellations" className="scroll-mt-24">
        <CharacterConstellations
          constellations={constellations}
          locale={locale}
        />
      </div>

      {/* 7. Nguyên liệu nâng cấp */}
      <div id="materials" className="scroll-mt-24">
        <CharacterAscension
          ascensionMaterials={ascensionMaterials}
          materialIconMap={materialIconMap}
          elementColor={el}
          locale={locale}
        />
      </div>



      {/* 8. Nội dung bổ sung (Bộ sưu tập Sticker) */}
      <div id="extras" className="scroll-mt-24 space-y-8">
        <CharacterStickerGallery characterId={c.id} elementColor={el} />

        {/* Footer data provenance & report issue */}
        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <span>Dữ liệu được đối chiếu với cơ sở dữ liệu Genshin Impact chính thức.</span>
          <ReportIssueModal entityType="character" entityId={c.id} entityName={c.name} />
        </div>
      </div>


    </div>
  );
}