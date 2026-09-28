import type { NextRequest } from "next/server";
import { ApiError, withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";
import { ok } from "@/lib/api/response";
import { prisma } from "@/lib/db/prisma";
import { DPSCalculator } from "@/lib/game/dps-calculator";
import { z } from "zod";

export const revalidate = 0; // input động (build tự chọn), không cache theo query string
export const dynamic = "force-dynamic";

const dpsRequestSchema = z.object({
  characterId: z.string().min(1),
  weaponId: z.string().min(1),
  characterLevel: z.number().min(1).max(90).default(90),
  weaponLevel: z.number().min(1).max(90).default(90),
  weaponRefinement: z.number().min(1).max(5).default(1),
  talentLevels: z
    .object({
      normalAttack: z.number().min(1).max(15).default(10),
      elementalSkill: z.number().min(1).max(15).default(10),
      elementalBurst: z.number().min(1).max(15).default(10),
    })
    .default({ normalAttack: 10, elementalSkill: 10, elementalBurst: 10 }),
  artifacts: z
    .object({
      flowerHp: z.number().min(0).default(4780),
      plumeAtk: z.number().min(0).default(311),
      sandsMainStat: z.string().default("ATK%"),
      sandsValue: z.number().min(0).default(46.6),
      gobletMainStat: z.string().default("ATK%"),
      gobletValue: z.number().min(0).default(46.6),
      circletMainStat: z.string().default("CRIT Rate%"),
      circletValue: z.number().min(0).default(31.1),
      subStats: z
        .object({
          critRate: z.number().min(0).max(100).default(0),
          critDmg: z.number().min(0).max(400).default(0),
          atkPercent: z.number().min(0).default(0),
          hpPercent: z.number().min(0).default(0),
          defPercent: z.number().min(0).default(0),
          em: z.number().min(0).default(0),
          erPercent: z.number().min(0).default(0),
        })
        .default(() => ({
          critRate: 0,
          critDmg: 0,
          atkPercent: 0,
          hpPercent: 0,
          defPercent: 0,
          em: 0,
          erPercent: 0,
        })),
    })
    .default(() => ({
      flowerHp: 4780,
      plumeAtk: 311,
      sandsMainStat: "ATK%",
      sandsValue: 46.6,
      gobletMainStat: "ATK%",
      gobletValue: 46.6,
      circletMainStat: "CRIT Rate%",
      circletValue: 31.1,
      subStats: {
        critRate: 0,
        critDmg: 0,
        atkPercent: 0,
        hpPercent: 0,
        defPercent: 0,
        em: 0,
        erPercent: 0,
      },
    })),
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

/**
 * BỔ SUNG (2026-09-22) — BUG NGHIÊM TRỌNG ĐÃ SỬA: trước đây `talents.
 * normalAttack/elementalSkill/elementalBurst` (cấp độ thiên phú, 1-15)
 * được dùng THẲNG làm hệ số nhân ATK (`totalATK * 10` cho cấp 10) — sai
 * hoàn toàn so với game thật, nơi mỗi cấp thiên phú tương ứng 1 % ATK cụ
 * thể theo BẢNG RIÊNG của từng nhân vật (thường 40%-700% tuỳ đòn, không
 * phải "x10"). Sai số này khiến DPS tính ra cao gấp 5-25 lần thực tế tuỳ
 * nhân vật.
 *
 * Đã xác nhận: `Talent.raw` (đã có sẵn trong DB, seed từ genshin-db) chứa
 * đúng bảng multiplier thật —
 * `combat1/2/3.attributes.parameters.param1` là mảng 15 phần tử (cấp
 * 1-15), giá trị là % ATK dạng thập phân (vd 1.7731 = 177.31%). Dùng
 * `param1` (giá trị đầu tiên) làm % chính cho từng loại đòn — đơn giản
 * hoá có chủ đích: nhiều nhân vật có combo nhiều đòn/nhiều hit trong 1 kỹ
 * năng (param2, param3...) nhưng không có quy tắc chung nào để tự động
 * xác định "đòn chính" cho MỌI nhân vật — param1 luôn là đòn/tham số đầu
 * tiên trong mô tả kỹ năng, hợp lý làm giá trị đại diện mặc định.
 */
interface TalentCombatData {
  attributes?: {
    parameters?: {
      param1?: number[];
    };
  };
}

export function resolveTalentMultiplier(combat: TalentCombatData | undefined, level: number): number | null {
  const params = combat?.attributes?.parameters?.param1;
  if (!params || params.length === 0) return null;
  const index = Math.min(Math.max(level, 1), params.length) - 1;
  return params[index] ?? null;
}

interface StatByLevelRow {
  level: number;
  ascension: number | null;
  hp?: number | null;
  attack?: number | null;
  defense?: number | null;
  baseAtk?: number | null;
  specialized?: number | null;
  subStatValue?: number | null;
}

/**
 * Tìm dòng statsByLevel khớp nhất với `targetLevel` — bảng statsByLevel
 * chỉ có dữ liệu ở các mốc đột phá (level 1,20,20+,40,40+,50,50+,60,60+,
 * 70,70+,80,80+,90), không phải MỌI level từ 1-90. Ưu tiên dòng có level
 * ĐÚNG BẰNG targetLevel; nếu không có, lấy dòng gần nhất mà level <=
 * targetLevel (giống cách CharacterLevelSlider.tsx snap ở client, viết
 * lại ở server vì route này cần tính, không chỉ hiển thị).
 */
export function findNearestLevelRow(rows: StatByLevelRow[], targetLevel: number): StatByLevelRow | null {
  if (!rows || rows.length === 0) return null;
  const exact = rows.filter((r) => r.level === targetLevel);
  if (exact.length > 0) {
    // Nhiều dòng cùng level (trước/sau đột phá) -> lấy dòng ascension cao hơn
    return exact.reduce((best, r) => ((r.ascension ?? 0) > (best.ascension ?? 0) ? r : best));
  }
  const below = rows.filter((r) => r.level <= targetLevel);
  if (below.length === 0) return rows[0];
  return below.reduce((best, r) => (r.level > best.level ? r : best));
}

export const POST = withErrorHandling(
  withRateLimit(async (req: NextRequest) => {
    const body = await req.json();
    const parsed = dpsRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw ApiError.badRequest("Dữ liệu DPS calculation không hợp lệ", parsed.error.flatten().fieldErrors);
    }
    const input = parsed.data;

    const [character, weapon, talent] = await Promise.all([
      prisma.character.findUnique({
        where: { id: input.characterId },
        select: { id: true, name: true, ascensionStat: true, statsByLevel: true },
      }),
      prisma.weapon.findUnique({
        where: { id: input.weaponId },
        select: { id: true, name: true, subStatName: true, subStatValue: true, statsByLevel: true },
      }),
      prisma.talent.findUnique({ where: { id: input.characterId }, select: { raw: true } }),
    ]);

    if (!character) throw ApiError.notFound(`Không tìm thấy nhân vật "${input.characterId}"`);
    if (!weapon) throw ApiError.notFound(`Không tìm thấy vũ khí "${input.weaponId}"`);

    const talentRaw = talent?.raw as { combat1?: TalentCombatData; combat2?: TalentCombatData; combat3?: TalentCombatData } | undefined;
    const normalAttackMultiplier = resolveTalentMultiplier(talentRaw?.combat1, input.talentLevels.normalAttack);
    const skillMultiplier = resolveTalentMultiplier(talentRaw?.combat2, input.talentLevels.elementalSkill);
    const burstMultiplier = resolveTalentMultiplier(talentRaw?.combat3, input.talentLevels.elementalBurst);

    if (normalAttackMultiplier === null || skillMultiplier === null || burstMultiplier === null) {
      throw new ApiError(
        422,
        "MISSING_TALENT_DATA",
        `Nhân vật "${character.name}" chưa có đủ dữ liệu bảng % thiên phú (Talent.raw) để tính DPS chính xác`
      );
    }

    const charRows = (character.statsByLevel as unknown as StatByLevelRow[]) ?? [];
    const weaponRows = (weapon.statsByLevel as unknown as StatByLevelRow[]) ?? [];

    const charRow = findNearestLevelRow(charRows, input.characterLevel);
    const weaponRow = findNearestLevelRow(weaponRows, input.weaponLevel);

    if (!charRow) {
      throw new ApiError(422, "MISSING_STATS", `Nhân vật "${character.name}" chưa có dữ liệu statsByLevel để tính DPS`);
    }
    if (!weaponRow) {
      throw new ApiError(422, "MISSING_STATS", `Vũ khí "${weapon.name}" chưa có dữ liệu statsByLevel để tính DPS`);
    }

    const calculator = new DPSCalculator();

    const result = calculator.calculateExpectedDPS(
      {
        level: input.characterLevel,
        baseHp: charRow.hp ?? 0,
        baseAtk: charRow.attack ?? 0,
        baseDef: charRow.defense ?? 0,
        ascensionStat: character.ascensionStat ?? "",
        ascensionStatValue: charRow.specialized ?? 0,
      },
      {
        level: input.weaponLevel,
        baseAtk: weaponRow.baseAtk ?? weaponRow.attack ?? 0,
        subStat: weapon.subStatName ?? "",
        // subStatValue lưu dạng chuỗi (vd "12.0%") — parse phần số, bỏ qua
        // phần trăm/ký tự khác, mặc định 0 nếu không parse được.
        subStatValue: parseFloat(String(weapon.subStatValue ?? "0").replace(/[^0-9.]/g, "")) || 0,
        refinement: input.weaponRefinement,
      },
      input.artifacts,
      // Truyền % ATK ĐÃ RESOLVE từ bảng thật (Talent.raw), KHÔNG phải cấp
      // độ thô (1-15) — xem comment `resolveTalentMultiplier` phía trên.
      {
        normalAttack: normalAttackMultiplier,
        elementalSkill: skillMultiplier,
        elementalBurst: burstMultiplier,
      },
      {
        enemyRes: input.modifiers.enemyRes,
        defenseReduction: input.modifiers.defenseReduction,
        damageBonus: input.modifiers.damageBonus,
        vulnerability: input.modifiers.vulnerability,
        reaction: input.modifiers.reaction,
        reactionDirection: input.modifiers.reactionDirection,
      },
      input.rotation
    );

    return ok({
      characterName: character.name,
      weaponName: weapon.name,
      ...result,
    });
  }, { prefix: "dps-calculator", limit: 30 })
);
