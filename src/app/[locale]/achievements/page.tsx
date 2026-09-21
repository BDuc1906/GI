import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/db/prisma";

interface AchievementsPageProps {
  params: Promise<{ locale: string }>;
}

export const dynamic = 'force-dynamic';

export default async function AchievementsPage({ params }: AchievementsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [achievements, groups] = await Promise.all([
    prisma.achievement.findMany({
      orderBy: { sortOrder: "asc" },
      take: 100,
    }),
    prisma.achievementGroup.findMany({
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-4">
          Achievements
        </h1>
        <p className="text-text-secondary mb-8">
          Complete list of achievements and rewards
        </p>

        <div className="mb-8">
          <h2 className="font-display text-2xl font-bold text-text-primary mb-4">
            Achievement Groups
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {groups.map((group) => (
              <div
                key={group.id}
                className="bg-bg-card border-2 border-border rounded-xl p-4 hover:border-gold/50 transition-all"
              >
                <h3 className="font-semibold text-text-primary">
                  {group.name}
                </h3>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="font-display text-2xl font-bold text-text-primary mb-4">
            Achievements (showing first 100)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`bg-bg-card border-2 rounded-xl p-4 hover:border-gold/50 transition-all ${
                  achievement.isHidden ? "border-yellow-500/50" : "border-border"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold text-text-primary">
                    {achievement.name}
                  </h3>
                  {achievement.isHidden && (
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                      Hidden
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}