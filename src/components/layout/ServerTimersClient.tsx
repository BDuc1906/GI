"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export function ServerTimersClient() {
  const t = useTranslations("Home");
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
      setAsiaTime(t("timerServerCountdown", { hours: asiaHours, minutes: asiaMins, seconds: asiaSecs }));

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
      setAmericaTime(t("timerServerCountdown", { hours: americaHours, minutes: americaMins, seconds: americaSecs }));

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
      setEuropeTime(t("timerServerCountdown", { hours: europeHours, minutes: europeMins, seconds: europeSecs }));

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
      setTheaterReset(t("timerCountdown", { days: tDays, hours: tHours, minutes: tMins }));

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
      setSpiralReset(t("timerCountdown", { days: aDays, hours: aHours, minutes: aMins }));

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
        setStygianReset(t("timerOpenIn", { days: d, hours: h }));
      } else if (now.getTime() <= stygianEnd) {
        // Đang mở, đếm ngược kết thúc kỳ
        const diff = stygianEnd - now.getTime();
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setStygianReset(t("timerCountdown", { days: d, hours: h, minutes: m }));
      } else {
        // Kết thúc kỳ hiện tại, đếm ngược đến kỳ kế tiếp
        const nextStart = currentPatchStart + patchLength + 8 * 24 * 60 * 60 * 1000;
        const diff = nextStart - now.getTime();
        const d = Math.floor(diff / (1000 * 60 * 60 * 24));
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setStygianReset(t("timerNextCycle", { days: d, hours: h }));
      }
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [t]);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <h2 className="font-display text-lg md:text-xl font-bold text-text-primary tracking-wide">
            {t("timerTitle")}
          </h2>
        </div>
        <div className="text-xs text-text-muted flex items-center gap-2 font-mono">
          <span className="px-2 py-0.5 rounded bg-bg-card border border-border/60 text-accent-bright font-semibold">
            {t("timerLiveSync")}
          </span>
          <span>{t("timerUpdatesEverySecond")}</span>
        </div>
      </div>

      {/* Grid: 3 Server Reset + 3 Endgame Modes = 6 cards total */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
        {/* Asia Server */}
        <div className="relative group bg-bg-card/75 border border-border/80 hover:border-accent-500/50 rounded-xl p-3.5 transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-1.5">
            <span className="font-semibold text-text-primary">{t("timerAsiaServer")}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-muted">UTC+7</span>
          </div>
          <div className="font-mono text-lg sm:text-xl font-bold tracking-tight text-accent-bright tabular-nums">
            {asiaTime || "--:--:--"}
          </div>
          <div className="text-[11px] text-text-muted mt-1.5 flex items-center justify-between">
            <span>{t("timerResetAt", { time: "11:00" })}</span>
            <span className="text-emerald-400/80">{t("timerActive")}</span>
          </div>
        </div>

        {/* America Server */}
        <div className="relative group bg-bg-card/75 border border-border/80 hover:border-accent-500/50 rounded-xl p-3.5 transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-1.5">
            <span className="font-semibold text-text-primary">{t("timerAmericaServer")}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-muted">UTC-5</span>
          </div>
          <div className="font-mono text-lg sm:text-xl font-bold tracking-tight text-accent-bright tabular-nums">
            {americaTime || "--:--:--"}
          </div>
          <div className="text-[11px] text-text-muted mt-1.5 flex items-center justify-between">
            <span>{t("timerResetAt", { time: "23:00" })}</span>
            <span className="text-emerald-400/80">{t("timerActive")}</span>
          </div>
        </div>

        {/* Europe Server */}
        <div className="relative group bg-bg-card/75 border border-border/80 hover:border-accent-500/50 rounded-xl p-3.5 transition-all duration-200 hover:-translate-y-0.5 shadow-sm">
          <div className="flex items-center justify-between text-xs text-text-secondary font-medium mb-1.5">
            <span className="font-semibold text-text-primary">{t("timerEuropeServer")}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-elevated text-text-muted">UTC+1</span>
          </div>
          <div className="font-mono text-lg sm:text-xl font-bold tracking-tight text-accent-bright tabular-nums">
            {europeTime || "--:--:--"}
          </div>
          <div className="text-[11px] text-text-muted mt-1.5 flex items-center justify-between">
            <span>{t("timerResetAt", { time: "05:00" })}</span>
            <span className="text-emerald-400/80">{t("timerActive")}</span>
          </div>
        </div>

        {/* Nhà Hát Giả Tưởng (Imaginarium Theater) */}
        <div className="relative group bg-gradient-to-br from-bg-card to-[#25152a] border border-[#d97706]/40 hover:border-[#fbbf24] rounded-xl p-3.5 transition-all duration-200 hover:-translate-y-0.5 shadow-sm overflow-hidden">
          {/* Game artwork background */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/local-genshin-assets/ui/imaginarium-theater.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-15 group-hover:opacity-20 transition-opacity duration-300 select-none pointer-events-none"
          />
          {/* Gradient overlay để text dễ đọc */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#25152a]/80 via-[#25152a]/60 to-transparent pointer-events-none" />
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between text-xs text-amber-300 font-medium mb-1.5">
              <span className="font-semibold text-amber-200 truncate">{t("timerTheater")}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200 border border-amber-500/30 font-semibold shrink-0">
                {t("timerSeason")}
              </span>
            </div>
            <div className="font-mono text-lg sm:text-xl font-bold tracking-tight text-amber-200 tabular-nums">
              {theaterReset || "--:--"}
            </div>
            <div className="text-[11px] text-amber-300/70 mt-1.5 flex items-center justify-between">
              <span>{t("timerRefreshDay", { day: 1 })}</span>
              <span className="text-amber-300 font-medium">{t("timerPrimogems", { count: 800 })}</span>
            </div>
          </div>
        </div>

        {/* La Hoàn Thâm Cảnh (Spiral Abyss) */}
        <div className="relative group bg-gradient-to-br from-bg-card to-[#1a1528] border border-[#764fb0]/40 hover:border-[#b075dd] rounded-xl p-3.5 transition-all duration-200 hover:-translate-y-0.5 shadow-sm overflow-hidden">
          {/* Game artwork background */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/local-genshin-assets/ui/spiral-abyss.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-20 group-hover:opacity-28 transition-opacity duration-300 select-none pointer-events-none"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1528]/90 via-[#1a1528]/65 to-transparent pointer-events-none" />
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between text-xs text-purple-300 font-medium mb-1.5">
              <span className="font-semibold text-purple-200 truncate">{t("timerAbyss")}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#764fb0]/20 text-purple-200 border border-[#764fb0]/30 font-semibold shrink-0">
                {t("timerAbyssTag")}
              </span>
            </div>
            <div className="font-mono text-lg sm:text-xl font-bold tracking-tight text-purple-200 tabular-nums">
              {spiralReset || "--:--"}
            </div>
            <div className="text-[11px] text-purple-300/70 mt-1.5 flex items-center justify-between">
              <span>{t("timerRefreshDay", { day: 16 })}</span>
              <span className="text-purple-300 font-medium">{t("timerPrimogems", { count: 800 })}</span>
            </div>
          </div>
        </div>

        {/* Ảo Cảnh Hiểm Ác (Stygian Onslaught) */}
        <div className="relative group bg-gradient-to-br from-bg-card to-[#281515] border border-[#ef4444]/40 hover:border-[#f87171] rounded-xl p-3.5 transition-all duration-200 hover:-translate-y-0.5 shadow-sm overflow-hidden">
          {/* Game artwork background */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/local-genshin-assets/ui/stygian-onslaught.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-18 group-hover:opacity-25 transition-opacity duration-300 select-none pointer-events-none"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#281515]/90 via-[#281515]/65 to-transparent pointer-events-none" />
          {/* Content */}
          <div className="relative z-10">
            <div className="flex items-center justify-between text-xs text-rose-300 font-medium mb-1.5">
              <span className="font-semibold text-rose-200 truncate">{t("timerStygian")}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-200 border border-rose-500/30 font-semibold shrink-0">
                {t("timerEndgame")}
              </span>
            </div>
            <div className="font-mono text-lg sm:text-xl font-bold tracking-tight text-rose-200 tabular-nums">
              {stygianReset || "--:--"}
            </div>
            <div className="text-[11px] text-rose-300/70 mt-1.5 flex items-center justify-between">
              <span>{t("timerBossRotation")}</span>
              <span className="text-rose-300 font-medium">{t("timerRewards")}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
