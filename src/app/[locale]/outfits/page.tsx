import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { createStaticPageMetadata } from "@/lib/seo/metadata";

interface OutfitsPageProps {
  params: Promise<{ locale: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createStaticPageMetadata(locale, "outfits");
}

export default async function OutfitsPage({ params }: OutfitsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const outfits = await prisma.outfit.findMany({
    orderBy: [{ characterName: "asc" }, { name: "asc" }],
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-4">
          Trang phục
        </h1>
        <p className="text-text-secondary mb-8">
          Danh sách trang phục nhân vật — tổng {outfits.length} mẫu.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {outfits.map((outfit) => (
            <div
              key={outfit.id}
              className="bg-bg-card border-2 border-border rounded-xl p-4 hover:border-gold/50 transition-all"
            >
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-text-primary">{outfit.name}</h3>
                {outfit.isDefault && (
                  <span className="px-2 py-0.5 bg-border text-text-muted text-xs rounded-full">
                    Mặc định
                  </span>
                )}
              </div>
              {outfit.characterName && (
                <p className="text-sm text-text-secondary">{outfit.characterName}</p>
              )}
              {outfit.source && (
                <p className="text-xs text-text-muted mt-1">{outfit.source}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
