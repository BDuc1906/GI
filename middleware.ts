import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

/**
 * CORS cho toàn bộ /api/*.
 *
 * docs/api.md quảng cáo đây là "API public, chỉ đọc, không cần xác thực" —
 * nghĩa là mục tiêu là cho phép BẤT KỲ trang web nào (JS chạy trong trình
 * duyệt của bên thứ ba) gọi thẳng bằng fetch(). Trước khi có middleware
 * này, repo không có bất kỳ CORS header nào → mọi lời gọi fetch() từ
 * browser ở origin khác đều bị chính trình duyệt chặn (same-origin
 * policy), dù server không hề từ chối request. Lỗi này không lộ ra khi tự
 * test bằng curl (như các ví dụ trong docs/api.md) vì curl không áp dụng
 * same-origin policy — chỉ browser thật mới chặn.
 *
 * `Access-Control-Allow-Origin: "*"` là lựa chọn ĐÚNG chuẩn cho API public
 * chỉ đọc (GET), không dùng cookie/session — client không gửi kèm
 * `credentials: "include"`, nên không có state riêng tư nào gắn với origin
 * gọi tới để mà lộ. KHÔNG dùng "*" kèm Access-Control-Allow-Credentials:
 * true — 2 header đó không được phép đứng chung theo spec Fetch, trình
 * duyệt sẽ tự từ chối toàn bộ response nếu vi phạm.
 *
 * Xử lý cả preflight OPTIONS tường minh: route handler hiện tại (GET-only,
 * không export OPTIONS) sẽ trả 405 Method Not Allowed cho preflight nếu để
 * lọt xuống dưới — chặn ngay ở middleware, trả 204 kèm CORS header, không
 * chạm route handler/rate-limit/DB.
 */
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  // 24h — trình duyệt cache kết quả preflight, giảm số OPTIONS lặp lại cho
  // cùng 1 client trong ngày, đỡ tốn 1 round-trip trước mỗi GET thật.
  "Access-Control-Max-Age": "86400",
};

// next-intl middleware: phát hiện locale từ cookie NEXT_LOCALE (đã chọn
// trước đó) → header Accept-Language của trình duyệt → defaultLocale
// ("en"), rồi redirect "/characters" → "/en/characters" (hoặc locale phù
// hợp) khi URL chưa có tiền tố locale.
const handleI18nRouting = createMiddleware(routing);

export default function middleware(req: NextRequest): NextResponse {
  // API KHÔNG có tiền tố locale (client bên thứ ba gọi thẳng
  // "/api/characters", không phải "/en/api/characters") — giữ nguyên
  // 100% logic CORS cũ, không cho next-intl chạm vào nhánh này.
  if (req.nextUrl.pathname.startsWith("/api")) {
    if (req.method === "OPTIONS") {
      return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
    }

    const res = NextResponse.next();
    for (const [key, value] of Object.entries(CORS_HEADERS)) {
      res.headers.set(key, value);
    }
    return res;
  }

  // Mọi route trang còn lại: để next-intl xử lý phát hiện + redirect locale.
  return handleI18nRouting(req);
}

export const config = {
  // Pattern khuyến nghị chính thức của next-intl (v4): loại trừ /api,
  // /_next (asset build của Next.js), /_vercel (asset nội bộ Vercel) và
  // mọi path có phần mở rộng file (favicon.ico, robots.txt, ảnh...) — các
  // path này không cần/không nên có tiền tố locale.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
