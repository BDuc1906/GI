/**
 * src/app/api/admin/data-ops/pipeline/route.ts
 *
 * API Route: Kích hoạt quy trình liên tục của Đội Đặc Nhiệm AI Agent DataOps:
 * Paimon (Lấy) -> Albedo (Lọc) -> Keqing (Kiểm định) -> Zhongli (Cập nhật & Xuất bản).
 */

import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { runContinuousDataOpsPipeline } from "@/agent/swarm/data-ops-swarm";
import { requireAdmin } from "@/agent/utils/auth";
import { withRateLimit } from "@/lib/api/rate-limit";

export const dynamic = "force-dynamic";

async function getHandler(req: NextRequest) {
  try {
    await requireAdmin(req);
    const report = await runContinuousDataOpsPipeline({ recordAudit: false });
    return ok(report);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("FORBIDDEN")) {
      return fail(403, "FORBIDDEN", error.message);
    }
    return fail(500, "DATA_OPS_ERROR", error instanceof Error ? error.message : "Lỗi thực thi pipeline DataOps");
  }
}

async function postHandler(req: NextRequest) {
  try {
    await requireAdmin(req);
    const report = await runContinuousDataOpsPipeline({ recordAudit: true });
    return ok(report);
  } catch (error) {
    return fail(403, "FORBIDDEN", error instanceof Error ? error.message : "Yêu cầu quyền admin");
  }
}

export const GET = withRateLimit(getHandler, { prefix: "admin-data-ops-get", limit: 20, failClosed: true });
export const POST = withRateLimit(postHandler, { prefix: "admin-data-ops-post", limit: 10, failClosed: true });
