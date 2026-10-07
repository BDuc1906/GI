import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { Link } from "@/i18n/navigation";
import { Pagination } from "@/components/ui/Pagination";
import { AchievementCard } from "@/components/achievements/AchievementCard";
import { LIST_PAGE_SIZE, parsePageParam, totalPagesFor } from "@/lib/ui/pagination";
import { createStaticPageMetadata } from "@/lib/seo/metadata";
import { imageFor } from "@/lib/game/image-urls";
import achievementGroupImages from "@/data/images/achievement-groups.json";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createStaticPageMetadata(locale, "achievements/hidden");
}

interface HiddenAchievementsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}

/**
 * Thành tựu được đánh dấu `isHidden` trong dữ liệu nguồn.
 *
 * Bản cũ của trang này ghi "không có mô tả điều kiện" và chỉ hiện tên, nhưng dữ
 * liệu nguồn thực tế CÓ mô tả, tiến độ và phần thưởng cho cả các mục ẩn — nay hiển
 * thị đầy đủ và phân trang (~1.000 mục, không nên đổ hết lên 1 trang).
 */
export default async function HiddenAchievementsPage({
  params,
  searchParams,
}: HiddenAchievementsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const page = parsePageParam((await searchParams).page);

  const [items, total] = await withDbRetry(() =>
    Promise.all([
      prisma.achievement.findMany({
        where: { isHidden: true },
        select: {
          id: true,
          name: true,
          achievementGroupId: true,
          achievementGroupName: true,
          isHidden: true,
          raw: true,
        },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        skip: (page - 1) * LIST_PAGE_SIZE,
        take: LIST_PAGE_SIZE,
      }),
      prisma.achievement.count({ where: { isHidden: true } }),
    ])
  );
  const totalPages = totalPagesFor(total);

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <Link href="/achievements" className="text-sm text-text-secondary hover:text-accent-bright transition-colors">
          ← Tất cả thành tựu
        </Link>

        <h1 className="font-display text-4xl font-bold text-text-primary mt-4 mb-4">Thành tựu ẩn</h1>
        <p className="text-text-secondary mb-8 max-w-3xl">
          {total} thành tựu được nguồn dữ liệu đánh dấu là thành tựu ẩn. Mô tả điều kiện và phần thưởng lấy
          từ chính nguồn đó.
        </p>

        {items.length === 0 ? (
          <p className="text-text-muted">Chưa có dữ liệu thành tựu ẩn.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((a) => (
              <li key={a.id}>
                <AchievementCard
                  name={a.name}
                  groupName={a.achievementGroupName}
                  isHidden={a.isHidden}
                  raw={a.raw}
                  iconCandidates={imageFor(achievementGroupImages, a.achievementGroupId)}
                />
              </li>
            ))}
          </ul>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          buildHref={(n) => (n > 1 ? `/achievements/hidden?page=${n}` : "/achievements/hidden")}
        />
      </div>
    </div>
  );
}
