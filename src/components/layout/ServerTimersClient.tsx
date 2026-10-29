"use client";

import { useState, useEffect } from "react";

export function ServerTimersClient() {
  const [asiaTime, setAsiaTime] = useState("");
  const [americaTime, setAmericaTime] = useState("");
  const [europeTime, setEuropeTime] = useState("");
  const [spiralReset, setSpiralReset] = useState("");

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

      // Spiral Abyss reset: 1st and 16th of each month 4:00 UTC
      const spiralReset = new Date(now);
      spiralReset.setUTCHours(4, 0, 0, 0);
      const day = spiralReset.getUTCDate();
      if (day > 16) {
        spiralReset.setUTCMonth(spiralReset.getUTCMonth() + 1);
        spiralReset.setUTCDate(1);
      } else if (day > 1) {
        spiralReset.setUTCDate(16);
      }
      const spiralDiff = spiralReset.getTime() - now.getTime();
      const spiralDays = Math.floor(spiralDiff / (1000 * 60 * 60 * 24));
      const spiralHours = Math.floor((spiralDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const spiralMins = Math.floor((spiralDiff % (1000 * 60 * 60)) / (1000 * 60));
      setSpiralReset(`${spiralDays}d ${spiralHours}h ${spiralMins}m`);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <h2 className="font-display text-lg md:text-xl font-bold text-text-primary tracking-wide">
            Đồng Hồ Reset Máy Chủ &amp; La Hoàn
          </h2>
        </div>
        <div className="text-xs text-text-muted flex items-center gap-2 font-mono">
          <span className="px-2 py-0.5 rounded bg-bg-card border border-border/60 text-accent-bright">LIVE SYNC</span>
          <span>Tự động cập nhật mỗi giây</span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Asia Server */}
        <div className="relative group bg-bg-card/75 border border-border/80 hover:border-accent-500/50 rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-1.5">
            <span className="font-semibold text-text-primary">Asia Server</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-muted">UTC+7</span>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-accent-bright tabular-nums">
            {asiaTime || "--:--:--"}
          </div>
          <div className="text-[11px] text-text-muted mt-1.5 flex items-center justify-between">
            <span>Reset lúc 11:00</span>
            <span className="text-emerald-400/80">Hoạt động</span>
          </div>
        </div>

        {/* America Server */}
        <div className="relative group bg-bg-card/75 border border-border/80 hover:border-accent-500/50 rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-1.5">
            <span className="font-semibold text-text-primary">America Server</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-muted">UTC-5</span>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-accent-bright tabular-nums">
            {americaTime || "--:--:--"}
          </div>
          <div className="text-[11px] text-text-muted mt-1.5 flex items-center justify-between">
            <span>Reset lúc 23:00</span>
            <span className="text-emerald-400/80">Hoạt động</span>
          </div>
        </div>

        {/* Europe Server */}
        <div className="relative group bg-bg-card/75 border border-border/80 hover:border-accent-500/50 rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-1.5">
            <span className="font-semibold text-text-primary">Europe Server</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-muted">UTC+1</span>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-accent-bright tabular-nums">
            {europeTime || "--:--:--"}
          </div>
          <div className="text-[11px] text-text-muted mt-1.5 flex items-center justify-between">
            <span>Reset lúc 05:00</span>
            <span className="text-emerald-400/80">Hoạt động</span>
          </div>
        </div>

        {/* Spiral Abyss */}
        <div className="relative group bg-gradient-to-br from-bg-card to-[#1a1528] border border-[#764fb0]/40 hover:border-[#b075dd] rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-purple-300 font-medium mb-1.5">
            <span className="font-semibold text-purple-200">La Hoàn Thâm Cảnh</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#764fb0]/20 text-purple-200 border border-[#764fb0]/30 font-semibold">Tầng 9-12</span>
          </div>
          <div className="font-mono text-xl sm:text-2xl font-bold tracking-tight text-purple-200 tabular-nums">
            {spiralReset || "--d --h"}
          </div>
          <div className="text-[11px] text-purple-300/70 mt-1.5 flex items-center justify-between">
            <span>Làm mới ngày 1 &amp; 16</span>
            <span className="text-purple-300">600 Nguyên Thạch</span>
          </div>
        </div>
      </div>
    </section>
  );
}
