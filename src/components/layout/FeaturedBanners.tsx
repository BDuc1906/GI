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
        />

        {/* Flank Character 1 (Right): Official Furina Splash Art */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/local-genshin-assets/characters/splash/furina.png"
          alt=""
          aria-hidden="true"
          className="absolute -right-10 -bottom-10 h-[120%] w-auto max-w-none object-contain opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700 ease-out select-none pointer-events-none"
        />

        {/* Flank Character 2 (Left): Official Kazuha Splash Art */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/local-genshin-assets/characters/splash/kaedehara-kazuha.png"
          alt=""
          aria-hidden="true"
          className="hidden sm:block absolute -left-12 -bottom-8 h-[115%] w-auto max-w-none object-contain opacity-35 group-hover:opacity-55 group-hover:scale-105 transition-all duration-700 ease-out select-none pointer-events-none -scale-x-100"
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

      {/* 2. Secondary Dual Banners: Team Builder & Farming Calendar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Banner A: Xây Dựng Đội Hình (Team Builder) */}
        <Link
          href="/tools/team-builder"
          className="group relative h-40 sm:h-44 md:h-48 rounded-2xl overflow-hidden border border-border/80 hover:border-teal-400/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-teal-950/30 flex flex-col justify-end p-5 sm:p-6"
        >
          {/* Background: Kazuha / Team Art */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/local-genshin-assets/characters/splash/kaedehara-kazuha.png"
            alt="Đội Hình Tác Chiến"
            className="absolute right-0 top-0 w-3/4 sm:w-2/3 h-full object-cover object-top opacity-35 group-hover:opacity-45 group-hover:scale-105 transition-all duration-700 ease-out select-none pointer-events-none"
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-bg-card via-bg-card/90 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 max-w-md">
            <div className="flex items-center gap-2 mb-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/local-genshin-assets/ui/party.png" alt="" width={18} height={18} className="w-4.5 h-4.5 object-contain" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-teal-300 font-bold">
                Tối Ưu Phản Ứng
              </span>
            </div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-text-primary group-hover:text-teal-300 transition-colors drop-shadow-md mb-1">
              Xây Dựng Đội Hình Mạnh Nhất
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
              Gợi ý đội hình Bốc Hơi, Tan Chảy, Khuếch Tán, Quá Tải &amp; đề xuất nhân vật thay thế
            </p>
            <div className="mt-2.5 text-xs text-teal-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Mở Team Builder</span>
              <span>&rarr;</span>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-teal-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>

        {/* Banner B: Lịch Farm Tài Nguyên (Farming Calendar) */}
        <Link
          href="/calendar"
          className="group relative h-40 sm:h-44 md:h-48 rounded-2xl overflow-hidden border border-border/80 hover:border-amber-400/80 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-amber-950/30 flex flex-col justify-end p-5 sm:p-6"
        >
          {/* Background: Domain dungeon art */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/domains/UI_DungeonPic_FDRelic01.png"
            alt="Lịch Farm Bí Cảnh"
            className="absolute inset-0 w-full h-full object-cover object-center opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700 ease-out select-none pointer-events-none"
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-r from-bg-card via-bg-card/90 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-transparent to-transparent pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 max-w-md">
            <div className="flex items-center gap-2 mb-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/local-genshin-assets/ui/resin.png" alt="" width={18} height={18} className="w-4.5 h-4.5 object-contain" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300 font-bold">
                Lịch Farm Hôm Nay
              </span>
            </div>
            <h3 className="font-display font-bold text-xl sm:text-2xl text-text-primary group-hover:text-amber-300 transition-colors drop-shadow-md mb-1">
              Lịch Rơi Bí Cảnh &amp; Tài Nguyên
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
              Tra cứu bí cảnh mở sách thiên phú và nguyên liệu vũ khí theo từng ngày trong tuần
            </p>
            <div className="mt-2.5 text-xs text-amber-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              <span>Xem Lịch Farm Hôm Nay</span>
              <span>&rarr;</span>
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-amber-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
      </div>
    </section>
  );
}
