import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";

interface FoodPageProps {
  params: Promise<{ locale: string }>;
}

interface FoodRawData {
  foodtype?: string;
  filterType?: string;
  [key: string]: unknown;
}

export const dynamic = 'force-dynamic';

export default async function FoodPage({ params }: FoodPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const foods = await prisma.food.findMany({
    orderBy: { rarity: "desc" },
    take: 100,
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-4">
          Food
        </h1>
        <p className="text-text-secondary mb-8">
          Complete list of food and recipes
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {foods.map((food) => (
            <div
              key={food.id}
              className="bg-bg-card border-2 border-border rounded-xl p-4 hover:border-gold/50 transition-all"
            >
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-text-primary">
                  {food.name}
                </h3>
                {food.rarity && (
                  <span className="text-gold-bright">{'★'.repeat(food.rarity)}</span>
                )}
              </div>
              {food.raw && (
                <div className="space-y-1 text-xs text-text-secondary">
                  {(food.raw as FoodRawData).foodtype && (
                    <div>
                      <span className="font-medium">Type: </span>
                      {String((food.raw as FoodRawData).foodtype)}
                    </div>
                  )}
                  {(food.raw as FoodRawData).filterType && (
                    <div>
                      <span className="font-medium">Filter: </span>
                      {String((food.raw as FoodRawData).filterType)}
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