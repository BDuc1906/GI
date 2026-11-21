import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { createAdminSessionToken, ADMIN_SESSION_COOKIE_NAME } from "@/lib/auth/admin-session";

// Mock rate limiter để tập trung test logic auth
vi.mock("@/lib/api/rate-limit", () => ({
  withRateLimit: <T>(fn: T) => fn,
}));

const ORIGINAL_ADMIN_KEY = process.env.ADMIN_API_KEY;

describe("Admin Auth API Routes", () => {
  beforeEach(() => {
    process.env.ADMIN_API_KEY = "test-secret-admin-key-2026";
  });

  afterEach(() => {
    if (ORIGINAL_ADMIN_KEY === undefined) delete process.env.ADMIN_API_KEY;
    else process.env.ADMIN_API_KEY = ORIGINAL_ADMIN_KEY;
  });

  describe("POST /api/admin/auth/login", () => {
    it("trả về 401 khi không truyền key hoặc sai key", async () => {
      const { POST } = await import("@/app/api/admin/auth/login/route");

      const reqEmpty = new NextRequest("http://localhost/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "" }),
      });
      const resEmpty = await POST(reqEmpty, { params: Promise.resolve({}) });
      expect(resEmpty.status).toBe(401);

      const reqWrong = new NextRequest("http://localhost/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "wrong-password" }),
      });
      const resWrong = await POST(reqWrong, { params: Promise.resolve({}) });
      expect(resWrong.status).toBe(401);
    });

    it("trả về 200 và set HttpOnly cookie khi đăng nhập đúng key", async () => {
      const { POST } = await import("@/app/api/admin/auth/login/route");

      const req = new NextRequest("http://localhost/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "test-secret-admin-key-2026" }),
      });

      const res = await POST(req, { params: Promise.resolve({}) });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.authenticated).toBe(true);

      const setCookie = res.headers.get("Set-Cookie");
      expect(setCookie).toBeTruthy();
      expect(setCookie).toContain(ADMIN_SESSION_COOKIE_NAME);
      expect(setCookie).toContain("HttpOnly");
      expect(setCookie).toContain("SameSite=Strict");
    });
  });

  describe("GET /api/admin/auth/session", () => {
    it("trả về authenticated: false khi chưa có cookie phiên", async () => {
      const { GET } = await import("@/app/api/admin/auth/session/route");

      const req = new NextRequest("http://localhost/api/admin/auth/session", {
        method: "GET",
      });

      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.authenticated).toBe(false);
      expect(json.data.role).toBe("user");
    });

    it("trả về authenticated: true khi có cookie phiên hợp lệ", async () => {
      const { GET } = await import("@/app/api/admin/auth/session/route");
      const token = createAdminSessionToken("test-secret-admin-key-2026");

      const req = new NextRequest("http://localhost/api/admin/auth/session", {
        method: "GET",
        headers: {
          cookie: `${ADMIN_SESSION_COOKIE_NAME}=${token}`,
        },
      });

      const res = await GET(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.authenticated).toBe(true);
      expect(json.data.role).toBe("admin");
    });
  });

  describe("POST /api/admin/auth/logout", () => {
    it("trả về authenticated: false và xoá cookie phiên", async () => {
      const { POST } = await import("@/app/api/admin/auth/logout/route");

      const req = new NextRequest("http://localhost/api/admin/auth/logout", {
        method: "POST",
      });

      const res = await POST(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.authenticated).toBe(false);

      const setCookie = res.headers.get("Set-Cookie");
      expect(setCookie).toContain("Max-Age=0");
    });
  });
});
