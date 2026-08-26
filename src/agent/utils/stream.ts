// src/agent/utils/stream.ts
/**
 * Stream Utilities - Xử lý streaming response
 * Dùng Server-Sent Events (SSE) để gửi dữ liệu real-time
 *
 * NÂNG CẤP AI SDK v3 -> v6 (2026-08): đã XOÁ `aiStreamToSSE()` — hàm
 * này tự parse tay 3 prefix "0:"/"9:"/"a:" của "AI SDK Data Stream
 * Protocol" (chỉ tồn tại ở v3/v4). Từ v5, `AgentCore.processStream()`
 * không còn trả về stream thô của SDK nữa — nó tự chuyển `fullStream`
 * (typed) sang đúng `StreamChunk` bên dưới rồi mới trả ra
 * (xem AgentCore.ts::toStreamChunks), nên không còn bước "parse lại"
 * nào ở tầng route.ts cần tới hàm này.
 */

// KHÔNG import ReadableStream từ "node:stream/web" — bản gốc import nó
// dưới dạng `type` rồi lại dùng `new ReadableStream(...)` (dùng type
// làm value), lỗi biên dịch thật (TS1361) sẽ bị `tsc --noEmit` chặn
// ngay khi build. `ReadableStream` toàn cục từ lib "dom" (đã khai báo
// trong tsconfig.json) là đúng loại cần dùng ở đây — route Next.js trả
// Web ReadableStream, không phải Node stream.

// Payload thật của StreamChunk cho tool-call/tool-result trong hệ SSE
// NỘI BỘ (do createStream() sinh ra) — không liên quan tới format dây
// nội bộ của AI SDK. `unknown` cho "args"/"result" vì đây là tham số/
// kết quả của TOOL BẤT KỲ (mỗi tool 1 hình dạng khác nhau), phía nhận
// (useAgent.ts) đã tự biết cách xử lý dựa trên `toolName`.
export interface ToolCallData {
  toolCallId: string;
  toolName: string;
  args: unknown;
}

export interface ToolResultData {
  toolCallId: string;
  result: unknown;
}

export interface StreamChunk {
  type: "text" | "tool-call" | "tool-result" | "error" | "done";
  content?: string;
  data?: ToolCallData | ToolResultData;
}

/**
 * Tạo ReadableStream (SSE) từ 1 AsyncGenerator<StreamChunk> bất kỳ.
 * Đây là "cửa ra" duy nhất cho mọi nguồn dữ liệu stream trong agent —
 * AgentCore.toStreamChunks() sinh ra generator, hàm này chỉ lo phần
 * đóng gói SSE (`data: ...\n\n`) + xử lý lỗi, không quan tâm dữ liệu
 * đến từ đâu.
 */
export function createStream(
  generator: AsyncGenerator<StreamChunk>
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of generator) {
          const data = JSON.stringify(chunk);
          controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
        }
        controller.enqueue(new TextEncoder().encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        const errorChunk: StreamChunk = {
          type: "error",
          content: error instanceof Error ? error.message : String(error),
        };
        controller.enqueue(
          new TextEncoder().encode(`data: ${JSON.stringify(errorChunk)}\n\n`)
        );
        controller.close();
      }
    },
  });
}

/**
 * Tạo text stream từ response
 */
export function createTextStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      const words = text.split(" ");
      let index = 0;

      const interval = setInterval(() => {
        if (index < words.length) {
          const chunk: StreamChunk = {
            type: "text",
            content: (index === 0 ? "" : " ") + words[index],
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          index++;
        } else {
          clearInterval(interval);
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      }, 50);
    },
  });
}
