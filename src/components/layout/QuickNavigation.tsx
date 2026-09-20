import { ArtTile } from "@/components/ui/ArtTile";

/**
 * Quick Navigation — lưới tile nền gradient, chữ căn giữa.
 */
export async function QuickNavigation() {
  const categories = [
    {
      label: "Nhân vật",
      href: "/characters",
      description: "Danh sách toàn bộ nhân vật",
      accent: "var(--el-anemo)",
    },
    {
      label: "Vũ khí",
      href: "/weapons",
      description: "Kiếm, trọng kiếm, pháp khí",
      accent: "var(--el-pyro)",
    },
    {
      label: "Thánh di vật",
      href: "/artifacts",
      description: "Bộ 2 mảnh, 4 mảnh, chỉ số",
      accent: "var(--el-geo)",
    },
    {
      label: "Nguyên liệu",
      href: "/materials",
      description: "Đồ đột phá, đặc sản, sách",
      accent: "var(--el-dendro)",
    },
    {
      label: "Bí cảnh",
      href: "/domains",
      description: "Lịch rơi nguyên liệu theo ngày",
      accent: "var(--el-electro)",
    },
    {
      label: "Kẻ địch",
      href: "/enemies",
      description: "Boss tuần, World Boss",
      accent: "var(--el-hydro)",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
          Lối tắt tra cứu nhanh
        </h2>
        <p className="text-text-secondary">Click phát vào danh mục cần thiết</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category) => (
          <ArtTile key={category.href} className="h-36 sm:h-40" {...category} />
        ))}
      </div>
    </section>
  );
}
