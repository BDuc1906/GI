
import { NextResponse } from "next/server";

/**
 * Envelope chuẩn cho MỌI response của API — client chỉ cần xử lý đúng 1 hình
 * dạng duy nhất thay vì đoán field theo từng endpoint.
 *
 * Success: { success: true, data, meta? }
 * Error:   { success: false, error: { code, message, details? } }
 */
export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccessBody<T> {
  success: true;
  data: T;
  meta?: ApiMeta;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

// Mặc định khi route không truyền `maxAgeSec` riêng.
const DEFAULT_MAX_AGE_SEC = 60;

/**
 * s-maxage lấy TRỰC TIẾP từ `maxAgeSec` do route truyền vào — PHẢI khớp với
 * giá trị `export const revalidate` khai báo ở đầu file route đó.
 *
 * Trước đây header này hard-code cứng "s-maxage=60" cho mọi route bất kể
 * route tự khai `revalidate` bao nhiêu (vd domains khai 3600 vì "gần như
 * không đổi trong tuần", nhưng CDN/browser vẫn chỉ cache đúng 60s) — 2 tầng
 * cache (Next.js Data Cache nội bộ theo `revalidate`, và Cache-Control gửi
 * ra ngoài cho CDN/trình duyệt) lệch nhau, khiến các resource ít đổi (vd
 * domains, materials) bị đánh giá lại ở CDN thường xuyên hơn cần thiết —
 * không sai dữ liệu, chỉ tốn hit DB/Neon vô ích.
 *
 * stale-while-revalidate luôn để gấp 5 lần s-maxage — client vẫn nhận
 * response cũ ngay lập tức trong lúc revalidate nền, tỉ lệ giữ nguyên theo
 * mọi mức max-age thay vì cứng "300" như trước (vô nghĩa với route
 * s-maxage=3600, vì 300 < 3600 nghĩa là cửa sổ "stale" ngắn hơn cả chu kỳ
 * cache chính).
 */
function cacheControlHeader(maxAgeSec: number): string {
  return `public, s-maxage=${maxAgeSec}, stale-while-revalidate=${maxAgeSec * 5}`;
}

export function ok<T>(
  data: T,
  init?: { meta?: ApiMeta; status?: number; noCache?: boolean; maxAgeSec?: number }
): NextResponse<ApiSuccessBody<T>> {
  const body: ApiSuccessBody<T> = { success: true, data };
  if (init?.meta) body.meta = init.meta;

  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: init?.noCache
      ? undefined
      : { "Cache-Control": cacheControlHeader(init?.maxAgeSec ?? DEFAULT_MAX_AGE_SEC) },
  });
}

export function fail(
  status: number,
  code: string,
  message: string,
  details?: unknown
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = { success: false, error: { code, message } };
  if (details !== undefined) body.error.details = details;

  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
