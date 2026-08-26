
import type { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";

export const revalidate = 300;

/** GET /api/characters/:id — trả về đầy đủ thông tin nhân vật (talents, constellations, materials...). */
export const GET = withErrorHandling(
  withRateLimit(
    async (_req: NextRequest, { params }) => {
      const { id } = await params;

      const character = await prisma.character.findUnique({ where: { id } });
      if (!character) throw ApiError.notFound(`Không tìm thấy nhân vật với id "${id}"`);

      return ok(character, { maxAgeSec: 300 });
    },
    { prefix: "characters-detail" }
  )
);
