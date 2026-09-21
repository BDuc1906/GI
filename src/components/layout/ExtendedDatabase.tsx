"use client";

import { Link } from "@/i18n/navigation";

/**
 * Extended Database - Database mở rộng
 * - Thất Thánh Triệu Hoán (TCG)
 * - Hệ thống Ấm Trần Ca
 * - Thành tựu ẩn
 */

export function ExtendedDatabase() {
  const categories = [
    {
      title: "Thất Thánh Triệu Hoán",
      description: "Thư viện thẻ bài và bộ bài meta",
      icon: "🃏",
      href: "/tcg",
      color: "border-purple-500/50"
    },
    {
      title: "Ấm Trần Ca",
      description: "Bản vẽ đồ nội thất & bộ trang trí",
      icon: "🏠",
      href: "/serenitea-pot",
      color: "border-yellow-500/50"
    },
    {
      title: "Thành tựu ẩn",
      description: "Tra cứu thành tựu không trong game",
      icon: "🏆",
      href: "/achievements/hidden",
      color: "border-green-500/50"
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
          🗄️ Database mở rộng
        </h2>
        <p className="text-text-secondary">
          Ngoài Nhân vật & Vũ khí
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <Link
            key={category.href}
            href={category.href}
            className={`group bg-bg-card border-2 ${category.color} rounded-2xl p-6 hover:border-gold/50 hover:shadow-xl hover:shadow-gold/10 transition-all duration-300 hover:-translate-y-1`}
          >
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
              {category.icon}
            </div>
            <div className="font-semibold text-text-primary mb-2">
              {category.title}
            </div>
            <div className="text-sm text-text-muted">
              {category.description}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}