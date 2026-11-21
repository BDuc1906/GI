import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";
import { fail } from "./response";

type RouteContext = { params: Promise<Record<string, string>> };
type Handler = (req: NextRequest, ctx: RouteContext) => Promise<Response>;

/**
 * Giới hạn mặc định cho toàn bộ API public: 60 request / phút / IP. Đủ rộng
 * cho một client thật (browser load trang chi tiết + vài thao tác UI), vừa
 * chặn được kiểu scraping thô (gọi liên tục không nghỉ) trước khi nó ăn hết
 * connection pool của Postgres hoặc kéo hoá đơn Neon/Vercel lên bất thường
 * — rủi ro thực tế nhất với một API public, không auth, chạy dài hạn.
 */
const DEFAULT_LIMIT = 60;
const DEFAULT_WINDOW = "60 s";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

/**
 * Cache Ratelimit instance theo (prefix, limit, window) — tránh tạo lại mỗi
 * request, và cho phép mỗi route tự khai báo limit riêng (vd /api/search
 * tốn 3 query/lần nên có thể cần limit thấp hơn) mà không phải sửa file này.
 */
const limiterCache = new Map<string, Ratelimit>();

function getLimiter(prefix: string, limit: number, window: string): Ratelimit | null {
  if (!redis) return null;

  const cacheKey = `${prefix}:${limit}:${window}`;
  const cached = limiterCache.get(cacheKey);
  if (cached) return cached;

  const created = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window as Parameters<typeof Ratelimit.slidingWindow>[1]),
    prefix: `leibo-api:${prefix}`,
    analytics: true,
  });
  limiterCache.set(cacheKey, created);
  return created;
}

/** Lấy IP client qua header chuẩn của proxy (Vercel luôn set x-forwarded-for). */
function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first || req.headers.get("x-real-ip") || "unknown";
}

function applyRateLimitHeaders(
  res: Response,
  info: { limit: number; remaining: number; reset: number }
): Response {
  res.headers.set("X-RateLimit-Limit", String(info.limit));
  res.headers.set("X-RateLimit-Remaining", String(Math.max(0, info.remaining)));
  res.headers.set("X-RateLimit-Reset", String(info.reset));
  return res;
}

let warnedMissingConfig = false;

export interface RateLimitOptions {
  /** Tên bucket riêng cho route (tách quota theo endpoint). Mặc định "default". */
  prefix?: string;
  /** Số request tối đa trong 1 window. Mặc định 60. */
  limit?: number;
  /** Độ dài window theo cú pháp Upstash (vd "60 s", "1 m"). Mặc định "60 s". */
  window?: string;
  /**
   * Chế độ xử lý khi Redis chưa cấu hình hoặc gặp sự cố runtime:
   * - failClosed = false (mặc định): fail-open cho API public đọc dữ liệu,
   *   request vẫn được cho qua để tránh downtime toàn trang khi Redis phụ trợ trục trặc.
   * - failClosed = true: fail-closed cho các API nhạy cảm / tốn tài nguyên
   *   (Admin actions, AI Agent, DPS Simulator, Build Advisor), trả về 503
   *   để bảo vệ hệ thống khỏi bị tấn công hoặc lạm dụng khi mất lớp phòng thủ.
   */
  failClosed?: boolean;
}

/**
 * Bọc route handler bằng rate limit theo IP (Upstash Redis, sliding window).
 *
 * - Chưa cấu hình UPSTASH_REDIS_REST_URL/TOKEN:
 *   + Nếu failClosed = true: trả 503 SERVICE_UNAVAILABLE ngay lập tức để bảo vệ API nhạy cảm.
 *   + Nếu failClosed = false: rate limiting TẮT, request đi qua bình thường — chỉ log cảnh báo 1 lần.
 * - Upstash lỗi/timeout lúc runtime:
 *   + Nếu failClosed = true: trả 503 SERVICE_UNAVAILABLE.
 *   + Nếu failClosed = false: fail OPEN (cho request đi qua, chỉ log lỗi).
 * - Vượt quota: trả 429 đúng envelope chuẩn (`fail()`), kèm header
 *   `Retry-After` + `X-RateLimit-*`, và KHÔNG gọi tới handler thật (không
 *   chạm DB).
 */
export function withRateLimit(handler: Handler, options: RateLimitOptions = {}): Handler {
  const prefix = options.prefix ?? "default";
  const limit = options.limit ?? DEFAULT_LIMIT;
  const window = options.window ?? DEFAULT_WINDOW;
  const failClosed = options.failClosed ?? false;

  return async (req, ctx) => {
    const ratelimit = getLimiter(prefix, limit, window);

    if (!ratelimit) {
      if (failClosed) {
        console.warn(
          `[API] Rate limit fail-closed kích hoạt: Redis chưa được cấu hình cho endpoint bảo vệ [${prefix}]. Chặn request.`
        );
        return fail(
          503,
          "SERVICE_UNAVAILABLE",
          "Hệ thống bảo vệ quá tải tạm thời gián đoạn. Vui lòng thử lại sau."
        );
      }

      if (!warnedMissingConfig) {
        console.warn(
          "[API] UPSTASH_REDIS_REST_URL/TOKEN chưa được cấu hình — rate limiting đang TẮT. " +
            "Bắt buộc set 2 biến này khi deploy API public lên production (xem .env.example)."
        );
        warnedMissingConfig = true;
      }
      return handler(req, ctx);
    }

    try {
      const identifier = `${prefix}:${clientIp(req)}`;
      const { success, limit: cap, remaining, reset } = await ratelimit.limit(identifier);

      if (!success) {
        const retryAfterSec = Math.max(0, Math.ceil((reset - Date.now()) / 1000));
        const res = fail(429, "RATE_LIMITED", "Quá nhiều request, vui lòng thử lại sau.", {
          retryAfterSec,
        });
        res.headers.set("Retry-After", String(retryAfterSec));
        return applyRateLimitHeaders(res, { limit: cap, remaining, reset });
      }

      const res = await handler(req, ctx);
      return applyRateLimitHeaders(res, { limit: cap, remaining, reset });
    } catch (err) {
      if (failClosed) {
        console.error(
          `[API] Rate limit check thất bại cho route nhạy cảm [${prefix}] (fail-closed, chặn request):`,
          err
        );
        return fail(
          503,
          "SERVICE_UNAVAILABLE",
          "Hệ thống bảo vệ quá tải tạm thời gián đoạn. Vui lòng thử lại sau."
        );
      }

      console.error("[API] Rate limit check thất bại (fail-open, request vẫn được xử lý):", err);
      return handler(req, ctx);
    }
  };
}