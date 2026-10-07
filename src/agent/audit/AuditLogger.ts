
// src/lib/agent/AuditLogger.ts
/**
 * AuditLogger — ghi & đọc lịch sử mọi lần AI Agent (hoặc AutoFixEngine)
 * thay đổi dữ liệu, dùng bảng AuditLog (xem model AuditLog trong
 * prisma/schema.prisma, mục "AI Agent: nhật ký kiểm toán").
 *
 * Xem ghi chú sự cố ở đầu file src/agent/utils/db-memory.ts — cùng gốc
 * vấn đề (bảng bị DROP mà schema không đồng bộ), đã khôi phục ở migration
 * 20260812060000_restore_agent_tables.
 *
 * VÁ 0% ANY: `oldValue`/`newValue` nhận `unknown` ở input (linh hoạt
 * cho mọi caller — có thể là 1 record Prisma đầy đủ, hoặc chỉ vài
 * field), rồi ép về đúng kiểu `Prisma.InputJsonValue` mà cột Json của
 * Prisma yêu cầu qua `toJsonValue()`. Hàm này còn SỬA 1 lỗi tiềm ẩn
 * bản trước che giấu bằng `as any`: record Prisma thường chứa
 * `Date` (vd `updatedAt`) — Prisma Json column KHÔNG tự serialize
 * Date, ghi thẳng dễ lỗi hoặc lưu sai định dạng. `JSON.parse(JSON.stringify())`
 * ép toàn bộ về JSON thuần trước khi lưu, Date tự động thành ISO string.
 */

import { prisma } from "@/lib/db/prisma";
import { logger } from "@/lib/infra/logger";
import type { AuditLog } from "@prisma/client";
import { Prisma } from "@prisma/client";

export type AuditLogEntry = AuditLog;

export interface CreateAuditLogInput {
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: unknown;
  newValue?: unknown;
  performedBy: string;
  sessionId?: string;
  reason?: string;
  status?: "success" | "failed";
  error?: string;
}

/** Ép 1 giá trị bất kỳ về đúng kiểu Prisma Json input chấp nhận. */
function toJsonValue(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull {
  if (value === undefined || value === null) return Prisma.JsonNull;
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function createAuditLog(input: CreateAuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        oldValue: toJsonValue(input.oldValue),
        newValue: toJsonValue(input.newValue),
        performedBy: input.performedBy,
        sessionId: input.sessionId,
        reason: input.reason,
        status: input.status ?? "success",
        error: input.error,
      },
    });
  } catch (err) {
    // Audit log lỗi KHÔNG được phép làm sập thao tác chính (fix đã chạy
    // xong hoặc chưa đều phải trả lời được cho người dùng) — nhưng phải
    // log to lửa ra console/Sentry vì đây là mất dấu vết nghiêm trọng.
    logger.error("[AuditLogger] Không ghi được audit log — CẦN kiểm tra thủ công", {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      err,
    });
  }
}

export async function getAuditLogs(
  entityType?: string,
  entityId?: string,
  limit: number = 20
): Promise<AuditLogEntry[]> {
  return prisma.auditLog.findMany({
    where: {
      ...(entityType ? { entityType } : {}),
      ...(entityId ? { entityId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(limit, 1), 100),
  });
}
