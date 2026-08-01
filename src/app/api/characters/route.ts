import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api/response";
import { withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { buildMeta, parsePagination, parseRarityList, parseSort } from "@/lib/api/query";

export const revalidate = 60;

// Route đọc query string (`new URL(req.url)`) để lọc/phân trang/sắp xếp, nên
// không thể prerender tĩnh. Khai báo tường minh thay vì để Next.js tự dò ra
// bằng cách ném lỗi nội bộ "DYNAMIC_SERVER_USAGE" lúc build — cách dò ngầm
// đó bị `withErrorHandling` bắt luôn (log nhầm thành "[API] Unhandled error"
// mỗi lần build dù route vẫn hoạt động đúng).
export const dynamic = "force-dynamic";

const SORT_FIELDS = ["name", "rarity", "createdAt"] as const;

const LIST_SELECT = {
  id: true,
  name: true,
  title: true,
  vision: true,
  weaponType: true,
  rarity: true,
  region: true,
  iconUrl: true,
  elementIcon: true,
} satisfies Prisma.CharacterSelect;

/**
 * GET /api/characters
 *
 * Query params:
 *  - q        tìm theo tên (contains, không phân biệt hoa/thường)
 *  - vision   lọc theo nguyên tố, vd "Pyro" (có thể liệt kê nhiều, cách nhau dấu phẩy)
 *  - weaponType  lọc theo loại vũ khí, vd "Sword" (nhiều giá trị: cách nhau dấu phẩy)
 *  - rarity   lọc theo phẩm cấp, vd "5" hoặc "4,5"
 *  - sort     "name" | "-name" | "rarity" | "-rarity" | "createdAt" | "-createdAt" (mặc định "-rarity" rồi "name")
 *  - page     mặc định 1
 *  - limit    mặc định 24, tối đa 100
 */
export const GET = withErrorHandling(
  withRateLimit(
    async (req: NextRequest) => {
      const { searchParams } = new URL(req.url);
      const pagination = parsePagination(searchParams);
      const sort = parseSort(searchParams.get("sort"), SORT_FIELDS, { field: "rarity", dir: "desc" });
      const rarity = parseRarityList(searchParams.get("rarity"));

      const q = searchParams.get("q")?.trim();
      const vision = splitList(searchParams.get("vision"));
      const weaponType = splitList(searchParams.get("weaponType"));

      const where: Prisma.CharacterWhereInput = {
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
        ...(vision ? { vision: { in: vision, mode: "insensitive" } } : {}),
        ...(weaponType ? { weaponType: { in: weaponType, mode: "insensitive" } } : {}),
        ...(rarity ? { rarity: { in: rarity } } : {}),
      };

      const orderBy: Prisma.CharacterOrderByWithRelationInput[] =
        sort.field === "name"
          ? [{ name: sort.dir }]
          : [{ [sort.field]: sort.dir }, { name: "asc" }];

      const [items, total] = await Promise.all([
        prisma.character.findMany({
          where,
          orderBy,
          skip: pagination.skip,
          take: pagination.take,
          select: LIST_SELECT,
        }),
        prisma.character.count({ where }),
      ]);

      return ok(items, { meta: buildMeta(pagination, total) });
    },
    { prefix: "characters" }
  )
);

function splitList(raw: string | null): string[] | undefined {
  if (!raw) return undefined;
  const list = raw.split(",").map((v) => v.trim()).filter(Boolean);
  return list.length ? list : undefined;
}