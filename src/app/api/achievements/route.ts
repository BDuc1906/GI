import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { ok } from "@/lib/api/response";
import { withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { buildMeta, parsePagination, parseSort } from "@/lib/api/query";

export const revalidate = 60;
export const dynamic = "force-dynamic";

const SORT_FIELDS = ["name", "sortOrder", "createdAt"] as const;
const LIST_SELECT = {
  id: true,
  name: true,
  achievementGroupId: true,
  achievementGroupName: true,
  isHidden: true,
  sortOrder: true,
} satisfies Prisma.AchievementSelect;

export const GET = withErrorHandling(
  withRateLimit(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const pagination = parsePagination(searchParams);
    const sort = parseSort(searchParams.get("sort"), SORT_FIELDS, { field: "sortOrder", dir: "asc" });

    const q = searchParams.get("q")?.trim();
    const isHidden = searchParams.get("isHidden") === "true";
    const groupId = searchParams.get("groupId")?.trim();

    const where: Prisma.AchievementWhereInput = {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(searchParams.has("isHidden") ? { isHidden } : {}),
      ...(groupId ? { achievementGroupId: groupId } : {}),
    };

    const orderBy: Prisma.AchievementOrderByWithRelationInput[] =
      sort.field === "name"
        ? [{ name: sort.dir }]
        : [{ [sort.field]: sort.dir }, { name: "asc" }];

    const { prisma } = await import("@/lib/db/prisma");

    const [items, total] = await Promise.all([
      prisma.achievement.findMany({
        where,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
        select: LIST_SELECT,
      }),
      prisma.achievement.count({ where }),
    ]);

    return ok(items, { meta: buildMeta(pagination, total) });
  }, { prefix: "achievements", limit: 60 })
);