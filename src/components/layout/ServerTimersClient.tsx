"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export function ServerTimersClient() {
  const t = useTranslations("Home");
  const [serverTime, setServerTime] = useState("");

  useEffect(() => {
    const updateTimers = () => {
      const now = new Date();

      // All three regional servers reset at 04:00 UTC.
      const serverReset = new Date(now);
      serverReset.setUTCHours(4, 0, 0, 0);
      if (now >= serverReset) {
        serverReset.setUTCDate(serverReset.getUTCDate() + 1);
      }
      const serverDiff = serverReset.getTime() - now.getTime();
      const serverHours = Math.floor(serverDiff / (1000 * 60 * 60));
      const serverMins = Math.floor((serverDiff % (1000 * 60 * 60)) / (1000 * 60));
      const serverSecs = Math.floor((serverDiff % (1000 * 60)) / 1000);
      setServerTime(t("timerServerCountdown", { hours: serverHours, minutes: serverMins, seconds: serverSecs }));
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [t]);

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-5 md:py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-border/40">
        <div>
          <h2 className="font-display text-lg md:text-xl font-bold text-text-primary tracking-wide">
            {t("timerTitle")}
          </h2>
        </div>
        <div className="text-xs text-text-muted flex items-center gap-2 font-mono">
          <span className="text-accent-bright font-semibold">{t("timerLiveSync")}</span>
          <span>{t("timerUpdatesEverySecond")}</span>
        </div>
      </div>

      <div className="mb-3 flex flex-col gap-2 rounded-xl border border-border/70 bg-bg-card/60 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-text-secondary">{t("timerTitle")}</span>
          <span className="font-mono text-sm font-bold tabular-nums text-accent-bright">
            {serverTime || "--:--:--"}
          </span>
          <span className="text-[10px] text-text-muted">UTC</span>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:gap-4">
          {[
            { label: t("timerAsiaServer"), time: "11:00" },
            { label: t("timerEuropeServer"), time: "05:00" },
            { label: t("timerAmericaServer"), time: "23:00" },
          ].map((server) => (
            <div key={server.label} className="flex items-center gap-1.5 text-[10px] sm:text-xs">
              <span className="text-text-muted">{server.label}</span>
              <span className="font-medium text-text-secondary">{server.time}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 md:gap-4">
        {/* Nhà Hát Giả Tưởng (Imaginarium Theater) */}
        <div className="relative group min-h-[180px] sm:min-h-[200px] bg-bg-card border border-[#d97706]/40 hover:border-[#fbbf24] rounded-xl p-4 md:p-5 transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/local-genshin-assets/ui/imaginarium-theater.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/65 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#fbbf24]/70 transition-opacity group-hover:opacity-100" />
          <div className="absolute inset-x-4 bottom-4 z-10">
            <h3 className="font-display text-base font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] sm:text-lg">
              {t("timerTheater")}
            </h3>
          </div>
        </div>

        {/* La Hoàn Thâm Cảnh (Spiral Abyss) */}
        <div className="relative group min-h-[180px] sm:min-h-[200px] bg-bg-card border border-[#764fb0]/40 hover:border-[#b075dd] rounded-xl p-4 md:p-5 transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/local-genshin-assets/ui/spiral-abyss.jpg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/65 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#b075dd]/70 transition-opacity group-hover:opacity-100" />
          <div className="absolute inset-x-4 bottom-4 z-10">
            <h3 className="font-display text-base font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] sm:text-lg">
              {t("timerAbyss")}
            </h3>
          </div>
        </div>

        {/* Ảo Cảnh Hiểm Ác (Stygian Onslaught) */}
        <div className="relative group min-h-[180px] sm:min-h-[200px] bg-bg-card border border-[#ef4444]/40 hover:border-[#f87171] rounded-xl p-4 md:p-5 transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-lg overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/local-genshin-assets/ui/stygian-onslaught.png"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105 select-none pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-black/10 to-black/65 pointer-events-none" />
          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-[#f87171]/70 transition-opacity group-hover:opacity-100" />
          <div className="absolute inset-x-4 bottom-4 z-10">
            <h3 className="font-display text-base font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)] sm:text-lg">
              {t("timerStygian")}
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
}
