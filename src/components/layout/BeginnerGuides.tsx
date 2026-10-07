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
      href: "/calendar",
      tag: "Hot"
    },
    {
      title: "Tính nguyên liệu nâng cấp",
      description: "Tính đủ Mora, sách và nguyên liệu cho nhân vật, vũ khí",
      href: "/tools/material-calculator",
      tag: "Tool"
    },
    {
      title: "Phản ứng nguyên tố",
      description: "Bảng phản ứng và công thức sát thương cho người mới",
      href: "/elements",
      tag: "Must Read"
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
          Hướng dẫn cho người mới
        </h2>
        <p className="text-text-secondary">
          Các bài viết ghim giúp người mới bắt đầu
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="group bg-bg-card border-2 border-border rounded-2xl p-6 hover:border-gold/50 hover:shadow-xl hover:shadow-gold/10 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute top-4 right-4 px-3 py-1 bg-gold/20 text-gold-bright text-xs font-semibold rounded-full">
              {guide.tag}
            </div>
            <div className="font-semibold text-text-primary mb-2">
              {guide.title}
            </div>
            <div className="text-sm text-text-muted">
              {guide.description}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
