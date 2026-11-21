import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { createAdminSessionToken, ADMIN_SESSION_COOKIE_NAME } from "@/lib/auth/admin-session";

vi.mock("@/lib/api/rate-limit", () => ({
  withRateLimit: <T>(fn: T) => fn,
}));

const mockAuditLogFindMany = vi.fn().mockResolvedValue([
  { id: "log-1", action: "USER_DATA_REPORT", status: "pending_review", reason: "Sai stat" },
]);
const mockAuditLogUpdate = vi.fn().mockResolvedValue({
  id: "log-1",
  status: "approved",
});
const mockAuditLogCreate = vi.fn().mockResolvedValue({ id: "audit-task-1" });

vi.mock("@/lib/db/prisma", () => ({
  prisma: {
    auditLog: {
      findMany: (...args: unknown[]) => mockAuditLogFindMany(...args),
      update: (...args: unknown[]) => mockAuditLogUpdate(...args),
      create: (...args: unknown[]) => mockAuditLogCreate(...args),
    },
    pipelineRun: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    character: {
      count: vi.fn().mockResolvedValue(136),
    },
    weapon: {
      count: vi.fn().mockResolvedValue(254),
    },
  },
}));

const ORIGINAL_ADMIN_KEY = process.env.ADMIN_API_KEY;

describe("Admin Agents API (/api/admin/agents)", () => {
  beforeEach(() => {
    process.env.ADMIN_API_KEY = "test-secret-key-agents";
    vi.clearAllMocks();
  });

  afterEach(() => {
    if (ORIGINAL_ADMIN_KEY === undefined) delete process.env.ADMIN_API_KEY;
    else process.env.ADMIN_API_KEY = ORIGINAL_ADMIN_KEY;
  });

  function makeAuthReq(path: string, options?: { method?: string; body?: string; headers?: HeadersInit }) {
    const token = createAdminSessionToken(process.env.ADMIN_API_KEY!);
    const headers = new Headers(options?.headers);
    headers.set("cookie", `${ADMIN_SESSION_COOKIE_NAME}=${token}`);
    if (options?.body) headers.set("Content-Type", "application/json");

    return new NextRequest(new URL(path, "http://localhost"), {
      method: options?.method,
      body: options?.body,
      headers,
    });
  }

  it("trả về 403 khi chưa có phiên đăng nhập admin", async () => {
    const { GET } = await import("@/app/api/admin/agents/route");
    const unauthReq = new NextRequest("http://localhost/api/admin/agents");

    const res = await GET(unauthReq, { params: Promise.resolve({}) });
    expect(res.status).toBe(403);
  });

  it("GET trả về đầy đủ briefing từ 5 agents, pendingApprovals và recentLogs khi có quyền admin", async () => {
    const { GET } = await import("@/app/api/admin/agents/route");
    const req = makeAuthReq("/api/admin/agents");

    const res = await GET(req, { params: Promise.resolve({}) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.briefing).toBeDefined();
    expect(json.data.briefing.overallHealthScore).toBeGreaterThanOrEqual(0);
    expect(json.data.pendingApprovals).toHaveLength(1);
  });

  it("POST action=approve_item cập nhật quyết định kiểm duyệt", async () => {
    const { POST } = await import("@/app/api/admin/agents/route");
    const req = makeAuthReq("/api/admin/agents", {
      method: "POST",
      body: JSON.stringify({
        action: "approve_item",
        id: "log-1",
        decision: "approved",
        reviewerNote: "Đã kiểm tra lại đúng với game",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.status).toBe("approved");
    expect(mockAuditLogUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "log-1" },
        data: expect.objectContaining({
          status: "approved",
        }),
      })
    );
  });

  it("POST action=run_task kích hoạt AgentHarness và trả về report có trace", async () => {
    const { POST } = await import("@/app/api/admin/agents/route");
    const req = makeAuthReq("/api/admin/agents", {
      method: "POST",
      body: JSON.stringify({
        action: "run_task",
        domain: "asset",
        instruction: "Kiểm tra mapping toàn bộ ảnh game",
      }),
    });

    const res = await POST(req, { params: Promise.resolve({}) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.report.success).toBe(true);
    expect(json.data.report.trace.length).toBeGreaterThanOrEqual(2);
    expect(json.data.report.output.status).toBe("VERIFIED");
  });
});
