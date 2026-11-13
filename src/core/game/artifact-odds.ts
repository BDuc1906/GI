/**
 * src/core/game/artifact-odds.ts
 *
 * Dữ liệu chuẩn xác xác suất dòng chính và biên độ roll dòng phụ Thánh Di Vật
 * theo tài liệu thực chứng KeqingMains (KQM) và game data Genshin Impact.
 */

export interface MainStatOdds {
  stat: string;
  statVi: string;
  weight: number;
  percentage: number;
}

export interface SlotMainStatData {
  slot: "flower" | "plume" | "sands" | "goblet" | "circlet";
  slotName: string;
  slotNameVi: string;
  icon: string;
  stats: MainStatOdds[];
}

export interface SubstatRollTier {
  stat: string;
  statVi: string;
  isPercent: boolean;
  tier5Star: [number, number, number, number]; // [Tier 1 (70%), Tier 2 (80%), Tier 3 (90%), Tier 4 (100%)]
  tier4Star: [number, number, number, number];
  unit: string;
}

/**
 * Tỷ lệ xuất hiện dòng chính cho từng vị trí Thánh Di Vật (Chuẩn KQM / Genshin Wiki).
 */
export const ARTIFACT_MAIN_STAT_ODDS: Record<string, SlotMainStatData> = {
  flower: {
    slot: "flower",
    slotName: "Flower of Life",
    slotNameVi: "Hoa Sự Sống",
    icon: "🌸",
    stats: [
      { stat: "HP", statVi: "HP Cố Định", weight: 100, percentage: 100.0 },
    ],
  },
  plume: {
    slot: "plume",
    slotName: "Plume of Death",
    slotNameVi: "Lông Vũ Tử Vong",
    icon: "🪶",
    stats: [
      { stat: "ATK", statVi: "Tấn Công Cố Định", weight: 100, percentage: 100.0 },
    ],
  },
  sands: {
    slot: "sands",
    slotName: "Sands of Eon",
    slotNameVi: "Đồng Hồ Cát Thời Gian",
    icon: "⏳",
    stats: [
      { stat: "HP%", statVi: "HP%", weight: 2668, percentage: 26.68 },
      { stat: "ATK%", statVi: "Tấn Công%", weight: 2666, percentage: 26.66 },
      { stat: "DEF%", statVi: "Phòng Ngự%", weight: 2666, percentage: 26.66 },
      { stat: "Energy Recharge", statVi: "Hiệu Quả Nạp (ER%)", weight: 1000, percentage: 10.00 },
      { stat: "Elemental Mastery", statVi: "Tinh Thông Nguyên Tố (EM)", weight: 1000, percentage: 10.00 },
    ],
  },
  goblet: {
    slot: "goblet",
    slotName: "Goblet of Eonothem",
    slotNameVi: "Ly Không Gian",
    icon: "🍷",
    stats: [
      { stat: "HP%", statVi: "HP%", weight: 1925, percentage: 19.25 },
      { stat: "ATK%", statVi: "Tấn Công%", weight: 1925, percentage: 19.25 },
      { stat: "DEF%", statVi: "Phòng Ngự%", weight: 1900, percentage: 19.00 },
      { stat: "Pyro DMG Bonus", statVi: "Sát Thương Hỏa", weight: 500, percentage: 5.00 },
      { stat: "Hydro DMG Bonus", statVi: "Sát Thương Thủy", weight: 500, percentage: 5.00 },
      { stat: "Cryo DMG Bonus", statVi: "Sát Thương Băng", weight: 500, percentage: 5.00 },
      { stat: "Electro DMG Bonus", statVi: "Sát Thương Lôi", weight: 500, percentage: 5.00 },
      { stat: "Anemo DMG Bonus", statVi: "Sát Thương Phong", weight: 500, percentage: 5.00 },
      { stat: "Geo DMG Bonus", statVi: "Sát Thương Nham", weight: 500, percentage: 5.00 },
      { stat: "Dendro DMG Bonus", statVi: "Sát Thương Thảo", weight: 500, percentage: 5.00 },
      { stat: "Physical DMG Bonus", statVi: "Sát Thương Vật Lý", weight: 500, percentage: 5.00 },
      { stat: "Elemental Mastery", statVi: "Tinh Thông Nguyên Tố (EM)", weight: 250, percentage: 2.50 },
    ],
  },
  circlet: {
    slot: "circlet",
    slotName: "Circlet of Logos",
    slotNameVi: "Nón Lý Trí",
    icon: "👑",
    stats: [
      { stat: "HP%", statVi: "HP%", weight: 2200, percentage: 22.00 },
      { stat: "ATK%", statVi: "Tấn Công%", weight: 2200, percentage: 22.00 },
      { stat: "DEF%", statVi: "Phòng Ngự%", weight: 2200, percentage: 22.00 },
      { stat: "CRIT Rate", statVi: "Tỷ Lệ Bạo Kích (CR)", weight: 1000, percentage: 10.00 },
      { stat: "CRIT DMG", statVi: "Sát Thương Bạo Kích (CD)", weight: 1000, percentage: 10.00 },
      { stat: "Healing Bonus", statVi: "Tăng Trị Liệu", weight: 1000, percentage: 10.00 },
      { stat: "Elemental Mastery", statVi: "Tinh Thông Nguyên Tố (EM)", weight: 400, percentage: 4.00 },
    ],
  },
};

/**
 * Bảng biên độ chỉ số dòng phụ (Substat Roll Value Tiers) cho 5★ và 4★.
 * Mỗi lần xuất hiện hoặc nâng cấp dòng phụ, hệ thống ngẫu nhiên chọn 1 trong 4 bậc
 * (70%, 80%, 90%, 100% của giá trị tối đa) với xác suất đều 25%.
 */
export const ARTIFACT_SUBSTAT_ROLL_TIERS: SubstatRollTier[] = [
  {
    stat: "CRIT Rate",
    statVi: "Tỷ Lệ Bạo (CR)",
    isPercent: true,
    unit: "%",
    tier5Star: [2.72, 3.11, 3.50, 3.89],
    tier4Star: [2.18, 2.49, 2.80, 3.11],
  },
  {
    stat: "CRIT DMG",
    statVi: "Sát Thương Bạo (CD)",
    isPercent: true,
    unit: "%",
    tier5Star: [5.44, 6.22, 6.99, 7.77],
    tier4Star: [4.35, 4.97, 5.60, 6.22],
  },
  {
    stat: "ATK%",
    statVi: "Tấn Công%",
    isPercent: true,
    unit: "%",
    tier5Star: [4.08, 4.66, 5.25, 5.83],
    tier4Star: [3.26, 3.73, 4.20, 4.66],
  },
  {
    stat: "HP%",
    statVi: "HP%",
    isPercent: true,
    unit: "%",
    tier5Star: [4.08, 4.66, 5.25, 5.83],
    tier4Star: [3.26, 3.73, 4.20, 4.66],
  },
  {
    stat: "DEF%",
    statVi: "Phòng Ngự%",
    isPercent: true,
    unit: "%",
    tier5Star: [5.10, 5.83, 6.56, 7.29],
    tier4Star: [4.08, 4.66, 5.25, 5.83],
  },
  {
    stat: "Energy Recharge",
    statVi: "Hiệu Quả Nạp (ER)",
    isPercent: true,
    unit: "%",
    tier5Star: [4.53, 5.18, 5.83, 6.48],
    tier4Star: [3.63, 4.14, 4.66, 5.18],
  },
  {
    stat: "Elemental Mastery",
    statVi: "Tinh Thông (EM)",
    isPercent: false,
    unit: "",
    tier5Star: [16.32, 18.65, 20.98, 23.31],
    tier4Star: [13.06, 14.92, 16.79, 18.65],
  },
  {
    stat: "Flat ATK",
    statVi: "Tấn Công Cố Định",
    isPercent: false,
    unit: "",
    tier5Star: [13.62, 15.56, 17.51, 19.45],
    tier4Star: [10.89, 12.45, 14.01, 15.56],
  },
  {
    stat: "Flat HP",
    statVi: "HP Cố Định",
    isPercent: false,
    unit: "",
    tier5Star: [209.13, 239.00, 268.88, 298.75],
    tier4Star: [167.30, 191.20, 215.10, 239.00],
  },
  {
    stat: "Flat DEF",
    statVi: "Phòng Ngự Cố Định",
    isPercent: false,
    unit: "",
    tier5Star: [16.20, 18.52, 20.83, 23.15],
    tier4Star: [12.96, 14.81, 16.67, 18.52],
  },
];

/**
 * Tính toán Crit Value (CV):
 * CV = 2 * CRIT_Rate + CRIT_DMG
 * Thang đo KQM:
 * - Dưới 20 CV: Bình thường / Tạm ổn
 * - 20 - 30 CV: Khá
 * - 30 - 40 CV: Rất tốt
 * - 40 - 50 CV: Xuất sắc (God piece)
 * - 50+ CV: Kỳ lân (Cực hiếm)
 */
export function calculateCritValue(critRate: number, critDmg: number): { cv: number; tier: string; color: string } {
  const cv = Math.round((2 * critRate + critDmg) * 10) / 10;
  if (cv >= 50) return { cv, tier: "Kỳ Lân (Top 0.01%)", color: "#f59e0b" };
  if (cv >= 40) return { cv, tier: "Xuất Sắc (God Tier)", color: "#ec4899" };
  if (cv >= 30) return { cv, tier: "Rất Tốt (End-game)", color: "#a855f7" };
  if (cv >= 20) return { cv, tier: "Khá (Tốt)", color: "#3b82f6" };
  return { cv, tier: "Tạm Ổn", color: "#64748b" };
}
