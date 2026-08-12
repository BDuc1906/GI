// src/agent/core/memory.ts
/**
 * Agent Memory - Quản lý bộ nhớ ngắn hạn và dài hạn
 * Kết hợp In-memory (cache) + Database (persistent)
 * Hỗ trợ tóm tắt context khi quá dài
 */

import { type ChatMessage } from "./schemas";
import { dbMemory, type SessionData } from "../utils/db-memory";
import { getConfig } from "./config";

// In-memory cache để giảm DB query
const memoryCache = new Map<string, ChatMessage[]>();
const sessionCache = new Map<string, SessionData>();

export class AgentMemory {
  private sessionId: string;
  private useDb: boolean;
  private maxMessages: number;

  constructor(sessionId: string, useDb: boolean = true) {
    this.sessionId = sessionId;
    this.useDb = useDb && !!process.env.DATABASE_URL;
    this.maxMessages = getConfig().memory.maxMessages;
  }

  /**
   * Lấy toàn bộ lịch sử chat
   */
  async getHistory(): Promise<ChatMessage[]> {
    // 1. Check cache trước
    if (memoryCache.has(this.sessionId)) {
      return memoryCache.get(this.sessionId) || [];
    }

    // 2. Fallback sang DB
    if (this.useDb) {
      const history = await dbMemory.getHistory(this.sessionId);
      // Cache lại
      memoryCache.set(this.sessionId, history);
      return history;
    }

    return [];
  }

  /**
   * Lấy context cho LLM (tối đa maxMessages tin nhắn gần nhất)
   */
  async getContext(maxMessages?: number): Promise<ChatMessage[]> {
    const history = await this.getHistory();
    const limit = maxMessages || this.maxMessages;
    if (history.length <= limit) return history;
    return history.slice(-limit);
  }

  /**
   * Thêm message vào lịch sử
   */
  async addMessage(message: ChatMessage): Promise<void> {
    // 1. Thêm vào cache
    const history = memoryCache.get(this.sessionId) || [];
    history.push(message);
    memoryCache.set(this.sessionId, history);

    // 2. Thêm vào DB
    if (this.useDb) {
      await dbMemory.addMessage(this.sessionId, message);
    }
  }

  /**
   * Lấy session metadata
   */
  async getSession(): Promise<SessionData | null> {
    if (sessionCache.has(this.sessionId)) {
      return sessionCache.get(this.sessionId) || null;
    }

    if (this.useDb) {
      const session = await dbMemory.getOrCreateSession(this.sessionId);
      sessionCache.set(this.sessionId, session);
      return session;
    }

    return null;
  }

  /**
   * Cập nhật metadata của session
   */
  async updateMetadata(metadata: Record<string, unknown>): Promise<void> {
    // Implementation depends on DB schema
    // Tạm thời chỉ lưu cache
    const session = await this.getSession();
    if (session) {
      session.metadata = { ...session.metadata, ...metadata };
      sessionCache.set(this.sessionId, session);
    }
  }

  /**
   * Tóm tắt context nếu quá dài
   */
  async summarizeIfLong(maxMessages?: number): Promise<{ summarized: boolean; originalLength: number }> {
    const limit = maxMessages || this.maxMessages;
    const history = await this.getHistory();

    if (history.length <= limit) {
      return { summarized: false, originalLength: history.length };
    }

    // Giữ lại tin nhắn gần nhất
    const kept = history.slice(-limit);

    // Cập nhật cache
    memoryCache.set(this.sessionId, kept);

    // Cập nhật DB
    if (this.useDb) {
      await dbMemory.summarizeIfLong(this.sessionId, limit);
    }

    return {
      summarized: true,
      originalLength: history.length,
    };
  }

  /**
   * Xóa session
   */
  async clear(): Promise<void> {
    memoryCache.delete(this.sessionId);
    sessionCache.delete(this.sessionId);

    if (this.useDb) {
      await dbMemory.deleteSession(this.sessionId);
    }
  }

  /**
   * Lấy số lượng tin nhắn hiện tại
   */
  async getMessageCount(): Promise<number> {
    const history = await this.getHistory();
    return history.length;
  }

  /**
   * Lấy tin nhắn cuối cùng
   */
  async getLastMessage(): Promise<ChatMessage | null> {
    const history = await this.getHistory();
    return history.length > 0 ? history[history.length - 1] : null;
  }

  /**
   * Lấy tin nhắn theo vai trò
   */
  async getMessagesByRole(role: ChatMessage["role"]): Promise<ChatMessage[]> {
    const history = await this.getHistory();
    return history.filter((m) => m.role === role);
  }
}

// Factory function để tạo memory instance
export function createAgentMemory(sessionId: string): AgentMemory {
  return new AgentMemory(sessionId);
}
