
import type { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { buildMeta, parsePagination, parseSort } from "@/lib/api/query";
import { genshinServerWeekdayName } from "@/lib/genshin-server-time";

export const revalidate = 3600; // Bí cảnh gần như không đổi giữa các lần deploy trong tuần

export const dynamic = "force-dynamic";

const SORT_FIELDS = ["name", "recommendedLevel", "createdAt"] as const;
const CATEGORIES = ["artifact", "weapon", "talent"] as const;
const WEEKDAYS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

/**
 * GET /api/domains
 *
 * Query params:
 *  - q          tìm theo tên
 *  - category   "artifact" | "weapon" | "talent" (nhiều giá trị: cách nhau dấu phẩy)
 *  - day        lọc theo ngày mở trong tuần, vd "Monday" — domain "artifact"
 *               (mở hằng ngày, daysOfWeek rỗng) LUÔN khớp mọi giá trị day.
 *  - today      "true" — rút gọn cho "day=<thứ hôm nay theo giờ server Châu
 *               Á UTC+8, đổi ngày lúc 4:00 sáng — xem src/lib/genshin-server-time.ts>"
 *  - sort, page, limit
 */
export const GET = withErrorHandling(
  withRateLimit(
    async (req: NextRequest) => {
      const { searchParams } = new URL(req.url);
      const pagination = parsePagination(searchParams);
      const sort = parseSort(searchParams.get("sort"), SORT_FIELDS, { field: "name", dir: "asc" });

      const q = searchParams.get("q")?.trim();
      const category = splitList(searchParams.get("category"));
      if (category) {
        for (const c of category) {
          if (!CATEGORIES.includes(c as (typeof CATEGORIES)[number])) {
            throw ApiError.badRequest(`Tham số "category" không hợp lệ: "${c}"`, { allowed: CATEGORIES });
          }
        }
      }

      const today = searchParams.get("today") === "true";
      let day = searchParams.get("day")?.trim();
      if (today) {
        day = genshinServerWeekdayName();
      }
      if (day && !WEEKDAYS.includes(day as (typeof WEEKDAYS)[number])) {
        throw ApiError.badRequest(`Tham số "day" không hợp lệ: "${day}"`, { allowed: WEEKDAYS });
      }

      const where: Prisma.DomainWhereInput = {
        ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
        ...(category ? { category: { in: category } } : {}),
        // daysOfWeek rỗng ([]) nghĩa là domain thánh di vật (mở hằng ngày)
        // -> luôn khớp. Ngược lại phải chứa đúng "day" được lọc.
        ...(day ? { OR: [{ daysOfWeek: { isEmpty: true } }, { daysOfWeek: { has: day } }] } : {}),
      };

      const orderBy: Prisma.DomainOrderByWithRelationInput[] =
        sort.field === "name" ? [{ name: sort.dir }] : [{ [sort.field]: sort.dir }, { name: "asc" }];

      const [items, total] = await Promise.all([
        prisma.domain.findMany({
          where,
          orderBy,
          skip: pagination.skip,
          take: pagination.take,
        }),
        prisma.domain.count({ where }),
      ]);

      return ok(items, { meta: buildMeta(pagination, total), maxAgeSec: 3600 });
    },
    { prefix: "domains" }
  )
);

function splitList(raw: string | null): string[] | undefined {
  if (!raw) return undefined;
  const list = raw.split(",").map((v) => v.trim()).filter(Boolean);
  return list.length ? list : undefined;
}
