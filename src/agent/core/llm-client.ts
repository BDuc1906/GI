// src/agent/core/llm-client.ts
/**
 * LLM Client - Khởi tạo và quản lý kết nối tới các nhà cung cấp AI
 * Hỗ trợ: OpenAI, Anthropic, Google Gemini
 * Dùng Vercel AI SDK để thống nhất interface
 *
 * VÁ LỖI BUILD: bản gốc `import` TĨNH cả 3 gói
 * (`@ai-sdk/openai`, `@ai-sdk/anthropic`, `@ai-sdk/google`) ở đầu
 * file. Next.js/Turbopack phân tích import tĩnh ngay lúc BUILD, nên dù
 * bạn chỉ dùng Gemini (chỉ cài `@ai-sdk/google`), build vẫn đòi phải
 * có `@ai-sdk/anthropic`/`@ai-sdk/openai` trong `node_modules` — lỗi
 * "Module not found" dù code không bao giờ thực sự chạy tới nhánh đó.
 *
 * Sửa bằng `await import(...)` ĐỘNG bên trong từng nhánh `case` — chỉ
 * gói ứng với provider bạn thực sự cấu hình (`AGENT_LLM_MODEL`) mới bị
 * đòi hỏi phải cài lúc build; 2 gói còn lại có thể để trống, chỉ báo
 * lỗi rõ ràng nếu sau này bạn đổi model sang provider đó mà quên cài.
 *
 * Đánh đổi: `createLLMClient()` giờ là hàm ASYNC (trước là sync) — mọi
 * nơi gọi hàm này (`AgentCore.ts`) đã được cập nhật thêm `await`.
 */

import { getLLMConfig } from "./config";
import type { LanguageModel } from "ai";

// Singleton pattern để tránh tạo nhiều instance
let _llmClient: LanguageModel | null = null;
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
export async function createLLMClient(options: LLMClientOptions = {}) {
  const config = getLLMConfig();
  const provider = options.provider || detectProvider(config.model);

  // Nếu đã có instance và provider không đổi thì trả về cached
  if (_llmClient && _provider === provider) {
    return _llmClient;
  }

  const model = options.model || config.model;
  let client: LanguageModel;
  const modelName = model;

  switch (provider) {
    case "openai": {
      let createOpenAI;
      try {
        ({ createOpenAI } = await import("@ai-sdk/openai"));
      } catch {
        throw new Error(
          `AGENT_LLM_MODEL="${model}" cần gói "@ai-sdk/openai" nhưng chưa được cài. ` +
            `Chạy: npm install @ai-sdk/openai`
        );
      }
      const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
      client = openai(modelName);
      break;
    }

    case "anthropic": {
      let createAnthropic;
      try {
        ({ createAnthropic } = await import("@ai-sdk/anthropic"));
      } catch {
        throw new Error(
          `AGENT_LLM_MODEL="${model}" cần gói "@ai-sdk/anthropic" nhưng chưa được cài. ` +
            `Chạy: npm install @ai-sdk/anthropic`
        );
      }
      const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      client = anthropic(modelName);
      break;
    }

    case "google": {
      let createGoogleGenerativeAI;
      try {
        ({ createGoogleGenerativeAI } = await import("@ai-sdk/google"));
      } catch {
        throw new Error(
          `AGENT_LLM_MODEL="${model}" cần gói "@ai-sdk/google" nhưng chưa được cài. ` +
            `Chạy: npm install @ai-sdk/google`
        );
      }
      const google = createGoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY });
      client = google(modelName);
      break;
    }

    default: {
      throw new Error(
        `Không nhận diện được provider cho model "${model}". ` +
          `Model phải chứa "gpt"/"o1"/"o3" (OpenAI), "claude" (Anthropic), hoặc "gemini" (Google).`
      );
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
