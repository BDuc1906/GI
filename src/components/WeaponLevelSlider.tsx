"use client";

import { useMemo, useState } from "react";
import {
  formatNumber,
  formatSpecialized,
} from "@/lib/character-stats-format";

export type WeaponStatByLevelRow = {
  level: number;
  ascension: number | null;
  attack: number | null;
  specialized: number | null;
};

interface Props {
  statsByLevel: WeaponStatByLevelRow[];
  subStatName: string | null;
}

// Các mốc cấp bắt buộc phải đột phá mới lên được — giống CharacterLevelSlider.
const ASCENSION_BREAKPOINT_LEVELS = [20, 40, 50, 60, 70, 80];

/**
 * WeaponLevelSlider — bản song sinh của CharacterLevelSlider.tsx cho vũ
 * khí: kéo thanh trượt để xem ATK + chỉ số phụ ở bất kỳ cấp nào, tính
 * TỪ DỮ LIỆU THẬT ĐÃ SEED (Weapon.statsByLevel, nguồn:
 * genshindb.weapons(name).stats(level, ascension)) — không nội suy.
 *
 * Trước đây trang chi tiết vũ khí chỉ hiển thị 1 con số tĩnh `baseAtk`
 * (thực chất là ATK ở CẤP 1, vd "47.537" không làm tròn) và ghi nhầm là
 * "chỉ số cơ bản" cố định — không phản ánh ATK thật khi lên cấp/đột phá.
 */
export function WeaponLevelSlider({ statsByLevel, subStatName }: Props) {
  const byLevel = useMemo(() => {
    const map = new Map<number, WeaponStatByLevelRow[]>();
    for (const row of statsByLevel) {
      const arr = map.get(row.level) ?? [];
      arr.push(row);
      map.set(row.level, arr);
    }
    for (const arr of map.values()) {
      arr.sort((a, b) => (a.ascension ?? 0) - (b.ascension ?? 0));
    }
    return map;
  }, [statsByLevel]);

  const availableLevels = useMemo(
    () => Array.from(byLevel.keys()).sort((a, b) => a - b),
    [byLevel]
  );

  const minLevel = availableLevels[0] ?? 1;
  const maxLevel = availableLevels[availableLevels.length - 1] ?? 90;

  const [level, setLevel] = useState(maxLevel);
  const [showAscended, setShowAscended] = useState(true);

  function snapToNearestAvailableLevel(target: number): number {
    if (byLevel.has(target)) return target;
    let closest = availableLevels[0];
    let closestDiff = Math.abs(target - closest);
    for (const lv of availableLevels) {
      const diff = Math.abs(target - lv);
      if (diff < closestDiff) {
        closest = lv;
        closestDiff = diff;
      }
    }
    return closest;
  }

  const rowsAtLevel = byLevel.get(level) ?? [];
  const hasBothStates = rowsAtLevel.length === 2;
  const row = hasBothStates
    ? showAscended
      ? rowsAtLevel[1]
      : rowsAtLevel[0]
    : rowsAtLevel[0];

  if (!row || availableLevels.length === 0) return null;

  return (
    <div className="relic-frame bg-card border border-border rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="font-display text-sm font-bold text-gold uppercase tracking-wide">
          Cấp {level}
          {hasBothStates && (showAscended ? " · Đã đột phá" : " · Chưa đột phá")}
        </span>
        {hasBothStates && (
          <button
            type="button"
            onClick={() => setShowAscended((v) => !v)}
            className="text-xs text-gold-bright underline underline-offset-2"
          >
            Xem trạng thái {showAscended ? "trước" : "sau"} đột phá
          </button>
        )}
      </div>

      <input
        type="range"
        min={minLevel}
        max={maxLevel}
        value={level}
        onChange={(e) => setLevel(snapToNearestAvailableLevel(Number(e.target.value)))}
        className="w-full mb-4 accent-[#F4D03F]"
        aria-label="Chọn cấp độ vũ khí"
      />

      <div className="flex flex-wrap gap-2 mb-5">
        {Array.from(new Set([minLevel, ...ASCENSION_BREAKPOINT_LEVELS, maxLevel]))
          .filter((lv) => lv >= minLevel && lv <= maxLevel)
          .sort((a, b) => a - b)
          .map((bp) => (
            <button
              key={bp}
              type="button"
              onClick={() => setLevel(bp)}
              className={`px-2 py-1 rounded text-xs border transition-colors ${
                level === bp
                  ? "border-gold-bright text-gold-bright"
                  : "border-border text-muted hover:text-primary"
              }`}
            >
              {bp}
            </button>
          ))}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <StatBlock label="ATK nền" value={formatNumber(row.attack)} />
        <StatBlock
          label={subStatName ?? "Chỉ số phụ"}
          value={row.specialized !== null ? formatSpecialized(row.specialized, subStatName) : "—"}
          gold
        />
      </div>
    </div>
  );
}

function StatBlock({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted uppercase tracking-wider mb-1">{label}</div>
      <div className={`text-lg font-semibold ${gold ? "text-gold-bright" : "text-primary"}`}>{value}</div>
    </div>
  );
}
