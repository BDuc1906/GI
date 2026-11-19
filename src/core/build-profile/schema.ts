/**
 * src/core/build-profile/schema.ts
 *
 * Zod validation schema cho Character Build Profile.
 * Kiểm tra tính toàn vẹn cấu trúc dữ liệu trước khi lưu trữ hoặc xuất bản.
 */

import { z } from "zod";

export const BuildReviewStatusSchema = z.enum([
  "VERIFIED",
  "IN_REVIEW",
  "DRAFT",
  "OUTDATED",
  "MISSING",
]);

export const WeaponRankingOptionSchema = z.object({
  weaponId: z.string().min(1),
  tier: z.enum(["S", "A", "B", "C"]),
  refinement: z.enum(["R1", "R5", "R1-R5"]),
  relativeDpsPercent: z.number().positive().optional(),
  conditionVi: z.string().min(1),
  noteVi: z.string().min(1),
});

export const ArtifactRankingOptionSchema = z.object({
  mode: z.enum(["4pc", "2+2"]),
  setIds: z.union([z.tuple([z.string()]), z.tuple([z.string(), z.string()])]),
  tier: z.enum(["S", "A", "B"]),
  relativeEfficiencyPercent: z.number().positive().optional(),
  conditionVi: z.string().min(1),
  noteVi: z.string().min(1),
});

export const ERRequirementBreakdownSchema = z.object({
  teamScenarioVi: z.string().min(1),
  recommendedERPercent: z.number().min(100),
  erRangePercent: z.tuple([z.number(), z.number()]),
  assumedRotationVi: z.string().min(1),
});

export const RecommendedTeamOptionSchema = z.object({
  nameVi: z.string().min(1),
  archetypeVi: z.string().min(1),
  teammateIds: z.tuple([z.string(), z.string(), z.string()]),
  teammateRoles: z.tuple([z.string(), z.string(), z.string()]),
  synergyReasonVi: z.string().min(1),
  sampleRotationVi: z.string().min(1),
});

export const BuildSourceMetadataSchema = z.object({
  primarySource: z.enum([
    "KeqingMains Quick Guide",
    "KeqingMains Extended Guide",
    "KQMS Theorycrafting",
    "Genshin Optimizer Verified",
    "Game In-Engine Verified",
  ]),
  sourceUrl: z.string().url(),
  sourceVersion: z.string().min(1),
  verifiedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  gameVersionVerified: z.string().min(1),
  reviewer: z.string().min(1),
  reviewStatus: BuildReviewStatusSchema,
});

export const CharacterBuildProfileSchema = z.object({
  profileId: z.string().min(1),
  characterId: z.string().min(1),
  nameVi: z.string().min(1),
  role: z.enum([
    "Main DPS",
    "Sub-DPS",
    "Support / Buffer",
    "Healer",
    "Shielder",
    "Hyperbloom Trigger",
    "Driver",
  ]),
  playstyleVi: z.string().min(1),
  conditionsAndAssumptionsVi: z.string().min(1),
  weapons: z.array(WeaponRankingOptionSchema).min(1),
  artifacts: z.array(ArtifactRankingOptionSchema).min(1),
  mainStats: z.object({
    sands: z.array(z.string()).min(1),
    goblet: z.array(z.string()).min(1),
    circlet: z.array(z.string()).min(1),
  }),
  substatsPriority: z.array(z.string()).min(1),
  statGoals: z.record(z.string(), z.string()).optional(),
  erRequirements: z.array(ERRequirementBreakdownSchema).min(1),
  talentPriority: z.object({
    order: z.tuple([z.string(), z.string(), z.string()]),
    noteVi: z.string().min(1),
  }),
  recommendedTeams: z.array(RecommendedTeamOptionSchema).min(1),
  sourceMetadata: BuildSourceMetadataSchema,
});

export const CharacterMultiProfileBuildSchema = z.object({
  characterId: z.string().min(1),
  characterName: z.string().min(1),
  defaultProfileId: z.string().min(1),
  profiles: z.array(CharacterBuildProfileSchema).min(1),
});
