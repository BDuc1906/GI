import type { NextRequest } from "next/server";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { ok } from "@/lib/api/response";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export interface WishRecord {
  id: string;
  uid: string;
  gachaType: string;
  itemId: string;
  count: string;
  time: string;
  name: string;
  itemType: string; // "Nhân vật" | "Vũ khí"
  rankType: string; // "3" | "4" | "5"
  pity?: number;
}

export interface WishHistoryResult {
  totalWishes: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  banners: {
    character: WishRecord[];
    weapon: WishRecord[];
    standard: WishRecord[];
    chronicled: WishRecord[];
  };
}

// Danh sách domain hợp lệ của Hoyoverse gacha log
const ALLOWED_HOST_PATTERNS = [
  /^hk4e-api\.mihoyo\.com$/,
  /^hk4e-api-os\.hoyoverse\.com$/,
  /^public-operation-hk4e\.hoyoverse\.com$/,
  /^public-operation-hk4e-sg\.hoyoverse\.com$/,
];

function isAllowedHost(hostname: string): boolean {
  return ALLOWED_HOST_PATTERNS.some((pat) => pat.test(hostname));
}

/**
 * Fetch toàn bộ trang wish cho 1 banner type (tối đa 15 trang để tránh timeout).
 */
async function fetchBannerWishes(
  baseGachaUrl: URL,
  gachaType: string
): Promise<WishRecord[]> {
  const wishes: WishRecord[] = [];
  let endId = "0";
  let page = 1;
  const maxPages = 20;

  while (page <= maxPages) {
    const url = new URL(baseGachaUrl.toString());
    url.searchParams.set("gacha_type", gachaType);
    url.searchParams.set("page", String(page));
    url.searchParams.set("size", "20");
    if (endId !== "0") {
      url.searchParams.set("end_id", endId);
    }

    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      break;
    }

    const data = (await res.json()) as {
      retcode?: number;
      message?: string;
      data?: { list?: Array<{
        id: string;
        uid: string;
        gacha_type: string;
        item_id: string;
        count: string;
        time: string;
        name: string;
        item_type: string;
        rank_type: string;
      }> };
    };

    if (data.retcode !== 0 || !data.data?.list || data.data.list.length === 0) {
      break;
    }

    const list = data.data.list;
    for (const item of list) {
      wishes.push({
        id: item.id,
        uid: item.uid,
        gachaType: item.gacha_type,
        itemId: item.item_id,
        count: item.count,
        time: item.time,
        name: item.name,
        itemType: item.item_type,
        rankType: item.rank_type,
      });
    }

    endId = list[list.length - 1].id;
    page++;

    // Nhỏ hơn 20 item tức là đã hết trang
    if (list.length < 20) {
      break;
    }
  }

  return wishes;
}

/**
 * Tính số lần quay (pity count) cho từng mốc 5★ và 4★ từ cũ tới mới.
 */
function calculatePity(wishesDesc: WishRecord[]): WishRecord[] {
  // Thứ tự API trả về là mới nhất -> cũ nhất. Ta đảo ngược để tính từ cũ tới mới
  const asc = [...wishesDesc].reverse();
  let currentPity = 0;

  const withPity = asc.map((wish) => {
    currentPity++;
    const res = { ...wish, pity: currentPity };
    if (wish.rankType === "5") {
      currentPity = 0;
    }
    return res;
  });

  return withPity.reverse();
}

export const POST = withErrorHandling(
  withRateLimit(
    async (req: NextRequest) => {
      let body: { authUrl?: string; jsonImport?: WishRecord[] };
      try {
        body = await req.json();
      } catch {
        throw ApiError.badRequest("Request body phải là JSON hợp lệ.");
      }

      // Hỗ trợ trường hợp import file JSON đã xuất trước đó
      if (body.jsonImport && Array.isArray(body.jsonImport)) {
        const rawWishes = body.jsonImport;
        const charWishes = rawWishes.filter((w) => w.gachaType === "301" || w.gachaType === "400");
        const weaponWishes = rawWishes.filter((w) => w.gachaType === "302");
        const stdWishes = rawWishes.filter((w) => w.gachaType === "200");
        const chronWishes = rawWishes.filter((w) => w.gachaType === "500");

        const result: WishHistoryResult = {
          totalWishes: rawWishes.length,
          fiveStarCount: rawWishes.filter((w) => w.rankType === "5").length,
          fourStarCount: rawWishes.filter((w) => w.rankType === "4").length,
          threeStarCount: rawWishes.filter((w) => w.rankType === "3").length,
          banners: {
            character: calculatePity(charWishes),
            weapon: calculatePity(weaponWishes),
            standard: calculatePity(stdWishes),
            chronicled: calculatePity(chronWishes),
          },
        };
        return ok(result, { noCache: true });
      }

      if (!body.authUrl || typeof body.authUrl !== "string") {
        throw ApiError.badRequest("Thiếu URL xác thực (authUrl) hoặc dữ liệu JSON.");
      }

      const rawUrl = body.authUrl.trim();
      let parsedUrl: URL;
      try {
        parsedUrl = new URL(rawUrl);
      } catch {
        throw ApiError.badRequest("URL không đúng định dạng.");
      }

      if (!isAllowedHost(parsedUrl.hostname)) {
        throw ApiError.badRequest(
          "URL không hợp lệ. Chỉ chấp nhận liên kết chính thức từ Hoyoverse / miHoYo (hk4e-api / hoyoverse.com)."
        );
      }

      // Đổi path về endpoint getGachaLog chuẩn
      parsedUrl.pathname = parsedUrl.pathname.replace(
        /\/gacha_info\/api\/(getGachaLog|getConfigList)/,
        "/gacha_info/api/getGachaLog"
      );
      if (!parsedUrl.pathname.endsWith("/getGachaLog")) {
        parsedUrl.pathname = "/event/gacha_info/api/getGachaLog";
      }

      // Fetch song song 4 loại banner chính
      try {
        const [charWishes, charWishes2, weaponWishes, stdWishes, chronWishes] =
          await Promise.all([
            fetchBannerWishes(parsedUrl, "301"),
            fetchBannerWishes(parsedUrl, "400"),
            fetchBannerWishes(parsedUrl, "302"),
            fetchBannerWishes(parsedUrl, "200"),
            fetchBannerWishes(parsedUrl, "500"),
          ]);

        // Gộp banner 301 và 400 (đều là nhân vật sự kiện, chung pity)
        const combinedChar = [...charWishes, ...charWishes2].sort(
          (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
        );

        const all = [...combinedChar, ...weaponWishes, ...stdWishes, ...chronWishes];

        const result: WishHistoryResult = {
          totalWishes: all.length,
          fiveStarCount: all.filter((w) => w.rankType === "5").length,
          fourStarCount: all.filter((w) => w.rankType === "4").length,
          threeStarCount: all.filter((w) => w.rankType === "3").length,
          banners: {
            character: calculatePity(combinedChar),
            weapon: calculatePity(weaponWishes),
            standard: calculatePity(stdWishes),
            chronicled: calculatePity(chronWishes),
          },
        };

        return ok(result, { noCache: true });
      } catch (err) {
        console.error("[wish-history] Error fetching logs:", err);
        throw new ApiError(
          502,
          "HOYOVERSE_TIMEOUT",
          "Phiên xác thực đã hết hạn hoặc không thể kết nối tới máy chủ Hoyoverse. Vui lòng mở lại trang Lịch sử trong game để lấy URL mới."
        );
      }
    },
    { prefix: "wish-history", limit: 10, window: "60 s" }
  )
);
