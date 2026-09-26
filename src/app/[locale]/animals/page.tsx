import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";

interface AnimalsPageProps {
  params: Promise<{ locale: string }>;
}

export const dynamic = "force-dynamic";

/**
 * BỔ SUNG (2026-09-22): model `Animal` đã có DB + dữ liệu (seed qua
 * `seedAnimals()`) nhưng CHƯA TỪNG có trang hiển thị. Xem comment ở
 * crafts/page.tsx — cùng lý do, cùng pattern.
 */
export default async function AnimalsPage({ params }: AnimalsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const animals = await prisma.animal.findMany({
    orderBy: [{ categoryType: "asc" }, { sortOrder: "asc" }],
    take: 200,
  });

  const grouped = new Map<string, typeof animals>();
  for (const animal of animals) {
    const key = animal.categoryText || animal.categoryType || "Khác";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(animal);
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-4">
          Động vật &amp; Sinh vật
        </h1>
        <p className="text-text-secondary mb-8">
          Danh sách động vật, quái vật hiền hoà trong thế giới mở — tổng {animals.length} loài.
        </p>

        {Array.from(grouped.entries()).map(([category, items]) => (
          <div key={category} className="mb-8">
            <h2 className="font-display text-xl font-bold text-text-primary mb-4">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((animal) => (
                <div
                  key={animal.id}
                  className="bg-bg-card border-2 border-border rounded-xl p-4 hover:border-gold/50 transition-all"
                >
                  <h3 className="font-semibold text-text-primary">{animal.name}</h3>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
