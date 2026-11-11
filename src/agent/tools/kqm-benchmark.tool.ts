// src/agent/tools/kqm-benchmark.tool.ts
/**
 * KQM Benchmark Tool - Công cụ tính toán & so sánh vũ khí / chỉ số
 * theo chuẩn Keqing Mains (KQM) 20-Roll Standard.
 */

import { z } from "zod";
import { BaseTool, type ToolContext } from "./base.tool";
import {
  calculateKQMNeutralGear,
  compareWeaponsKQM,
  KQM_STANDARD_DPS,
  KQM_STANDARD_EM_SUPPORT,
  KQM_STANDARD_HEALER,
  type KQMDistribution,
  type SubstatKey,
} from "@/core/game/dps/kqm-standards";
import { prisma } from "@/lib/db/prisma";

const KQMBenchmarkParams = z.object({
  characterId: z.string().describe("ID của nhân vật (ví dụ: hutao, raiden, furina, neuvillette)"),
  weaponAId: z.string().describe("ID vũ khí phương án A (baseline)"),
  weaponBId: z.string().optional().describe("ID vũ khí phương án B cần so sánh (nếu muốn đối đầu)"),
  distribution: z
    .enum(["dps", "em", "healer"])
    .default("dps")
    .describe("Mô hình phân bổ substat KQM 20-roll (dps, em, healer)"),
});
type KQMBenchmarkParams = z.infer<typeof KQMBenchmarkParams>;

export interface KQMBenchmarkOutput {
  characterName: string;
  distributionLabel: string;
  weaponA: {
    id: string;
    name: string;
    atk: number;
    critRate: number;
    critDmg: number;
    em: number;
    er: number;
    critValue: number;
    avgHitMultiplier: number;
  };
  weaponB?: {
    id: string;
    name: string;
    atk: number;
    critRate: number;
    critDmg: number;
    em: number;
    er: number;
    critValue: number;
    avgHitMultiplier: number;
    relativeDPSPercent: number;
  };
  recommendation: string;
}

export class KQMBenchmarkTool extends BaseTool<KQMBenchmarkParams, KQMBenchmarkOutput> {
  name = "kqmBenchmark";
  description =
    "Tính toán chỉ số và so sánh chênh lệch DPS vũ khí theo chuẩn KQM (Keqing Mains 20-roll standard). Giúp tư vấn trang bị nào mạnh hơn một cách khoa học.";
  permission = "public" as const;
  parameters = KQMBenchmarkParams;

  protected async run(params: KQMBenchmarkParams, _context: ToolContext): Promise<KQMBenchmarkOutput> {
    const { characterId, weaponAId, weaponBId, distribution } = params;

    const char = await prisma.character.findUnique({
      where: { id: characterId },
      select: { id: true, name: true, baseAtk: true },
    });

    const [weaponA, weaponB] = await Promise.all([
      prisma.weapon.findUnique({
        where: { id: weaponAId },
        select: { id: true, name: true, atk: true, subStat: true, subStatValue: true },
      }),
      weaponBId
        ? prisma.weapon.findUnique({
            where: { id: weaponBId },
            select: { id: true, name: true, atk: true, subStat: true, subStatValue: true },
          })
        : null,
    ]);

    const charBaseAtk = char?.baseAtk || 900;
    const dist: KQMDistribution =
      distribution === "em"
        ? KQM_STANDARD_EM_SUPPORT
        : distribution === "healer"
          ? KQM_STANDARD_HEALER
          : KQM_STANDARD_DPS;

    const mapSubstat = (stat?: string | null): SubstatKey | undefined => {
      if (!stat) return undefined;
      const lower = stat.toLowerCase();
      if (lower.includes("crit rate")) return "critRate";
      if (lower.includes("crit dmg") || lower.includes("crit damage")) return "critDmg";
      if (lower.includes("attack") || lower.includes("atk")) return "atkPercent";
      if (lower.includes("energy recharge") || lower.includes("er")) return "er";
      if (lower.includes("elemental mastery") || lower.includes("em")) return "em";
      return undefined;
    };

    const parseSubValue = (val?: string | null): number | undefined => {
      if (!val) return undefined;
      const num = parseFloat(val.replace(/[^0-9.]/g, ""));
      return isNaN(num) ? undefined : num;
    };

    const configA = {
      charBaseAtk,
      weaponBaseAtk: weaponA?.atk || 510,
      weaponSubStat: mapSubstat(weaponA?.subStat),
      weaponSubStatValue: parseSubValue(weaponA?.subStatValue),
      distribution: dist,
      gobletDmgBonus: 46.6,
      setDmgBonus: 15,
      miscDmgBonus: 0,
    };

    const resA = calculateKQMNeutralGear(configA);

    let outputB: KQMBenchmarkOutput["weaponB"] = undefined;
    let recommendation = `Vũ khí ${weaponA?.name || weaponAId} đạt ${resA.critValue.toFixed(1)} CV với trung bình nhân sát thương x${resA.avgHitMultiplier.toFixed(3)}.`;

    if (weaponB) {
      const configB = {
        charBaseAtk,
        weaponBaseAtk: weaponB.atk || 510,
        weaponSubStat: mapSubstat(weaponB.subStat),
        weaponSubStatValue: parseSubValue(weaponB.subStatValue),
        distribution: dist,
        gobletDmgBonus: 46.6,
        setDmgBonus: 15,
        miscDmgBonus: 0,
      };

      const comparison = compareWeaponsKQM(configA, configB);
      const resB = comparison.challengerResult;
      const relPct = Number(comparison.relativeDPS.toFixed(2));

      outputB = {
        id: weaponB.id,
        name: weaponB.name,
        atk: resB.totalAtk,
        critRate: resB.critRate,
        critDmg: resB.critDmg,
        em: resB.em,
        er: resB.er,
        critValue: resB.critValue,
        avgHitMultiplier: resB.avgHitMultiplier,
        relativeDPSPercent: relPct,
      };

      if (relPct > 0) {
        recommendation = `${weaponB.name} mạnh hơn ${weaponA?.name || weaponAId} khoảng +${relPct}% DPS theo chuẩn KQM 20-roll.`;
      } else if (relPct < 0) {
        recommendation = `${weaponA?.name || weaponAId} mạnh hơn ${weaponB.name} khoảng +${Math.abs(relPct)}% DPS theo chuẩn KQM 20-roll.`;
      } else {
        recommendation = `Cả hai vũ khí có lượng sát thương kỳ vọng tương đương nhau trong điều kiện chuẩn.`;
      }
    }

    return {
      characterName: char?.name || characterId,
      distributionLabel: dist.label,
      weaponA: {
        id: weaponA?.id || weaponAId,
        name: weaponA?.name || weaponAId,
        atk: resA.totalAtk,
        critRate: resA.critRate,
        critDmg: resA.critDmg,
        em: resA.em,
        er: resA.er,
        critValue: resA.critValue,
        avgHitMultiplier: resA.avgHitMultiplier,
      },
      weaponB: outputB,
      recommendation,
    };
  }
}
