/**
 * src/features/weapons/types.ts
 *
 * Kiểu dữ liệu chuẩn hóa cho trang chi tiết Vũ Khí (Weapon Detail)
 */

import type { Weapon } from "@prisma/client";
import type { AscensionMaterialPhase } from "@/core/game/character-helpers";
import type { WeaponStatByLevelRow } from "@/features/weapons/components/WeaponLevelSlider";

export interface WeaponMaterialInfo {
  id: string;
  iconUrl: string | null;
  localizedName: string;
}

export interface WeaponRefinementInfo {
  refinement: number;
  description: string;
}

export interface WeaponDetailPageData {
  weapon: Weapon;
  localizedName: string;
  weaponTypeLabel: string;
  rarityColor: string;
  refinements: WeaponRefinementInfo[];
  ascensionMaterials: AscensionMaterialPhase[];
  materialMap: Record<string, WeaponMaterialInfo>;
  statsByLevel: WeaponStatByLevelRow[] | null;
  breadcrumbItems: Array<{ name: string; path: string }>;
}
