
/**
 * src/lib/pagination.ts
 *
 * Phân trang cho các trang danh sách render server-side
 * (/characters, /weapons, /artifacts) — TÁCH RIÊNG khỏi
 * `src/lib/api/query.ts` (dùng cho API JSON) vì 2 ngữ cảnh cần xử lý lỗi
 * khác nhau:
 *  - API: `page` sai (vd "abc", "-1") phải trả 400 rõ ràng cho client lập
 *    trình viên biết mà sửa — nên `parsePagination` ở query.ts throw
 *    ApiError.
 *  - Trang web (Server Component): `?page=abc` gõ tay/link cũ hỏng không
 *    nên làm vỡ cả trang (rơi vào error.tsx) — chỉ cần âm thầm rơi về
 *    trang 1, đúng hành vi người dùng mong đợi khi gõ URL sai.
 */

// Lưới 6 cột (lg) — 48 = 8 hàng đầy trên màn hình rộng, số vừa đủ để không
// tải quá nhiều ảnh cùng lúc (mỗi card là 1 <SafeImage>) nhưng vẫn đủ dày để
// không phải bấm "trang sau" liên tục khi duyệt.
export const LIST_PAGE_SIZE = 48;

/**
 * Parse `page` cho trang danh sách: mọi giá trị không phải số nguyên dương
 * hợp lệ đều rơi về trang 1, không throw — khác hẳn `parsePagination` (API).
 */
export function parsePageParam(raw: string | undefined): number {
  const n = Number(raw);
  if (!raw || !Number.isInteger(n) || n < 1) return 1;
  return n;
}

export function totalPagesFor(total: number, pageSize: number = LIST_PAGE_SIZE): number {
  return total === 0 ? 1 : Math.ceil(total / pageSize);
}
