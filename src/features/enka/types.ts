/**
 * src/features/enka/types.ts
 *
 * Kiểu dữ liệu chuẩn hóa cho hệ thống Player Profile, Showcase và Build Evaluation
 */

import type {
  EnkaShowcaseCharacter,
  EnkaShowcaseResult,
  EnkaArtifactPiece,
  EnkaWeaponInfo,
  EnkaFightProps,
} from "@/app/api/tools/enka/[uid]/route";

export type {
  EnkaShowcaseCharacter,
  EnkaShowcaseResult,
  EnkaArtifactPiece,
  EnkaWeaponInfo,
  EnkaFightProps,
};

export interface RecentUid {
  uid: string;
  nickname: string;
  arLevel: number;
  worldLevel: number;
  avatarCount: number;
  syncedAt: number;
}

export interface BuildEvaluationResult {
  characterId: string;
  characterName: string;
  hasMultiProfiles: boolean;
  availableProfiles: Array<{ id: string; name: string; role: string }>;
  activeProfileId: string;
  activeProfileName: string;
  activeProfileRole: string;

  weapon: {
    name: string;
    level: number;
    refinement: number;
    matchTier: "BiS / S-Tier" | "A-Tier" | "Thay thế khả dĩ" | "Chưa tối ưu";
    isRecommended: boolean;
    recommendedTopWeapons: string[];
  };

  artifactSet: {
    equippedSummary: string[];
    matchStatus: "Tối ưu chuẩn bộ 4 món" | "Hợp lệ kết hợp 2+2" | "Chưa kích hoạt đủ hiệu ứng bộ";
    isRecommended: boolean;
    recommendedSets: string[];
  };

  mainStats: {
    sands: { actual: string; recommended: string[]; isMatch: boolean };
    goblet: { actual: string; recommended: string[]; isMatch: boolean };
    circlet: { actual: string; recommended: string[]; isMatch: boolean };
    matchCount: number; // 0..3
  };

  statBenchmarks: {
    critRatio: {
      actual: string;
      rating: "Tỉ lệ vàng (1:2)" | "Lệch tỉ lệ" | "Không ưu tiên Bạo (Support / EM)";
      note: string;
    };
    energyRecharge: {
      actual: number;
      targetRange: string;
      isMet: boolean;
      note: string;
    };
    scalingStat: {
      label: string;
      actual: number | string;
      targetRange?: string;
      note: string;
    };
  };

  overallGrade: "Tối Ưu Hoàn Hảo (S)" | "Chuẩn Endgame (A)" | "Đạt Yêu Cầu (B)" | "Cần Hoàn Thiện (C)";
  actionableTips: string[];
}
