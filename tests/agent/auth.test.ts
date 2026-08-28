// tests/agent/auth.test.ts
import { describe, expect, it, afterEach } from "vitest";
import type { NextRequest } from "next/server";
import { getAuthenticatedUser, requireAdmin } from "@/agent/utils/auth";

function makeReq(headers: Record<string, string> = {}): NextRequest {
  return { headers: new Headers(headers) } as unknown as NextRequest;
}

const ORIGINAL_ADMIN_KEY = process.env.ADMIN_API_KEY;

afterEach(() => {
  if (ORIGINAL_ADMIN_KEY === undefined) delete process.env.ADMIN_API_KEY;
  else process.env.ADMIN_API_KEY = ORIGINAL_ADMIN_KEY;
});

describe("getAuthenticatedUser", () => {
  it("trả về role 'user' (guest) khi không có header Authorization", async () => {
    delete process.env.ADMIN_API_KEY;
    const user = await getAuthenticatedUser(makeReq());
    expect(user.role).toBe("user");
    expect(user.id).toBe("guest");
  });

  it("KHÔNG còn nhận diện chuỗi cứng 'admin-token' là admin (lỗ hổng cũ đã vá)", async () => {
    process.env.ADMIN_API_KEY = "real-secret-key-123";
    const user = await getAuthenticatedUser(makeReq({ authorization: "Bearer admin-token" }));
    expect(user.role).toBe("user");
  });

  it("nhận diện admin khi Authorization khớp đúng ADMIN_API_KEY", async () => {
    process.env.ADMIN_API_KEY = "real-secret-key-123";
    const user = await getAuthenticatedUser(makeReq({ authorization: "Bearer real-secret-key-123" }));
    expect(user.role).toBe("admin");
    expect(user.id).toBe("admin");
  });

  it("không cấp quyền admin khi ADMIN_API_KEY chưa được cấu hình trên server", async () => {
    delete process.env.ADMIN_API_KEY;
    const user = await getAuthenticatedUser(makeReq({ authorization: "Bearer anything" }));
    expect(user.role).toBe("user");
  });
});

describe("requireAdmin", () => {
  it("throw FORBIDDEN khi ADMIN_API_KEY chưa cấu hình (fail closed)", async () => {
    delete process.env.ADMIN_API_KEY;
    await expect(requireAdmin(makeReq({ authorization: "Bearer x" }))).rejects.toThrow(/FORBIDDEN/);
  });

  it("throw FORBIDDEN khi key sai", async () => {
    process.env.ADMIN_API_KEY = "correct-key";
    await expect(requireAdmin(makeReq({ authorization: "Bearer wrong-key" }))).rejects.toThrow(/FORBIDDEN/);
  });

  it("không throw khi key đúng", async () => {
    process.env.ADMIN_API_KEY = "correct-key";
    const user = await requireAdmin(makeReq({ authorization: "Bearer correct-key" }));
    expect(user.role).toBe("admin");
  });
});
