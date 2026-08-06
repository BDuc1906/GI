
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SafeImage } from "@/components/SafeImage";
import type { Metadata } from "next";
import { genshinServerWeekdayIndex } from "@/lib/genshin-server-time";

export const metadata: Metadata = {
  title: "Bí Cảnh — LEIBO",
  description:
    "Lịch bí cảnh Genshin Impact: bí cảnh thánh di vật (mở hằng ngày), bí cảnh vũ khí và sách thiên phú (mở luân phiên theo ngày trong tuần).",
};

const CATEGORY_LABEL: Record<string, string> = {
  artifact: "Thánh di vật",
  weapon: "Nguyên liệu vũ khí",
  talent: "Sách thiên phú",
};

const CATEGORY_ORDER = ["artifact", "weapon", "talent"];

const WEEKDAY_LABEL_VI: Record<string, string> = {
  Sunday: "CN",
  Monday: "T2",
  Tuesday: "T3",
  Wednesday: "T4",
  Thursday: "T5",
  Friday: "T6",
  Saturday: "T7",
};

const WEEKDAY_FULL_VI = ["CN", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

interface PageProps {
  searchParams: Promise<{ category?: string; day?: string }>;
}

export default async function DomainsPage({ searchParams }: PageProps) {
  const { category, day } = await searchParams;

  const where: Prisma.DomainWhereInput = {};
  if (category) where.category = category;
  if (day) where.OR = [{ daysOfWeek: { isEmpty: true } }, { daysOfWeek: { has: day } }];

  const domains = await prisma.domain.findMany({ where, orderBy: [{ category: "asc" }, { name: "asc" }] });

  // "Hôm nay" tính theo giờ server Châu Á (UTC+8) + mốc đổi ngày 4:00 sáng —
  // dùng chung src/lib/genshin-server-time.ts với GET /api/domains?today=true
  // để trang và API luôn khớp nhau (xem docstring trong file đó).
  const todayIndex = genshinServerWeekdayIndex();
  const todayKey = Object.keys(WEEKDAY_LABEL_VI)[todayIndex];

  const buildQuery = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    if (category) sp.set("category", category);
    if (day) sp.set("day", day);
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v);
      else sp.delete(k);
    });
    return sp.toString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-wide text-primary uppercase mb-2">
          Lịch Bí Cảnh
        </h1>
        <p className="text-sm text-secondary">
          Tìm thấy <span className="text-gold-bright font-semibold">{domains.length}</span> bí cảnh
        </p>
      </div>

      <div className="bg-card/40 backdrop-blur-md border border-border p-4 rounded-xl mb-8 flex flex-wrap gap-4 text-xs items-center">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-secondary font-medium mr-2">Loại bí cảnh:</span>
          {CATEGORY_ORDER.map((c) => (
            <Link
              key={c}
              href={`/domains?${buildQuery({ category: c })}`}
              className={`px-3 py-1.5 rounded-full border transition-all font-medium ${
                category === c
                  ? "border-gold bg-gold/20 text-gold-bright"
                  : "border-border bg-card/60 hover:border-gold/50 text-primary"
              }`}
            >
              {CATEGORY_LABEL[c]}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-secondary font-medium mr-2 ml-2">Ngày mở:</span>
          {Object.entries(WEEKDAY_LABEL_VI).map(([key, label]) => (
            <Link
              key={key}
              href={`/domains?${buildQuery({ day: key })}`}
              className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all font-semibold ${
                day === key
                  ? "border-gold bg-gold/20 text-gold-bright"
                  : key === todayKey
                    ? "border-gold/50 text-gold-bright"
                    : "border-border bg-card/60 hover:border-gold/50 text-primary"
              }`}
              title={key === todayKey ? `${label} (hôm nay)` : label}
            >
              {label}
            </Link>
          ))}
        </div>

        {(category || day) && (
          <Link
            href="/domains"
            className="ml-auto px-4 py-1.5 rounded-full bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-900/40 transition-colors font-semibold"
          >
            Xóa Lọc &times;
          </Link>
        )}
      </div>

      {!day && (
        <p className="mb-6 text-xs text-secondary">
          Hôm nay ({WEEKDAY_FULL_VI[todayIndex]} theo giờ server Châu Á, reset 4:00 sáng):{" "}
          <Link href={`/domains?${buildQuery({ day: todayKey })}`} className="text-gold-bright underline underline-offset-2">
            xem bí cảnh mở hôm nay
          </Link>
          . Áp dụng cho server Châu Á (UTC+8) — đa số người chơi Việt Nam dùng server này.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {domains.map((d) => (
          <Link
            key={d.id}
            href={`/domains/${d.id}`}
            className="relic-frame overflow-hidden group flex gap-4 p-4"
          >
            <div className="relative w-20 h-20 shrink-0 rounded-lg bg-secondary/40 overflow-hidden">
              {d.imageUrl ? (
                <SafeImage
                  src={d.imageUrl}
                  alt={d.name}
                  fill
                  sizes="80px"
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted text-[10px]">
                  No Image
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-secondary font-medium mb-1">
                {CATEGORY_LABEL[d.category] ?? d.category}
              </div>
              <div className="font-bold truncate text-primary group-hover:text-gold-bright transition-colors text-sm mb-1">
                {d.name}
              </div>
              <div className="text-xs text-muted">
                {d.daysOfWeek.length === 0
                  ? "Mở hằng ngày"
                  : d.daysOfWeek.map((wd) => WEEKDAY_LABEL_VI[wd] ?? wd).join(" · ")}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {domains.length === 0 && (
        <div className="text-center py-16 text-secondary text-sm">
          Không tìm thấy bí cảnh nào khớp bộ lọc.
        </div>
      )}
    </div>
  );
}
