// src/agent/core/optional-providers.d.ts
/**
 * Khai báo type TỐI THIỂU cho 2 gói AI SDK provider KHÔNG BẮT BUỘC phải
 * cài (`@ai-sdk/openai`, `@ai-sdk/anthropic`) — xem giải thích đầy đủ
 * trong llm-client.ts: cố ý dùng `await import(...)` động để chỉ gói
 * ứng với provider bạn thực sự cấu hình (`AGENT_LLM_MODEL`) mới cần có
 * mặt lúc chạy, 2 gói còn lại có thể để trống.
 *
 * VẤN ĐỀ: dù chỉ dùng lúc RUNTIME (dynamic import, có try/catch), TypeScript
 * vẫn cần resolve được TYPE của module ngay lúc `tsc --noEmit`, bất kể có
 * chạy tới nhánh đó hay không — nếu không cài gói thật, `tsc` báo lỗi
 * "Cannot find module" dù thiết kế là optional.
 *
 * GIẢI PHÁP: khai ambient module ở đây — cho TypeScript đủ thông tin để
 * type-check `await import("@ai-sdk/openai")` mà KHÔNG cần gói đó thực sự
 * nằm trong node_modules. Nếu bạn cài gói thật (`npm install @ai-sdk/openai`),
 * type thật của gói đó sẽ tự động ưu tiên hơn khai báo ambient này — không
 * xung đột.
 *
 * Chỉ khai đúng phần llm-client.ts thực sự dùng tới (`createOpenAI`,
 * `createAnthropic`) — không cố khai đầy đủ toàn bộ API của 2 gói.
 */

declare module "@ai-sdk/openai" {
  import type { LanguageModel } from "ai";

  export function createOpenAI(options: {
    apiKey?: string;
    baseURL?: string;
  }): (modelId: string) => LanguageModel;
}

declare module "@ai-sdk/anthropic" {
  import type { LanguageModel } from "ai";

  export function createAnthropic(options: {
    apiKey?: string;
    baseURL?: string;
  }): (modelId: string) => LanguageModel;
}
