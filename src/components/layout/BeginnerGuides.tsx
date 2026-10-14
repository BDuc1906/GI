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
      title: "Lịch farm hằng tuần",
      description: "Hôm nay farm sách thiên phú và nguyên liệu vũ khí ở đâu",
      icon: "/local-genshin-assets/ui/resin.png",
      href: "/calendar",
      tag: "Hot"
    },
    {
      title: "Tính nguyên liệu nâng cấp",
      description: "Tính đủ Mora, sách và nguyên liệu cho nhân vật, vũ khí",
      icon: "/local-genshin-assets/ui/calculator.png",
      href: "/tools/material-calculator",
      tag: "Tool"
    },
    {
      title: "Phản ứng nguyên tố",
      description: "Bảng phản ứng và công thức sát thương cho người mới",
      icon: "/local-genshin-assets/elements/anemo.png",
      href: "/elements",
      tag: "Must Read"
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 pb-2 border-b border-border/40">
        <div>
          <h2 className="font-display text-2xl font-bold text-text-primary tracking-tight">
            Cẩm Nang Dành Cho Nhà Lữ Hành Mới
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
            className="group relative bg-bg-card/85 border border-border/80 hover:border-accent-500 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={guide.icon} alt="" width={22} height={22} className="w-5.5 h-5.5 object-contain" />
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-accent-500/15 text-accent-bright border border-accent-500/30">
                    {guide.tag}
                  </span>
                </div>
                <span className="text-xs text-text-muted group-hover:text-accent-bright transition-colors font-medium">
                  Chi tiết &rarr;
                </span>
              </div>
              <div className="font-semibold text-lg text-text-primary group-hover:text-accent-bright transition-colors mb-2">
                {guide.title}
              </div>
              <div className="text-sm text-text-secondary leading-relaxed">
                {guide.description}
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-accent-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ))}
      </div>
    </section>
  );
}
