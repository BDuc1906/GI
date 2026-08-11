// src/agent/utils/telemetry.ts
/**
 * Telemetry - Theo dõi token, latency, chi phí
 * Tích hợp với LangSmith, Honeycomb hoặc custom logger
 */

import { getConfig } from "../core/config";

export interface TelemetryData {
  sessionId: string;
  userId: string;
  model: string;
  tokensUsed?: {
    prompt?: number;
    completion?: number;
    total?: number;
  };
  latencyMs?: number;
  cost?: number;
  toolCalls?: number;
  success: boolean;
  error?: string;
}

export interface StepTelemetryData {
  sessionId: string;
  userId: string;
  step: any;
  durationMs: number;
}

class Telemetry {
  private enabled: boolean;

  constructor() {
    this.enabled = getConfig().telemetry.enabled;
  }

  /**
   * Track một step của agent
   */
  async trackStep(data: StepTelemetryData): Promise<void> {
    if (!this.enabled) return;

    try {
      // Log ra console trong debug mode
      if (getConfig().agent.debug) {
        console.log("[Telemetry] Step:", {
          sessionId: data.sessionId,
          userId: data.userId,
          durationMs: data.durationMs,
          toolCalls: data.step.toolResults?.length || 0,
        });
      }

      // TODO: Tích hợp với LangSmith
      if (process.env.LANGSMITH_API_KEY) {
        // await this.sendToLangSmith(data);
      }

      // TODO: Tích hợp với Honeycomb
      if (process.env.HONEYCOMB_API_KEY) {
        // await this.sendToHoneycomb(data);
      }

      // Lưu vào database nếu cần
      // await this.saveToDatabase(data);
    } catch (error) {
      console.warn("[Telemetry] Failed to track step:", error);
    }
  }

  /**
   * Track toàn bộ session
   */
  async trackSession(data: TelemetryData): Promise<void> {
    if (!this.enabled) return;

    try {
      if (getConfig().agent.debug) {
        console.log("[Telemetry] Session:", {
          sessionId: data.sessionId,
          userId: data.userId,
          model: data.model,
          tokens: data.tokensUsed,
          latencyMs: data.latencyMs,
          cost: data.cost,
          success: data.success,
        });
      }
    } catch (error) {
      console.warn("[Telemetry] Failed to track session:", error);
    }
  }

  /**
   * Tính chi phí dựa trên số token
   * Giá tham khảo (có thể thay đổi theo thời gian)
   */
  calculateCost(model: string, promptTokens: number, completionTokens: number): number {
    const rates: Record<string, { prompt: number; completion: number }> = {
      "gpt-4o": { prompt: 0.000005, completion: 0.000015 },
      "gpt-4-turbo": { prompt: 0.00001, completion: 0.00003 },
      "gpt-3.5-turbo": { prompt: 0.0000005, completion: 0.0000015 },
      "claude-3-opus": { prompt: 0.000015, completion: 0.000075 },
      "claude-3-sonnet": { prompt: 0.000003, completion: 0.000015 },
      "gemini-1.5-pro": { prompt: 0.0000025, completion: 0.0000075 },
    };

    const key = Object.keys(rates).find((k) => model.includes(k));
    if (!key) return 0;

    const rate = rates[key];
    return promptTokens * rate.prompt + completionTokens * rate.completion;
  }

  /**
   * Đếm token (ước lượng nếu không có từ API)
   */
  estimateTokens(text: string): number {
    // Ước lượng: 1 token ~ 4 ký tự tiếng Anh, 1.5 ký tự tiếng Việt
    return Math.ceil(text.length / 2.5);
  }
}

export const telemetry = new Telemetry();
