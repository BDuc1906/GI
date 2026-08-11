// src/agent/core/config.ts
/**
 * Cấu hình AI Agent
 * Đọc từ biến môi trường .env.local
 * Cung cấp các tham số cho LLM client và các module khác
 */

export const agentConfig = {
  llm: {
    model: process.env.AGENT_LLM_MODEL || "gpt-4o",
    temperature: parseFloat(process.env.AGENT_TEMPERATURE || "0.7"),
    maxTokens: parseInt(process.env.AGENT_MAX_TOKENS || "4096", 10),
    topP: parseFloat(process.env.AGENT_TOP_P || "1"),
    frequencyPenalty: parseFloat(process.env.AGENT_FREQUENCY_PENALTY || "0"),
    presencePenalty: parseFloat(process.env.AGENT_PRESENCE_PENALTY || "0"),
  },

  agent: {
    maxSteps: parseInt(process.env.AGENT_MAX_STEPS || "5", 10),
    debug: process.env.AGENT_DEBUG === "true",
    timeout: parseInt(process.env.AGENT_TIMEOUT || "30000", 10),
  },

  memory: {
    maxMessages: parseInt(process.env.AGENT_MAX_MESSAGES || "20", 10),
    useDb: process.env.AGENT_USE_DB !== "false",
  },

  // Rate limit riêng cho /api/agent — tách bucket khỏi rate limit
  // chung của API đọc dữ liệu (src/lib/api/rate-limit.ts DEFAULT_LIMIT
  // = 60/60s), vì mỗi lượt chat gọi LLM tốn kém hơn NHIỀU lần 1 query
  // Prisma thường — cần giới hạn chặt hơn để tránh 1 client spam kéo
  // hoá đơn OpenAI/Anthropic lên bất thường.
  rateLimit: {
    limit: parseInt(process.env.AGENT_RATE_LIMIT || "10", 10),
    window: process.env.AGENT_RATE_LIMIT_WINDOW || "60 s",
  },

  telemetry: {
    enabled: process.env.AGENT_TELEMETRY_ENABLED === "true",
    provider: process.env.AGENT_TELEMETRY_PROVIDER || "none",
    langSmithApiKey: process.env.LANGSMITH_API_KEY || "",
    honeycombApiKey: process.env.HONEYCOMB_API_KEY || "",
  },
} as const;

export type AgentConfig = typeof agentConfig;

export function getConfig(): AgentConfig {
  return agentConfig;
}

export function getLLMConfig() {
  return agentConfig.llm;
}

/**
 * Kiểm tra các biến môi trường cần thiết. TRƯỚC ĐÂY hàm này tồn tại
 * nhưng KHÔNG được gọi ở đâu cả — app "khởi động thành công" rồi lỗi
 * mơ hồ ("OPENAI_API_KEY is not defined") ngay lúc người dùng gửi tin
 * nhắn đầu tiên. Giờ được gọi từ AgentCore constructor — fail sớm,
 * thông báo rõ ràng, giống triết lý của src/lib/env.ts cho phần core.
 */
export function validateConfig(): string[] {
  const errors: string[] = [];

  // Đọc TRỰC TIẾP từ process.env (không qua `agentConfig` — object đó
  // được đóng băng giá trị ngay lúc module được import lần đầu, nên
  // validate qua nó sẽ không thấy các thay đổi env xảy ra sau đó, ví
  // dụ trong test hoặc khi biến được set muộn trong quá trình khởi
  // động serverless function).
  const model = (process.env.AGENT_LLM_MODEL || "gpt-4o").toLowerCase();
  if (model.includes("gpt") || model.includes("openai") || model.includes("o1") || model.includes("o3")) {
    if (!process.env.OPENAI_API_KEY) errors.push("OPENAI_API_KEY is required for OpenAI models");
  } else if (model.includes("claude") || model.includes("anthropic")) {
    if (!process.env.ANTHROPIC_API_KEY) errors.push("ANTHROPIC_API_KEY is required for Anthropic models");
  } else if (model.includes("gemini") || model.includes("google")) {
    if (!process.env.GEMINI_API_KEY) errors.push("GEMINI_API_KEY is required for Google Gemini models");
  }

  const useDb = process.env.AGENT_USE_DB !== "false";
  if (useDb && !process.env.DATABASE_URL) {
    errors.push("DATABASE_URL is required when AGENT_USE_DB is enabled (or set AGENT_USE_DB=false)");
  }

  return errors;
}
