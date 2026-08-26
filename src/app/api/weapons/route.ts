import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { ok } from "@/lib/api/response";
import { withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { buildMeta, parsePagination, parseRarityList, parseSort } from "@/lib/api/query";

export const revalidate = 60;

// Xem giải thích chi tiết trong src/app/api/characters/route.ts — route đọc
// query string nên phải khai báo dynamic tường minh, tránh Next.js phải tự
// dò bằng cách ném lỗi nội bộ lúc build.
export const dynamic = "force-dynamic";

const SORT_FIELDS = ["name", "rarity", "baseAtk", "createdAt"] as const;

const LIST_SELECT = {
  id: true,
  name: true,
  type: true,
  rarity: true,
  baseAtk: true,
  iconUrl: true,
} satisfies Prisma.WeaponSelect;

/**
 * GET /api/weapons
 *
 * Query params:
 *  - q     tìm theo tên
 *  - type  loại vũ khí: Sword | Claymore | Polearm | Bow | Catalyst (nhiều giá trị: cách nhau dấu phẩy)
 *  - rarity  vd "5" hoặc "4,5"
 *  - sort  "name" | "-name" | "rarity" | "-rarity" | "baseAtk" | "-baseAtk" (mặc định "-rarity")
 *  - page, limit
 */
export const GET = withErrorHandling(
  withRateLimit(
    async (req: NextRequest) => {
      const { searchParams } = new URL(req.url);
      const pagination = parsePagination(searchParams);
      const sort = parseSort(searchParams.get("sort"), SORT_FIELDS, { field: "rarity", dir: "desc" });
      const rarity = parseRarityList(searchParams.get("rarity"));

      const q = searchParams.get("q")?.trim();
      const type = splitList(searchParams.get("type"));

      const where: Prisma.WeaponWhereInput = {
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
        ...(type ? { type: { in: type, mode: "insensitive" } } : {}),
        ...(rarity ? { rarity: { in: rarity } } : {}),
      };

      const orderBy: Prisma.WeaponOrderByWithRelationInput[] =
        sort.field === "name" ? [{ name: sort.dir }] : [{ [sort.field]: sort.dir }, { name: "asc" }];

      const [items, total] = await Promise.all([
        prisma.weapon.findMany({ where, orderBy, skip: pagination.skip, take: pagination.take, select: LIST_SELECT }),
        prisma.weapon.count({ where }),
      ]);

      return ok(items, { meta: buildMeta(pagination, total) });
    },
    { prefix: "weapons" }
  )
);

function splitList(raw: string | null): string[] | undefined {
  if (!raw) return undefined;
  const list = raw.split(",").map((v) => v.trim()).filter(Boolean);
  return list.length ? list : undefined;
}