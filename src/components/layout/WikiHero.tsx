"use client";

import { Link } from "@/i18n/navigation";
import { KazuhaMapleLeaves } from "@/components/effects/KazuhaMapleLeaves";
import { useTranslations } from "next-intl";

export function WikiHero() {
  const tHome = useTranslations("Home");
  const tNavigation = useTranslations("Navigation");
  const tTools = useTranslations("Tools");

  return (
    <section className="relative overflow-hidden border-b border-border/50 bg-bg-primary">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute -top-40 left-1/4 h-[600px] w-[600px] rounded-full opacity-25 blur-[140px]"
          style={{ background: "radial-gradient(circle, var(--accent-500) 0%, transparent 70%)" }}
        />
        <div
          className="absolute right-0 top-10 h-[550px] w-[550px] rounded-full opacity-20 blur-[150px]"
          style={{ background: "radial-gradient(circle, var(--accent-bright) 0%, transparent 70%)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-bg-primary/50 to-bg-primary" />
      </div>
      <KazuhaMapleLeaves />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-20">
        <div className="max-w-2xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-accent-bright">
            {tHome("toolEnkaTitle")}
          </p>
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-text-primary sm:text-4xl md:text-5xl">
            {tHome("buildReviewTitle")}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-text-secondary md:text-lg">
            {tHome("buildReviewDescription")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/tools/enka-sync"
              className="btn-primary inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold shadow-sm"
            >
              {tHome("toolEnkaTitle")}
            </Link>
            <Link
              href="/tools/dps-calculator"
              className="btn-secondary inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold hover:border-accent-500/60"
            >
              {tHome("toolDamageTitle")}
            </Link>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <Link href="/wiki" className="text-text-muted transition-colors hover:text-accent-bright">
              {tNavigation("title")} →
            </Link>
            <Link href="/tools" className="text-text-muted transition-colors hover:text-accent-bright">
              {tTools("title")} →
            </Link>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-lg">
          <div className="absolute -inset-5 rounded-[2rem] bg-accent-500/10 blur-2xl" />
          <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-bg-card/90 p-5 shadow-2xl backdrop-blur-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between border-b border-border/60 pb-4">
              <span className="text-sm font-semibold text-text-primary">{tHome("toolEnkaTitle")}</span>
              <span className="rounded-full border border-accent-500/30 bg-accent-500/10 px-2.5 py-1 text-[10px] font-semibold text-accent-bright">
                UID
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-bg-elevated/60 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-500/15 text-sm font-bold text-accent-bright">1</span>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{tHome("toolEnkaTitle")}</p>
                  <p className="text-xs text-text-muted">{tHome("toolEnkaDescription")}</p>
                </div>
              </div>
              <div className="ml-7 h-4 border-l border-dashed border-accent-500/50" />
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-bg-elevated/60 p-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-500/15 text-sm font-bold text-accent-bright">2</span>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{tHome("toolDamageTitle")}</p>
                  <p className="text-xs text-text-muted">{tHome("toolDamageDescription")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}