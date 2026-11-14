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

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    const report = await runContinuousDataOpsPipeline({ recordAudit: false });
    return ok(report);
  } catch (error) {
    return fail(500, "DATA_OPS_ERROR", error instanceof Error ? error.message : "Lỗi thực thi pipeline DataOps");
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const report = await runContinuousDataOpsPipeline({ recordAudit: true });
    return ok(report);
  } catch (error) {
    return fail(403, "FORBIDDEN", error instanceof Error ? error.message : "Yêu cầu quyền admin");
  }
}
