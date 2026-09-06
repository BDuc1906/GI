import type { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { WeaponsService } from "@/features/weapons/service";

export const revalidate = 300;

const weaponsService = new WeaponsService();

/** GET /api/weapons/:id */
export const GET = withErrorHandling(
  withRateLimit(async (_req: NextRequest, { params }) => {
    const { id } = await params;

    const weapon = await weaponsService.getById(id);
    if (!weapon) throw ApiError.notFound(`Không tìm thấy vũ khí với id "${id}"`);

    return ok(weapon, { maxAgeSec: 300 });
  }, { prefix: "weapons-detail" })
);
