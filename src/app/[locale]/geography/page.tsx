import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";

interface GeographyPageProps {
  params: Promise<{ locale: string }>;
}

interface GeographyRawData {
  regionName?: string;
  areaName?: string;
  [key: string]: unknown;
}

export const dynamic = 'force-dynamic';

export default async function GeographyPage({ params }: GeographyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const geographies = await prisma.geography.findMany({
    orderBy: { regionName: "asc" },
    take: 100,
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-4">
          Geography
        </h1>
        <p className="text-text-secondary mb-8">
          Complete list of locations in the game
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {geographies.map((geo) => (
            <div
              key={geo.id}
              className="bg-bg-card border-2 border-border rounded-xl p-4 hover:border-gold/50 transition-all"
            >
              <h3 className="font-semibold text-text-primary mb-2">
                {geo.name}
              </h3>
              {geo.raw && (
                <div className="space-y-1 text-xs text-text-secondary">
                  {(geo.raw as GeographyRawData).regionName && (
                    <div>
                      <span className="font-medium">Region: </span>
                      {String((geo.raw as GeographyRawData).regionName)}
                    </div>
                  )}
                  {(geo.raw as GeographyRawData).areaName && (
                    <div>
                      <span className="font-medium">Area: </span>
                      {String((geo.raw as GeographyRawData).areaName)}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}