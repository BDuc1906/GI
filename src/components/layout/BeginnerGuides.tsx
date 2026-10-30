"use client";

import { Link } from "@/i18n/navigation";

/**
 * Beginner Guides - Khu vực hướng dẫn cho người mới
 * - Lịch farm theo ngày
 * - Máy tính nguyên liệu
 * - Bảng phản ứng nguyên tố
 *
 * Chỉ link tới trang ĐÃ TỒN TẠI (trước đây 3 link /guides/* đều 404).
 */

export function BeginnerGuides() {
  const guides = [
    {
      title: "Lịch Farm Hằng Tuần",
      description: "Tra cứu bí cảnh sách thiên phú và nguyên liệu đột phá vũ khí theo từng ngày",
      icon: "/local-genshin-assets/ui/resin.png",
      href: "/calendar",
      tag: "Thời Gian Thực",
      bgImage: "/images/domains/UI_DungeonPic_CycleDungeonChasm.png",
      badgeColor: "bg-teal-500/20 text-teal-300 border-teal-500/40",
      accentBorder: "hover:border-teal-400/80",
    },
    {
      title: "Tính Nguyên Liệu Nâng Cấp",
      description: "Lập kế hoạch chính xác lượng Mora, sách EXP và vật phẩm đột phá lên cấp 90",
      icon: "/local-genshin-assets/ui/calculator.png",
      href: "/tools/material-calculator",
      tag: "Công Cụ Tối Ưu",
      bgImage: "/images/domains/UI_DungeonPic_XMCharacter01.png",
      badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/40",
      accentBorder: "hover:border-amber-400/80",
    },
    {
      title: "Cơ Chế Phản Ứng Nguyên Tố",
      description: "Bảng tra cứu công thức tính sát thương, phản ứng khuếch đại & biến đổi 7 nguyên tố",
      icon: "/local-genshin-assets/ui/genesis_crystal.png",
      href: "/elements",
      tag: "Chiến Thuật",
      bgImage: "/local-genshin-assets/characters/splash/raiden-shogun.png",
      badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/40",
      accentBorder: "hover:border-purple-400/80",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 pb-2 border-b border-border/40">
        <div>
          <h2 className="font-display text-2xl font-bold text-text-primary tracking-tight">
            Cẩm Nang Dành Cho Nhà Lữ Hành
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Những kiến thức cốt lõi về cơ chế phản ứng, lịch tài nguyên và tối ưu nguyên liệu
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {guides.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className={`group relative h-48 sm:h-52 rounded-2xl overflow-hidden border border-border/80 ${guide.accentBorder} transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/40 flex flex-col justify-between p-5`}
          >
            {/* Background Image with hover zoom */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={guide.bgImage}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover object-center opacity-30 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700 ease-out select-none pointer-events-none"
            />

            {/* Gradient Scrim Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-bg-card via-bg-card/85 to-bg-card/40 pointer-events-none" />

            {/* Content Top */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={guide.icon} alt="" width={22} height={22} className="w-5.5 h-5.5 object-contain shrink-0" />
                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${guide.badgeColor}`}>
                  {guide.tag}
                </span>
              </div>
              <span className="text-xs text-text-muted group-hover:text-accent-bright transition-colors font-semibold">
                Xem ngay &rarr;
              </span>
            </div>

            {/* Content Bottom: Title & Description */}
            <div className="relative z-10">
              <h3 className="font-display font-bold text-lg sm:text-xl text-text-primary group-hover:text-accent-bright transition-colors drop-shadow-md mb-1.5">
                {guide.title}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed line-clamp-2">
                {guide.description}
              </p>
            </div>

            {/* Bottom Accent line */}
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-accent-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </section>
  );
}
