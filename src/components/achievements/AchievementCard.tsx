import { EntityThumb } from "@/components/ui/EntityThumb";
import { formatReward, stagesOf } from "@/lib/game/achievement-format";

interface AchievementCardProps {
  name: string;
  groupName?: string | null;
  isHidden?: boolean | null;
  raw: unknown;
  /** URL ảnh biểu tượng của nhóm thành tựu (xem imageFor). */
  iconCandidates?: string[];
}

/** Thẻ thành tựu dùng chung cho /achievements và /achievements/hidden. */
export function AchievementCard({ name, groupName, isHidden, raw, iconCandidates = [] }: AchievementCardProps) {
  const stages = stagesOf(raw);
  const multi = stages.length > 1;

  return (
    <article className="bg-bg-card border-2 border-border rounded-xl p-4 hover:border-accent-500 transition-all h-full">
      <div className="flex items-start gap-3 mb-2">
        <EntityThumb candidates={iconCandidates} alt={groupName ?? name} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-text-primary">{name}</h3>
            {isHidden && (
              <span className="shrink-0 px-2 py-0.5 bg-warning/20 text-warning text-[11px] font-medium rounded-full">
                Ẩn
              </span>
            )}
          </div>
          {groupName && <p className="text-xs text-text-muted">{groupName}</p>}
        </div>
      </div>

      {stages.length === 0 ? (
        <p className="text-sm text-text-muted">Chưa có mô tả điều kiện.</p>
      ) : (
        <ol className="space-y-2">
          {stages.map((s, i) => {
            const reward = formatReward(s.reward);
            return (
              <li key={i} className="text-sm">
                {multi && <span className="text-xs font-semibold text-accent-bright mr-1">Bậc {i + 1}:</span>}
                <span className="text-text-secondary">{s.description || "—"}</span>
                {(typeof s.progress === "number" && s.progress > 1) || reward ? (
                  <div className="text-[11px] text-text-muted mt-0.5">
                    {typeof s.progress === "number" && s.progress > 1 ? `Tiến độ: ${s.progress}` : ""}
                    {typeof s.progress === "number" && s.progress > 1 && reward ? " · " : ""}
                    {reward ? `Thưởng: ${reward}` : ""}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ol>
      )}
    </article>
  );
}
