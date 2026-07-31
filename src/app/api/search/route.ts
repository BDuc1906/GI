import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";

export const revalidate = 30;

const MAX_PER_TYPE = 50;
const DEFAULT_PER_TYPE = 12;

/**
 * GET /api/search?q=...
 *
 * Tìm kiếm tổng hợp trên cả 3 loại tài nguyên cùng lúc — dùng cho thanh tìm
 * kiếm toàn site. Không phân trang từng loại riêng (limit cố định nhỏ per
 * type) vì đây là kết quả "gợi ý nhanh", muốn xem đầy đủ thì gọi thẳng
 * /api/characters?q=..., /api/weapons?q=..., /api/artifacts?q=....
 *
 * Query params:
 *  - q     bắt buộc, tối thiểu 1 ký tự sau khi trim
 *  - limit số kết quả tối đa MỖI loại (mặc định 12, tối đa 50)
 */
export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").trim();
  if (!q) throw ApiError.badRequest('Thiếu tham số bắt buộc "q"');

  const limitRaw = searchParams.get("limit");
  let perType = DEFAULT_PER_TYPE;
  if (limitRaw !== null) {
    const n = Number(limitRaw);
    if (!Number.isInteger(n) || n < 1) {
      throw ApiError.badRequest('Tham số "limit" phải là số nguyên dương', { value: limitRaw });
    }
    perType = Math.min(n, MAX_PER_TYPE);
  }

  const [characters, weapons, artifacts] = await Promise.all([
    prisma.character.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
      take: perType,
      select: { id: true, name: true, vision: true, weaponType: true, rarity: true, iconUrl: true, elementIcon: true },
    }),
    prisma.weapon.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
      take: perType,
      select: { id: true, name: true, type: true, rarity: true, iconUrl: true },
    }),
    prisma.artifactSet.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      orderBy: { name: "asc" },
      take: perType,
      select: { id: true, name: true, rarityRange: true, iconUrl: true },
    }),
  ]);

  return ok({
    query: q,
    total: characters.length + weapons.length + artifacts.length,
    characters,
    weapons,
    artifacts,
  });
});
