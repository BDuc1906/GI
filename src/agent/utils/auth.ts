// src/agent/utils/auth.ts
/**
 * Authentication — Bảo vệ API routes của AI Agent.
 *
 * Dự án LEIBO KHÔNG có hệ thống đăng nhập người dùng (không NextAuth,
 * không Clerk, không bảng User — xem docs/AUTHENTICATION.md, hiện đang
 * trống vì chưa từng cần). Vì vậy module này KHÔNG giả vờ có multi-user
 * auth: mọi truy cập public đều là "guest" ẩn danh (giống mọi API khác
 * của site), còn "admin" là chính chủ site vận hành (một người), xác
 * thực bằng 1 secret key đặt qua biến môi trường ADMIN_API_KEY — đúng
 * quy mô thật của dự án thay vì dựng thêm 1 hệ auth đầy đủ không ai dùng.
 *
 * TRƯỚC ĐÂY: role admin được cấp chỉ bằng cách so sánh chuỗi cứng
 * "admin-token" — bất kỳ ai gửi đúng cookie đó là thành admin và có
 * quyền sửa/đồng bộ toàn bộ DB qua AI Agent. Đây là lỗ hổng leo quyền
 * nghiêm trọng, đã bỏ hoàn toàn.
 */

import { NextRequest } from "next/server";
import { timingSafeEqual, randomUUID } from "node:crypto";

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role: "user" | "admin";
  sessionId: string;
}

/**
 * So sánh 2 chuỗi bằng thời gian không đổi — tránh timing attack đoán
 * dần từng ký tự của ADMIN_API_KEY qua độ trễ response.
 */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  // Buffer khác độ dài coi như không khớp NGAY, nhưng vẫn phải chạy
  // timingSafeEqual với 2 buffer cùng cỡ để không lộ thông tin độ dài
  // qua nhánh rẽ sớm — so bufA với chính nó, kết quả luôn false do
  // nội dung lệch, nhưng thời gian chạy giống hệt trường hợp khớp độ dài.
  if (bufA.length !== bufB.length) {
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

function sessionIdFrom(req: NextRequest): string {
  return req.headers.get("x-session-id") || randomUUID();
}

/**
 * Lấy user từ request. Không throw — luôn trả về 1 user hợp lệ (public
 * là "guest"), vì toàn bộ dữ liệu tra cứu của site vốn công khai.
 * Quyền admin chỉ được cấp khi header Authorization khớp ADMIN_API_KEY.
 */
export async function getAuthenticatedUser(
  req: NextRequest
): Promise<AuthenticatedUser> {
  const sessionId = sessionIdFrom(req);
  const adminKey = process.env.ADMIN_API_KEY;
  const provided = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (adminKey && provided && safeEqual(provided, adminKey)) {
    return { id: "admin", role: "admin", sessionId };
  }

  return { id: "guest", role: "user", sessionId };
}

/**
 * Middleware kiểm tra quyền admin — dùng cho FixTool, SyncTool,
 * /api/admin/fix, /api/admin/sync.
 */
export async function requireAdmin(req: NextRequest): Promise<AuthenticatedUser> {
  if (!process.env.ADMIN_API_KEY) {
    // Fail closed: chưa cấu hình ADMIN_API_KEY nghĩa là KHÔNG AI được
    // là admin, kể cả khi request gửi đúng header gì đó tình cờ khớp
    // chuỗi rỗng. Khác hẳn hành vi cũ (fallback ngầm sang OpenAI/user
    // thường) — ở đây thà chặn hết còn hơn để lọt 1 trường hợp không
    // lường trước.
    throw new Error("FORBIDDEN: ADMIN_API_KEY chưa được cấu hình trên server");
  }

  const user = await getAuthenticatedUser(req);
  if (user.role !== "admin") {
    throw new Error("FORBIDDEN: Yêu cầu quyền admin (header Authorization: Bearer <ADMIN_API_KEY>)");
  }
  return user;
}
