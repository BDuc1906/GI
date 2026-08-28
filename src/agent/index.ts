// src/agent/index.ts
/**
 * AI Agent - Public API
 * Export tất cả các module để sử dụng từ bên ngoài
 *
 * SỬA (2026-08):
 * - Bỏ re-export `requireAuth` — hàm này CHƯA TỪNG tồn tại trong
 *   utils/auth.ts (chỉ có `getAuthenticatedUser` và `requireAdmin`).
 *   Đây là lỗi có sẵn từ trước (không liên quan tới nâng cấp AI SDK),
 *   nhưng chặn `tsc --noEmit` nên sửa luôn ở đây.
 * - Bỏ re-export `aiStreamToSSE` — hàm đã bị xoá khỏi utils/stream.ts
 *   vì AgentCore.processStream() giờ tự trả về đúng SSE nội bộ rồi
 *   (xem AgentCore.ts::toStreamChunks), không còn ai cần gọi nó.
 */

// Core
export {
  AgentCore,
  AgentMemory,
  createAgentMemory,
  ToolRegistry,
  classifyIntent,
  classifyIntentWithLog,
  getConfig,
  getLLMConfig,
  validateConfig,
  createLLMClient,
  getCurrentModel,
  getCurrentProvider,
} from "./core";

// Schemas
export * from "./core/schemas";

// Tools
export {
  BaseTool,
  SearchTool,
  FetchLiveTool,
  CompareTool,
  FixTool,
  SyncTool,
  AuditTool,
  type ToolContext,
  type ToolResult,
} from "./tools";

// Utils
export { dbMemory, type SessionData } from "./utils/db-memory";
export { getAuthenticatedUser, requireAdmin, type AuthenticatedUser } from "./utils/auth";
export { createStream, createTextStream, type StreamChunk } from "./utils/stream";
export { telemetry, type TelemetryData } from "./utils/telemetry";
