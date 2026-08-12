// src/components/ChatWidget.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useAgent } from "@/hooks/useAgent";

const SESSION_STORAGE_KEY = "leibo_chat_session_id";

/**
 * Widget chat nổi (góc dưới-phải) cho người dùng thường — trước đây
 * `src/hooks/useAgent.ts` đã tồn tại và viết đúng, nhưng KHÔNG có
 * component nào dùng nó: AI Agent chỉ truy cập được qua dashboard
 * `/admin` (dành cho admin), người dùng thường không có cách nào chat
 * với agent trên website. Component này lấp đúng chỗ trống đó.
 *
 * Không cần Admin Key — đây là luồng public (permission "public"/"user"
 * ở ToolRegistry), giống hệt cách AgentCore giới hạn tool theo intent
 * đã thiết kế (search/compare/explain), KHÔNG bao giờ chạm tới
 * fixData/syncData (2 tool đó chỉ gọi được qua /admin, xem AgentCore.buildToolSubset).
 */
export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Giữ nguyên sessionId qua các lần tải lại trang trong cùng trình
  // duyệt — để agent nhớ được ngữ cảnh hội thoại trước đó (AgentMemory
  // đọc/ghi theo sessionId, xem src/agent/utils/db-memory.ts).
  const [initialSessionId] = useState<string | undefined>(() => {
    if (typeof window === "undefined") return undefined;
    return window.sessionStorage.getItem(SESSION_STORAGE_KEY) || undefined;
  });

  const { messages, isLoading, error, sessionId, sendMessage, stop } = useAgent({
    sessionId: initialSessionId,
  });

  useEffect(() => {
    if (sessionId) window.sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }, [sessionId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    sendMessage(text);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-3 w-[360px] max-w-[calc(100vw-2rem)] h-[480px] max-h-[70vh] bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-[var(--bg-secondary)]">
            <div>
              <h2 className="text-sm font-semibold text-gold-bright">🤖 LEIBO Agent</h2>
              <p className="text-[11px] text-muted">Hỏi về nhân vật, vũ khí, thánh di vật, phản ứng nguyên tố</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Đóng chat"
              className="text-muted hover:text-primary text-lg leading-none px-1"
            >
              ×
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-muted text-center mt-8">
                Thử hỏi: &quot;Kazuha có nguyên tố gì?&quot; hoặc &quot;Phản ứng Sum Suê là gì?&quot;
              </p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                    msg.role === "user"
                      ? "bg-gold text-[var(--text-inverted)]"
                      : "bg-[var(--bg-secondary)] text-primary border border-border"
                  }`}
                >
                  {msg.content || (isLoading && i === messages.length - 1 ? "…" : "")}
                  {msg.toolInvocations && msg.toolInvocations.length > 0 && (
                    <div className="mt-2 space-y-1 border-t border-border/50 pt-2">
                      {msg.toolInvocations.map((t) => (
                        <div key={t.id} className="text-[11px] text-muted flex items-center gap-1">
                          {t.status === "running" && <span className="animate-pulse">⏳</span>}
                          {t.status === "done" && <span>✅</span>}
                          {t.status === "error" && <span>❌</span>}
                          <span>{toolLabel(t.tool)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {error && <p className="text-xs text-red-400 text-center">⚠️ {error.message}</p>}
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-border flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-border text-sm text-primary outline-none focus:border-gold/60 disabled:opacity-60"
            />
            {isLoading ? (
              <button
                type="button"
                onClick={stop}
                className="px-3 py-2 rounded-lg border border-border text-sm text-secondary hover:border-red-400/50 hover:text-red-400 transition-colors"
              >
                Dừng
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-3 py-2 rounded-lg bg-gold text-[var(--text-inverted)] text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Gửi
              </button>
            )}
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Đóng chat với AI Agent" : "Mở chat với AI Agent"}
        className="w-14 h-14 rounded-full bg-gold hover:bg-gold-bright shadow-xl flex items-center justify-center text-2xl transition-colors"
      >
        {open ? "×" : "🤖"}
      </button>
    </div>
  );
}

function toolLabel(tool: string): string {
  switch (tool) {
    case "searchData":
      return "Đang tìm kiếm dữ liệu...";
    case "fetchLiveData":
      return "Đang lấy dữ liệu live...";
    case "compareData":
      return "Đang so sánh dữ liệu...";
    case "getAuditLogs":
      return "Đang lấy lịch sử...";
    default:
      return tool ? `Đang chạy ${tool}...` : "Đang xử lý...";
  }
}
