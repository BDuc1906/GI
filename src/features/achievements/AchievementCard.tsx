"use client";

import { useMemo } from "react";
import { EntityThumb } from "@/components/ui/EntityThumb";
import { formatReward, getStagePrimogems, stagesOf } from "@/core/game/achievement-format";
import { useAchievementTracker } from "./tracker-storage";

export interface AchievementCardProps {
  id: string;
  name: string;
  groupName?: string | null;
  isHidden?: boolean | null;
  raw: unknown;
  /** URL ảnh biểu tượng của nhóm thành tựu (xem imageFor). */
  iconCandidates?: string[];
}

/** Thẻ thành tựu có checkbox tương tác lưu tiến độ thật vào LocalStorage. */
export function AchievementCard({
  id,
  name,
  groupName,
  isHidden,
  raw,
  iconCandidates = [],
}: AchievementCardProps) {
  const stages = useMemo(() => stagesOf(raw), [raw]);
  const multi = stages.length > 1;

  const {
    isStageCompleted,
    isAchievementCompleted,
    toggleStage,
    toggleAllStages,
  } = useAchievementTracker();

  const isCompleted = isAchievementCompleted(id, stages.length);

  const stageData = useMemo(() => {
    return stages.map((s, idx) => ({
      stageNum: idx + 1,
      primos: getStagePrimogems(s),
      description: s.description || "—",
      progress: s.progress,
      rewardText: formatReward(s.reward),
    }));
  }, [stages]);

  const totalPrimos = useMemo(() => {
    return stageData.reduce((acc, s) => acc + s.primos, 0);
  }, [stageData]);

  return (
    <article
      className={`relative border-2 rounded-xl p-4 transition-all h-full flex flex-col justify-between ${
        isCompleted
          ? "bg-emerald-950/10 border-emerald-500/60 shadow-sm shadow-emerald-950/20"
          : "bg-bg-card border-border hover:border-gold/50"
      }`}
    >
      <div>
        <div className="flex items-start gap-3 mb-2.5">
          <EntityThumb candidates={iconCandidates} alt={groupName ?? name} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`font-semibold text-sm sm:text-base leading-snug ${isCompleted ? "text-emerald-300" : "text-text-primary"}`}>
                {name}
              </h3>
              <div className="flex items-center gap-1 shrink-0">
                {isHidden && (
                  <span className="px-2 py-0.5 bg-warning/20 text-warning text-[10px] font-medium rounded-full">
                    Ẩn
                  </span>
                )}
                {isCompleted && (
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold rounded-full flex items-center gap-1">
                    ✓ Xong
                  </span>
                )}
              </div>
            </div>
            {groupName && <p className="text-xs text-text-muted mt-0.5">{groupName}</p>}
          </div>
        </div>

        {stages.length === 0 ? (
          <p className="text-sm text-text-muted">Chưa có mô tả điều kiện.</p>
        ) : (
          <ol className="space-y-2 mt-3">
            {stageData.map((s) => {
              const checked = isStageCompleted(id, s.stageNum);
              return (
                <li
                  key={s.stageNum}
                  onClick={() => toggleStage(id, s.stageNum, s.primos, stageData)}
                  className={`text-sm p-2 rounded-lg border transition-all cursor-pointer select-none flex items-start gap-2.5 ${
                    checked
                      ? "bg-emerald-500/10 border-emerald-500/40 text-text-primary"
                      : "bg-bg-primary/50 border-border/70 hover:border-border text-text-secondary hover:text-text-primary"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {}} // Đã xử lý ở thẻ li
                    className="mt-0.5 h-4 w-4 rounded border-border text-emerald-500 focus:ring-emerald-400 cursor-pointer accent-emerald-500 shrink-0"
                    aria-label={`Hoàn thành bậc ${s.stageNum}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm">
                      {multi && (
                        <span className="text-[11px] font-bold text-accent-bright mr-1.5 uppercase">
                          Bậc {s.stageNum}:
                        </span>
                      )}
                      <span className={checked ? "line-through text-text-muted" : ""}>{s.description}</span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-text-muted">
                      {typeof s.progress === "number" && s.progress > 1 && (
                        <span>Tiến độ: {s.progress}</span>
                      )}
                      {s.primos > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-gold font-medium">
                          +{s.primos} ✦
                        </span>
                      )}
                      {s.rewardText && s.primos === 0 && (
                        <span>{s.rewardText}</span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Footer thanh tác vụ thẻ */}
      <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between text-xs">
        <div className="text-[11px] text-text-muted flex items-center gap-1">
          <span>Phần thưởng:</span>
          <span className="text-gold font-semibold">+{totalPrimos} ✦ Primogem</span>
        </div>

        {multi && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleAllStages(id, stageData);
            }}
            className="text-[11px] text-text-muted hover:text-accent-bright transition-colors px-1.5 py-0.5 rounded hover:bg-bg-input"
          >
            {isCompleted ? "Bỏ chọn tất cả" : "Chọn hết các bậc"}
          </button>
        )}
      </div>
    </article>
  );
}
