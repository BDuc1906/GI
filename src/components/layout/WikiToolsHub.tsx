import { ArtTile } from "@/components/ui/ArtTile";

/**
 * Wiki Tools Hub - Công cụ & Tiện ích (tile nền gradient, chữ căn giữa)
 */
export async function WikiToolsHub() {
  const tools = [
    {
      label: "Lịch tài nguyên hôm nay",
      href: "/domains",
      description: "Bí cảnh đang mở, sách thiên phú",
      tag: "Hot",
      accent: "var(--el-geo)",
    },
    {
      label: "Bảng xếp hạng",
      href: "/characters",
      description: "Đánh giá meta La Hoàn Thâm Cảnh",
      tag: "Meta",
      accent: "var(--el-electro)",
    },
    {
      label: "Máy tính nguyên liệu",
      href: "/characters",
      description: "Tính nguyên liệu nâng cấp",
      tag: "Tool",
      accent: "var(--rarity-5)",
    },
    {
      label: "Trình tối ưu thánh di vật",
      href: "/artifacts",
      description: "Tối ưu chỉ số build",
      tag: "Tool",
      accent: "var(--el-dendro)",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-8">
        <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
          Công cụ &amp; Tiện ích
        </h2>
        <p className="text-text-secondary">Các tính năng nâng cao dùng hàng ngày</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <ArtTile key={tool.label} className="h-40" {...tool} />
        ))}
      </div>
    </section>
  );
}
