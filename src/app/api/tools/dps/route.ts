import type { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { DPSCalculator } from "@/lib/game/dps-calculator";
import { z } from "zod";

export const revalidate = 60;
export const dynamic = "force-dynamic";

const dpsRequestSchema = z.object({
  characterId: z.string().min(1),
  weaponId: z.string().optional(),
  level: z.number().min(1).max(90).default(90),
  talentLevels: z.object({
    normalAttack: z.number().min(1).max(10).default(10),
    elementalSkill: z.number().min(1).max(10).default(10),
    elementalBurst: z.number().min(1).max(10).default(10),
  }).optional(),
  artifactStats: z.object({
    hp: z.number().min(0).default(0),
    atk: z.number().min(0).default(0),
    def: z.number().min(0).default(0),
    em: z.number().min(0).default(0),
    er: z.number().min(0).default(0),
    cr: z.number().min(0).max(100).default(0),
    cd: z.number().min(0).max(300).default(0),
  }).optional(),
  targetEnemy: z.object({
    level: z.number().min(1).max(100).default(90),
    defense: z.number().min(0).max(100).default(0),
    resistance: z.object({
      physical: z.number().min(-100).max(100).default(0),
      pyro: z.number().min(-100).max(100).default(0),
      hydro: z.number().min(-100).max(100).default(0),
      anemo: z.number().min(-100).max(100).default(0),
      electro: z.number().min(-100).max(100).default(0),
      cryo: z.number().min(-100).max(100).default(0),
      geo: z.number().min(-100).max(100).default(0),
      dendro: z.number().min(-100).max(100).default(0),
    }).optional(),
  }).optional(),
  includeBreakdown: z.boolean().default(false),
});

const dpsCalculator = new DPSCalculator();

export const POST = withErrorHandling(
  withRateLimit(async (req: NextRequest) => {
    const body = await req.json();
    const parsed = dpsRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw ApiError.badRequest("Dữ liệu DPS calculation không hợp lệ", parsed.error.flatten().fieldErrors);
    }

    const result = await dpsCalculator.calculateExpectedDPS(parsed.data);

    return ok(result, { maxAgeSec: 60 });
  }, { prefix: "dps-calculator", limit: 30 })
);