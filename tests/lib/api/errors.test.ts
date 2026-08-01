import { describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { ApiError, withErrorHandling } from "@/lib/api/errors";

const dummyReq = {} as NextRequest;
const dummyCtx = { params: Promise.resolve({}) };

describe("withErrorHandling", () => {
  it("trả nguyên response của handler khi không lỗi", async () => {
    const handler = withErrorHandling(async () => new Response("ok", { status: 200 }));
    const res = await handler(dummyReq, dummyCtx);
    expect(res.status).toBe(200);
    expect(await res.text()).toBe("ok");
  });

  it("map ApiError sang đúng status/code đã khai báo", async () => {
    const handler = withErrorHandling(async () => {
      throw ApiError.badRequest("sai tham số", { field: "q" });
    });
    const res = await handler(dummyReq, dummyCtx);
    const body = await res.json();
    expect(res.status).toBe(400);
    expect(body).toEqual({
      success: false,
      error: { code: "BAD_REQUEST", message: "sai tham số", details: { field: "q" } },
    });
  });

  it("map ApiError.notFound() sang 404", async () => {
    const handler = withErrorHandling(async () => {
      throw ApiError.notFound('Không tìm thấy nhân vật với id "x"');
    });
    const res = await handler(dummyReq, dummyCtx);
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.code).toBe("NOT_FOUND");
  });

  it("map Prisma P2025 (record not found) sang 404, không phải 500", async () => {
    const handler = withErrorHandling(async () => {
      throw new Prisma.PrismaClientKnownRequestError("An operation failed", {
        code: "P2025",
        clientVersion: "7.9.1",
      });
    });
    const res = await handler(dummyReq, dummyCtx);
    expect(res.status).toBe(404);
  });

  it("map lỗi Prisma khác (vd P2002 unique constraint) sang 500 DATABASE_ERROR, không leak message Prisma gốc", async () => {
    const handler = withErrorHandling(async () => {
      throw new Prisma.PrismaClientKnownRequestError("Unique constraint failed on fields: (`id`)", {
        code: "P2002",
        clientVersion: "7.9.1",
      });
    });
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await handler(dummyReq, dummyCtx);
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error.code).toBe("DATABASE_ERROR");
    expect(body.error.message).not.toContain("Unique constraint");
    consoleErrorSpy.mockRestore();
  });

  it("map PrismaClientInitializationError sang 503 (DB không kết nối được)", async () => {
    const handler = withErrorHandling(async () => {
      throw new Prisma.PrismaClientInitializationError("Can't reach database server", "7.9.1");
    });
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await handler(dummyReq, dummyCtx);
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error.code).toBe("DATABASE_UNAVAILABLE");
    consoleErrorSpy.mockRestore();
  });

  it("lỗi không xác định -> 500 INTERNAL_ERROR, không leak stack trace ra response", async () => {
    const handler = withErrorHandling(async () => {
      throw new Error("connection string chứa password 12345");
    });
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await handler(dummyReq, dummyCtx);
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error.code).toBe("INTERNAL_ERROR");
    expect(JSON.stringify(body)).not.toContain("12345");
    consoleErrorSpy.mockRestore();
  });
});