"use client";

import { Link } from "@/i18n/navigation";

/**
 * FeaturedBanners — Banner Tiêu Điểm Chiến Thuật Chuẩn Gaming Wiki (Game8 / Prydwen style)
 * Thiết kế banner ảnh game full-bleed với gradient vignette điện ảnh,
 * chữ in đậm nổi bật chèn trực tiếp lên ảnh kèm hiệu ứng zoom hover mượt mà.
 */
export function FeaturedBanners() {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* 1. Main Hero Banner: Bảng Xếp Hạng Nhân Vật (Tier List) — 100% Game Art Chính Gốc */}
      <Link
        href="/characters"
        className="group relative block w-full h-52 sm:h-60 md:h-72 rounded-2xl md:rounded-3xl overflow-hidden border border-border/80 hover:border-accent-500/80 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-black/50 mb-5 bg-bg-card"
      >
        {/* Authentic In-Game Environment: Fontaine Relic Domain Background */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/domains/UI_DungeonPic_FDRelic01.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-700 ease-out select-none opacity-45"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />

        {/* Flank Character 1 (Right): Official Furina Splash Art */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/local-genshin-assets/characters/splash/furina.png"
          alt=""
          aria-hidden="true"
          className="absolute -right-10 -bottom-10 h-[120%] w-auto max-w-none object-contain opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700 ease-out select-none pointer-events-none"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />

        {/* Flank Character 2 (Left): Official Kazuha Splash Art */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/local-genshin-assets/characters/splash/kaedehara-kazuha.png"
          alt=""
          aria-hidden="true"
          className="hidden sm:block absolute -left-12 -bottom-8 h-[115%] w-auto max-w-none object-contain opacity-35 group-hover:opacity-55 group-hover:scale-105 transition-all duration-700 ease-out select-none pointer-events-none -scale-x-100"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).style.display = "none";
          }}
        />

        {/* Cinematic Scrim & Vignette Overlays: Ensure razor-sharp center text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/35 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-black/90 pointer-events-none" />
        <div className="absolute inset-0 bg-radial from-transparent via-black/30 to-black/75 pointer-events-none" />

        {/* Foreground Content: Centered bold typography */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-4 sm:px-8">
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-500/20 border border-accent-500/50 text-accent-bright font-mono text-[11px] sm:text-xs font-bold uppercase tracking-wider backdrop-blur-md mb-2.5 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
            <span>Bảng Xếp Hạng Meta · La Hoàn &amp; Nhà Hát</span>
          </div>

          {/* Main Title — Bold gaming typography with drop shadow */}
          <h2 className="font-display font-black text-2xl sm:text-4xl md:text-5xl text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] group-hover:text-accent-bright transition-colors mb-2">
            Bảng Xếp Hạng Nhân Vật (Tier List)
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm md:text-base text-slate-200/90 font-medium max-w-2xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] leading-relaxed">
            Phân cấp sức mạnh Main DPS, Sub-DPS &amp; Hỗ Trợ trong La Hoàn Thâm Cảnh &amp; Nhà Hát Giả Tưởng
          </p>

          {/* Action pill button */}
          <div className="mt-3.5 inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-white/10 group-hover:bg-accent-500 group-hover:text-bg-primary text-white text-xs font-semibold backdrop-blur-md border border-white/20 group-hover:border-accent-500 transition-all duration-200 shadow-md">
            <span>Xem Chi Tiết Bảng Xếp Hạng</span>
            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
        </div>

        {/* Bottom glowing accent bar */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-accent-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>
    </section>
  );
}
