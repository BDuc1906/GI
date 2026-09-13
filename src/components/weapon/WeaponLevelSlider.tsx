
"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { formatNumber, formatSpecialized } from "@/lib/game/character-stats-format";
import { translateStatName } from "@/lib/game/stat-name-translations";

/**
 * Component này từng bị hỏng — file thực chất chứa nhầm toàn bộ code của
 * trang weapons/[id]/page.tsx (lỗi swap nội dung có sẵn từ trước, phát
 * hiện khi trang chi tiết vũ khí lỗi 500 "export WeaponLevelSlider was
 * not found"). Viết lại từ đầu theo đúng khuôn mẫu CharacterLevelSlider.tsx
 * (component chị em, cùng UI pattern thanh trượt cấp độ) vì bản gốc không
 * còn tồn tại ở đâu trong source.
 *
 * BUG THỨ 2 ĐÃ SỬA: field "baseAtk"/"subStatValue" ở đây KHÔNG khớp với
 * field "attack"/"specialized" mà 2 script sinh dữ liệu
 * (scripts/seed-weapons.ts, scripts/fix-weapon-stats-by-level.ts) từng
 * ghi ra DB — mọi vũ khí có statsByLevel đều hiện "—" ở ATK NỀN/chỉ số
 * phụ bất kể dữ liệu thật đã có sẵn. Đã sửa tận gốc ở 2 script đó (đổi
 * tên field lúc ghi ra, không đổi type ở đây — "baseAtk"/"subStatValue"
 * mới là tên khớp với cột scalar Weapon.baseAtk/Weapon.subStatValue có
 * sẵn trong schema). Đồng thời sửa luôn hiển thị subStatValue dùng
 * formatSpecialized() (giống CharacterLevelSlider) thay vì String()
 * thô — nếu không, chỉ số dạng % (Crit Rate/DMG, Energy Recharge...) sẽ
 * hiện số thập phân thô kiểu "0.096" thay vì "9.6%".
 */
export type WeaponStatByLevelRow = {
  level: number;
  ascension: number | null;
  baseAtk: number | null;
  subStatValue: number | string | null;
};

interface Props {
  statsByLevel: WeaponStatByLevelRow[];
  subStatName: string | null;
  elementColor?: string;
}

const ASCENSION_BREAKPOINT_LEVELS = [20, 40, 50, 60, 70, 80];

export function WeaponLevelSlider({ statsByLevel, subStatName, elementColor }: Props) {
  const t = useTranslations("LevelSlider");
  const locale = useLocale();
  const el = elementColor ?? "var(--accent-500)";

  const byLevel = useMemo(() => {
    const map = new Map<number, WeaponStatByLevelRow[]>();
    for (const row of statsByLevel) {
      const arr = map.get(row.level) ?? [];
      arr.push(row);
      map.set(row.level, arr);
    }
    for (const arr of map.values()) arr.sort((a, b) => (a.ascension ?? 0) - (b.ascension ?? 0));
    return map;
  }, [statsByLevel]);

  const availableLevels = useMemo(() => Array.from(byLevel.keys()).sort((a, b) => a - b), [byLevel]);
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
  const row = hasBothStates ? (showAscended ? rowsAtLevel[1] : rowsAtLevel[0]) : rowsAtLevel[0];

  if (!row || availableLevels.length === 0) return null;

  return (
    <div className="surface-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="text-eyebrow" style={{ color: el }}>
          {t("level", { level })}
          {hasBothStates && (showAscended ? ` · ${t("ascended")}` : ` · ${t("notAscended")}`)}
        </span>
        {hasBothStates && (
          <button type="button" onClick={() => setShowAscended((v) => !v)} className="text-xs underline underline-offset-2" style={{ color: el }}>
            {showAscended ? t("viewBeforeAscension") : t("viewAfterAscension")}
          </button>
        )}
      </div>

      <input
        type="range"
        min={minLevel}
        max={maxLevel}
        value={level}
        onChange={(e) => setLevel(snapToNearestAvailableLevel(Number(e.target.value)))}
        className="w-full mb-4"
        style={{ accentColor: el }}
        aria-label={t("ariaSelectWeaponLevel")}
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
              className="px-2 py-1 rounded text-xs border transition-colors tabular-nums"
              style={
                level === bp
                  ? { borderColor: el, color: el }
                  : { borderColor: "var(--border-color)", color: "var(--text-muted)" }
              }
            >
              {bp}
            </button>
          ))}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <StatBlock label={t("baseAtk")} value={formatNumber(row.baseAtk, locale)} />
        <StatBlock
          label={subStatName ? translateStatName(subStatName, locale) : t("subStat")}
          value={
            typeof row.subStatValue === "number"
              ? formatSpecialized(row.subStatValue, subStatName, locale)
              : row.subStatValue !== null && row.subStatValue !== undefined
                ? String(row.subStatValue)
                : "—"
          }
          color={el}
        />
      </div>
    </div>
  );
}

function StatBlock({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="text-xs text-text-muted uppercase tracking-wide mb-1">{label}</div>
      <div className="text-lg font-semibold tabular-nums" style={{ color: color ?? "var(--text-primary)" }}>
        {value}
      </div>
    </div>
  );
}
