// src/components/ChatWidget.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useAgent } from "@/agent/utils/useAgent";
import {
  SWARM_PERSONAS,
  SWARM_AGENTS_LIST,
  type SwarmRole,
  parseA2ABlocks,
} from "@/agent/swarm";

const SESSION_STORAGE_KEY = "leibo_chat_session_id";

/**
 * Widget chat nổi LEIBO Multi-Agent Swarm
 * Hỗ trợ chế độ Tác Chiến Liên Minh Agent-to-Agent (A2A) và chế độ Chuyên Gia Đơn Lẻ.
 */
export function ChatWidget() {
  const t = useTranslations("ChatWidget");
  const [open, setOpen] = useState(false);
  const [activeRole, setActiveRole] = useState<SwarmRole>("swarm");
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const isSwarmMode = activeRole === "swarm";
  const currentPersona = isSwarmMode
    ? {
        name: "LEIBO Swarm A2A",
        titleVi: "Hội Chẩn Liên Minh 5 Chuyên Gia",
        badge: "Tác Chiến A2A",
        accentColor: "#f59e0b",
        avatarUrl: "/local-genshin-assets/ui/paimon_hello.png",
        greeting:
          "Chào mừng Nhà Lữ Hành đến với Hội Đồng Tác Chiến LEIBO! 5 Chuyên gia (Paimon, Keqing, Zhongli, Albedo, Yanfei) luôn phối hợp cùng nhau phân chia công việc để đưa ra câu trả lời toàn diện nhất.",
        specialties: [
          "Phân chia nhiệm vụ A2A",
          "Hội chẩn Build & Cơ chế",
          "Tối ưu Nhựa & Nguyên liệu",
          "Kiểm toán Gacha đa chiều",
        ],
      }
    : SWARM_PERSONAS[activeRole];

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

    const rolePrefix = isSwarmMode
      ? "[Chế độ Hội chẩn Liên minh Agent A2A] "
      : `[Vai trò: ${currentPersona.name} - ${currentPersona.titleVi}] `;

    sendMessage(rolePrefix + text, activeRole);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-3 w-[400px] max-w-[calc(100vw-1.5rem)] h-[540px] max-h-[82vh] bg-bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-[var(--bg-bg-secondary)]">
            <div className="flex items-center gap-2.5">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border shrink-0 bg-bg-elevated">
                <Image
                  src={currentPersona.avatarUrl}
                  alt={currentPersona.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm font-bold text-text-primary truncate">{currentPersona.name}</h2>
                  <span
                    className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: `${currentPersona.accentColor}20`, color: currentPersona.accentColor }}
                  >
                    {currentPersona.badge}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted truncate">{currentPersona.titleVi}</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label={t("closeChat")}
              className="text-text-muted hover:text-text-primary text-xl leading-none px-1.5 py-0.5 rounded-lg hover:bg-bg-elevated transition-colors"
            >
              ×
            </button>
          </div>

          {/* Specialist Agent & Swarm Selector Bar */}
          <div className="flex items-center gap-1 px-2.5 py-2 bg-bg-elevated/60 border-b border-border/50 overflow-x-auto no-scrollbar">
            {/* A2A Swarm Mode Option */}
            <button
              type="button"
              onClick={() => setActiveRole("swarm")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                activeRole === "swarm"
                  ? "bg-gradient-to-r from-amber-500/20 via-purple-500/20 to-teal-500/20 border border-amber-500/60 text-accent-bright shadow-sm"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-card/50"
              }`}
            >
              <span className="text-sm">🤝</span>
              <span>Liên Minh A2A</span>
            </button>

            {/* Individual Specialists */}
            {SWARM_AGENTS_LIST.map((agent) => {
              const isSelected = agent.id === activeRole;
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setActiveRole(agent.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                    isSelected
                      ? "bg-bg-card border border-accent-500/60 text-accent-bright shadow-sm"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-card/50"
                  }`}
                >
                  <div className="relative w-4 h-4 rounded-full overflow-hidden shrink-0">
                    <Image src={agent.avatarUrl} alt={agent.name} fill className="object-cover" />
                  </div>
                  <span>{agent.name}</span>
                </button>
              );
            })}
          </div>

          {/* Messages Container */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="mt-4 p-3.5 rounded-xl bg-bg-elevated/70 border border-border/60 text-center space-y-2">
                <div className="relative w-12 h-12 rounded-full overflow-hidden mx-auto border-2 border-accent-500/40">
                  <Image src={currentPersona.avatarUrl} alt={currentPersona.name} fill className="object-cover" />
                </div>
                <p className="text-xs text-text-primary font-medium leading-relaxed">
                  {currentPersona.greeting}
                </p>
                <div className="flex flex-wrap gap-1 justify-center pt-1">
                  {currentPersona.specialties.map((s, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-bg-card text-text-muted border border-border/50">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => {
              const isUser = msg.role === "user";
              const blocks = !isUser && msg.content ? parseA2ABlocks(msg.content) : [];
              const isMultiAgentDeliberation = blocks.length > 1;

              if (isUser) {
                return (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap break-words bg-gold text-[var(--text-text-inverted)]">
                      {msg.content}
                    </div>
                  </div>
                );
              }

              return (
                <div key={i} className="flex justify-start w-full">
                  <div className="w-full max-w-[95%] space-y-2">
                    {isMultiAgentDeliberation ? (
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-1.5 text-[11px] text-accent-bright font-semibold px-1">
                          <span>🤝</span>
                          <span>Phiên Hội Chẩn Liên Minh Agent (A2A Collaboration)</span>
                        </div>
                        {blocks.map((block, bIdx) => (
                          <div
                            key={bIdx}
                            className="rounded-xl p-3 border bg-bg-card/90 space-y-1.5 shadow-sm text-xs transition-all relative"
                            style={{ borderColor: `${block.accentColor}50` }}
                          >
                            <div className="flex items-center justify-between pb-1.5 border-b border-border/50">
                              <div className="flex items-center gap-2">
                                <div className="relative w-5 h-5 rounded-full overflow-hidden border border-border shrink-0 bg-bg-elevated">
                                  <Image
                                    src={block.avatarUrl}
                                    alt={block.speakerName}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                <span className="font-bold text-text-primary">{block.speakerName}</span>
                                <span
                                  className="text-[9px] px-1.5 py-0.2 rounded-full font-semibold"
                                  style={{
                                    backgroundColor: `${block.accentColor}20`,
                                    color: block.accentColor,
                                  }}
                                >
                                  {block.badge}
                                </span>
                              </div>
                              {block.addressedTo && block.addressedTo.length > 0 && (
                                <div className="flex items-center gap-1 text-[10px] text-text-muted">
                                  <span>hội chẩn:</span>
                                  {block.addressedTo.map((target) => (
                                    <span key={target} className="text-accent-bright font-semibold">
                                      @{SWARM_PERSONAS[target]?.name || target}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-text-secondary whitespace-pre-wrap leading-relaxed pt-0.5">
                              {block.content}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="max-w-[90%] rounded-xl px-3 py-2 text-sm whitespace-pre-wrap break-words bg-[var(--bg-bg-secondary)] text-text-primary border border-border">
                        {msg.content || (isLoading && i === messages.length - 1 ? "Đang hội chẩn…" : "")}
                      </div>
                    )}

                    {msg.toolInvocations && msg.toolInvocations.length > 0 && (
                      <div className="mt-2 space-y-1 border-t border-border/50 pt-2 px-1">
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
              );
            })}
            {error && <p className="text-xs text-danger text-center">{error.message}</p>}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-border flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isSwarmMode ? "Hỏi đội ngũ chuyên gia LEIBO cùng phối hợp..." : t("inputPlaceholder")}
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

      {/* Floating Toggle Button */}
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
