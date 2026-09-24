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
    const geography = await prisma.geography.findUnique({
      where: { id },
    });

    if (!geography) {
      throw ApiError.notFound("Không tìm thấy geography");
    }

    return ok(geography, { maxAgeSec: 60 });
  }, { prefix: "geography-detail", limit: 60 })
);