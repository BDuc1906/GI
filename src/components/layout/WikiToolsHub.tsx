import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

/**
 * Wiki Tools Hub — Bento Grid Chiến Thuật Chuẩn Gaming Wiki (React Bits & Emil Kowalski inspired)
 * Phân cấp thị giác rõ ràng: Flagship DPS Calculator (2 cột) + Team Builder (1 cột),
 * cùng 4 công cụ tiện ích phụ trợ bên dưới. Không trùng lặp với Compendium.
 */
export async function WikiToolsHub() {
  const t = await getTranslations("Tools");
  const tHome = await getTranslations("Home");

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-5 pb-2 border-b border-border/40">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
            {t("title")}
          </h2>
        </div>
      </div>

      {/* Bento Grid Layout: 2 Featured Cards at Top */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        {/* 1. Flagship: DPS Calculator (Spans 2 columns on Desktop) */}
        <Link
          href="/tools/dps-calculator"
          className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl md:rounded-3xl bg-gradient-to-br from-bg-card via-bg-card/95 to-bg-elevated/40 border border-border/80 hover:border-rose-400/80 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-[0_0_30px_rgba(244,63,94,0.18)] lg:col-span-2 min-h-[240px] overflow-hidden active:scale-[0.99]"
        >
          {/* Background character splash art */}
          <div className="absolute right-0 top-0 w-3/5 h-full overflow-hidden select-none pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/local-genshin-assets/characters/splash/furina.webp"
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute -right-4 -top-8 w-full h-[125%] object-contain object-top opacity-20 group-hover:opacity-35 group-hover:scale-105 transition-all duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bg-card via-bg-card/90 to-transparent" />
          </div>

          <div className="relative z-10 max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/local-genshin-assets/ui/calculator.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6 object-contain shrink-0"
              />
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-black text-text-primary group-hover:text-rose-400 transition-colors mb-2.5 tracking-tight">
              {tHome("toolDamageTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-md">
              {tHome("toolDamageDescription")}
            </p>
          </div>

          <div className="relative z-10 pt-5 mt-4 border-t border-border/40 flex items-center justify-between text-xs">
            <span className="text-text-muted font-medium">
              {tHome("toolEstimate")}
            </span>
            <span className="text-rose-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
              <span>{tHome("viewAll")}</span>
              <span>&rarr;</span>
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-rose-500 via-rose-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>

        {/* 2. Secondary Flagship: Team Builder (1 column) */}
        <Link
          href="/tools/team-builder"
          className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl md:rounded-3xl bg-gradient-to-br from-bg-card via-bg-card/95 to-bg-elevated/40 border border-border/80 hover:border-teal-400/80 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-[0_0_30px_rgba(45,212,191,0.18)] lg:col-span-1 min-h-[240px] overflow-hidden active:scale-[0.99]"
        >
          {/* Background character splash art */}
          <div className="absolute right-0 top-0 w-3/4 h-full overflow-hidden select-none pointer-events-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/local-genshin-assets/characters/splash/kaedehara-kazuha.webp"
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
              className="absolute -right-6 -top-4 w-full h-[120%] object-contain object-top opacity-20 group-hover:opacity-35 group-hover:scale-105 transition-all duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bg-card via-bg-card/90 to-transparent" />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/local-genshin-assets/ui/party.png"
                alt=""
                width={24}
                height={24}
                className="w-6 h-6 object-contain shrink-0"
              />
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-black text-text-primary group-hover:text-teal-300 transition-colors mb-2 tracking-tight">
              {tHome("toolTeamTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              {tHome("toolTeamDescription")}
            </p>
          </div>

          <div className="relative z-10 pt-5 mt-4 border-t border-border/40 flex items-center justify-between text-xs">
            <span className="text-teal-300 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
              <span>{tHome("viewAll")}</span>
              <span>&rarr;</span>
            </span>
          </div>

          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-teal-500 via-teal-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>
      </div>

      {/* 4 Utility Cards (4-column Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Tool A: Đồng bộ Showcase UID */}
        <Link
          href="/tools/enka-sync"
          className="group relative flex flex-col justify-between p-4.5 rounded-xl bg-bg-card/85 border border-border/80 hover:border-purple-400/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md shadow-sm active:scale-[0.99]"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/local-genshin-assets/ui/paimon_hello.png" alt="" width={22} height={22} className="w-5.5 h-5.5 object-contain shrink-0" />
              </div>
              <span className="text-xs text-text-muted group-hover:text-purple-300 transition-colors">&rarr;</span>
            </div>
            <h4 className="font-bold text-sm text-text-primary group-hover:text-purple-300 transition-colors mb-1">
              {tHome("toolEnkaTitle")}
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
              {tHome("toolEnkaDescription")}
            </p>
          </div>
        </Link>

        {/* Tool B: Lịch Sử Gacha */}
        <Link
          href="/tools/wish-history"
          className="group relative flex flex-col justify-between p-4.5 rounded-xl bg-bg-card/85 border border-border/80 hover:border-cyan-400/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md shadow-sm active:scale-[0.99]"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/local-genshin-assets/ui/wish.png" alt="" width={22} height={22} className="w-5.5 h-5.5 object-contain shrink-0" />
              </div>
              <span className="text-xs text-text-muted group-hover:text-cyan-300 transition-colors">&rarr;</span>
            </div>
            <h4 className="font-bold text-sm text-text-primary group-hover:text-cyan-300 transition-colors mb-1">
              {tHome("toolWishTitle")}
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
              {tHome("toolWishDescription")}
            </p>
          </div>
        </Link>

        {/* Tool C: Tạo Thẻ Nhân Vật Showcase */}
        <Link
          href="/tools/showcase-card"
          className="group relative flex flex-col justify-between p-4.5 rounded-xl bg-bg-card/85 border border-border/80 hover:border-emerald-400/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md shadow-sm active:scale-[0.99]"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/local-genshin-assets/ui/namecard.png" alt="" width={22} height={22} className="w-5.5 h-5.5 object-contain shrink-0" />
              </div>
              <span className="text-xs text-text-muted group-hover:text-emerald-300 transition-colors">&rarr;</span>
            </div>
            <h4 className="font-bold text-sm text-text-primary group-hover:text-emerald-300 transition-colors mb-1">
              {tHome("toolShowcaseTitle")}
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
              {tHome("toolShowcaseDescription")}
            </p>
          </div>
        </Link>

        {/* Tool D: Máy Tính Nguyên Liệu */}
        <Link
          href="/tools/material-calculator"
          className="group relative flex flex-col justify-between p-4.5 rounded-xl bg-bg-card/85 border border-border/80 hover:border-amber-400/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md shadow-sm active:scale-[0.99]"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/local-genshin-assets/ui/items.png" alt="" width={22} height={22} className="w-5.5 h-5.5 object-contain shrink-0" />
              </div>
              <span className="text-xs text-text-muted group-hover:text-amber-300 transition-colors">&rarr;</span>
            </div>
            <h4 className="font-bold text-sm text-text-primary group-hover:text-amber-300 transition-colors mb-1">
              {tHome("toolMaterialsTitle")}
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
              {tHome("toolMaterialsDescription")}
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}
