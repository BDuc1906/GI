import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";
import Image from "next/image";

interface MaterialsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function MaterialsPage({ params }: MaterialsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const materials = await prisma.material.findMany({
    orderBy: { name: "asc" },
    take: 100,
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-4">
          Materials
        </h1>
        <p className="text-text-secondary mb-8">
          Complete list of ascension and upgrade materials
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {materials.map((material) => (
            <div
              key={material.id}
              className="bg-bg-card border-2 border-border rounded-xl p-4 hover:border-gold/50 transition-all text-center"
            >
              {material.iconUrl && (
                <div className="w-12 h-12 mx-auto mb-2 relative">
                  <Image
                    src={material.iconUrl}
                    alt={material.name}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <h3 className="font-semibold text-text-primary text-sm">
                {material.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}