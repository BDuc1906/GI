import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  artifactSet: { findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const { GET: listArtifacts } = await import("@/app/api/artifacts/route");
const { GET: getArtifact } = await import("@/app/api/artifacts/[id]/route");

function req(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost"));
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/artifacts", () => {
  it("trả envelope đúng shape", async () => {
    mockPrisma.artifactSet.findMany.mockResolvedValue([{ id: "gladiators-finale", name: "Gladiator's Finale" }]);
    mockPrisma.artifactSet.count.mockResolvedValue(1);

    const res = await listArtifacts(req("http://localhost/api/artifacts"));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
  });

  it("lọc theo rarity nằm trong rarityRange (has)", async () => {
    mockPrisma.artifactSet.findMany.mockResolvedValue([]);
    mockPrisma.artifactSet.count.mockResolvedValue(0);

    await listArtifacts(req("http://localhost/api/artifacts?rarity=5"));

    const [[args]] = mockPrisma.artifactSet.findMany.mock.calls;
    expect(args.where.rarityRange).toEqual({ has: 5 });
  });

  it("400 khi rarity không hợp lệ", async () => {
    const res = await listArtifacts(req("http://localhost/api/artifacts?rarity=abc"));
    expect(res.status).toBe(400);
  });
});

describe("GET /api/artifacts/:id", () => {
  it("200 khi tìm thấy", async () => {
    mockPrisma.artifactSet.findUnique.mockResolvedValue({ id: "gladiators-finale", name: "Gladiator's Finale" });
    const res = await getArtifact(req("http://localhost/api/artifacts/gladiators-finale"), {
      params: Promise.resolve({ id: "gladiators-finale" }),
    });
    expect(res.status).toBe(200);
  });
});
