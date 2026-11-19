// src/app/api/admin/builds/route.ts
/**
 * GET /api/admin/builds
 * POST /api/admin/builds
 *
 * API kiểm định và quản lý Build Database cho Admin Dashboard.
 * Thống kê mức độ bao phủ (Coverage), trạng thái từng nhân vật (Verified, In Review, Draft, Outdated, Missing)
 * và chạy 4-layer validation engine.
 */

import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, fail } from "@/lib/api/response";
import { requireAdmin } from "@/agent/utils/auth";
import { NON_PLAYABLE_CHARACTER_IDS } from "@/core/game/character-catalog";
import { MULTI_PROFILE_BUILDS } from "@/core/build-profile";
import { CHARACTER_BUILDS } from "@/data/character-builds-data";
import { DRAFT_BUILDS } from "@/data/character-builds-draft";
import { BuildProfileValidator, type BuildValidationResult } from "@/core/build-profile/validator";
import type { BuildReviewStatus } from "@/core/build-profile/types";

export const dynamic = "force-dynamic";

export interface AdminCharacterBuildSummary {
  id: string;
  name: string;
  vision: string;
  weaponType: string;
  rarity: number;
  profilesCount: number;
  profiles: Array<{
    profileId: string;
    nameVi: string;
    role: string;
    reviewStatus: BuildReviewStatus;
    primarySource: string;
    sourceUrl: string;
    gameVersionVerified: string;
    verifiedAt: string;
    reviewer: string;
    validation?: BuildValidationResult;
  }>;
  overallStatus: BuildReviewStatus;
  primarySource?: string;
  verifiedAt?: string;
  reviewer?: string;
  hasErrors: boolean;
  warningsCount: number;
}

export interface AdminBuildsResponse {
  metrics: {
    totalPlayable: number;
    verifiedCount: number;
    inReviewCount: number;
    draftCount: number;
    outdatedCount: number;
    missingCount: number;
    coveragePercent: number;
    targetPercent: number;
  };
  characters: AdminCharacterBuildSummary[];
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
  } catch (error) {
    return fail(403, "FORBIDDEN", error instanceof Error ? error.message : "Yêu cầu quyền admin");
  }

  try {
    const dbCharacters = await prisma.character.findMany({
      select: {
        id: true,
        name: true,
        vision: true,
        weaponType: true,
        rarity: true,
      },
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
    });

    const nonPlayableSet = new Set<string>(NON_PLAYABLE_CHARACTER_IDS as readonly string[]);
    const playable = dbCharacters.filter((c) => !nonPlayableSet.has(c.id));

    const validator = new BuildProfileValidator();
    const characterSummaries: AdminCharacterBuildSummary[] = [];

    let verifiedCount = 0;
    let inReviewCount = 0;
    let draftCount = 0;
    let outdatedCount = 0;
    let missingCount = 0;

    for (const c of playable) {
      const normalizedId = c.id.toLowerCase().trim();
      const multiBuild = MULTI_PROFILE_BUILDS[normalizedId];

      if (multiBuild && multiBuild.profiles.length > 0) {
        // Có Multi-profile KQM build
        const validatedProfiles = await Promise.all(
          multiBuild.profiles.map(async (prof) => {
            const val = await validator.validate(prof);
            return {
              profileId: prof.profileId,
              nameVi: prof.nameVi,
              role: prof.role,
              reviewStatus: prof.sourceMetadata.reviewStatus,
              primarySource: prof.sourceMetadata.primarySource,
              sourceUrl: prof.sourceMetadata.sourceUrl,
              gameVersionVerified: prof.sourceMetadata.gameVersionVerified,
              verifiedAt: prof.sourceMetadata.verifiedAt,
              reviewer: prof.sourceMetadata.reviewer,
              validation: val,
            };
          })
        );

        const hasVerified = validatedProfiles.some((p) => p.reviewStatus === "VERIFIED");
        const hasOutdated = validatedProfiles.some((p) => p.reviewStatus === "OUTDATED");
        const hasInReview = validatedProfiles.some((p) => p.reviewStatus === "IN_REVIEW");

        let overallStatus: BuildReviewStatus = "DRAFT";
        if (hasVerified) {
          overallStatus = "VERIFIED";
          verifiedCount++;
        } else if (hasOutdated) {
          overallStatus = "OUTDATED";
          outdatedCount++;
        } else if (hasInReview) {
          overallStatus = "IN_REVIEW";
          inReviewCount++;
        } else {
          overallStatus = "DRAFT";
          draftCount++;
        }

        const totalErrors = validatedProfiles.reduce(
          (acc, p) => acc + (p.validation?.issues.filter((i) => i.severity === "error").length || 0),
          0
        );
        const totalWarnings = validatedProfiles.reduce(
          (acc, p) => acc + (p.validation?.issues.filter((i) => i.severity === "warning").length || 0),
          0
        );

        const defaultProfile = validatedProfiles[0];

        characterSummaries.push({
          id: c.id,
          name: c.name,
          vision: c.vision,
          weaponType: c.weaponType,
          rarity: c.rarity,
          profilesCount: validatedProfiles.length,
          profiles: validatedProfiles,
          overallStatus,
          primarySource: defaultProfile.primarySource,
          verifiedAt: defaultProfile.verifiedAt,
          reviewer: defaultProfile.reviewer,
          hasErrors: totalErrors > 0,
          warningsCount: totalWarnings,
        });
      } else if (CHARACTER_BUILDS[normalizedId]) {
        // Single Curated Legacy Build
        const legacy = CHARACTER_BUILDS[normalizedId];
        const status: BuildReviewStatus = legacy.status === "draft" ? "DRAFT" : "IN_REVIEW";
        if (status === "IN_REVIEW") inReviewCount++;
        else draftCount++;

        characterSummaries.push({
          id: c.id,
          name: c.name,
          vision: c.vision,
          weaponType: c.weaponType,
          rarity: c.rarity,
          profilesCount: 1,
          profiles: [
            {
              profileId: `${c.id}-legacy`,
              nameVi: legacy.playstyleNoteVi || "Build tổng hợp",
              role: "Main DPS",
              reviewStatus: status,
              primarySource: "LEIBO Editorial Curated (Legacy Single)",
              sourceUrl: "https://keqingmains.com",
              gameVersionVerified: "Legacy",
              verifiedAt: legacy.updatedAt || "2025-01-01",
              reviewer: "Editorial Team",
            },
          ],
          overallStatus: status,
          primarySource: "LEIBO Editorial Curated (Legacy)",
          verifiedAt: legacy.updatedAt,
          reviewer: "Editorial Team",
          hasErrors: false,
          warningsCount: 0,
        });
      } else if (DRAFT_BUILDS[normalizedId]) {
        // Draft Single Build
        const draft = DRAFT_BUILDS[normalizedId];
        draftCount++;

        characterSummaries.push({
          id: c.id,
          name: c.name,
          vision: c.vision,
          weaponType: c.weaponType,
          rarity: c.rarity,
          profilesCount: 1,
          profiles: [
            {
              profileId: `${c.id}-draft`,
              nameVi: draft.playstyleNoteVi || "Bản nháp",
              role: "Main DPS",
              reviewStatus: "DRAFT",
              primarySource: "Draft Game Data (Unreviewed)",
              sourceUrl: "",
              gameVersionVerified: "Unreviewed",
              verifiedAt: draft.updatedAt || "2025-01-01",
              reviewer: "Unassigned",
            },
          ],
          overallStatus: "DRAFT",
          primarySource: "Draft (Chưa duyệt)",
          verifiedAt: draft.updatedAt,
          hasErrors: false,
          warningsCount: 1,
        });
      } else {
        // Missing build
        missingCount++;
        characterSummaries.push({
          id: c.id,
          name: c.name,
          vision: c.vision,
          weaponType: c.weaponType,
          rarity: c.rarity,
          profilesCount: 0,
          profiles: [],
          overallStatus: "MISSING",
          hasErrors: false,
          warningsCount: 0,
        });
      }
    }

    const coveragePercent =
      playable.length > 0 ? Number(((verifiedCount / playable.length) * 100).toFixed(1)) : 0;

    const response: AdminBuildsResponse = {
      metrics: {
        totalPlayable: playable.length,
        verifiedCount,
        inReviewCount,
        draftCount,
        outdatedCount,
        missingCount,
        coveragePercent,
        targetPercent: 100,
      },
      characters: characterSummaries,
    };

    return ok(response);
  } catch (error) {
    console.error("[admin/builds] Error fetching build status:", error);
    return fail(500, "INTERNAL_ERROR", "Lỗi lấy dữ liệu kiểm định build");
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
  } catch (error) {
    return fail(403, "FORBIDDEN", error instanceof Error ? error.message : "Yêu cầu quyền admin");
  }

  try {
    const body = await req.json();
    const { characterId, profileId, status, reviewer, reason } = body;

    if (!characterId) {
      return fail(400, "INVALID_REQUEST", "Thiếu characterId");
    }

    const normalizedId = characterId.toLowerCase().trim();
    const multiBuild = MULTI_PROFILE_BUILDS[normalizedId];

    if (!multiBuild) {
      return fail(404, "NOT_FOUND", `Chưa có Multi-Profile Build cho nhân vật ${characterId}`);
    }

    const targetProfile = multiBuild.profiles.find((p) => p.profileId === profileId);
    if (!targetProfile) {
      return fail(404, "NOT_FOUND", `Không tìm thấy profile ${profileId}`);
    }

    // Cập nhật trạng thái
    if (status) {
      targetProfile.sourceMetadata.reviewStatus = status;
      targetProfile.sourceMetadata.verifiedAt = new Date().toISOString().split("T")[0];
      if (reviewer) targetProfile.sourceMetadata.reviewer = reviewer;
    }

    // Lưu vào bảng audit log nếu có
    try {
      await prisma.auditLog.create({
        data: {
          action: "UPDATE_BUILD_REVIEW_STATUS",
          entityType: "CharacterBuildProfile",
          entityId: `${characterId}:${profileId}`,
          performedBy: reviewer || "Admin",
          newValue: {
            newStatus: status,
          },
          reason: reason || "Admin Manual Review",
        },
      });
    } catch {
      // Bỏ qua nếu audit log table không bắt buộc
    }

    return ok({
      success: true,
      profileId,
      characterId,
      updatedStatus: targetProfile.sourceMetadata.reviewStatus,
    });
  } catch (error) {
    console.error("[admin/builds] Error updating build review:", error);
    return fail(500, "INTERNAL_ERROR", "Lỗi cập nhật trạng thái kiểm định build");
  }
}
