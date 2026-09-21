"use client";

import { Link } from "@/i18n/navigation";

/**
 * Beginner Guides - Khu vực hướng dẫn cho người mới
 * - Build đội hình F2P
 * - Lộ trình farm rương tối ưu
 * - Hướng dẫn phản ứng nguyên tố
 */

export function BeginnerGuides() {
  const guides = [
    {
      title: "Build đội hình F2P",
      description: "Hướng dẫn build đội hình miễn phí hiệu quả",
      icon: "⚔️",
      href: "/guides/f2p-team",
      tag: "Hot"
    },
    {
      title: "Lộ trình farm rương tối ưu",
      description: "Tối ưu hóa việc farm rương chests",
      icon: "📦",
      href: "/guides/chest-farm",
      tag: "Guide"
    },
    {
      title: "Phản ứng nguyên tố",
      description: "Hướng dẫn reactions cho người mới",
      icon: "🔮",
      href: "/guides/elemental-reactions",
      tag: "Must Read"
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
          📚 Hướng dẫn cho người mới
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
            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
              {guide.icon}
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