"use client";

import { useMemo, useState } from "react";
import { AchievementCard } from "./AchievementCard";
import { getStagePrimogems, stagesOf } from "@/core/game/achievement-format";
import { useAchievementTracker } from "./tracker-storage";

export interface AchievementItemData {
  id: string;
  name: string;
  achievementGroupId?: string | null;
  achievementGroupName?: string | null;
  isHidden?: boolean | null;
  raw: unknown;
  iconCandidates: string[];
}

interface AchievementListClientProps {
  items: AchievementItemData[];
}

type StatusFilter = "all" | "uncompleted" | "completed";

export function AchievementListClient({ items }: AchievementListClientProps) {
  const [filter, setFilter] = useState<StatusFilter>("all");

  const { isAchievementCompleted, markMultiple, unmarkMultiple } = useAchievementTracker();

  // Tiền xử lý dữ liệu các bậc cho từng thành tựu
  const enrichedItems = useMemo(() => {
    return items.map((item) => {
      const stages = stagesOf(item.raw);
      const allStages = stages.map((s, idx) => ({
        stageNum: idx + 1,
        primos: getStagePrimogems(s),
      }));
      return {
        ...item,
        stagesLength: stages.length,
        allStages,
      };
    });
  }, [items]);

  // Lọc theo trạng thái hoàn thành (client state)
  const filteredItems = useMemo(() => {
    if (filter === "all") return enrichedItems;
    if (filter === "completed") {
      return enrichedItems.filter((item) => isAchievementCompleted(item.id, item.stagesLength));
    }
    return enrichedItems.filter((item) => !isAchievementCompleted(item.id, item.stagesLength));
  }, [enrichedItems, filter, isAchievementCompleted]);

  // Đếm số lượng theo trạng thái trên trang này
  const completedInView = useMemo(() => {
    return enrichedItems.filter((item) => isAchievementCompleted(item.id, item.stagesLength)).length;
  }, [enrichedItems, isAchievementCompleted]);

  const uncompletedInView = enrichedItems.length - completedInView;

  // Thao tác hàng loạt trên trang này
  const handleMarkAllThisPage = () => {
    const payload = enrichedItems.map((item) => ({
      id: item.id,
      allStages: item.allStages,
    }));
    markMultiple(payload);
  };

  const handleUnmarkAllThisPage = () => {
    unmarkMultiple(enrichedItems.map((item) => item.id));
  };

  if (items.length === 0) {
    return <p className="text-text-secondary">Không có thành tựu nào khớp bộ lọc.</p>;
  }

  return (
    <div>
      {/* Thanh công cụ lọc & thao tác nhanh trang */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-border/50">
        {/* Tabs lọc trạng thái */}
        <div className="inline-flex p-1 rounded-xl bg-bg-card border border-border text-xs font-medium">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === "all"
                ? "bg-accent-500 text-bg-primary font-semibold shadow-sm"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Tất cả ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("uncompleted")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === "uncompleted"
                ? "bg-accent-500 text-bg-primary font-semibold shadow-sm"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Chưa xong ({uncompletedInView})
          </button>
          <button
            type="button"
            onClick={() => setFilter("completed")}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              filter === "completed"
                ? "bg-emerald-500 text-bg-primary font-semibold shadow-sm"
                : "text-text-muted hover:text-text-primary"
            }`}
          >
            Đã xong ({completedInView})
          </button>
        </div>

        {/* Nút chọn nhanh trang này */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleMarkAllThisPage}
            className="px-2.5 py-1.5 rounded-lg border border-border bg-bg-card hover:border-emerald-500/50 text-text-secondary hover:text-emerald-400 transition-colors"
          >
            ✓ Chọn hết trang này
          </button>
          {completedInView > 0 && (
            <button
              type="button"
              onClick={handleUnmarkAllThisPage}
              className="px-2.5 py-1.5 rounded-lg border border-border bg-bg-card hover:border-red-500/50 text-text-muted hover:text-red-400 transition-colors"
            >
              ✕ Bỏ chọn trang này
            </button>
          )}
        </div>
      </div>

      {/* Grid danh sách thành tựu */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 px-4 bg-bg-card border-2 border-border/60 rounded-2xl">
          {filter === "uncompleted" ? (
            <div>
              <p className="text-emerald-400 font-semibold mb-1">Xuất sắc!</p>
              <p className="text-text-secondary text-sm">
                Bạn đã hoàn thành toàn bộ các thành tựu trên trang này.
              </p>
            </div>
          ) : (
            <div>
              <p className="text-text-muted text-sm">Chưa có thành tựu nào được đánh dấu hoàn thành trên trang này.</p>
            </div>
          )}
        </div>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((a) => (
            <li key={a.id}>
              <AchievementCard
                id={a.id}
                name={a.name}
                groupName={a.achievementGroupName}
                isHidden={a.isHidden}
                raw={a.raw}
                iconCandidates={a.iconCandidates}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
