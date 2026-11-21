import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { createAdminSessionToken, ADMIN_SESSION_COOKIE_NAME } from "@/lib/auth/admin-session";

vi.mock("@/lib/api/rate-limit", () => ({
  withRateLimit: <T>(fn: T) => fn,
}));

const mockDbCharacters = [
  { id: "raiden", name: "Raiden Shogun", rarity: 5, vision: "Electro", weaponType: "Polearm", iconUrl: "/icon.png" },
  { id: "kazuha", name: "Kaedehara Kazuha", rarity: 5, vision: "Anemo", weaponType: "Sword", iconUrl: "/icon.png" },
  { id: "traveler", name: "Traveler", rarity: 5, vision: "Anemo", weaponType: "Sword", iconUrl: "/icon.png" },
];

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    character: {
      findMany: vi.fn().mockResolvedValue(mockDbCharacters),
    },
    weapon: {
      count: vi.fn().mockResolvedValue(180),
    },
  },
}));

const ORIGINAL_ADMIN_KEY = process.env.ADMIN_API_KEY;

describe("GET /api/admin/data-quality", () => {
  beforeEach(() => {
    process.env.ADMIN_API_KEY = "test-secret-key-dq";
  });

  afterEach(() => {
    if (ORIGINAL_ADMIN_KEY === undefined) delete process.env.ADMIN_API_KEY;
    else process.env.ADMIN_API_KEY = ORIGINAL_ADMIN_KEY;
  });

  it("trả về 403 FORBIDDEN khi không có quyền admin", async () => {
    const { GET } = await import("@/app/api/admin/data-quality/route");
    const req = new NextRequest("http://localhost/api/admin/data-quality");

    const res = await GET(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(403);
  });

  it("trả về 200 và cấu trúc DataQualityReport chuẩn khi có session admin", async () => {
    const { GET } = await import("@/app/api/admin/data-quality/route");
    const token = createAdminSessionToken("test-secret-key-dq");

    const req = new NextRequest("http://localhost/api/admin/data-quality", {
      headers: {
        cookie: `${ADMIN_SESSION_COOKIE_NAME}=${token}`,
      },
    });

    const res = await GET(req, { params: Promise.resolve({}) });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toHaveProperty("overallTrustScore");
    expect(json.data).toHaveProperty("characters");
    expect(json.data).toHaveProperty("weapons");
    expect(json.data).toHaveProperty("buildsReview");
    expect(json.data).toHaveProperty("localization");
    expect(json.data).toHaveProperty("providers");
    expect(Array.isArray(json.data.providers)).toBe(true);
    expect(json.data.providers.length).toBeGreaterThanOrEqual(4);
    expect(Array.isArray(json.data.localization.locales)).toBe(true);
  });
});
