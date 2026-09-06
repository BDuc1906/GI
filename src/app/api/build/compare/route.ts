import type { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { BuildCompareService } from "@/features/build/compare-service";
import { buildCompareSchema } from "@/features/build/compare-validation";

export const revalidate = 300;
export const dynamic = "force-dynamic";

const buildCompareService = new BuildCompareService();

export const GET = withErrorHandling(
  withRateLimit(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);

    const payload = {
      characterId1: searchParams.get("characterId1")?.trim() ?? "",
      characterId2: searchParams.get("characterId2")?.trim() ?? "",
    };

    const parsed = buildCompareSchema.safeParse(payload);
    if (!parsed.success) {
      throw ApiError.badRequest("Dữ liệu so sánh không hợp lệ", parsed.error.flatten().fieldErrors);
    }

    if (parsed.data.characterId1 === parsed.data.characterId2) {
      throw ApiError.badRequest("characterId1 và characterId2 phải khác nhau");
    }

    const result = await buildCompareService.compare(parsed.data.characterId1, parsed.data.characterId2);

    return ok(result, { maxAgeSec: 300 });
  }, { prefix: "build-compare", limit: 30 })
);
