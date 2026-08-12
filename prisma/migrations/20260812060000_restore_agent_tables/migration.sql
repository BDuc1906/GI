-- prisma/migrations/20260812060000_restore_agent_tables/migration.sql
--
-- KHÔI PHỤC bảng AgentSession + AuditLog.
--
-- BỐI CẢNH: migration 20260810120000_add_agent_tables đã tạo 2 bảng này,
-- nhưng migration 20260811015049_add_agent_tables (chạy 1 ngày sau) lại
-- DROP cả hai — trong khi prisma/schema.prisma không hề được cập nhật để
-- bỏ 2 model tương ứng, và code (src/agent/utils/db-memory.ts,
-- src/lib/agent/AuditLogger.ts) vẫn gọi thẳng prisma.agentSession /
-- prisma.auditLog. Kết quả: agent chat memory + audit trail KHÔNG hoạt
-- động ở mọi migration sau 20260811015049.
--
-- Migration này CHỦ Ý không sửa/xoá 2 migration cũ ở trên (nguyên tắc:
-- không bao giờ sửa migration đã áp dụng trên môi trường bất kỳ) — chỉ
-- roll-forward, tạo lại đúng cấu trúc bảng đã có ở migration đầu tiên,
-- khớp với model AgentSession/AuditLog vừa thêm lại vào schema.prisma.
--
-- CẢNH BÁO VẬN HÀNH: nếu migration DROP đã từng chạy trên production,
-- toàn bộ audit log + chat history cũ tại thời điểm đó đã mất vĩnh viễn
-- và KHÔNG thể khôi phục bằng migration này (migration chỉ tạo lại cấu
-- trúc bảng rỗng). Cần kiểm tra backup DB (point-in-time recovery) nếu
-- cần cứu dữ liệu cũ trước khi merge migration này.

-- CreateTable
CREATE TABLE "AgentSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "performedBy" TEXT NOT NULL,
    "sessionId" TEXT,
    "reason" TEXT,
    "status" TEXT NOT NULL DEFAULT 'success',
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentSession_userId_idx" ON "AgentSession"("userId");

-- CreateIndex
CREATE INDEX "AgentSession_updatedAt_idx" ON "AgentSession"("updatedAt" DESC);

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_performedBy_idx" ON "AuditLog"("performedBy");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt" DESC);
