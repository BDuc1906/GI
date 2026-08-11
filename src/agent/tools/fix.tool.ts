// src/agent/tools/fix.tool.ts
/**
 * Fix Tool - Sửa dữ liệu trong database dựa trên dữ liệu live đã xác minh.
 * permission="admin" → KHÔNG BAO GIỜ được ToolRegistry.getAITools() đưa
 * cho LLM tự gọi (xem ToolRegistry.ts) — chỉ chạy được khi gọi trực
 * tiếp qua /api/admin/fix với requireAdmin() thật.
 */

import { z } from "zod";
import { BaseTool, type ToolContext } from "./base.tool";
import { DataSourceManager } from "@/lib/data-sources/DataSourceManager";
import { createAuditLog } from "@/lib/agent/AuditLogger";
import { prisma } from "@/lib/prisma";
import { EntityTypeSchema, type EntityType } from "@/agent/core/schemas";

const MODEL_BY_TYPE: Record<EntityType, keyof typeof prisma> = {
  character: "character",
  weapon: "weapon",
  material: "material",
  domain: "domain",
  artifact: "artifactSet",
};

export class FixTool extends BaseTool {
  name = "fixData";
  description = "Sửa dữ liệu trong cơ sở dữ liệu dựa trên dữ liệu live đã xác minh";
  permission: "admin" = "admin";

  parameters = z.object({
    type: EntityTypeSchema,
    id: z.string().min(1, "Vui lòng nhập ID hoặc tên"),
    fields: z.record(z.any()).optional(),
    reason: z.string().optional(),
  });

  private dataManager = new DataSourceManager();

  protected async run(
    params: z.infer<typeof this.parameters>,
    context: ToolContext
  ): Promise<{ success: boolean; old: any; updated: any }> {
    const { type, id, fields, reason } = params;

    const model = prisma[MODEL_BY_TYPE[type]] as any;

    const old = await model.findUnique({ where: { id } });
    if (!old) {
      throw new Error(`Không tìm thấy ${type} với ID "${id}"`);
    }

    let newData = fields;
    if (!newData) {
      const live = await this.dataManager.fetch(type, id, true);
      if (!live) {
        throw new Error(`Không thể lấy dữ liệu live cho ${type} "${id}"`);
      }
      // Chỉ lấy field mà live provider THẬT SỰ trả về (khác undefined)
      // — không ghi đè nguyên object live lên record local, tránh xoá
      // mất field local có nhưng live provider không cover.
      newData = Object.fromEntries(Object.entries(live).filter(([, v]) => v !== undefined));
    }

    try {
      const updated = await model.update({ where: { id }, data: newData });

      await createAuditLog({
        action: `fix_${type}`,
        entityType: type,
        entityId: id,
        oldValue: old,
        newValue: newData,
        performedBy: context.userId === "admin" ? "ai_agent" : context.userId,
        sessionId: context.sessionId,
        reason: reason || "AI Agent tự động sửa dữ liệu",
        status: "success",
      });

      return { success: true, old, updated };
    } catch (error) {
      await createAuditLog({
        action: `fix_${type}`,
        entityType: type,
        entityId: id,
        oldValue: old,
        newValue: newData,
        performedBy: context.userId === "admin" ? "ai_agent" : context.userId,
        sessionId: context.sessionId,
        reason: reason || "AI Agent tự động sửa dữ liệu",
        status: "failed",
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }
}
