// src/agent/tools/search.tool.ts
/**
 * Search Tool - Tìm kiếm dữ liệu trong local database (hoặc dữ liệu
 * tĩnh phản ứng nguyên tố cho type="reaction")
 */

import { z } from "zod";
import { BaseTool, type ToolContext } from "./base.tool";
import { DataSourceManager } from "@/lib/data-sources/DataSourceManager";
import { SearchEntityTypeSchema } from "@/agent/core/schemas";

export class SearchTool extends BaseTool {
  name = "searchData";
  description =
    "Tìm kiếm dữ liệu trong cơ sở dữ liệu nội bộ (local DB): character, weapon, material, domain, artifact, reaction";
  permission: "public" = "public";

  parameters = z.object({
    type: SearchEntityTypeSchema,
    query: z.string().min(1, "Vui lòng nhập từ khóa tìm kiếm"),
    limit: z.number().min(1).max(50).default(10),
  });

  private dataManager = new DataSourceManager();

  protected async run(params: z.infer<typeof this.parameters>, _context: ToolContext): Promise<any[]> {
    const { type, query, limit } = params;
    return await this.dataManager.search(type, query, limit);
  }
}
