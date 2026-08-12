// src/agent/core/schemas.ts
/**
 * Zod Schemas - Định nghĩa cấu trúc dữ liệu cho AI Agent
 * Validate input/output đảm bảo an toàn trước khi gọi tool
 */

import { z } from "zod";

// ==========================================
// Loại entity Agent được phép thao tác
// ==========================================
// CHỈ gồm các loại đã có bảng + dữ liệu thật trong Prisma schema.
// "enemy" ĐÃ BỊ LOẠI khỏi danh sách này — DB chưa có model Enemy (xem
// comment "sẽ nối vào bảng Enemy khi làm giai đoạn Enemies/Bosses"
// trong prisma/schema.prisma). Trước đây agent quảng cáo hỗ trợ
// "enemy" nhưng mọi tool gọi tới đều throw lỗi runtime vì không có gì
// để query — thà không hỗ trợ còn hơn giả vờ hỗ trợ rồi lỗi khó hiểu.
// Thêm lại "enemy" vào đây NGAY SAU KHI có model Enemy thật.
export const EntityTypeSchema = z.enum([
  "character",
  "weapon",
  "material",
  "domain",
  "artifact",
]);
export type EntityType = z.infer<typeof EntityTypeSchema>;

// "reaction" chỉ hợp lệ cho search/explain (dữ liệu tĩnh trong
// src/lib/element-reactions-data.ts, không phải bảng DB) — tách riêng
// khỏi EntityTypeSchema vì fix/sync không áp dụng được cho nó.
export const SearchEntityTypeSchema = z.union([EntityTypeSchema, z.literal("reaction")]);

// ==========================================
// 1. Intent Schema
// ==========================================
export const IntentSchema = z.object({
  intent: z.enum(["search", "audit", "fix", "compare", "sync", "explain"]),
  entities: z.object({
    type: z.union([SearchEntityTypeSchema, z.literal("unknown")]),
    name: z.string().min(1),
    action: z.string().optional(),
  }),
  confidence: z.number().min(0).max(1),
});

export type IntentResult = z.infer<typeof IntentSchema>;

// ==========================================
// 2. Tool Invocation Schema
// ==========================================
export const ToolInvocationSchema = z.object({
  id: z.string(),
  tool: z.string(),
  status: z.enum(["pending", "running", "done", "error"]),
  params: z.record(z.unknown()),
  result: z.unknown().optional(),
  error: z.string().optional(),
});

export type ToolInvocation = z.infer<typeof ToolInvocationSchema>;

// ==========================================
// 3. Agent Response Schema
// ==========================================
export const AgentResponseSchema = z.object({
  output: z.string(),
  toolInvocations: z.array(ToolInvocationSchema),
  sessionId: z.string(),
});

export type AgentResponse = z.infer<typeof AgentResponseSchema>;

// ==========================================
// 4. Chat Message Schema
// ==========================================
export const ChatMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string(),
  toolCalls: z.array(z.unknown()).optional(),
  toolCallId: z.string().optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;

// ==========================================
// 5. Tool Result Schema
// ==========================================
export const ToolResultSchema = z.object({
  success: z.boolean(),
  data: z.unknown().optional(),
  error: z.string().optional(),
  metadata: z
    .object({
      executedAt: z.string(),
      durationMs: z.number(),
      toolName: z.string(),
    })
    .optional(),
});

export type ToolResult<T = unknown> = z.infer<typeof ToolResultSchema> & { data?: T };

// ==========================================
// 6. Search Parameters
// ==========================================
export const SearchParamsSchema = z.object({
  type: SearchEntityTypeSchema,
  query: z.string().min(1),
  limit: z.number().min(1).max(100).default(10),
});

// ==========================================
// 7. Fix Parameters
// ==========================================
export const FixParamsSchema = z.object({
  type: EntityTypeSchema,
  id: z.string().min(1),
  fields: z.record(z.unknown()).optional(),
  reason: z.string().optional(),
});

// ==========================================
// 8. Sync Parameters
// ==========================================
export const SyncParamsSchema = z.object({
  force: z.boolean().default(false),
});

// ==========================================
// 9. Compare Parameters
// ==========================================
export const CompareParamsSchema = z.object({
  type: EntityTypeSchema,
  id: z.string().min(1),
});

// ==========================================
// 10. Audit Log Parameters
// ==========================================
export const AuditLogParamsSchema = z.object({
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  limit: z.number().min(1).max(100).default(20),
});

// ==========================================
// Utility: Validate function
// ==========================================
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", "),
      };
    }
    return { success: false, error: String(error) };
  }
}

// Utility: Safe parse with default
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown, fallback: T): T {
  const result = schema.safeParse(data);
  return result.success ? result.data : fallback;
}
