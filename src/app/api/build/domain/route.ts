import type { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { DomainRecommendationService } from "@/features/build/domain-service";
import { domainRecommendationSchema } from "@/features/build/domain-validation";

export const revalidate = 300;
export const dynamic = "force-dynamic";

const domainService = new DomainRecommendationService();

export const GET = withErrorHandling(
  withRateLimit(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);

    const payload = {
      characterId: searchParams.get("characterId")?.trim() ?? "",
    };

    const parsed = domainRecommendationSchema.safeParse(payload);
    if (!parsed.success) {
      throw ApiError.badRequest("Dữ liệu gợi ý bí cảnh không hợp lệ", parsed.error.flatten().fieldErrors);
    }

    const result = await domainService.recommend(parsed.data.characterId);

    return ok(result, { maxAgeSec: 300 });
  }, { prefix: "build-domain", limit: 30 })
);
