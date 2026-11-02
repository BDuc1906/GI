"use client";

import { SearchIcon } from "@/components/ui/UiIcon";
import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { KazuhaMapleLeaves } from "@/components/effects/KazuhaMapleLeaves";
import { useTranslations } from "next-intl";

/**
 * Wiki Hero 2026 — Kazuha "Autumn Breeze & Anemo Clarity"
 * - Nền dark forest teal sâu thẳm kết hợp aurora Anemo & lá phong đỏ trầm
 * - Search bar có chức năng tìm kiếm thật (Enter điều hướng sang /characters)
 * - Hot search tags tiện lợi
 * - Live stats strip chuẩn wiki game chuyên nghiệp
 */
export function WikiHero() {
  const router = useRouter();
  const t = useTranslations("Hero");
  const tHome = useTranslations("Home");
  const tSearch = useTranslations("Search");
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/search");
    }
  };


  return (
    <section className="relative overflow-hidden bg-bg-primary pt-10 pb-12 md:pt-14 md:pb-16 border-b border-border/50">
      {/* Dynamic Background Atmosphere: Anemo Swirl & Autumn Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep Character Primary Accent radial glow */}
        <div 
          className="absolute -top-40 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] opacity-35 transition-all duration-700"
          style={{ background: "radial-gradient(circle, var(--accent-500) 0%, transparent 70%)" }}
        />
        {/* Deep Character Secondary Accent ambient glow */}
        <div 
          className="absolute top-10 right-1/6 w-[550px] h-[550px] rounded-full blur-[150px] opacity-25 transition-all duration-700"
          style={{ background: "radial-gradient(circle, var(--accent-bright) 0%, transparent 70%)" }}
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
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-7 text-text-primary">
            {t("tagline")}
          </h1>

          <div className="max-w-2xl mx-auto mb-5">
            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full pl-6 pr-28 py-4 text-base md:text-lg bg-bg-card/90 border border-border-strong rounded-2xl outline-none focus:border-accent-500 focus:ring-4 focus:ring-accent-500/15 transition-all text-text-primary placeholder:text-text-muted shadow-lg shadow-black/10 backdrop-blur-sm"
              />
              <button
                type="submit"
                aria-label={tSearch("title")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-accent-500 text-bg-primary hover:bg-accent-bright font-medium text-sm rounded-xl flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
              >
                <SearchIcon size={16} />
                <span className="hidden sm:inline">{tSearch("title")}</span>
              </button>
            </form>

          </div>

          <div className="flex flex-wrap justify-center gap-2.5">
            <Link
              href="/characters"
              className="btn-primary flex items-center justify-center px-5 py-2.5 rounded-xl shadow-sm text-sm font-semibold"
            >
              <span>{t("exploreCharacters")}</span>
            </Link>
            <Link
              href="/calendar"
              className="btn-secondary flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold hover:border-accent-500/60"
            >
              <span>{tHome("viewFullSchedule")}</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}