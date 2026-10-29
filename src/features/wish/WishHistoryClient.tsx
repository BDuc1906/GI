"use client";

import { useState, useTransition, useSyncExternalStore, useId } from "react";
import type { WishHistoryResult, WishRecord } from "@/app/api/tools/wish-history/route";

const STORAGE_KEY = "leibo-wish-history-v1";

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  return () => window.removeEventListener("storage", cb);
}

function getStoredHistory(): WishHistoryResult | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as WishHistoryResult) : null;
  } catch {
    return null;
  }
}

function saveStoredHistory(data: WishHistoryResult | null) {
  try {
    if (!data) {
      window.localStorage.removeItem(STORAGE_KEY);
    } else {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
    window.dispatchEvent(new Event("storage"));
  } catch {
    // ignore
  }
}

type BannerTab = "character" | "weapon" | "standard" | "chronicled";

export function WishHistoryClient() {
  const fileInputId = useId();
  const cachedData = useSyncExternalStore(
    subscribe,
    getStoredHistory,
    () => null
  );

  const [authUrl, setAuthUrl] = useState("");
  const [activeTab, setActiveTab] = useState<BannerTab>("character");
  const [filterRarity, setFilterRarity] = useState<string>("all");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentResult = cachedData;

  const handleFetchHistory = () => {
    if (!authUrl.trim()) {
      setErrorMsg("Vui lòng dán liên kết URL lịch sử cầu nguyện.");
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/tools/wish-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authUrl: authUrl.trim() }),
        });

        const json = await res.json();
        if (!res.ok || !json.success) {
          throw new Error(json.error?.message || "Không thể tải lịch sử cầu nguyện.");
        }

        saveStoredHistory(json.data as WishHistoryResult);
        setAuthUrl("");
      } catch (err: unknown) {
        setErrorMsg(err instanceof Error ? err.message : "Đã có lỗi xảy ra.");
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.banners && parsed.totalWishes !== undefined) {
          saveStoredHistory(parsed as WishHistoryResult);
        } else if (Array.isArray(parsed)) {
          // Gửi mảng wish thô tới API xử lý
          startTransition(async () => {
            const res = await fetch("/api/tools/wish-history", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ jsonImport: parsed }),
            });
            const json = await res.json();
            if (json.success) {
              saveStoredHistory(json.data);
            }
          });
        } else {
          throw new Error("Định dạng file JSON không tương thích.");
        }
      } catch {
        setErrorMsg("File JSON không hợp lệ.");
      }
    };
    reader.readAsText(file);
  };

  const handleExportJson = () => {
    if (!currentResult) return;
    const blob = new Blob([JSON.stringify(currentResult, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `genshin-wish-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm("Bạn có chắc muốn xóa dữ liệu lịch sử ước nguyện đã lưu trên trình duyệt?")) {
      saveStoredHistory(null);
    }
  };

  // Tính thống kê theo tab hiện tại
  const currentBannerWishes: WishRecord[] =
    currentResult?.banners[activeTab] ?? [];

  // Pity hiện tại (số wish tính từ 5★ gần nhất)
  const lastFiveStarIndex = currentBannerWishes.findIndex((w) => w.rankType === "5");
  const currentPity = lastFiveStarIndex === -1
    ? currentBannerWishes.length
    : lastFiveStarIndex;

  const maxPity = activeTab === "weapon" ? 80 : 90;
  const softPity = activeTab === "weapon" ? 64 : 74;

  const fiveStarsInBanner = currentBannerWishes.filter((w) => w.rankType === "5");
  const _fourStarsInBanner = currentBannerWishes.filter((w) => w.rankType === "4");

  const avgRollsPerFiveStar =
    fiveStarsInBanner.length > 0
      ? (currentBannerWishes.length / fiveStarsInBanner.length).toFixed(1)
      : "—";

  const filteredWishes = currentBannerWishes.filter((w) => {
    if (filterRarity === "all") return true;
    return w.rankType === filterRarity;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* ── Khối nhập liệu / Import ── */}
      <div className="rounded-2xl border border-border bg-bg-surface p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-text-primary flex items-center gap-2">
            Đồng bộ &amp; Nhập dữ liệu Cầu Nguyện
          </h2>
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="text-xs text-accent-bright hover:underline font-medium"
          >
            {showGuide ? "Ẩn hướng dẫn" : "Xem cách lấy link từ game"}
          </button>
        </div>

        {showGuide && (
          <div className="mb-6 p-4 rounded-xl bg-bg-elevated border border-border text-sm text-text-secondary leading-relaxed">
            <h4 className="font-semibold text-text-primary mb-2">
              Cách lấy link Lịch Sử Wish trên PC (Chính thức, bảo mật 100%):
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 ml-1">
              <li>Mở game <strong>Genshin Impact</strong> trên máy tính.</li>
              <li>Mở giao diện Cầu Nguyện (phím F3) và bấm vào mục <strong>Lịch Sử</strong> của banner bất kỳ.</li>
              <li>Chờ trang tải xong, mở <strong>PowerShell</strong> (nhấn phím Win + X, chọn Windows PowerShell hoặc Terminal).</li>
              <li>Dán đoạn lệnh script sau rồi nhấn Enter:</li>
            </ol>
            <div className="mt-2.5 p-3 rounded-lg bg-bg-primary font-mono text-xs text-accent-bright overflow-x-auto select-all">
              {`Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://gist.githubusercontent.com/MadeBaruna/109312984852924513783a37866e4a50/raw/getlink.ps1'))`}
            </div>
            <p className="mt-2 text-xs text-text-secondary">
              Script sẽ tự động copy URL vào Clipboard của bạn. Sau đó chỉ cần dán vào ô bên dưới!
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={authUrl}
            onChange={(e) => setAuthUrl(e.target.value)}
            placeholder="Dán URL xác thực Hoyoverse tại đây..."
            className="flex-1 rounded-xl border border-border bg-bg-elevated px-4 py-2.5 text-sm text-text-primary placeholder:text-text-secondary/60 focus:outline-none focus:border-accent-500"
            disabled={isPending}
          />
          <button
            type="button"
            onClick={handleFetchHistory}
            disabled={isPending}
            className="rounded-xl bg-accent-500 hover:bg-accent-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 shrink-0 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Đang quét...
              </>
            ) : (
              "Phân tích"
            )}
          </button>
        </div>

        {errorMsg && (
          <p className="mt-3 text-xs text-red-400 font-medium">{errorMsg}</p>
        )}

        <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-text-secondary">
          <div className="flex items-center gap-3">
            <span>Hoặc nhập file sao lưu:</span>
            <input
              type="file"
              id={fileInputId}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor={fileInputId}
              className="cursor-pointer px-3 py-1.5 rounded-lg border border-border hover:border-accent-500 text-text-primary transition-colors font-medium"
            >
              Tải lên JSON
            </label>
          </div>

          {currentResult && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportJson}
                className="px-3 py-1.5 rounded-lg border border-border hover:border-accent-500 text-text-primary transition-colors font-medium"
              >
                Xuất JSON
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors font-medium"
              >
                Xóa dữ liệu
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Kết quả thống kê ── */}
      {currentResult ? (
        <div className="flex flex-col gap-6">
          {/* Dashboard tổng */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border bg-bg-surface p-4">
              <span className="text-xs text-text-secondary">Tổng số Cầu Nguyện</span>
              <div className="text-2xl font-bold font-mono text-text-primary mt-1">
                {currentResult.totalWishes}
              </div>
              <span className="text-xs text-text-secondary mt-0.5 block">
                ≈ {(currentResult.totalWishes * 160).toLocaleString()} Primogem
              </span>
            </div>

            <div className="rounded-xl border border-border bg-bg-surface p-4">
              <span className="text-xs text-text-secondary">5★ Đã sở hữu</span>
              <div className="text-2xl font-bold font-mono text-yellow-400 mt-1">
                {currentResult.fiveStarCount}
              </div>
              <span className="text-xs text-text-secondary mt-0.5 block">
                {currentResult.totalWishes > 0
                  ? ((currentResult.fiveStarCount / currentResult.totalWishes) * 100).toFixed(2)
                  : 0}
                % tỉ lệ
              </span>
            </div>

            <div className="rounded-xl border border-border bg-bg-surface p-4">
              <span className="text-xs text-text-secondary">4★ Đã nhận</span>
              <div className="text-2xl font-bold font-mono text-purple-400 mt-1">
                {currentResult.fourStarCount}
              </div>
              <span className="text-xs text-text-secondary mt-0.5 block">
                {currentResult.totalWishes > 0
                  ? ((currentResult.fourStarCount / currentResult.totalWishes) * 100).toFixed(1)
                  : 0}
                % tỉ lệ
              </span>
            </div>

            <div className="rounded-xl border border-border bg-bg-surface p-4">
              <span className="text-xs text-text-secondary">Trung bình roll / 5★</span>
              <div className="text-2xl font-bold font-mono text-accent-bright mt-1">
                {avgRollsPerFiveStar}
              </div>
              <span className="text-xs text-text-secondary mt-0.5 block">
                trên banner đang chọn
              </span>
            </div>
          </div>

          {/* Banner Tabs */}
          <div className="flex border-b border-border gap-2 overflow-x-auto">
            {(
              [
                { id: "character", label: "Nhân vật sự kiện", icon: "/local-genshin-assets/ui/intertwined_fate.png" },
                { id: "weapon", label: "Vũ khí sự kiện", icon: "/local-genshin-assets/ui/intertwined_fate.png" },
                { id: "standard", label: "Thường niên (Standard)", icon: "/local-genshin-assets/ui/wish.png" },
                { id: "chronicled", label: "Biên Niên (Chronicled)", icon: "/local-genshin-assets/ui/intertwined_fate.png" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setFilterRarity("all");
                }}
                className={`px-4 py-3 text-sm font-semibold border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "border-accent-500 text-accent-bright"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={tab.icon} alt="" width={18} height={18} className="w-[18px] h-[18px] object-contain shrink-0" />
                <span>{tab.label} ({currentResult.banners[tab.id].length})</span>
              </button>
            ))}
          </div>

          {/* Pity Tracker Card */}
          <div className="rounded-2xl border border-border bg-bg-surface p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <span className="text-xs text-text-secondary">Pity hiện tại</span>
                <div className="text-3xl font-extrabold font-mono text-text-primary flex items-baseline gap-2 mt-0.5">
                  <span
                    className={
                      currentPity >= softPity ? "text-yellow-400" : "text-text-primary"
                    }
                  >
                    {currentPity}
                  </span>
                  <span className="text-sm font-normal text-text-secondary">
                    / {maxPity}
                  </span>
                </div>
              </div>

              <div className="text-xs text-text-secondary sm:text-right">
                {currentPity >= softPity ? (
                  <span className="px-2.5 py-1 rounded-full bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 font-semibold">
                    Đang trong Soft Pity ({softPity}+) — Tỷ lệ 5★ tăng vọt!
                  </span>
                ) : (
                  <span>
                    Còn tối đa <strong>{maxPity - currentPity}</strong> roll để bảo hiểm 5★
                  </span>
                )}
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 rounded-full bg-bg-elevated overflow-hidden border border-border">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  currentPity >= softPity
                    ? "bg-gradient-to-r from-yellow-500 to-amber-400"
                    : "bg-accent-500"
                }`}
                style={{ width: `${Math.min(100, (currentPity / maxPity) * 100)}%` }}
              />
            </div>
          </div>

          {/* Danh sách 5★ đã trúng */}
          {fiveStarsInBanner.length > 0 && (
            <div className="rounded-2xl border border-border bg-bg-surface p-5">
              <h3 className="font-semibold text-text-primary text-sm mb-3">
                Lịch sử 5★ trên banner này ({fiveStarsInBanner.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {fiveStarsInBanner.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5"
                  >
                    <div>
                      <div className="font-semibold text-sm text-yellow-400">
                        {item.name}
                      </div>
                      <div className="text-xs text-text-secondary mt-0.5">
                        {item.time.slice(0, 16)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-sm px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300">
                        {item.pity ?? "—"} roll
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bảng chi tiết toàn bộ lịch sử */}
          <div className="rounded-2xl border border-border bg-bg-surface overflow-hidden">
            <div className="p-4 border-b border-border flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-semibold text-sm text-text-primary">
                Chi tiết từng lượt Cầu Nguyện
              </h3>

              <div className="flex items-center gap-1.5 text-xs">
                <span>Lọc:</span>
                {(
                  [
                    { id: "all", label: "Tất cả" },
                    { id: "5", label: "5★", color: "text-yellow-400" },
                    { id: "4", label: "4★", color: "text-purple-400" },
                    { id: "3", label: "3★", color: "text-blue-400" },
                  ] as const
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFilterRarity(f.id)}
                    className={`px-2.5 py-1 rounded-lg border transition-colors ${
                      filterRarity === f.id
                        ? "border-accent-500 bg-accent-500/10 font-bold text-accent-bright"
                        : "border-border text-text-secondary hover:border-border/80"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-bg-elevated text-xs text-text-secondary sticky top-0 border-b border-border">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Tên vật phẩm</th>
                    <th className="py-2.5 px-4 font-semibold">Loại</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Độ hiếm</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Pity</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredWishes.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-text-secondary text-sm">
                        Không có dữ liệu phù hợp bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredWishes.map((w) => {
                      const isFive = w.rankType === "5";
                      const isFour = w.rankType === "4";
                      return (
                        <tr
                          key={w.id}
                          className={`hover:bg-bg-elevated/50 transition-colors ${
                            isFive ? "bg-yellow-500/5" : isFour ? "bg-purple-500/5" : ""
                          }`}
                        >
                          <td className="py-2.5 px-4 font-medium">
                            <span
                              className={
                                isFive
                                  ? "text-yellow-400 font-bold"
                                  : isFour
                                  ? "text-purple-400 font-semibold"
                                  : "text-text-primary"
                              }
                            >
                              {w.name}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-xs text-text-secondary">
                            {w.itemType}
                          </td>
                          <td className="py-2.5 px-4 text-center">
                            <span
                              className={`text-xs px-2 py-0.5 rounded font-mono font-bold ${
                                isFive
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : isFour
                                  ? "bg-purple-500/20 text-purple-400"
                                  : "bg-blue-500/10 text-blue-400"
                              }`}
                            >
                              {w.rankType}★
                            </span>
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono text-xs">
                            {w.pity ?? "—"}
                          </td>
                          <td className="py-2.5 px-4 text-right text-xs text-text-secondary font-mono">
                            {w.time}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-16 text-center rounded-2xl border border-dashed border-border text-text-secondary">
          <p className="text-base font-medium text-text-primary mb-1">
            Chưa có dữ liệu lịch sử ước nguyện
          </p>
          <p className="text-sm">
            Dán liên kết URL hoặc tải lên file JSON sao lưu ở trên để bắt đầu phân tích.
          </p>
        </div>
      )}
    </div>
  );
}
