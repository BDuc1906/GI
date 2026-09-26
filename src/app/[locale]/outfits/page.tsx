import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";

interface WindglidersPageProps {
  params: Promise<{ locale: string }>;
}

export const dynamic = "force-dynamic";

/**
 * BỔ SUNG (2026-09-22): model `Windglider` đã có DB + dữ liệu nhưng CHƯA
 * TỪNG có trang hiển thị. Xem comment ở crafts/page.tsx — cùng lý do,
 * cùng pattern.
 */
export default async function WindglidersPage({ params }: WindglidersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const windgliders = await prisma.windglider.findMany({
    orderBy: [{ rarity: "desc" }, { name: "asc" }],
    take: 200,
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-4">
          Dù lượn
        </h1>
        <p className="text-text-secondary mb-8">
          Danh sách dù lượn — tổng {windgliders.length} mẫu.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {windgliders.map((glider) => (
            <div
              key={glider.id}
              className="bg-bg-card border-2 border-border rounded-xl p-4 hover:border-gold/50 transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-text-primary">{glider.name}</h3>
                {glider.rarity != null && (
                  <span className="text-gold-bright text-sm">{"★".repeat(glider.rarity)}</span>
                )}
              </div>
              {glider.source && <p className="text-xs text-text-muted">{glider.source}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
