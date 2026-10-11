import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { PLAYABLE_CHARACTER_FILTER } from "@/core/game/character-catalog";
import {
  ELEMENTAL_REACTIONS,
  ELEMENTAL_RESONANCES,
  getElementNameByKey,
  getReactionName,
  getResonanceName,
} from "@/core/game/element-reactions-data";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { TeamBuilderClient, type BuilderChar } from "@/features/team-builder/components/TeamBuilderClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ main?: string; focus?: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return createLocalizedMetadata({
    locale,
    pathname: "tools/team-builder",
    title: "Dựng đội hình Genshin Impact theo phản ứng nguyên tố | LEIBO",
    description:
      "Gợi ý đội hình theo phản ứng nguyên tố và cộng hưởng, chọn nhân vật bạn đang có và nhận phương án thay thế khi thiếu nhân vật.",
  });
}

/** Loại phản ứng được tính điểm tự động (Lunar/Stellar cần nhân vật cụ thể nên không đưa vào lựa chọn trọng tâm). */
const SCORED = new Set(["amplifying", "transformative", "additive"]);

export default async function TeamBuilderPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const rows = await withDbRetry(() =>
    prisma.character.findMany({
      where: PLAYABLE_CHARACTER_FILTER,
      select: {
        id: true,
        name: true,
        nameTranslations: true,
        vision: true,
        rarity: true,
        iconUrl: true,
        iconUrlOriginal: true,
      },
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
    })
  );

  const knownElements = new Set(ELEMENTAL_REACTIONS.flatMap((r) => r.elements));
  const characters: BuilderChar[] = rows
    .filter((r) => knownElements.has(r.vision))
    .map((r) => ({
      id: r.id,
      name: r.name,
      label: getLocalizedName(r, locale),
      element: r.vision,
      rarity: r.rarity,
      icons: [r.iconUrl, r.iconUrlOriginal].filter((u): u is string => Boolean(u)),
    }));

  const ids = new Set(characters.map((c) => c.id));
  const initialPinned = sp.main && ids.has(sp.main) ? [sp.main] : [];
  const initialFocus = ELEMENTAL_REACTIONS.some((r) => r.id === sp.focus && SCORED.has(r.category)) ? (sp.focus ?? "") : "";

  const breadcrumbItems = [
    { name: "LEIBO", path: "/" },
    { name: "Công cụ", path: "/tools/team-builder" },
    { name: "Dựng đội hình", path: "/tools/team-builder" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <BreadcrumbJsonLd locale={locale} items={breadcrumbItems} />
      <Breadcrumb items={breadcrumbItems} />

      <h1 className="font-display text-display-2 font-semibold text-text-primary mb-3">Dựng đội hình</h1>
      <p className="text-text-secondary mb-8 max-w-3xl">
        Chọn các nhân vật bạn đang có, ghim người bạn muốn giữ, công cụ gợi ý đội 4 người theo phản ứng nguyên tố
        và cộng hưởng, kèm phương án thay thế cho từng ô.
      </p>

      <TeamBuilderClient
        characters={characters}
        reactions={ELEMENTAL_REACTIONS.map((r) => ({
          id: r.id,
          elements: r.elements,
          category: r.category,
          requiresCharacters: r.requiresCharacters,
        }))}
        resonances={ELEMENTAL_RESONANCES.map((r) => ({ id: r.id, element: r.element }))}
        names={{
          reactions: Object.fromEntries(ELEMENTAL_REACTIONS.map((r) => [r.id, getReactionName(r, locale)])),
          resonances: Object.fromEntries(ELEMENTAL_RESONANCES.map((r) => [r.id, getResonanceName(r, locale)])),
          elements: Object.fromEntries([...knownElements].map((e) => [e, getElementNameByKey(e, locale)])),
        }}
        focusOptions={ELEMENTAL_REACTIONS.filter((r) => SCORED.has(r.category)).map((r) => ({
          id: r.id,
          name: getReactionName(r, locale),
        }))}
        initialPinned={initialPinned}
        initialFocus={initialFocus}
      />
    </div>
  );
}
