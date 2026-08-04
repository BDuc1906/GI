/**
 * src/lib/genshin-server-time.ts
 *
 * Genshin Impact đổi ngày (domain nào mở, weekly boss nào reset...) lúc
 * **4:00 sáng theo giờ SERVER**, không phải nửa đêm — và "giờ server" khác
 * nhau tuỳ server người chơi chọn lúc tạo tài khoản, KHÔNG đổi được sau đó:
 *
 *   - Server Châu Á / TW-HK-MO (Asia): UTC+8 — server đa số người chơi
 *     Việt Nam thực tế đăng nhập, chọn làm mặc định cho site này.
 *   - Server Mỹ (America): UTC-5
 *   - Server Châu Âu (Europe): UTC+1
 *
 * Trước bản sửa này, có 2 chỗ tính "hôm nay" cho tính năng Bí cảnh, và cả
 * hai đều sai theo cách khác nhau:
 *   - `src/app/domains/page.tsx` coi "hôm nay" đổi lúc NỬA ĐÊM giờ Việt
 *     Nam (UTC+7) — sai 2 lần: (1) đổi ngày thật trong game là 4h sáng chứ
 *     không phải 0h, (2) UTC+7 (giờ dân sự Việt Nam) không phải UTC+8 (giờ
 *     server Asia mà đa số người chơi VN thực sự dùng) — chỉ trùng nhau
 *     phần lớn thời gian trong ngày, lệch 1 tiếng quanh mốc đổi ngày.
 *   - `src/app/api/domains/route.ts` (`?today=true`) dùng thẳng
 *     `new Date().getUTCDay()` — tức nửa đêm UTC — dù docstring phía trên
 *     ghi "thứ hôm nay theo giờ server" (comment nói một đằng, code làm một
 *     nẻo). Kết quả: cùng một khái niệm "hôm nay" nhưng trang web và API
 *     có thể trả về 2 thứ khác nhau trong cùng thời điểm.
 *
 * File này là nguồn tính toán DUY NHẤT cho cả trang lẫn API, để không bao
 * giờ lệch nhau nữa.
 */

export const GENSHIN_ASIA_SERVER_UTC_OFFSET_HOURS = 8;
export const GENSHIN_DAILY_RESET_HOUR = 4;

const WEEKDAYS_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type GenshinWeekdayEn = (typeof WEEKDAYS_EN)[number];

/**
 * Trả về index ngày trong tuần (0 = Chủ Nhật ... 6 = Thứ Bảy) theo đúng
 * ngày game thật đang tính tại thời điểm `date`, dựa trên giờ server Châu
 * Á (UTC+8) và mốc đổi ngày 4:00 sáng.
 *
 * Cách tính: quy đổi timestamp UTC sang "thời khắc server" (+8h), rồi lùi
 * thêm giờ reset (-4h) trước khi đọc thứ — nhờ vậy một thời điểm như
 * 03:00 sáng giờ server (trước reset) vẫn được tính là "hôm qua" đúng như
 * trong game, không phải "hôm nay" như cách tính theo lịch dương thông
 * thường sẽ cho ra.
 *
 * Luôn dùng getUTC*() trên timestamp đã dịch chuyển (không dùng
 * getDay()/getHours() thường) để kết quả không phụ thuộc biến môi trường
 * TZ của máy chủ chạy Node — quan trọng vì Vercel/CI có thể chạy ở múi giờ
 * khác nhau giữa các lần deploy.
 */
export function genshinServerWeekdayIndex(
  date: Date = new Date(),
  utcOffsetHours: number = GENSHIN_ASIA_SERVER_UTC_OFFSET_HOURS
): number {
  const shiftedMs =
    date.getTime() +
    utcOffsetHours * 60 * 60 * 1000 -
    GENSHIN_DAILY_RESET_HOUR * 60 * 60 * 1000;
  return new Date(shiftedMs).getUTCDay();
}

/** Như trên, nhưng trả thẳng tên tiếng Anh khớp với `Domain.daysOfWeek` trong DB. */
export function genshinServerWeekdayName(
  date: Date = new Date(),
  utcOffsetHours: number = GENSHIN_ASIA_SERVER_UTC_OFFSET_HOURS
): GenshinWeekdayEn {
  return WEEKDAYS_EN[genshinServerWeekdayIndex(date, utcOffsetHours)];
}

export { WEEKDAYS_EN as GENSHIN_WEEKDAYS_EN };
