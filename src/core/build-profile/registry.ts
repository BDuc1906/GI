/**
 * src/core/build-profile/registry.ts
 *
 * Registry lưu trữ và truy vấn Character Build Profiles đa lối chơi của LEIBO.
 * Đảm bảo tính tương thích ngược hoàn hảo với các hệ thống Enka Showcase, DPS Calculator và Team Builder.
 */

import type { CharacterBuildProfile, CharacterMultiProfileBuild } from "./types";
import type { CharacterBuildEntry } from "@/data/character-builds-data";
import { PIONEER_BUILDS } from "@/data/pioneer-build-profiles";

/**
 * Kho lưu trữ bộ hồ sơ build đa lối chơi (Khởi tạo sẵn với 5 bộ hồ sơ Tiên phong đã kiểm định KQM & KQMS)
 */
export const MULTI_PROFILE_BUILDS: Record<string, CharacterMultiProfileBuild> = {
  ...PIONEER_BUILDS,
};

/**
 * Đăng ký bộ profile build cho một nhân vật
 */
export function registerMultiProfileBuild(build: CharacterMultiProfileBuild): void {
  MULTI_PROFILE_BUILDS[build.characterId.toLowerCase().trim()] = build;
}

/**
 * Lấy toàn bộ danh sách profile của một nhân vật
 */
export function getCharacterMultiProfiles(characterId: string): CharacterBuildProfile[] {
  const entry = MULTI_PROFILE_BUILDS[characterId.toLowerCase().trim()];
  return entry ? entry.profiles : [];
}

/**
 * Lấy 1 profile cụ thể theo profileId (nếu không truyền profileId thì lấy default profile)
 */
export function getCharacterProfile(
  characterId: string,
  profileId?: string
): CharacterBuildProfile | undefined {
  const entry = MULTI_PROFILE_BUILDS[characterId.toLowerCase().trim()];
  if (!entry || entry.profiles.length === 0) return undefined;

  if (profileId) {
    const found = entry.profiles.find((p) => p.profileId === profileId);
    if (found) return found;
  }

  // Mặc định lấy defaultProfileId hoặc profile đầu tiên
  return (
    entry.profiles.find((p) => p.profileId === entry.defaultProfileId) ||
    entry.profiles[0]
  );
}

/**
 * Chuyển đổi một CharacterBuildProfile thành CharacterBuildEntry tương thích ngược
 */
export function profileToLegacyBuildEntry(profile: CharacterBuildProfile): CharacterBuildEntry {
  return {
    status: profile.sourceMetadata.reviewStatus === "VERIFIED" ? undefined : "draft",
    updatedAt: profile.sourceMetadata.verifiedAt,
    playstyleNoteVi: profile.playstyleVi,
    weapons: profile.weapons.map((w) => ({
      weaponId: w.weaponId,
      tier: w.tier,
      noteVi: `${w.refinement !== "R1" ? `[${w.refinement}] ` : ""}${w.noteVi}`,
    })),
    artifacts: profile.artifacts.map((a, idx) => ({
      setIds: a.setIds,
      mode: a.mode,
      noteVi: a.noteVi,
      priority: idx + 1,
    })),
    mainStats: {
      sands: profile.mainStats.sands.join(" / "),
      goblet: profile.mainStats.goblet.join(" / "),
      circlet: profile.mainStats.circlet.join(" / "),
      note: profile.conditionsAndAssumptionsVi,
    },
    subStats: {
      stats: profile.substatsPriority,
      note: `Ưu tiên ER đạt mục tiêu trước (${profile.erRequirements[0]?.recommendedERPercent || 100}%+), sau đó tối ưu sát thương.`,
    },
    talentPriority: {
      order: profile.talentPriority.order,
      note: profile.talentPriority.noteVi,
    },
    teams: profile.recommendedTeams.map((t) => ({
      nameVi: t.nameVi,
      archetypeVi: t.archetypeVi,
      situationVi: t.synergyReasonVi,
      teammateIds: t.teammateIds,
      teammateRoles: t.teammateRoles,
      reactionsVi: [t.archetypeVi],
      resonancesVi: [],
    })),
  };
}
