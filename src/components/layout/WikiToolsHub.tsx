import { Link } from "@/i18n/navigation";

/**
 * Wiki Tools Hub — Bento Grid Chiến Thuật Chuẩn Gaming Wiki (React Bits & Emil Kowalski inspired)
 * Phân cấp thị giác rõ ràng: Flagship DPS Calculator (2 cột) + Team Builder (1 cột),
 * cùng 4 công cụ tiện ích phụ trợ bên dưới. Không trùng lặp với Compendium.
 */
export async function WikiToolsHub() {
  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-10">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-accent-500 animate-pulse" />
            <span className="text-xs font-mono uppercase text-accent-bright font-semibold tracking-wider">
              Trung Tâm Tính Toán &amp; Tối Ưu Hóa
            </span>
          </div>
          <h2 className="font-display text-2xl md:text-3xl font-extrabold text-text-primary tracking-tight">
            Bộ Công Cụ Chiến Thuật Teyvat
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Mô phỏng rotation sát thương đội hình, đồng bộ trang bị từ UID và tính toán tài nguyên chuẩn xác
          </p>
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
              src="/local-genshin-assets/characters/splash/furina.png"
              alt=""
              aria-hidden="true"
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
              <span className="text-[11px] font-mono tracking-wide uppercase px-2.5 py-1 rounded-full border font-bold bg-rose-500/15 text-rose-300 border-rose-500/40">
                Tính Toán Đội Hình
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent-500/10 text-accent-bright border border-accent-500/20">
                Mô Phỏng Rotation
              </span>
            </div>

            <h3 className="font-display text-2xl sm:text-3xl font-black text-text-primary group-hover:text-rose-400 transition-colors mb-2.5 tracking-tight">
              Máy Tính Sát Thương &amp; So Sánh DPS
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-md">
              Mô phỏng chu kỳ combo 4 nhân vật với phản ứng nguyên tố Bốc Hơi, Tan Chảy, Khuếch Tán. So sánh trực tiếp hiệu quả giữa các bộ Thánh Di Vật &amp; vũ khí khác nhau.
            </p>
          </div>

          <div className="relative z-10 pt-5 mt-4 border-t border-border/40 flex items-center justify-between text-xs">
            <span className="text-text-muted flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Tích hợp công thức game chính xác 100%
            </span>
            <span className="text-rose-400 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
              <span>Bắt đầu tính toán</span>
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
              src="/local-genshin-assets/characters/splash/kaedehara-kazuha.png"
              alt=""
              aria-hidden="true"
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
              <span className="text-[11px] font-mono tracking-wide uppercase px-2.5 py-1 rounded-full border font-bold bg-teal-500/15 text-teal-300 border-teal-500/40">
                Chiến Thuật
              </span>
            </div>

            <h3 className="font-display text-xl sm:text-2xl font-black text-text-primary group-hover:text-teal-300 transition-colors mb-2 tracking-tight">
              Dựng Đội Hình Chuẩn Meta
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Gợi ý đội hình tối ưu phản ứng nguyên tố và phương án nhân vật thay thế cho La Hoàn &amp; Nhà Hát.
            </p>
          </div>

          <div className="relative z-10 pt-5 mt-4 border-t border-border/40 flex items-center justify-between text-xs">
            <span className="text-text-muted font-medium">Tự động cộng hưởng</span>
            <span className="text-teal-300 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
              <span>Mở công cụ</span>
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
                <span className="text-[10px] font-mono tracking-wide uppercase px-2 py-0.5 rounded border font-bold bg-purple-500/15 text-purple-300 border-purple-500/30">
                  Dữ Liệu Live
                </span>
              </div>
              <span className="text-xs text-text-muted group-hover:text-purple-300 transition-colors">&rarr;</span>
            </div>
            <h4 className="font-bold text-sm text-text-primary group-hover:text-purple-300 transition-colors mb-1">
              Đồng Bộ Showcase UID
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
              Nhập 9 chữ số UID để tải trang bị, TDV và chỉ số nhân vật trực tiếp từ game.
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
                <span className="text-[10px] font-mono tracking-wide uppercase px-2 py-0.5 rounded border font-bold bg-cyan-500/15 text-cyan-300 border-cyan-500/30">
                  Pity Tracker
                </span>
              </div>
              <span className="text-xs text-text-muted group-hover:text-cyan-300 transition-colors">&rarr;</span>
            </div>
            <h4 className="font-bold text-sm text-text-primary group-hover:text-cyan-300 transition-colors mb-1">
              Phân Tích Lịch Sử Gacha
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
              Đếm số lần quay đến bảo hiểm 5★, thống kê tỷ lệ trúng nhân vật giới hạn.
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
                <span className="text-[10px] font-mono tracking-wide uppercase px-2 py-0.5 rounded border font-bold bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                  Thẻ Chia Sẻ
                </span>
              </div>
              <span className="text-xs text-text-muted group-hover:text-emerald-300 transition-colors">&rarr;</span>
            </div>
            <h4 className="font-bold text-sm text-text-primary group-hover:text-emerald-300 transition-colors mb-1">
              Thẻ Nhân Vật Showcase
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
              Xuất ảnh thẻ thông số và build nhân vật độ nét cao để chia sẻ bạn bè.
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
                <span className="text-[10px] font-mono tracking-wide uppercase px-2 py-0.5 rounded border font-bold bg-amber-500/15 text-amber-300 border-amber-500/30">
                  Lập Kế Hoạch
                </span>
              </div>
              <span className="text-xs text-text-muted group-hover:text-amber-300 transition-colors">&rarr;</span>
            </div>
            <h4 className="font-bold text-sm text-text-primary group-hover:text-amber-300 transition-colors mb-1">
              Máy Tính Nguyên Liệu
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
              Tính lượng Mora, sách kinh nghiệm &amp; vật phẩm đột phá từ cấp hiện tại lên cấp 90.
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}
