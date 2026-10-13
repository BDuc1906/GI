import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { createStaticPageMetadata } from "@/lib/seo/metadata";
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
  return createStaticPageMetadata(locale, "materials");
}

interface MaterialsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function MaterialsPage({ params }: MaterialsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

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
    { name: "Nguyên liệu", path: "/materials" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <BreadcrumbJsonLd locale={locale} items={breadcrumbs} />
      <Breadcrumb items={breadcrumbs} />

      <div>
        <h1 className="font-display text-display-2 font-semibold text-text-primary mb-2">
          Kho Nguyên Liệu
        </h1>
        <p className="text-sm text-text-secondary">
          Tra cứu toàn diện {all.length} nguyên liệu đột phá nhân vật, vũ khí và sách thiên phú.
        </p>
      </div>

      <MaterialListingClient initialMaterials={listingItems} locale={locale} />
    </div>
  );
}
