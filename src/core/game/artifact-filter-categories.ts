/**
 * src/core/game/artifact-filter-categories.ts
 *
 * Hệ thống phân loại bộ Thánh Di Vật theo cơ chế hiệu ứng và phẩm cấp.
 * Phân tích trực tiếp từ dữ liệu haiPieceBonus và fourPieceBonus trong DB thật.
 */

export type ArtifactStatCategory =
  | "all"
  | "atk"
  | "hp"
  | "def"
  | "em"
  | "er"
  | "crit"
  | "elemental"
  | "skill_burst"
  | "healing"
  | "support";

export interface ArtifactCategoryDefinition {
  key: ArtifactStatCategory;
  nameVi: string;
  nameEn: string;
}

export const ARTIFACT_CATEGORIES: ArtifactCategoryDefinition[] = [
  { key: "all", nameVi: "Tất cả", nameEn: "All" },
  { key: "atk", nameVi: "Tấn Công (ATK%)", nameEn: "Attack (ATK)" },
  { key: "crit", nameVi: "Bạo Kích (CRIT)", nameEn: "Critical Rate / DMG" },
  { key: "er", nameVi: "Hiệu Quả Nạp (ER)", nameEn: "Energy Recharge" },
  { key: "em", nameVi: "Tinh Thông (EM)", nameEn: "Elemental Mastery" },
  { key: "elemental", nameVi: "ST Nguyên Tố", nameEn: "Elemental DMG" },
  { key: "hp", nameVi: "Giới Hạn Máu (HP)", nameEn: "Health (HP)" },
  { key: "def", nameVi: "Phòng Ngự (DEF)", nameEn: "Defense (DEF)" },
  { key: "skill_burst", nameVi: "Kỹ Năng / Nộ", nameEn: "Skill / Burst" },
  { key: "healing", nameVi: "Hồi Máu / Trị Liệu", nameEn: "Healing" },
  { key: "support", nameVi: "Hỗ Trợ / Đội Hình", nameEn: "Team Support" },
];

/**
 * Xác định các danh mục chỉ số mà một bộ Thánh Di Vật cung cấp
 * dựa trên văn bản hiệu ứng 2 món và 4 món.
 */
export function categorizeArtifactSet(
  twoPieceBonus: string | null | undefined,
  fourPieceBonus: string | null | undefined,
  setName: string
): ArtifactStatCategory[] {
  const text = `${twoPieceBonus ?? ""} ${fourPieceBonus ?? ""} ${setName}`.toLowerCase();
  const categories: Set<ArtifactStatCategory> = new Set();

  // 1. Tấn Công (ATK)
  if (
    text.includes("tấn công") ||
    text.includes("atk") ||
    text.includes("attack") ||
    text.includes("sát thương vật lý") ||
    text.includes("physical")
  ) {
    categories.add("atk");
  }

  // 2. Bạo Kích (CRIT)
  if (
    text.includes("bạo kích") ||
    text.includes("crit") ||
    text.includes("tỷ lệ bạo") ||
    text.includes("sát thương bạo")
  ) {
    categories.add("crit");
  }

  // 3. Hiệu Quả Nạp (ER)
  if (
    text.includes("hiệu quả nạp") ||
    text.includes("nạp năng lượng") ||
    text.includes("energy recharge") ||
    text.includes("năng lượng nguyên tố") ||
    text.includes("hồi lại năng lượng")
  ) {
    categories.add("er");
  }

  // 4. Tinh Thông Nguyên Tố (EM)
  if (
    text.includes("tinh thông") ||
    text.includes("elemental mastery") ||
    text.includes("phản ứng nguyên tố") ||
    text.includes("sum suê") ||
    text.includes("nở rộ") ||
    text.includes("tăng cường") ||
    text.includes("quá tải")
  ) {
    categories.add("em");
  }

  // 5. Sát Thương Nguyên Tố (Elemental DMG)
  if (
    text.includes("sát thương hỏa") ||
    text.includes("sát thương thủy") ||
    text.includes("sát thương phong") ||
    text.includes("sát thương lôi") ||
    text.includes("sát thương thảo") ||
    text.includes("sát thương băng") ||
    text.includes("sát thương nham") ||
    text.includes("pyro dmg") ||
    text.includes("hydro dmg") ||
    text.includes("anemo dmg") ||
    text.includes("electro dmg") ||
    text.includes("dendro dmg") ||
    text.includes("cryo dmg") ||
    text.includes("geo dmg") ||
    text.includes("khuếch tán") ||
    text.includes("giảm kháng")
  ) {
    categories.add("elemental");
  }

  // 6. HP (Máu)
  if (
    text.includes("giới hạn hp") ||
    text.includes("max hp") ||
    text.includes("tăng hp") ||
    text.includes("hp tăng")
  ) {
    categories.add("hp");
  }

  // 7. Phòng Ngự (DEF)
  if (
    text.includes("phòng ngự") ||
    text.includes("def") ||
    text.includes("defense")
  ) {
    categories.add("def");
  }

  // 8. Kỹ Năng Nguyên Tố / Kỹ Năng Nộ / Khi Đáp
  if (
    text.includes("kỹ năng nguyên tố") ||
    text.includes("kỹ năng nộ") ||
    text.includes("tấn công khi đáp") ||
    text.includes("elemental skill") ||
    text.includes("elemental burst") ||
    text.includes("plunging") ||
    text.includes("trọng kích")
  ) {
    categories.add("skill_burst");
  }

  // 9. Hồi Máu / Trị Liệu
  if (
    text.includes("trị liệu") ||
    text.includes("hồi máu") ||
    text.includes("healing") ||
    text.includes("phục hồi hp")
  ) {
    categories.add("healing");
  }

  // 10. Hỗ Trợ Đội Hình
  if (
    text.includes("toàn đội") ||
    text.includes("cho tất cả nhân vật") ||
    text.includes("party members") ||
    text.includes("giảm kháng") ||
    text.includes("dũng sĩ") ||
    text.includes("tông thất")
  ) {
    categories.add("support");
  }

  return Array.from(categories);
}
