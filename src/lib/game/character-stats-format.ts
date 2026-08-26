/**
 * src/lib/character-stats-format.ts
 *
 * Các hàm định dạng chỉ số THUẦN (pure — không import prisma, không I/O) —
 * tách riêng khỏi character-helpers.ts để dùng an toàn trong Client
 * Component (vd CharacterLevelSlider.tsx). character-helpers.ts import
 * `prisma` ở đầu file (cho resolveTravelerSibling, getMaterialIconMap) —
 * import thẳng file đó vào 1 component "use client" sẽ kéo theo Prisma
 * Client vào bundle trình duyệt, hỏng build hoặc phình bundle không cần
 * thiết vì Prisma chỉ chạy được ở Node/server.
 *
 * character-helpers.ts re-export lại từ đây để không phá bất kỳ import nào
 * đang dùng `from "@/lib/game/character-helpers"` ở phía server.
 */

export type StatByLevelRow = {
  level: number;
  ascension: number | null;
  hp: number | null;
  attack: number | null;
  defense: number | null;
  specialized: number | null;
};

export function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return Math.round(n).toLocaleString("vi-VN");
}

/**
 * genshin-db trả về chỉ số phụ đột phá (specialized) dưới dạng số thô:
 * - Elemental Mastery: số nguyên thật (vd 187) -> hiển thị như formatNumber.
 * - Mọi chỉ số còn lại (Crit Rate/DMG, Energy Recharge, DMG Bonus theo hệ...)
 *   là % và genshin-db trả về dạng thập phân (vd 0.288 = 28.8%), KHÔNG phải
 *   số nguyên. Nhận biết loại chỉ số qua chuỗi ascensionStat (vd "CRIT
 *   Rate", "Energy Recharge", "Pyro DMG Bonus") có chứa "elemental mastery"
 *   hay không.
 */
export function formatSpecialized(
  n: number | null | undefined,
  ascensionStatLabel: string | null | undefined
): string {
  if (n === null || n === undefined) return "—";
  const isFlatElementalMastery = (ascensionStatLabel ?? "")
    .toLowerCase()
    .includes("elemental mastery");
  if (isFlatElementalMastery) {
    return formatNumber(n);
  }
  return `${(n * 100).toLocaleString("vi-VN", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}
