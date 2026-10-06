import { unstable_cache } from "next/cache";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { Pagination } from "@/components/ui/Pagination";
import { AchievementCard } from "@/components/achievements/AchievementCard";
import { LIST_PAGE_SIZE, parsePageParam, totalPagesFor } from "@/lib/ui/pagination";
import { createStaticPageMetadata } from "@/lib/seo/metadata";
import { totalPrimogems } from "@/lib/game/achievement-format";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createStaticPageMetadata(locale, "achievements");
}

interface AchievementsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; q?: string; group?: string; hidden?: string }>;
}

/** Thống kê toàn bộ (cache 1 giờ): tổng Primogem từ mọi bậc của mọi thành tựu. */
const getStats = unstable_cache(
  async () => {
    const rows = await prisma.achievement.findMany({ select: { raw: true } });
    return { total: rows.length, primogems: rows.reduce((n, r) => n + totalPrimogems(r.raw), 0) };
  },
  ["achievement-stats-v1"],
  { revalidate: 3600 }
);

export default async function AchievementsPage({ params, searchParams }: AchievementsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const page = parsePageParam(sp.page);
  const q = (sp.q ?? "").trim();
  const group = (sp.group ?? "").trim();
  const onlyHidden = sp.hidden === "1";

  const where = {
    ...(group ? { achievementGroupId: group } : {}),
    ...(onlyHidden ? { isHidden: true } : {}),
    ...(q ? { name: { contains: q, mode: "insensitive" as const } } : {}),
  };

  const [achievements, filteredTotal, groups, counts, stats] = await withDbRetry(() =>
    Promise.all([
      prisma.achievement.findMany({
        where,
        select: { id: true, name: true, achievementGroupName: true, isHidden: true, raw: true },
        orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
        skip: (page - 1) * LIST_PAGE_SIZE,
        take: LIST_PAGE_SIZE,
      }),
      prisma.achievement.count({ where }),
      prisma.achievementGroup.findMany({
        select: { id: true, name: true },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.achievement.groupBy({ by: ["achievementGroupId"], _count: { _all: true } }),
      getStats(),
    ])
  );

  const countByGroup = new Map(counts.map((c) => [c.achievementGroupId ?? "", c._count._all]));
  const totalPages = totalPagesFor(filteredTotal);
  const activeGroup = groups.find((g) => g.id === group);

  const buildHref = (nextPage: number) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (group) p.set("group", group);
    if (onlyHidden) p.set("hidden", "1");
    if (nextPage > 1) p.set("page", String(nextPage));
    const s = p.toString();
    return s ? `/achievements?${s}` : "/achievements";
  };

  const filtered = Boolean(q || group || onlyHidden);

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-4">Thành tựu</h1>
        <p className="text-text-secondary mb-2 max-w-3xl">
          {stats.total} thành tựu trong {groups.length} nhóm. Hoàn thành tất cả các bậc nhận tổng cộng{" "}
          <strong className="text-text-primary">{stats.primogems.toLocaleString()} Primogem</strong> (tính từ dữ
          liệu nguồn genshin-db, chưa đối chiếu độc lập trong game).
        </p>
        <p className="text-sm text-text-muted mb-6">
          Bấm &ldquo;Ẩn&rdquo; trên thẻ nghĩa là nguồn dữ liệu đánh dấu thành tựu đó là thành tựu ẩn. Xem riêng{" "}
          <Link href="/achievements/hidden" className="underline hover:text-accent-bright">
            danh sách thành tựu ẩn
          </Link>
          .
        </p>

        {/* Form GET thuần — không cần JavaScript */}
        <form action="" method="get" role="search" className="flex flex-wrap items-end gap-3 mb-6">
          <label className="flex flex-col text-xs text-text-muted gap-1">
            Tên thành tựu
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Tìm theo tên (tiếng Anh)..."
              className="px-3 py-2 rounded-lg border border-border bg-bg-input text-text-primary placeholder:text-text-muted w-64 max-w-full"
            />
          </label>
          <label className="flex flex-col text-xs text-text-muted gap-1">
            Nhóm
            <select
              name="group"
              defaultValue={group}
              className="px-3 py-2 rounded-lg border border-border bg-bg-input text-text-primary max-w-xs"
            >
              <option value="">Tất cả nhóm</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({countByGroup.get(g.id) ?? 0})
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-text-secondary pb-2">
            <input type="checkbox" name="hidden" value="1" defaultChecked={onlyHidden} />
            Chỉ thành tựu ẩn
          </label>
          <button type="submit" className="btn-primary px-4 py-2 rounded-lg">
            Lọc
          </button>
          {filtered && (
            <Link href="/achievements" className="text-sm text-text-secondary underline hover:text-accent-bright pb-2">
              Xoá bộ lọc
            </Link>
          )}
        </form>

        <p className="text-sm text-text-muted mb-4" aria-live="polite">
          {filteredTotal} thành tựu{activeGroup ? ` · nhóm “${activeGroup.name}”` : ""}
          {totalPages > 1 ? ` · trang ${page}/${totalPages}` : ""}
        </p>

        {achievements.length === 0 ? (
          <p className="text-text-secondary">Không có thành tựu nào khớp bộ lọc.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((a) => (
              <li key={a.id}>
                <AchievementCard
                  name={a.name}
                  groupName={a.achievementGroupName}
                  isHidden={a.isHidden}
                  raw={a.raw}
                />
              </li>
            ))}
          </ul>
        )}

        <Pagination page={page} totalPages={totalPages} buildHref={buildHref} />
      </div>
    </div>
  );
}
