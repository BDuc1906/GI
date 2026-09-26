import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";

interface AdventureRanksPageProps {
  params: Promise<{ locale: string }>;
}

export const dynamic = "force-dynamic";

/**
 * BỔ SUNG (2026-09-22): model `AdventureRank` đã có DB + dữ liệu nhưng
 * CHƯA TỪNG có trang hiển thị. Xem comment ở crafts/page.tsx — cùng lý
 * do, cùng pattern. Lưu ý: field `exp` của genshin-db hiện gần như luôn
 * rỗng (đã verify lúc audit trước) — trang vẫn hiển thị được tên/thứ tự
 * cấp bậc dù thiếu exp.
 */
export default async function AdventureRanksPage({ params }: AdventureRanksPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const ranks = await prisma.adventureRank.findMany({
    orderBy: { id: "asc" },
    take: 200,
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-4">
          Cấp bậc Phiêu Lưu
        </h1>
        <p className="text-text-secondary mb-8">
          Danh sách Adventure Rank — tổng {ranks.length} cấp.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {ranks.map((rank) => (
            <div
              key={rank.id}
              className="bg-bg-card border-2 border-border rounded-xl p-4 text-center hover:border-gold/50 transition-all"
            >
              <div className="font-display text-lg font-bold text-gold-bright">{rank.name}</div>
              {rank.exp != null && (
                <div className="text-xs text-text-muted mt-1">{rank.exp.toLocaleString("vi-VN")} EXP</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
