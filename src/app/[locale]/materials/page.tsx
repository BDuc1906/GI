import type { Metadata } from "next";
import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { ListPageLayout, ListPageHeader } from "@/components/list-layout";
import {
  MaterialListingClient,
  type MaterialListingItem,
} from "@/features/materials/components/MaterialListingClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Materials" });
  return createLocalizedMetadata({
    locale,
    pathname: "materials",
    title: `${t("title")} — LEIBO`,
    description: t("description", { count: 300 }),
  });
}

interface MaterialsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function MaterialsPage({ params }: MaterialsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Materials");

  // Tải toàn bộ nguyên liệu từ PostgreSQL Prisma DB
  const all = await withDbRetry(() =>
    prisma.material.findMany({
      select: {
        id: true,
        name: true,
        nameTranslations: true,
        iconUrl: true,
        iconUrlOriginal: true,
        gameVersion: true,
      },
      orderBy: { name: "asc" },
    })
  );

  const listingItems: MaterialListingItem[] = all.map((m) => ({
    id: m.id,
    name: m.name,
    localizedName: getLocalizedName(m, locale),
    iconUrl: m.iconUrl,
    iconUrlOriginal: m.iconUrlOriginal,
    gameVersion: m.gameVersion,
  }));

  const breadcrumbs = [
    { name: "LEIBO", path: "/" },
    { name: t("breadcrumb"), path: "/materials" },
  ];

  const materialIcon = (
    <Image
      src="/local-genshin-assets/ui/items.png"
      alt=""
      width={24}
      height={24}
      className="w-5 h-5 sm:w-6 sm:h-6 object-contain"
    />
  );

  return (
    <ListPageLayout>
      <BreadcrumbJsonLd locale={locale} items={breadcrumbs} />

      <ListPageHeader
        icon={materialIcon}
        title={t("title")}
        description={t("description", { count: all.length })}
        totalCount={all.length}
        countLabel={t("title")}
      />

      <MaterialListingClient initialMaterials={listingItems} locale={locale} />
    </ListPageLayout>
  );
}
