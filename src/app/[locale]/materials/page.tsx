import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
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

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <BreadcrumbJsonLd locale={locale} items={breadcrumbs} />
      <Breadcrumb items={breadcrumbs} />

      <div>
        <h1 className="font-display text-display-2 font-semibold text-text-primary mb-2">
          {t("title")}
        </h1>
        <p className="text-sm text-text-secondary">
          {t("description", { count: all.length })}
        </p>
      </div>

      <MaterialListingClient initialMaterials={listingItems} locale={locale} />
    </div>
  );
}
