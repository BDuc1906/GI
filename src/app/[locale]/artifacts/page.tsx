import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import {
  ArtifactListingClient,
  type ArtifactListingItem,
} from "@/features/artifacts/components/ArtifactListingClient";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Artifacts" });
  return createLocalizedMetadata({
    locale,
    pathname: "artifacts",
    title: t("metaTitle"),
    description: t("metaDescription"),
  });
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function ArtifactsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Artifacts" });

  // Tải toàn bộ bộ Thánh Di Vật (khoảng 50 bộ) để lọc mượt mà ở client
  const sets = await withDbRetry(() =>
    prisma.artifactSet.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        nameTranslations: true,
        rarityRange: true,
        twoPieceBonus: true,
        fourPieceBonus: true,
        iconUrl: true,
      },
    })
  );

  const listingItems: ArtifactListingItem[] = sets.map((a) => ({
    id: a.id,
    name: a.name,
    localizedName: getLocalizedName(a, locale),
    rarityRange: a.rarityRange as number[],
    twoPieceBonus: a.twoPieceBonus,
    fourPieceBonus: a.fourPieceBonus,
    imageSrc: a.iconUrl,
  }));

  const breadcrumbs = [
    { name: "LEIBO", path: "/" },
    { name: t("title"), path: "/artifacts" },
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
            count: sets.length,
            b: (chunks) => (
              <span className="text-accent-bright font-semibold tabular-nums">
                {chunks}
              </span>
            ),
          })}
        </p>
      </div>

      <ArtifactListingClient initialSets={listingItems} locale={locale} />
    </div>
  );
}
