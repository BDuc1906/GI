import type { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { CharactersService } from "@/features/characters/service";

export const revalidate = 300;

const charactersService = new CharactersService();

/** GET /api/characters/:id — trả về đầy đủ thông tin nhân vật (talents, constellations, materials...). */
export const GET = withErrorHandling(
  withRateLimit(async (_req: NextRequest, { params }) => {
    const { id } = await params;

    const character = await charactersService.getById(id);
    if (!character) throw ApiError.notFound(`Không tìm thấy nhân vật với id "${id}"`);

    return ok(character, { maxAgeSec: 300 });
  }, { prefix: "characters-detail" })
);
