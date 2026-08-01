import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  material: { findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const { GET: listMaterials } = await import("@/app/api/materials/route");
const { GET: getMaterial } = await import("@/app/api/materials/[id]/route");

function req(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost"));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/materials", () => {
  it("trả envelope đúng shape, tìm theo q", async () => {
    mockPrisma.material.findMany.mockResolvedValue([{ id: "mora", name: "Mora" }]);
    mockPrisma.material.count.mockResolvedValue(1);

    const res = await listMaterials(req("http://localhost/api/materials?q=mora"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
    const [[args]] = mockPrisma.material.findMany.mock.calls;
    expect(args.where).toEqual({ name: { contains: "mora", mode: "insensitive" } });
  });
});

describe("GET /api/materials/:id", () => {
  it("404 khi không tìm thấy", async () => {
    mockPrisma.material.findUnique.mockResolvedValue(null);
    const res = await getMaterial(req("http://localhost/api/materials/x"), {
      params: Promise.resolve({ id: "x" }),
    });
    expect(res.status).toBe(404);
  });
});
