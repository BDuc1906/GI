import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  ADMIN_SESSION_COOKIE_NAME,
  createAdminSessionCookieHeader,
  createAdminSessionToken,
  createClearAdminSessionCookieHeader,
  getAdminSessionTokenFromRequest,
  SESSION_MAX_AGE_SEC,
  verifyAdminSessionToken,
} from "./admin-session";

describe("admin-session auth module", () => {
  const SECRET_KEY = "test-super-secret-key-123456";

  it("tạo token và xác thực thành công với cùng secret key", () => {
    const token = createAdminSessionToken(SECRET_KEY);
    expect(typeof token).toBe("string");
    expect(token.length).toBeGreaterThan(20);

    const isValid = verifyAdminSessionToken(token, SECRET_KEY);
    expect(isValid).toBe(true);
  });

  it("từ chối token khi secret key không khớp", () => {
    const token = createAdminSessionToken(SECRET_KEY);
    const isValid = verifyAdminSessionToken(token, "wrong-secret-key");
    expect(isValid).toBe(false);
  });

  it("từ chối token bị sửa đổi nội dung (tampering)", () => {
    const token = createAdminSessionToken(SECRET_KEY);
    // Thay đổi 1 ký tự trong token base64url
    const tampered = token.slice(0, -2) + (token.endsWith("a") ? "b" : "a") + token.slice(-1);
    const isValid = verifyAdminSessionToken(tampered, SECRET_KEY);
    expect(isValid).toBe(false);
  });

  it("từ chối token đã hết hạn (> 24 giờ)", () => {
    const now = Date.now();
    const pastTime = now - (SESSION_MAX_AGE_SEC + 60) * 1000;

    vi.spyOn(Date, "now").mockReturnValue(pastTime);
    const expiredToken = createAdminSessionToken(SECRET_KEY);

    vi.spyOn(Date, "now").mockReturnValue(now);
    const isValid = verifyAdminSessionToken(expiredToken, SECRET_KEY);
    expect(isValid).toBe(false);

    vi.restoreAllMocks();
  });

  it("đọc session token từ req.cookies hoặc header Cookie", () => {
    const token = createAdminSessionToken(SECRET_KEY);

    const reqWithHeader = new NextRequest("http://localhost/api/admin", {
      headers: {
        cookie: `theme=dark; ${ADMIN_SESSION_COOKIE_NAME}=${token}; other=value`,
      },
    });

    const extracted = getAdminSessionTokenFromRequest(reqWithHeader);
    expect(extracted).toBe(token);
  });

  it("tạo Set-Cookie header bảo mật (HttpOnly, SameSite=Strict, Path=/)", () => {
    const token = "mock-token";
    const header = createAdminSessionCookieHeader(token);

    expect(header).toContain(`${ADMIN_SESSION_COOKIE_NAME}=${token}`);
    expect(header).toContain("Path=/");
    expect(header).toContain("HttpOnly");
    expect(header).toContain("SameSite=Strict");
    expect(header).toContain(`Max-Age=${SESSION_MAX_AGE_SEC}`);
  });

  it("tạo Clear Cookie header với Max-Age=0 và Expires quá khứ", () => {
    const clearHeader = createClearAdminSessionCookieHeader();

    expect(clearHeader).toContain(`${ADMIN_SESSION_COOKIE_NAME}=;`);
    expect(clearHeader).toContain("Max-Age=0");
    expect(clearHeader).toContain("Expires=Thu, 01 Jan 1970 00:00:00 GMT");
    expect(clearHeader).toContain("HttpOnly");
  });
});
