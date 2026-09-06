import type { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { ArtifactRecommendationService } from "@/features/build/artifact-service";
import { artifactRecommendationSchema } from "@/features/build/artifact-validation";

export const revalidate = 300;
export const dynamic = "force-dynamic";

const artifactService = new ArtifactRecommendationService();

export const GET = withErrorHandling(
  withRateLimit(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);

    const payload = {
      characterId: searchParams.get("characterId")?.trim() ?? "",
    };

    const parsed = artifactRecommendationSchema.safeParse(payload);
    if (!parsed.success) {
      throw ApiError.badRequest("Dữ liệu gợi ý thánh di vật không hợp lệ", parsed.error.flatten().fieldErrors);
    }

    const result = await artifactService.recommend(parsed.data.characterId);

    return ok(result, { maxAgeSec: 300 });
  }, { prefix: "build-artifact", limit: 30 })
);
