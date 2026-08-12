// src/agent/tools/compare.tool.ts
/**
 * Compare Tool - So sánh dữ liệu local và live
 */

import { z } from "zod";
import { BaseTool, type ToolContext } from "./base.tool";
import { DataSourceManager } from "@/lib/data-sources/DataSourceManager";
import { DiffEngine, type DiffResult } from "@/lib/sync/DiffEngine";
import { EntityTypeSchema } from "@/agent/core/schemas";
import type { EntityType, EntityRecordMap, LiveEntityData } from "@/agent/core/types";

const CompareParams = z.object({
  type: EntityTypeSchema,
  id: z.string().min(1, "Vui lòng nhập ID hoặc tên"),
});
type CompareParams = z.infer<typeof CompareParams>;

interface CompareResult {
  local: EntityRecordMap[EntityType] | null;
  live: LiveEntityData<EntityType> | null;
  diff: DiffResult;
}

export class CompareTool extends BaseTool<CompareParams, CompareResult> {
  name = "compareData";
  description = "So sánh dữ liệu giữa local DB và nguồn live, trả về danh sách field khác biệt";
  permission = "user" as const;

  parameters = CompareParams;

  private dataManager = new DataSourceManager();

  protected async run(params: CompareParams, _context: ToolContext): Promise<CompareResult> {
    const { type, id } = params;

    const [local, live] = await Promise.all([
      this.dataManager.fetch(type, id, false),
      this.dataManager.fetch(type, id, true),
    ]);

    const diff = DiffEngine.diff(local, live);
    return { local, live, diff };
  }
}
