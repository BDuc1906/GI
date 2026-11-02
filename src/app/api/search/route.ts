
import type { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { SearchService } from "@/features/search/service";
import { searchRepository } from "@/features/search/repository";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { routing, type AppLocale } from "@/i18n/routing";

export const revalidate = 30;

// Xem giải thích chi tiết trong src/app/api/characters/route.ts — route đọc
// query string nên phải khai báo dynamic tường minh, tránh Next.js phải tự
// dò bằng cách ném lỗi nội bộ lúc build.
export const dynamic = "force-dynamic";

const MAX_PER_TYPE = 50;
const DEFAULT_PER_TYPE = 12;

const searchService = new SearchService(searchRepository);

/**
 * GET /api/search?q=...
 *
 * Tìm kiếm tổng hợp trên cả 5 loại tài nguyên cùng lúc — dùng cho thanh tìm
 * kiếm toàn site. Không phân trang từng loại riêng (limit cố định nhỏ per
 * type) vì đây là kết quả "gợi ý nhanh", muốn xem đầy đủ thì gọi thẳng
 * /api/characters?q=..., /api/weapons?q=..., /api/artifacts?q=..., /api/domains?q=...,
 * or /api/materials?q=....
 *
 * Query params:
 *  - q     bắt buộc, tối thiểu 1 ký tự sau khi trim, tối đa 120 ký tự
 *  - limit số kết quả tối đa MỖI loại (mặc định 12, tối đa 50)
 *  - locale locale của tên dịch để tìm kiếm (mặc định en)
 *
 * Rate limit: 30 req/phút/IP (thấp hơn các resource đơn) vì mỗi lần gọi
 * chạy 5 query song song thay vì 1 (characters, weapons, artifacts, domains, materials)
 * — tốn tài nguyên DB hơn hẳn, dễ bị lạm dụng hơn nếu để chung mức giới hạn
 * với endpoint đơn.
 */
export const GET = withErrorHandling(
  withRateLimit(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();
    if (!q) throw ApiError.badRequest('Thiếu tham số bắt buộc "q"');
    if (q.length > 120) {
      throw ApiError.badRequest('Tham số "q" không được dài quá 120 ký tự');
    }

    const localeRaw = searchParams.get("locale") ?? "en";
    if (!(routing.locales as readonly string[]).includes(localeRaw)) {
      throw ApiError.badRequest('Tham số "locale" không hợp lệ', { value: localeRaw });
    }
    const locale = localeRaw as AppLocale;

    const limitRaw = searchParams.get("limit");
    let perType = DEFAULT_PER_TYPE;
    if (limitRaw !== null) {
      const n = Number(limitRaw);
      if (!Number.isInteger(n) || n < 1) {
        throw ApiError.badRequest('Tham số "limit" phải là số nguyên dương', { value: limitRaw });
      }
      perType = Math.min(n, MAX_PER_TYPE);
    }

    const result = await searchService.search(q, { limit: perType, locale });

    const localize = <T extends { name: string; nameTranslations: unknown }>(items: T[]) =>
      items.map(({ nameTranslations, ...entity }) => ({
        ...entity,
        name: getLocalizedName({ name: entity.name, nameTranslations }, locale),
      }));

    return ok(
      {
        query: result.query,
        total: result.total,
        characters: localize(result.characters),
        weapons: localize(result.weapons),
        artifacts: localize(result.artifacts),
        domains: localize(result.domains),
        materials: localize(result.materials),
      },
      { maxAgeSec: 30 }
    );
  }, { prefix: "search", limit: 30 })
);
