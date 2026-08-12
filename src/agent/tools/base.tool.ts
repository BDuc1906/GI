// src/agent/tools/base.tool.ts
/**
 * Base Tool - Định nghĩa cấu trúc chuẩn cho tất cả tools
 *
 * VÁ 0% ANY: `execute()` nhận `rawParams: unknown` — đây là ranh giới
 * THẬT của runtime (dữ liệu từ LLM tool-call hoặc HTTP body, chưa ai
 * đảm bảo đúng hình dạng gì cả), nên kiểu `unknown` là chính xác, không
 * phải "lười gõ kiểu". Ngay sau đó `this.parameters.safeParse(rawParams)`
 * validate + ép kiểu về đúng `TParams` cụ thể của từng tool con — từ
 * đây trở đi (`run()`) mọi thứ có kiểu tường minh, TypeScript tự suy ra
 * đúng dựa trên `parameters: z.ZodType<TParams>` khai báo ở lớp con.
 */

import { z } from "zod";

export interface ToolContext {
  sessionId: string;
  userId: string;
  userRole?: string;
}

export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: {
    executedAt: string;
    durationMs: number;
    toolName: string;
  };
}

export abstract class BaseTool<TParams = unknown, TResult = unknown> {
  abstract name: string;
  abstract description: string;
  // Ràng buộc generic TParams ngay tại schema — lớp con khai báo
  // `parameters = SomeZodSchema` (kiểu z.ZodType<SomeParams>), từ đó
  // TParams được TypeScript suy luận tự động tại `extends BaseTool<...>`.
  abstract parameters: z.ZodType<TParams>;

  permission: "public" | "user" | "admin" = "user";
  rateLimit: number = 0;

  async execute(rawParams: unknown, context: ToolContext): Promise<ToolResult<TResult>> {
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

      const validated = this.parameters.safeParse(rawParams);
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
