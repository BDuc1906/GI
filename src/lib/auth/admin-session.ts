import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

export const ADMIN_SESSION_COOKIE_NAME = "leibo_admin_session";
export const SESSION_MAX_AGE_SEC = 24 * 60 * 60; // 24 giờ

interface SessionPayload {
  t: number; // timestamp ms
  s: string; // random salt
  h: string; // hmac signature
}

function computeHmac(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("hex");
}

function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "hex");
  const bufB = Buffer.from(b, "hex");
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/**
 * Tạo token phiên đăng nhập admin được ký số bằng ADMIN_API_KEY.
 * Định dạng: Base64URL-encoded JSON payload chứa timestamp, salt ngẫu nhiên và chữ ký HMAC-SHA256.
 */
export function createAdminSessionToken(adminKey: string): string {
  const timestamp = Date.now();
  const salt = randomBytes(16).toString("hex");
  const dataToSign = `${timestamp}:${salt}`;
  const hmac = computeHmac(dataToSign, adminKey);

  const payload: SessionPayload = {
    t: timestamp,
    s: salt,
    h: hmac,
  };

  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

/**
 * Xác thực token phiên đăng nhập.
 * - Kiểm tra chữ ký HMAC khớp với ADMIN_API_KEY server hiện tại.
 * - Kiểm tra thời hạn hiệu lực (tối đa 24 giờ).
 */
export function verifyAdminSessionToken(token: string, adminKey: string): boolean {
  if (!token || !adminKey) return false;

  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const payload = JSON.parse(raw) as SessionPayload;

    if (!payload || typeof payload.t !== "number" || typeof payload.s !== "string" || typeof payload.h !== "string") {
      return false;
    }

    // Kiểm tra thời hạn session
    const ageMs = Date.now() - payload.t;
    if (ageMs < 0 || ageMs > SESSION_MAX_AGE_SEC * 1000) {
      return false;
    }

    // Kiểm tra chữ ký HMAC bằng timingSafeEqual
    const expectedHmac = computeHmac(`${payload.t}:${payload.s}`, adminKey);
    return safeEqualHex(payload.h, expectedHmac);
  } catch {
    return false;
  }
}

/**
 * Đọc session token từ cookie của NextRequest.
 */
export function getAdminSessionTokenFromRequest(req: NextRequest): string | null {
  const cookie = req.cookies?.get(ADMIN_SESSION_COOKIE_NAME);
  if (cookie?.value) return cookie.value;

  // Fallback: parse từ header Cookie thuần
  const cookieHeader = req.headers.get("cookie");
  if (!cookieHeader) return null;

  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${ADMIN_SESSION_COOKIE_NAME}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Tạo header Set-Cookie cho phiên admin (HttpOnly, Secure, SameSite=Strict).
 */
export function createAdminSessionCookieHeader(token: string): string {
  const isProd = process.env.NODE_ENV === "production";
  const secureFlag = isProd ? "; Secure" : "";
  return `${ADMIN_SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${SESSION_MAX_AGE_SEC}; HttpOnly; SameSite=Strict${secureFlag}`;
}

/**
 * Tạo header Set-Cookie để xoá phiên admin khi logout.
 */
export function createClearAdminSessionCookieHeader(): string {
  const isProd = process.env.NODE_ENV === "production";
  const secureFlag = isProd ? "; Secure" : "";
  return `${ADMIN_SESSION_COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Strict${secureFlag}; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}
