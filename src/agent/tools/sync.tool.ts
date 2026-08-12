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
import { DataSyncPipeline, type SyncResult } from "@/lib/sync/DataSyncPipeline";

const SyncParams = z.object({
  force: z.boolean().default(false),
});
type SyncParams = z.infer<typeof SyncParams>;

export class SyncTool extends BaseTool<SyncParams, SyncResult> {
  name = "syncData";
  description =
    "Trigger workflow đồng bộ dữ liệu genshin-db (chạy trên DB test, verify, rồi tạo PR để review — không ghi thẳng production)";
  permission = "admin" as const;

  parameters = SyncParams;

  protected async run(params: SyncParams, _context: ToolContext): Promise<SyncResult> {
    const pipeline = new DataSyncPipeline();
    return await pipeline.sync(params.force);
  }
}
