"use client";

import { Link } from "@/i18n/navigation";

/**
 * Extended Database - Database mở rộng
 *
 * BỔ SUNG (2026-09-22): trước có 3 thẻ, 2 trong số đó là link chết
 * (/tcg, /serenitea-pot — xem comment `NOT_BUILT_HREFS` bên dưới). Nhân
 * dịp sửa, đã audit toàn bộ `src/components/layout` để tìm trang nào
 * TỒN TẠI THẬT nhưng KHÔNG được link từ bất kỳ đâu (SiteNav/
 * QuickNavigation/ExtendedDatabase) — phát hiện thêm 9 trang "vô hình":
 * `/food`, `/geography`, `/achievements` (đã có từ trước, chưa từng
 * được link) + 6 trang MỚI vừa tạo (`/crafts`, `/animals`,
 * `/adventure-ranks`, `/namecards`, `/outfits`, `/windgliders` — model
 * đã có DB+API từ lâu nhưng chưa từng có trang hiển thị). Gộp hết vào
 * đây — component này đổi từ "3 thẻ trang trí" thành hub thật cho mọi
 * nội dung phụ của site.
 */

interface ExtendedCategory {
  title: string;
  description: string;
  icon: string;
  href?: string; // có href = trang đã tồn tại thật, bấm được
}

export function ExtendedDatabase() {
  const categories: ExtendedCategory[] = [
    {
      title: "Lịch farm",
      description: "Bí cảnh sách thiên phú & nguyên liệu vũ khí theo ngày",
      icon: "/local-genshin-assets/ui/resin.png",
      href: "/calendar",
    },
    {
      title: "Lịch sử phiên bản",
      description: "Mỗi bản thêm gì, trước đó có gì, sau đó thêm gì",
      icon: "/local-genshin-assets/ui/timeline.png",
      href: "/versions",
    },
    {
      title: "Lịch sinh nhật",
      description: "Sinh nhật nhân vật theo từng tháng, ai sắp tới",
      icon: "/local-genshin-assets/ui/paimon_hello.png",
      href: "/birthdays",
    },
    {
      title: "Thành tựu",
      description: "Toàn bộ thành tựu trong game",
      icon: "/local-genshin-assets/ui/achievement.png",
      href: "/achievements",
    },
    {
      title: "Thành tựu ẩn",
      description: "Tra cứu thành tựu không trong game",
      icon: "/local-genshin-assets/ui/primogem.png",
      href: "/achievements/hidden",
    },
    {
      title: "Món ăn",
      description: "Công thức nấu ăn & hiệu ứng",
      icon: "/local-genshin-assets/ui/items.png",
      href: "/food",
    },
    {
      title: "Địa lý",
      description: "Vùng đất & khu vực trong Teyvat",
      icon: "/local-genshin-assets/ui/commission.png",
      href: "/geography",
    },
    {
      title: "Công thức chế tạo",
      description: "Adventurer Handbook — chế đồ",
      icon: "/local-genshin-assets/ui/items.png",
      href: "/crafts",
    },
    {
      title: "Động vật",
      description: "Sinh vật hiền hoà trong thế giới mở",
      icon: "/local-genshin-assets/ui/paimon_faq.png",
      href: "/animals",
    },
    {
      title: "Cấp bậc Phiêu Lưu",
      description: "Danh sách Adventure Rank",
      icon: "/local-genshin-assets/ui/ascension_star.png",
      href: "/adventure-ranks",
    },
    {
      title: "Danh thiếp",
      description: "Thư viện namecard",
      icon: "/local-genshin-assets/ui/characters.png",
      href: "/namecards",
    },
    {
      title: "Trang phục",
      description: "Trang phục nhân vật",
      icon: "/local-genshin-assets/ui/calculator-character.png",
      href: "/outfits",
    },
    {
      title: "Dù lượn",
      description: "Thư viện dù lượn",
      icon: "/local-genshin-assets/ui/artifacts.png",
      href: "/windgliders",
    },
    {
      title: "Thất Thánh Triệu Hoán",
      description: "Thư viện thẻ bài và bộ bài meta",
      icon: "/local-genshin-assets/ui/tcg.png",
      // href: "/tcg" — CHƯA LÀM: không có model/seed data TCG nào cả.
    },
    {
      title: "Ấm Trần Ca",
      description: "Bản vẽ đồ nội thất & bộ trang trí",
      icon: "/local-genshin-assets/ui/furnishing.png",
      // href: "/serenitea-pot" — CHƯA LÀM: không có model/seed data nào cả.
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 pb-2 border-b border-border/40">
        <div>
          <h2 className="font-display text-2xl font-bold text-text-primary tracking-tight">
            Thư Viện Mở Rộng &amp; Thế Giới Teyvat
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Khám phá thành tựu, lịch sinh nhật, danh thiếp, trang phục và hệ sinh thái trò chơi
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {categories.map((category) =>
          category.href ? (
            <Link
              key={category.title}
              href={category.href}
              className="group relative bg-bg-card/75 border border-border/80 hover:border-accent-500 rounded-xl p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg shadow-sm flex items-start gap-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={category.icon} alt="" width={24} height={24} className="w-6 h-6 object-contain shrink-0 mt-0.5 opacity-85 group-hover:opacity-100 group-hover:scale-110 transition-all" />
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-text-primary group-hover:text-accent-bright transition-colors mb-0.5 truncate text-sm">
                  {category.title}
                </div>
                <div className="text-xs text-text-muted leading-relaxed line-clamp-2">
                  {category.description}
                </div>
              </div>
            </Link>
          ) : (
            <div
              key={category.title}
              aria-disabled="true"
              className="relative bg-bg-card/40 border border-border/40 rounded-xl p-4 opacity-50 cursor-not-allowed flex items-start gap-3"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={category.icon} alt="" width={24} height={24} className="w-6 h-6 object-contain shrink-0 mt-0.5 opacity-60" />
              <div className="min-w-0 flex-1">
                <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 bg-bg-elevated text-text-muted text-[10px] font-medium rounded border border-border/50">
                  Sắp có
                </span>
                <div className="font-semibold text-text-muted mb-0.5 truncate text-sm">
                  {category.title}
                </div>
                <div className="text-xs text-text-muted/80 leading-relaxed line-clamp-2">
                  {category.description}
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}
