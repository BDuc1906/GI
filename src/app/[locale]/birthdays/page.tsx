import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { SafeImage } from "@/components/ui/SafeImage";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { PLAYABLE_CHARACTER_FILTER } from "@/lib/game/character-catalog";
import { daysUntil, parseBirthday, todayAsia } from "@/lib/game/birthdays";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  return createLocalizedMetadata({
    locale,
    pathname: "birthdays",
    title: "Lịch sinh nhật nhân vật Genshin Impact | LEIBO",
    description:
      "Sinh nhật của toàn bộ nhân vật Genshin Impact theo từng tháng: hôm nay là sinh nhật ai, ai sắp tới, kèm quê hương và độ hiếm.",
  });
}

export default async function BirthdaysPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const rows = await withDbRetry(() =>
    prisma.character.findMany({
      where: PLAYABLE_CHARACTER_FILTER,
      select: {
        id: true,
        name: true,
        nameTranslations: true,
        iconUrl: true,
        iconUrlOriginal: true,
        rarity: true,
        region: true,
        birthday: true,
        birthdaymmdd: true,
      },
      orderBy: { name: "asc" },
    })
  );

  const today = todayAsia();

  const all = rows.map((r) => ({ ...r, b: parseBirthday(r.birthdaymmdd, r.birthday) }));
  const withBirthday = all
    .filter((r): r is typeof r & { b: NonNullable<typeof r.b> } => r.b !== null)
    .map((r) => ({ ...r, in: daysUntil(today, r.b) }));
  const missing = all.length - withBirthday.length;

  const todays = withBirthday.filter((r) => r.in === 0);
  const upcoming = withBirthday
    .filter((r) => r.in > 0)
    .sort((a, b) => a.in - b.in || a.name.localeCompare(b.name))
    .slice(0, 6);

  const months = Array.from({ length: 12 }, (_, i) => i + 1).map((m) => ({
    month: m,
    list: withBirthday
      .filter((r) => r.b.month === m)
      .sort((a, b) => a.b.day - b.b.day || a.name.localeCompare(b.name)),
  }));

  const breadcrumbItems = [
    { name: "LEIBO", path: "/" },
    { name: "Lịch sinh nhật", path: "/birthdays" },
  ];

  const Avatar = ({ r }: { r: (typeof withBirthday)[number] }) => (
    <div className="relative w-10 h-10 rounded-full bg-bg-elevated overflow-hidden shrink-0">
      <SafeImage
        src={r.iconUrl}
        fallbackSrcs={[r.iconUrlOriginal]}
        alt={getLocalizedName(r, locale)}
        fill
        sizes="40px"
        className="object-cover"
      />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <BreadcrumbJsonLd locale={locale} items={breadcrumbItems} />
      <Breadcrumb items={breadcrumbItems} />

      <h1 className="font-display text-display-2 font-semibold text-text-primary mb-2">
        Lịch sinh nhật nhân vật
      </h1>
      <p className="text-sm text-text-secondary mb-8 max-w-3xl">
        Sinh nhật của {withBirthday.length} nhân vật, sắp xếp theo tháng. Ngày hiện tại tính theo UTC+8
        (server Châu Á). Nguồn là dữ liệu genshin-db; game không công bố năm sinh nên chỉ có ngày và tháng.
      </p>

      {todays.length > 0 && (
        <section className="mb-8 rounded-2xl border-2 border-accent-500 bg-bg-elevated p-5">
          <h2 className="font-display text-xl font-bold text-accent-bright mb-3">🎂 Hôm nay là sinh nhật</h2>
          <ul className="flex flex-wrap gap-3">
            {todays.map((r) => (
              <li key={r.id}>
                <Link href={`/characters/${r.id}`} className="surface-card p-3 flex items-center gap-3 group">
                  <Avatar r={r} />
                  <span className="font-medium text-text-primary group-hover:text-accent-bright transition-colors">
                    {getLocalizedName(r, locale)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-xl font-bold mb-4 text-accent-bright border-b border-border pb-2">
            Sắp tới
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {upcoming.map((r) => (
              <li key={r.id}>
                <Link href={`/characters/${r.id}`} className="surface-card p-3 flex items-center gap-3 group">
                  <Avatar r={r} />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate group-hover:text-accent-bright transition-colors">
                      {getLocalizedName(r, locale)}
                    </div>
                    <div className="text-[11px] text-text-muted">
                      {r.b.day}/{r.b.month} · còn {r.in} ngày
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {months.map(({ month, list }) => (
        <section
          key={month}
          id={`thang-${month}`}
          aria-labelledby={`h-thang-${month}`}
          className="mb-8"
        >
          <h2
            id={`h-thang-${month}`}
            className={`font-display text-lg font-bold mb-3 border-b border-border pb-1.5 ${
              month === today.month ? "text-accent-bright" : "text-text-primary"
            }`}
          >
            Tháng {month}
            {month === today.month && (
              <span className="ml-2 text-[10px] uppercase tracking-wide text-accent-bright">· tháng này</span>
            )}
            <span className="ml-2 text-sm font-normal text-text-muted">({list.length})</span>
          </h2>
          {list.length === 0 ? (
            <p className="text-sm text-text-muted">Không có nhân vật nào sinh nhật trong tháng này.</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {list.map((r) => (
                <li key={r.id}>
                  <Link href={`/characters/${r.id}`} className="surface-card p-3 flex items-center gap-3 group">
                    <Avatar r={r} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-text-primary truncate group-hover:text-accent-bright transition-colors">
                        {getLocalizedName(r, locale)}
                      </div>
                      <div className="text-[11px] text-text-muted truncate">
                        {r.b.day}/{r.b.month} · {r.rarity}★{r.region ? ` · ${r.region}` : ""}
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}

      {missing > 0 && (
        <p className="text-xs text-text-muted mt-6">
          {missing} nhân vật chưa có dữ liệu sinh nhật (ví dụ Aether và Lumine) nên không nằm trong lịch.
        </p>
      )}
    </div>
  );
}
