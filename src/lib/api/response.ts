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

const DEFAULT_HEADERS = {
  // Danh sách công khai, ít thay đổi trong ngắn hạn -> cho phép cache ở CDN
  // 60s, phục vụ thêm 5 phút "stale" trong lúc revalidate nền.
  "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
} as const;

export function ok<T>(
  data: T,
  init?: { meta?: ApiMeta; status?: number; noCache?: boolean }
): NextResponse<ApiSuccessBody<T>> {
  const body: ApiSuccessBody<T> = { success: true, data };
  if (init?.meta) body.meta = init.meta;

  return NextResponse.json(body, {
    status: init?.status ?? 200,
    headers: init?.noCache ? undefined : DEFAULT_HEADERS,
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