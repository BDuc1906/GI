// src/agent/tools/base.tool.ts
/**
 * Base Tool - Định nghĩa cấu trúc chuẩn cho tất cả tools (không đổi so
 * với bản gốc — logic permission/validate ở đây đã đúng, vấn đề nằm ở
 * chỗ context truyền vào luôn là giả, nay đã sửa ở ToolRegistry.ts)
 */

import { z } from "zod";

export interface ToolContext {
  sessionId: string;
  userId: string;
  userRole?: string;
}

export interface ToolResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    executedAt: string;
    durationMs: number;
    toolName: string;
  };
}

export abstract class BaseTool<TParams = any, TResult = any> {
  abstract name: string;
  abstract description: string;
  abstract parameters: z.ZodObject<any>;

  permission: "public" | "user" | "admin" = "user";
  rateLimit: number = 0;

  async execute(params: TParams, context: ToolContext): Promise<ToolResult<TResult>> {
    const startTime = Date.now();
    const toolName = this.name;

    try {
      if (this.permission === "admin" && context.userRole !== "admin") {
        return {
          success: false,
          error: "⚠️ Bạn không có quyền thực hiện hành động này. Yêu cầu quyền admin.",
          metadata: { executedAt: new Date().toISOString(), durationMs: Date.now() - startTime, toolName },
        };
      }

      if (this.permission === "user" && (!context.userId || context.userId === "guest")) {
        return {
          success: false,
          error: "⚠️ Vui lòng đăng nhập để sử dụng tool này.",
          metadata: { executedAt: new Date().toISOString(), durationMs: Date.now() - startTime, toolName },
        };
      }

      const validated = this.parameters.safeParse(params);
      if (!validated.success) {
        return {
          success: false,
          error: `❌ Tham số không hợp lệ: ${validated.error.message}`,
          metadata: { executedAt: new Date().toISOString(), durationMs: Date.now() - startTime, toolName },
        };
      }

      const result = await this.run(validated.data, context);

      return {
        success: true,
        data: result,
        metadata: { executedAt: new Date().toISOString(), durationMs: Date.now() - startTime, toolName },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        metadata: { executedAt: new Date().toISOString(), durationMs: Date.now() - startTime, toolName },
      };
    }
  }

  protected abstract run(params: TParams, context: ToolContext): Promise<TResult>;

  protected success<T>(data: T): ToolResult<T> {
    return {
      success: true,
      data,
      metadata: { executedAt: new Date().toISOString(), durationMs: 0, toolName: this.name },
    };
  }

  protected error(message: string): ToolResult<never> {
    return {
      success: false,
      error: message,
      metadata: { executedAt: new Date().toISOString(), durationMs: 0, toolName: this.name },
    };
  }
}
