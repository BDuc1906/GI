
import { describe, expect, it } from "vitest";
import { fail, ok } from "@/lib/api/response";

describe("ok()", () => {
  it("mặc định status 200, envelope { success: true, data }", async () => {
    const res = ok({ hello: "world" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual({ success: true, data: { hello: "world" } });
  });

  it("gắn meta khi có truyền vào", async () => {
    const meta = { page: 1, limit: 10, total: 1, totalPages: 1 };
    const res = ok([1, 2, 3], { meta });
    const body = await res.json();
    expect(body.meta).toEqual(meta);
  });

  it("set Cache-Control mặc định, và bỏ khi noCache=true", () => {
    const cached = ok({ a: 1 });
    expect(cached.headers.get("Cache-Control")).toContain("s-maxage=60");

    const uncached = ok({ a: 1 }, { noCache: true });
    expect(uncached.headers.get("Cache-Control")).toBeNull();
  });

  it("cho phép override status (vd 201)", () => {
    const res = ok({ a: 1 }, { status: 201 });
    expect(res.status).toBe(201);
  });

  it("maxAgeSec override cả s-maxage lẫn stale-while-revalidate (x5)", () => {
    const res = ok({ a: 1 }, { maxAgeSec: 3600 });
    const cacheControl = res.headers.get("Cache-Control");
    expect(cacheControl).toContain("s-maxage=3600");
    expect(cacheControl).toContain("stale-while-revalidate=18000");
  });
});

describe("fail()", () => {
  it("envelope { success: false, error } đúng status", async () => {
    const res = fail(404, "NOT_FOUND", "Không tìm thấy");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toEqual({ success: false, error: { code: "NOT_FOUND", message: "Không tìm thấy" } });
  });

  it("luôn set Cache-Control: no-store (không cache response lỗi)", () => {
    const res = fail(500, "INTERNAL_ERROR", "Lỗi");
    expect(res.headers.get("Cache-Control")).toBe("no-store");
  });

  it("gắn details khi có truyền vào", async () => {
    const res = fail(400, "BAD_REQUEST", "Sai tham số", { field: "page" });
    const body = await res.json();
    expect(body.error.details).toEqual({ field: "page" });
  });
});
