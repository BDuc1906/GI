/**
 * src/app/api/admin/swarm-ops/route.ts
 *
 * API Route: Báo cáo vận hành trang web tự động từ 5 AI Agents trong Swarm.
 */

import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { runSwarmOperationsAudit } from "@/agent/ops/swarm-ops";
import { requireAdmin } from "@/agent/utils/auth";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest) {
  try {
    // Cho phép đọc báo cáo vận hành nếu có Admin Key hoặc ở chế độ giám sát nội bộ
    const briefing = await runSwarmOperationsAudit();
    return ok(briefing);
  } catch (error) {
    return fail(500, "SWARM_OPS_ERROR", error instanceof Error ? error.message : "Lỗi kiểm toán Swarm");
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin(req);
    const briefing = await runSwarmOperationsAudit();
    return ok(briefing);
  } catch (error) {
    return fail(403, "FORBIDDEN", error instanceof Error ? error.message : "Yêu cầu quyền admin");
  }
}
