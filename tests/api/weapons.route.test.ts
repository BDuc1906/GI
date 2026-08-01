import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  weapon: { findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const { GET: listWeapons } = await import("@/app/api/weapons/route");
const { GET: getWeapon } = await import("@/app/api/weapons/[id]/route");

function req(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost"));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/weapons", () => {
  it("trả envelope đúng shape", async () => {
    mockPrisma.weapon.findMany.mockResolvedValue([{ id: "aquila-favonia", name: "Aquila Favonia" }]);
    mockPrisma.weapon.count.mockResolvedValue(1);

    const res = await listWeapons(req("http://localhost/api/weapons"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.meta.total).toBe(1);
  });

  it("lọc theo type nhiều giá trị", async () => {
    mockPrisma.weapon.findMany.mockResolvedValue([]);
    mockPrisma.weapon.count.mockResolvedValue(0);

    await listWeapons(req("http://localhost/api/weapons?type=Sword,Claymore"));

    const [[args]] = mockPrisma.weapon.findMany.mock.calls;
    expect(args.where.type).toEqual({ in: ["Sword", "Claymore"], mode: "insensitive" });
  });

  it("400 khi rarity ngoài khoảng 1-5", async () => {
    const res = await listWeapons(req("http://localhost/api/weapons?rarity=9"));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/weapons/:id", () => {
  it("404 khi không tìm thấy", async () => {
    mockPrisma.weapon.findUnique.mockResolvedValue(null);
    const res = await getWeapon(req("http://localhost/api/weapons/x"), {
      params: Promise.resolve({ id: "x" }),
    });
    expect(res.status).toBe(404);
  });
});
