"use client";

import { useState, useEffect } from "react";

export function ServerTimersClient() {
  const [asiaTime, setAsiaTime] = useState("");
  const [americaTime, setAmericaTime] = useState("");
  const [europeTime, setEuropeTime] = useState("");
  const [spiralReset, setSpiralReset] = useState("");
  const [theaterReset, setTheaterReset] = useState("");
  const [stygianReset, setStygianReset] = useState("");

  useEffect(() => {
    const updateTimers = () => {
      const now = new Date();

      // Asia server reset: 4:00 UTC = 11:00 UTC+7
      const asiaReset = new Date(now);
      asiaReset.setUTCHours(4, 0, 0, 0);
      if (now > asiaReset) {
        asiaReset.setDate(asiaReset.getDate() + 1);
      }
      const asiaDiff = asiaReset.getTime() - now.getTime();
      const asiaHours = Math.floor(asiaDiff / (1000 * 60 * 60));
      const asiaMins = Math.floor((asiaDiff % (1000 * 60 * 60)) / (1000 * 60));
      const asiaSecs = Math.floor((asiaDiff % (1000 * 60)) / 1000);
      setAsiaTime(`${asiaHours}h ${asiaMins}m ${asiaSecs}s`);

      // America server reset: 4:00 UTC = 23:00 UTC-5
      const americaReset = new Date(now);
      americaReset.setUTCHours(4, 0, 0, 0);
      if (now > americaReset) {
        americaReset.setDate(americaReset.getDate() + 1);
      }
      const americaDiff = americaReset.getTime() - now.getTime();
      const americaHours = Math.floor(americaDiff / (1000 * 60 * 60));
      const americaMins = Math.floor((americaDiff % (1000 * 60 * 60)) / (1000 * 60));
      const americaSecs = Math.floor((americaDiff % (1000 * 60)) / 1000);
      setAmericaTime(`${americaHours}h ${americaMins}m ${americaSecs}s`);

      // Europe server reset: 4:00 UTC = 5:00 UTC+1
      const europeReset = new Date(now);
      europeReset.setUTCHours(4, 0, 0, 0);
      if (now > europeReset) {
        europeReset.setDate(europeReset.getDate() + 1);
      }
      const europeDiff = europeReset.getTime() - now.getTime();
      const europeHours = Math.floor(europeDiff / (1000 * 60 * 60));
      const europeMins = Math.floor((europeDiff % (1000 * 60 * 60)) / (1000 * 60));
      const europeSecs = Math.floor((europeDiff % (1000 * 60)) / 1000);
      setEuropeTime(`${europeHours}h ${europeMins}m ${europeSecs}s`);

      // 1. Nhà Hát Giả Tưởng (Imaginarium Theater): Reset ngày 1 hàng tháng lúc 04:00 UTC
      const theaterDate = new Date(now);
      theaterDate.setUTCHours(4, 0, 0, 0);
      theaterDate.setUTCDate(1);
      if (now.getTime() >= theaterDate.getTime()) {
        theaterDate.setUTCMonth(theaterDate.getUTCMonth() + 1);
        theaterDate.setUTCDate(1);
      }
      const theaterDiff = theaterDate.getTime() - now.getTime();
      const tDays = Math.floor(theaterDiff / (1000 * 60 * 60 * 24));
      const tHours = Math.floor((theaterDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const tMins = Math.floor((theaterDiff % (1000 * 60 * 60)) / (1000 * 60));
      setTheaterReset(`${tDays}d ${tHours}h ${tMins}m`);

      // 2. La Hoàn Thâm Cảnh (Spiral Abyss): Reset ngày 16 hàng tháng lúc 04:00 UTC
      const abyssDate = new Date(now);
      abyssDate.setUTCHours(4, 0, 0, 0);
      abyssDate.setUTCDate(16);
      if (now.getTime() >= abyssDate.getTime()) {
        abyssDate.setUTCMonth(abyssDate.getUTCMonth() + 1);
        abyssDate.setUTCDate(16);
      }
      const abyssDiff = abyssDate.getTime() - now.getTime();
      const aDays = Math.floor(abyssDiff / (1000 * 60 * 60 * 24));
      const aHours = Math.floor((abyssDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const aMins = Math.floor((abyssDiff % (1000 * 60 * 60)) / (1000 * 60));
      setSpiralReset(`${aDays}d ${aHours}h ${aMins}m`);

      // 3. Ảo Cảnh Hiểm Ác (Stygian Onslaught): Xoay tua theo chu kỳ phiên bản 42 ngày (mở ngày 8, kéo dài 35 ngày)
      // Mốc chuẩn Genshin 5.0: 2024-08-28T04:00:00Z
      const epochRef = new Date("2024-08-28T04:00:00Z").getTime();
      const patchLength = 42 * 24 * 60 * 60 * 1000;
      const stygianDuration = 35 * 24 * 60 * 60 * 1000;
      const elapsedSinceRef = (now.getTime() - epochRef) % patchLength;
      const currentPatchStart = now.getTime() - elapsedSinceRef;
      const stygianStart = currentPatchStart + 8 * 24 * 60 * 60 * 1000;
      const stygianEnd = stygianStart + stygianDuration;

      if (now.getTime() < stygianStart) {
        // Chưa mở trong patch này, đếm ngược mở
        const diff = stygianStart - now.getTime();
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setStygianReset(`Mở sau: ${d}d ${h}h`);
      } else if (now.getTime() <= stygianEnd) {
        // Đang mở, đếm ngược kết thúc kỳ
        const diff = stygianEnd - now.getTime();
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setStygianReset(`${d}d ${h}h ${m}m`);
      } else {
        // Kết thúc kỳ hiện tại, đếm ngược đến kỳ kế tiếp
        const nextStart = currentPatchStart + patchLength + 8 * 24 * 60 * 60 * 1000;
        const diff = nextStart - now.getTime();
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setStygianReset(`Kỳ mới: ${d}d ${h}h`);
      }
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <h2 className="font-display text-lg md:text-xl font-bold text-text-primary tracking-wide">
            Thời Gian Reset Máy Chủ &amp; Khiêu Chiến End-Game
          </h2>
        </div>
        <div className="text-xs text-text-muted flex items-center gap-2 font-mono">
          <span className="px-2 py-0.5 rounded bg-bg-card border border-border/60 text-accent-bright font-semibold">
            LIVE SYNC
          </span>
          <span>Tự động cập nhật mỗi giây</span>
        </div>
      </div>

      {/* Grid: 3 Server Reset + 3 Endgame Modes = 6 cards total */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {/* Asia Server */}
        <div className="relative group bg-bg-card/75 border border-border/80 hover:border-accent-500/50 rounded-xl p-3.5 transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-1.5">
            <span className="font-semibold text-text-primary">Asia Server</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-muted">UTC+7</span>
          </div>
          <div className="font-mono text-lg sm:text-xl font-bold tracking-tight text-accent-bright tabular-nums">
            {asiaTime || "--:--:--"}
          </div>
          <div className="text-[11px] text-text-muted mt-1.5 flex items-center justify-between">
            <span>Reset lúc 11:00</span>
            <span className="text-emerald-400/80">Hoạt động</span>
          </div>
        </div>

        {/* America Server */}
        <div className="relative group bg-bg-card/75 border border-border/80 hover:border-accent-500/50 rounded-xl p-3.5 transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-1.5">
            <span className="font-semibold text-text-primary">America Server</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-muted">UTC-5</span>
          </div>
          <div className="font-mono text-lg sm:text-xl font-bold tracking-tight text-accent-bright tabular-nums">
            {americaTime || "--:--:--"}
          </div>
          <div className="text-[11px] text-text-muted mt-1.5 flex items-center justify-between">
            <span>Reset lúc 23:00</span>
            <span className="text-emerald-400/80">Hoạt động</span>
          </div>
        </div>

        {/* Europe Server */}
        <div className="relative group bg-bg-card/75 border border-border/80 hover:border-accent-500/50 rounded-xl p-3.5 transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-1.5">
            <span className="font-semibold text-text-primary">Europe Server</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-muted">UTC+1</span>
          </div>
          <div className="font-mono text-lg sm:text-xl font-bold tracking-tight text-accent-bright tabular-nums">
            {europeTime || "--:--:--"}
          </div>
          <div className="text-[11px] text-text-muted mt-1.5 flex items-center justify-between">
            <span>Reset lúc 05:00</span>
            <span className="text-emerald-400/80">Hoạt động</span>
          </div>
        </div>

        {/* Nhà Hát Giả Tưởng (Imaginarium Theater) */}
        <div className="relative group bg-gradient-to-br from-bg-card to-[#25152a] border border-[#d97706]/40 hover:border-[#fbbf24] rounded-xl p-3.5 transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-amber-300 font-medium mb-1.5">
            <span className="font-semibold text-amber-200 truncate">Nhà Hát Giả Tưởng</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30 font-semibold shrink-0">
              Kỳ Diễn
            </span>
          </div>
          <div className="font-mono text-lg sm:text-xl font-bold tracking-tight text-amber-200 tabular-nums">
            {theaterReset || "--d --h"}
          </div>
          <div className="text-[11px] text-amber-300/70 mt-1.5 flex items-center justify-between">
            <span>Làm mới ngày 01</span>
            <span className="text-amber-300 font-medium">800 Nguyên Thạch</span>
          </div>
        </div>

        {/* La Hoàn Thâm Cảnh (Spiral Abyss) */}
        <div className="relative group bg-gradient-to-br from-bg-card to-[#1a1528] border border-[#764fb0]/40 hover:border-[#b075dd] rounded-xl p-3.5 transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-purple-300 font-medium mb-1.5">
            <span className="font-semibold text-purple-200 truncate">La Hoàn Thâm Cảnh</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#764fb0]/20 text-purple-200 border border-[#764fb0]/30 font-semibold shrink-0">
              Tầng 9-12
            </span>
          </div>
          <div className="font-mono text-lg sm:text-xl font-bold tracking-tight text-purple-200 tabular-nums">
            {spiralReset || "--d --h"}
          </div>
          <div className="text-[11px] text-purple-300/70 mt-1.5 flex items-center justify-between">
            <span>Làm mới ngày 16</span>
            <span className="text-purple-300 font-medium">800 Nguyên Thạch</span>
          </div>
        </div>

        {/* Ảo Cảnh Hiểm Ác (Stygian Onslaught) */}
        <div className="relative group bg-gradient-to-br from-bg-card to-[#281515] border border-[#ef4444]/40 hover:border-[#f87171] rounded-xl p-3.5 transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-rose-300 font-medium mb-1.5">
            <span className="font-semibold text-rose-200 truncate">Ảo Cảnh Hiểm Ác</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-200 border border-rose-500/30 font-semibold shrink-0">
              Endgame
            </span>
          </div>
          <div className="font-mono text-lg sm:text-xl font-bold tracking-tight text-rose-200 tabular-nums">
            {stygianReset || "--d --h"}
          </div>
          <div className="text-[11px] text-rose-300/70 mt-1.5 flex items-center justify-between">
            <span>Kỳ Luân Phiên Boss</span>
            <span className="text-rose-300 font-medium">Bụi &amp; TDV 5★</span>
          </div>
        </div>
      </div>
    </section>
  );
}
