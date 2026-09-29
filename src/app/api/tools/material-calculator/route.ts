import type { NextRequest } from "next/server";
import { ok } from "@/lib/api/response";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import {
  buildAscensionPlan,
  buildTalentPlan,
  matchDomains,
  type MatchedDomain,
  type PlanMaterial,
  type RawAscensionPhase,
  type RawDomain,
  type RawTalentLevel,
} from "@/lib/game/real-material-plan";
import { z } from "zod";

export const revalidate = 60;
// Cache thật: xem comment "VỀ CACHE" ở src/lib/api/response.ts (revalidate ở đây chỉ để tài liệu, force-dynamic vô hiệu hoá nó).
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

/**
 * BUG NGHIÊM TRỌNG ĐÃ SỬA (2026-09-22): route này trước đây gọi
 * `MaterialCalculator.calculateAscensionMaterials()` — hàm dùng bảng
 * hardcode GIẢ ("Jewel Sliver", "Local Specialty", "Boss Material" — tên
 * chung chung, không phải vật liệu thật của nhân vật nào; còn map nhầm
 * nguyên tố Anemo sang gem của Electro, và gán nguyên tố -> "vùng" bí
 * cảnh vô nghĩa). Trong khi DB ĐÃ CÓ dữ liệu thật đầy đủ:
 * `Character.ascensionMaterials`/`talentMaterials` (seed từ genshin-db,
 * vd Diluc -> "Agnidus Agate Sliver", "Small Lamp Grass", "Recruit's
 * Insignia") và `Domain.materials` + `daysOfWeek` thật. Giờ tính từ dữ
 * liệu thật; KHÔNG còn ước lượng resin/số ngày farm vì cần tỉ lệ rớt
 * thật mà DB không có — thà không hiện còn hơn hiện số bịa.
 */
interface MaterialPlanResult {
  characterName: string;
  ascension: { currentLevel: number; targetLevel: number; materials: PlanMaterial[] };
  talent?: { materials: PlanMaterial[] };
  domains: MatchedDomain[];
}

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
        ascensionMaterials: true,
        talentMaterials: true,
      },
    });

    if (!character) {
      throw ApiError.notFound("Không tìm thấy nhân vật");
    }

    const ascensionMaterials = buildAscensionPlan(
      character.ascensionMaterials as unknown as RawAscensionPhase[] | null,
      parsed.data.currentLevel,
      parsed.data.targetLevel
    );
    if (ascensionMaterials === null) {
      throw new ApiError(
        422,
        "MISSING_MATERIAL_DATA",
        `Nhân vật "${character.name}" chưa có dữ liệu nguyên liệu đột phá trong DB`
      );
    }

    const result: MaterialPlanResult = {
      characterName: character.name,
      ascension: {
        currentLevel: parsed.data.currentLevel,
        targetLevel: parsed.data.targetLevel,
        materials: ascensionMaterials,
      },
      domains: [],
    };

    let talentMaterials: PlanMaterial[] = [];
    if (parsed.data.includeTalent) {
      const planned = buildTalentPlan(
        character.talentMaterials as unknown as RawTalentLevel[] | null,
        parsed.data.talentLevels || { normalAttack: 1, elementalSkill: 1, elementalBurst: 1 },
        parsed.data.targetTalentLevels || { normalAttack: 10, elementalSkill: 10, elementalBurst: 10 }
      );
      if (planned === null) {
        throw new ApiError(
          422,
          "MISSING_MATERIAL_DATA",
          `Nhân vật "${character.name}" chưa có dữ liệu nguyên liệu thiên phú trong DB`
        );
      }
      talentMaterials = planned;
      result.talent = { materials: talentMaterials };
    }

    // Bí cảnh THẬT có rớt nguyên liệu cần (loại Mora — bí cảnh nào cũng có).
    const neededNames = [...ascensionMaterials, ...talentMaterials]
      .map((m) => m.name)
      .filter((n) => n !== "Mora");
    if (neededNames.length > 0) {
      const domains = await prisma.domain.findMany({
        where: { category: { in: ["weapon", "talent"] } },
        select: { id: true, name: true, category: true, daysOfWeek: true, materials: true },
      });
      result.domains = matchDomains(domains as unknown as RawDomain[], neededNames);
    }

    return ok(result, { maxAgeSec: 60 });
  }, { prefix: "material-calculator", limit: 30 })
);