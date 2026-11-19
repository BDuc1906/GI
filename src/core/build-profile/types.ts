/**
 * src/core/build-profile/types.ts
 *
 * Định nghĩa kiểu dữ liệu cho Hệ Thống Character Build Profile Đa Lối Chơi (Multi-Profile) của LEIBO.
 * Tuân thủ chuẩn KeqingMains (KQM) và KQMS (KQM 20-Roll Standard Benchmarking).
 */

export type BuildReviewStatus =
  | "VERIFIED"   // Đã xác minh qua 4 tầng kiểm định và đối chiếu nguồn KQM / thực tế
  | "IN_REVIEW"  // Đang trong quá trình rà soát
  | "DRAFT"      // Bản nháp biên soạn, chưa kiểm duyệt
  | "OUTDATED"   // Build cũ cần cập nhật do game thay đổi thiên phú/vũ khí/TDV
  | "MISSING";   // Chưa có dữ liệu, minh bạch hiển thị thiếu thay vì tạo build giả

export type WeaponTier = "S" | "A" | "B" | "C";

export interface WeaponRankingOption {
  weaponId: string;
  tier: WeaponTier;
  refinement: "R1" | "R5" | "R1-R5";
  /** Điểm số sát thương tương đối (%) theo chuẩn KQMS 20-roll (ví dụ: 100% baseline, 114% signature) */
  relativeDpsPercent?: number;
  /** Giả định và điều kiện kích hoạt nội tại */
  conditionVi: string;
  /** Ghi chú phân tích chi tiết */
  noteVi: string;
}

export interface ArtifactRankingOption {
  mode: "4pc" | "2+2";
  setIds: [string] | [string, string];
  tier: "S" | "A" | "B";
  /** Hiệu suất tương đối so với bộ 4 món tối ưu nhất (%) */
  relativeEfficiencyPercent?: number;
  /** Điều kiện sử dụng (ví dụ: "Khi trong đội đã có 1 người cầm Ký Ức Rừng Sâu") */
  conditionVi: string;
  noteVi: string;
}

export interface ERRequirementBreakdown {
  /** Tình huống đội hình (ví dụ: "Đi cùng 1 nhân vật cùng hệ + 1 vũ khí Tây Phong") */
  teamScenarioVi: string;
  /** Chỉ số ER đề xuất (%) */
  recommendedERPercent: number;
  /** Khoảng ER an toàn [min, max] (%) */
  erRangePercent: [min: number, max: number];
  /** Giả định chu kỳ rotation chiêu nộ */
  assumedRotationVi: string;
}

export interface RecommendedTeamOption {
  nameVi: string;
  archetypeVi: string;
  teammateIds: [string, string, string];
  teammateRoles: [string, string, string];
  synergyReasonVi: string;
  sampleRotationVi: string;
}

export interface BuildSourceMetadata {
  primarySource:
    | "KeqingMains Quick Guide"
    | "KeqingMains Extended Guide"
    | "KQMS Theorycrafting"
    | "Genshin Optimizer Verified"
    | "Game In-Engine Verified";
  sourceUrl: string;
  sourceVersion: string; // ví dụ: "v5.2 Update"
  verifiedAt: string;    // ISO Date YYYY-MM-DD
  gameVersionVerified: string; // ví dụ: "5.4"
  reviewer: string;
  reviewStatus: BuildReviewStatus;
}

export interface CharacterBuildProfile {
  profileId: string;                 // ví dụ: "kazuha-full-em", "kazuha-crit-hybrid"
  characterId: string;
  nameVi: string;                    // ví dụ: "Phong Khí Thuần Tinh Thông (Full EM Buffer)"
  role: "Main DPS" | "Sub-DPS" | "Support / Buffer" | "Healer" | "Shielder" | "Hyperbloom Trigger" | "Driver";
  playstyleVi: string;
  /** Giả định điều kiện benchmark, phản ứng, rotation và buff */
  conditionsAndAssumptionsVi: string;

  // Xếp hạng vũ khí & thánh di vật kèm điều kiện
  weapons: WeaponRankingOption[];
  artifacts: ArtifactRankingOption[];

  // Chỉ số chính & chỉ số phụ
  mainStats: {
    sands: string[];
    goblet: string[];
    circlet: string[];
  };
  substatsPriority: string[];
  statGoals?: Record<string, string>; // ví dụ: { "Tinh Thông": "900 - 1000", "Hiệu Quả Nạp": "160% - 180%" }

  // Yêu cầu nạp chi tiết theo đội hình và rotation
  erRequirements: ERRequirementBreakdown[];

  // Ưu tiên thiên phú
  talentPriority: {
    order: [string, string, string];
    noteVi: string;
  };

  // Đội hình khuyến nghị
  recommendedTeams: RecommendedTeamOption[];

  // Nguồn gốc & kiểm duyệt
  sourceMetadata: BuildSourceMetadata;
}

export interface CharacterMultiProfileBuild {
  characterId: string;
  characterName: string;
  defaultProfileId: string;
  profiles: CharacterBuildProfile[];
}
