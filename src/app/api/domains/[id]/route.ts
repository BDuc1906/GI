import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";

export const revalidate = 3600;

/** GET /api/domains/:id */
export const GET = withErrorHandling(
  withRateLimit(
    async (_req: NextRequest, { params }) => {
      const { id } = await params;

      const domain = await prisma.domain.findUnique({ where: { id } });
      if (!domain) throw ApiError.notFound(`Không tìm thấy bí cảnh với id "${id}"`);

      return ok(domain);
    },
    { prefix: "domains-detail" }
  )
);