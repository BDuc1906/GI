// src/app/api/admin/audit-logs/route.ts
/**
 * API Route: GET /api/admin/audit-logs
 * Lấy lịch sử thay đổi dữ liệu do AI Agent thực hiện (bảng AuditLog).
 * Yêu cầu quyền admin — đây là dữ liệu nội bộ (giá trị cũ/mới của mọi
 * lần sửa DB), không nên public.
 */

import { NextRequest } from "next/server";
import { getAuditLogs } from "@/agent/audit/AuditLogger";
import { requireAdmin } from "@/agent/utils/auth";
import { ok, fail } from "@/lib/api/response";
import { withRateLimit } from "@/lib/api/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get("entityType") || undefined;
    const entityId = searchParams.get("entityId") || undefined;
    const limit = Number(searchParams.get("limit")) || 20;

    const logs = await getAuditLogs(entityType, entityId, limit);
    return ok({ logs, count: logs.length });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("FORBIDDEN")) {
      return fail(403, "FORBIDDEN", error.message);
    }
    console.error("[Audit Logs API] Error:", error);
    return fail(500, "AUDIT_LOGS_ERROR", error instanceof Error ? error.message : "Lỗi không xác định");
  }
}

export const GET = withRateLimit(handler, { prefix: "admin-audit-logs", limit: 30, failClosed: true });
