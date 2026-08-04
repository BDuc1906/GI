import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { fail, ok } from "@/lib/api/response";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * GET /api/health?counts=true
 *
 * Kiểm tra kết nối DB thật (SELECT 1) thay vì chỉ trả 200 tĩnh — mục đích
 * chính của health check là phát hiện DB down trước khi user gặp lỗi, một
 * response tĩnh không bao giờ báo được điều đó.
 *
 * `?counts=true` là opt-in: gọi thêm COUNT(*) trên cả 5 bảng dữ liệu (bọc
 * trong 1 transaction) để lộ ra kiểu lỗi "seed chạy xong nhưng bảng vẫn
 * rỗng" (xem CHANGELOG.md — case sideIconUrl từng khiến Character seed
 * được đúng 0 dòng) mà không cần đăng nhập DB thủ công để kiểm tra.
 *
 * Mặc định KHÔNG chạy các COUNT(*) này — endpoint không bị rate limit vì
 * dùng cho service monitoring gọi liên tục (mỗi 10-30s), nên phần mặc định
 * phải rẻ nhất có thể (chỉ SELECT 1). Chỉ bật `counts=true` khi chủ động
 * kiểm tra sau seed/deploy, không dùng làm health check tự động định kỳ.
 */
export async function GET(req: NextRequest) {
  const startedAt = Date.now();
  const wantCounts = new URL(req.url).searchParams.get("counts") === "true";

  try {
    await prisma.$queryRaw`SELECT 1`;

    if (!wantCounts) {
      return ok(
        { status: "ok", latencyMs: Date.now() - startedAt },
        { noCache: true }
      );
    }

    const [characters, weapons, artifacts, materials, domains] =
      await prisma.$transaction([
        prisma.character.count(),
        prisma.weapon.count(),
        prisma.artifactSet.count(),
        prisma.material.count(),
        prisma.domain.count(),
      ]);

    return ok(
      {
        status: "ok",
        latencyMs: Date.now() - startedAt,
        counts: { characters, weapons, artifacts, materials, domains },
      },
      { noCache: true }
    );
  } catch (err) {
    console.error("[API] Health check failed:", err);
    return fail(503, "DATABASE_UNAVAILABLE", "Không thể kết nối cơ sở dữ liệu");
  }
}