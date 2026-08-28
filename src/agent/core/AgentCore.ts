// src/agent/core/AgentCore.ts
/**
 * AgentCore - Lõi AI Agent
 * Flow: Perceive (classify intent) → Think (chọn tool phù hợp) → Act
 * (LLM tự gọi tool trong tập đã giới hạn) → Learn (lưu memory)
 *
 * NÂNG CẤP AI SDK v3 -> v6 (2026-08) — các thay đổi so với bản gốc:
 * - `CoreMessage` (v3/v4) đã bị xoá hẳn ở v6 -> dùng `ModelMessage`.
 * - `maxSteps` (số) đã bị xoá khỏi streamText/generateText từ v5 ->
 *   dùng `stopWhen: stepCountIs(n)` (SDK export tên này, KHÔNG phải
 *   `isStepCount` — tsc đã báo rõ "Did you mean 'stepCountIs'?").
 * - `step.toolResults[].result` đổi tên thành `.output` (nhất quán với
 *   tool-call dùng `.input` thay vì `.args`).
 * - `result.toDataStreamResponse()` không còn tồn tại từ v5. THAY VÌ
 *   chuyển sang `toUIMessageStreamResponse()` rồi tự parse lại đúng
 *   format SSE mới (dễ vỡ y hệt lỗi cũ nếu SDK đổi format lần nữa),
 *   ở đây đọc THẲNG `result.fullStream` — một AsyncIterable có type
 *   rõ ràng do chính SDK cung cấp, không phải "đoán format dây" nữa.
 *   Xem `toStreamChunks()` bên dưới và `utils/stream.ts::createStream`.
 * - `toStreamChunks()` (hàm generator LỒNG BÊN TRONG `processStream()`,
 *   không phải method riêng của class) đọc thẳng `result.fullStream` mà
 *   KHÔNG annotate type nào cho tham số `result` cả — nó lấy `result` từ
 *   closure của chính `processStream()`, nơi TypeScript đã tự suy luận
 *   đúng, đầy đủ kiểu cụ thể (không phải kiểu hẹp nhất do generic chưa
 *   gọi) ngay từ lời gọi `streamText({...})` phía trên. Cách này né
 *   HẲN việc phải viết ra kiểu `StreamTextResult<TOOLS, ...>` bằng tay
 *   (bản trước từng thử `unknown`/`never` cho tham số Output đều không
 *   thoả ràng buộc `Output<any, any, any>` của SDK, phải dùng `any`) —
 *   không viết type đó ra thì không cần lo nó là gì.
 */

import {
  streamText,
  generateText,
  stepCountIs,
  type ModelMessage,
  type ToolSet,
} from "ai";
import { createLLMClient } from "./llm-client";
import { getSystemPrompt } from "./prompts";
import { AgentMemory } from "./memory";
import { ToolRegistry } from "./ToolRegistry";
import { classifyIntent } from "./intent-classifier";
import type { IntentResult } from "./schemas";
import { getConfig, validateConfig } from "./config";
import { telemetry } from "../utils/telemetry";
import type { AuthenticatedUser } from "../utils/auth";
import type { ToolContext } from "../tools/base.tool";
import { createStream, type StreamChunk } from "../utils/stream";

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
    history: ModelMessage[];
    tools: ToolSet;
    intent: IntentResult;
  }> {
    const intent = await classifyIntent(userMessage);
    if (this.debug) console.log("[Agent] Intent:", intent);

    await this.memory.addMessage({ role: "user", content: userMessage });

    const allowedTools = this.buildToolSubset(intent);
    const tools = this.toolRegistry.getAITools(this.toolContext, allowedTools);

    const history = (await this.memory.getContext()) as unknown as ModelMessage[];

    const systemPrompt = getSystemPrompt({
      userName: this.user.email || "Người dùng",
      userId: this.user.id,
      sessionId: this.sessionId,
      tools: this.toolRegistry.listDescriptions(),
    });

    return { systemPrompt, history, tools, intent };
  }

  /**
   * Xử lý tin nhắn và trả về stream ở đúng format `StreamChunk` nội bộ
   * (utils/stream.ts) — route.ts (`/api/agent`) dùng thẳng kết quả này
   * làm body Response, `useAgent.ts` phía client đọc thẳng, không cần
   * qua bước chuyển đổi nào khác.
   */
  async processStream(userMessage: string): Promise<ReadableStream<Uint8Array>> {
    const startTime = Date.now();
    const { systemPrompt, history, tools } = await this.buildRequestParts(userMessage);
    const llm = await createLLMClient();

    const result = streamText({
      model: llm,
      system: systemPrompt,
      messages: [...history, { role: "user", content: userMessage }],
      tools,
      stopWhen: stepCountIs(this.maxSteps),
      onStepFinish: async (step) => {
        for (const tr of step.toolResults) {
          await this.memory.addMessage({
            role: "tool",
            content: JSON.stringify(tr.output),
            toolCallId: tr.toolCallId,
          });
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

    // Đọc thẳng result.fullStream ngay tại đây (không tách hàm riêng,
    // không annotate type) — xem lý do ở comment đầu file.
    async function* toStreamChunks(): AsyncGenerator<StreamChunk> {
      for await (const part of result.fullStream) {
        switch (part.type) {
          case "text-delta":
            yield { type: "text", content: part.text };
            break;
          case "tool-call":
            yield {
              type: "tool-call",
              data: { toolCallId: part.toolCallId, toolName: part.toolName, args: part.input },
            };
            break;
          case "tool-result":
            yield {
              type: "tool-result",
              data: { toolCallId: part.toolCallId, result: part.output },
            };
            break;
          case "error":
            yield { type: "error", content: String(part.error) };
            break;
          default:
            // các type khác (start/finish/reasoning-*/source/tool-input-*...)
            // bỏ qua có chủ đích — useAgent.ts hiện tại không đọc chúng
            break;
        }
      }
    }

    return createStream(toStreamChunks());
  }

  /**
   * Xử lý tin nhắn và trả về text (không stream) — dùng generateText
   * trực tiếp.
   */
  async process(userMessage: string): Promise<string> {
    const { systemPrompt, history, tools } = await this.buildRequestParts(userMessage);
    const llm = await createLLMClient();

    const { text } = await generateText({
      model: llm,
      system: systemPrompt,
      messages: [...history, { role: "user", content: userMessage }],
      tools,
      stopWhen: stepCountIs(this.maxSteps),
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
