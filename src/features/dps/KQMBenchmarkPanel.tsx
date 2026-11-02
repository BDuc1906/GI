/**
 * src/features/dps/KQMBenchmarkPanel.tsx
 *
 * KQM 20-Roll Standard Benchmark Panel
 * Hiển thị thống kê chuẩn KQM và so sánh vũ khí trung lập
 */

"use client";

import { useMemo, useState } from "react";
import {
  KQM_STANDARD_DPS,
  KQM_STANDARD_EM_SUPPORT,
  KQM_STANDARD_HEALER,
  calculateKQMNeutralGear,
  SUBSTAT_LABELS,
  MAX_ROLL_VALUES,
  type KQMDistribution,
  type KQMComparisonResult,
  type SubstatKey,
} from "@/core/game/dps/kqm-standards";

// ---------------------------------------------------------------------------
// Stat Display Row
// ---------------------------------------------------------------------------

function StatRow({
  label,
  value,
  unit,
  highlight,
}: {
  label: string;
  value: number | string;
  unit?: string;
  highlight?: "gold" | "green" | "blue" | "red";
}) {
  const textColor =
    highlight === "gold"
      ? "text-amber-400"
      : highlight === "green"
        ? "text-green-400"
        : highlight === "blue"
          ? "text-blue-400"
          : highlight === "red"
            ? "text-red-400"
            : "text-text-primary";

  return (
    <div className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
      <span className="text-[11px] text-text-muted">{label}</span>
      <span className={`text-[12px] font-mono font-semibold ${textColor}`}>
        {typeof value === "number"
          ? value % 1 === 0
            ? value.toLocaleString()
            : value.toFixed(1)
          : value}
        {unit && <span className="text-text-muted text-[10px] ml-0.5">{unit}</span>}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Distribution Table
// ---------------------------------------------------------------------------

function DistributionTable({ dist }: { dist: KQMDistribution }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="bg-bg-secondary px-3 py-2 text-[11px] font-semibold text-text-secondary border-b border-border">
        📐 {dist.label}
      </div>
      <div className="divide-y divide-border/30">
        {dist.substats.map((s) => {
          const pct = (s.rolls / dist.totalRolls) * 100;
          const barColor =
            s.stat === "critRate" || s.stat === "critDmg"
              ? "bg-amber-400"
              : s.stat === "atkPercent" || s.stat === "em"
                ? "bg-blue-400"
                : "bg-slate-400";

          return (
            <div key={s.stat} className="flex items-center gap-3 px-3 py-1.5">
              {/* Stat name */}
              <span className="text-[11px] text-text-secondary w-24 shrink-0">
                {SUBSTAT_LABELS[s.stat]}
              </span>
              {/* Roll count */}
              <span className="text-[10px] text-text-muted w-12 text-right font-mono">
                {s.rolls} rolls
              </span>
              {/* Progress bar */}
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${barColor}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {/* Value */}
              <span className="text-[11px] font-mono text-text-primary w-20 text-right">
                {s.unit === "flat"
                  ? `+${s.totalValue.toFixed(0)}`
                  : `+${s.totalValue.toFixed(2)}%`}
              </span>
            </div>
          );
        })}
      </div>
      <div className="bg-bg-secondary px-3 py-1.5 text-[10px] text-text-muted border-t border-border">
        Tổng: <span className="font-mono font-bold text-text-secondary">{dist.totalRolls}</span> rolls
        phân phối trên {dist.substats.length} substats theo chuẩn KQM
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// KQM Stats Preview
// ---------------------------------------------------------------------------

function KQMStatsPreview({ result }: {
  result: KQMComparisonResult;
}) {
  const cvColor =
    result.critValue >= 220
      ? "text-amber-400"
      : result.critValue >= 180
        ? "text-green-400"
        : result.critValue >= 140
          ? "text-blue-400"
          : "text-text-muted";

  return (
    <div className="rounded-lg bg-bg-secondary border border-border p-3 space-y-0.5">
      <div className="text-[11px] font-semibold text-text-secondary mb-2">
        📊 Chỉ Số KQM Ước Tính
      </div>
      <StatRow
        label="Tổng ATK"
        value={result.totalAtk}
        unit=" ATK"
        highlight="blue"
      />
      <StatRow
        label="CRIT Rate"
        value={result.critRate}
        unit="%"
        highlight={result.critRate >= 75 ? "gold" : undefined}
      />
      <StatRow
        label="CRIT DMG"
        value={result.critDmg}
        unit="%"
        highlight={result.critDmg >= 180 ? "gold" : undefined}
      />
      <StatRow label="Tinh Thông EM" value={result.em} unit=" EM" />
      <StatRow label="Nạp Năng ER" value={result.er} unit="%" />
      <StatRow label="Thưởng ST" value={result.dmgBonus} unit="%" />
      <div className="pt-1 border-t border-border/40 mt-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-text-muted">Crit Value (CV)</span>
          <span className={`text-[13px] font-mono font-bold ${cvColor}`}>
            {result.critValue.toFixed(1)}
          </span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <span className="text-[11px] text-text-muted">Avg Hit ×</span>
          <span className="text-[13px] font-mono font-bold text-amber-300">
            ×{result.avgHitMultiplier.toFixed(3)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Panel
// ---------------------------------------------------------------------------

const DIST_OPTIONS = [
  { id: "dps", label: "DPS Chính", dist: KQM_STANDARD_DPS },
  { id: "em", label: "EM Support", dist: KQM_STANDARD_EM_SUPPORT },
  { id: "healer", label: "Healer / Shield", dist: KQM_STANDARD_HEALER },
] as const;

type DistId = (typeof DIST_OPTIONS)[number]["id"];

export function KQMBenchmarkPanel({
  charBaseAtk = 900,
  weaponBaseAtk = 608,
  weaponSubStat,
  weaponSubStatValue,
}: {
  /** Base ATK nhân vật Lv90 (default: 900) */
  charBaseAtk?: number;
  /** Base ATK vũ khí (default: 608 — Staff of the Scarlet Sands) */
  weaponBaseAtk?: number;
  /** Substat vũ khí nếu có */
  weaponSubStat?: SubstatKey;
  /** Giá trị substat vũ khí */
  weaponSubStatValue?: number;
}) {
  const [activeDist, setActiveDist] = useState<DistId>("dps");

  const selectedDist = DIST_OPTIONS.find((d) => d.id === activeDist)!.dist;

  const kqmResult = useMemo(
    () =>
      calculateKQMNeutralGear({
        charBaseAtk,
        weaponBaseAtk,
        weaponSubStat,
        weaponSubStatValue,
        distribution: selectedDist,
        gobletDmgBonus: 46.6, // Lớn nhất từ goblet nguyên tố DMG%
        setDmgBonus: 15, // Ví dụ 2pc set thưởng 15%
        miscDmgBonus: 0,
      }),
    [charBaseAtk, weaponBaseAtk, weaponSubStat, weaponSubStatValue, selectedDist]
  );

  return (
    <div className="rounded-xl bg-bg-card border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
        <div>
          <div className="text-sm font-semibold text-text-primary">
            ⚖️ KQM 20-Roll Standard Benchmark
          </div>
          <div className="text-[10px] text-text-muted mt-0.5">
            Chuẩn so sánh trung lập — không bị ảnh hưởng bởi RNG artifact
          </div>
        </div>
        <a
          href="https://keqingmains.com/misc/artifacts/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-blue-400 hover:text-blue-300 transition-colors"
        >
          KQM Docs ↗
        </a>
      </div>

      {/* Distribution Tabs */}
      <div className="flex border-b border-border/40">
        {DIST_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setActiveDist(opt.id)}
            className={`flex-1 py-2 text-[11px] font-medium transition-colors ${
              activeDist === opt.id
                ? "text-amber-400 border-b-2 border-amber-400 bg-amber-400/5"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Distribution table */}
        <DistributionTable dist={selectedDist} />

        {/* KQM Stats Preview */}
        <KQMStatsPreview result={kqmResult} />

        {/* Max Roll Reference */}
        <div className="rounded-lg bg-bg-secondary border border-border p-3">
          <div className="text-[11px] font-semibold text-text-secondary mb-2">
            📋 Max Single Roll Reference (5★ Artifact)
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
            {(
              Object.entries(MAX_ROLL_VALUES) as [SubstatKey, number][]
            ).map(([stat, maxVal]) => (
              <div
                key={stat}
                className="flex items-center justify-between py-0.5 border-b border-border/20"
              >
                <span className="text-[10px] text-text-muted">
                  {SUBSTAT_LABELS[stat]}
                </span>
                <span className="text-[10px] font-mono text-text-secondary">
                  {stat === "em" || stat.startsWith("flat")
                    ? `+${maxVal}`
                    : `+${maxVal}%`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info note */}
        <div className="text-[10px] text-text-muted leading-relaxed px-1">
          💡 <strong className="text-text-secondary">KQM Standard</strong>: Chuẩn so sánh 20 roll của Keqing Mains — phân bổ
          đồng đều substats tối ưu để loại bỏ biến số RNG khi benchmark vũ khí và
          bộ thánh tích. Chỉ số thực tế của bạn sẽ khác nhau tùy artifact.
        </div>
      </div>
    </div>
  );
}
