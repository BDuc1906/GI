
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

// BUG ĐÃ SỬA (2026-09): trước đây hard-code `.toLocaleString("vi-VN")` —
// bảng chỉ số theo cấp độ trên MỌI trang chi tiết nhân vật/vũ khí luôn
// hiện số kiểu Việt Nam (dấu phẩy thập phân, dấu chấm ngăn cách nghìn,
// vd "1.234,5") bất kể người dùng đang chọn ngôn ngữ nào. Giờ nhận thêm
// tham số `locale`, mặc định "en" nếu không truyền (an toàn cho call site
// cũ chưa kịp cập nhật) — dùng đúng locale hiện tại để format số theo quy
// ước bản địa tương ứng (vd "1,234.5" cho en, "1.234,5" vẫn đúng cho vi/de).
export function formatNumber(n: number | null | undefined, locale: string = "en"): string {
  if (n === null || n === undefined) return "—";
  return Math.round(n).toLocaleString(locale);
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
  ascensionStatLabel: string | null | undefined,
  locale: string = "en"
): string {
  if (n === null || n === undefined) return "—";
  const isFlatElementalMastery = (ascensionStatLabel ?? "")
    .toLowerCase()
    .includes("elemental mastery");
  if (isFlatElementalMastery) {
    return formatNumber(n, locale);
  }
  return `${(n * 100).toLocaleString(locale, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })}%`;
}
