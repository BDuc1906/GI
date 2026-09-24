"use client";

import { useState, useEffect } from "react";
import { ArtTile } from "@/components/ui/ArtTile";

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
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
          ⏰ Đồng hồ đếm ngược
        </h2>
        <p className="text-text-secondary">
          Reset server & La Hoàn Thâm Cảnh
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Asia Server */}
        <div className="bg-bg-card border-2 border-border rounded-2xl p-6">
          <div className="text-3xl mb-3">🌏</div>
          <div className="font-semibold text-text-primary mb-2">Asia Server</div>
          <div className="text-2xl font-bold text-gold-bright">{asiaTime}</div>
          <div className="text-xs text-text-muted mt-2">Reset: 11:00 (UTC+7)</div>
        </div>

        {/* America Server */}
        <div className="bg-bg-card border-2 border-border rounded-2xl p-6">
          <div className="text-3xl mb-3">🌎</div>
          <div className="font-semibold text-text-primary mb-2">America Server</div>
          <div className="text-2xl font-bold text-gold-bright">{americaTime}</div>
          <div className="text-xs text-text-muted mt-2">Reset: 23:00 (UTC-5)</div>
        </div>

        {/* Europe Server */}
        <div className="bg-bg-card border-2 border-border rounded-2xl p-6">
          <div className="text-3xl mb-3">🌍</div>
          <div className="font-semibold text-text-primary mb-2">Europe Server</div>
          <div className="text-2xl font-bold text-gold-bright">{europeTime}</div>
          <div className="text-xs text-text-muted mt-2">Reset: 5:00 (UTC+1)</div>
        </div>

        {/* Spiral Abyss — tile nền ảnh, chữ căn giữa */}
        <ArtTile
          label="La Hoàn Thâm Cảnh"
          accent="var(--el-electro)"
          className="h-full min-h-40"
        >
          <span className="mt-1 text-2xl font-bold tabular-nums">{spiralReset}</span>
          <span className="text-xs text-white/70">Reset: 1st &amp; 16th</span>
        </ArtTile>
      </div>
    </section>
  );
}