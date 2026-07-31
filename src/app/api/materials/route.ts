import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api/response";
import { withErrorHandling } from "@/lib/api/errors";
import { buildMeta, parsePagination } from "@/lib/api/query";

export const revalidate = 300;

// Xem giải thích chi tiết trong src/app/api/characters/route.ts — route đọc
// query string nên phải khai báo dynamic tường minh, tránh Next.js phải tự
// dò bằng cách ném lỗi nội bộ lúc build.
export const dynamic = "force-dynamic";

/**
 * GET /api/materials
 *
 * Query params:
 *  - q  tìm theo tên
 *  - page, limit
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const pagination = parsePagination(searchParams);
  const q = searchParams.get("q")?.trim();

  const where: Prisma.MaterialWhereInput = q ? { name: { contains: q, mode: "insensitive" } } : {};

  const [items, total] = await Promise.all([
    prisma.material.findMany({
      where,
      orderBy: { name: "asc" },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.material.count({ where }),
  ]);

  return ok(items, { meta: buildMeta(pagination, total) });
});