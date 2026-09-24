import type { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";

export const revalidate = 60;
export const dynamic = "force-dynamic";

export const GET = withErrorHandling(
  withRateLimit(async (req: NextRequest, { params }: { params: Promise<Record<string, string>> }) => {
    const { id } = await params;

    const { prisma } = await import("@/lib/db/prisma");
    const achievement = await prisma.achievement.findUnique({
      where: { id },
    });

    if (!achievement) {
      throw ApiError.notFound("Không tìm thấy achievement");
    }

    return ok(achievement, { maxAgeSec: 60 });
  }, { prefix: "achievement-detail", limit: 60 })
);