"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

/**
 * Hero đơn giản, hiện đại 2026 cho trang chủ LEIBO
 * - Không animation phức tạp
 * - Không glow theo chuột
 * - Clean typography
 * - Fast load time
 */

const TITLE = "LEIBO";

interface HomeHeroStat {
  label: string;
  count: number;
}

export function HomeHero({ stats }: { stats?: HomeHeroStat[] }) {
  const t = useTranslations("Hero");

  return (
    <section className="relative text-center py-16 md:py-24">
      <div className="relative z-10">
        <h1 className="font-display text-5xl md:text-7xl font-bold text-gold-bright">
          {TITLE}
        </h1>

        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mt-6">
          {t("tagline")}
        </p>
        <p className="text-sm text-text-muted max-w-xl mx-auto mt-3">
          {t("description")}
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-10">
          <Link
            href="/characters"
            className="px-8 py-3 bg-gold text-text-inverted font-semibold rounded-full shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            {t("exploreCharacters")}
          </Link>
          <Link
            href="/weapons"
            className="px-8 py-3 border border-border text-text-secondary font-semibold rounded-full transition-all hover:border-gold hover:text-gold-bright"
          >
            {t("weaponArsenal")}
          </Link>
        </div>

        {stats && stats.length > 0 && (
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 mt-12">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-2xl md:text-3xl font-semibold text-gold-bright">
                  {s.count}+
                </div>
                <div className="text-xs md:text-sm text-text-muted mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}