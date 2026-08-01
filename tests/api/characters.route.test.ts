import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  character: {
    findMany: vi.fn(),
    count: vi.fn(),
    findUnique: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const { GET: listCharacters } = await import("@/app/api/characters/route");
const { GET: getCharacter } = await import("@/app/api/characters/[id]/route");

function req(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost"));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/characters", () => {
  it("trả về envelope { success, data, meta } đúng shape với dữ liệu giả", async () => {
    mockPrisma.character.findMany.mockResolvedValue([
      { id: "kazuha", name: "Kaedehara Kazuha", vision: "Anemo" },
    ]);
    mockPrisma.character.count.mockResolvedValue(1);

    const res = await listCharacters(req("http://localhost/api/characters"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
    expect(body.meta).toEqual({ page: 1, limit: 24, total: 1, totalPages: 1 });
  });

  it("truyền đúng where clause khi có q/vision/rarity", async () => {
    mockPrisma.character.findMany.mockResolvedValue([]);
    mockPrisma.character.count.mockResolvedValue(0);

    await listCharacters(req("http://localhost/api/characters?q=kaze&vision=Anemo,Pyro&rarity=5"));

    const [[findManyArgs]] = mockPrisma.character.findMany.mock.calls;
    expect(findManyArgs.where).toMatchObject({
      name: { contains: "kaze", mode: "insensitive" },
      vision: { in: ["Anemo", "Pyro"], mode: "insensitive" },
      rarity: { in: [5] },
    });
  });

  it("400 khi sort field không nằm trong whitelist (không phải 500)", async () => {
    const res = await listCharacters(req("http://localhost/api/characters?sort=password"));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe("BAD_REQUEST");
  });

  it("400 khi limit không hợp lệ", async () => {
    const res = await listCharacters(req("http://localhost/api/characters?limit=-5"));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/characters/:id", () => {
  it("200 + data khi tìm thấy", async () => {
    mockPrisma.character.findUnique.mockResolvedValue({ id: "kazuha", name: "Kaedehara Kazuha" });

    const res = await getCharacter(req("http://localhost/api/characters/kazuha"), {
      params: Promise.resolve({ id: "kazuha" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data.id).toBe("kazuha");
  });

  it("404 khi không tìm thấy, không phải 500", async () => {
    mockPrisma.character.findUnique.mockResolvedValue(null);

    const res = await getCharacter(req("http://localhost/api/characters/khong-ton-tai"), {
      params: Promise.resolve({ id: "khong-ton-tai" }),
    });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error.code).toBe("NOT_FOUND");
  });
});
