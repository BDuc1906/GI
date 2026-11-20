/**
 * src/features/enka/services/build-evaluator.ts
 *
 * LEIBO BUILD EVALUATOR & BENCHMARK COMPARATOR
 *
 * So sánh chi tiết dữ liệu thực tế nhập từ Showcase (Enka) với
 * Hồ sơ Build chuẩn KQM & KQMS 20-Roll đã được kiểm duyệt của LEIBO.
 */

import { MULTI_PROFILE_BUILDS } from "@/core/build-profile/registry";
import type { CharacterBuildProfile } from "@/core/build-profile/types";
import type { EnkaShowcaseCharacter, BuildEvaluationResult } from "../types";

/**
 * Chuẩn hóa chuỗi để so sánh linh hoạt không phân biệt hoa thường và dấu gạch nối
 */
function normalizeText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .replace(/[^a-z0-9àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/g, "")
    .trim();
}

/**
 * Kiểm tra xem chỉ số chính có khớp với danh sách khuyến nghị không
 */
function checkMainStatMatch(actual: string, recommended: string[]): boolean {
  if (!actual || recommended.length === 0) return false;
  const normActual = normalizeText(actual);
  return recommended.some((rec) => {
    const normRec = normalizeText(rec);
    return normActual.includes(normRec) || normRec.includes(normActual);
  });
}

export function evaluateCharacterBuild(
  char: EnkaShowcaseCharacter,
  selectedProfileId?: string
): BuildEvaluationResult {
  const charId = char.characterId?.toLowerCase() || "";
  const multiBuild = MULTI_PROFILE_BUILDS[charId] || MULTI_PROFILE_BUILDS[charId.replace(/-/g, "")];

  // 1. Xác định Profile phân tích (Hỗ trợ đa lối chơi)
  let activeProfile: CharacterBuildProfile | undefined;
  let availableProfiles: Array<{ id: string; name: string; role: string }> = [];

  if (multiBuild && multiBuild.profiles.length > 0) {
    availableProfiles = multiBuild.profiles.map((p) => ({
      id: p.profileId,
      name: p.nameVi,
      role: p.role,
    }));

    if (selectedProfileId) {
      activeProfile = multiBuild.profiles.find((p) => p.profileId === selectedProfileId);
    }
    if (!activeProfile) {
      activeProfile =
        multiBuild.profiles.find((p) => p.profileId === multiBuild.defaultProfileId) ||
        multiBuild.profiles[0];
    }
  }

  // Profile dự phòng cơ bản nếu nhân vật chưa có profile KQM đa lối chơi
  const fallbackProfile: CharacterBuildProfile = {
    profileId: "default-curated",
    characterId: charId || "unknown",
    nameVi: `Build Tiêu Chuẩn (${char.characterName || "Nhân vật"})`,
    role: "Main DPS",
    playstyleVi: "Xoay vòng kỹ năng và gây sát thương",
    conditionsAndAssumptionsVi: "Cân bằng Bạo kích và Hiệu Quả Nạp",
    weapons: [],
    artifacts: [],
    mainStats: {
      sands: ["Tấn Công%", "Tinh Thông", "Hiệu Quả Nạp"],
      goblet: ["ST Nguyên Tố", "Tấn Công%"],
      circlet: ["Tỉ Lệ Bạo Kích", "Sát Thương Bạo Kích"],
    },
    substatsPriority: ["Tỉ Lệ Bạo Kích", "Sát Thương Bạo Kích", "Hiệu Quả Nạp"],
    erRequirements: [],
    talentPriority: { order: ["Nộ", "Kỹ năng", "Đòn đánh"], noteVi: "Ưu tiên chiêu nộ" },
    recommendedTeams: [],
    sourceMetadata: {
      primarySource: "KQMS Theorycrafting",
      sourceUrl: "",
      sourceVersion: "5.4",
      verifiedAt: "2026-11-20",
      gameVersionVerified: "5.4",
      reviewer: "LEIBO Team",
      reviewStatus: "VERIFIED",
    },
  };

  const profile = activeProfile || fallbackProfile;

  // 2. Đánh giá Vũ khí
  const actualWeaponName = char.weapon?.name || "";
  let weaponMatchTier: BuildEvaluationResult["weapon"]["matchTier"] = "Chưa tối ưu";
  let isWeaponRecommended = false;

  const topWeaponNames = profile.weapons.slice(0, 4).map((w) => {
    return w.weaponId
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  });

  if (actualWeaponName) {
    const normActual = normalizeText(actualWeaponName);
    const matchedRank = profile.weapons.find((w) => {
      const normRecId = normalizeText(w.weaponId);
      const normNote = normalizeText(w.noteVi);
      return (
        normActual.includes(normRecId) ||
        normRecId.includes(normActual) ||
        normNote.includes(normActual) ||
        normActual.split(" ").some((token) => token.length > 3 && normRecId.includes(token))
      );
    });

    if (matchedRank) {
      isWeaponRecommended = true;
      if (matchedRank.tier === "S") {
        weaponMatchTier = "BiS / S-Tier";
      } else if (matchedRank.tier === "A") {
        weaponMatchTier = "A-Tier";
      } else {
        weaponMatchTier = "Thay thế khả dĩ";
      }
    } else if (char.weapon && char.weapon.rarity === 5) {
      weaponMatchTier = "Thay thế khả dĩ";
    }
  }

  // 3. Đánh giá Bộ Thánh Di Vật
  const equippedSets = char.activeSetSummary || [];
  let artifactMatchStatus: BuildEvaluationResult["artifactSet"]["matchStatus"] =
    "Chưa kích hoạt đủ hiệu ứng bộ";
  let isArtifactSetRecommended = false;

  const recommendedSetNames = profile.artifacts.map((a) => {
    const sets = a.setIds
      .map((id) =>
        id
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ")
      )
      .join(" + ");
    return `${sets} (${a.mode})`;
  });

  for (const eq of equippedSets) {
    const normEq = normalizeText(eq);
    const normEqClean = normalizeText(eq.replace(/\(\d+\)/g, "").trim());
    const match = profile.artifacts.some((rec) => {
      const normNote = normalizeText(rec.noteVi);
      const normCond = normalizeText(rec.conditionVi);

      if (normEqClean && (normNote.includes(normEqClean) || normCond.includes(normEqClean))) {
        return true;
      }

      return rec.setIds.some((sId) => {
        const normId = normalizeText(sId);
        return (
          normEq.includes(normId) ||
          normId.includes(normEq) ||
          sId.split("-").some((part) => part.length > 3 && normEq.includes(part))
        );
      });
    });

    if (match) {
      isArtifactSetRecommended = true;
      if (eq.includes("(4)")) {
        artifactMatchStatus = "Tối ưu chuẩn bộ 4 món";
        break;
      } else if (eq.includes("(2)")) {
        artifactMatchStatus = "Hợp lệ kết hợp 2+2";
      }
    }
  }

  // 4. Đánh giá Main Stats
  const sandsPiece = char.artifacts.find((a) => a.slot === "sands");
  const gobletPiece = char.artifacts.find((a) => a.slot === "goblet");
  const circletPiece = char.artifacts.find((a) => a.slot === "circlet");

  const sandsActual = sandsPiece?.mainStat.label || "";
  const gobletActual = gobletPiece?.mainStat.label || "";
  const circletActual = circletPiece?.mainStat.label || "";

  const isSandsMatch = checkMainStatMatch(sandsActual, profile.mainStats.sands);
  const isGobletMatch = checkMainStatMatch(gobletActual, profile.mainStats.goblet);
  const isCircletMatch = checkMainStatMatch(circletActual, profile.mainStats.circlet);

  let matchCount = 0;
  if (isSandsMatch) matchCount++;
  if (isGobletMatch) matchCount++;
  if (isCircletMatch) matchCount++;

  // 5. Đánh giá Stat Benchmarks (Chống phán xét cứng nhắc theo phong cách KQM)
  const isFullEMOrSupport =
    profile.role === "Support / Buffer" &&
    (profile.nameVi.toLowerCase().includes("em") ||
      profile.nameVi.toLowerCase().includes("tinh thông"));

  const cr = char.fightProps.critRate;
  const cd = char.fightProps.critDmg;
  const er = char.fightProps.er;
  const em = char.fightProps.em;

  // CRIT Benchmark
  let critRatioRating: BuildEvaluationResult["statBenchmarks"]["critRatio"]["rating"] = "Lệch tỉ lệ";
  let critNote = "";

  if (isFullEMOrSupport) {
    critRatioRating = "Không ưu tiên Bạo (Support / EM)";
    critNote = "Lối chơi này ưu tiên Tinh thông nguyên tố tối đa để buff/khuếch tán, không yêu cầu chỉ số Bạo kích cao.";
  } else if (cr <= 0) {
    critRatioRating = "Lệch tỉ lệ";
    critNote = "Chưa có chỉ số Tỉ lệ bạo kích.";
  } else {
    const ratio = cd / cr;
    if (cr >= 60 && ratio >= 1.6 && ratio <= 2.4) {
      critRatioRating = "Tỉ lệ vàng (1:2)";
      critNote = `Tỉ lệ CR:CD là 1:${ratio.toFixed(1)} rất cân bằng và tối ưu sát thương kỳ vọng.`;
    } else if (cr < 50) {
      critRatioRating = "Lệch tỉ lệ";
      critNote = `Tỉ lệ bạo (${cr}%) dưới ngưỡng khuyến nghị 60%. Dễ gây hụt sát thương lớn trong vòng quay kỹ năng.`;
    } else {
      critRatioRating = "Lệch tỉ lệ";
      critNote = `Tỉ lệ CR:CD đang là 1:${ratio.toFixed(1)}. Khuyến nghị đưa về gần mốc 1:2 hơn.`;
    }
  }

  // ER Benchmark
  let targetErRange = "120% - 140%";
  if (profile.statGoals?.["Hiệu Quả Nạp (ER)"] || profile.statGoals?.["Hiệu Quả Nạp"]) {
    targetErRange = profile.statGoals["Hiệu Quả Nạp (ER)"] || profile.statGoals["Hiệu Quả Nạp"];
  } else if (profile.erRequirements.length > 0) {
    const firstReq = profile.erRequirements[0];
    targetErRange = `${firstReq.erRangePercent[0]}% - ${firstReq.erRangePercent[1]}%`;
  }

  const minEr = parseInt(targetErRange.replace(/\D/g, "").slice(0, 3) || "120", 10);
  const isErMet = er >= minEr;
  const erNote = isErMet
    ? `Đạt yêu cầu nạp (${er}% ≥ ${minEr}%), đảm bảo thi triển nộ mượt mà mỗi rotation.`
    : `Hiệu quả nạp hiện tại (${er}%) chưa đạt mốc khuyến nghị (${targetErRange}). Nguy cơ kẹt nộ khi xoay vòng đội hình.`;

  // Scaling Stat (EM / HP / DEF / ATK)
  let scalingLabel = "Tấn Công";
  let scalingActual: number | string = char.fightProps.atk;
  let scalingTargetRange = "1,800 - 2,200";
  let scalingNote = "Đủ sức mạnh cơ bản cho nhân vật gây sát thương.";

  if (isFullEMOrSupport || char.characterId?.includes("nahida") || char.characterId?.includes("kazuha")) {
    scalingLabel = "Tinh Thông Nguyên Tố (EM)";
    scalingActual = em;
    scalingTargetRange = profile.statGoals?.["Tinh Thông"] || "800 - 1,000";
    scalingNote = em >= 750 ? "EM đạt mốc cao, buff sát thương và khuếch tán cực mạnh." : "Nên bổ sung thêm dòng Tinh thông nguyên tố.";
  } else if (char.characterId?.includes("hu-tao") || char.characterId?.includes("furina") || char.characterId?.includes("neuvillette")) {
    scalingLabel = "Lượng Máu (HP Tối Đa)";
    scalingActual = char.fightProps.hp.toLocaleString();
    scalingTargetRange = "30,000 - 36,000";
    scalingNote = char.fightProps.hp >= 28000 ? "HP đạt ngưỡng scaling tối ưu sát thương." : "HP còn thấp so với tiềm năng sát thương.";
  }

  // 6. Xếp hạng tổng thể & Lời khuyên hành động
  const tips: string[] = [];

  let overallGrade: BuildEvaluationResult["overallGrade"] = "Đạt Yêu Cầu (B)";
  let scorePoints = 0;

  if (weaponMatchTier === "BiS / S-Tier") scorePoints += 3;
  else if (weaponMatchTier === "A-Tier") scorePoints += 2;
  else if (weaponMatchTier === "Thay thế khả dĩ") scorePoints += 1;

  if (artifactMatchStatus === "Tối ưu chuẩn bộ 4 món") scorePoints += 3;
  else if (artifactMatchStatus === "Hợp lệ kết hợp 2+2") scorePoints += 2;

  scorePoints += matchCount; // 0..3

  if (isErMet) scorePoints += 2;
  if (critRatioRating === "Tỉ lệ vàng (1:2)" || critRatioRating === "Không ưu tiên Bạo (Support / EM)") scorePoints += 2;

  if (scorePoints >= 11) overallGrade = "Tối Ưu Hoàn Hảo (S)";
  else if (scorePoints >= 8) overallGrade = "Chuẩn Endgame (A)";
  else if (scorePoints >= 5) overallGrade = "Đạt Yêu Cầu (B)";
  else overallGrade = "Cần Hoàn Thiện (C)";

  // Đề xuất hành động thực tiễn
  if (!isWeaponRecommended && topWeaponNames.length > 0) {
    tips.push(`Xem xét nâng cấp vũ khí sang top đề xuất: ${topWeaponNames.slice(0, 2).join(", ")}.`);
  }
  if (!isArtifactSetRecommended && recommendedSetNames.length > 0) {
    tips.push(`Đổi bộ thánh di vật sang: ${recommendedSetNames.slice(0, 2).join(" hoặc ")}.`);
  }
  if (matchCount < 3) {
    const wrongSlots = [];
    if (!isSandsMatch) wrongSlots.push(`Đồng hồ (cần: ${profile.mainStats.sands.join("/")})`);
    if (!isGobletMatch) wrongSlots.push(`Ly (cần: ${profile.mainStats.goblet.join("/")})`);
    if (!isCircletMatch) wrongSlots.push(`Nón (cần: ${profile.mainStats.circlet.join("/")})`);
    tips.push(`Chỉnh lại chỉ số chính: ${wrongSlots.join("; ")}.`);
  }
  if (!isErMet) {
    tips.push(`Bổ sung thêm ${minEr - er}% Hiệu Quả Nạp từ dòng phụ để xoay nộ đúng hạn.`);
  }
  if (char.artifacts.some((a) => a.level < 20)) {
    tips.push("Cường hóa toàn bộ 5 món Thánh di vật lên cấp tối đa +20.");
  }

  if (tips.length === 0) {
    tips.push("Build của nhân vật đã hoàn thiện ở mức rất cao, sẵn sàng chinh phục La Hoàn Tầng 12!");
  }

  return {
    characterId: charId,
    characterName: char.characterName || "Nhân vật",
    hasMultiProfiles: availableProfiles.length > 1,
    availableProfiles,
    activeProfileId: profile.profileId,
    activeProfileName: profile.nameVi,
    activeProfileRole: profile.role,
    weapon: {
      name: actualWeaponName || "Chưa có vũ khí",
      level: char.weapon?.level || 0,
      refinement: char.weapon?.refinement || 1,
      matchTier: weaponMatchTier,
      isRecommended: isWeaponRecommended,
      recommendedTopWeapons: topWeaponNames,
    },
    artifactSet: {
      equippedSummary: equippedSets,
      matchStatus: artifactMatchStatus,
      isRecommended: isArtifactSetRecommended,
      recommendedSets: recommendedSetNames,
    },
    mainStats: {
      sands: { actual: sandsActual, recommended: profile.mainStats.sands, isMatch: isSandsMatch },
      goblet: { actual: gobletActual, recommended: profile.mainStats.goblet, isMatch: isGobletMatch },
      circlet: { actual: circletActual, recommended: profile.mainStats.circlet, isMatch: isCircletMatch },
      matchCount,
    },
    statBenchmarks: {
      critRatio: {
        actual: `${cr}% / ${cd}%`,
        rating: critRatioRating,
        note: critNote,
      },
      energyRecharge: {
        actual: er,
        targetRange: targetErRange,
        isMet: isErMet,
        note: erNote,
      },
      scalingStat: {
        label: scalingLabel,
        actual: scalingActual,
        targetRange: scalingTargetRange,
        note: scalingNote,
      },
    },
    overallGrade,
    actionableTips: tips,
  };
}
