// src/agent/index.ts
/**
 * AI Agent - Public API
 * Export tất cả các module để sử dụng từ bên ngoài
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
export { getAuthenticatedUser, requireAuth, requireAdmin, type AuthenticatedUser } from "./utils/auth";
export { createStream, aiStreamToSSE, createTextStream, type StreamChunk } from "./utils/stream";
export { telemetry, type TelemetryData } from "./utils/telemetry";
