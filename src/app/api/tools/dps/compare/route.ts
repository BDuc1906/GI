import type { NextRequest } from "next/server";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import { DPSCalculator } from "@/core/game/dps-calculator";
import {
  findNearestLevelRow,
  resolveTalentMultiplier,
  type TalentCombatData,
  type StatByLevelRow,
} from "../route";
import { z } from "zod";

export const revalidate = 0;
export const dynamic = "force-dynamic";

const showdownSchema = z.object({
  characterId: z.string().min(1),
  characterLevel: z.number().min(1).max(90).default(90),
  talentLevels: z
    .object({
      normalAttack: z.number().min(1).max(15).default(10),
      elementalSkill: z.number().min(1).max(15).default(10),
      elementalBurst: z.number().min(1).max(15).default(10),
    })
    .default({ normalAttack: 10, elementalSkill: 10, elementalBurst: 10 }),
  mode: z.enum(["weapons", "totalStats"]).default("weapons"),
  // Dùng khi mode === "weapons"
  weaponA: z
    .object({
      weaponId: z.string().min(1),
      weaponLevel: z.number().min(1).max(90).default(90),
      weaponRefinement: z.number().min(1).max(5).default(1),
    })
    .optional(),
  weaponB: z
    .object({
      weaponId: z.string().min(1),
      weaponLevel: z.number().min(1).max(90).default(90),
      weaponRefinement: z.number().min(1).max(5).default(1),
    })
    .optional(),
  // Dùng khi mode === "totalStats"
  totalStatsA: z
    .object({
      totalATK: z.number().min(0).default(2000),
      critRate: z.number().min(0).max(100).default(60),
      critDmg: z.number().min(0).max(400).default(120),
      em: z.number().min(0).default(0),
      er: z.number().min(0).default(100),
      damageBonus: z.number().min(0).default(0),
    })
    .optional(),
  totalStatsB: z
    .object({
      totalATK: z.number().min(0).default(2000),
      critRate: z.number().min(0).max(100).default(60),
      critDmg: z.number().min(0).max(400).default(120),
      em: z.number().min(0).default(0),
      er: z.number().min(0).default(100),
      damageBonus: z.number().min(0).default(0),
    })
    .optional(),
  labelA: z.string().default("Phương án A"),
  labelB: z.string().default("Phương án B"),
  modifiers: z
    .object({
      enemyRes: z.number().min(-100).max(100).default(10),
      defenseReduction: z.number().min(0).max(100).default(0),
      damageBonus: z.number().min(0).default(0),
      vulnerability: z.number().min(0).default(0),
      reaction: z
        .enum([
          "Vaporize",
          "Melt",
          "Overload",
          "Superconduct",
          "Electro-Charged",
          "Shatter",
          "Burning",
          "Bloom",
          "Hyperbloom",
          "Burgeon",
          "Quicken",
          "Aggravate",
          "Spread",
          "Crystallize",
          "Frozen",
        ])
        .default("Vaporize"),
      reactionDirection: z.enum(["forward", "reverse"]).default("forward"),
    })
    .default(() => ({
      enemyRes: 10,
      defenseReduction: 0,
      damageBonus: 0,
      vulnerability: 0,
      reaction: "Vaporize" as const,
      reactionDirection: "forward" as const,
    })),
  rotation: z
    .object({
      normalAttacks: z.number().min(0).default(3),
      skillCasts: z.number().min(0).default(1),
      burstCasts: z.number().min(0).default(1),
      reactionChance: z.number().min(0).max(1).default(1),
    })
    .default(() => ({
      normalAttacks: 3,
      skillCasts: 1,
      burstCasts: 1,
      reactionChance: 1,
    })),
});

export const POST = withErrorHandling(
  withRateLimit(async (req: NextRequest) => {
    const body = await req.json();
    const parsed = showdownSchema.safeParse(body);

    if (!parsed.success) {
      throw ApiError.badRequest("Dữ liệu đối đầu không hợp lệ", parsed.error.flatten().fieldErrors);
    }
    const input = parsed.data;

    const [character, talent] = await Promise.all([
      prisma.character.findUnique({
        where: { id: input.characterId },
        select: { id: true, name: true, ascensionStat: true, statsByLevel: true },
      }),
      prisma.talent.findUnique({ where: { id: input.characterId }, select: { raw: true } }),
    ]);

    if (!character) throw ApiError.notFound(`Không tìm thấy nhân vật "${input.characterId}"`);

    const talentRaw = talent?.raw as
      | { combat1?: TalentCombatData; combat2?: TalentCombatData; combat3?: TalentCombatData }
      | undefined;
    const normalAttackMultiplier = resolveTalentMultiplier(talentRaw?.combat1, input.talentLevels.normalAttack);
    const skillMultiplier = resolveTalentMultiplier(talentRaw?.combat2, input.talentLevels.elementalSkill);
    const burstMultiplier = resolveTalentMultiplier(talentRaw?.combat3, input.talentLevels.elementalBurst);

    if (normalAttackMultiplier === null || skillMultiplier === null || burstMultiplier === null) {
      throw new ApiError(
        422,
        "MISSING_TALENT_DATA",
        `Nhân vật "${character.name}" chưa có đủ dữ liệu bảng % thiên phú trong DB`
      );
    }

    const talents = {
      normalAttack: normalAttackMultiplier,
      elementalSkill: skillMultiplier,
      elementalBurst: burstMultiplier,
    };

    const calculator = new DPSCalculator();

    if (input.mode === "totalStats") {
      if (!input.totalStatsA || !input.totalStatsB) {
        throw ApiError.badRequest("Chế độ totalStats yêu cầu cả totalStatsA và totalStatsB");
      }

      const resultA = calculator.calculateExpectedDPSFromTotalStats(
        input.characterLevel,
        input.totalStatsA,
        talents,
        input.modifiers,
        input.rotation
      );

      const resultB = calculator.calculateExpectedDPSFromTotalStats(
        input.characterLevel,
        input.totalStatsB,
        talents,
        input.modifiers,
        input.rotation
      );

      const showdown = calculator.calculateShowdown(resultA, resultB, input.labelA, input.labelB);

      return ok({
        characterName: character.name,
        showdown,
      });
    }

    // Chế độ so sánh 2 Vũ khí (mode === "weapons")
    if (!input.weaponA || !input.weaponB) {
      throw ApiError.badRequest("Chế độ so sánh vũ khí yêu cầu weaponA và weaponB");
    }

    const [weaponA, weaponB] = await Promise.all([
      prisma.weapon.findUnique({
        where: { id: input.weaponA.weaponId },
        select: { id: true, name: true, subStatName: true, subStatValue: true, statsByLevel: true },
      }),
      prisma.weapon.findUnique({
        where: { id: input.weaponB.weaponId },
        select: { id: true, name: true, subStatName: true, subStatValue: true, statsByLevel: true },
      }),
    ]);

    if (!weaponA) throw ApiError.notFound(`Không tìm thấy vũ khí A "${input.weaponA.weaponId}"`);
    if (!weaponB) throw ApiError.notFound(`Không tìm thấy vũ khí B "${input.weaponB.weaponId}"`);

    const charRows = (character.statsByLevel as unknown as StatByLevelRow[]) ?? [];
    const charRow = findNearestLevelRow(charRows, input.characterLevel);
    if (!charRow) throw new ApiError(422, "MISSING_STATS", `Thiếu dữ liệu statsByLevel của nhân vật`);

    const weaponRowsA = (weaponA.statsByLevel as unknown as StatByLevelRow[]) ?? [];
    const weaponRowsB = (weaponB.statsByLevel as unknown as StatByLevelRow[]) ?? [];

    const rowA = findNearestLevelRow(weaponRowsA, input.weaponA.weaponLevel);
    const rowB = findNearestLevelRow(weaponRowsB, input.weaponB.weaponLevel);
    if (!rowA || !rowB) throw new ApiError(422, "MISSING_STATS", `Thiếu dữ liệu statsByLevel của vũ khí`);

    // Bộ Thánh di vật tiêu chuẩn để so sánh công bằng giữa 2 vũ khí
    const standardArtifacts = {
      flowerHp: 4780,
      plumeAtk: 311,
      sandsMainStat: "ATK%",
      sandsValue: 46.6,
      gobletMainStat: "Elemental DMG%",
      gobletValue: 46.6,
      circletMainStat: "CRIT Rate%",
      circletValue: 31.1,
      subStats: {
        critRate: 35.0,
        critDmg: 80.0,
        atkPercent: 15.0,
        hpPercent: 0,
        defPercent: 0,
        em: 60,
        erPercent: 15.0,
      },
    };

    const resultA = calculator.calculateExpectedDPS(
      {
        level: input.characterLevel,
        baseHp: charRow.hp ?? 0,
        baseAtk: charRow.attack ?? 0,
        baseDef: charRow.defense ?? 0,
        ascensionStat: character.ascensionStat ?? "",
        ascensionStatValue: charRow.specialized ?? 0,
      },
      {
        level: input.weaponA.weaponLevel,
        baseAtk: rowA.baseAtk ?? rowA.attack ?? 0,
        subStat: weaponA.subStatName ?? "",
        subStatValue: parseFloat(String(weaponA.subStatValue ?? "0").replace(/[^0-9.]/g, "")) || 0,
        refinement: input.weaponA.weaponRefinement,
      },
      standardArtifacts,
      talents,
      input.modifiers,
      input.rotation
    );

    const resultB = calculator.calculateExpectedDPS(
      {
        level: input.characterLevel,
        baseHp: charRow.hp ?? 0,
        baseAtk: charRow.attack ?? 0,
        baseDef: charRow.defense ?? 0,
        ascensionStat: character.ascensionStat ?? "",
        ascensionStatValue: charRow.specialized ?? 0,
      },
      {
        level: input.weaponB.weaponLevel,
        baseAtk: rowB.baseAtk ?? rowB.attack ?? 0,
        subStat: weaponB.subStatName ?? "",
        subStatValue: parseFloat(String(weaponB.subStatValue ?? "0").replace(/[^0-9.]/g, "")) || 0,
        refinement: input.weaponB.weaponRefinement,
      },
      standardArtifacts,
      talents,
      input.modifiers,
      input.rotation
    );

    const labelA = `${weaponA.name} (R${input.weaponA.weaponRefinement})`;
    const labelB = `${weaponB.name} (R${input.weaponB.weaponRefinement})`;

    const showdown = calculator.calculateShowdown(resultA, resultB, labelA, labelB);

    return ok({
      characterName: character.name,
      weaponAName: weaponA.name,
      weaponBName: weaponB.name,
      showdown,
    });
  }, { prefix: "dps-compare", limit: 30 })
);
