import { Link } from "@/i18n/navigation";

/**
 * Wiki Tools Hub — Bento Grid Chiến Thuật Chuẩn Gaming Wiki
 * Không emoji, phân cấp thông tin rõ ràng theo dạng Bento Box.
 */
export async function WikiToolsHub() {
  const primaryTools = [
    {
      title: "Dựng Đội Hình & Phản Ứng Nguyên Tố",
      href: "/tools/team-builder",
      icon: "/local-genshin-assets/ui/stardust.png",
      description: "Gợi ý đội hình tối ưu theo cơ chế phản ứng: Bốc Hơi, Tan Chảy, Khuếch Tán, Tăng Cường và Quá Tải. Hỗ trợ phương án nhân vật thay thế linh hoạt.",
      tag: "Chiến Thuật",
      badgeColor: "bg-teal-500/15 text-teal-300 border-teal-500/30",
      accentBorder: "hover:border-teal-400/60",
      accentGlow: "group-hover:shadow-[0_0_25px_rgba(45,212,191,0.15)]",
    },
    {
      title: "Máy Tính Sát Thương & So Sánh DPS",
      href: "/tools/dps-calculator",
      icon: "/local-genshin-assets/ui/calculator.png",
      description: "Mô phỏng rotation kỹ năng, so sánh hiệu quả giữa các bộ thánh di vật và vũ khí khác nhau để tìm ra phương án tối đa hóa sát thương.",
      tag: "Mô Phỏng",
      badgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/30",
      accentBorder: "hover:border-rose-400/60",
      accentGlow: "group-hover:shadow-[0_0_25px_rgba(244,63,94,0.15)]",
    },
  ];

  const secondaryTools = [
    {
      title: "Đồng Bộ Showcase UID",
      href: "/tools/enka-sync",
      icon: "/local-genshin-assets/ui/paimon_hello.png",
      description: "Nhập 9 chữ số UID để lấy trang bị, thánh di vật và chỉ số nhân vật trực tiếp từ game.",
      tag: "Dữ Liệu Live",
      badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    },
    {
      title: "Phân Tích Lịch Sử Gacha",
      href: "/tools/wish-history",
      icon: "/local-genshin-assets/ui/wish.png",
      description: "Đếm số lần quay đến bảo hiểm 5★, thống kê tỉ lệ trúng nhân vật giới hạn và tỷ lệ may mắn.",
      tag: "Pity Tracker",
      badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    },
    {
      title: "Lịch Rơi Tài Nguyên Hôm Nay",
      href: "/calendar",
      icon: "/local-genshin-assets/ui/resin.png",
      description: "Theo dõi các bí cảnh mở sách thiên phú và nguyên liệu đột phá vũ khí theo từng ngày trong tuần.",
      tag: "Hàng Ngày",
      badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    },
    {
      title: "Tạo Thẻ Nhân Vật Showcase",
      href: "/tools/showcase-card",
      icon: "/local-genshin-assets/ui/namecard.png",
      description: "Xuất ảnh thẻ thông số nhân vật và trang bị độ phân giải cao để chia sẻ lên mạng xã hội.",
      tag: "Chia Sẻ",
      badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    },
    {
      title: "Máy Tính Nguyên Liệu",
      href: "/tools/material-calculator",
      icon: "/local-genshin-assets/ui/mora.png",
      description: "Lập kế hoạch farm Mora, sách kinh nghiệm và vật phẩm đột phá từ cấp hiện tại lên cấp 90.",
      tag: "Kế Hoạch",
      badgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    },
    {
      title: "Tra Cứu Thành Tựu Ẩn",
      href: "/achievements/hidden",
      icon: "/local-genshin-assets/ui/primogem.png",
      description: "Danh sách thành tựu ẩn kèm điều kiện mở khóa nhận Nguyên Thạch trong thế giới Teyvat.",
      tag: "Thành Tựu",
      badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 pb-2 border-b border-border/40">
        <div>
          <h2 className="font-display text-2xl font-bold text-text-primary tracking-tight">
            Bộ Công Cụ Chiến Thuật &amp; Tiện Ích
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Hỗ trợ tối ưu hóa đội hình, tính toán chỉ số chiến đấu và quản lý tiến trình tài khoản
          </p>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 2 Featured Large Bento Cards */}
        {primaryTools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className={`group relative flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-br from-bg-card via-bg-card/90 to-bg-elevated/40 border border-border/80 ${tool.accentBorder} transition-all duration-300 hover:-translate-y-1 shadow-sm ${tool.accentGlow} lg:col-span-1 min-h-[220px]`}
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={tool.icon} alt="" width={24} height={24} className="w-6 h-6 object-contain shrink-0" />
                  <span className={`text-[11px] font-mono tracking-wide uppercase px-2.5 py-1 rounded-full border font-semibold ${tool.badgeColor}`}>
                    {tool.tag}
                  </span>
                </div>
                <span className="text-xs text-text-muted group-hover:text-accent-bright transition-colors font-medium">
                  Mở công cụ &rarr;
                </span>
              </div>
              <h3 className="font-display text-xl font-bold text-text-primary group-hover:text-accent-bright transition-colors mb-2">
                {tool.title}
              </h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                {tool.description}
              </p>
            </div>
            <div className="pt-4 border-t border-border/40 flex items-center justify-between text-xs text-text-muted">
              <span>Đầy đủ cơ chế &amp; công thức</span>
              <span className="text-accent-bright font-medium">Chi tiết</span>
            </div>
          </Link>
        ))}

        {/* Remaining 6 Compact Bento Cards */}
        {secondaryTools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group relative flex flex-col justify-between p-5 rounded-xl bg-bg-card/75 border border-border/80 hover:border-accent-500/70 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={tool.icon} alt="" width={20} height={20} className="w-5 h-5 object-contain shrink-0" />
                  <span className={`text-[10px] font-mono tracking-wide uppercase px-2 py-0.5 rounded border font-semibold ${tool.badgeColor}`}>
                    {tool.tag}
                  </span>
                </div>
                <span className="text-xs text-text-muted group-hover:text-accent-bright transition-colors">
                  &rarr;
                </span>
              </div>
              <h3 className="font-semibold text-base text-text-primary group-hover:text-accent-bright transition-colors mb-1.5">
                {tool.title}
              </h3>
              <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                {tool.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}