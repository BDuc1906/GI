import { NextRequest, NextResponse } from "next/server";
import { describe, expect, it, vi } from "vitest";

// Test này CHỈ kiểm tra nhánh CORS cho "/api/*" trong src/proxy.ts, không
// kiểm tra hành vi redirect locale của next-intl. Nhưng `proxy.ts` gọi
// `createMiddleware(routing)` NGAY LÚC MODULE ĐƯỢC IMPORT (top-level), nên
// chỉ cần import file để test là đã kéo theo toàn bộ "next-intl/middleware"
// — bản "development" của gói này hiện lỗi resolve nội bộ
// ("Cannot find module '.../next/server' ... Did you mean 'next/server.js'")
// khi chạy dưới Node ESM loader của Vitest (khác hẳn lúc Next.js tự bundle,
// nơi next-intl chạy bình thường) — đây là bug của chính next-intl, không
// phải lỗi trong repo này.
//
// Mock hẳn "next-intl/middleware" ở đây — không ảnh hưởng gì tới hành vi
// THẬT của app (mock chỉ có tác dụng trong phạm vi Vitest), và đúng phạm
// vi: test này vốn dĩ không cần next-intl chạy thật.
vi.mock("next-intl/middleware", () => ({
  default: () => () => NextResponse.next(),
}));

const { proxy } = await import("../src/proxy");

function req(url: string, method = "GET"): NextRequest {
  return new NextRequest(new URL(url, "http://localhost"), { method });
}

describe("proxy (CORS cho /api/*)", () => {
  it("GET thường: thêm Access-Control-Allow-Origin: *", () => {
    const res = proxy(req("http://localhost/api/characters"));
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toBe("GET, OPTIONS");
  });

  it("preflight OPTIONS: trả 204 kèm CORS header, không cần body", async () => {
    const res = proxy(req("http://localhost/api/characters", "OPTIONS"));
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    const text = await res.text();
    expect(text).toBe("");
  });

  it("Access-Control-Max-Age có mặt để browser cache kết quả preflight", () => {
    const res = proxy(req("http://localhost/api/domains", "OPTIONS"));
    expect(res.headers.get("Access-Control-Max-Age")).toBe("86400");
  });
});
