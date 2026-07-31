import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { fail } from "./response";

/**
 * Lỗi nghiệp vụ có chủ đích (validate input, không tìm thấy record...).
 * Khác với lỗi hệ thống (Prisma, network...) — được withErrorHandling bắt
 * riêng để không lộ chi tiết nội bộ ra ngoài.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }

  static badRequest(message: string, details?: unknown) {
    return new ApiError(400, "BAD_REQUEST", message, details);
  }

  static notFound(message = "Không tìm thấy tài nguyên") {
    return new ApiError(404, "NOT_FOUND", message);
  }
}

type RouteContext = { params: Promise<Record<string, string>> };
type Handler = (req: NextRequest, ctx: RouteContext) => Promise<Response>;

/**
 * Bọc quanh mọi route handler để:
 * 1. Đảm bảo LUÔN trả về đúng envelope { success, ... } kể cả khi crash bất
 *    ngờ, thay vì để Next.js trả HTML lỗi 500 mặc định (client parse JSON sẽ
 *    hỏng nếu vậy).
 * 2. Map các lỗi Prisma quen thuộc (P2025 not found, P2021 bảng chưa tồn
 *    tại...) sang status code đúng chuẩn REST thay vì luôn luôn 500.
 * 3. Không leak thông tin nội bộ (stack trace, connection string...) ra
 *    response — chỉ log ở server, trả message an toàn cho client.
 */
export function withErrorHandling(handler: Handler): Handler {
  return async (req, ctx) => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof ApiError) {
        return fail(err.status, err.code, err.message, err.details);
      }

      if (err instanceof Prisma.PrismaClientKnownRequestError) {
        if (err.code === "P2025") {
          return fail(404, "NOT_FOUND", "Không tìm thấy tài nguyên");
        }
        console.error(`[API] Prisma error ${err.code}:`, err.message);
        return fail(500, "DATABASE_ERROR", "Lỗi truy vấn cơ sở dữ liệu");
      }

      if (err instanceof Prisma.PrismaClientInitializationError) {
        console.error("[API] Prisma init error:", err.message);
        return fail(503, "DATABASE_UNAVAILABLE", "Không thể kết nối cơ sở dữ liệu");
      }

      console.error("[API] Unhandled error:", err);
      return fail(500, "INTERNAL_ERROR", "Đã xảy ra lỗi không xác định");
    }
  };
}