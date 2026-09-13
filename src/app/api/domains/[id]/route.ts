import type { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { DomainsService } from "@/features/domains/service";

export const revalidate = 3600;

const domainsService = new DomainsService();

/** GET /api/domains/:id */
export const GET = withErrorHandling(
  withRateLimit(async (_req: NextRequest, { params }) => {
    const { id } = await params;

    const domain = await domainsService.getById(id);
    if (!domain) throw ApiError.notFound(`Không tìm thấy bí cảnh với id "${id}"`);

    return ok(domain, { maxAgeSec: 3600 });
  }, { prefix: "domains-detail" })
);
