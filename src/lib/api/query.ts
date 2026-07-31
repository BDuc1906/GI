import type { ApiMeta } from "./response";
import { ApiError } from "./errors";

export const DEFAULT_LIMIT = 24;
export const MAX_LIMIT = 100;

export interface Pagination {
  page: number;
  limit: number;
  skip: number;
  take: number;
}

/**
 * Parse `page`/`limit` từ query string với validate chặt: từ chối giá trị
 * không phải số nguyên dương, và clamp limit về MAX_LIMIT thay vì cho phép
 * client kéo toàn bộ bảng trong 1 request (DoS vector đơn giản nhất của một
 * API public không auth).
 */
export function parsePagination(searchParams: URLSearchParams): Pagination {
  const page = parsePositiveInt(searchParams.get("page"), "page", 1);
  const rawLimit = parsePositiveInt(searchParams.get("limit"), "limit", DEFAULT_LIMIT);
  const limit = Math.min(rawLimit, MAX_LIMIT);

  return { page, limit, skip: (page - 1) * limit, take: limit };
}

function parsePositiveInt(raw: string | null, field: string, fallback: number): number {
  if (raw === null || raw === "") return fallback;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1) {
    throw ApiError.badRequest(`Tham số "${field}" phải là số nguyên dương`, { field, value: raw });
  }
  return n;
}

export function buildMeta(pagination: Pagination, total: number): ApiMeta {
  return {
    page: pagination.page,
    limit: pagination.limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / pagination.limit),
  };
}

/**
 * Parse tham số `sort` dạng "field" (asc) hoặc "-field" (desc), chỉ chấp
 * nhận field nằm trong whitelist của từng resource — tránh cho client sort
 * theo field bất kỳ (leak cấu trúc DB, hoặc gây lỗi Prisma khó hiểu).
 */
export function parseSort<T extends string>(
  raw: string | null,
  allowed: readonly T[],
  fallback: { field: T; dir: "asc" | "desc" }
): { field: T; dir: "asc" | "desc" } {
  if (!raw) return fallback;

  const dir: "asc" | "desc" = raw.startsWith("-") ? "desc" : "asc";
  const field = (raw.startsWith("-") ? raw.slice(1) : raw) as T;

  if (!allowed.includes(field)) {
    throw ApiError.badRequest(`Tham số "sort" không hợp lệ: "${raw}"`, {
      allowed: allowed.flatMap((f) => [f, `-${f}`]),
    });
  }

  return { field, dir };
}

/** Parse `rarity` (số nguyên đơn) hoặc `rarity=4,5` (danh sách) thành mảng số. */
export function parseRarityList(raw: string | null): number[] | undefined {
  if (!raw) return undefined;
  const values = raw.split(",").map((v) => v.trim());
  const parsed = values.map((v) => {
    const n = Number(v);
    if (!Number.isInteger(n) || n < 1 || n > 5) {
      throw ApiError.badRequest(`Tham số "rarity" không hợp lệ: "${v}" (chỉ nhận 1–5)`, { value: v });
    }
    return n;
  });
  return parsed;
}