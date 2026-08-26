
// src/agent/utils/db-memory.ts
/**
 * DB Memory - Lưu chat history vào PostgreSQL qua model AgentSession
 * (xem model AgentSession trong prisma/schema.prisma, mục "AI Agent:
 * bộ nhớ hội thoại").
 *
 * SỰ CỐ ĐÃ XẢY RA (2026-08-11 → 2026-08-12): migration
 * 20260811015049_add_agent_tables đã DROP bảng AgentSession/AuditLog mà
 * không đồng bộ lại schema.prisma, khiến toàn bộ class này throw lỗi
 * runtime (bắt được nhờ catch/fallback bên dưới, nên KHÔNG sập app,
 * nhưng chat memory coi như không hoạt động — im lặng). Đã khôi phục ở
 * migration 20260812060000_restore_agent_tables. Xem
 * tests/agent/schema-integrity.test.ts — test này bắt buộc phải pass để
 * đảm bảo lỗi kiểu này không tái diễn mà không ai biết.
 *
 * VÁ 0% ANY: cột `messages`/`metadata` trong Prisma là kiểu `Json`,
 * SDK yêu cầu `Prisma.InputJsonValue` khi ghi — ép qua `unknown` trước
 * (không phải `any`) vì `ChatMessage[]`/`Record<string, unknown>`
 * không có index signature khớp thẳng với union `InputJsonValue`.
 */

import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@prisma/client";
import type { ChatMessage } from "../core/schemas";

export interface SessionData {
  id: string;
  userId: string | null;
  messages: ChatMessage[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

function toChatMessages(json: Prisma.JsonValue): ChatMessage[] {
  return (json as unknown as ChatMessage[]) ?? [];
}

function toMetadata(json: Prisma.JsonValue): Record<string, unknown> {
  return (json as unknown as Record<string, unknown>) ?? {};
}

function toJsonInput(value: ChatMessage[] | Record<string, unknown>): Prisma.InputJsonValue {
  return value as unknown as Prisma.InputJsonValue;
}

export class DbMemory {
  async getOrCreateSession(sessionId: string, userId?: string): Promise<SessionData> {
    try {
      const session = await prisma.agentSession.upsert({
        where: { id: sessionId },
        update: {},
        create: { id: sessionId, userId: userId || null, messages: [], metadata: {} },
      });

      return {
        id: session.id,
        userId: session.userId,
        messages: toChatMessages(session.messages),
        metadata: toMetadata(session.metadata),
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      };
    } catch (error) {
      console.warn("[DbMemory] Database error, using in-memory fallback:", error);
      return { id: sessionId, userId: userId || null, messages: [], metadata: {}, createdAt: new Date(), updatedAt: new Date() };
    }
  }

  /**
   * Thêm message vào session — dùng upsert thay vì find-then-update
   * (tránh lỗi "Session not found" nếu addMessage được gọi trước khi
   * có ai gọi getOrCreateSession).
   */
  async addMessage(sessionId: string, message: ChatMessage): Promise<void> {
    try {
      const existing = await prisma.agentSession.findUnique({ where: { id: sessionId } });
      const messages = [...(existing ? toChatMessages(existing.messages) : []), message];

      await prisma.agentSession.upsert({
        where: { id: sessionId },
        update: { messages: toJsonInput(messages), updatedAt: new Date() },
        create: { id: sessionId, messages: toJsonInput(messages) },
      });
    } catch (error) {
      console.warn("[DbMemory] Failed to add message:", error);
    }
  }

  async getHistory(sessionId: string): Promise<ChatMessage[]> {
    try {
      const session = await prisma.agentSession.findUnique({ where: { id: sessionId } });
      return session ? toChatMessages(session.messages) : [];
    } catch (error) {
      console.warn("[DbMemory] Failed to get history:", error);
      return [];
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await prisma.agentSession.delete({ where: { id: sessionId } });
    } catch (error) {
      console.warn("[DbMemory] Failed to delete session:", error);
    }
  }

  async summarizeIfLong(sessionId: string, maxMessages: number = 10): Promise<void> {
    try {
      const session = await prisma.agentSession.findUnique({ where: { id: sessionId } });
      if (!session) return;

      const messages = toChatMessages(session.messages);
      if (messages.length <= maxMessages) return;

      const kept = messages.slice(-maxMessages);
      await prisma.agentSession.update({
        where: { id: sessionId },
        data: {
          messages: toJsonInput(kept),
          metadata: toJsonInput({
            ...toMetadata(session.metadata),
            summarized: true,
            originalLength: messages.length,
            summarizedAt: new Date().toISOString(),
          }),
        },
      });
    } catch (error) {
      console.warn("[DbMemory] Failed to summarize:", error);
    }
  }
}

export const dbMemory = new DbMemory();
