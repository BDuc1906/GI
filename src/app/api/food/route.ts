import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { ok } from "@/lib/api/response";
import { withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { buildMeta, parsePagination, parseSort } from "@/lib/api/query";

export const revalidate = 60;
export const dynamic = "force-dynamic";

const SORT_FIELDS = ["name", "rarity", "foodtype", "createdAt"] as const;
const LIST_SELECT = {
  id: true,
  name: true,
  rarity: true,
  foodtype: true,
  filterType: true,
} satisfies Prisma.FoodSelect;

export const GET = withErrorHandling(
  withRateLimit(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const pagination = parsePagination(searchParams);
    const sort = parseSort(searchParams.get("sort"), SORT_FIELDS, { field: "name", dir: "asc" });

    const q = searchParams.get("q")?.trim();
    const foodtype = splitList(searchParams.get("foodtype"));
    const rarity = parseRarityList(searchParams.get("rarity"));

    const where: Prisma.FoodWhereInput = {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(foodtype ? { foodtype: { in: foodtype, mode: "insensitive" } } : {}),
      ...(rarity ? { rarity: { in: rarity } } : {}),
    };

    const orderBy: Prisma.FoodOrderByWithRelationInput[] =
      sort.field === "name"
        ? [{ name: sort.dir }]
        : [{ [sort.field]: sort.dir }, { name: "asc" }];

    const { prisma } = await import("@/lib/db/prisma");

    const [items, total] = await Promise.all([
      prisma.food.findMany({
        where,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
        select: LIST_SELECT,
      }),
      prisma.food.count({ where }),
    ]);

    return ok(items, { meta: buildMeta(pagination, total) });
  }, { prefix: "food", limit: 60 })
);

function splitList(raw: string | null): string[] | undefined {
  if (!raw) return undefined;
  const list = raw.split(",").map((v) => v.trim()).filter(Boolean);
  return list.length ? list : undefined;
}

function parseRarityList(raw: string | null): number[] | undefined {
  if (!raw) return undefined;
  const list = raw.split(",").map((v) => parseInt(v.trim())).filter((v) => !isNaN(v) && v >= 1 && v <= 5);
  return list.length ? list : undefined;
}