/**
 * src/features/weapons/services/weapon-detail-service.ts
 *
 * Tách biệt nghiệp vụ chuẩn bị dữ liệu chi tiết vũ khí (Single Responsibility Principle):
 * Truy vấn database, biên dịch bản địa hóa, phân giải nguyên liệu đột phá và chuẩn bị breadcrumbs.
 */

import { prisma } from "@/lib/db/prisma";
import { getWeaponById } from "@/lib/db/cached-queries";
import { getTranslations } from "next-intl/server";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { getLocalizedRefinements } from "@/lib/i18n/localized-content";
import { rarityColorVar } from "@/lib/ui/theme";
import type { AscensionMaterialPhase } from "@/core/game/character-helpers";
import type { WeaponStatByLevelRow } from "@/features/weapons/components/WeaponLevelSlider";
import type { WeaponDetailPageData, WeaponMaterialInfo } from "../types";

export async function getWeaponDetailPageData(
  id: string,
  locale: string
): Promise<WeaponDetailPageData | null> {
  const w = await getWeaponById(id);
  if (!w) return null;

  const t = await getTranslations({ locale, namespace: "WeaponDetail" });
  const tWeaponType = await getTranslations({ locale, namespace: "WeaponType" });

  const rawPassive = (w.passiveByRefinement as unknown as { description: string }[]) ?? [];
  const localizedRefinements = getLocalizedRefinements(
    rawPassive,
    w.passiveByRefinementTranslations,
    locale,
    w.name
  );

  const refinements = localizedRefinements.map((r, i) => ({
    refinement: i + 1,
    description: r.description ?? "—",
  }));

  const ascensionMaterials = (w.ascensionMaterials as unknown as AscensionMaterialPhase[]) ?? [];
  const statsByLevel = (w.statsByLevel as unknown as WeaponStatByLevelRow[] | null) ?? null;
  const rc = rarityColorVar(w.rarity);
  const localizedName = getLocalizedName(w, locale);

  const breadcrumbItems = [
    { name: "LEIBO", path: "/" },
    { name: t("breadcrumbWeapons"), path: "/weapons" },
    { name: localizedName, path: `/weapons/${w.id}` },
  ];

  // Trích xuất và nạp thông tin hình ảnh nguyên liệu đột phá
  const materialIds = new Set<string>();
  for (const phase of ascensionMaterials) {
    for (const m of phase.materials) {
      if (m.materialId) materialIds.add(m.materialId);
    }
  }

  const materialRows = await prisma.material.findMany({
    where: { id: { in: Array.from(materialIds) } },
    select: { id: true, iconUrl: true, name: true, nameTranslations: true },
  });

  const materialMap: Record<string, WeaponMaterialInfo> = {};
  for (const m of materialRows) {
    materialMap[m.id] = {
      id: m.id,
      iconUrl: m.iconUrl,
      localizedName: getLocalizedName(m, locale),
    };
  }

  return {
    weapon: w,
    localizedName,
    weaponTypeLabel: tWeaponType(w.type as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst"),
    rarityColor: rc,
    refinements,
    ascensionMaterials,
    materialMap,
    statsByLevel,
    breadcrumbItems,
  };
}
