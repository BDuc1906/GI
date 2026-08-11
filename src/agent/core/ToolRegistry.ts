// src/agent/core/ToolRegistry.ts
/**
 * ToolRegistry - Đăng ký và quản lý tất cả tools
 * Mỗi tool có schema, description, executor
 */

import { z } from "zod";
import { tool as createAITool } from "ai";
import { SearchTool, FetchLiveTool, CompareTool, FixTool, SyncTool, AuditTool } from "../tools";
import { getConfig } from "./config";
import type { ToolContext, ToolResult } from "../tools/base.tool";

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: z.ZodObject<any>;
  permission: "public" | "user" | "admin";
  execute: (params: any, context: ToolContext) => Promise<ToolResult>;
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
   *   kiểm tra quyền ("user"/"admin") phía sau vô nghĩa (tool "user"
   *   luôn pass vì check `!context.userId` chỉ đúng khi userId THẬT là
   *   rỗng, còn ở đây nó luôn là chuỗi "unknown" — không rỗng, luôn
   *   pass — và tool "admin" luôn fail vì userRole cứng là "user", kể
   *   cả khi người gọi thật sự là admin). Giờ context được truyền từ
   *   AgentCore, lấy từ AuthenticatedUser thật.
   *
   * @param allowedNames  Nếu truyền, chỉ những tool có tên trong danh
   *   sách này được đưa cho LLM — dùng để giới hạn theo intent đã phân
   *   loại (xem AgentCore.buildToolSubset), giảm rủi ro LLM gọi nhầm
   *   tool (vd gọi fixData khi người dùng chỉ hỏi search) và giảm số
   *   token phải mô tả tool không liên quan.
   */
  getAITools(context: ToolContext, allowedNames?: string[]): Record<string, any> {
    const result: Record<string, any> = {};

    for (const [name, def] of this.tools) {
      if (def.permission === "admin") continue; // admin tool KHÔNG bao giờ để LLM tự gọi
      if (allowedNames && !allowedNames.includes(name)) continue;

      result[name] = createAITool({
        description: def.description,
        parameters: def.parameters,
        execute: async (params: any) => {
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
