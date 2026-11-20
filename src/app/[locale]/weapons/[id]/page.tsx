/**
 * src/app/[locale]/weapons/[id]/page.tsx
 *
 * Route Controller cho trang chi tiết Vũ Khí.
 * Tuân thủ Single Responsibility Principle (SRP): Chỉ xử lý routing, SEO metadata,
 * gọi service phân giải dữ liệu và ủy quyền hiển thị cho WeaponDetailView.
 */

import { prisma } from "@/lib/db/prisma";
import { getWeaponById } from "@/lib/db/cached-queries";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { getLocalizedDescription } from "@/lib/i18n/localized-content";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { getWeaponDetailPageData } from "@/features/weapons/services/weapon-detail-service";
import { WeaponDetailView } from "@/features/weapons/components/WeaponDetailView";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const weapons = await prisma.weapon.findMany({ select: { id: true } });
    return weapons.flatMap((w) => [
      { locale: "vi", id: w.id },
      { locale: "en", id: w.id },
    ]);
  } catch {
    return [];
  }
}

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

async function tWeaponTypeMeta(type: string, locale: string): Promise<string> {
  const t = await getTranslations({ locale, namespace: "WeaponType" });
  return t(type as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "WeaponDetail" });
  const w = await getWeaponById(id);
  if (!w) {
    return createLocalizedMetadata({
      locale,
      pathname: `weapons/${id}`,
      title: t("notFoundTitle"),
      robots: { index: false, follow: false },
    });
  }
  return createLocalizedMetadata({
    locale,
    pathname: `weapons/${id}`,
    title: `${getLocalizedName(w, locale)} — LEIBO`,
    description:
      getLocalizedDescription(w, locale) ??
      t("metaDescriptionFallback", {
        type: await tWeaponTypeMeta(w.type, locale),
        rarity: w.rarity,
      }),
  });
}

export default async function WeaponDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const data = await getWeaponDetailPageData(id, locale);
  if (!data) return notFound();

  return <WeaponDetailView data={data} locale={locale} />;
}
