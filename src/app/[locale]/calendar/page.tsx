import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { SafeImage } from "@/components/ui/SafeImage";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { genshinServerWeekdayName } from "@/core/game/genshin-server-time";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { PLAYABLE_CHARACTER_FILTER } from "@/core/game/character-catalog";
import {
  PersonalizedCalendarView,
  type CalendarDomainItem,
  type SelectableTarget,
} from "@/features/calendar/PersonalizedCalendarView";

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
  const [domains, rawCharacters, rawWeapons] = await withDbRetry(() =>
    Promise.all([
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
      }),
      prisma.character.findMany({
        where: PLAYABLE_CHARACTER_FILTER,
        select: {
          id: true,
          name: true,
          nameTranslations: true,
          rarity: true,
          vision: true,
          iconUrl: true,
          iconUrlOriginal: true,
          talentMaterials: true,
        },
        orderBy: [{ rarity: "desc" }, { name: "asc" }],
      }),
      prisma.weapon.findMany({
        where: { rarity: { gte: 4 } },
        select: {
          id: true,
          name: true,
          nameTranslations: true,
          rarity: true,
          type: true,
          iconUrl: true,
          iconUrlOriginal: true,
          ascensionMaterials: true,
        },
        orderBy: [{ rarity: "desc" }, { name: "asc" }],
      }),
    ])
  );

  // Tập hợp tên toàn bộ nguyên liệu rơi từ các bí cảnh để lọc
  const domainMaterialNames = new Set(
    domains.flatMap((d) =>
      ((d.materials as unknown as DomainMaterialEntry[]) ?? []).map((m) => m.name.toLowerCase())
    )
  );

  interface TalentLevelItem {
    level?: number;
    materials?: Array<{ name?: string | null; materialId?: string | null }>;
  }

  const selectableCharacters: SelectableTarget[] = rawCharacters.map((c) => {
    const tMats = (c.talentMaterials as unknown as TalentLevelItem[]) ?? [];
    const mats = Array.from(
      new Set(
        tMats
          .flatMap((lvl) => (lvl.materials ?? []).map((m) => m?.name).filter((n): n is string => Boolean(n)))
          .filter((n) => domainMaterialNames.has(n.toLowerCase()))
      )
    );
    return {
      id: c.id,
      name: getLocalizedName(c, locale),
      type: "character",
      rarity: c.rarity,
      iconUrl: c.iconUrl ?? c.iconUrlOriginal,
      visionOrWeaponType: c.vision,
      materialNames: mats,
    };
  });

  interface WeaponAscendItem {
    phase?: number;
    materials?: Array<{ name?: string | null; materialId?: string | null }>;
  }

  const selectableWeapons: SelectableTarget[] = rawWeapons.map((w) => {
    const wMats = (w.ascensionMaterials as unknown as WeaponAscendItem[]) ?? [];
    const mats = Array.from(
      new Set(
        wMats
          .flatMap((p) => (p.materials ?? []).map((m) => m?.name).filter((n): n is string => Boolean(n)))
          .filter((n) => domainMaterialNames.has(n.toLowerCase()))
      )
    );
    return {
      id: w.id,
      name: getLocalizedName(w, locale),
      type: "weapon",
      rarity: w.rarity,
      iconUrl: w.iconUrl ?? w.iconUrlOriginal,
      visionOrWeaponType: w.type,
      materialNames: mats,
    };
  });

  const allTargets: SelectableTarget[] = [...selectableCharacters, ...selectableWeapons];

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

  const calendarDomains: CalendarDomainItem[] = openToday.map((d) => {
    const rawMats = ((d.materials as unknown as DomainMaterialEntry[]) ?? []).filter((m) => m.name);
    return {
      id: d.id,
      name: d.name,
      localizedName: getLocalizedName(d, locale),
      category: d.category as "talent" | "weapon",
      regionName: d.regionName,
      daysOfWeek: d.daysOfWeek,
      materials: rawMats.map((m) => {
        const icon = m.materialId ? iconMap.get(m.materialId) : undefined;
        return {
          name: m.name,
          materialId: m.materialId,
          iconUrl: icon?.iconUrl ?? icon?.iconUrlOriginal,
        };
      }),
    };
  });

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
        <PersonalizedCalendarView
          selectedDay={selected}
          weekdayLabel={WEEKDAY_LABEL[selected]}
          categoryLabels={CATEGORY_LABEL}
          domains={calendarDomains}
          allTargets={allTargets}
        />
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
