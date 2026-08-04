import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  domain: { findMany: vi.fn(), count: vi.fn(), findUnique: vi.fn() },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

const { GET: listDomains } = await import("@/app/api/domains/route");
const { GET: getDomain } = await import("@/app/api/domains/[id]/route");

function req(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost"));
}

const listCtx = { params: Promise.resolve({}) };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/domains", () => {
  it("trả envelope đúng shape", async () => {
    mockPrisma.domain.findMany.mockResolvedValue([{ id: "domain-of-blessing-autumn-hunt", name: "Domain of Blessing: Autumn Hunt" }]);
    mockPrisma.domain.count.mockResolvedValue(1);

    const res = await listDomains(req("http://localhost/api/domains"), listCtx);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(1);
    expect(body.meta.total).toBe(1);
  });

  it("lọc theo category nhiều giá trị", async () => {
    mockPrisma.domain.findMany.mockResolvedValue([]);
    mockPrisma.domain.count.mockResolvedValue(0);

    await listDomains(req("http://localhost/api/domains?category=weapon,talent"), listCtx);

    const [[args]] = mockPrisma.domain.findMany.mock.calls;
    expect(args.where.category).toEqual({ in: ["weapon", "talent"] });
  });

  it("400 khi category không hợp lệ", async () => {
    const res = await listDomains(req("http://localhost/api/domains?category=notarealcategory"), listCtx);
    expect(res.status).toBe(400);
  });

  it("400 khi day không hợp lệ", async () => {
    const res = await listDomains(req("http://localhost/api/domains?day=Someday"), listCtx);
    expect(res.status).toBe(400);
  });

  it("day hợp lệ tạo where OR gồm cả daysOfWeek rỗng (domain mở hằng ngày)", async () => {
    mockPrisma.domain.findMany.mockResolvedValue([]);
    mockPrisma.domain.count.mockResolvedValue(0);

    await listDomains(req("http://localhost/api/domains?day=Monday"), listCtx);

    const [[args]] = mockPrisma.domain.findMany.mock.calls;
    expect(args.where.OR).toEqual([{ daysOfWeek: { isEmpty: true } }, { daysOfWeek: { has: "Monday" } }]);
  });

  it("today=true tự suy ra thứ hôm nay thay vì cần truyền day", async () => {
    mockPrisma.domain.findMany.mockResolvedValue([]);
    mockPrisma.domain.count.mockResolvedValue(0);

    const res = await listDomains(req("http://localhost/api/domains?today=true"), listCtx);
    expect(res.status).toBe(200);

    const [[args]] = mockPrisma.domain.findMany.mock.calls;
    expect(args.where.OR).toBeDefined();
  });
});

describe("GET /api/domains/:id", () => {
  it("404 khi không tìm thấy", async () => {
    mockPrisma.domain.findUnique.mockResolvedValue(null);
    const res = await getDomain(req("http://localhost/api/domains/x"), {
      params: Promise.resolve({ id: "x" }),
    });
    expect(res.status).toBe(404);
  });

  it("200 khi tìm thấy", async () => {
    mockPrisma.domain.findUnique.mockResolvedValue({ id: "domain-of-mastery-altar-of-flames", name: "Domain of Mastery: Altar of Flames" });
    const res = await getDomain(req("http://localhost/api/domains/domain-of-mastery-altar-of-flames"), {
      params: Promise.resolve({ id: "domain-of-mastery-altar-of-flames" }),
    });
    expect(res.status).toBe(200);
  });
});