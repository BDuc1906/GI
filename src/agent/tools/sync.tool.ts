// src/agent/tools/sync.tool.ts
/**
 * Sync Tool - Trigger workflow đồng bộ dữ liệu đã có sẵn
 * (.github/workflows/update-data.yml) qua GitHub API — xem
 * src/lib/sync/DataSyncPipeline.ts. KHÔNG ghi trực tiếp vào DB, luôn
 * đi qua quy trình test-DB → verify → Pull Request để review đã có
 * sẵn của dự án. permission="admin".
 */

import { z } from "zod";
import { BaseTool, type ToolContext } from "./base.tool";
import { DataSyncPipeline } from "@/lib/sync/DataSyncPipeline";

export class SyncTool extends BaseTool {
  name = "syncData";
  description =
    "Trigger workflow đồng bộ dữ liệu genshin-db (chạy trên DB test, verify, rồi tạo PR để review — không ghi thẳng production)";
  permission: "admin" = "admin";

  parameters = z.object({
    force: z.boolean().default(false),
  });

  protected async run(params: z.infer<typeof this.parameters>, _context: ToolContext): Promise<any> {
    const pipeline = new DataSyncPipeline();
    return await pipeline.sync(params.force);
  }
}
