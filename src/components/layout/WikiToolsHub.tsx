import { ArtTile } from "@/components/ui/ArtTile";

/**
 * Wiki Tools Hub - Công cụ & Tiện ích (tile nền gradient, chữ căn giữa)
 *
 * BỔ SUNG (2026-09-22) — BUG ĐÃ SỬA: 2 tile "Máy tính nguyên liệu" và
 * "Trình tối ưu thánh di vật" trước đây trỏ tới `/characters`/`/artifacts`
 * (trang danh sách thường) dù TÊN TILE hứa hẹn 1 công cụ tính toán tương
 * tác. Đã verify: backend logic THẬT SỰ tồn tại (`material-calculator.ts`
 * 15KB, `/api/tools/material-calculator`) nhưng KHÔNG CÓ UI nào gọi tới —
 * người dùng bấm vào tile, kỳ vọng 1 form nhập liệu + kết quả tính toán,
 * nhưng chỉ thấy lại đúng trang danh sách nhân vật/artifact bình thường.
 * Đây không phải lỗi 404 (không báo lỗi gì) nhưng là hứa hẹn sai — có hại
 * cho niềm tin người dùng hơn cả 404. Đánh dấu "Sắp ra mắt" cho tới khi
 * thực sự có UI cho 4 API /api/tools/* (dps/material-calculator/
 * team-builder/meta-tracker — cả 4 hiện đều "mồ côi", 0 UI nào gọi tới).
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
      // ĐÃ LÀM (2026-09-22): trang UI thật ở /tools/material-calculator,
      // gọi /api/tools/material-calculator (backend có từ trước).
      href: "/tools/material-calculator",
      description: "Tính nguyên liệu nâng cấp",
      tag: "Tool",
      accent: "var(--rarity-5)",
    },
    {
      label: "Trình tối ưu thánh di vật",
      // CHƯA LÀM: cùng lý do — chưa có UI cho công cụ này.
      description: "Tối ưu chỉ số build (sắp ra mắt)",
      tag: "Sắp ra mắt",
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