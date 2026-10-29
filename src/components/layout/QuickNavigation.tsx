import { ArtTile } from "@/components/ui/ArtTile";

/**
 * Quick Navigation — lưới tile nền gradient, chữ căn giữa.
 */
export async function QuickNavigation() {
  const categories = [
    {
      label: "Nhân vật",
      href: "/characters",
      icon: "/local-genshin-assets/ui/characters.png",
      description: "Hệ thống nhân vật & Thiên phú",
      accent: "var(--el-anemo)",
      tag: "Meta",
    },
    {
      label: "Kho Vũ khí",
      href: "/weapons",
      icon: "/local-genshin-assets/ui/sword.png",
      description: "Chỉ số, hiệu ứng & đột phá",
      accent: "var(--el-pyro)",
      tag: "180+",
    },
    {
      label: "Thánh di vật",
      href: "/artifacts",
      icon: "/local-genshin-assets/ui/artifacts.png",
      description: "Bộ 2 mảnh, 4 mảnh & đề xuất",
      accent: "var(--el-geo)",
      tag: "Trang bị",
    },
    {
      label: "Nguyên liệu",
      href: "/materials",
      icon: "/local-genshin-assets/ui/items.png",
      description: "Đồ đột phá & Đặc sản vùng miền",
      accent: "var(--el-dendro)",
      tag: "Vật phẩm",
    },
    {
      label: "Bí cảnh",
      href: "/domains",
      icon: "/local-genshin-assets/ui/domain.png",
      description: "Lịch rơi nguyên liệu theo thứ",
      accent: "var(--el-electro)",
      tag: "Lịch farm",
    },
    {
      label: "Kẻ địch & Boss",
      href: "/enemies",
      icon: "/local-genshin-assets/ui/enemy.png",
      description: "Thủ lĩnh thế giới & Boss tuần",
      accent: "var(--el-hydro)",
      tag: "Chiến đấu",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-6 pb-2 border-b border-border/40">
        <div>
          <h2 className="font-display text-2xl font-bold text-text-primary tracking-tight">
            Cơ Sở Dữ Liệu Teyvat
          </h2>
          <p className="text-sm text-text-secondary mt-1">
            Tra cứu đầy đủ chỉ số, hiệu ứng và nguyên liệu nâng cấp theo thời gian thực
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {categories.map((category) => (
          <ArtTile key={category.href} className="h-36 sm:h-44" {...category} />
        ))}
      </div>
    </section>
  );
}
