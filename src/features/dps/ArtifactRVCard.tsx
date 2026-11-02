/**
 * src/features/dps/ArtifactRVCard.tsx
 *
 * Component hiá»ƒn thá»‹ Roll Value (RV) Breakdown cá»§a artifact
 * Dá»±a trÃªn chuáº©n KQM / Genshin Optimizer
 */

"use client";

import { useMemo } from "react";
import {
  calculateArtifactRV,
  GRADE_COLORS,
  type SubstatKey,
  type ArtifactRVResult,
  type RVGrade,
} from "@/core/game/dps/kqm-standards";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ArtifactSubstatInput {
  stat: SubstatKey;
  value: number;
}

export interface ArtifactRVCardProps {
  /** TÃªn artifact (e.g. "Hoa - Gilded Dreams") */
  artifactName: string;
  /** Loáº¡i artifact */
  artifactType: "flower" | "plume" | "sands" | "goblet" | "circlet";
  /** Danh sÃ¡ch substat */
  substats: ArtifactSubstatInput[];
  /** Hiá»ƒn thá»‹ dáº¡ng compact (khÃ´ng cÃ³ breakdown chi tiáº¿t) */
  compact?: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ARTIFACT_TYPE_LABELS: Record<ArtifactRVCardProps["artifactType"], string> = {
  flower: "ðŸŒ¸ Hoa",
  plume: "ðŸª¶ LÃ´ng",
  sands: "âŒ› CÃ¡t",
  goblet: "ðŸ† ChÃ©n",
  circlet: "ðŸ‘‘ VÆ°Æ¡ng Miá»‡n",
};

const ELEMENT_GLOWS: Record<RVGrade, string> = {
  SS: "shadow-amber-500/30",
  "S+": "shadow-yellow-400/25",
  S: "shadow-yellow-400/20",
  "A+": "shadow-green-400/20",
  A: "shadow-green-500/15",
  "B+": "shadow-blue-400/15",
  B: "shadow-blue-500/10",
  C: "shadow-slate-400/10",
  D: "shadow-red-500/10",
};

function RVProgressBar({
  rv,
  grade,
}: {
  rv: number;
  grade: RVGrade;
}) {
  // Normalize: má»™t substat tá»‘t lÃ  ~200-300% RV (tÆ°Æ¡ng Ä‘Æ°Æ¡ng 2-3 max roll)
  // Hiá»ƒn thá»‹ bar vá»›i max = 400% (4 max roll = xuáº¥t sáº¯c nháº¥t cÃ³ thá»ƒ)
  const barPercent = Math.min((rv / 400) * 100, 100);

  const barColor =
    grade === "SS" || grade === "S+"
      ? "bg-amber-400"
      : grade === "S" || grade === "A+"
        ? "bg-green-400"
        : grade === "A" || grade === "B+"
          ? "bg-blue-400"
          : grade === "B"
            ? "bg-slate-400"
            : "bg-red-500";

  return (
    <div className="relative h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
        style={{ width: `${barPercent}%` }}
      />
    </div>
  );
}

function GradeBadge({ grade }: { grade: RVGrade }) {
  return (
    <span className={`text-[10px] font-bold font-mono ${GRADE_COLORS[grade].split(" ").find((c) => c.startsWith("text-")) ?? "text-text-muted"}`}>
      {grade}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export function ArtifactRVCard({
  artifactName,
  artifactType,
  substats,
  compact = false,
}: ArtifactRVCardProps) {
  const rvResult: ArtifactRVResult = useMemo(() => {
    const substatMap: Partial<Record<SubstatKey, number>> = {};
    for (const s of substats) {
      substatMap[s.stat] = (substatMap[s.stat] ?? 0) + s.value;
    }
    return calculateArtifactRV(substatMap);
  }, [substats]);

  const { overallGrade, totalRV, offensiveRV, breakdown } = rvResult;

  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-bg-card border border-border shadow ${ELEMENT_GLOWS[overallGrade]}`}
      >
        <span className="text-[11px] text-text-muted shrink-0">
          {ARTIFACT_TYPE_LABELS[artifactType]}
        </span>
        <span className="text-xs text-text-secondary truncate flex-1">{artifactName}</span>
        <GradeBadge grade={overallGrade} />
        <span className="text-[10px] text-text-muted font-mono">
          {totalRV.toFixed(0)} RV
        </span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl bg-bg-card border border-border overflow-hidden shadow-md ${ELEMENT_GLOWS[overallGrade]}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <div className="flex items-center gap-2">
          <span className="text-sm">{ARTIFACT_TYPE_LABELS[artifactType]}</span>
          <span className="text-sm font-medium text-text-primary">{artifactName}</span>
        </div>
        <div className="flex items-center gap-2">
          <GradeBadge grade={overallGrade} />
          <span className="text-[11px] text-text-muted font-mono">
            {totalRV.toFixed(1)} RV tá»•ng
          </span>
        </div>
      </div>

      {/* Offensive RV Summary */}
      <div className="flex gap-4 px-4 pt-3 pb-2">
        <div className="text-center">
          <div className="text-[10px] text-text-muted mb-0.5">Táº¥n CÃ´ng RV</div>
          <div className="text-sm font-bold text-amber-400 font-mono">
            {offensiveRV.toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-text-muted mb-0.5">Tá»•ng RV</div>
          <div className="text-sm font-bold text-text-primary font-mono">
            {totalRV.toFixed(1)}%
          </div>
        </div>
        <div className="text-center">
          <div className="text-[10px] text-text-muted mb-0.5">Substats</div>
          <div className="text-sm font-bold text-text-secondary">
            {breakdown.length}/4
          </div>
        </div>
      </div>

      {/* Substat Breakdown */}
      <div className="px-4 pb-3 space-y-2">
        {breakdown.map((b) => (
          <div key={b.stat} className="space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-text-secondary">{b.statLabel}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-mono text-text-primary">
                  {(b.stat !== "em" && b.stat !== "flatAtk" && b.stat !== "flatHp" && b.stat !== "flatDef") ? `${b.currentValue.toFixed(1)}%` : Math.round(b.currentValue)}
                  <span className="text-text-muted text-[10px]">
                    {" "}/ {b.maxRoll}{b.stat !== "em" && b.stat !== "flatAtk" && b.stat !== "flatHp" && b.stat !== "flatDef" ? "%" : ""}
                  </span>
                </span>
                <GradeBadge grade={b.grade} />
                <span className="text-[10px] text-text-muted font-mono w-12 text-right">
                  {b.rv.toFixed(0)}%
                </span>
              </div>
            </div>
            <RVProgressBar rv={b.rv} grade={b.grade} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KQM Roll Value Legend (compact info box)
// ---------------------------------------------------------------------------

export function RVLegend() {
  const grades: { grade: RVGrade; label: string; range: string }[] = [
    { grade: "SS", label: "Tuyá»‡t Äá»‰nh", range: "â‰¥90%" },
    { grade: "S+", label: "Xuáº¥t Sáº¯c", range: "80-89%" },
    { grade: "S", label: "Ráº¥t Tá»‘t", range: "70-79%" },
    { grade: "A+", label: "Tá»‘t", range: "60-69%" },
    { grade: "A", label: "KhÃ¡", range: "50-59%" },
    { grade: "B+", label: "Trung BÃ¬nh", range: "40-49%" },
    { grade: "B", label: "Yáº¿u", range: "30-39%" },
    { grade: "C", label: "Tá»‡", range: "20-29%" },
    { grade: "D", label: "Bá» Äi", range: "<20%" },
  ];

  return (
    <div className="rounded-lg bg-bg-card border border-border p-3">
      <div className="text-[11px] font-semibold text-text-secondary mb-2">
        ðŸ“Š Thang ÄÃ¡nh GiÃ¡ RV (Roll Value) â€” KQM Standard
      </div>
      <div className="grid grid-cols-3 gap-1">
        {grades.map(({ grade, label, range }) => (
          <div key={grade} className="flex items-center gap-1.5">
            <GradeBadge grade={grade} />
            <div>
              <div className="text-[10px] text-text-primary leading-tight">{label}</div>
              <div className="text-[9px] text-text-muted font-mono">{range}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-[10px] text-text-muted">
        * RV = (GiÃ¡ trá»‹ thá»±c / Max single roll) Ã— 100%. Nguá»“n: KQM / Genshin Optimizer.
      </div>
    </div>
  );
}
