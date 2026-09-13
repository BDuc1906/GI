import type { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { TeamCompositionService } from "@/features/build/team-service";
import { teamCompositionSchema } from "@/features/build/team-validation";

export const revalidate = 300;
export const dynamic = "force-dynamic";

const teamService = new TeamCompositionService();

export const GET = withErrorHandling(
  withRateLimit(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);

    const payload = {
      characterId: searchParams.get("characterId")?.trim() ?? "",
    };

    const parsed = teamCompositionSchema.safeParse(payload);
    if (!parsed.success) {
      throw ApiError.badRequest("Dữ liệu gợi ý đội hình không hợp lệ", parsed.error.flatten().fieldErrors);
    }

    const result = await teamService.recommend(parsed.data.characterId);

    return ok(result, { maxAgeSec: 300 });
  }, { prefix: "build-team", limit: 30 })
);
