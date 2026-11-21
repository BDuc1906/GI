"use client";

import Link from "next/link";
import { EntityThumb } from "@/components/ui/EntityThumb";

interface EnemyCardProps {
  id: string;
  name: string;
  specialName?: string | null;
  typeLabel?: string | null;
  categoryLabel?: string | null;
  enemyType?: string | null;
  candidates: string[];
}

export function EnemyCard({
  id,
  name,
  specialName,
  typeLabel,
  categoryLabel,
  enemyType,
  candidates,
}: EnemyCardProps) {
  const isBoss = enemyType === "BOSS";
  const isElite = enemyType === "ELITE";

  return (
    <Link
      href={`/enemies/${id}`}
      className="group relative flex items-center gap-3.5 h-full rounded-2xl border border-border/80 bg-bg-card hover:bg-bg-elevated/90 hover:border-border-strong hover:shadow-md transition-all duration-200 p-3.5 sm:p-4 focus:outline-none focus:ring-2 focus:ring-accent-500/40"
    >
      {/* ── THUMBNAIL ── */}
      <div className="shrink-0 rounded-xl overflow-hidden border border-border/60 bg-bg-elevated/70 p-1 group-hover:scale-105 transition-transform duration-300">
        <EntityThumb
          candidates={candidates}
          alt={name}
          size="md"
          className="!rounded-lg"
        />
      </div>

      {/* ── THÔNG TIN KẺ ĐỊCH ── */}
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <h3
            className="font-semibold text-sm sm:text-base text-text-primary group-hover:text-accent-bright transition-colors truncate"
            title={name}
          >
            {name}
          </h3>
          {typeLabel && (
            <span
              className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                isBoss
                  ? "bg-red-500/15 text-red-400 border-red-500/30"
                  : isElite
                  ? "bg-purple-500/15 text-purple-400 border-purple-500/30"
                  : "bg-blue-500/15 text-blue-400 border-blue-500/30"
              }`}
            >
              {typeLabel}
            </span>
          )}
        </div>

        {specialName && (
          <p className="text-xs text-text-muted truncate">
            {specialName}
          </p>
        )}

        {categoryLabel && (
          <p className="text-[11px] text-text-muted/80 truncate">
            {categoryLabel}
          </p>
        )}
      </div>
    </Link>
  );
}
