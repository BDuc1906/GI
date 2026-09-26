import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";

interface CraftsPageProps {
  params: Promise<{ locale: string }>;
}

export const dynamic = "force-dynamic";

/**
 * BỔ SUNG (2026-09-22): model `Craft` đã có DB + API (`/api/crafts`,
 * `/api/crafts/[id]`) và có dữ liệu (seed qua `seedCrafts()` trong
 * `seed-extra.ts`) nhưng CHƯA TỪNG có trang hiển thị nào — dữ liệu tồn
 * tại nhưng người dùng không cách nào xem được. Trang này lấp khoảng
 * trống đó, theo đúng pattern các trang đơn giản khác (`food`, `geography`).
 */
export default async function CraftsPage({ params }: CraftsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const crafts = await prisma.craft.findMany({
    orderBy: [{ unlockRank: "asc" }, { name: "asc" }],
    take: 200,
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-4">
          Công thức chế tạo
        </h1>
        <p className="text-text-secondary mb-8">
          Danh sách công thức chế tạo (Adventurer Handbook) — tổng {crafts.length} mục.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {crafts.map((craft) => (
            <div
              key={craft.id}
              className="bg-bg-card border-2 border-border rounded-xl p-4 hover:border-gold/50 transition-all"
            >
              <h3 className="font-semibold text-text-primary mb-2">{craft.name}</h3>
              <div className="space-y-1 text-xs text-text-secondary">
                {craft.unlockRank != null && (
                  <div>
                    <span className="font-medium">Mở khoá: </span>
                    Cấp phiêu lưu {craft.unlockRank}
                  </div>
                )}
                {craft.moraCost != null && (
                  <div>
                    <span className="font-medium">Chi phí: </span>
                    {craft.moraCost.toLocaleString("vi-VN")} Mora
                  </div>
                )}
                {craft.resultCount != null && craft.resultCount > 1 && (
                  <div>
                    <span className="font-medium">Số lượng: </span>
                    ×{craft.resultCount}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
