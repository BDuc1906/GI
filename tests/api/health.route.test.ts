import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  $queryRaw: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const { GET: health } = await import("@/app/api/health/route");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/health", () => {
  it("200 + status ok khi query DB thành công", async () => {
    mockPrisma.$queryRaw.mockResolvedValue([{ "?column?": 1 }]);

    const res = await health();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.status).toBe("ok");
    expect(typeof body.data.latencyMs).toBe("number");
    expect(res.headers.get("Cache-Control")).toBeNull();
  });

  it("503 khi DB không kết nối được, không phải 500 chung chung", async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error("connection refused"));
    const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await health();
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.error.code).toBe("DATABASE_UNAVAILABLE");
    consoleErrorSpy.mockRestore();
  });
});
