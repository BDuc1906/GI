// src/agent/tools/audit.tool.ts
/**
 * Audit Tool - Lấy lịch sử thay đổi
 */

import { z } from "zod";
import { BaseTool, type ToolContext } from "./base.tool";
import { getAuditLogs, type AuditLogEntry } from "@/lib/agent/AuditLogger";

const AuditParams = z.object({
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
});
type AuditParams = z.infer<typeof AuditParams>;

export class AuditTool extends BaseTool<AuditParams, AuditLogEntry[]> {
  name = "getAuditLogs";
  description = "Lấy lịch sử thay đổi của một entity trong hệ thống";
  permission = "user" as const;

  parameters = AuditParams;

  protected async run(params: AuditParams, _context: ToolContext): Promise<AuditLogEntry[]> {
    return await getAuditLogs(params.entityType, params.entityId, params.limit);
  }
}
