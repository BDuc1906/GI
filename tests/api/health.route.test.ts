import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  $queryRaw: vi.fn(),
  $transaction: vi.fn(),
  character: { count: vi.fn() },
  weapon: { count: vi.fn() },
  artifactSet: { count: vi.fn() },
  material: { count: vi.fn() },
  domain: { count: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const { GET: health } = await import("@/app/api/health/route");

function req(url = "http://localhost/api/health"): NextRequest {
  return new NextRequest(new URL(url, "http://localhost"));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/health", () => {
  it("200 + status ok khi query DB thành công", async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);

    const res = await health(req());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.status).toBe("ok");
    expect(typeof body.data.latencyMs).toBe("number");
    expect(body.data.counts).toBeUndefined();
    expect(res.headers.get("Cache-Control")).toBeNull();
  });

  it("mặc định KHÔNG gọi COUNT(*) trên bất kỳ bảng nào (endpoint không rate limit, phải rẻ)", async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);

    await health(req());

    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });

  it("503 khi DB không kết nối được, không phải 500 chung chung", async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error("connection refused"));
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await health(req());
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error.code).toBe("DATABASE_UNAVAILABLE");
    consoleErrorSpy.mockRestore();
  });

  it("?counts=true trả về số dòng của cả 5 bảng", async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);
    mockPrisma.$transaction.mockResolvedValue([120, 140, 45, 210, 65]);

    const res = await health(req("http://localhost/api/health?counts=true"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.counts).toEqual({
      characters: 120,
      weapons: 140,
      artifacts: 45,
      materials: 210,
      domains: 65,
    });
  });

  it("?counts=true vẫn trả 503 nếu SELECT 1 thất bại (không chạy transaction đếm bảng)", async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error("connection refused"));
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await health(req("http://localhost/api/health?counts=true"));

    expect(res.status).toBe(503);
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });
});