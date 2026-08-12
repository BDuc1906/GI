// src/agent/core/intent-classifier.ts
/**
 * Intent Classifier - Phân loại ý định người dùng
 * Dùng AI để phân tích và trả về cấu trúc JSON
 */

import { generateObject } from "ai";
import { createLLMClient } from "./llm-client";
import { IntentSchema, type IntentResult } from "./schemas";
import { INTENT_CLASSIFICATION_PROMPT } from "./prompts";
import { getConfig } from "./config";

/**
 * Phân loại ý định từ tin nhắn người dùng
 */
export async function classifyIntent(
  message: string,
  options?: {
    model?: string;
    temperature?: number;
  }
): Promise<IntentResult> {
  const config = getConfig();
  const model = options?.model || config.llm.model;
  const temperature = options?.temperature ?? 0.1;

  try {
    // Thêm "await" — createLLMClient giờ là hàm async (đổi trong
    // llm-client.ts để dùng dynamic import, xem comment ở đó). QUÊN
    // await ở đây sẽ không lỗi build (JS không ép kiểu), mà "llm" sẽ
    // là 1 Promise thay vì client thật — generateObject() nhận nhầm
    // Promise sẽ throw, rồi bị catch bên dưới nuốt mất, khiến intent
    // LUÔN fallback về "search" một cách âm thầm, rất khó phát hiện.
    const llm = await createLLMClient({ model, temperature });

    const { object } = await generateObject({
      model: llm,
      schema: IntentSchema,
      prompt: message,
      system: INTENT_CLASSIFICATION_PROMPT,
      temperature,
    });

    return object;
  } catch (error) {
    // Fallback: nếu không parse được, mặc định là search
    console.warn("[IntentClassifier] Fallback to default intent:", error);
    return {
      intent: "search",
      entities: {
        type: "unknown",
        name: message,
      },
      confidence: 0.5,
    };
  }
}

/**
 * Phân loại intent với logging
 */
export async function classifyIntentWithLog(
  message: string,
  sessionId: string
): Promise<IntentResult> {
  const startTime = Date.now();
  const result = await classifyIntent(message);

  if (getConfig().agent.debug) {
    console.log(`[IntentClassifier] Session: ${sessionId}, Intent: ${result.intent}, Confidence: ${result.confidence}, Time: ${Date.now() - startTime}ms`);
  }

  return result;
}

/**
 * Phân loại nhiều intent cùng lúc (batch)
 */
export async function classifyIntents(
  messages: string[]
): Promise<IntentResult[]> {
  return Promise.all(messages.map((msg) => classifyIntent(msg)));
}
