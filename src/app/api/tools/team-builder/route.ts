import type { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { TeamBuilder } from "@/lib/game/team-builder";
import { z } from "zod";

export const revalidate = 60;
export const dynamic = "force-dynamic";

const teamBuilderRequestSchema = z.object({
  characters: z.array(z.object({
    id: z.string().min(1),
    name: z.string().min(1),
    vision: z.string().min(1),
    weaponType: z.string().min(1),
    role: z.enum(["main DPS", "sub DPS", "support", "healer", "shielder"]),
    erRequirement: z.number().min(0).max(5).default(1.5),
    burstCost: z.number().min(0).default(0),
    skillCooldown: z.number().min(0).default(0),
  })).min(1).max(4),
  name: z.string().optional(),
});

const teamBuilder = new TeamBuilder();

export const POST = withErrorHandling(
  withRateLimit(async (req: NextRequest) => {
    const body = await req.json();
    const parsed = teamBuilderRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw ApiError.badRequest("Dữ liệu team builder không hợp lệ", parsed.error.flatten().fieldErrors);
    }

    const analysis = teamBuilder.analyzeTeam(parsed.data);

    return ok(analysis, { maxAgeSec: 60 });
  }, { prefix: "team-builder", limit: 30 })
);

export const GET = withErrorHandling(
  withRateLimit(async (req: NextRequest) => {
    const { searchParams } = new URL(req.url);
    const characterId = searchParams.get("characterId")?.trim();

    if (!characterId) {
      throw ApiError.badRequest("Thiếu characterId parameter");
    }

    // Get character from database
    const { prisma } = await import("@/lib/db/prisma");
    const character = await prisma.character.findUnique({
      where: { id: characterId },
      select: {
        id: true,
        name: true,
        vision: true,
        weaponType: true,
      },
    });

    if (!character) {
      throw ApiError.notFound("Không tìm thấy nhân vật");
    }

    // Get all available characters for suggestions
    const allCharacters = await prisma.character.findMany({
      select: {
        id: true,
        name: true,
        vision: true,
        weaponType: true,
      },
    });

    // Convert to Character format
    const mainCharacter = {
      id: character.id,
      name: character.name,
      vision: character.vision,
      weaponType: character.weaponType,
      role: "main DPS" as const,
      erRequirement: 1.5,
      burstCost: 60,
      skillCooldown: 10,
    };

    const availableCharacters = allCharacters.map(c => ({
      id: c.id,
      name: c.name,
      vision: c.vision,
      weaponType: c.weaponType,
      role: "support" as const,
      erRequirement: 1.5,
      burstCost: 60,
      skillCooldown: 10,
    }));

    const suggestions = teamBuilder.suggestOptimalTeam(mainCharacter, availableCharacters);

    return ok(suggestions, { maxAgeSec: 300 });
  }, { prefix: "team-builder", limit: 30 })
);