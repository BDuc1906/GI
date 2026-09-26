import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { Link } from "@/i18n/navigation";

interface HiddenAchievementsPageProps {
  params: Promise<{ locale: string }>;
}

export const dynamic = "force-dynamic";

/**
 * BỔ SUNG (2026-09-22): trang này trước đây được quảng bá ngay trên trang
 * chủ (ExtendedDatabase.tsx — thẻ "Thành tựu ẩn") nhưng route KHÔNG TỒN
 * TẠI — người dùng bấm vào gặp 404 ngay từ trang đầu tiên. Dữ liệu cần
 * thiết (`Achievement.isHidden`) đã có sẵn trong DB và đã hiển thị (kèm
 * badge "Hidden") trong `/achievements` — trang này chỉ lọc riêng những
 * thành tựu đó ra thành 1 view chuyên biệt, đúng như lời hứa trên trang chủ.
 */
export default async function HiddenAchievementsPage({ params }: HiddenAchievementsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const hiddenAchievements = await prisma.achievement.findMany({
    where: { isHidden: true },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <Link href="/achievements" className="text-sm text-text-secondary hover:text-gold transition-colors">
          ← Tất cả thành tựu
        </Link>

        <h1 className="font-display text-4xl font-bold text-text-primary mt-4 mb-4">
          🏆 Thành tựu ẩn
        </h1>
        <p className="text-text-secondary mb-8">
          Thành tựu không hiển thị công khai trong game (không có mô tả điều
          kiện) — tổng {hiddenAchievements.length} thành tựu.
        </p>

        {hiddenAchievements.length === 0 ? (
          <p className="text-text-muted">Chưa có dữ liệu thành tựu ẩn.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hiddenAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="bg-bg-card border-2 border-yellow-500/50 rounded-xl p-4 hover:border-gold/50 transition-all"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-text-primary">{achievement.name}</h3>
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                    Hidden
                  </span>
                </div>
                {achievement.achievementGroupName && (
                  <p className="text-sm text-text-muted mt-1">{achievement.achievementGroupName}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
