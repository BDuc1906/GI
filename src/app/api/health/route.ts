import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api/response";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 *
 * Kiểm tra kết nối DB thật (SELECT 1) thay vì chỉ trả 200 tĩnh — mục đích
 * chính của health check là phát hiện DB down trước khi user gặp lỗi, một
 * response tĩnh không bao giờ báo được điều đó.
 */
export async function GET() {
  const startedAt = Date.now();

  try {
    await prisma.$queryRaw`SELECT 1`;
    return ok(
      { status: "ok", latencyMs: Date.now() - startedAt },
      { noCache: true }
    );
  } catch (err) {
    console.error("[API] Health check failed:", err);
    return fail(503, "DATABASE_UNAVAILABLE", "Không thể kết nối cơ sở dữ liệu");
  }
}
