import type { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { BuildService } from "@/features/build/service";
import { buildRecommendationSchema } from "@/features/build/validation";

export const revalidate = 300;
export const dynamic = "force-dynamic";

const buildService = new BuildService();

export const GET = withErrorHandling(
  withRateLimit(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);

    const payload = {
      characterId: searchParams.get("characterId")?.trim() ?? "",
      weaponId: searchParams.get("weaponId")?.trim() || undefined,
    };

    const parsed = buildRecommendationSchema.safeParse(payload);
    if (!parsed.success) {
      throw ApiError.badRequest("Dữ liệu build không hợp lệ", parsed.error.flatten().fieldErrors);
    }

    const result = await buildService.recommend(parsed.data);

    return ok(result, { maxAgeSec: 300 });
  }, { prefix: "build", limit: 30 })
);
