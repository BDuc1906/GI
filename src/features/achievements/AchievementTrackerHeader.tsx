"use client";

import { useRef, useState } from "react";
import { useAchievementTracker } from "./tracker-storage";

interface AchievementTrackerHeaderProps {
  totalAchievements: number;
  totalPrimogems: number;
}

export function AchievementTrackerHeader({
  totalAchievements,
  totalPrimogems,
}: AchievementTrackerHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [notification, setNotification] = useState<{ text: string; isError?: boolean } | null>(null);

  const {
    completedCount,
    totalEarnedPrimogems,
    exportData,
    importData,
    resetAll,
  } = useAchievementTracker();

  // Tỉ lệ hoàn thành (%)
  const achievementPercent = totalAchievements > 0
    ? Math.min(100, Math.round((completedCount / totalAchievements) * 1000) / 10)
    : 0;

  const primogemPercent = totalPrimogems > 0
    ? Math.min(100, Math.round((totalEarnedPrimogems / totalPrimogems) * 1000) / 10)
    : 0;

  const remainingPrimogems = Math.max(0, totalPrimogems - totalEarnedPrimogems);

  const handleExport = () => {
    try {
      const dataStr = exportData();
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `leibo-achievements-progress-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification("Đã tải xuống file sao lưu tiến độ thành tựu!");
    } catch {
      showNotification("Không thể xuất dữ liệu sao lưu.", true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;
      const res = importData(content);
      if (res.success) {
        showNotification(res.message);
      } else {
        showNotification(res.message, true);
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.onerror = () => {
      showNotification("Lỗi khi đọc file.", true);
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (completedCount === 0) return;
    const confirmReset = window.confirm(
      "Bạn có chắc muốn xoá toàn bộ tiến độ đã đánh dấu không? Hãy xuất file sao lưu trước nếu cần."
    );
    if (confirmReset) {
      resetAll();
      showNotification("Đã đặt lại toàn bộ tiến độ thành tựu.");
    }
  };

  const showNotification = (text: string, isError = false) => {
    setNotification({ text, isError });
    setTimeout(() => setNotification(null), 4000);
  };

  return (
    <div className="bg-bg-card border-2 border-border/80 rounded-2xl p-5 md:p-6 mb-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-border/60">
        <div>
          <h2 className="font-display text-xl md:text-2xl font-bold text-text-primary flex items-center gap-2">
            <span>Tiến độ Thành tựu cá nhân</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent-500/10 text-accent-bright font-semibold">
              Lưu tự động
            </span>
          </h2>
          <p className="text-xs md:text-sm text-text-secondary mt-1">
            Đánh dấu các thành tựu bạn đã hoàn thành để theo dõi số Nguyên Thạch còn lại.
          </p>
        </div>

        {/* Cụm nút thao tác dữ liệu */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json,application/json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-bg-input border border-border hover:border-gold/60 text-text-secondary hover:text-text-primary transition-all flex items-center gap-1.5"
            title="Nhập file JSON đã sao lưu trước đó"
          >
            <span>Nhập file</span>
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-bg-input border border-border hover:border-gold/60 text-text-secondary hover:text-text-primary transition-all flex items-center gap-1.5"
            title="Xuất file JSON để sao lưu hoặc chuyển sang máy khác"
          >
            <span>Xuất file</span>
          </button>
          {completedCount > 0 && (
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/10 border border-red-500/30 hover:border-red-500/60 text-red-400 transition-all flex items-center gap-1"
              title="Đặt lại tiến độ"
            >
              <span>↺</span>
              <span>Đặt lại</span>
            </button>
          )}
        </div>
      </div>

      {notification && (
        <div
          className={`mt-3 p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
            notification.isError
              ? "bg-red-500/10 text-red-400 border-red-500/30"
              : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
          }`}
        >
          <span>{notification.isError ? "⚠️" : "✓"}</span>
          <span>{notification.text}</span>
        </div>
      )}

      {/* Grid 2 cột thống kê: Tiến độ số lượng & Tiến độ Nguyên Thạch */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-5">
        {/* Cột 1: Số lượng thành tựu */}
        <div className="bg-bg-primary/60 border border-border/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-text-muted font-medium">Thành tựu đã mở</span>
            <span className="font-semibold text-text-primary">
              <span className="text-emerald-400 text-sm font-bold">{completedCount.toLocaleString()}</span> /{" "}
              {totalAchievements.toLocaleString()} ({achievementPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-bg-card rounded-full overflow-hidden border border-border/40">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
              style={{ width: `${achievementPercent}%` }}
            />
          </div>
        </div>

        {/* Cột 2: Số Nguyên Thạch thu hoạch */}
        <div className="bg-bg-primary/60 border border-border/60 rounded-xl p-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-text-muted font-medium flex items-center gap-1">
              <span>✦</span> Nguyên Thạch đã nhận
            </span>
            <span className="font-semibold text-text-primary">
              <span className="text-gold text-sm font-bold">{totalEarnedPrimogems.toLocaleString()}</span> /{" "}
              {totalPrimogems.toLocaleString()} ({primogemPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-bg-card rounded-full overflow-hidden border border-border/40">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-gold transition-all duration-300 rounded-full"
              style={{ width: `${primogemPercent}%` }}
            />
          </div>
          <div className="text-[11px] text-text-muted mt-2 text-right">
            Còn lại: <strong className="text-text-secondary font-semibold">+{remainingPrimogems.toLocaleString()} ✦</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
