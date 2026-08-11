// src/lib/agent/AuditLogger.ts
/**
 * AuditLogger — ghi & đọc lịch sử mọi lần AI Agent (hoặc AutoFixEngine)
 * thay đổi dữ liệu, dùng bảng AuditLog (xem
 * prisma/schema-agent-additions.prisma). Đây là bằng chứng bắt buộc
 * phải có TRƯỚC khi cho phép FixTool chạy thật trên production — không
 * có audit log, một lần AI sửa sai dữ liệu sẽ không ai truy được vì sao.
 */

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

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

export async function createAuditLog(input: CreateAuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        oldValue: input.oldValue as any,
        newValue: input.newValue as any,
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
): Promise<Array<Record<string, any>>> {
  return prisma.auditLog.findMany({
    where: {
      ...(entityType ? { entityType } : {}),
      ...(entityId ? { entityId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: Math.min(Math.max(limit, 1), 100),
  });
}
