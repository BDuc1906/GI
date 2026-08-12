// src/agent/tools/fetch-live.tool.ts
/**
 * Fetch Live Tool - Lấy dữ liệu từ live provider (mặc định
 * genshin.jmp.blue, xem src/lib/data-sources/live/JmpBlueProvider.ts)
 */

import { z } from "zod";
import { BaseTool, type ToolContext } from "./base.tool";
import { DataSourceManager } from "@/lib/data-sources/DataSourceManager";
import { EntityTypeSchema } from "@/agent/core/schemas";
import type { EntityType, LiveEntityData } from "@/agent/core/types";

const FetchLiveParams = z.object({
  type: EntityTypeSchema,
  id: z.string().min(1, "Vui lòng nhập ID hoặc tên"),
});
type FetchLiveParams = z.infer<typeof FetchLiveParams>;

export class FetchLiveTool extends BaseTool<FetchLiveParams, LiveEntityData<EntityType> | null> {
  name = "fetchLiveData";
  description = "Lấy dữ liệu trực tiếp từ nguồn ngoài (live provider) để đối chiếu với local DB";
  permission = "user" as const;

  parameters = FetchLiveParams;

  private dataManager = new DataSourceManager();

  protected async run(params: FetchLiveParams, _context: ToolContext): Promise<LiveEntityData<EntityType> | null> {
    const { type, id } = params;
    return await this.dataManager.fetch(type, id, true);
  }
}
