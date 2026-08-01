import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

const dummyCtx = { params: Promise.resolve({}) };

function req(headers: Record<string, string> = {}): NextRequest {
  return { headers: new Headers(headers) } as unknown as NextRequest;
}

describe("withRateLimit — chưa cấu hình Upstash", () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("cho request đi qua bình thường khi thiếu env, không đụng tới Redis", async () => {
    const { withRateLimit } = await import("@/lib/api/rate-limit");
    const handler = withRateLimit(async () => new Response("ok", { status: 200 }));

    const res = await handler(req(), dummyCtx);

    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");
  });
});

describe("withRateLimit — đã cấu hình Upstash", () => {
  const limitMock = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    process.env.UPSTASH_REDIS_REST_URL = "https://example.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    limitMock.mockReset();

    vi.doMock("@upstash/redis", () => ({
      Redis: class {},
    }));
    vi.doMock("@upstash/ratelimit", () => ({
      Ratelimit: Object.assign(
        class {
          limit = limitMock;
        },
        { slidingWindow: vi.fn() }
      ),
    }));
  });

  afterEach(() => {
    vi.doUnmock("@upstash/redis");
    vi.doUnmock("@upstash/ratelimit");
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  it("cho qua + set header X-RateLimit-* khi còn quota", async () => {
    limitMock.mockResolvedValue({ success: true, limit: 60, remaining: 59, reset: Date.now() + 60_000 });

    const { withRateLimit } = await import("@/lib/api/rate-limit");
    const handler = withRateLimit(async () => new Response("ok", { status: 200 }));

    const res = await handler(req({ "x-forwarded-for": "1.2.3.4" }), dummyCtx);

    expect(res.status).toBe(200);
    expect(res.headers.get("X-RateLimit-Limit")).toBe("60");
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("59");
  });

  it("trả 429 đúng envelope + Retry-After khi vượt quota, KHÔNG gọi tới handler thật", async () => {
    limitMock.mockResolvedValue({ success: false, limit: 60, remaining: 0, reset: Date.now() + 15_000 });

    const { withRateLimit } = await import("@/lib/api/rate-limit");
    const innerHandler = vi.fn(async () => new Response("ok", { status: 200 }));
    const handler = withRateLimit(innerHandler);

    const res = await handler(req({ "x-forwarded-for": "1.2.3.4" }), dummyCtx);
    const body = await res.json();

    expect(res.status).toBe(429);
    expect(innerHandler).not.toHaveBeenCalled();
    expect(body).toEqual({
      success: false,
      error: { code: "RATE_LIMITED", message: "Quá nhiều request, vui lòng thử lại sau.", details: { retryAfterSec: expect.any(Number) } },
    });
    expect(res.headers.get("Retry-After")).toBeTruthy();
  });

  it("fail-open: nếu ratelimit.limit() throw (Upstash down), request vẫn được xử lý bình thường", async () => {
    limitMock.mockRejectedValue(new Error("upstash timeout"));
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const { withRateLimit } = await import("@/lib/api/rate-limit");
    const handler = withRateLimit(async () => new Response("ok", { status: 200 }));

    const res = await handler(req(), dummyCtx);

    expect(res.status).toBe(200);
    consoleErrorSpy.mockRestore();
  });

  it("dùng lại cùng 1 Ratelimit instance cho cùng prefix/limit/window (không tạo mới mỗi request)", async () => {
    limitMock.mockResolvedValue({ success: true, limit: 60, remaining: 59, reset: Date.now() + 60_000 });
    const { withRateLimit } = await import("@/lib/api/rate-limit");
    const handler = withRateLimit(async () => new Response("ok", { status: 200 }), { prefix: "test-cache" });

    await handler(req(), dummyCtx);
    await handler(req(), dummyCtx);

    expect(limitMock).toHaveBeenCalledTimes(2);
  });
});