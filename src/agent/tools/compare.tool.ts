// src/agent/tools/compare.tool.ts
/**
 * Compare Tool - So sánh dữ liệu local và live
 */

import { z } from "zod";
import { BaseTool, type ToolContext } from "./base.tool";
import { DataSourceManager } from "@/lib/data-sources/DataSourceManager";
import { DiffEngine } from "@/lib/sync/DiffEngine";
import { EntityTypeSchema } from "@/agent/core/schemas";

export class CompareTool extends BaseTool {
  name = "compareData";
  description = "So sánh dữ liệu giữa local DB và nguồn live, trả về danh sách field khác biệt";
  permission: "user" = "user";

  parameters = z.object({
    type: EntityTypeSchema,
    id: z.string().min(1, "Vui lòng nhập ID hoặc tên"),
  });

  private dataManager = new DataSourceManager();

  protected async run(
    params: z.infer<typeof this.parameters>,
    _context: ToolContext
  ): Promise<{ local: any; live: any; diff: ReturnType<typeof DiffEngine.diff> }> {
    const { type, id } = params;

    const [local, live] = await Promise.all([
      this.dataManager.fetch(type, id, false),
      this.dataManager.fetch(type, id, true),
    ]);

    const diff = DiffEngine.diff(local, live);
    return { local, live, diff };
  }
}
