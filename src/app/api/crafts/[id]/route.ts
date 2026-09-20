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
    const craft = await prisma.craft.findUnique({
      where: { id },
    });

    if (!craft) {
      throw ApiError.notFound("Không tìm thấy craft");
    }

    return ok(craft, { maxAgeSec: 60 });
  }, { prefix: "craft-detail", limit: 60 })
);