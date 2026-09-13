import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { buildCharacterWhere } from "./filters";
import { groupCharactersForListing, type CharacterGrouping } from "./grouping";
import type { CharacterListingFilters } from "./query-params";

const getVisionRows = unstable_cache(
  async () => {
    const rows = await prisma.character.findMany({
      distinct: ["vision"],
      select: { vision: true, elementIcon: true },
    });
    return rows
      .filter((r) => r.vision && r.vision !== "Unknown")
      .map((r) => ({ vision: r.vision, elementIcon: r.elementIcon }));
  },
  ["character-vision-rows-v3"],
  { revalidate: 3600 }
);

const getRegionRows = unstable_cache(
  async () => {
    const rows = await prisma.character.findMany({ distinct: ["region"], select: { region: true } });
    return rows.map((r) => r.region).filter((r): r is string => Boolean(r));
  },
  ["character-region-rows"],
  { revalidate: 3600 }
);

export const WEAPON_TYPES = ["Sword", "Claymore", "Polearm", "Bow", "Catalyst"] as const;

export interface CharacterListing extends CharacterGrouping {
  visionRows: Awaited<ReturnType<typeof getVisionRows>>;
  regionRows: string[];
  weaponTypes: typeof WEAPON_TYPES;
}

/**
 * Điểm vào duy nhất mà `page.tsx` cần gọi: fetch nhân vật theo filter +
 * fetch danh sách tuỳ chọn filter (vision/region) + gom nhóm kết quả.
 * Toàn bộ chi tiết Prisma/cache/retry được giấu ở đây, page chỉ cần biết
 * "đưa filter vào, nhận data đã sẵn sàng để render ra".
 */
export async function getCharacterListing(filters: CharacterListingFilters): Promise<CharacterListing> {
  const where = buildCharacterWhere(filters);

  // BUG ĐÃ SỬA: query chính của trang (chạy trên MỌI request, không có
  // cache) trước đây không có retry — cùng lớp lỗi PrismaClientKnownRequestError
  // P1017 "Server has closed the connection" đã sửa ở trang chủ, xảy ra
  // khi Neon free tier vừa suspend compute xong đúng lúc request tới.
  const [characters, visionRows, regionRows] = await Promise.all([
    withDbRetry(() =>
      prisma.character.findMany({
        where,
        orderBy: [{ rarity: "desc" }, { name: "asc" }],
      })
    ),
    getVisionRows(),
    getRegionRows(),
  ]);

  const grouping = groupCharactersForListing(characters);

  return {
    ...grouping,
    visionRows,
    regionRows,
    weaponTypes: WEAPON_TYPES,
  };
}
