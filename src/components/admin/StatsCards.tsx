// src/components/admin/StatsCards.tsx
"use client";

import { useTranslations, useLocale } from "next-intl";

interface LatestStatusEntry {
  status: string;
  startedAt: string;
  id: string;
}

interface StatsCardsProps {
  latestStatus: Record<string, LatestStatusEntry>;
}

const STATUS_TEXT_CLASS: Record<string, string> = {
  started: "text-yellow-400",
  success: "text-green-400",
  failed: "text-red-400",
};

export function StatsCards({ latestStatus }: StatsCardsProps) {
  const t = useTranslations("Admin");
  const locale = useLocale();

  const PIPELINE_LABELS: Record<string, string> = {
    crawl: t("pipelineCrawl"),
    seed: t("pipelineSeed"),
    mirror: t("pipelineMirror"),
    "update-data": t("pipelineUpdateData"),
    "agent-sync": t("pipelineAgentSync"),
  };

  const STATUS_LABEL: Record<string, string> = {
    started: `⚡ ${t("statusRunning")}`,
    success: `✨ ${t("statusSuccess")}`,
    failed: `💥 ${t("statusFailed")}`,
  };

  function formatTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString(locale, { hour12: false });
  }

  const pipelineNames = Object.keys(latestStatus);

  if (pipelineNames.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-xl p-6 text-center text-text-muted text-sm font-medium">
        {t("noRunsYet")}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {pipelineNames.map((name) => {
        const entry = latestStatus[name];
        const statusColor = STATUS_TEXT_CLASS[entry.status] || "text-text-muted";
        
        return (
          <div 
            key={name} 
            className="bg-bg-card border border-border rounded-xl p-4"
          >
            <div className="text-xs text-text-secondary uppercase tracking-wider font-semibold mb-2">
              {PIPELINE_LABELS[name] || name}
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-semibold ${statusColor}`}>
                {STATUS_LABEL[entry.status] || entry.status}
              </span>
              {entry.status === "started" && (
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              )}
            </div>
            <div className="text-[10px] text-text-muted mt-1">{formatTime(entry.startedAt)}</div>
          </div>
        );
      })}
    </div>
  );
}