import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockPrisma = vi.hoisted(() => ({
  auditLog: {
    create: vi.fn(),
  },
}));

vi.mock("@/lib/db/prisma", () => ({ prisma: mockPrisma }));

const { POST: reportIssue } = await import("@/app/api/feedback/report/route");

function postReq(body: unknown): NextRequest {
  return new NextRequest(new URL("http://localhost/api/feedback/report"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/feedback/report", () => {
  it("tiếp nhận báo cáo hợp lệ và tạo bản ghi AuditLog", async () => {
    mockPrisma.auditLog.create.mockResolvedValue({
      id: "report-123",
      action: "USER_DATA_REPORT",
      entityType: "character",
      entityId: "furina",
      status: "pending_review",
    });

    const res = await reportIssue(
      postReq({
        entityType: "character",
        entityId: "furina",
        entityName: "Furina",
        issueType: "stats",
        description: "Chỉ số HP cơ bản tại level 90 bị lệch 200 điểm so với game.",
        email: "traveler@teyvat.com",
      }),
      { params: Promise.resolve({}) }
    );

    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.data.reported).toBe(true);
    expect(json.data.reportId).toBe("report-123");
    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "USER_DATA_REPORT",
          entityType: "character",
          entityId: "furina",
          performedBy: "user:traveler@teyvat.com",
          status: "pending_review",
        }),
      })
    );
  });

  it("từ chối khi thiếu entityId", async () => {
    const res = await reportIssue(
      postReq({
        entityType: "character",
        issueType: "stats",
        description: "Lỗi không có entityId",
      }),
      { params: Promise.resolve({}) }
    );

    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
    expect(json.error.code).toBe("BAD_REQUEST");
  });

  it("từ chối loại thực thể không hợp lệ", async () => {
    const res = await reportIssue(
      postReq({
        entityType: "invalid_category",
        entityId: "test",
        issueType: "stats",
        description: "Mô tả hợp lệ cho thực thể không hợp lệ",
      }),
      { params: Promise.resolve({}) }
    );

    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it("từ chối loại vấn đề không hợp lệ", async () => {
    const res = await reportIssue(
      postReq({
        entityType: "character",
        entityId: "furina",
        issueType: "not_a_valid_issue_type",
        description: "Mô tả hợp lệ nhưng sai issue type",
      }),
      { params: Promise.resolve({}) }
    );

    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });

  it("từ chối mô tả quá ngắn (< 5 ký tự)", async () => {
    const res = await reportIssue(
      postReq({
        entityType: "character",
        entityId: "furina",
        issueType: "image",
        description: "lỗi",
      }),
      { params: Promise.resolve({}) }
    );

    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.success).toBe(false);
  });
});
