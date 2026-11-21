import { NextRequest } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { ok, fail } from "@/lib/api/response";
import { withRateLimit } from "@/lib/api/rate-limit";
import { createAdminSessionCookieHeader, createAdminSessionToken } from "@/lib/auth/admin-session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

async function handler(req: NextRequest) {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey) {
    return fail(500, "CONFIG_ERROR", "ADMIN_API_KEY chưa được cấu hình trên server.");
  }

  try {
    const body = await req.json().catch(() => ({}));
    const key = typeof body?.key === "string" ? body.key.trim() : "";

    if (!key || !safeEqual(key, adminKey)) {
      return fail(401, "UNAUTHORIZED", "Mã khóa quản trị (ADMIN_API_KEY) không chính xác.");
    }

    const token = createAdminSessionToken(adminKey);
    const res = ok({ authenticated: true }, { noCache: true });
    res.headers.set("Set-Cookie", createAdminSessionCookieHeader(token));
    return res;
  } catch (error) {
    console.error("[Admin Login API] Error:", error);
    return fail(500, "LOGIN_ERROR", "Đăng nhập thất bại do lỗi hệ thống.");
  }
}

export const POST = withRateLimit(handler, {
  prefix: "admin-login",
  limit: 5,
  window: "60 s",
  failClosed: true,
});
