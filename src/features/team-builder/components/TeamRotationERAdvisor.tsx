"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  analyzeTeamEr,
  buildTeamRotation,
  type TeamMemberErEvaluation,
  type RotationStep,
} from "@/core/game/team-rotation";

export interface TeamRotationERAdvisorProps {
  memberIds: string[];
  characterMap: Record<
    string,
    {
      name: string;
      label: string;
      element: string;
      icons: string[];
    }
  >;
}

export function TeamRotationERAdvisor({ memberIds, characterMap }: TeamRotationERAdvisorProps) {
  const [activeTab, setActiveTab] = useState<"rotation" | "er">("rotation");

  const fallbackProfiles = useMemo(() => {
    const res: Record<string, { name: string; element: string }> = {};
    for (const [id, c] of Object.entries(characterMap)) {
      res[id] = { name: c.label || c.name, element: c.element };
    }
    return res;
  }, [characterMap]);

  const erEvaluations: TeamMemberErEvaluation[] = useMemo(() => {
    return analyzeTeamEr(memberIds, fallbackProfiles);
  }, [memberIds, fallbackProfiles]);

  const rotationSteps: RotationStep[] = useMemo(() => {
    return buildTeamRotation(memberIds, fallbackProfiles);
  }, [memberIds, fallbackProfiles]);

  return (
    <div className="mt-4 pt-4 border-t border-border/70 space-y-4">
      {/* Tab Switcher & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-base sm:text-lg">⚡</span>
          <div>
            <h4 className="text-sm font-bold text-text-primary">
              Cố Vấn Chu Kỳ Combo (Rotation) & Điểm Chuẩn Nạp (ER)
            </h4>
            <p className="text-[11px] text-text-muted">
              Chuẩn hóa theo dữ liệu KeqingMains (KQM) và cơ chế hạt năng lượng nguyên tố
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-bg-elevated p-1 rounded-xl border border-border self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("rotation")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "rotation"
                ? "bg-bg-card text-accent-bright border border-accent-500/40 shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Vòng Lặp Combo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("er")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "er"
                ? "bg-bg-card text-accent-bright border border-accent-500/40 shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Điểm Chuẩn Nạp (ER)
          </button>
        </div>
      </div>

      {/* TAB 1: ROTATION SEQUENCE */}
      {activeTab === "rotation" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {rotationSteps.map((step) => {
              const charInfo = characterMap[step.characterId];
              const iconUrl = charInfo?.icons?.[0] || "/local-genshin-assets/ui/character_default.png";

              return (
                <div
                  key={step.step}
                  className="bg-bg-elevated/50 border border-border/80 rounded-xl p-3 flex flex-col justify-between space-y-2 relative overflow-hidden"
                >
                  {/* Step Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-accent-500/20 text-accent-bright border border-accent-500/30">
                      Bước {step.step}
                    </span>
                    <span className="text-[10px] text-text-muted font-medium">
                      {step.phaseNameVi}
                    </span>
                  </div>

                  {/* Character info */}
                  <div className="flex items-center gap-2 pt-1">
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border shrink-0 bg-bg-card">
                      <Image
                        src={iconUrl}
                        alt={step.characterName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-text-primary truncate">
                        {step.characterName}
                      </div>
                      <span className="inline-block px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-bg-card border border-border text-amber-400">
                        {step.action}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-[11px] text-text-secondary leading-snug line-clamp-3 pt-1">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 rounded-xl bg-bg-secondary/70 border border-border/50 text-[11px] text-text-muted flex items-start gap-2">
            <span className="text-accent-bright font-bold">💡 Mẹo KQM:</span>
            <span>
              Hãy đảm bảo các kỹ năng có cơ chế <strong>Snapshotting</strong> (như Bánh Xe Lửa Xiangling) được kích hoạt
              sau khi Bennett dựng Vùng Tuyệt Kỹ Q hoặc Kazuha đã khuếch tán để tối đa hóa sát thương toàn bộ chu kỳ!
            </span>
          </div>
        </div>
      )}

      {/* TAB 2: ENERGY RECHARGE EVALUATIONS */}
      {activeTab === "er" && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {erEvaluations.map((evalItem) => {
              const charInfo = characterMap[evalItem.id];
              const iconUrl = charInfo?.icons?.[0] || "/local-genshin-assets/ui/character_default.png";
              const isHighCost = evalItem.burstCost >= 80;

              return (
                <div
                  key={evalItem.id}
                  className="bg-bg-elevated/50 border border-border rounded-xl p-3 space-y-2 flex flex-col justify-between"
                >
                  <div className="flex items-center gap-2">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border border-border shrink-0 bg-bg-card">
                      <Image
                        src={iconUrl}
                        alt={evalItem.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-text-primary truncate">
                        {evalItem.name}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px]">
                        <span className="text-text-muted">Nộ:</span>
                        <span
                          className={`font-mono font-bold ${
                            isHighCost ? "text-rose-400" : "text-text-primary"
                          }`}
                        >
                          {evalItem.burstCost} Năng lượng
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recommended ER Card */}
                  <div className="bg-bg-card/80 rounded-lg p-2 border border-border/60 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-muted text-[11px]">ER Mục Tiêu:</span>
                      <span className="font-mono font-bold text-accent-bright text-sm tabular-nums">
                        {evalItem.recommendedEr}%
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[10px]">
                      {evalItem.isBatteryAvailable ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <span>✓</span> Có hỗ trợ nạp
                        </span>
                      ) : (
                        <span className="text-amber-400 font-medium flex items-center gap-1">
                          <span>⚠</span> Solo nguyên tố
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-text-muted italic leading-tight">
                    {evalItem.notes}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="p-2.5 rounded-xl bg-bg-secondary/70 border border-border/50 text-[11px] text-text-muted flex items-start gap-2">
            <span className="text-accent-bright font-bold">🔋 Cơ Chế Hạt Năng Lượng:</span>
            <span>
              Hạt năng lượng cùng nguyên tố cấp 3 năng lượng cho nhân vật trên sân và 1.8 cho ngoài sân; khác nguyên tố
              chỉ cấp 1 (trên sân) và 0.6 (ngoài sân). Việc nhường hạt (Funneling) và trang bị vũ khí Tây Phong / Tế Lễ
              sẽ giúp giảm bớt 20-30% chỉ số Nạp cần thiết trên Thánh Di Vật.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
