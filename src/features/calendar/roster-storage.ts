"use client";

import { useSyncExternalStore } from "react";

const STORAGE_KEY = "leibo_farm_roster_v1";

export interface PinnedTargetItem {
  id: string;
  name: string;
  type: "character" | "weapon";
  rarity: number;
  iconUrl: string | null;
  visionOrWeaponType: string;
  materialNames: string[];
}

let memoryTargets: PinnedTargetItem[] = [];
let isLoaded = false;
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

function loadFromStorage(): PinnedTargetItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: PinnedTargetItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Không ném lỗi
  }
}

function ensureLoaded() {
  if (!isLoaded && typeof window !== "undefined") {
    memoryTargets = loadFromStorage();
    isLoaded = true;
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      memoryTargets = loadFromStorage();
      notify();
    }
  });
}

export const rosterStore = {
  getState(): PinnedTargetItem[] {
    ensureLoaded();
    return memoryTargets;
  },

  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  addTarget(item: PinnedTargetItem) {
    ensureLoaded();
    if (memoryTargets.some((t) => t.id === item.id)) return;
    memoryTargets = [...memoryTargets, item];
    saveToStorage(memoryTargets);
    notify();
  },

  removeTarget(id: string) {
    ensureLoaded();
    memoryTargets = memoryTargets.filter((t) => t.id !== id);
    saveToStorage(memoryTargets);
    notify();
  },

  clearAll() {
    memoryTargets = [];
    saveToStorage(memoryTargets);
    notify();
  },
};

export function useFarmRoster() {
  const targets = useSyncExternalStore(
    rosterStore.subscribe,
    rosterStore.getState,
    () => []
  );

  return {
    targets,
    addTarget: rosterStore.addTarget,
    removeTarget: rosterStore.removeTarget,
    clearAll: rosterStore.clearAll,
    isPinned: (id: string) => targets.some((t) => t.id === id),
  };
}
