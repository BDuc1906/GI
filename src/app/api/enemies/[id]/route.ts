import type { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export const GET = withErrorHandling(
  withRateLimit(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const { prisma } = await import("@/lib/db/prisma");
    const enemy = await prisma.enemy.findUnique({
      where: { id },
    });

    if (!enemy) {
      throw ApiError.notFound("Không tìm thấy enemy");
    }

    return ok(enemy, { maxAgeSec: 60 });
  }, { prefix: "enemy-detail", limit: 60 })
);