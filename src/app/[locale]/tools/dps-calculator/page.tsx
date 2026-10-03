import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { DpsCalculatorClient } from "./DpsCalculatorClient";
import { createStaticPageMetadata } from "@/lib/seo/metadata";

interface DpsCalculatorPageProps {
  params: Promise<{ locale: string }>;
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
export default async function DpsCalculatorPage({ params }: DpsCalculatorPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [characters, weapons] = await Promise.all([
    prisma.character.findMany({
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
      select: { id: true, name: true, vision: true, weaponType: true, rarity: true, iconUrl: true },
    }),
    prisma.weapon.findMany({
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
      select: { id: true, name: true, type: true, rarity: true, iconUrl: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-2">
          Máy tính DPS
        </h1>
        <p className="text-text-secondary mb-8">
          Nhập chỉ số build (thánh di vật, thiên phú, vũ khí) để ước tính sát
          thương trung bình mỗi giây.
        </p>

        <DpsCalculatorClient characters={characters} weapons={weapons} />
      </div>
    </div>
  );
}
