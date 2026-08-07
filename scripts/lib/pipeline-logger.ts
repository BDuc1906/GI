/**
 * scripts/lib/pipeline-logger.ts
 *
 * Helper ghi trạng thái pipeline vào database để dashboard admin hiển thị.
 */

import { prisma } from '../../src/lib/prisma';

export interface PipelineDetails {
  rowsAffected?: number;
  imagesMirrored?: number;
  imagesFailed?: number;
  source?: string;
  [key: string]: unknown;
}

/**
 * Bắt đầu một pipeline run
 */
export async function startPipeline(
  name: 'crawl' | 'seed' | 'mirror' | 'update-data',
  details?: PipelineDetails
) {
  const run = await (prisma as any).pipelineRun.create({
    data: {
      name,
      status: 'started',
      details: details || {},
    },
  });
  console.log(`[Pipeline] ${name} started (ID: ${run.id})`);
  return run;
}

/**
 * Kết thúc pipeline run thành công
 */
export async function endPipelineSuccess(
  id: string,
  details?: PipelineDetails
) {
  const run = await (prisma as any).pipelineRun.update({
    where: { id },
    data: {
      status: 'success',
      endedAt: new Date(),
      details: details || undefined,
    },
  });
  // Tính duration
  const duration = run.endedAt!.getTime() - run.startedAt.getTime();
  await (prisma as any).pipelineRun.update({
    where: { id },
    data: { durationMs: duration },
  });
  console.log(`[Pipeline] ${run.name} completed successfully (${duration}ms)`);
  return run;
}

/**
 * Kết thúc pipeline run thất bại
 */
export async function endPipelineFailure(
  id: string,
  error: string,
  details?: PipelineDetails
) {
  const run = await (prisma as any).pipelineRun.update({
    where: { id },
    data: {
      status: 'failed',
      endedAt: new Date(),
      error: error.slice(0, 10000), // Giới hạn 10k ký tự
      details: details || undefined,
    },
  });
  const duration = run.endedAt!.getTime() - run.startedAt.getTime();
  await (prisma as any).pipelineRun.update({
    where: { id },
    data: { durationMs: duration },
  });
  console.error(`[Pipeline] ${run.name} failed (${duration}ms): ${error}`);
  return run;
}