"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link } from "@/i18n/navigation";

/**
 * Modern Hero 2026 - Phong cách xịn nhất
 * - Search bar nổi bật ở giữa
 * - Clean typography
 * - Gradient hero background
 * - Quick CTAs
 */

export function ModernHero() {
  const t = useTranslations("Hero");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="relative overflow-hidden">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-card" />
      
      {/* Subtle Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(201, 166, 107, 0.15) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-20 md:py-32">
        <div className="text-center">
          {/* Logo/Title */}
          <h1 className="font-display text-6xl md:text-8xl font-bold text-gold-bright mb-4 tracking-tight">
            LEIBO
          </h1>
          
          <p className="text-xl md:text-2xl text-text-secondary font-light mb-8 max-w-2xl mx-auto">
            {t("tagline")}
          </p>

          {/* Search Bar - Nổi bật */}
          <div className="max-w-2xl mx-auto mb-10">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full px-6 py-4 text-lg bg-bg-card border-2 border-border rounded-full outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/20 transition-all text-text-primary placeholder:text-text-muted"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted">
                🔍
              </div>
            </div>
          </div>

          {/* Quick CTAs */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Link
              href="/characters"
              className="px-8 py-3 bg-gold text-text-inverted font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              {t("exploreCharacters")}
            </Link>
            <Link
              href="/weapons"
              className="px-8 py-3 border-2 border-border text-text-secondary font-semibold rounded-full hover:border-gold hover:text-gold-bright transition-all"
            >
              {t("weaponArsenal")}
            </Link>
          </div>

          {/* Stats - Modern Cards */}
          <div className="flex flex-wrap justify-center gap-6">
            <div className="bg-bg-card/50 backdrop-blur border border-border rounded-2xl px-8 py-4 min-w-[140px]">
              <div className="text-3xl font-bold text-gold-bright">136+</div>
              <div className="text-sm text-text-muted mt-1">Characters</div>
            </div>
            <div className="bg-bg-card/50 backdrop-blur border border-border rounded-2xl px-8 py-4 min-w-[140px]">
              <div className="text-3xl font-bold text-gold-bright">247+</div>
              <div className="text-sm text-text-muted mt-1">Weapons</div>
            </div>
            <div className="bg-bg-card/50 backdrop-blur border border-border rounded-2xl px-8 py-4 min-w-[140px]">
              <div className="text-3xl font-bold text-gold-bright">63+</div>
              <div className="text-sm text-text-muted mt-1">Artifacts</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}