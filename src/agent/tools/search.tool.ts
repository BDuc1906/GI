// src/agent/tools/search.tool.ts
/**
 * Search Tool - Tìm kiếm dữ liệu trong local database (hoặc dữ liệu
 * tĩnh phản ứng nguyên tố cho type="reaction")
 */

import { z } from "zod";
import { BaseTool, type ToolContext } from "./base.tool";
import { DataSourceManager } from "@/lib/data-sources/DataSourceManager";
import { SearchEntityTypeSchema } from "@/agent/core/schemas";
import type { AnyEntityRecord } from "@/agent/core/types";
import type { ElementalReaction } from "@/lib/game/element-reactions-data";

const SearchParams = z.object({
  type: SearchEntityTypeSchema,
  query: z.string().min(1, "Vui lòng nhập từ khóa tìm kiếm"),
  limit: z.number().min(1).max(50).default(10),
});
type SearchParams = z.infer<typeof SearchParams>;

// Kết quả có thể là entity DB thật (character/weapon/...) hoặc phản ứng
// nguyên tố (dữ liệu tĩnh, type="reaction") — hợp cả 2 khả năng thay
// vì dùng any, người gọi (LLM/route) chỉ cần JSON.stringify nên không
// cần thu hẹp kiểu thêm.
type SearchResult = AnyEntityRecord | ElementalReaction;

export class SearchTool extends BaseTool<SearchParams, SearchResult[]> {
  name = "searchData";
  description =
    "Tìm kiếm dữ liệu trong cơ sở dữ liệu nội bộ (local DB): character, weapon, material, domain, artifact, reaction";
  permission = "public" as const;

  parameters = SearchParams;

  private dataManager = new DataSourceManager();

  protected async run(params: SearchParams, _context: ToolContext): Promise<SearchResult[]> {
    const { type, query, limit } = params;
    return await this.dataManager.search(type, query, limit);
  }
}
