import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { ok } from "@/lib/api/response";
import { withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { buildMeta, parsePagination, parseSort } from "@/lib/api/query";

export const revalidate = 60;
export const dynamic = "force-dynamic";

const SORT_FIELDS = ["name", "unlockRank", "moraCost", "createdAt"] as const;
const LIST_SELECT = {
  id: true,
  name: true,
  unlockRank: true,
  moraCost: true,
  resultCount: true,
} satisfies Prisma.CraftSelect;

export const GET = withErrorHandling(
  withRateLimit(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const pagination = parsePagination(searchParams);
    const sort = parseSort(searchParams.get("sort"), SORT_FIELDS, { field: "name", dir: "asc" });

    const q = searchParams.get("q")?.trim();
    const minRank = searchParams.get("minRank") ? parseInt(searchParams.get("minRank")!) : undefined;
    const maxRank = searchParams.get("maxRank") ? parseInt(searchParams.get("maxRank")!) : undefined;

    const where: Prisma.CraftWhereInput = {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(minRank ? { unlockRank: { gte: minRank } } : {}),
      ...(maxRank ? { unlockRank: { lte: maxRank } } : {}),
    };

    const orderBy: Prisma.CraftOrderByWithRelationInput[] =
      sort.field === "name"
        ? [{ name: sort.dir }]
        : [{ [sort.field]: sort.dir }, { name: "asc" }];

    const { prisma } = await import("@/lib/db/prisma");

    const [items, total] = await Promise.all([
      prisma.craft.findMany({
        where,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
        select: LIST_SELECT,
      }),
      prisma.craft.count({ where }),
    ]);

    return ok(items, { meta: buildMeta(pagination, total) });
  }, { prefix: "crafts", limit: 60 })
);