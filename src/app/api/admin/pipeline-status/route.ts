import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ok } from '@/lib/api/response';
import { withErrorHandling } from '@/lib/api/errors';
import { withRateLimit } from '@/lib/api/rate-limit';

export const revalidate = 10; // Cache 10s
export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 50;

/**
 * GET /api/admin/pipeline-status
 *
 * Trả về danh sách các pipeline runs gần nhất.
 * Query params:
 *  - limit: số lượng records (mặc định 50, tối đa 100)
 *  - name: lọc theo tên pipeline (crawl, seed, mirror, update-data)
 *  - status: lọc theo trạng thái (started, success, failed)
 */
export const GET = withErrorHandling(
  withRateLimit(
    async (req: NextRequest) => {
      const { searchParams } = new URL(req.url);
      const limit = Math.min(Number(searchParams.get('limit')) || DEFAULT_LIMIT, 100);
      const name = searchParams.get('name') || undefined;
      const status = searchParams.get('status') || undefined;

      const where: any = {};
      if (name) where.name = name;
      if (status) where.status = status;

      const [runs, stats] = await Promise.all([
        (prisma as any).pipelineRun.findMany({
          where,
          orderBy: { startedAt: 'desc' },
          take: limit,
        }),
        (prisma as any).pipelineRun.groupBy({
          by: ['name', 'status'],
          _count: { status: true },
        }),
      ]);

      // Format stats
      const statsMap: Record<string, { started: number; success: number; failed: number }> = {};
      for (const s of stats) {
        if (!statsMap[s.name]) {
          statsMap[s.name] = { started: 0, success: 0, failed: 0 };
        }
        statsMap[s.name][s.status as 'started' | 'success' | 'failed'] = s._count.status;
      }

      // Lấy latest status của từng pipeline
      const latestRuns = await (prisma as any).pipelineRun.findMany({
        distinct: ['name'],
        orderBy: [{ name: 'asc' }, { startedAt: 'desc' }],
        select: { name: true, status: true, startedAt: true, id: true },
      });
      const latestStatus: Record<string, { status: string; startedAt: Date; id: string }> = {};
      for (const r of latestRuns) {
        latestStatus[r.name] = { status: r.status, startedAt: r.startedAt, id: r.id };
      }

      return ok({
        runs,
        stats: statsMap,
        latestStatus,
        meta: {
          total: await (prisma as any).pipelineRun.count({ where }),
          limit,
        },
      }, { maxAgeSec: 10 });
    },
    { prefix: 'admin-pipeline', limit: 30 }
  )
);