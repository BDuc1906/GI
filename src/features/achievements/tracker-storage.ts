"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "leibo_achievements_tracker_v1";

export interface AchievementTrackerData {
  /** Map of achievementId -> 1-based array of completed stage numbers, vd: [1, 2, 3] */
  completedStages: Record<string, number[]>;
  /** Map of achievementId -> tổng primogem đã nhận từ các bậc đã hoàn thành */
  earnedPrimosByAchievement: Record<string, number>;
  lastUpdated?: string;
}

const EMPTY_DATA: AchievementTrackerData = {
  completedStages: {},
  earnedPrimosByAchievement: {},
};

let memoryState: AchievementTrackerData = EMPTY_DATA;
let isLoaded = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function loadFromStorage(): AchievementTrackerData {
  if (typeof window === "undefined") return EMPTY_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_DATA;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object" && parsed.completedStages) {
      return {
        completedStages: parsed.completedStages || {},
        earnedPrimosByAchievement: parsed.earnedPrimosByAchievement || {},
        lastUpdated: parsed.lastUpdated,
      };
    }
    // Hỗ trợ legacy format nếu có
    if (parsed && typeof parsed === "object") {
      return {
        completedStages: parsed,
        earnedPrimosByAchievement: {},
      };
    }
    return EMPTY_DATA;
  } catch {
    return EMPTY_DATA;
  }
}

function saveToStorage(state: AchievementTrackerData) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Không ném lỗi nếu quota đầy hoặc storage bị chặn
  }
}

function ensureLoaded() {
  if (!isLoaded && typeof window !== "undefined") {
    memoryState = loadFromStorage();
    isLoaded = true;
  }
}

// Lắng nghe thay đổi giữa các tab
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      memoryState = loadFromStorage();
      notify();
    }
  });
}

export const achievementTrackerStore = {
  getState(): AchievementTrackerData {
    ensureLoaded();
    return memoryState;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  /** Đánh dấu/bỏ đánh dấu một bậc cụ thể của thành tựu (1-based stageNum: 1, 2, 3) */
  toggleStage(
    achievementId: string,
    stageNum: number,
    stagePrimos: number,
    allStages: { stageNum: number; primos: number }[]
  ) {
    ensureLoaded();
    const currentStages = new Set(memoryState.completedStages[achievementId] ?? []);
    if (currentStages.has(stageNum)) {
      currentStages.delete(stageNum);
    } else {
      currentStages.add(stageNum);
    }

    const nextStages = Array.from(currentStages).sort((a, b) => a - b);
    const nextCompleted = { ...memoryState.completedStages };
    const nextPrimos = { ...memoryState.earnedPrimosByAchievement };

    if (nextStages.length === 0) {
      delete nextCompleted[achievementId];
      delete nextPrimos[achievementId];
    } else {
      nextCompleted[achievementId] = nextStages;
      // Tính lại primogems của riêng thành tựu này
      const earned = allStages.reduce((sum, s) => (currentStages.has(s.stageNum) ? sum + s.primos : sum), 0);
      nextPrimos[achievementId] = earned;
    }

    memoryState = {
      completedStages: nextCompleted,
      earnedPrimosByAchievement: nextPrimos,
      lastUpdated: new Date().toISOString(),
    };
    saveToStorage(memoryState);
    notify();
  },

  /** Hoàn thành toàn bộ các bậc của thành tựu hoặc bỏ chọn toàn bộ */
  toggleAllStages(achievementId: string, allStages: { stageNum: number; primos: number }[]) {
    ensureLoaded();
    const currentStages = memoryState.completedStages[achievementId] ?? [];
    const isAllDone = currentStages.length === allStages.length;

    const nextCompleted = { ...memoryState.completedStages };
    const nextPrimos = { ...memoryState.earnedPrimosByAchievement };

    if (isAllDone) {
      delete nextCompleted[achievementId];
      delete nextPrimos[achievementId];
    } else {
      nextCompleted[achievementId] = allStages.map((s) => s.stageNum);
      nextPrimos[achievementId] = allStages.reduce((sum, s) => sum + s.primos, 0);
    }

    memoryState = {
      completedStages: nextCompleted,
      earnedPrimosByAchievement: nextPrimos,
      lastUpdated: new Date().toISOString(),
    };
    saveToStorage(memoryState);
    notify();
  },

  /** Đánh dấu hoàn thành toàn bộ danh sách thành tựu truyền vào (vd: cả trang hiện tại) */
  markMultiple(items: { id: string; allStages: { stageNum: number; primos: number }[] }[]) {
    ensureLoaded();
    const nextCompleted = { ...memoryState.completedStages };
    const nextPrimos = { ...memoryState.earnedPrimosByAchievement };

    for (const item of items) {
      nextCompleted[item.id] = item.allStages.map((s) => s.stageNum);
      nextPrimos[item.id] = item.allStages.reduce((sum, s) => sum + s.primos, 0);
    }

    memoryState = {
      completedStages: nextCompleted,
      earnedPrimosByAchievement: nextPrimos,
      lastUpdated: new Date().toISOString(),
    };
    saveToStorage(memoryState);
    notify();
  },

  /** Bỏ đánh dấu nhiều thành tựu */
  unmarkMultiple(ids: string[]) {
    ensureLoaded();
    const nextCompleted = { ...memoryState.completedStages };
    const nextPrimos = { ...memoryState.earnedPrimosByAchievement };

    for (const id of ids) {
      delete nextCompleted[id];
      delete nextPrimos[id];
    }

    memoryState = {
      completedStages: nextCompleted,
      earnedPrimosByAchievement: nextPrimos,
      lastUpdated: new Date().toISOString(),
    };
    saveToStorage(memoryState);
    notify();
  },

  /** Xuất chuỗi JSON để sao lưu */
  exportData(): string {
    ensureLoaded();
    const completedCount = Object.keys(memoryState.completedStages).length;
    const totalPrimos = Object.values(memoryState.earnedPrimosByAchievement).reduce((a, b) => a + b, 0);

    return JSON.stringify(
      {
        source: "LEIBO",
        version: 1,
        exportedAt: new Date().toISOString(),
        summary: {
          totalCompletedAchievements: completedCount,
          totalEarnedPrimogems: totalPrimos,
        },
        data: memoryState,
      },
      null,
      2
    );
  },

  /** Nhập dữ liệu sao lưu từ file JSON */
  importData(rawContent: string): { success: boolean; importedCount: number; message: string } {
    try {
      const parsed = JSON.parse(rawContent);
      let incomingCompleted: Record<string, number[]> = {};
      let incomingPrimos: Record<string, number> = {};

      if (parsed.data?.completedStages) {
        // Chuẩn LEIBO export
        incomingCompleted = parsed.data.completedStages;
        incomingPrimos = parsed.data.earnedPrimosByAchievement || {};
      } else if (parsed.completedStages) {
        incomingCompleted = parsed.completedStages;
        incomingPrimos = parsed.earnedPrimosByAchievement || {};
      } else if (Array.isArray(parsed)) {
        // Mảng các achievement ID
        parsed.forEach((id: unknown) => {
          if (typeof id === "string" || typeof id === "number") {
            incomingCompleted[String(id)] = [1];
          }
        });
      } else if (typeof parsed === "object" && parsed !== null) {
        // Record<string, number[] | boolean | number>
        Object.entries(parsed).forEach(([key, val]) => {
          if (Array.isArray(val)) {
            incomingCompleted[key] = val.filter((x): x is number => typeof x === "number");
          } else if (typeof val === "boolean" && val) {
            incomingCompleted[key] = [1];
          } else if (typeof val === "number") {
            incomingCompleted[key] = Array.from({ length: val }, (_, i) => i + 1);
          }
        });
      } else {
        return { success: false, importedCount: 0, message: "Định dạng file không hợp lệ." };
      }

      ensureLoaded();
      const mergedCompleted = { ...memoryState.completedStages, ...incomingCompleted };
      const mergedPrimos = { ...memoryState.earnedPrimosByAchievement, ...incomingPrimos };

      memoryState = {
        completedStages: mergedCompleted,
        earnedPrimosByAchievement: mergedPrimos,
        lastUpdated: new Date().toISOString(),
      };
      saveToStorage(memoryState);
      notify();

      const count = Object.keys(mergedCompleted).length;
      return { success: true, importedCount: count, message: `Đã nhập thành công ${count} mục!` };
    } catch (err) {
      return {
        success: false,
        importedCount: 0,
        message: err instanceof Error ? err.message : "Lỗi đọc file JSON.",
      };
    }
  },

  /** Xoá toàn bộ tiến độ */
  resetAll() {
    memoryState = EMPTY_DATA;
    saveToStorage(memoryState);
    notify();
  },
};

/** Hook đồng bộ trạng thái an toàn với SSR Next.js 16 / React 19 */
export function useAchievementTracker() {
  const state = useSyncExternalStore(
    achievementTrackerStore.subscribe,
    achievementTrackerStore.getState,
    () => EMPTY_DATA // Snapshot phía server
  );

  const completedCount = Object.keys(state.completedStages).length;
  const totalEarnedPrimogems = Object.values(state.earnedPrimosByAchievement).reduce((a, b) => a + b, 0);

  function isStageCompleted(id: string, stageNum: number): boolean {
    return Boolean(state.completedStages[id]?.includes(stageNum));
  }

  function isAchievementCompleted(id: string, totalStages: number): boolean {
    const done = state.completedStages[id];
    return Boolean(done && done.length >= totalStages && totalStages > 0);
  }

  return {
    state,
    completedCount,
    totalEarnedPrimogems,
    isStageCompleted,
    isAchievementCompleted,
    toggleStage: achievementTrackerStore.toggleStage,
    toggleAllStages: achievementTrackerStore.toggleAllStages,
    markMultiple: achievementTrackerStore.markMultiple,
    unmarkMultiple: achievementTrackerStore.unmarkMultiple,
    exportData: achievementTrackerStore.exportData,
    importData: achievementTrackerStore.importData,
    resetAll: achievementTrackerStore.resetAll,
  };
}
