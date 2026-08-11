// src/agent/utils/stream.ts
/**
 * Stream Utilities - Xử lý streaming response
 * Dùng Server-Sent Events (SSE) để gửi dữ liệu real-time
 */

// KHÔNG import ReadableStream từ "node:stream/web" — bản gốc import nó
// dưới dạng `type` rồi lại dùng `new ReadableStream(...)` (dùng type
// làm value), lỗi biên dịch thật (TS1361) sẽ bị `tsc --noEmit` chặn
// ngay khi build. `ReadableStream` toàn cục từ lib "dom" (đã khai báo
// trong tsconfig.json) là đúng loại cần dùng ở đây — route Next.js trả
// Web ReadableStream, không phải Node stream.

export interface StreamChunk {
  type: "text" | "tool-call" | "tool-result" | "error" | "done";
  content?: string;
  data?: any;
}

/**
 * Tạo ReadableStream từ chunks
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
 * Chuyển đổi AI stream thành SSE stream
 *
 * VÁ LỖI: bản gốc chỉ xử lý prefix "0:" (text) và "9:" (tool call) của
 * AI SDK data stream protocol, bỏ sót "a:" (tool RESULT — kết quả sau
 * khi tool chạy xong). Hệ quả: `useAgent.ts` phía client không bao giờ
 * biết 1 tool call đã "done" hay "error", chỉ thấy mãi ở trạng thái
 * "running". Thêm xử lý "a:" để khớp đủ vòng đời tool call ↔ tool
 * result mà `ToolInvocation.status` ở client đã định nghĩa sẵn.
 */
export function aiStreamToSSE(
  aiStream: ReadableStream<Uint8Array>
): ReadableStream<Uint8Array> {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      const reader = aiStream.getReader();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          // Parse AI SDK stream format
          const lines = text.split("\n");
          for (const line of lines) {
            if (line.startsWith("0:")) {
              // text chunk
              const content = line.slice(2);
              const chunk: StreamChunk = { type: "text", content };
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
              );
            } else if (line.startsWith("9:")) {
              // tool call — LƯU Ý: type "tool-call", KHÔNG phải "tool"
              // (useAgent.ts trước đây chờ "tool" — lệch tên, đã sửa ở
              // đó cho khớp với type thật gửi từ đây).
              try {
                const data = JSON.parse(line.slice(2));
                const chunk: StreamChunk = { type: "tool-call", data };
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
                );
              } catch {
                // Bỏ qua
              }
            } else if (line.startsWith("a:")) {
              // tool result — TRƯỚC ĐÂY hoàn toàn bị bỏ qua
              try {
                const data = JSON.parse(line.slice(2));
                const chunk: StreamChunk = { type: "tool-result", data };
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
                );
              } catch {
                // Bỏ qua
              }
            }
          }
        }

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        const errorChunk: StreamChunk = {
          type: "error",
          content: error instanceof Error ? error.message : String(error),
        };
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(errorChunk)}\n\n`)
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
