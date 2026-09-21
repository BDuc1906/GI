import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { ok } from "@/lib/api/response";
import { withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { buildMeta, parsePagination, parseSort } from "@/lib/api/query";

export const revalidate = 60;
export const dynamic = "force-dynamic";

const SORT_FIELDS = ["name", "level", "isBoss", "difficulty", "createdAt"] as const;
const LIST_SELECT = {
  id: true,
  name: true,
  monsterType: true,
  enemyType: true,
  categoryType: true,
  categoryText: true,
  level: true,
  hp: true,
  atk: true,
  def: true,
  weaknesses: true,
  resistances: true,
  immunities: true,
  isBoss: true,
  weeklyBoss: true,
  difficulty: true,
  domains: true,
} satisfies Prisma.EnemySelect;

export const GET = withErrorHandling(
  withRateLimit(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const pagination = parsePagination(searchParams);
    const sort = parseSort(searchParams.get("sort"), SORT_FIELDS, { field: "name", dir: "asc" });

    const q = searchParams.get("q")?.trim();
    const monsterType = splitList(searchParams.get("monsterType"));
    const enemyType = splitList(searchParams.get("enemyType"));
    const isBoss = searchParams.get("isBoss") === "true";
    const weeklyBoss = searchParams.get("weeklyBoss") === "true";
    const difficulty = searchParams.get("difficulty");

    const where: Prisma.EnemyWhereInput = {
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(monsterType ? { monsterType: { in: monsterType, mode: "insensitive" } } : {}),
      ...(enemyType ? { enemyType: { in: enemyType, mode: "insensitive" } } : {}),
      ...(searchParams.has("isBoss") ? { isBoss } : {}),
      ...(searchParams.has("weeklyBoss") ? { weeklyBoss } : {}),
      ...(difficulty ? { difficulty: { equals: difficulty, mode: "insensitive" } } : {}),
    };

    const orderBy: Prisma.EnemyOrderByWithRelationInput[] =
      sort.field === "name"
        ? [{ name: sort.dir }]
        : [{ [sort.field]: sort.dir }, { name: "asc" }];

    const { prisma } = await import("@/lib/db/prisma");

    const [items, total] = await Promise.all([
      prisma.enemy.findMany({
        where,
        orderBy,
        skip: pagination.skip,
        take: pagination.take,
        select: LIST_SELECT,
      }),
      prisma.enemy.count({ where }),
    ]);

    return ok(items, { meta: buildMeta(pagination, total) });
  }, { prefix: "enemies", limit: 60 })
);

function splitList(raw: string | null): string[] | undefined {
  if (!raw) return undefined;
  const list = raw.split(",").map((v) => v.trim()).filter(Boolean);
  return list.length ? list : undefined;
}