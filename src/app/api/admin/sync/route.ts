// src/app/api/admin/sync/route.ts
/**
 * API Route: /api/admin/sync
 * Trigger workflow GitHub Actions `update-data.yml` (không ghi thẳng
 * DB) - Yêu cầu quyền admin (Authorization: Bearer <ADMIN_API_KEY>)
 */

import { NextRequest } from "next/server";
import { DataSyncPipeline } from "@/lib/sync/DataSyncPipeline";
import { requireAdmin } from "@/agent/utils/auth";
import { ok, fail } from "@/lib/api/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin(req);

    const body = await req.json().catch(() => ({}));
    const force = body?.force === true;

    const pipeline = new DataSyncPipeline();
    const result = await pipeline.sync(force);

    if (!result.success) {
      return fail(500, "SYNC_FAILED", "Đồng bộ dữ liệu thất bại — xem chi tiết trong `result`", result);
    }

    return ok({ message: "Đồng bộ dữ liệu hoàn tất", performedBy: user.id, result });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("UNAUTHORIZED")) {
      return fail(401, "UNAUTHORIZED", error.message);
    }
    if (error instanceof Error && error.message.startsWith("FORBIDDEN")) {
      return fail(403, "FORBIDDEN", error.message);
    }
    console.error("[Sync API] Error:", error);
    return fail(500, "SYNC_ERROR", error instanceof Error ? error.message : "Lỗi không xác định");
  }
}
