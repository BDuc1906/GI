
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";

export const revalidate = 300;

/** GET /api/materials/:id */
export const GET = withErrorHandling(
  withRateLimit(
    async (_req: NextRequest, { params }) => {
      const { id } = await params;

      const material = await prisma.material.findUnique({ where: { id } });
      if (!material) throw ApiError.notFound(`Không tìm thấy nguyên liệu với id "${id}"`);

      return ok(material, { maxAgeSec: 300 });
    },
    { prefix: "materials-detail" }
  )
);
