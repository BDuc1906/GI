"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";

/**
 * Wiki Hero 2026 - Smart Search Centered
 * - Search bar nổi bật ở giữa
 * - Auto-complete placeholder
 * - Quick navigation categories
 */

export function WikiHero() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <section className="relative overflow-hidden bg-bg-primary">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-card" />
      
      {/* Subtle Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(201, 166, 107, 0.15) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
        <div className="text-center">
          {/* Logo/Title */}
          <h1 className="font-display text-5xl md:text-7xl font-bold text-gold-bright mb-4 tracking-tight">
            LEIBO
          </h1>
          
          <p className="text-lg md:text-xl text-text-secondary font-light mb-8 max-w-2xl mx-auto">
            Genshin Impact Wiki - Cẩm nang toàn diện
          </p>

          {/* Smart Search Bar - Trọng tâm */}
          <div className="max-w-3xl mx-auto mb-8">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm nhanh mọi thứ (Nhân vật, Vũ khí, Thánh di vật, Nguyên liệu, Nhiệm vụ)..."
                className="w-full px-6 py-4 text-lg bg-bg-card border-2 border-border rounded-full outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/20 transition-all text-text-primary placeholder:text-text-muted shadow-lg"
              />
              <div className="absolute right-6 top-1/2 -translate-y-1/2 text-text-muted text-xl">
                🔍
              </div>
            </div>
            <p className="text-sm text-text-muted mt-2">
              Tìm kiếm nhân vật, vũ khí, thánh di vật, nguyên liệu, nhiệm vụ...
            </p>
          </div>

          {/* Quick CTAs */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/characters"
              className="px-6 py-3 bg-gold text-text-inverted font-semibold rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Nhân vật
            </Link>
            <Link
              href="/weapons"
              className="px-6 py-3 border-2 border-border text-text-secondary font-semibold rounded-full hover:border-gold hover:text-gold-bright transition-all"
            >
              Vũ khí
            </Link>
            <Link
              href="/artifacts"
              className="px-6 py-3 border-2 border-border text-text-secondary font-semibold rounded-full hover:border-gold hover:text-gold-bright transition-all"
            >
              Thánh di vật
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}