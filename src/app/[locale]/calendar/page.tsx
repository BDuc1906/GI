import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { SafeImage } from "@/components/ui/SafeImage";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { genshinServerWeekdayName } from "@/lib/game/genshin-server-time";
import { createLocalizedMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ day?: string }>;
}

// Thứ tự hiển thị kiểu game: Thứ Hai → Chủ Nhật (Chủ Nhật mở mọi bí cảnh).
const WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
type Weekday = (typeof WEEK)[number];

interface DomainMaterialEntry {
  materialId?: string | null;
  name: string;
}

const MAX_MATERIALS_SHOWN = 6;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return createLocalizedMetadata({
    locale,
    pathname: "calendar",
    title: "Lịch farm hằng tuần — Sách thiên phú & nguyên liệu vũ khí | LEIBO",
    description:
      "Hôm nay farm gì? Lịch bí cảnh theo từng ngày trong tuần: sách nâng cấp thiên phú và nguyên liệu đột phá vũ khí, tính theo giờ server game.",
  });
}

export default async function CalendarPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "DomainDetail" });

  const WEEKDAY_LABEL: Record<Weekday, string> = {
    Monday: t("monday"),
    Tuesday: t("tuesday"),
    Wednesday: t("wednesday"),
    Thursday: t("thursday"),
    Friday: t("friday"),
    Saturday: t("saturday"),
    Sunday: t("sunday"),
  };
  const CATEGORY_LABEL: Record<string, string> = {
    talent: t("categoryTalent"),
    weapon: t("categoryWeapon"),
  };

  const today = genshinServerWeekdayName() as Weekday;
  const { day: dayParam } = await searchParams;
  const selected: Weekday = (WEEK as readonly string[]).includes(dayParam ?? "")
    ? (dayParam as Weekday)
    : today;

  // Chọn field tường minh (xem ghi chú ở domains/[id]/page.tsx về Prisma 7).
  const domains = await withDbRetry(() =>
    prisma.domain.findMany({
      where: { category: { in: ["talent", "weapon"] } },
      select: {
        id: true,
        name: true,
        nameTranslations: true,
        category: true,
        regionName: true,
        daysOfWeek: true,
        materials: true,
      },
      orderBy: [{ category: "asc" }, { regionName: "asc" }, { name: "asc" }],
    })
  );

  // Rỗng = mở hằng ngày; có giá trị = chỉ mở các ngày đó.
  const isOpen = (d: { daysOfWeek: string[] }, day: Weekday) =>
    d.daysOfWeek.length === 0 || d.daysOfWeek.includes(day);

  const openToday = domains.filter((d) => isOpen(d, selected));

  // Chỉ tra icon cho các bí cảnh của ngày đang chọn (nhẹ hơn tra toàn bộ).
  const materialIds = Array.from(
    new Set(
      openToday.flatMap((d) =>
        ((d.materials as unknown as DomainMaterialEntry[]) ?? [])
          .map((m) => m.materialId)
          .filter((v): v is string => Boolean(v))
      )
    )
  );
  const materialRows = materialIds.length
    ? await withDbRetry(() =>
        prisma.material.findMany({
          where: { id: { in: materialIds } },
          select: { id: true, iconUrl: true, iconUrlOriginal: true },
        })
      )
    : [];
  const iconMap = new Map(materialRows.map((m) => [m.id, m]));

  const breadcrumbItems = [
    { name: "LEIBO", path: "/" },
    { name: "Lịch farm", path: "/calendar" },
  ];

  const groups = (["talent", "weapon"] as const).map((cat) => ({
    cat,
    items: openToday.filter((d) => d.category === cat),
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <BreadcrumbJsonLd locale={locale} items={breadcrumbItems} />
      <Breadcrumb items={breadcrumbItems} />

      <h1 className="font-display text-display-2 font-semibold text-text-primary mb-2">
        Lịch farm hằng tuần
      </h1>
      <p className="text-sm text-text-secondary mb-6 max-w-3xl">
        Bí cảnh Sách thiên phú và Nguyên liệu vũ khí chỉ mở 3 ngày mỗi tuần, riêng Chủ Nhật mở tất cả.
        Bí cảnh Thánh di vật mở hằng ngày. Ngày mới bắt đầu lúc 4:00 sáng giờ server (mặc định
        server Châu Á, UTC+8).
      </p>

      {/* Chọn ngày */}
      <nav aria-label="Chọn ngày trong tuần" className="flex flex-wrap gap-2 mb-8">
        {WEEK.map((day) => {
          const active = day === selected;
          return (
            <Link
              key={day}
              href={`/calendar?day=${day}`}
              aria-current={active ? "page" : undefined}
              className={`px-3.5 py-1.5 rounded-full border text-sm transition-colors ${
                active
                  ? "bg-bg-elevated border-accent-500 text-accent-bright font-semibold"
                  : "border-border text-text-secondary hover:border-accent-500 hover:text-accent-bright"
              }`}
            >
              {WEEKDAY_LABEL[day]}
              {day === today && (
                <span className="ml-1.5 text-[10px] uppercase tracking-wide text-accent-bright">
                  · hôm nay
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {domains.length === 0 ? (
        <p className="text-text-muted text-sm">Chưa có dữ liệu bí cảnh.</p>
      ) : (
        groups.map(({ cat, items }) => (
          <section key={cat} className="mb-10">
            <h2 className="font-display text-xl font-bold mb-4 text-accent-bright border-b border-border pb-2">
              {CATEGORY_LABEL[cat]} — {WEEKDAY_LABEL[selected]}
              <span className="ml-2 text-sm font-normal text-text-muted">({items.length})</span>
            </h2>
            {items.length === 0 ? (
              <p className="text-sm text-text-muted">Không có bí cảnh nào mở ngày này.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((d) => {
                  const mats = ((d.materials as unknown as DomainMaterialEntry[]) ?? []).filter(
                    (m) => m.name
                  );
                  return (
                    <Link
                      key={d.id}
                      href={`/domains/${d.id}`}
                      className="surface-card p-4 flex flex-col gap-3 group"
                    >
                      <div>
                        <div className="font-semibold text-text-primary group-hover:text-accent-bright transition-colors">
                          {getLocalizedName(d, locale)}
                        </div>
                        {d.regionName && (
                          <div className="text-xs text-text-muted mt-0.5">{d.regionName}</div>
                        )}
                      </div>
                      {mats.length > 0 && (
                        <ul className="flex flex-wrap gap-2">
                          {mats.slice(0, MAX_MATERIALS_SHOWN).map((m) => {
                            const icon = m.materialId ? iconMap.get(m.materialId) : undefined;
                            return (
                              <li
                                key={`${d.id}-${m.name}`}
                                title={m.name}
                                className="relative w-10 h-10 rounded-lg bg-bg-elevated overflow-hidden"
                              >
                                <SafeImage
                                  src={icon?.iconUrl}
                                  fallbackSrcs={[icon?.iconUrlOriginal]}
                                  alt={m.name}
                                  fill
                                  sizes="40px"
                                  className="object-contain p-0.5"
                                />
                              </li>
                            );
                          })}
                          {mats.length > MAX_MATERIALS_SHOWN && (
                            <li className="w-10 h-10 rounded-lg border border-border text-xs text-text-muted flex items-center justify-center">
                              +{mats.length - MAX_MATERIALS_SHOWN}
                            </li>
                          )}
                        </ul>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        ))
      )}

      {/* Bảng tổng quan cả tuần */}
      {domains.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-xl font-bold mb-4 text-accent-bright border-b border-border pb-2">
            Tổng quan cả tuần
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-bg-secondary text-text-secondary">
                <tr>
                  <th scope="col" className="text-left font-medium px-3 py-2 min-w-48">
                    Bí cảnh
                  </th>
                  {WEEK.map((day) => (
                    <th
                      key={day}
                      scope="col"
                      className={`px-2 py-2 font-medium ${
                        day === selected ? "text-accent-bright" : ""
                      }`}
                    >
                      {WEEKDAY_LABEL[day]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {domains.map((d) => (
                  <tr key={d.id} className="border-t border-border">
                    <th scope="row" className="text-left font-normal px-3 py-2">
                      <Link
                        href={`/domains/${d.id}`}
                        className="text-text-primary hover:text-accent-bright"
                      >
                        {getLocalizedName(d, locale)}
                      </Link>
                      <span className="ml-2 text-[10px] uppercase tracking-wide text-text-muted">
                        {CATEGORY_LABEL[d.category]}
                      </span>
                    </th>
                    {WEEK.map((day) => {
                      const open = isOpen(d, day);
                      return (
                        <td
                          key={day}
                          className={`text-center px-2 py-2 ${
                            day === selected ? "bg-bg-secondary" : ""
                          }`}
                        >
                          <span
                            aria-label={open ? "Mở" : "Đóng"}
                            className={open ? "text-accent-bright" : "text-text-muted opacity-40"}
                          >
                            {open ? "●" : "–"}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
