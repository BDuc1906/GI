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
  color: string;
  href?: string; // có href = trang đã tồn tại thật, bấm được
}

export function ExtendedDatabase() {
  const categories: ExtendedCategory[] = [
    {
      title: "Lịch farm",
      description: "Bí cảnh sách thiên phú & nguyên liệu vũ khí theo ngày",
      href: "/calendar",
      color: "border-accent-500/40",
    },
    {
      title: "Lịch sử phiên bản",
      description: "Mỗi bản thêm gì, trước đó có gì, sau đó thêm gì",
      href: "/versions",
      color: "border-accent-500/40",
    },
    {
      title: "Lịch sinh nhật",
      description: "Sinh nhật nhân vật theo từng tháng, ai sắp tới",
      href: "/birthdays",
      color: "border-accent-500/40",
    },
    {
      title: "Thành tựu",
      description: "Toàn bộ thành tựu trong game",
      href: "/achievements",
      color: "border-accent-500/40",
    },
    {
      title: "Thành tựu ẩn",
      description: "Tra cứu thành tựu không trong game",
      href: "/achievements/hidden",
      color: "border-accent-500/40",
    },
    {
      title: "Món ăn",
      description: "Công thức nấu ăn & hiệu ứng",
      href: "/food",
      color: "border-accent-500/40",
    },
    {
      title: "Địa lý",
      description: "Vùng đất & khu vực trong Teyvat",
      href: "/geography",
      color: "border-accent-500/40",
    },
    {
      title: "Công thức chế tạo",
      description: "Adventurer Handbook — chế đồ",
      href: "/crafts",
      color: "border-accent-500/40",
    },
    {
      title: "Động vật",
      description: "Sinh vật hiền hoà trong thế giới mở",
      href: "/animals",
      color: "border-accent-500/40",
    },
    {
      title: "Cấp bậc Phiêu Lưu",
      description: "Danh sách Adventure Rank",
      href: "/adventure-ranks",
      color: "border-accent-500/40",
    },
    {
      title: "Danh thiếp",
      description: "Thư viện namecard",
      href: "/namecards",
      color: "border-accent-500/40",
    },
    {
      title: "Trang phục",
      description: "Trang phục nhân vật",
      href: "/outfits",
      color: "border-accent-500/40",
    },
    {
      title: "Dù lượn",
      description: "Thư viện dù lượn",
      href: "/windgliders",
      color: "border-accent-500/40",
    },
    {
      title: "Thất Thánh Triệu Hoán",
      description: "Thư viện thẻ bài và bộ bài meta",
      color: "border-accent-500/40",
      // href: "/tcg" — CHƯA LÀM: không có model/seed data TCG nào cả.
    },
    {
      title: "Ấm Trần Ca",
      description: "Bản vẽ đồ nội thất & bộ trang trí",
      color: "border-accent-500/40",
      // href: "/serenitea-pot" — CHƯA LÀM: không có model/seed data nào cả.
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
          Database mở rộng
        </h2>
        <p className="text-text-secondary">
          Ngoài Nhân vật & Vũ khí
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) =>
          category.href ? (
            <Link
              key={category.title}
              href={category.href}
              className={`group bg-bg-card border-2 ${category.color} rounded-2xl p-6 hover:border-gold/50 hover:shadow-xl hover:shadow-gold/10 transition-all duration-300 hover:-translate-y-1`}
            >
              <div className="font-semibold text-text-primary mb-2">
                {category.title}
              </div>
              <div className="text-sm text-text-muted">
                {category.description}
              </div>
            </Link>
          ) : (
            <div
              key={category.title}
              aria-disabled="true"
              className={`relative bg-bg-card border-2 ${category.color} rounded-2xl p-6 opacity-60 cursor-not-allowed`}
            >
              <span className="absolute top-3 right-3 px-2 py-1 bg-bg-primary/80 text-text-muted text-xs rounded-full border border-border">
                Sắp ra mắt
              </span>
              <div className="font-semibold text-text-primary mb-2">
                {category.title}
              </div>
              <div className="text-sm text-text-muted">
                {category.description}
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}
