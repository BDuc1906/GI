import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getCharacterListing, parseCharacterFilters } from "@/features/characters/listing";
import { CharacterFilterBar } from "@/components/character/CharacterFilterBar";
import { CharacterListingGrid } from "@/components/character/CharacterListingGrid";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Characters" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ vision?: string; weapon?: string; region?: string; rarity?: string; q?: string }>;
}

export default async function CharactersPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  // Bắt buộc gọi lại ở mỗi page (không chỉ [locale]/layout.tsx) khi dùng
  // static rendering — nếu không, locale có thể "lẫn" giữa các bản build
  // song song của nhiều ngôn ngữ, khiến trang luôn hiện 1 ngôn ngữ cố định
  // (đây chính là nguyên nhân toàn bộ nội dung trang này bị hardcode
  // tiếng Việt trước khi sửa).
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Characters" });

  const filters = parseCharacterFilters(await searchParams);
  const listing = await getCharacterListing(filters);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-7">
        <h1 className="font-display text-display-2 font-semibold text-text-primary mb-2">{t("title")}</h1>
        <p className="text-sm text-text-secondary">
          {t.rich("foundCount", {
            count: listing.displayCount,
            b: (chunks) => <span className="text-accent-bright font-semibold">{chunks}</span>,
          })}
        </p>
      </div>

      <CharacterFilterBar
        locale={locale}
        filters={filters}
        visionRows={listing.visionRows}
        regionRows={listing.regionRows}
        weaponTypes={listing.weaponTypes}
      />

      <CharacterListingGrid locale={locale} grouping={listing} />
    </div>
  );
}
