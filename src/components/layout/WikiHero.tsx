"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { KazuhaMapleLeaves } from "@/components/effects/KazuhaMapleLeaves";

const QUICK_LOOKUP_ITEMS = [
  { label: "Nhân vật", icon: "👤", href: "/characters", count: "136+" },
  { label: "Vũ khí", icon: "⚔️", href: "/weapons", count: "250+" },
  { label: "Thánh di vật", icon: "🌸", href: "/artifacts", count: "60+ bộ" },
  { label: "Bí cảnh", icon: "🏰", href: "/domains", count: "Teyvat" },
];

export function WikiHero() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/characters?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/characters");
    }
  };

  return (
    <section className="relative overflow-hidden border-b border-border/50 bg-bg-primary">
      {/* Background ambient glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 h-[500px] w-[800px] rounded-full opacity-20 blur-[140px]"
          style={{ background: "radial-gradient(circle, var(--accent-500) 0%, transparent 70%)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/50 to-bg-primary" />
      </div>

      <KazuhaMapleLeaves />

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-16 sm:py-20 text-center">
        {/* Eyebrow tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent-500/30 bg-accent-500/10 text-xs font-semibold text-accent-bright mb-4">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Hệ thống Build &amp; Dữ liệu chuẩn KeqingMains (KQM)</span>
        </div>

        {/* Main Title */}
        <h1 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-5xl md:text-6xl leading-[1.15]">
          Cơ Sở Dữ Liệu &amp; Build <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-accent-bright via-text-primary to-accent-500 bg-clip-text text-transparent">
            Genshin Impact
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-sm sm:text-base text-text-secondary max-w-2xl mx-auto leading-relaxed">
          Tra cứu dữ liệu chính xác, hướng dẫn build đa lối chơi đã kiểm định KQMS 20-Roll và bộ công cụ tính toán tối ưu cho Nhà Lữ Hành.
        </p>

        {/* ── GLOBAL SEARCH BAR (1 CTA CHÍNH DUY NHẤT) ── */}
        <form onSubmit={handleSearchSubmit} className="mt-8 max-w-2xl mx-auto">
          <div className="relative flex items-center rounded-2xl border border-border/80 bg-bg-card/90 p-1.5 shadow-xl backdrop-blur-md focus-within:border-accent-500 transition-all">
            <span className="pl-3.5 pr-2 text-text-muted text-base select-none">
              🔍
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm nhân vật, vũ khí, thánh di vật, nguyên liệu (Kazuha, Raiden, Homa...)..."
              className="flex-1 bg-transparent px-2 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-accent-500 px-5 py-2.5 text-xs font-bold text-bg-primary hover:bg-accent-400 transition-colors shadow-sm shrink-0 cursor-pointer"
            >
              Tra cứu
            </button>
          </div>
        </form>

        {/* ── HÀNG NÚT TRA CỨU NHANH ── */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          <span className="text-xs text-text-muted mr-1 hidden sm:inline">
            Tra cứu nhanh:
          </span>
          {QUICK_LOOKUP_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-border/70 bg-bg-elevated/70 hover:bg-bg-elevated hover:border-accent-500/60 text-xs font-semibold text-text-primary transition-all duration-150 group shadow-sm"
            >
              <span className="text-sm">{item.icon}</span>
              <span className="group-hover:text-accent-bright transition-colors">
                {item.label}
              </span>
              <span className="text-[10px] text-text-muted font-normal px-1.5 py-0.2 rounded bg-bg-secondary">
                {item.count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
