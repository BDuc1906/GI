/**
 * src/app/api/admin/swarm-ops/route.ts
 *
 * API Route: Báo cáo vận hành trang web tự động từ 5 AI Agents trong Swarm.
 */

import type { NextRequest } from "next/server";
import { ok, fail } from "@/lib/api/response";
import { runSwarmOperationsAudit } from "@/agent/ops/swarm-ops";
import { requireAdmin } from "@/agent/utils/auth";
import { withRateLimit } from "@/lib/api/rate-limit";

export const dynamic = "force-dynamic";

async function getHandler(req: NextRequest) {
  try {
    await requireAdmin(req);
    const briefing = await runSwarmOperationsAudit();
    return ok(briefing);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("FORBIDDEN")) {
      return fail(403, "FORBIDDEN", error.message);
    }
    return fail(500, "SWARM_OPS_ERROR", error instanceof Error ? error.message : "Lỗi kiểm toán Swarm");
  }
}

async function postHandler(req: NextRequest) {
  try {
    await requireAdmin(req);
    const briefing = await runSwarmOperationsAudit();
    return ok(briefing);
  } catch (error) {
    return fail(403, "FORBIDDEN", error instanceof Error ? error.message : "Yêu cầu quyền admin");
  }
}

export const GET = withRateLimit(getHandler, { prefix: "admin-swarm-ops-get", limit: 20, failClosed: true });
export const POST = withRateLimit(postHandler, { prefix: "admin-swarm-ops-post", limit: 10, failClosed: true });
