import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { buildMeta, parsePagination, parseSort } from "@/lib/api/query";

export const revalidate = 300;

// Xem giải thích chi tiết trong src/app/api/characters/route.ts — route đọc
// query string nên phải khai báo dynamic tường minh, tránh Next.js phải tự
// dò bằng cách ném lỗi nội bộ lúc build.
export const dynamic = "force-dynamic";

const SORT_FIELDS = ["name", "createdAt"] as const;

const LIST_SELECT = {
  id: true,
  name: true,
  rarityRange: true,
  iconUrl: true,
} satisfies Prisma.ArtifactSetSelect;

/**
 * GET /api/artifacts
 *
 * Query params:
 *  - q       tìm theo tên
 *  - rarity  lọc các set CÓ chứa phẩm cấp này trong rarityRange, vd "5"
 *  - sort    "name" | "-name" | "createdAt" | "-createdAt" (mặc định "name")
 *  - page, limit
 */
export const GET = withErrorHandling(
  withRateLimit(
    async (req: NextRequest) => {
      const { searchParams } = new URL(req.url);
      const pagination = parsePagination(searchParams);
      const sort = parseSort(searchParams.get("sort"), SORT_FIELDS, { field: "name", dir: "asc" });

      const q = searchParams.get("q")?.trim();
      const rarityRaw = searchParams.get("rarity");
      const rarity = rarityRaw ? parseRarity(rarityRaw) : undefined;

      const where: Prisma.ArtifactSetWhereInput = {
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
        ...(rarity ? { rarityRange: { has: rarity } } : {}),
      };

      const [items, total] = await Promise.all([
        prisma.artifactSet.findMany({
          where,
          orderBy: [{ [sort.field]: sort.dir }],
          skip: pagination.skip,
          take: pagination.take,
          select: LIST_SELECT,
        }),
        prisma.artifactSet.count({ where }),
      ]);

      return ok(items, { meta: buildMeta(pagination, total) });
    },
    { prefix: "artifacts" }
  )
);

function parseRarity(raw: string): number {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > 5) {
    throw ApiError.badRequest(`Tham số "rarity" không hợp lệ: "${raw}" (chỉ nhận 1–5)`, { value: raw });
  }
  return n;
}