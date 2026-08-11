// src/app/api/admin/pipeline-status/route.ts
/**
 * GET /api/admin/pipeline-status
 *
 * Trả về danh sách các pipeline runs gần nhất.
 *
 * ⚠️ VÁ LỖI: bản gốc route này KHÔNG có bất kỳ kiểm tra quyền nào —
 * nằm dưới path /api/admin/ nhưng ai cũng gọi được, lộ toàn bộ lịch sử
 * vận hành nội bộ (tên pipeline, thời gian, thông báo lỗi chi tiết).
 * Thêm requireAdmin() ở đây cho khớp với các route admin khác
 * (/api/admin/fix, /api/admin/sync, /api/admin/audit-logs).
 *
 * Query params:
 *  - limit: số lượng records (mặc định 50, tối đa 100)
 *  - name: lọc theo tên pipeline (crawl, seed, mirror, update-data, agent-sync)
 *  - status: lọc theo trạng thái (started, success, failed)
 */

import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail } from "@/lib/api/response";
import { withRateLimit } from "@/lib/api/rate-limit";
import { requireAdmin } from "@/agent/utils/auth";

export const revalidate = 10;
export const dynamic = "force-dynamic";

async function handler(req: NextRequest) {
  try {
    await requireAdmin(req);
  } catch (error) {
    return fail(403, "FORBIDDEN", error instanceof Error ? error.message : "Yêu cầu quyền admin");
  }

  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);
  const name = searchParams.get("name") || undefined;
  const status = searchParams.get("status") || undefined;

  const where: Record<string, string> = {};
  if (name) where.name = name;
  if (status) where.status = status;

  const [runs, stats, total] = await Promise.all([
    prisma.pipelineRun.findMany({ where, orderBy: { startedAt: "desc" }, take: limit }),
    prisma.pipelineRun.groupBy({ by: ["name", "status"], _count: { status: true } }),
    prisma.pipelineRun.count({ where }),
  ]);

  const statsMap: Record<string, { started: number; success: number; failed: number }> = {};
  for (const s of stats as any[]) {
    if (!statsMap[s.name]) statsMap[s.name] = { started: 0, success: 0, failed: 0 };
    statsMap[s.name][s.status as "started" | "success" | "failed"] = s._count.status;
  }

  const latestRuns = await prisma.pipelineRun.findMany({
    distinct: ["name"],
    orderBy: [{ name: "asc" }, { startedAt: "desc" }],
    select: { name: true, status: true, startedAt: true, id: true },
  });
  const latestStatus: Record<string, { status: string; startedAt: Date; id: string }> = {};
  for (const r of latestRuns) latestStatus[r.name] = r;

  return ok({ runs, stats: statsMap, latestStatus, meta: { total, limit } }, { maxAgeSec: 10 });
}

export const GET = withRateLimit(handler, { prefix: "admin-pipeline", limit: 30 });
