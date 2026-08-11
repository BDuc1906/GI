// src/agent/tools/audit.tool.ts
/**
 * Audit Tool - Lấy lịch sử thay đổi (không đổi so với bản gốc, chỉ giờ
 * import trỏ tới AuditLogger THẬT thay vì module không tồn tại)
 */

import { z } from "zod";
import { BaseTool, type ToolContext } from "./base.tool";
import { getAuditLogs } from "@/lib/agent/AuditLogger";

export class AuditTool extends BaseTool {
  name = "getAuditLogs";
  description = "Lấy lịch sử thay đổi của một entity trong hệ thống";
  permission: "user" = "user";

  parameters = z.object({
    entityType: z.string().optional(),
    entityId: z.string().optional(),
    limit: z.number().min(1).max(100).default(20),
  });

  protected async run(
    params: z.infer<typeof this.parameters>,
    _context: ToolContext
  ): Promise<any[]> {
    return await getAuditLogs(params.entityType, params.entityId, params.limit);
  }
}
