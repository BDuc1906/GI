/**
 * src/core/game/dps/kqm-standards.ts
 *
 * KQM (Keqing Mains) Standard Benchmarking Engine
 *
 * Dựa trên: https://keqingmains.com/misc/artifacts/
 * - Chuẩn 20 roll substat phân phối trung bình cho artifact 5★ Level 20
 * - Roll Value (RV) đánh giá chất lượng artifact theo tỉ lệ max-roll
 * - Neutral KQM Gear model để so sánh Vũ Khí / Bộ Thánh Tích không bị ảnh hưởng bởi RNG
 */

// ---------------------------------------------------------------------------
// Hằng Số Max Roll Values (5★ Artifact - Max Single Roll)
// Nguồn: Genshin Optimizer / KQM Verified
// ---------------------------------------------------------------------------

/** Max roll value của từng substat (5★ artifact) */
export const MAX_ROLL_VALUES = {
  /** CRIT Rate - max single roll: 3.89% */
  critRate: 3.89,
  /** CRIT DMG - max single roll: 7.77% */
  critDmg: 7.77,
  /** ATK% - max single roll: 5.83% */
  atkPercent: 5.83,
  /** HP% - max single roll: 5.83% */
  hpPercent: 5.83,
  /** DEF% - max single roll: 7.29% */
  defPercent: 7.29,
  /** Elemental Mastery - max single roll: 23.31 */
  em: 23.31,
  /** Energy Recharge% - max single roll: 6.48% */
  er: 6.48,
  /** Flat ATK - max single roll: 19.45 */
  flatAtk: 19.45,
  /** Flat HP - max single roll: 298.75 */
  flatHp: 298.75,
  /** Flat DEF - max single roll: 23.15 */
  flatDef: 23.15,
} as const;

export type SubstatKey = keyof typeof MAX_ROLL_VALUES;

// ---------------------------------------------------------------------------
// KQM 20-Roll Standard Distribution
// Dùng cho benchmark trung lập (không bị ảnh hưởng bởi RNG artifact thực)
// ---------------------------------------------------------------------------

/** Một substat trong phân phối KQM */
export interface KQMSubstatEntry {
  stat: SubstatKey;
  /** Số lượng roll được phân bổ */
  rolls: number;
  /** Tổng giá trị = rolls × max_roll */
  totalValue: number;
  /** Đơn vị hiển thị */
  unit: "%" | "flat";
}

/** Model phân phối 20 roll KQM chuẩn */
export interface KQMDistribution {
  /** Tổng roll = 20 (chuẩn 5★ Lv20 x5 pieces) */
  totalRolls: number;
  substats: KQMSubstatEntry[];
  /** Mô tả phân phối bằng tiếng Việt */
  label: string;
}

/**
 * Phân phối KQM chuẩn cho DPS (Damage dealer chính)
 *
 * Chuẩn: 6 CR + 6 CD + 6 ATK% + 2 ER = 20 rolls
 * Tổng giá trị:
 *   - CRIT Rate: 6 × 3.89% = 23.34%
 *   - CRIT DMG:  6 × 7.77% = 46.62%
 *   - ATK%:      6 × 5.83% = 34.98%
 *   - ER%:       2 × 6.48% = 12.96%
 */
export const KQM_STANDARD_DPS: KQMDistribution = {
  totalRolls: 20,
  label: "KQM DPS Chuẩn (6 CR + 6 CD + 6 ATK% + 2 ER)",
  substats: [
    {
      stat: "critRate",
      rolls: 6,
      totalValue: 6 * MAX_ROLL_VALUES.critRate,
      unit: "%",
    },
    {
      stat: "critDmg",
      rolls: 6,
      totalValue: 6 * MAX_ROLL_VALUES.critDmg,
      unit: "%",
    },
    {
      stat: "atkPercent",
      rolls: 6,
      totalValue: 6 * MAX_ROLL_VALUES.atkPercent,
      unit: "%",
    },
    { stat: "er", rolls: 2, totalValue: 2 * MAX_ROLL_VALUES.er, unit: "%" },
  ],
};

/**
 * Phân phối KQM chuẩn cho Sub-DPS / Hỗ Trợ Nguyên Tố Tinh Thông
 *
 * Chuẩn: 4 CR + 4 CD + 4 EM + 4 ER + 4 ATK% = 20 rolls
 */
export const KQM_STANDARD_EM_SUPPORT: KQMDistribution = {
  totalRolls: 20,
  label: "KQM EM Support (4 CR + 4 CD + 4 EM + 4 ER + 4 ATK%)",
  substats: [
    {
      stat: "critRate",
      rolls: 4,
      totalValue: 4 * MAX_ROLL_VALUES.critRate,
      unit: "%",
    },
    {
      stat: "critDmg",
      rolls: 4,
      totalValue: 4 * MAX_ROLL_VALUES.critDmg,
      unit: "%",
    },
    {
      stat: "em",
      rolls: 4,
      totalValue: 4 * MAX_ROLL_VALUES.em,
      unit: "flat",
    },
    { stat: "er", rolls: 4, totalValue: 4 * MAX_ROLL_VALUES.er, unit: "%" },
    {
      stat: "atkPercent",
      rolls: 4,
      totalValue: 4 * MAX_ROLL_VALUES.atkPercent,
      unit: "%",
    },
  ],
};

/**
 * Phân phối KQM chuẩn cho Healer / Shield HP-scaler
 *
 * Chuẩn: 6 HP% + 4 ER + 4 DEF% + 4 CR + 2 CD = 20 rolls
 */
export const KQM_STANDARD_HEALER: KQMDistribution = {
  totalRolls: 20,
  label: "KQM Healer (6 HP% + 4 ER + 4 DEF% + 4 CR + 2 CD)",
  substats: [
    {
      stat: "hpPercent",
      rolls: 6,
      totalValue: 6 * MAX_ROLL_VALUES.hpPercent,
      unit: "%",
    },
    { stat: "er", rolls: 4, totalValue: 4 * MAX_ROLL_VALUES.er, unit: "%" },
    {
      stat: "defPercent",
      rolls: 4,
      totalValue: 4 * MAX_ROLL_VALUES.defPercent,
      unit: "%",
    },
    {
      stat: "critRate",
      rolls: 4,
      totalValue: 4 * MAX_ROLL_VALUES.critRate,
      unit: "%",
    },
    {
      stat: "critDmg",
      rolls: 2,
      totalValue: 2 * MAX_ROLL_VALUES.critDmg,
      unit: "%",
    },
  ],
};

// ---------------------------------------------------------------------------
// Roll Value (RV) Calculator
// ---------------------------------------------------------------------------

/** Kết quả đánh giá Roll Value của một artifact */
export interface ArtifactRVResult {
  /** Tổng RV (0-100%) */
  totalRV: number;
  /** RV từng substat */
  breakdown: {
    stat: SubstatKey;
    statLabel: string;
    currentValue: number;
    maxRoll: number;
    rv: number;
    grade: RVGrade;
  }[];
  /** Xếp hạng tổng thể */
  overallGrade: RVGrade;
  /** Điểm "Offensive RV" chỉ tính CR/CD/ATK%/EM */
  offensiveRV: number;
}

export type RVGrade =
  | "SS"
  | "S+"
  | "S"
  | "A+"
  | "A"
  | "B+"
  | "B"
  | "C"
  | "D";

/**
 * Phân loại grade theo % RV:
 * SS: 90-100%  → Thánh Tích Tuyệt Đỉnh
 * S+: 80-89%   → Xuất Sắc
 * S:  70-79%   → Rất Tốt
 * A+: 60-69%   → Tốt
 * A:  50-59%   → Khá
 * B+: 40-49%   → Trung Bình
 * B:  30-39%   → Yếu
 * C:  20-29%   → Tệ
 * D:  0-19%    → Bỏ Đi
 */
export function getGrade(rv: number): RVGrade {
  if (rv >= 90) return "SS";
  if (rv >= 80) return "S+";
  if (rv >= 70) return "S";
  if (rv >= 60) return "A+";
  if (rv >= 50) return "A";
  if (rv >= 40) return "B+";
  if (rv >= 30) return "B";
  if (rv >= 20) return "C";
  return "D";
}

/** Màu badge theo grade */
export const GRADE_COLORS: Record<RVGrade, string> = {
  SS: "text-amber-300 border-amber-400 bg-amber-400/10",
  "S+": "text-yellow-300 border-yellow-400 bg-yellow-400/10",
  S: "text-yellow-400 border-yellow-500 bg-yellow-400/8",
  "A+": "text-green-400 border-green-500 bg-green-400/8",
  A: "text-green-500 border-green-600 bg-green-500/8",
  "B+": "text-blue-400 border-blue-500 bg-blue-400/8",
  B: "text-blue-500 border-blue-600 bg-blue-500/8",
  C: "text-slate-400 border-slate-500 bg-slate-400/8",
  D: "text-red-500 border-red-600 bg-red-500/8",
};

/** Nhãn tiếng Việt cho substat */
export const SUBSTAT_LABELS: Record<SubstatKey, string> = {
  critRate: "Tỉ Lệ CRIT",
  critDmg: "ST CRIT",
  atkPercent: "ATK%",
  hpPercent: "HP%",
  defPercent: "DEF%",
  em: "Tinh Thông",
  er: "Nạp Năng",
  flatAtk: "ATK Phẳng",
  flatHp: "HP Phẳng",
  flatDef: "DEF Phẳng",
};

/**
 * Tính Roll Value cho một substat đơn lẻ
 * RV = (currentValue / maxRollValue) × 100
 */
export function calculateSubstatRV(
  stat: SubstatKey,
  currentValue: number
): number {
  const maxRoll = MAX_ROLL_VALUES[stat];
  return (currentValue / maxRoll) * 100;
}

/**
 * Tính toán đầy đủ Roll Value cho một artifact
 *
 * @param substats - Map stat → giá trị thực tế (e.g. { critRate: 7.0, critDmg: 14.0 })
 * @param offensiveKeys - Các substat tính vào Offensive RV (mặc định: CR/CD/ATK%/EM)
 */
export function calculateArtifactRV(
  substats: Partial<Record<SubstatKey, number>>,
  offensiveKeys: SubstatKey[] = ["critRate", "critDmg", "atkPercent", "em"]
): ArtifactRVResult {
  const breakdown: ArtifactRVResult["breakdown"] = [];
  let totalRV = 0;
  let offensiveRV = 0;

  for (const [statKey, value] of Object.entries(substats) as [
    SubstatKey,
    number,
  ][]) {
    if (value === undefined || value === 0) continue;
    const rv = calculateSubstatRV(statKey, value);
    totalRV += rv;

    if (offensiveKeys.includes(statKey)) {
      offensiveRV += rv;
    }

    breakdown.push({
      stat: statKey,
      statLabel: SUBSTAT_LABELS[statKey],
      currentValue: value,
      maxRoll: MAX_ROLL_VALUES[statKey],
      rv,
      grade: getGrade(rv),
    });
  }

  // Normalize: một artifact Lv20 5★ thường có ~4-5 substats với tổng ~8-9 rolls
  // Chuẩn hóa tổng RV trên 4 substat tối đa
  const maxSubstats = Math.max(breakdown.length, 1);
  const normalizedRV = totalRV / maxSubstats;

  return {
    totalRV: Math.min(totalRV, 400), // Cap tại 400 (4 substats × 100%)
    breakdown,
    overallGrade: getGrade(normalizedRV),
    offensiveRV,
  };
}

// ---------------------------------------------------------------------------
// KQM Neutral Gear Comparison Model
// ---------------------------------------------------------------------------

/**
 * Model gear trung lập KQM: artifact cố định theo chuẩn,
 * chỉ thay đổi vũ khí / bộ để so sánh chính xác
 */
export interface KQMNeutralGearConfig {
  /** Base ATK từ nhân vật (Lv90) */
  charBaseAtk: number;
  /** Base ATK của vũ khí */
  weaponBaseAtk: number;
  /** Substat vũ khí (nếu có) */
  weaponSubStat?: SubstatKey;
  /** Giá trị substat vũ khí */
  weaponSubStatValue?: number;
  /** Phân phối roll KQM áp dụng */
  distribution: KQMDistribution;
  /** Main stat Goblet (nguyên tố DMG%) */
  gobletDmgBonus: number;
  /** Bonus DMG từ bộ artifact (2pc/4pc) */
  setDmgBonus: number;
  /** Bonus khác (Passive vũ khí, buff đội, v.v.) */
  miscDmgBonus: number;
}

/**
 * Kết quả so sánh KQM Neutral Gear
 */
export interface KQMComparisonResult {
  /** Tổng ATK tính được */
  totalAtk: number;
  /** Tổng CRIT Rate (%) */
  critRate: number;
  /** Tổng CRIT DMG (%) */
  critDmg: number;
  /** Elemental Mastery */
  em: number;
  /** Energy Recharge (%) */
  er: number;
  /** Tổng DMG Bonus (%) */
  dmgBonus: number;
  /** "Crit Value" = CR×2 + CD (KQM quick metric) */
  critValue: number;
  /**
   * Estimated Average Hit Multiplier:
   * (1 + CR/100 × CD/100) × (1 + dmgBonus/100)
   */
  avgHitMultiplier: number;
}

/**
 * Tính toán thống kê KQM Neutral Gear cho một config vũ khí cụ thể
 */
export function calculateKQMNeutralGear(
  config: KQMNeutralGearConfig
): KQMComparisonResult {
  const dist = config.distribution;

  // Lấy giá trị từ distribution
  const getStat = (key: SubstatKey): number => {
    const entry = dist.substats.find((s) => s.stat === key);
    return entry ? entry.totalValue : 0;
  };

  // ATK từ substat artifact
  const artifactAtkPercent = getStat("atkPercent");

  // ATK từ substat vũ khí
  const weaponAtkPercent =
    config.weaponSubStat === "atkPercent"
      ? (config.weaponSubStatValue ?? 0)
      : 0;

  const totalAtkPercent = artifactAtkPercent + weaponAtkPercent;

  const totalAtk = Math.floor(
    (config.charBaseAtk + config.weaponBaseAtk) *
      (1 + totalAtkPercent / 100)
  );

  // CRIT từ base (5% base) + artifact substats + vũ khí
  const weaponCritRate =
    config.weaponSubStat === "critRate"
      ? (config.weaponSubStatValue ?? 0)
      : 0;
  const weaponCritDmg =
    config.weaponSubStat === "critDmg"
      ? (config.weaponSubStatValue ?? 0)
      : 0;

  const critRate = Math.min(5 + getStat("critRate") + weaponCritRate, 100);
  const critDmg = 50 + getStat("critDmg") + weaponCritDmg;

  // EM & ER
  const weaponEm =
    config.weaponSubStat === "em" ? (config.weaponSubStatValue ?? 0) : 0;
  const weaponEr =
    config.weaponSubStat === "er" ? (config.weaponSubStatValue ?? 0) : 0;
  const em = getStat("em") + weaponEm;
  const er = 100 + getStat("er") + weaponEr;

  // DMG Bonus
  const dmgBonus =
    config.gobletDmgBonus + config.setDmgBonus + config.miscDmgBonus;

  // Crit Value (KQM quick metric)
  const critValue = critRate * 2 + critDmg;

  // Average Hit Multiplier (không tính DEF/RES)
  const avgHitMultiplier =
    (1 + (critRate / 100) * (critDmg / 100)) * (1 + dmgBonus / 100);

  return {
    totalAtk,
    critRate,
    critDmg,
    em,
    er,
    dmgBonus,
    critValue,
    avgHitMultiplier,
  };
}

/**
 * So sánh 2 vũ khí dưới cùng điều kiện KQM Neutral Gear
 * @returns { relative: number } - % chênh lệch DPS so với baseline
 */
export function compareWeaponsKQM(
  baseline: KQMNeutralGearConfig,
  challenger: KQMNeutralGearConfig
): {
  baselineResult: KQMComparisonResult;
  challengerResult: KQMComparisonResult;
  relativeDPS: number; // challenger/baseline - 1, dưới dạng %
} {
  const baselineResult = calculateKQMNeutralGear(baseline);
  const challengerResult = calculateKQMNeutralGear(challenger);

  const relativeDPS =
    ((challengerResult.avgHitMultiplier - baselineResult.avgHitMultiplier) /
      baselineResult.avgHitMultiplier) *
    100;

  return { baselineResult, challengerResult, relativeDPS };
}
