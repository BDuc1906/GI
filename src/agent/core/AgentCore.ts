// src/agent/core/AgentCore.ts
/**
 * AgentCore - Lõi AI Agent
 * Flow: Perceive (classify intent) → Think (chọn tool phù hợp) → Act
 * (LLM tự gọi tool trong tập đã giới hạn) → Learn (lưu memory)
 */

import { streamText, generateText, type CoreMessage } from "ai";
import { createLLMClient, getCurrentModel } from "./llm-client";
import { getSystemPrompt } from "./prompts";
import { AgentMemory } from "./memory";
import { ToolRegistry } from "./ToolRegistry";
import { classifyIntent } from "./intent-classifier";
import type { IntentResult } from "./schemas";
import { getConfig, validateConfig } from "./config";
import { telemetry } from "../utils/telemetry";
import type { AuthenticatedUser } from "../utils/auth";
import type { ToolContext } from "../tools/base.tool";

export interface AgentOptions {
  sessionId: string;
  user: AuthenticatedUser;
  maxSteps?: number;
  useDb?: boolean;
  debug?: boolean;
}

export class AgentCore {
  private sessionId: string;
  private user: AuthenticatedUser;
  private memory: AgentMemory;
  private toolRegistry: ToolRegistry;
  private maxSteps: number;
  private debug: boolean;

  constructor(options: AgentOptions) {
    // Fail sớm với thông báo rõ ràng thay vì để lỗi mơ hồ xảy ra giữa
    // chừng lúc gọi LLM (vd "OPENAI_API_KEY is not defined" không kèm
    // ngữ cảnh gì) — xem config.ts::validateConfig.
    const configErrors = validateConfig();
    if (configErrors.length > 0) {
      throw new Error(`Cấu hình AI Agent chưa hợp lệ: ${configErrors.join("; ")}`);
    }

    this.sessionId = options.sessionId;
    this.user = options.user;
    this.memory = new AgentMemory(options.sessionId, options.useDb);
    this.toolRegistry = new ToolRegistry();
    this.maxSteps = options.maxSteps || getConfig().agent.maxSteps;
    this.debug = options.debug || getConfig().agent.debug;
  }

  private get toolContext(): ToolContext {
    return { sessionId: this.sessionId, userId: this.user.id, userRole: this.user.role };
  }

  /**
   * Chọn tập tool LLM được phép tự gọi, dựa trên intent đã phân loại.
   * Thay cho `buildPlan()` cũ — bản cũ TÍNH RA 1 "plan" (danh sách tool
   * dự kiến gọi) nhưng KHÔNG DÙNG plan đó ở đâu cả, khiến bước
   * classifyIntent tốn 1 lệnh gọi LLM riêng (tiền + latency) mà không
   * ảnh hưởng hành vi thật — hành vi thật hoàn toàn do LLM tự quyết
   * qua tool-calling. Giờ intent được DÙNG THẬT: giới hạn đúng tập tool
   * phù hợp, vừa giảm rủi ro LLM gọi nhầm tool ngoài ý định người dùng,
   * vừa giảm token phải mô tả tool không liên quan.
   *
   * Chỉ áp dụng cho tool "public"/"user" — tool "admin" (fixData,
   * syncData) KHÔNG BAO GIỜ nằm trong danh sách LLM tự gọi, kể cả khi
   * intent là "fix"/"sync" và user thật sự là admin: hành động ghi đè
   * DB nên đi qua endpoint admin tường minh (/api/admin/fix,
   * /api/admin/sync), có xác nhận rõ ràng, không để LLM tự quyết định
   * "gọi luôn" giữa 1 đoạn hội thoại tự nhiên.
   */
  private buildToolSubset(intent: IntentResult): string[] | undefined {
    switch (intent.intent) {
      case "search":
        return ["searchData"];
      case "compare":
        return ["fetchLiveData", "compareData"];
      case "audit":
        return ["getAuditLogs"];
      case "explain":
        return []; // LLM tự trả lời bằng kiến thức có sẵn, không cần tool
      case "fix":
      case "sync":
        // Không có tool "public"/"user" nào phù hợp — trả mảng rỗng,
        // system prompt sẽ hướng dẫn LLM báo người dùng dùng trang
        // /admin thay vì cố gọi tool không tồn tại trong tập được cấp.
        return [];
      default:
        return undefined; // không phân loại được → để LLM có toàn bộ tool public/user
    }
  }

  private async buildRequestParts(userMessage: string): Promise<{
    systemPrompt: string;
    history: CoreMessage[];
    tools: Record<string, any>;
    intent: IntentResult;
  }> {
    const intent = await classifyIntent(userMessage);
    if (this.debug) console.log("[Agent] Intent:", intent);

    await this.memory.addMessage({ role: "user", content: userMessage });

    const allowedTools = this.buildToolSubset(intent);
    const tools = this.toolRegistry.getAITools(this.toolContext, allowedTools);

    const history = (await this.memory.getContext()) as unknown as CoreMessage[];

    const systemPrompt = getSystemPrompt({
      userName: this.user.email || "Người dùng",
      userId: this.user.id,
      sessionId: this.sessionId,
      tools: this.toolRegistry.listDescriptions(),
    });

    return { systemPrompt, history, tools, intent };
  }

  /**
   * Xử lý tin nhắn và trả về stream (định dạng AI SDK data stream —
   * dùng trực tiếp làm body Response, hoặc chuyển qua
   * utils/stream.ts::aiStreamToSSE nếu cần format SSE tuỳ biến).
   */
  async processStream(userMessage: string): Promise<ReadableStream<Uint8Array>> {
    const startTime = Date.now();
    const { systemPrompt, history, tools } = await this.buildRequestParts(userMessage);
    const llm = createLLMClient();

    const result = streamText({
      model: llm,
      system: systemPrompt,
      messages: [...history, { role: "user", content: userMessage }],
      tools,
      maxSteps: this.maxSteps,
      onStepFinish: async (step) => {
        if (step.toolResults) {
          for (const tr of step.toolResults) {
            await this.memory.addMessage({
              role: "tool",
              content: JSON.stringify(tr.result),
              toolCallId: tr.toolCallId,
            });
          }
        }
        if (step.text) {
          await this.memory.addMessage({ role: "assistant", content: step.text });
        }

        telemetry.trackStep({
          sessionId: this.sessionId,
          userId: this.user.id,
          step,
          durationMs: Date.now() - startTime,
        });
      },
    });

    return result.toDataStreamResponse().body!;
  }

  /**
   * Xử lý tin nhắn và trả về text (không stream) — dùng generateText
   * trực tiếp thay vì tự parse lại stream (BẢN CŨ đọc stream và tìm
   * dòng `data: {type, text}` — sai định dạng thật của AI SDK data
   * stream (thực tế là các dòng `0:"..."`, `9:{...}` — xem
   * utils/stream.ts::aiStreamToSSE), nên fullText luôn rỗng). Dùng
   * generateText tránh toàn bộ lớp parse dễ lệch này.
   */
  async process(userMessage: string): Promise<string> {
    const { systemPrompt, history, tools } = await this.buildRequestParts(userMessage);
    const llm = createLLMClient();

    const { text } = await generateText({
      model: llm,
      system: systemPrompt,
      messages: [...history, { role: "user", content: userMessage }],
      tools,
      maxSteps: this.maxSteps,
    });

    await this.memory.addMessage({ role: "assistant", content: text });
    return text;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getUser(): AuthenticatedUser {
    return this.user;
  }
}
