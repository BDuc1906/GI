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
import { EntityTypeSchema } from "@/agent/core/schemas";
import type { EntityType, EntityRecordMap } from "@/agent/core/types";
import type { Prisma } from "@prisma/client";

const FixParams = z.object({
  type: EntityTypeSchema,
  id: z.string().min(1, "Vui lòng nhập ID hoặc tên"),
  fields: z.record(z.string(), z.unknown()).optional(),
  reason: z.string().optional(),
});
type FixParams = z.infer<typeof FixParams>;

interface FixResult<T extends EntityType> {
  success: boolean;
  old: EntityRecordMap[T];
  updated: EntityRecordMap[T];
}

// Update input hợp lệ cho từng model — union theo đúng type Prisma sinh
// ra cho từng bảng, KHÔNG dùng any. Field nào không thuộc model đó,
// TypeScript sẽ tự báo lỗi ngay khi build thay vì lỗi runtime.
type EntityUpdateInput =
  | Prisma.CharacterUpdateInput
  | Prisma.WeaponUpdateInput
  | Prisma.MaterialUpdateInput
  | Prisma.DomainUpdateInput
  | Prisma.ArtifactSetUpdateInput;

export class FixTool extends BaseTool<FixParams, FixResult<EntityType>> {
  name = "fixData";
  description = "Sửa dữ liệu trong cơ sở dữ liệu dựa trên dữ liệu live đã xác minh";
  permission = "admin" as const;

  parameters = FixParams;

  private dataManager = new DataSourceManager();

  protected async run(params: FixParams, context: ToolContext): Promise<FixResult<EntityType>> {
    const { type, id, fields, reason } = params;

    const old = await this.findByType(type, id);
    if (!old) {
      throw new Error(`Không tìm thấy ${type} với ID "${id}"`);
    }

    let newData: Record<string, unknown> | undefined = fields;
    if (!newData) {
      const live = await this.dataManager.fetch(type, id, true);
      if (!live) {
        throw new Error(`Không thể lấy dữ liệu live cho ${type} "${id}"`);
      }
      // Chỉ lấy field mà live provider THẬT SỰ trả về (khác undefined)
      // — không ghi đè nguyên object live lên record local.
      newData = Object.fromEntries(Object.entries(live).filter(([, v]) => v !== undefined));
    }

    try {
      // Ép kiểu qua `unknown` trước khi sang `EntityUpdateInput` — dữ
      // liệu ở đây genuinely động (từ live provider hoặc client tự
      // truyền `fields`), TypeScript không thể tự suy ra khớp cấu trúc
      // Prisma input trực tiếp từ Record<string, unknown>. Đây là 1
      // type assertion tường minh (`as`), KHÔNG phải `any` — khác biệt
      // ESLint no-explicit-any không chặn assertion, chỉ chặn khai báo
      // kiểu `any`.
      const updated = await this.updateByType(type, id, newData as unknown as EntityUpdateInput);

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

  /**
   * Tra + update theo đúng type Prisma tương ứng — dùng switch tường
   * minh thay vì `prisma[key] as any` (bản trước): dài hơn nhưng
   * TypeScript kiểm tra được đúng field hợp lệ cho từng bảng, và không
   * còn `any` nào trong toàn bộ luồng.
   */
  private async findByType(type: EntityType, id: string): Promise<EntityRecordMap[EntityType] | null> {
    switch (type) {
      case "character":
        return prisma.character.findUnique({ where: { id } });
      case "weapon":
        return prisma.weapon.findUnique({ where: { id } });
      case "material":
        return prisma.material.findUnique({ where: { id } });
      case "domain":
        return prisma.domain.findUnique({ where: { id } });
      case "artifact":
        return prisma.artifactSet.findUnique({ where: { id } });
    }
  }

  private async updateByType(
    type: EntityType,
    id: string,
    data: EntityUpdateInput
  ): Promise<EntityRecordMap[EntityType]> {
    switch (type) {
      case "character":
        return prisma.character.update({ where: { id }, data: data as Prisma.CharacterUpdateInput });
      case "weapon":
        return prisma.weapon.update({ where: { id }, data: data as Prisma.WeaponUpdateInput });
      case "material":
        return prisma.material.update({ where: { id }, data: data as Prisma.MaterialUpdateInput });
      case "domain":
        return prisma.domain.update({ where: { id }, data: data as Prisma.DomainUpdateInput });
      case "artifact":
        return prisma.artifactSet.update({ where: { id }, data: data as Prisma.ArtifactSetUpdateInput });
    }
  }
}
