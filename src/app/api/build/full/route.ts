import type { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { FullBuildPlanService } from "@/features/build/full-plan-service";
import { fullBuildPlanSchema } from "@/features/build/full-plan-validation";

export const revalidate = 300;
export const dynamic = "force-dynamic";

const fullBuildService = new FullBuildPlanService();

export const GET = withErrorHandling(
  withRateLimit(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);

    const payload = {
      characterId: searchParams.get("characterId")?.trim() ?? "",
    };

    const parsed = fullBuildPlanSchema.safeParse(payload);
    if (!parsed.success) {
      throw ApiError.badRequest("Dữ liệu bản đồ xây dựng không hợp lệ", parsed.error.flatten().fieldErrors);
    }

    const result = await fullBuildService.plan(parsed.data.characterId);

    return ok(result, { maxAgeSec: 300 });
  }, { prefix: "build-full-plan", limit: 30 })
);
