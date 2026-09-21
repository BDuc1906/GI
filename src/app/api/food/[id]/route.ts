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
    const food = await prisma.food.findUnique({
      where: { id },
    });

    if (!food) {
      throw ApiError.notFound("Không tìm thấy food");
    }

    return ok(food, { maxAgeSec: 60 });
  }, { prefix: "food-detail", limit: 60 })
);