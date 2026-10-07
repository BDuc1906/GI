import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { EntityThumb } from "@/components/ui/EntityThumb";
import { createStaticPageMetadata } from "@/lib/seo/metadata";
import { imageFor } from "@/core/game/image-urls";
import gliderImages from "@/data/images/windgliders.json";

export const dynamic = "force-dynamic";

interface WindglidersPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createStaticPageMetadata(locale, "windgliders");
}

export default async function WindglidersPage({ params }: WindglidersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const windgliders = await withDbRetry(() =>
    prisma.windglider.findMany({
      select: { id: true, name: true, rarity: true, source: true },
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
      take: 200,
    })
  );

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-4">Dù lượn</h1>
        <p className="text-text-secondary mb-8">
          Danh sách dù lượn — tổng {windgliders.length} mẫu.
        </p>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {windgliders.map((glider) => (
            <li key={glider.id}>
              <article className="h-full flex gap-3 bg-bg-card border-2 border-border rounded-xl p-4 hover:border-accent-500 transition-all">
                <EntityThumb
                  candidates={imageFor(gliderImages, glider.id)}
                  alt={glider.name}
                  size="lg"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-text-primary">{glider.name}</h3>
                    {glider.rarity != null && (
                      <span className="text-rarity-5 text-sm">{"★".repeat(glider.rarity)}</span>
                    )}
                  </div>
                  {glider.source && <p className="text-xs text-text-muted">{glider.source}</p>}
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
