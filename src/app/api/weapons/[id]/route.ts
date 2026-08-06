
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";

export const revalidate = 300;

/** GET /api/weapons/:id */
export const GET = withErrorHandling(
  withRateLimit(
    async (_req: NextRequest, { params }) => {
      const { id } = await params;

      const weapon = await prisma.weapon.findUnique({ where: { id } });
      if (!weapon) throw ApiError.notFound(`Không tìm thấy vũ khí với id "${id}"`);

      return ok(weapon, { maxAgeSec: 300 });
    },
    { prefix: "weapons-detail" }
  )
);
