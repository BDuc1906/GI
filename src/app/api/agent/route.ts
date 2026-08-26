// src/app/api/agent/route.ts
/**
 * API Route: /api/agent
 * Chat với AI Agent - hỗ trợ streaming
 *
 * NÂNG CẤP AI SDK v3 -> v6 (2026-08): bỏ import/gọi `aiStreamToSSE` —
 * hàm đó đã bị xoá khỏi utils/stream.ts vì `AgentCore.processStream()`
 * giờ tự trả về đúng SSE nội bộ (StreamChunk) rồi, không cần bước
 * "parse lại format dây của AI SDK" ở tầng route nữa.
 */

import { NextRequest } from "next/server";
import { AgentCore } from "@/agent/core/AgentCore";
import { getAuthenticatedUser } from "@/agent/utils/auth";
import { withRateLimit } from "@/lib/api/rate-limit";
import { getConfig } from "@/agent/core/config";
import { fail } from "@/lib/api/response";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handler(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);

    const body = await req.json().catch(() => null);
    if (!body) {
      return fail(400, "INVALID_BODY", "Body phải là JSON hợp lệ");
    }
    const { message, sessionId } = body;

    if (!message || typeof message !== "string") {
      return fail(400, "MISSING_MESSAGE", "Thiếu tin nhắn hoặc tin nhắn không hợp lệ");
    }

    if (message.length > 10000) {
      return fail(400, "MESSAGE_TOO_LONG", "Tin nhắn quá dài (tối đa 10000 ký tự)");
    }

    const agent = new AgentCore({
      sessionId: sessionId || user.sessionId,
      user,
      maxSteps: 5,
      useDb: true,
    });

    const sseStream = await agent.processStream(message);

    return new Response(sseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Session-Id": agent.getSessionId(),
      },
    });
  } catch (error) {
    console.error("[Agent API] Error:", error);
    const errorMsg = error instanceof Error ? error.message : "Lỗi không xác định";
    return fail(500, "AGENT_ERROR", errorMsg);
  }
}

// Bọc rate limit RIÊNG cho route này (bucket "agent", limit thấp hơn
// hẳn API đọc dữ liệu thường — xem agentConfig.rateLimit trong
// core/config.ts) — TRƯỚC ĐÂY route này KHÔNG có bất kỳ giới hạn nào,
// trong khi mỗi request ở đây tốn 1+ lần gọi LLM thật (tiền thật),
// khác hẳn rủi ro của 1 API đọc DB thông thường.
const cfg = getConfig().rateLimit;
export const POST = withRateLimit(handler, { prefix: "agent", limit: cfg.limit, window: cfg.window });

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}
