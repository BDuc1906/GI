import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  character: { findMany: vi.fn() },
  weapon: { findMany: vi.fn() },
  artifactSet: { findMany: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const { GET: search } = await import("@/app/api/search/route");

function req(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost"));
}

// Route search không có tham số động, nhưng kiểu Handler (từ
// withErrorHandling) luôn yêu cầu đủ (req, ctx) — truyền ctx rỗng cho khớp.
const listCtx = { params: Promise.resolve({}) };

beforeEach(() => {
  vi.clearAllMocks();
  mockPrisma.character.findMany.mockResolvedValue([]);
  mockPrisma.weapon.findMany.mockResolvedValue([]);
  mockPrisma.artifactSet.findMany.mockResolvedValue([]);
});

describe("GET /api/search", () => {
  it("400 khi thiếu q", async () => {
    const res = await search(req("http://localhost/api/search"), listCtx);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("BAD_REQUEST");
  });

  it("400 khi q chỉ toàn khoảng trắng", async () => {
    const res = await search(req("http://localhost/api/search?q=%20%20"), listCtx);
    expect(res.status).toBe(400);
  });

  it("gộp kết quả cả 3 loại và tính đúng total", async () => {
    mockPrisma.character.findMany.mockResolvedValue([{ id: "kazuha" }]);
    mockPrisma.weapon.findMany.mockResolvedValue([{ id: "aquila" }, { id: "wolfs-gravestone" }]);

    const res = await search(req("http://localhost/api/search?q=a"), listCtx);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.total).toBe(3);
    expect(body.data.characters).toHaveLength(1);
    expect(body.data.weapons).toHaveLength(2);
    expect(body.data.artifacts).toHaveLength(0);
  });

  it("clamp limit vượt MAX_PER_TYPE (50)", async () => {
    await search(req("http://localhost/api/search?q=a&limit=999"), listCtx);
    const [[args]] = mockPrisma.character.findMany.mock.calls;
    expect(args.take).toBe(50);
  });

  it("400 khi limit không phải số nguyên dương", async () => {
    const res = await search(req("http://localhost/api/search?q=a&limit=-1"), listCtx);
    expect(res.status).toBe(400);
  });
});