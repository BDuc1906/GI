"use client";

import { useMemo, useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import type { TalentMaterialLevel } from "@/lib/character-helpers";

interface Props {
  talentMaterials: TalentMaterialLevel[];
  materialIconMap: Record<string, string | null | undefined>;
}

// Nguyên liệu vật phẩm chỉ tồn tại cho Cấp 2 -> 10 — giới hạn cứng của
// game, khai cố định để phát hiện thiếu data thay vì im lặng thu hẹp dải.
const MATERIAL_LEVELS = [2, 3, 4, 5, 6, 7, 8, 9, 10];

// Tổng cấp kỹ năng tối đa 1 nhân vật có thể đạt được, CỘNG DỒN từ 3 nguồn:
//   Cấp 1        — cấp gốc, không tốn gì.
//   Cấp 2 -> 10  — tốn nguyên liệu (sách + Mora + nguyên liệu đánh quái,
//                  từ Cấp 7 có thêm nguyên liệu boss tuần, Cấp 10 có thêm
//                  Vương Miện Trí Tuệ).
//   Cấp 11 -> 13 — CỘNG DỒN từ Cung Mệnh (thường 1 constellation +3 cấp
//                  cho đúng 1 kỹ năng cụ thể, phổ biến là C3 hoặc C5 tuỳ
//                  nhân vật) — không tốn thêm nguyên liệu.
//   Cấp 14 -> 15 — CỘNG DỒN từ Thiên Phú Bị Động (nếu nhân vật có loại
//                  passive dạng "+1 cấp kỹ năng"), tối đa 2 thiên phú như
//                  vậy trên 1 nhân vật — không tốn thêm nguyên liệu.
// 3 nguồn cộng dồn này KHÔNG phải nhân vật nào cũng có đủ (tuỳ nhân vật:
// có Cung Mệnh cộng cấp hay không, có Thiên Phú dạng này hay không) — xem
// đúng mô tả trong mục "Hệ Thống Cung Mệnh Chòm Sao" / mục Thiên Phú Bị
// Động của từng nhân vật để biết nhân vật NÀY có áp dụng hay không.
const MAX_TOTAL_LEVEL = 15;
const CONSTELLATION_LEVELS = [11, 12, 13];
const PASSIVE_LEVELS = [14, 15];

function levelSourceLabel(level: number): string | null {
  if (level === 1) return "Cấp gốc";
  if (MATERIAL_LEVELS.includes(level)) return null; // hiện nguyên liệu, không cần nhãn riêng
  if (CONSTELLATION_LEVELS.includes(level)) return "Cộng dồn từ Cung Mệnh";
  if (PASSIVE_LEVELS.includes(level)) return "Cộng dồn từ Thiên Phú Bị Động";
  return null;
}

export function TalentMaterialSlider({ talentMaterials, materialIconMap }: Props) {
  const byLevel = useMemo(() => {
    const map = new Map<number, TalentMaterialLevel>();
    for (const entry of talentMaterials) {
      map.set(entry.level, entry);
    }
    return map;
  }, [talentMaterials]);

  const [level, setLevel] = useState(10);

  const current = byLevel.get(level);
  const materials = current?.materials ?? [];
  const isMaterialLevel = MATERIAL_LEVELS.includes(level);
  const sourceLabel = levelSourceLabel(level);

  return (
    <div className="mt-4 relic-frame bg-secondary/20 border border-border rounded-xl p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-wide text-gold">
          {level === 1 ? "Cấp 1" : `Cấp ${level - 1} \u2192 ${level}`}
          {sourceLabel && <span className="text-muted font-normal normal-case"> &middot; {sourceLabel}</span>}
        </span>
      </div>

      <input
        type="range"
        min={1}
        max={MAX_TOTAL_LEVEL}
        step={1}
        value={level}
        onChange={(e) => setLevel(Number(e.target.value))}
        className="w-full mb-3 accent-[#F4D03F]"
        aria-label="Chọn cấp kỹ năng (1-15, gồm cả cấp cộng dồn từ Cung Mệnh / Thiên Phú)"
      />

      <div className="flex flex-wrap gap-1.5 mb-3">
        {Array.from({ length: MAX_TOTAL_LEVEL }, (_, i) => i + 1).map((lv) => {
          const needsData = MATERIAL_LEVELS.includes(lv);
          const hasData = byLevel.has(lv);
          const missing = needsData && !hasData;
          return (
            <button
              key={lv}
              type="button"
              onClick={() => setLevel(lv)}
              title={missing ? "Thiếu dữ liệu nguyên liệu cho cấp này" : undefined}
              className={`px-2 py-0.5 rounded text-xs border transition-colors ${
                level === lv
                  ? "border-gold-bright text-gold-bright"
                  : missing
                  ? "border-dashed border-red-400/50 text-red-400/70"
                  : CONSTELLATION_LEVELS.includes(lv) || PASSIVE_LEVELS.includes(lv)
                  ? "border-purple-400/40 text-purple-300/80 hover:text-purple-200"
                  : "border-border text-muted hover:text-primary"
              }`}
            >
              {lv}
            </button>
          );
        })}
      </div>

      {level === 1 && (
        <p className="text-xs text-muted">Cấp gốc khi nhân vật vừa mở khoá kỹ năng, không cần nguyên liệu.</p>
      )}

      {isMaterialLevel && (
        <div className="flex flex-wrap gap-2">
          {!current && (
            <span className="text-xs text-red-400">
              Thiếu dữ liệu nguyên liệu cho Cấp {level - 1} &rarr; {level}.
            </span>
          )}
          {current && materials.length === 0 && (
            <span className="text-xs text-muted">Không có dữ liệu nguyên liệu cho cấp này.</span>
          )}
          {materials.map((m, idx) => {
            const iconUrl = m.materialId ? materialIconMap[m.materialId] : null;
            const formattedCount = m.count ? m.count.toLocaleString("vi-VN") : "";
            return (
              <span
                key={idx}
                className="flex items-center gap-1.5 bg-secondary/40 px-2.5 py-1 rounded-full border border-border text-xs"
              >
                <span className="relative w-5 h-5 shrink-0">
                  {iconUrl ? (
                    <SafeImage src={iconUrl} alt={m.name || ""} fill className="object-contain" sizes="20px" />
                  ) : null}
                </span>
                <span className="text-secondary">{m.name}</span>
                <span className="text-primary font-medium">×{formattedCount}</span>
              </span>
            );
          })}
        </div>
      )}

      {CONSTELLATION_LEVELS.includes(level) && (
        <p className="text-xs text-purple-300/90">
          Không tốn nguyên liệu — chỉ đạt được nếu nhân vật có Cung Mệnh cộng cấp kỹ năng này (thường C3 hoặc C5, xem
          mục Hệ Thống Cung Mệnh Chòm Sao bên dưới). Không phải nhân vật nào cũng có.
        </p>
      )}

      {PASSIVE_LEVELS.includes(level) && (
        <p className="text-xs text-purple-300/90">
          Không tốn nguyên liệu — chỉ đạt được nếu nhân vật có Thiên Phú Bị Động dạng &ldquo;+1 cấp kỹ năng&rdquo;
          (tối đa 2 thiên phú như vậy). Không phải nhân vật nào cũng có.
        </p>
      )}

      <p className="text-[11px] text-muted mt-3 leading-relaxed border-t border-border pt-2">
        Tổng tối đa <span className="text-primary font-medium">Cấp 15</span>: Cấp 1 (gốc) + tối đa Cấp 10 bằng
        nguyên liệu + tối đa +3 cấp từ Cung Mệnh + tối đa +2 cấp từ Thiên Phú Bị Động.
      </p>
    </div>
  );
}