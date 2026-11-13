/**
 * src/features/dps/DpsVisualizationPanel.tsx
 *
 * Data Visualization Panel theo phong cách Taste Skill / Impeccable
 * - DPS breakdown bars (Normal / Skill / Burst / Reactions)
 * - Enemy resistance status badges
 * - Compact high-legibility visual hierarchy
 */

"use client";

import { useMemo } from "react";

// ---------------------------------------------------------------------------
// DPS Source Breakdown Types
// ---------------------------------------------------------------------------

export interface DpsSourceBreakdown {
  /** DPS từ Normal Attack */
  normalAtk: number;
  /** DPS từ Charged Attack */
  chargedAtk: number;
  /** DPS từ Elemental Skill */
  skill: number;
  /** DPS từ Elemental Burst */
  burst: number;
  /** DPS từ Elemental Reactions (Vaporize, Melt, Aggravate, etc.) */
  reactions: number;
  /** DPS từ off-field / hiệu ứng khác */
  offField: number;
}

export interface TeamDpsSummary {
  /** Tên nhân vật */
  charName: string;
  /** Nguyên tố */
  element: GenshinElement;
  /** Tổng DPS của nhân vật trong rotation */
  totalDps: number;
  /** Phân tách nguồn DPS */
  breakdown: DpsSourceBreakdown;
  /** Icon avatar */
  iconUrl?: string;
}

export type GenshinElement =
  | "Pyro"
  | "Hydro"
  | "Electro"
  | "Cryo"
  | "Anemo"
  | "Geo"
  | "Dendro"
  | "Physical";

// ---------------------------------------------------------------------------
// Enemy Resistance Badge Types
// ---------------------------------------------------------------------------

export interface EnemyResistBadge {
  element: GenshinElement | "All";
  /** RES% (có thể âm khi bị giảm kháng) */
  resistance: number;
  /** "phase" mechanics (e.g. "Shield Phase", "Downed") */
  phase?: string;
}

// ---------------------------------------------------------------------------
// Color Maps
// ---------------------------------------------------------------------------

const ELEMENT_COLORS: Record<GenshinElement | "Physical", string> = {
  Pyro: "text-orange-400 bg-orange-400/10 border-orange-500/40",
  Hydro: "text-blue-400 bg-blue-400/10 border-blue-500/40",
  Electro: "text-purple-400 bg-purple-400/10 border-purple-500/40",
  Cryo: "text-cyan-300 bg-cyan-400/10 border-cyan-500/40",
  Anemo: "text-teal-400 bg-teal-400/10 border-teal-500/40",
  Geo: "text-yellow-600 bg-yellow-600/10 border-yellow-600/40",
  Dendro: "text-green-400 bg-green-400/10 border-green-500/40",
  Physical: "text-slate-400 bg-slate-400/10 border-slate-500/40",
};

const ELEMENT_BAR_COLORS: Record<GenshinElement | "Physical", string> = {
  Pyro: "bg-orange-400",
  Hydro: "bg-blue-400",
  Electro: "bg-purple-400",
  Cryo: "bg-cyan-300",
  Anemo: "bg-teal-400",
  Geo: "bg-yellow-600",
  Dendro: "bg-green-400",
  Physical: "bg-slate-400",
};

const ELEMENT_VN_NAMES: Record<GenshinElement | "Physical" | "All", string> = {
  Pyro: "Hỏa",
  Hydro: "Thủy",
  Electro: "Lôi",
  Cryo: "Băng",
  Anemo: "Phong",
  Geo: "Nham",
  Dendro: "Thảo",
  Physical: "Vật Lý",
  All: "Tất Cả",
};

const SOURCE_LABELS: Record<keyof DpsSourceBreakdown, string> = {
  normalAtk: "Normal / Charged",
  chargedAtk: "Charged Atk",
  skill: "Elemental Skill",
  burst: "Elemental Burst",
  reactions: "Phản Ứng",
  offField: "Off-Field",
};

const SOURCE_COLORS: Record<keyof DpsSourceBreakdown, string> = {
  normalAtk: "bg-slate-400",
  chargedAtk: "bg-slate-300",
  skill: "bg-blue-400",
  burst: "bg-purple-400",
  reactions: "bg-amber-400",
  offField: "bg-teal-400",
};

// ---------------------------------------------------------------------------
// Resistance Badge Component
// ---------------------------------------------------------------------------

function ResistBadge({ badge }: { badge: EnemyResistBadge }) {
  const isDebuff = badge.resistance < 0;
  const isNeutral = badge.resistance === 0;

  const labelColor =
    badge.element === "All"
      ? "text-slate-300"
      : ELEMENT_COLORS[badge.element as GenshinElement].split(" ").find((color) => color.startsWith("text-")) ?? "text-text-secondary";

  const sign = badge.resistance > 0 ? "+" : "";

  return (
    <div
      className={`inline-flex flex-col items-center text-[10px] font-mono ${labelColor}`}
      title={badge.phase}
    >
      <span className="font-bold text-[9px] uppercase tracking-wide opacity-70">
        {badge.element === "All"
          ? "Toàn Bộ"
          : `Kháng ${ELEMENT_VN_NAMES[badge.element as GenshinElement]}`}
      </span>
      <span
        className={`text-[13px] font-extrabold leading-tight ${
          isDebuff
            ? "text-red-400"
            : isNeutral
              ? "text-slate-400"
              : "text-current"
        }`}
      >
        {sign}{badge.resistance}%
      </span>
      {badge.phase && (
        <span className="text-[8px] opacity-60 mt-0.5">{badge.phase}</span>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// DPS Proportion Bar
// ---------------------------------------------------------------------------

function DpsProportionBar({
  breakdown,
  element,
  totalDps,
}: {
  breakdown: DpsSourceBreakdown;
  element: GenshinElement;
  totalDps: number;
}) {
  if (totalDps === 0) return null;

  const sources = Object.entries(breakdown) as [
    keyof DpsSourceBreakdown,
    number,
  ][];
  const nonZero = sources.filter(([, v]) => v > 0);

  return (
    <div className="space-y-1.5">
      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
        {nonZero.map(([source, value]) => {
          const pct = (value / totalDps) * 100;
          // Prioritize element color for reactions/burst, generic for normals
          const barColor =
            source === "reactions" || source === "burst"
              ? ELEMENT_BAR_COLORS[element]
              : SOURCE_COLORS[source];
          return (
            <div
              key={source}
              className={`h-full ${barColor} transition-all duration-500`}
              style={{ width: `${pct}%` }}
              title={`${SOURCE_LABELS[source]}: ${pct.toFixed(1)}%`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-0.5">
        {nonZero.map(([source, value]) => {
          const pct = (value / totalDps) * 100;
          const barColor =
            source === "reactions" || source === "burst"
              ? ELEMENT_BAR_COLORS[element]
              : SOURCE_COLORS[source];
          return (
            <div key={source} className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-sm ${barColor}`} />
              <span className="text-[9px] text-text-muted">
                {SOURCE_LABELS[source]}
              </span>
              <span className="text-[9px] font-mono text-text-secondary">
                {pct.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Team DPS Card
// ---------------------------------------------------------------------------

function TeamMemberDpsCard({
  member,
  totalTeamDps,
  rank,
}: {
  member: TeamDpsSummary;
  totalTeamDps: number;
  rank: number;
}) {
  const dpsShare = totalTeamDps > 0 ? (member.totalDps / totalTeamDps) * 100 : 0;
  const elColor = ELEMENT_COLORS[member.element];
  const elBarColor = ELEMENT_BAR_COLORS[member.element];

  return (
    <div className="rounded-xl bg-bg-secondary border border-border overflow-hidden">
      {/* Header row */}
      <div className="flex items-center gap-3 px-3 py-2.5 border-b border-border/40">
        {/* Rank */}
        <span className="text-[13px] font-bold text-text-muted w-4 shrink-0">
          #{rank}
        </span>

        {/* Avatar */}
        {member.iconUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={member.iconUrl}
            alt={member.charName}
            className="w-8 h-8 rounded-full object-cover ring-2 ring-border"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${elColor}`}
          >
            {member.charName.charAt(0)}
          </div>
        )}

        {/* Name + Element */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-text-primary truncate">
              {member.charName}
            </span>
            <span className={`text-[10px] font-medium ${elColor.split(" ").find((color) => color.startsWith("text-")) ?? "text-text-muted"}`}>
              {ELEMENT_VN_NAMES[member.element]}
            </span>
          </div>
        </div>

        {/* DPS share + number */}
        <div className="text-right shrink-0">
          <div className="text-[11px] font-bold text-text-primary font-mono">
            {(member.totalDps / 1000).toFixed(1)}K
          </div>
          <div className="text-[9px] text-text-muted font-mono">
            {dpsShare.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* DPS proportion bar + breakdown */}
      <div className="px-3 pt-2 pb-3">
        {/* Team share bar */}
        <div className="flex items-center gap-2 mb-2">
          <div className="text-[9px] text-text-muted w-14 shrink-0">Đóng góp</div>
          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${elBarColor}`}
              style={{ width: `${dpsShare}%` }}
            />
          </div>
          <span className="text-[9px] font-mono text-text-muted w-8 text-right">
            {dpsShare.toFixed(0)}%
          </span>
        </div>

        {/* Source breakdown bars */}
        <DpsProportionBar
          breakdown={member.breakdown}
          element={member.element}
          totalDps={member.totalDps}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main DPS Visualization Panel
// ---------------------------------------------------------------------------

export interface DpsVisualizationPanelProps {
  /** Danh sách thành viên team và DPS của họ */
  teamDps: TeamDpsSummary[];
  /** Badges kháng cự của kẻ địch */
  enemyResistBadges?: EnemyResistBadge[];
  /** Tên kẻ địch đang chọn */
  enemyName?: string;
  /** Thời gian rotation (giây) */
  rotationSeconds?: number;
}

export function DpsVisualizationPanel({
  teamDps,
  enemyResistBadges = [],
  enemyName = "Kẻ Địch",
  rotationSeconds = 20,
}: DpsVisualizationPanelProps) {
  const sortedMembers = useMemo(
    () => [...teamDps].sort((a, b) => b.totalDps - a.totalDps),
    [teamDps]
  );

  const totalTeamDps = useMemo(
    () => teamDps.reduce((sum, m) => sum + m.totalDps, 0),
    [teamDps]
  );

  if (teamDps.length === 0) return null;

  return (
    <div className="rounded-xl bg-bg-card border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <div>
          <div className="text-sm font-semibold text-text-primary">
            📊 Phân Tích DPS Đội
          </div>
          <div className="text-[10px] text-text-muted">
            Rotation {rotationSeconds}s • Tổng:{" "}
            <span className="font-mono font-bold text-amber-400">
              {(totalTeamDps / 1000).toFixed(1)}K
            </span>{" "}
            DPS
          </div>
        </div>
      </div>

      {/* Enemy Resistance Status */}
      {enemyResistBadges.length > 0 && (
        <div className="px-4 py-3 border-b border-border/40">
          <div className="text-[10px] text-text-muted mb-2">
            🛡️ Kháng Cự: <span className="text-text-secondary">{enemyName}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {enemyResistBadges.map((badge, i) => (
              <ResistBadge key={i} badge={badge} />
            ))}
          </div>
        </div>
      )}

      {/* Team DPS Cards */}
      <div className="p-4 space-y-3">
        {sortedMembers.map((member, idx) => (
          <TeamMemberDpsCard
            key={member.charName}
            member={member}
            totalTeamDps={totalTeamDps}
            rank={idx + 1}
          />
        ))}
      </div>

      {/* Footer total */}
      <div className="flex items-center justify-between px-4 py-2.5 border-t border-border/40 bg-bg-secondary">
        <span className="text-[11px] text-text-muted">
          Tổng Team DPS (Lý Thuyết)
        </span>
        <span className="text-sm font-bold font-mono text-amber-400">
          {(totalTeamDps / 1000).toFixed(2)}K / giây
        </span>
      </div>
    </div>
  );
}
