import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { ok } from "@/lib/api/response";
import { withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { buildMeta, parsePagination, parseSort } from "@/lib/api/query";

export const revalidate = 60;
export const dynamic = "force-dynamic";

const SORT_FIELDS = ["name", "regionName", "areaName", "createdAt"] as const;
const LIST_SELECT = {
  id: true,
  name: true,
  areaId: true,
  areaName: true,
  regionId: true,
  regionName: true,
} satisfies Prisma.GeographySelect;

export const GET = withErrorHandling(
  withRateLimit(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const pagination = parsePagination(searchParams);
    const sort = parseSort(searchParams.get("sort"), SORT_FIELDS, { field: "name", dir: "asc" });

    const q = searchParams.get("q")?.trim();
    const regionName = splitList(searchParams.get("regionName"));
    const areaName = splitList(searchParams.get("areaName"));

    const where: Prisma.GeographyWhereInput = {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(regionName ? { regionName: { in: regionName, mode: "insensitive" } } : {}),
      ...(areaName ? { areaName: { in: areaName, mode: "insensitive" } } : {}),
    };

    const orderBy: Prisma.GeographyOrderByWithRelationInput[] =
      sort.field === "name"
        ? [{ name: sort.dir }]
        : [{ [sort.field]: sort.dir }, { name: "asc" }];

    const { prisma } = await import("@/lib/db/prisma");

    const [items, total] = await Promise.all([
      prisma.geography.findMany({
        where,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
        select: LIST_SELECT,
      }),
      prisma.geography.count({ where }),
    ]);

    return ok(items, { meta: buildMeta(pagination, total) });
  }, { prefix: "geography", limit: 60 })
);

function splitList(raw: string | null): string[] | undefined {
  if (!raw) return undefined;
  const list = raw.split(",").map((v) => v.trim()).filter(Boolean);
  return list.length ? list : undefined;
}