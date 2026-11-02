import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  generateBuildAdvice: vi.fn(),
}));

vi.mock("@/agent/build-advisor", () => ({
  generateBuildAdvice: mocks.generateBuildAdvice,
}));

const { POST } = await import("@/app/api/tools/build-advisor/route");
const ctx = { params: Promise.resolve({}) };

function request(body: string, headers?: HeadersInit): NextRequest {
  return new NextRequest("http://localhost/api/tools/build-advisor", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body,
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.generateBuildAdvice.mockResolvedValue({
    characterName: "Alhaitham",
    advice: "Tăng Energy Recharge.",
    buildSource: "curated",
  });
});

describe("POST /api/tools/build-advisor", () => {
  it("rejects malformed or oversized input without calling the advisor", async () => {
    const invalidUid = await POST(request(JSON.stringify({
      uid: "12345678",
      characterId: "alhaitham",
    })), ctx);
    expect(invalidUid.status).toBe(400);

    const malformed = await POST(request("{"), ctx);
    expect(malformed.status).toBe(400);

    const oversized = await POST(request(
      JSON.stringify({ uid: "123456789", characterId: "alhaitham", extra: "x".repeat(2_100) })
    ), ctx);
    expect(oversized.status).toBe(413);
    expect(mocks.generateBuildAdvice).not.toHaveBeenCalled();
  });

  it("validates input, returns advice, and disables response caching", async () => {
    const response = await POST(request(JSON.stringify({
      uid: "812345678",
      characterId: "alhaitham",
    })), ctx);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(payload).toMatchObject({
      success: true,
      data: {
        characterName: "Alhaitham",
        advice: "Tăng Energy Recharge.",
        buildSource: "curated",
      },
    });
    expect(mocks.generateBuildAdvice).toHaveBeenCalledWith("812345678", "alhaitham");
  });
});
