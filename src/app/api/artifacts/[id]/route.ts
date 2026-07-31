import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";

export const revalidate = 300;

/** GET /api/artifacts/:id */
export const GET = withErrorHandling(async (_req: NextRequest, { params }) => {
  const { id } = await params;

  const artifactSet = await prisma.artifactSet.findUnique({ where: { id } });
  if (!artifactSet) throw ApiError.notFound(`Không tìm thấy thánh di vật với id "${id}"`);

  return ok(artifactSet);
});
