// src/agent/core/llm-client.ts
/**
 * LLM Client - Khởi tạo và quản lý kết nối tới các nhà cung cấp AI
 * Hỗ trợ: OpenAI, Anthropic, Google Gemini
 * Dùng Vercel AI SDK để thống nhất interface
 */

import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { getLLMConfig } from "./config";

// Singleton pattern để tránh tạo nhiều instance
let _llmClient: any = null;
let _provider: string | null = null;

export type LLMProvider = "openai" | "anthropic" | "google";

export interface LLMClientOptions {
  provider?: LLMProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Tạo LLM client instance
 * Sử dụng singleton pattern
 */
export function createLLMClient(options: LLMClientOptions = {}) {
  const config = getLLMConfig();
  const provider = options.provider || detectProvider(config.model);

  // Nếu đã có instance và provider không đổi thì trả về cached
  if (_llmClient && _provider === provider) {
    return _llmClient;
  }

  const model = options.model || config.model;
  const temperature = options.temperature ?? config.temperature;
  const maxTokens = options.maxTokens || config.maxTokens;

  let client;
  let modelName = model;

  switch (provider) {
    case "openai": {
      const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        // Có thể thêm baseURL nếu dùng proxy
      });
      client = openai(modelName);
      break;
    }

    case "anthropic": {
      const anthropic = createAnthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      client = anthropic(modelName);
      break;
    }

    case "google": {
      const google = createGoogleGenerativeAI({
        apiKey: process.env.GEMINI_API_KEY,
      });
      client = google(modelName);
      break;
    }

    default: {
      // Fallback: dùng OpenAI
      console.warn(`Unknown provider ${provider}, falling back to OpenAI`);
      const openai = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      client = openai("gpt-4o");
    }
  }

  // Cache instance
  _llmClient = client;
  _provider = provider;

  return client;
}

/**
 * Phát hiện provider dựa trên tên model
 */
function detectProvider(model: string): LLMProvider {
  const lower = model.toLowerCase();
  if (lower.includes("gpt") || lower.includes("o1") || lower.includes("o3")) {
    return "openai";
  }
  if (lower.includes("claude")) {
    return "anthropic";
  }
  if (lower.includes("gemini")) {
    return "google";
  }
  // Default: OpenAI
  return "openai";
}

/**
 * Lấy tên model hiện tại
 */
export function getCurrentModel(): string {
  return getLLMConfig().model;
}

/**
 * Lấy provider hiện tại
 */
export function getCurrentProvider(): LLMProvider {
  return detectProvider(getCurrentModel());
}

/**
 * Reset LLM client (dùng khi thay đổi config)
 */
export function resetLLMClient(): void {
  _llmClient = null;
  _provider = null;
}
