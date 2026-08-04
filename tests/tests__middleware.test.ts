import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { middleware } from "../middleware";

function req(url: string, method = "GET"): NextRequest {
  return new NextRequest(new URL(url, "http://localhost"), { method });
}

describe("middleware (CORS cho /api/*)", () => {
  it("GET thường: thêm Access-Control-Allow-Origin: *", () => {
    const res = middleware(req("http://localhost/api/characters"));
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    expect(res.headers.get("Access-Control-Allow-Methods")).toBe("GET, OPTIONS");
  });

  it("preflight OPTIONS: trả 204 kèm CORS header, không cần body", async () => {
    const res = middleware(req("http://localhost/api/characters", "OPTIONS"));
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("*");
    const text = await res.text();
    expect(text).toBe("");
  });

  it("Access-Control-Max-Age có mặt để browser cache kết quả preflight", () => {
    const res = middleware(req("http://localhost/api/domains", "OPTIONS"));
    expect(res.headers.get("Access-Control-Max-Age")).toBe("86400");
  });
});
