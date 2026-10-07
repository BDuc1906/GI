import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { Link } from "@/i18n/navigation";
import { EntityThumb } from "@/components/ui/EntityThumb";
import { createStaticPageMetadata } from "@/lib/seo/metadata";
import { imageFor } from "@/lib/game/image-urls";
import outfitImages from "@/data/images/outfits.json";

export const dynamic = "force-dynamic";

interface OutfitsPageProps {
  params: Promise<{ locale: string }>;
}

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

  const [outfits, characters] = await withDbRetry(() =>
    Promise.all([
      prisma.outfit.findMany({
        select: { id: true, name: true, characterId: true, characterName: true, isDefault: true, source: true },
        orderBy: [{ characterName: "asc" }, { name: "asc" }],
      }),
      // Để tạo link sang trang nhân vật (khớp theo tên tiếng Anh).
      prisma.character.findMany({ select: { id: true, name: true } }),
    ])
  );
  const charByName = new Map(characters.map((c) => [c.name, c.id]));

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-4">Trang phục</h1>
        <p className="text-text-secondary mb-8">
          Danh sách trang phục nhân vật — tổng {outfits.length} mẫu.
        </p>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {outfits.map((outfit) => {
            const charId = outfit.characterName ? charByName.get(outfit.characterName) : undefined;
            return (
              <li key={outfit.id}>
                <article className="h-full flex gap-3 bg-bg-card border-2 border-border rounded-xl p-4 hover:border-accent-500 transition-all">
                  <EntityThumb
                    candidates={imageFor(outfitImages, outfit.id)}
                    alt={outfit.name}
                    size="lg"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-text-primary">{outfit.name}</h3>
                      {outfit.isDefault && (
                        <span className="px-2 py-0.5 bg-border text-text-muted text-xs rounded-full">
                          Mặc định
                        </span>
                      )}
                    </div>
                    {outfit.characterName &&
                      (charId ? (
                        <Link
                          href={`/characters/${charId}`}
                          className="text-sm text-text-secondary hover:text-accent-bright underline"
                        >
                          {outfit.characterName}
                        </Link>
                      ) : (
                        <p className="text-sm text-text-secondary">{outfit.characterName}</p>
                      ))}
                    {outfit.source && <p className="text-xs text-text-muted mt-1">{outfit.source}</p>}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
