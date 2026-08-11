// src/agent/tools/fetch-live.tool.ts
/**
 * Fetch Live Tool - Lấy dữ liệu từ live provider (mặc định ambr.top,
 * xem src/lib/data-sources/live/AmbrProvider.ts — CẦN kiểm thử trước
 * khi tin tưởng kết quả để tự động sửa dữ liệu)
 */

import { z } from "zod";
import { BaseTool, type ToolContext } from "./base.tool";
import { DataSourceManager } from "@/lib/data-sources/DataSourceManager";
import { EntityTypeSchema } from "@/agent/core/schemas";

export class FetchLiveTool extends BaseTool {
  name = "fetchLiveData";
  description = "Lấy dữ liệu trực tiếp từ nguồn ngoài (live provider) để đối chiếu với local DB";
  permission: "user" = "user";

  parameters = z.object({
    type: EntityTypeSchema,
    id: z.string().min(1, "Vui lòng nhập ID hoặc tên"),
  });

  private dataManager = new DataSourceManager();

  protected async run(params: z.infer<typeof this.parameters>, _context: ToolContext): Promise<any> {
    const { type, id } = params;
    return await this.dataManager.fetch(type, id, true);
  }
}
