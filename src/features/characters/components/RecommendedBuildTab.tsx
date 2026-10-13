/**
 * src/features/characters/components/RecommendedBuildTab.tsx
 *
 * Tab "Build Khuyên Dùng" — Server component, hiển thị trên trang chi tiết nhân vật.
 *
 * Nguồn dữ liệu: 100% Prisma DB thật
 * - Weapon: query theo weaponType + rarity DESC, top 3
 * - Artifact: query theo rarityRange 5★, lọc theo vision
 * - Main stats: tính từ vision + weaponType chuẩn theo KQM meta
 */

import { prisma } from "@/lib/db/prisma";
import { SectionHeading } from "@/components/layout/SectionHeading";
import type { Character } from "@prisma/client";

// ─── helpers ──────────────────────────────────────────────────────────────────

/** Gợi ý main stat Sands / Goblet / Circlet theo nguyên tố và kiểu nhân vật. */
function getMainStatRecommendation(vision: string, weaponType: string) {
  const isAnemo = vision === "Anemo";
  const isGeo = vision === "Geo";
  const isPhysical =
    vision === "Cryo" || vision === "Physical";
  const isCatalyst = weaponType === "Catalyst";
  const isPhysicalBow = weaponType === "Bow" && isPhysical;
  const isReaction =
    vision === "Pyro" || vision === "Hydro" || vision === "Electro" || vision === "Dendro" || vision === "Cryo";

  // Support / Healer: ER%, Healing Bonus%/Vision DMG%, HP%
  const isSupport = weaponType === "Catalyst" && (vision === "Hydro" || vision === "Dendro");

  if (isAnemo) {
    return {
      sands: "ATK% hoặc ER%",
      goblet: "Anemo DMG%",
      circlet: "Tỉ lệ chí mạng (CR) hoặc Sát thương chí mạng (CD)",
    };
  }

  if (isGeo) {
    return {
      sands: "ATK% hoặc ER%",
      goblet: "Geo DMG%",
      circlet: "CR hoặc CD",
    };
  }

  if (isPhysicalBow) {
    return {
      sands: "ATK%",
      goblet: "Physical DMG%",
      circlet: "CR hoặc CD",
    };
  }

  if (isCatalyst && vision === "Hydro") {
    return {
      sands: "HP% hoặc ER%",
      goblet: "HP% hoặc Hydro DMG%",
      circlet: "HP% hoặc Tỉ lệ chữa lành (Healing)",
    };
  }

  if (vision === "Dendro") {
    return {
      sands: "EM hoặc ATK%",
      goblet: "Dendro DMG%",
      circlet: "CR, CD hoặc EM",
    };
  }

  if (vision === "Electro") {
    return {
      sands: "ATK% hoặc ER%",
      goblet: "Electro DMG%",
      circlet: "CR hoặc CD",
    };
  }

  if (vision === "Hydro") {
    return {
      sands: "ATK% hoặc HP%",
      goblet: "Hydro DMG%",
      circlet: "CR hoặc CD",
    };
  }

  if (vision === "Pyro") {
    return {
      sands: "ATK%",
      goblet: "Pyro DMG%",
      circlet: "CR hoặc CD",
    };
  }

  if (vision === "Cryo") {
    return {
      sands: "ATK% hoặc ER%",
      goblet: "Cryo DMG%",
      circlet: "CR",
    };
  }

  // Default fallback
  return {
    sands: "ATK%",
    goblet: `${vision} DMG%`,
    circlet: "CR hoặc CD",
  };
}

/** Tính "priority score" lọc artifact set phù hợp theo vision — ưu tiên bonus khớp nguyên tố. */
function artifactMatchScore(
  vision: string,
  twoPieceBonus: string | null,
  fourPieceBonus: string | null
): number {
  const bonusText = `${twoPieceBonus ?? ""} ${fourPieceBonus ?? ""}`.toLowerCase();
  if (bonusText.includes(vision.toLowerCase())) return 2;
  if (bonusText.includes("atk")) return 1;
  if (bonusText.includes("em") || bonusText.includes("elemental mastery")) return 1;
  return 0;
}

const STAR = "★";

// ─── component ───────────────────────────────────────────────────────────────

interface Props {
  character: Pick<Character, "id" | "name" | "vision" | "weaponType" | "rarity">;
  locale: string;
  elementColor?: string;
}

export async function RecommendedBuildTab({ character, locale, elementColor }: Props) {
  // 1. Query top 3 vũ khí phù hợp (cùng type, rarity desc)
  const topWeapons = await prisma.weapon.findMany({
    where: {
      type: character.weaponType ?? undefined,
      rarity: { gte: 4 },
    },
    orderBy: [{ rarity: "desc" }, { baseAtk: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      rarity: true,
      baseAtk: true,
      subStatName: true,
      subStatValue: true,
      effectName: true,
      iconUrl: true,
    },
    take: 3,
  });

  // 2. Query artifact sets 5★, chấm điểm phù hợp nguyên tố
  const allArtifacts = await prisma.artifactSet.findMany({
    where: { rarityRange: { hasSome: [5] } },
    select: {
      id: true,
      name: true,
      rarityRange: true,
      twoPieceBonus: true,
      fourPieceBonus: true,
      iconUrl: true,
    },
    orderBy: { name: "asc" },
    take: 30,
  });

  // Sắp xếp theo score (khớp nguyên tố ưu tiên trước) rồi lấy top 3
  const scoredArtifacts = allArtifacts
    .map((a) => ({
      ...a,
      score: artifactMatchScore(
        character.vision,
        a.twoPieceBonus,
        a.fourPieceBonus
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // 3. Main stat recommendation
  const mainStats = getMainStatRecommendation(
    character.vision,
    character.weaponType ?? ""
  );

  return (
    <section className="mb-10">
      <SectionHeading elementColor={elementColor}>Build Khuyên Dùng</SectionHeading>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ─── Vũ khí ─── */}
        <div className="lg:col-span-1">
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span>🗡️ Vũ khí đề xuất</span>
            <span className="text-xs text-text-secondary font-normal">
              ({character.weaponType})
            </span>
          </h3>
          <div className="flex flex-col gap-3">
            {topWeapons.length === 0 ? (
              <p className="text-text-secondary text-sm">Chưa có dữ liệu vũ khí.</p>
            ) : (
              topWeapons.map((w, idx) => (
                <a
                  key={w.id}
                  href={`/${locale}/weapons/${w.id}`}
                  className="flex items-center gap-3 rounded-xl border border-border bg-bg-elevated p-3 hover:border-accent-500/60 transition-colors group"
                >
                  <span
                    className="w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold shrink-0"
                    style={{
                      background: idx === 0 ? "var(--rarity-5)" : idx === 1 ? "var(--rarity-4)" : "var(--border-color)",
                      color: idx < 2 ? "#fff" : "var(--text-secondary)",
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-text-primary group-hover:text-accent-bright transition-colors truncate">
                      {w.name}
                    </div>
                    <div className="text-xs text-text-secondary flex items-center gap-2 mt-0.5">
                      <span className="text-yellow-400">{STAR.repeat(w.rarity)}</span>
                      {w.baseAtk && (
                        <span>ATK: {Math.round(w.baseAtk)}</span>
                      )}
                      {w.subStatName && w.subStatValue && (
                        <span>• {w.subStatName}: {w.subStatValue}</span>
                      )}
                    </div>
                    {w.effectName && (
                      <div className="text-xs text-accent-bright/80 mt-0.5 truncate">
                        {w.effectName}
                      </div>
                    )}
                  </div>
                </a>
              ))
            )}
          </div>
        </div>

        {/* ─── Thánh di vật ─── */}
        <div className="lg:col-span-1">
          <h3 className="font-semibold text-text-primary mb-3 flex items-center gap-2">
            <span>💠 Thánh di vật đề xuất</span>
          </h3>
          <div className="flex flex-col gap-3">
            {scoredArtifacts.length === 0 ? (
              <p className="text-text-secondary text-sm">Chưa có dữ liệu thánh di vật.</p>
            ) : (
              scoredArtifacts.map((a, idx) => (
                <a
                  key={a.id}
                  href={`/${locale}/artifacts/${a.id}`}
                  className="rounded-xl border border-border bg-bg-elevated p-3 hover:border-accent-500/60 transition-colors group"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold shrink-0 mt-0.5"
                      style={{
                        background: idx === 0 ? "var(--rarity-5)" : idx === 1 ? "var(--rarity-4)" : "var(--border-color)",
                        color: idx < 2 ? "#fff" : "var(--text-secondary)",
                      }}
                    >
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-text-primary group-hover:text-accent-bright transition-colors">
                        {a.name}
                      </div>
                      {a.twoPieceBonus && (
                        <div className="text-xs text-text-secondary mt-1 line-clamp-2">
                          <span className="font-medium text-accent-bright/70">2 món:</span>{" "}
                          {a.twoPieceBonus}
                        </div>
                      )}
                      {a.fourPieceBonus && (
                        <div className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                          <span className="font-medium text-accent-bright/70">4 món:</span>{" "}
                          {a.fourPieceBonus}
                        </div>
                      )}
                    </div>
                  </div>
                </a>
              ))
            )}
          </div>
        </div>

        {/* ─── Main Stats ─── */}
        <div className="lg:col-span-1">
          <h3 className="font-semibold text-text-primary mb-3">
            📊 Main Stat khuyên dùng
          </h3>
          <div className="rounded-xl border border-border bg-bg-elevated overflow-hidden">
            {[
              { slot: "⏳ Đồng hồ (Sands)", value: mainStats.sands },
              { slot: "🏺 Chén (Goblet)", value: mainStats.goblet },
              { slot: "🎭 Vương miện (Circlet)", value: mainStats.circlet },
            ].map(({ slot, value }) => (
              <div
                key={slot}
                className="flex flex-col px-4 py-3 border-b last:border-b-0 border-border"
              >
                <span className="text-xs text-text-secondary">{slot}</span>
                <span
                  className="text-sm font-semibold mt-0.5"
                  style={{ color: elementColor ?? "var(--accent-bright)" }}
                >
                  {value}
                </span>
              </div>
            ))}
            <div className="px-4 py-3 bg-bg-overlay/40">
              <p className="text-xs text-text-secondary">
                <span className="font-medium text-text-primary">Sub stats ưu tiên:</span>{" "}
                CR% ≥ CD% &gt; ATK% ≥ EM{" "}
                {character.vision === "Cryo" ? "(≥ ER%)" : ""}
              </p>
              <p className="text-xs text-text-secondary mt-1">
                Mục tiêu: CR ≥ 60% — CD ≥ 120% (tỉ lệ 1:2)
              </p>
            </div>
          </div>

          {/* Link tới DPS Calculator */}
          <div className="mt-3">
            <a
              href={`/${locale}/tools/dps-calculator`}
              className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-accent-500/60 bg-bg-elevated text-accent-bright hover:border-accent-500 hover:bg-bg-elevated/80 transition-colors w-full justify-center"
            >
              🧮 Tính DPS với build này
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
