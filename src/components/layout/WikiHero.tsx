"use client";

import { SearchIcon } from "@/components/ui/UiIcon";
import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { KazuhaMapleLeaves } from "@/components/effects/KazuhaMapleLeaves";

/**
 * Wiki Hero 2026 — Kazuha "Autumn Breeze & Anemo Clarity"
 * - Nền dark forest teal sâu thẳm kết hợp aurora Anemo & lá phong đỏ trầm
 * - Search bar có chức năng tìm kiếm thật (Enter điều hướng sang /characters)
 * - Hot search tags tiện lợi
 * - Live stats strip chuẩn wiki game chuyên nghiệp
 */
export function WikiHero() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/characters?search=${encodeURIComponent(query)}`);
    } else {
      router.push("/characters");
    }
  };

  const hotTags = [
    { label: "Kazuha", href: "/characters?search=Kazuha" },
    { label: "Vũ khí 5★", href: "/weapons" },
    { label: "Dựng đội hình", href: "/tools/team-builder" },
    { label: "DPS Calculator", href: "/tools/dps-calculator" },
    { label: "Lịch Farm", href: "/calendar" },
  ];

  return (
    <section className="relative overflow-hidden bg-bg-primary pt-12 pb-16 md:pt-20 md:pb-24 border-b border-border/50">
      {/* Dynamic Background Atmosphere: Anemo Swirl & Autumn Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep Anemo Teal radial glow */}
        <div 
          className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] opacity-30"
          style={{ background: "radial-gradient(circle, #2dd4bf 0%, transparent 70%)" }}
        />
        {/* Deep Maple Crimson warm ambient glow */}
        <div 
          className="absolute top-10 right-1/6 w-[550px] h-[550px] rounded-full blur-[150px] opacity-25"
          style={{ background: "radial-gradient(circle, #b91c1c 0%, transparent 70%)" }}
        />
        {/* Center subtle obsidian depth gradient */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/50 to-bg-primary"
        />
      </div>

      {/* Hiệu ứng lá phong rơi đặc trưng của Kaedehara Kazuha */}
      <KazuhaMapleLeaves />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
        <div className="text-center">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-bg-card/80 border border-border/80 backdrop-blur-md mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
            <span className="text-xs font-semibold tracking-wider uppercase text-text-secondary">
              Genshin Impact Companion &amp; Tactical Wiki
            </span>
          </div>

          {/* Logo / Main Title */}
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#e6faf7] via-[#5eead4] to-[#f59e0b]">
              LEIBO
            </span>
          </h1>
          
          <p className="text-base sm:text-lg md:text-xl text-text-secondary font-light max-w-2xl mx-auto mb-8 leading-relaxed">
            Cẩm nang chiến thuật toàn diện · Tối ưu build &amp; đội hình phản ứng · Lịch farm tài nguyên
          </p>

          {/* Search Bar - Professional & Interactive */}
          <div className="max-w-2xl mx-auto mb-6">
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm nhân vật, vũ khí, thánh di vật, đội hình..."
                className="w-full pl-6 pr-28 py-4 text-base md:text-lg bg-bg-card/90 border border-border-strong rounded-2xl outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-500/15 transition-all text-text-primary placeholder:text-text-muted shadow-lg shadow-black/10 backdrop-blur-sm"
              />
              <button
                type="submit"
                aria-label="Tìm kiếm"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-accent-500 text-bg-primary hover:bg-accent-bright font-medium text-sm rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <SearchIcon size={16} />
                <span className="hidden sm:inline">Tìm</span>
              </button>
            </form>

            {/* Hot search tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3.5">
              <span className="text-xs text-text-muted mr-1 font-medium">Gợi ý:</span>
              {hotTags.map((tag) => (
                <Link
                  key={tag.label}
                  href={tag.href}
                  className="px-2.5 py-1 text-xs rounded-lg bg-bg-card/60 border border-border/70 text-text-secondary hover:text-accent-bright hover:border-accent-500/50 transition-all"
                >
                  {tag.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Quick CTAs */}
          <div className="flex flex-wrap justify-center gap-3 pt-2 mb-10">
            <Link
              href="/characters"
              className="btn-primary flex items-center justify-center px-6 py-3 rounded-xl shadow-md text-sm font-semibold tracking-wide"
            >
              <span>Nhân vật</span>
            </Link>
            <Link
              href="/tools/team-builder"
              className="btn-anemo flex items-center justify-center px-6 py-3 rounded-xl shadow-md text-sm font-semibold tracking-wide"
            >
              <span>Dựng đội hình</span>
            </Link>
            <Link
              href="/weapons"
              className="btn-secondary flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold tracking-wide hover:border-accent-500/60"
            >
              <span>Kho vũ khí</span>
            </Link>
            <Link
              href="/artifacts"
              className="btn-secondary flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold tracking-wide hover:border-accent-500/60"
            >
              <span>Thánh di vật</span>
            </Link>
          </div>

          {/* Live Wiki Metrics Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-6 border-t border-border/60">
            <div className="p-3 rounded-xl bg-bg-card/40 border border-border/50">
              <div className="text-xl md:text-2xl font-bold font-mono text-accent-bright">100+</div>
              <div className="text-xs text-text-muted mt-0.5">Nhân vật đầy đủ</div>
            </div>
            <div className="p-3 rounded-xl bg-bg-card/40 border border-border/50">
              <div className="text-xl md:text-2xl font-bold font-mono text-accent-bright">180+</div>
              <div className="text-xs text-text-muted mt-0.5">Vũ khí &amp; Chỉ số</div>
            </div>
            <div className="p-3 rounded-xl bg-bg-card/40 border border-border/50">
              <div className="text-xl md:text-2xl font-bold font-mono text-accent-bright">60+</div>
              <div className="text-xs text-text-muted mt-0.5">Bộ Thánh di vật</div>
            </div>
            <div className="p-3 rounded-xl bg-bg-card/40 border border-border/50">
              <div className="text-xl md:text-2xl font-bold font-mono text-accent-bright">100%</div>
              <div className="text-xs text-text-muted mt-0.5">Live Database</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}