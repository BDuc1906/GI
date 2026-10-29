// src/components/ChatWidget.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useAgent } from "@/agent/utils/useAgent";

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
  const t = useTranslations("ChatWidget");
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  function toolLabel(tool: string): string {
    switch (tool) {
      case "searchData":
        return t("toolSearchingData");
      case "fetchLiveData":
        return t("toolFetchingLiveData");
      case "compareData":
        return t("toolComparingData");
      case "getAuditLogs":
        return t("toolFetchingHistory");
      default:
        return tool ? t("toolRunningNamed", { tool }) : t("toolProcessing");
    }
  }

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
        <div className="mb-3 w-[360px] max-w-[calc(100vw-1.5rem)] h-[480px] max-h-[75vh] bg-bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-[var(--bg-bg-secondary)]">
            <div>
              <h2 className="text-sm font-semibold text-gold-bright">LEIBO Agent</h2>
              <p className="text-[11px] text-text-muted">{t("subtitle")}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label={t("closeChat")}
              className="text-text-muted hover:text-text-primary text-xl leading-none px-1.5 py-0.5 rounded-lg hover:bg-bg-elevated transition-colors"
            >
              ×
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <p className="text-sm text-text-muted text-center mt-8">{t("emptyStateHint")}</p>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${
                    msg.role === "user"
                      ? "bg-gold text-[var(--text-text-inverted)]"
                      : "bg-[var(--bg-bg-secondary)] text-text-primary border border-border"
                  }`}
                >
                  {msg.content || (isLoading && i === messages.length - 1 ? "…" : "")}
                  {msg.toolInvocations && msg.toolInvocations.length > 0 && (
                    <div className="mt-2 space-y-1 border-t border-border/50 pt-2">
                      {msg.toolInvocations.map((tool) => (
                        <div key={tool.id} className="text-[11px] text-text-muted flex items-center gap-1">
                          {tool.status === "running" && <span className="animate-pulse">…</span>}
                          {tool.status === "error" && <span className="text-danger">Lỗi:</span>}
                          <span>{toolLabel(tool.tool)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {error && <p className="text-xs text-danger text-center">{error.message}</p>}
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t border-border flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("inputPlaceholder")}
              disabled={isLoading}
              className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-input)] border border-border text-sm text-text-primary outline-none focus:border-gold/60 disabled:opacity-60"
            />
            {isLoading ? (
              <button
                type="button"
                onClick={stop}
                className="px-3 py-2 rounded-lg border border-border text-sm text-text-secondary hover:border-danger/50 hover:text-danger transition-colors"
              >
                {t("stop")}
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="px-3 py-2 rounded-lg bg-gold text-[var(--text-text-inverted)] text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t("send")}
              </button>
            )}
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t("closeChatWithAgent") : t("openChatWithAgent")}
        className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-accent-600 via-accent-500 to-accent-400 text-bg-primary shadow-xl hover:shadow-accent-500/30 hover:scale-105 active:scale-95 flex items-center justify-center transition-all duration-200 border border-white/20"
      >
        {open ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
