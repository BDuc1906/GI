// src/hooks/useAgent.ts
import { useState, useCallback, useRef } from "react";
import type { StreamChunk, ToolCallData, ToolResultData } from "@/agent/utils/stream";

export interface AgentMessage {
  role: "user" | "assistant" | "tool";
  content: string;
  toolInvocations?: ToolInvocation[];
}

export interface ToolInvocation {
  id: string;
  tool: string;
  status: "pending" | "running" | "done" | "error";
  // Tham số/kết quả khác nhau tuỳ tool (6 tool, 6 hình dạng khác nhau)
  // — `unknown` là kiểu trung thực ở đây, UI (ChatWidget.tsx) chỉ hiển
  // thị tên tool + trạng thái, không đọc field cụ thể bên trong.
  params: unknown;
  result?: unknown;
  error?: string;
}

export interface UseAgentOptions {
  sessionId?: string;
  onMessage?: (message: AgentMessage) => void;
  onToolInvocation?: (invocation: ToolInvocation) => void;
  onError?: (error: Error) => void;
}

export interface UseAgentReturn {
  messages: AgentMessage[];
  isLoading: boolean;
  error: Error | null;
  sessionId: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  stop: () => void;
}

/**
 * Hook giao tiếp với AI Agent
 * Hỗ trợ streaming response và tool invocations
 *
 * VÁ LỖI (2 chỗ, cả 2 đều ở nhánh xử lý tool call — không ảnh hưởng
 * text trả lời, chỉ ảnh hưởng phần hiển thị "AI đang tra cứu..."):
 *
 * 1. Trước đây chờ `parsed.type === "tool"`, nhưng
 *    `src/agent/utils/stream.ts::aiStreamToSSE` thực tế gửi
 *    `type: "tool-call"` (đúng theo `StreamChunk` interface đã khai
 *    báo sẵn) và `type: "tool-result"` (mới thêm, xử lý phần "a:" của
 *    AI SDK protocol mà bản gốc bỏ sót hoàn toàn) — tên không khớp
 *    nên nhánh này trước đây KHÔNG BAO GIỜ chạy.
 * 2. Trước đây đọc field phẳng `parsed.tool`, `parsed.params`,
 *    `parsed.status`, `parsed.result`, `parsed.id` — nhưng payload
 *    thật nằm trong `parsed.data` với tên field của chính AI SDK
 *    (`toolCallId`, `toolName`, `args`), không phải các tên tự đặt đó.
 *    Sửa lại đọc đúng `parsed.data.*`, và khớp tool-call ↔ tool-result
 *    với nhau qua `toolCallId` để cùng 1 invocation chuyển đúng trạng
 *    thái running → done/error thay vì tạo 2 invocation rời rạc.
 */
export function useAgent(options: UseAgentOptions = {}): UseAgentReturn {
  const [messages, setMessages] = useState<AgentMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(options.sessionId || null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const { onMessage, onToolInvocation, onError } = options;

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      // Tạo tin nhắn user
      const userMessage: AgentMessage = { role: "user", content: content.trim() };
      setMessages((prev) => [...prev, userMessage]);
      onMessage?.(userMessage);

      setIsLoading(true);
      setError(null);

      // Tạo AbortController để có thể hủy request
      abortControllerRef.current = new AbortController();

      function upsertToolInvocation(invocation: ToolInvocation) {
        onToolInvocation?.(invocation);
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          const lastMsg = newMessages[lastIndex];
          if (lastMsg?.role !== "assistant") return prev;

          const tools = lastMsg.toolInvocations ? [...lastMsg.toolInvocations] : [];
          const existingIndex = tools.findIndex((t) => t.id === invocation.id);
          if (existingIndex >= 0) {
            // Đã có (vd tool-call trước đó) — merge để giữ status/result mới nhất
            tools[existingIndex] = { ...tools[existingIndex], ...invocation };
          } else {
            tools.push(invocation);
          }
          newMessages[lastIndex] = { ...lastMsg, toolInvocations: tools };
          return newMessages;
        });
      }

      try {
        const response = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content.trim(),
            sessionId,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }

        // Lấy sessionId từ header
        const newSessionId = response.headers.get("X-Session-Id");
        if (newSessionId) {
          setSessionId(newSessionId);
        }

        // Đọc streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("Response body is not readable");
        }

        const decoder = new TextDecoder();
        let assistantContent = "";
        let assistantMessage: AgentMessage = { role: "assistant", content: "" };
        // Đảm bảo có 1 message assistant trong mảng NGAY từ đầu, kể cả
        // khi chunk đầu tiên nhận được là tool-call chứ không phải
        // text — nếu không, upsertToolInvocation() ở trên sẽ không tìm
        // thấy message assistant nào để gắn tool invocation vào.
        setMessages((prev) => [...prev, assistantMessage]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter((line) => line.trim());

          for (const line of lines) {
            // Xử lý dữ liệu stream từ server
            // Mặc định: giả định server gửi plain text hoặc JSON lines
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                // Type-only import từ stream.ts (server) — an toàn qua
                // ranh giới client/server vì import kiểu bị xoá hết lúc
                // build, không kéo theo code server nào cả.
                const parsed = JSON.parse(data) as StreamChunk;

                if (parsed.type === "text") {
                  assistantContent += parsed.content ?? "";
                  assistantMessage = { ...assistantMessage, content: assistantContent };
                  setMessages((prev) => {
                    const newMessages = [...prev];
                    const lastIndex = newMessages.length - 1;
                    if (newMessages[lastIndex]?.role === "assistant") {
                      newMessages[lastIndex] = { ...newMessages[lastIndex], content: assistantContent };
                    } else {
                      newMessages.push(assistantMessage);
                    }
                    return newMessages;
                  });
                  onMessage?.(assistantMessage);
                } else if (parsed.type === "tool-call") {
                  // Payload thật của AI SDK: { toolCallId, toolName, args }
                  const d = parsed.data as ToolCallData | undefined;
                  upsertToolInvocation({
                    id: d?.toolCallId || crypto.randomUUID(),
                    tool: d?.toolName || "unknown",
                    status: "running",
                    params: d?.args ?? {},
                  });
                } else if (parsed.type === "tool-result") {
                  // Payload thật của AI SDK: { toolCallId, result }
                  const d = parsed.data as ToolResultData | undefined;
                  // `result` có hình dạng khác nhau tuỳ tool — chỉ tool
                  // nào lỗi mới có field `error` bên trong (xem
                  // BaseTool.execute() trả `{ error: result.error }` khi
                  // thất bại), nên phải kiểm tra kiểu trước khi đọc.
                  const resultObj =
                    d?.result && typeof d.result === "object" ? (d.result as { error?: string }) : undefined;
                  upsertToolInvocation({
                    id: d?.toolCallId ?? "",
                    tool: "", // merge với invocation cũ đã có tool name, không cần lặp lại
                    status: resultObj?.error ? "error" : "done",
                    params: {},
                    result: d?.result,
                    error: resultObj?.error,
                  });
                } else if (parsed.type === "error") {
                  throw new Error(parsed.content || "Lỗi không xác định từ agent");
                }
              } catch (parseErr) {
                if (parseErr instanceof Error && parseErr.message.startsWith("Lỗi")) throw parseErr;
                // Nếu không parse được JSON, coi là plain text
                assistantContent += data;
                assistantMessage = { ...assistantMessage, content: assistantContent };
                setMessages((prev) => {
                  const newMessages = [...prev];
                  const lastIndex = newMessages.length - 1;
                  if (newMessages[lastIndex]?.role === "assistant") {
                    newMessages[lastIndex] = { ...newMessages[lastIndex], content: assistantContent };
                  } else {
                    newMessages.push(assistantMessage);
                  }
                  return newMessages;
                });
                onMessage?.(assistantMessage);
              }
            }
          }
        }
      } catch (err) {
        // Xử lý lỗi
        const errorObj = err instanceof Error ? err : new Error(String(err));
        if (errorObj.name !== "AbortError") {
          setError(errorObj);
          onError?.(errorObj);
          const errorMessage: AgentMessage = {
            role: "assistant",
            content: `❌ Lỗi: ${errorObj.message}`,
          };
          setMessages((prev) => [...prev, errorMessage]);
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [isLoading, sessionId, onMessage, onToolInvocation, onError]
  );

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sessionId,
    sendMessage,
    clearMessages,
    stop,
  };
}
