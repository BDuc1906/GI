// scripts/lib/pipeline-logger.ts
/**
 * scripts/lib/pipeline-logger.ts
 *
 * Helper ghi trạng thái pipeline vào database để dashboard admin hiển thị.
 *
 * VÁ: bỏ `(prisma as any).pipelineRun` — model `PipelineRun` đã tồn tại
 * thật trong prisma/schema.prisma từ đầu, `prisma.pipelineRun` chạy
 * được bình thường không cần ép kiểu. `as any` ở đây khả năng cao là
 * tàn dư từ trước khi model được thêm vào schema, không ai quay lại
 * dọn — không có lý do kỹ thuật nào cần giữ lại.
 */

import { prisma } from "../../src/lib/prisma";
import type { Prisma } from "@prisma/client";

export interface PipelineDetails {
  rowsAffected?: number;
  imagesMirrored?: number;
  imagesFailed?: number;
  source?: string;
  [key: string]: unknown;
}

/** Ép PipelineDetails (có index signature unknown) về đúng kiểu Json Prisma yêu cầu. */
function toJsonInput(details: PipelineDetails | undefined): Prisma.InputJsonValue | undefined {
  return details as unknown as Prisma.InputJsonValue | undefined;
}

/**
 * Bắt đầu một pipeline run
 */
export async function startPipeline(
  name: "crawl" | "seed" | "mirror" | "update-data",
  details?: PipelineDetails
) {
  const run = await prisma.pipelineRun.create({
    data: {
      name,
      status: "started",
      details: toJsonInput(details) ?? {},
    },
  });
  console.log(`[Pipeline] ${name} started (ID: ${run.id})`);
  return run;
}

/**
 * Kết thúc pipeline run thành công
 */
export async function endPipelineSuccess(id: string, details?: PipelineDetails) {
  const run = await prisma.pipelineRun.update({
    where: { id },
    data: {
      status: "success",
      endedAt: new Date(),
      details: toJsonInput(details),
    },
  });
  // Tính duration
  const duration = run.endedAt!.getTime() - run.startedAt.getTime();
  await prisma.pipelineRun.update({
    where: { id },
    data: { durationMs: duration },
  });
  console.log(`[Pipeline] ${run.name} completed successfully (${duration}ms)`);
  return run;
}

/**
 * Kết thúc pipeline run thất bại
 */
export async function endPipelineFailure(id: string, error: string, details?: PipelineDetails) {
  const run = await prisma.pipelineRun.update({
    where: { id },
    data: {
      status: "failed",
      endedAt: new Date(),
      error: error.slice(0, 10000), // Giới hạn 10k ký tự
      details: toJsonInput(details),
    },
  });
  const duration = run.endedAt!.getTime() - run.startedAt.getTime();
  await prisma.pipelineRun.update({
    where: { id },
    data: { durationMs: duration },
  });
  console.error(`[Pipeline] ${run.name} failed (${duration}ms): ${error}`);
  return run;
}
