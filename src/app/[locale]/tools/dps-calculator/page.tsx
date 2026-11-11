import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import {
  DpsCalculatorClient,
  type ImportedBuildStats,
} from "./DpsCalculatorClient";
import { createStaticPageMetadata } from "@/lib/seo/metadata";

interface DpsCalculatorPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createStaticPageMetadata(locale, "tools/dps-calculator");
}

/**
 * BỔ SUNG (2026-09-22): `/api/tools/dps` trước đây trả `501` (chưa map
 * input sang 6 tham số của `calculateExpectedDPS()`) — đã hoàn thiện
 * backend (xem `route.ts`, hàm `findNearestLevelRow` + test riêng). Đây
 * là UI thật đầu tiên cho công cụ này.
 */
export default async function DpsCalculatorPage({
  params,
  searchParams: searchParamsPromise,
}: DpsCalculatorPageProps) {
  const [{ locale }, searchParams] = await Promise.all([
    params,
    searchParamsPromise,
  ]);
  setRequestLocale(locale);

  const [characters, weapons] = await Promise.all([
    prisma.character.findMany({
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
      select: { id: true, name: true, vision: true, weaponType: true, rarity: true, iconUrl: true },
    }),
    prisma.weapon.findMany({
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        type: true,
        rarity: true,
        iconUrl: true,
        iconUrlOriginal: true,
      },
    }),
  ]);

  const singleValue = (value: string | string[] | undefined) =>
    typeof value === "string" ? value : undefined;
  const parseNumber = (
    value: string | string[] | undefined,
    min: number,
    max: number
  ): number | undefined => {
    const raw = singleValue(value);
    if (raw === undefined || raw.trim() === "") return undefined;
    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= min && parsed <= max
      ? parsed
      : undefined;
  };

  const characterId = singleValue(searchParams.characterId);
  const importedCharacter = characterId
    ? characters.find((character) => character.id === characterId)
    : undefined;
  const importedValues = {
    totalATK: parseNumber(searchParams.atk, 0, 100_000),
    critRate: parseNumber(searchParams.critRate, 0, 100),
    critDmg: parseNumber(searchParams.critDmg, 0, 400),
    em: parseNumber(searchParams.em, 0, 10_000),
    er: parseNumber(searchParams.er, 0, 1_000),
    damageBonus: parseNumber(searchParams.damageBonus, 0, 1_000),
  };
  const characterLevel = parseNumber(searchParams.characterLevel, 1, 90);
  const weaponLevel = parseNumber(searchParams.weaponLevel, 1, 90);
  const weaponRefinement = parseNumber(searchParams.weaponRefinement, 1, 5);
  const normalTalent = parseNumber(searchParams.normalTalent, 1, 15);
  const skillTalent = parseNumber(searchParams.skillTalent, 1, 15);
  const burstTalent = parseNumber(searchParams.burstTalent, 1, 15);
  const weaponIconKey = singleValue(searchParams.weaponIconKey);
  const importedBuild: ImportedBuildStats | undefined =
    singleValue(searchParams.source) === "enka" &&
    importedCharacter &&
    importedValues.totalATK !== undefined &&
    importedValues.critRate !== undefined &&
    importedValues.critDmg !== undefined &&
    importedValues.em !== undefined &&
    importedValues.er !== undefined &&
    importedValues.damageBonus !== undefined &&
    characterLevel !== undefined &&
    weaponLevel !== undefined &&
    weaponRefinement !== undefined &&
    normalTalent !== undefined &&
    skillTalent !== undefined &&
    burstTalent !== undefined
      ? {
          characterId: importedCharacter.id,
          characterLevel,
          weaponLevel,
          weaponRefinement,
          talentLevels: {
            normalAttack: normalTalent,
            elementalSkill: skillTalent,
            elementalBurst: burstTalent,
          },
          weaponIconKey:
            weaponIconKey && /^[a-zA-Z0-9_]{1,120}$/.test(weaponIconKey)
              ? weaponIconKey
              : null,
          totalStats: {
            totalATK: importedValues.totalATK,
            critRate: importedValues.critRate,
            critDmg: importedValues.critDmg,
            em: importedValues.em,
            er: importedValues.er,
            damageBonus: importedValues.damageBonus,
          },
        }
      : undefined;

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-2">
          Máy tính DPS
        </h1>
        <p className="text-text-secondary mb-8">
          Ước tính sát thương từ chỉ số showcase Enka hoặc build tự nhập. Kết quả dùng hệ số
          thiên phú và chu kỳ mẫu; không thay thế mô phỏng đầy đủ kỹ năng, buff đội hình hay
          trình tự phản ứng thực tế.
        </p>

        <DpsCalculatorClient
          characters={characters}
          weapons={weapons}
          importedBuild={importedBuild}
        />
      </div>
    </div>
  );
}
