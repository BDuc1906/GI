"use client";

import { useMemo, useState } from "react";
import {
  formatNumber,
  formatSpecialized,
  type StatByLevelRow,
} from "@/lib/character-stats-format";

interface Props {
  statsByLevel: StatByLevelRow[];
  ascensionStat: string | null;
}

// Các mốc cấp bắt buộc phải đột phá mới lên được — tại đúng các mốc này,
// dữ liệu có 2 dòng cùng "level" nhưng khác "ascension" (trước/sau đột phá).
const ASCENSION_BREAKPOINT_LEVELS = [20, 40, 50, 60, 70, 80];

/**
 * CharacterLevelSlider — kéo thanh trượt để xem chỉ số nhân vật ở bất kỳ
 * cấp nào, tính real-time TỪ DỮ LIỆU THẬT ĐÃ SEED (statsByLevel), không
 * nội suy/ước lượng — nếu seed hiện tại chỉ có vài mốc rời rạc (13 dòng cũ),
 * component vẫn hoạt động đúng, chỉ là thanh trượt sẽ "nhảy cóc" giữa các
 * mốc đó thay vì mượt từng cấp; sau khi seed lại với STAT_BREAKPOINTS đã mở
 * rộng (scripts/seed-characters.ts, xem CHANGELOG) sẽ có đủ mọi cấp 1-90.
 *
 * Xử lý mốc đột phá (2 dòng cùng level): so sánh SỐ ascension thay vì giả
 * định ký hiệu "-"/"+" cụ thể nào — dòng có ascension NHỎ HƠN luôn là
 * "trước đột phá", dòng LỚN HƠN là "sau đột phá", đúng với mọi cách
 * genshin-db mã hoá giá trị này.
 */
export function CharacterLevelSlider({ statsByLevel, ascensionStat }: Props) {
  const byLevel = useMemo(() => {
    const map = new Map<number, StatByLevelRow[]>();
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
  // Mặc định hiển thị trạng thái ĐÃ đột phá khi đứng đúng 1 mốc lưỡng trạng thái.
  const [showAscended, setShowAscended] = useState(true);

  // Thanh <input type="range"> chỉ hỗ trợ giá trị liên tục — nếu dữ liệu
  // hiện chỉ có vài mốc rời rạc (chưa reseed), khi kéo tới 1 cấp không có
  // trong danh sách, chọn cấp GẦN NHẤT có dữ liệu thay vì không hiển thị gì.
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
        aria-label="Chọn cấp độ nhân vật"
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

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <StatBlock label="HP" value={formatNumber(row.hp)} />
        <StatBlock label="ATK" value={formatNumber(row.attack)} />
        <StatBlock label="DEF" value={formatNumber(row.defense)} />
        <StatBlock
          label={ascensionStat ?? "Chỉ số đột phá"}
          value={row.specialized !== null ? formatSpecialized(row.specialized, ascensionStat) : "—"}
          gold
        />
      </div>
    </div>
  );
}

function StatBlock({ label, value, gold }: { label: string; value: string; gold?: boolean }) {
  return (
    <div>
      <div className="text-xs text-muted uppercase tracking-wide mb-1">{label}</div>
      <div className={`text-lg font-semibold ${gold ? "text-gold-bright" : "text-primary"}`}>
        {value}
      </div>
    </div>
  );
}
