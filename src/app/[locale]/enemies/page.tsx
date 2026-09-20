import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";

interface EnemiesPageProps {
  params: Promise<{ locale: string }>;
}

interface EnemyRawData {
  monsterType?: string;
  enemyType?: string;
  categoryType?: string;
  [key: string]: unknown;
}

export const dynamic = 'force-dynamic';

export default async function EnemiesPage({ params }: EnemiesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const enemies = await prisma.enemy.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-4">
          Enemies
        </h1>
        <p className="text-text-secondary mb-8">
          Complete list of enemies in the game
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {enemies.map((enemy) => (
            <div
              key={enemy.id}
              className="bg-bg-card border-2 border-border rounded-xl p-4 hover:border-gold/50 transition-all"
            >
              <h3 className="font-semibold text-text-primary mb-2">
                {enemy.name}
              </h3>
              {enemy.raw && (
                <div className="space-y-1 text-xs text-text-secondary">
                  {(enemy.raw as EnemyRawData).monsterType && (
                    <div>
                      <span className="font-medium">Type: </span>
                      {String((enemy.raw as EnemyRawData).monsterType)}
                    </div>
                  )}
                  {(enemy.raw as EnemyRawData).enemyType && (
                    <div>
                      <span className="font-medium">Enemy: </span>
                      {String((enemy.raw as EnemyRawData).enemyType)}
                    </div>
                  )}
                  {(enemy.raw as EnemyRawData).categoryType && (
                    <div>
                      <span className="font-medium">Category: </span>
                      {String((enemy.raw as EnemyRawData).categoryType)}
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