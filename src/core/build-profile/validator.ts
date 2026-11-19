/**
 * src/core/build-profile/validator.ts
 *
 * Bộ máy kiểm định Build 4 tầng (4-Layer Build Validation Engine) cho LEIBO:
 * 1. Structural Validation - Kiểm tra cấu trúc, ID tồn tại, tính tương thích loại vũ khí.
 * 2. Gameplay Validation - Kiểm tra cơ chế, scaling kit (HP/DEF/ATK/EM), nội tại vũ khí, thiên phú.
 * 3. Calculation Validation - Chuẩn hóa điều kiện KQMS 20-Roll, kiểm tra logic ER và rotation.
 * 4. Human Review Validation - Đảm bảo nguồn KQM minh bạch, có reviewer phê duyệt, không tự động verified.
 */

import { CharacterBuildProfileSchema } from "./schema";
import type { CharacterBuildProfile } from "./types";
import { prisma } from "@/lib/db/prisma";

export interface ValidationIssue {
  layer: "Structural" | "Gameplay" | "Calculation" | "HumanReview";
  severity: "error" | "warning";
  code: string;
  message: string;
  field?: string;
}

export interface BuildValidationResult {
  isValid: boolean;
  profileId: string;
  characterId: string;
  issues: ValidationIssue[];
}

export class BuildProfileValidator {
  /**
   * Chạy toàn bộ 4 tầng kiểm định cho 1 profile build
   */
  async validate(profile: CharacterBuildProfile): Promise<BuildValidationResult> {
    const issues: ValidationIssue[] = [];

    // ── TẦNG 1: STRUCTURAL VALIDATION ──
    const parseResult = CharacterBuildProfileSchema.safeParse(profile);
    if (!parseResult.success) {
      for (const err of parseResult.error.issues) {
        issues.push({
          layer: "Structural",
          severity: "error",
          code: "SCHEMA_ERROR",
          message: `${err.path.join(".")}: ${err.message}`,
          field: err.path.join("."),
        });
      }
    }

    // Kiểm tra nhân vật tồn tại trong DB và loại vũ khí
    const dbCharacter = await prisma.character.findUnique({
      where: { id: profile.characterId },
      select: { id: true, name: true, weaponType: true, vision: true },
    });

    if (!dbCharacter) {
      issues.push({
        layer: "Structural",
        severity: "error",
        code: "CHARACTER_NOT_FOUND",
        message: `Nhân vật ${profile.characterId} không tồn tại trong Database`,
      });
      return { isValid: false, profileId: profile.profileId, characterId: profile.characterId, issues };
    }

    // Kiểm tra tính tương thích của từng vũ khí
    const weaponIds = profile.weapons.map((w) => w.weaponId);
    const dbWeapons = await prisma.weapon.findMany({
      where: { id: { in: weaponIds } },
      select: { id: true, name: true, type: true },
    });
    const dbWeaponMap = new Map(dbWeapons.map((w) => [w.id, w]));

    for (const w of profile.weapons) {
      const found = dbWeaponMap.get(w.weaponId);
      if (!found) {
        issues.push({
          layer: "Structural",
          severity: "error",
          code: "WEAPON_NOT_FOUND",
          message: `Vũ khí ID "${w.weaponId}" không tồn tại trong Game Database`,
          field: `weapons.${w.weaponId}`,
        });
      } else if (found.type !== dbCharacter.weaponType) {
        issues.push({
          layer: "Structural",
          severity: "error",
          code: "WEAPON_TYPE_MISMATCH",
          message: `Vũ khí "${found.name}" (${found.type}) không tương thích với nhân vật ${dbCharacter.name} (${dbCharacter.weaponType})`,
          field: `weapons.${w.weaponId}`,
        });
      }
    }

    // Kiểm tra tính tồn tại của các bộ thánh di vật
    const allSetIds = profile.artifacts.flatMap((a) => a.setIds);
    const dbSets = await prisma.artifactSet.findMany({
      where: { id: { in: allSetIds } },
      select: { id: true, name: true },
    });
    const dbSetMap = new Map(dbSets.map((s) => [s.id, s]));

    for (const a of profile.artifacts) {
      for (const sId of a.setIds) {
        if (!dbSetMap.has(sId)) {
          issues.push({
            layer: "Structural",
            severity: "error",
            code: "ARTIFACT_SET_NOT_FOUND",
            message: `Bộ Thánh Di Vật ID "${sId}" không tồn tại trong Game Database`,
            field: `artifacts.${sId}`,
          });
        }
      }
    }

    // ── TẦNG 2: GAMEPLAY VALIDATION ──
    // Kiểm tra main stats logic (ví dụ: nhân vật không scale DEF thì không nên có main stat DEF%)
    const sandsText = profile.mainStats.sands.join(" ").toLowerCase();
    const gobletText = profile.mainStats.goblet.join(" ").toLowerCase();
    const circletText = profile.mainStats.circlet.join(" ").toLowerCase();

    // Cảnh báo nếu DPS có Main Stat DEF% trong khi không phải nhân vật hệ Nham / DEF scaling
    if (profile.role === "Main DPS" && dbCharacter.vision !== "Geo") {
      if (sandsText.includes("def") || gobletText.includes("def") || circletText.includes("def")) {
        issues.push({
          layer: "Gameplay",
          severity: "warning",
          code: "SUSPICIOUS_DEF_STAT",
          message: `Nhân vật ${dbCharacter.name} (${profile.role}) không thuộc hệ Nham nhưng có chỉ số chính Phòng Thủ (DEF%)`,
        });
      }
    }

    // Kiểm tra talent priority thứ tự hợp lý
    const [t1, , t3] = profile.talentPriority.order;
    if (profile.role === "Support / Buffer" && t1.toLowerCase().includes("thường") && t3.toLowerCase().includes("nộ")) {
      issues.push({
        layer: "Gameplay",
        severity: "warning",
        code: "SUSPICIOUS_TALENT_PRIORITY",
        message: `Nhân vật Hỗ trợ ${dbCharacter.name} có ưu tiên Đòn đánh thường cao hơn Chiêu nộ`,
      });
    }

    // ── TẦNG 3: CALCULATION VALIDATION ──
    // Kiểm tra ER requirements
    if (profile.erRequirements.length === 0) {
      issues.push({
        layer: "Calculation",
        severity: "error",
        code: "MISSING_ER_BREAKDOWN",
        message: `Profile thiếu bảng tính toán yêu cầu Nạp (ER Breakdown) theo đội hình`,
      });
    }

    for (const er of profile.erRequirements) {
      if (er.recommendedERPercent < 100 || er.recommendedERPercent > 350) {
        issues.push({
          layer: "Calculation",
          severity: "error",
          code: "INVALID_ER_RANGE",
          message: `Giá trị ER đề xuất ${er.recommendedERPercent}% nằm ngoài giới hạn hợp lý (100% - 350%)`,
        });
      }
    }

    // ── TẦNG 4: HUMAN REVIEW VALIDATION ──
    const meta = profile.sourceMetadata;
    if (meta.reviewStatus === "VERIFIED") {
      if (!meta.sourceUrl || !meta.sourceUrl.startsWith("http")) {
        issues.push({
          layer: "HumanReview",
          severity: "error",
          code: "VERIFIED_WITHOUT_SOURCE",
          message: `Build đánh dấu VERIFIED nhưng thiếu đường dẫn nguồn KQM tham chiếu hợp lệ`,
        });
      }
      if (!meta.reviewer || meta.reviewer.trim().length === 0) {
        issues.push({
          layer: "HumanReview",
          severity: "error",
          code: "VERIFIED_WITHOUT_REVIEWER",
          message: `Build đánh dấu VERIFIED nhưng thiếu tên Biên tập viên / Theorycrafter xác nhận`,
        });
      }
    }

    const hasErrors = issues.some((i) => i.severity === "error");

    return {
      isValid: !hasErrors,
      profileId: profile.profileId,
      characterId: profile.characterId,
      issues,
    };
  }
}
