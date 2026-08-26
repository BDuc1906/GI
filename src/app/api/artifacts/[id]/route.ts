
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";

export const revalidate = 300;

/** GET /api/artifacts/:id */
export const GET = withErrorHandling(
  withRateLimit(
    async (_req: NextRequest, { params }) => {
      const { id } = await params;

      const artifactSet = await prisma.artifactSet.findUnique({ where: { id } });
      if (!artifactSet) throw ApiError.notFound(`Không tìm thấy thánh di vật với id "${id}"`);

      return ok(artifactSet, { maxAgeSec: 300 });
    },
    { prefix: "artifacts-detail" }
  )
);
