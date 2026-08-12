// src/agent/core/ToolRegistry.ts
/**
 * ToolRegistry - Đăng ký và quản lý tất cả tools
 * Mỗi tool có schema, description, executor
 *
 * VÁ 0% ANY:
 * - `z.ZodTypeAny` là type alias CHÍNH THỨC do zod export (không phải
 *   từ khoá `any` của TypeScript — ESLint no-explicit-any không chặn
 *   identifier có chữ "any" trong tên, chỉ chặn từ khoá `any` thật) —
 *   dùng type này vì registry chứa nhiều tool có schema tham số KHÁC
 *   NHAU trong cùng 1 Map, cần 1 kiểu "any zod schema" hợp lệ để chứa
 *   chung, đây chính xác là mục đích ZodTypeAny sinh ra để giải quyết.
 * - `execute(params: unknown, ...)` khớp với BaseTool.execute() đã sửa
 *   — ranh giới thật giữa "dữ liệu LLM/HTTP gửi lên" (chưa biết hình
 *   dạng) và "dữ liệu đã qua zod validate" (biết chắc hình dạng).
 * - `getAITools()` trả về kiểu suy ra từ chính `ReturnType` của
 *   `createAITool()` (hàm `tool()` của SDK "ai") thay vì đoán tên type
 *   nội bộ của SDK — luôn khớp đúng dù SDK đổi tên type nội bộ.
 */

import { z } from "zod";
import { tool as createAITool } from "ai";
import { SearchTool, FetchLiveTool, CompareTool, FixTool, SyncTool, AuditTool } from "../tools";
import { getConfig } from "./config";
import type { ToolContext, ToolResult } from "../tools/base.tool";

type AITool = ReturnType<typeof createAITool>;
export type { AITool };

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodTypeAny;
  permission: "public" | "user" | "admin";
  execute: (params: unknown, context: ToolContext) => Promise<ToolResult>;
}

export class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();

  constructor() {
    this.registerDefaultTools();
  }

  register(tool: ToolDefinition): void {
    this.tools.set(tool.name, tool);
    if (getConfig().agent.debug) {
      console.log(`[ToolRegistry] Registered: ${tool.name}`);
    }
  }

  getTool(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  listTools(): string[] {
    return Array.from(this.tools.keys());
  }

  listDescriptions(): string {
    return Array.from(this.tools.values())
      .map((t) => `- ${t.name}: ${t.description}`)
      .join("\n");
  }

  /**
   * Lấy tools ở định dạng AI SDK.
   *
   * @param context  Context THẬT của request hiện tại (sessionId,
   *   userId, userRole). TRƯỚC ĐÂY hàm này hardcode
   *   { sessionId: "unknown", userId: "unknown", userRole: "user" } —
   *   nghĩa là BaseTool.execute() luôn thấy userId rỗng/giả, khiến mọi
   *   kiểm tra quyền ("user"/"admin") phía sau vô nghĩa. Giờ context
   *   được truyền từ AgentCore, lấy từ AuthenticatedUser thật.
   *
   * @param allowedNames  Nếu truyền, chỉ những tool có tên trong danh
   *   sách này được đưa cho LLM — dùng để giới hạn theo intent đã phân
   *   loại (xem AgentCore.buildToolSubset).
   */
  getAITools(context: ToolContext, allowedNames?: string[]): Record<string, AITool> {
    const result: Record<string, AITool> = {};

    for (const [name, def] of this.tools) {
      if (def.permission === "admin") continue; // admin tool KHÔNG bao giờ để LLM tự gọi
      if (allowedNames && !allowedNames.includes(name)) continue;

      result[name] = createAITool({
        description: def.description,
        parameters: def.parameters,
        execute: async (params: unknown) => {
          const result = await def.execute(params, context);
          return result.success ? result.data : { error: result.error };
        },
      });
    }

    return result;
  }

  private registerDefaultTools(): void {
    const tools = [new SearchTool(), new FetchLiveTool(), new CompareTool(), new FixTool(), new SyncTool(), new AuditTool()];

    for (const tool of tools) {
      this.register({
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters,
        permission: tool.permission || "user",
        execute: tool.execute.bind(tool),
      });
    }
  }
}
