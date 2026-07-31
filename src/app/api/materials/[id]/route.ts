import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";

export const revalidate = 300;

/** GET /api/materials/:id */
export const GET = withErrorHandling(async (_req: NextRequest, { params }) => {
  const { id } = await params;

  const material = await prisma.material.findUnique({ where: { id } });
  if (!material) throw ApiError.notFound(`Không tìm thấy nguyên liệu với id "${id}"`);

  return ok(material);
});
