import type { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { MaterialCalculator, type AscensionPlan, type TalentPlan } from "@/lib/game/material-calculator";
import { z } from "zod";

export const revalidate = 60;
export const dynamic = "force-dynamic";

const materialCalculatorRequestSchema = z.object({
  characterId: z.string().min(1),
  currentLevel: z.number().min(1).max(90).default(1),
  targetLevel: z.number().min(1).max(90).default(90),
  includeTalent: z.boolean().default(false),
  talentLevels: z.object({
    normalAttack: z.number().min(1).max(10).default(1),
    elementalSkill: z.number().min(1).max(10).default(1),
    elementalBurst: z.number().min(1).max(10).default(1),
  }).optional(),
  targetTalentLevels: z.object({
    normalAttack: z.number().min(1).max(10).default(10),
    elementalSkill: z.number().min(1).max(10).default(10),
    elementalBurst: z.number().min(1).max(10).default(10),
  }).optional(),
});

const materialCalculator = new MaterialCalculator();

export const POST = withErrorHandling(
  withRateLimit(async (req: NextRequest) => {
    const body = await req.json();
    const parsed = materialCalculatorRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw ApiError.badRequest("Dữ liệu material calculator không hợp lệ", parsed.error.flatten().fieldErrors);
    }

    const { prisma } = await import("@/lib/db/prisma");
    const character = await prisma.character.findUnique({
      where: { id: parsed.data.characterId },
      select: {
        id: true,
        name: true,
        vision: true,
      },
    });

    if (!character) {
      throw ApiError.notFound("Không tìm thấy nhân vật");
    }

    const ascensionPlan = materialCalculator.calculateAscensionMaterials(
      character.name,
      parsed.data.currentLevel,
      parsed.data.targetLevel,
      character.vision
    );

    const result: { ascension: AscensionPlan; talent?: TalentPlan } = { ascension: ascensionPlan };

    if (parsed.data.includeTalent) {
      const talentPlan = materialCalculator.calculateTalentMaterials(
        character.name,
        parsed.data.talentLevels || { normalAttack: 1, elementalSkill: 1, elementalBurst: 1 },
        parsed.data.targetTalentLevels || { normalAttack: 10, elementalSkill: 10, elementalBurst: 10 },
        character.vision
      );
      result.talent = talentPlan;
    }

    return ok(result, { maxAgeSec: 60 });
  }, { prefix: "material-calculator", limit: 30 })
);