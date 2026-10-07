/**
 * src/lib/game/birthdays.ts
 *
 * Xử lý sinh nhật nhân vật. Nguồn: cột Character.birthdaymmdd (dạng "9/21" =
 * tháng/ngày, từ genshin-db) — nếu thiếu thì thử đọc Character.birthday
 * (dạng "September 21"). Không có năm sinh nên chỉ tính theo lịch dương hằng năm.
 */

export interface Birthday {
  month: number; // 1-12
  day: number; // 1-31
}

const EN_MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // tháng 2 cho phép 29

function valid(month: number, day: number): boolean {
  return month >= 1 && month <= 12 && day >= 1 && day <= DAYS_IN_MONTH[month - 1];
}

export function parseBirthday(mmdd?: string | null, text?: string | null): Birthday | null {
  const a = /^(\d{1,2})\/(\d{1,2})$/.exec((mmdd ?? "").trim());
  if (a) {
    const month = Number(a[1]);
    const day = Number(a[2]);
    if (valid(month, day)) return { month, day };
  }
  const b = /^([A-Za-z]+)\s+(\d{1,2})$/.exec((text ?? "").trim());
  if (b) {
    const month = EN_MONTHS.indexOf(b[1].toLowerCase()) + 1;
    const day = Number(b[2]);
    if (month > 0 && valid(month, day)) return { month, day };
  }
  return null;
}

/** Ngày hiện tại theo UTC+8 (server Châu Á, mặc định của site). Asia/Shanghai không có DST. */
export function todayAsia(now: Date = new Date()): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const [year, month, day] = parts.split("-").map(Number);
  return { year, month, day };
}

function isLeap(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

const dayNumber = (y: number, m: number, d: number) => Math.round(Date.UTC(y, m - 1, d) / 86_400_000);

/** Số ngày từ hôm nay tới lần sinh nhật tiếp theo (0 = đúng hôm nay). 29/2 → 28/2 vào năm không nhuận. */
export function daysUntil(
  today: { year: number; month: number; day: number },
  b: Birthday
): number {
  const target = (year: number) =>
    b.month === 2 && b.day === 29 && !isLeap(year)
      ? dayNumber(year, 2, 28)
      : dayNumber(year, b.month, b.day);
  const now = dayNumber(today.year, today.month, today.day);
  let diff = target(today.year) - now;
  if (diff < 0) diff = target(today.year + 1) - now;
  return diff;
}
