import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import {
  WeaponListingClient,
  type WeaponListingItem,
} from "@/features/weapons/components/WeaponListingClient";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Weapons" });
  return createLocalizedMetadata({
    locale,
    pathname: "weapons",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function WeaponsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Weapons" });
  const tWeaponType = await getTranslations({ locale, namespace: "WeaponType" });

  // Tải toàn bộ danh sách vũ khí từ PostgreSQL Prisma DB
  const weapons = await withDbRetry(() =>
    prisma.weapon.findMany({
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        nameTranslations: true,
        type: true,
        rarity: true,
        baseAtk: true,
        subStatName: true,
        subStatValue: true,
        iconUrl: true,
        effectName: true,
      },
    })
  );

  const listingItems: WeaponListingItem[] = weapons.map((w) => ({
    id: w.id,
    name: w.name,
    localizedName: getLocalizedName(w, locale),
    type: w.type,
    rarity: w.rarity,
    baseAtk: w.baseAtk,
    subStatName: w.subStatName,
    subStatValue: w.subStatValue,
    iconUrl: w.iconUrl,
    effectName: w.effectName,
  }));

  const typeLabels: Record<string, string> = {
    Sword: tWeaponType("Sword"),
    Claymore: tWeaponType("Claymore"),
    Polearm: tWeaponType("Polearm"),
    Bow: tWeaponType("Bow"),
    Catalyst: tWeaponType("Catalyst"),
  };

  const breadcrumbs = [
    { name: "LEIBO", path: "/" },
    { name: t("title"), path: "/weapons" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <BreadcrumbJsonLd locale={locale} items={breadcrumbs} />
      <Breadcrumb items={breadcrumbs} />

      <div>
        <h1 className="font-display text-display-2 font-semibold text-text-primary mb-2">
          {t("title")}
        </h1>
        <p className="text-sm text-text-secondary">
          {t.rich("foundCount", {
            count: weapons.length,
            b: (chunks) => (
              <span className="text-accent-bright font-semibold tabular-nums">
                {chunks}
              </span>
            ),
          })}
        </p>
      </div>

      <WeaponListingClient
        initialWeapons={listingItems}
        locale={locale}
        typeLabels={typeLabels}
      />
    </div>
  );
}
