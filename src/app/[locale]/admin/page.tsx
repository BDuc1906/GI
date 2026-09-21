// src/app/admin/page.tsx
/**
 * Trang quản trị — dashboard cho pipeline crawl/seed + điều khiển AI
 * Agent (fix/sync) + lịch sử thay đổi dữ liệu.
 *
 * UI đơn giản, hiện đại 2026 - không fancy effects, không màu mè
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { StatsCards } from "@/components/admin/StatsCards";
import { AgentControlPanel } from "@/components/admin/AgentControlPanel";
import { DataHealth, type FixScanSummary } from "@/components/admin/DataHealth";
import { RecentActivity } from "@/components/admin/RecentActivity";

const ADMIN_KEY_STORAGE = "leibo_admin_key";

interface PipelineRun {
  id: string;
  name: string;
  status: "started" | "success" | "failed";
  startedAt: string;
  durationMs: number | null;
  error: string | null;
}

interface LatestStatus {
  [name: string]: { status: string; startedAt: string; id: string };
}

function formatDuration(ms: number | null): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

export default function AdminPage() {
  const t = useTranslations("Admin");
  const locale = useLocale();

  const PIPELINE_LABELS: Record<string, string> = {
    crawl: t("pipelineCrawl"),
    seed: t("pipelineSeed"),
    mirror: t("pipelineMirror"),
    "update-data": t("pipelineUpdateData"),
    "agent-sync": t("pipelineAgentSync"),
  };

  const [adminKey, setAdminKey] = useState("");
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [latestStatus, setLatestStatus] = useState<LatestStatus>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFixResult, setLastFixResult] = useState<FixScanSummary | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const saved = window.localStorage.getItem(ADMIN_KEY_STORAGE);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setAdminKey(saved);
  }, []);

  const handleAdminKeyChange = useCallback((key: string) => {
    setAdminKey(key);
    window.localStorage.setItem(ADMIN_KEY_STORAGE, key);
  }, []);

  const fetchPipelineStatus = useCallback(async () => {
    if (!adminKey) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/pipeline-status?limit=50", {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      const body = await res.json();
      if (!res.ok || !body.success) throw new Error(body?.error?.message || `HTTP ${res.status}`);
      setRuns(body.data.runs || []);
      setLatestStatus(body.data.latestStatus || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [adminKey]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPipelineStatus();
    const interval = setInterval(fetchPipelineStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchPipelineStatus, refreshToken]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-bg-card border border-border rounded-xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-gold-bright mb-2">
                📊 {t("title")}
              </h1>
              <p className="text-sm text-text-secondary font-medium">{t("subtitle")}</p>
            </div>
            <button
              onClick={() => setRefreshToken(Date.now())}
              className="px-6 py-3 bg-bg-input border border-border rounded-lg hover:border-border-strong transition-colors text-sm font-semibold"
            >
              🔄 {t("refresh")}
            </button>
          </div>
        </div>

        {/* Alert Messages */}
        {!adminKey && (
          <div className="bg-bg-card border border-border rounded-xl p-4 mb-6 text-sm text-text-secondary">
            {t("enterAdminKeyHint")}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-sm text-red-400">
            ⚠️ {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gold-bright rounded-full" />
            <h2 className="font-display text-xl font-semibold text-text-primary">
              {t("statsOverview")}
            </h2>
          </div>
          <StatsCards latestStatus={latestStatus} />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-electro-glow rounded-full" />
              <h2 className="font-display text-xl font-semibold text-text-primary">
                {t("agentControlTitle")}
              </h2>
            </div>
            <AgentControlPanel
              adminKey={adminKey}
              onAdminKeyChange={handleAdminKeyChange}
              onActionComplete={() => setRefreshToken(Date.now())}
              onFixResult={setLastFixResult}
            />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-dendro-glow rounded-full" />
              <h2 className="font-display text-xl font-semibold text-text-primary">
                {t("lastScanResult")}
              </h2>
            </div>
            <DataHealth lastScan={lastFixResult} />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-hydro-glow rounded-full" />
            <h2 className="font-display text-xl font-semibold text-text-primary">
              {t("agentAuditHistory")}
            </h2>
          </div>
          <RecentActivity adminKey={adminKey} refreshToken={refreshToken} />
        </div>

        {/* Pipeline History */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-geo-glow rounded-full" />
            <h2 className="font-display text-xl font-semibold text-text-primary">
              📋 {t("pipelineHistory", { count: runs.length })} {loading && <span className="text-text-muted normal-case">— {t("loading")}</span>}
            </h2>
          </div>
          
          <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-bg-secondary">
                  <tr>
                    <th className="px-4 py-3 text-left text-text-secondary font-medium tracking-wider uppercase text-xs">
                      {t("colPipeline")}
                    </th>
                    <th className="px-4 py-3 text-left text-text-secondary font-medium tracking-wider uppercase text-xs">
                      {t("colStatus")}
                    </th>
                    <th className="px-4 py-3 text-left text-text-secondary font-medium tracking-wider uppercase text-xs">
                      {t("colStartedAt")}
                    </th>
                    <th className="px-4 py-3 text-left text-text-secondary font-medium tracking-wider uppercase text-xs">
                      {t("colDuration")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => {
                    const statusColor = run.status === "success" ? "text-green-400" : run.status === "failed" ? "text-red-400" : "text-yellow-400";
                    
                    return (
                      <tr 
                        key={run.id} 
                        className="border-t border-border hover:bg-bg-secondary/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-text-primary font-medium">{PIPELINE_LABELS[run.name] || run.name}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                            {run.status === "success" && "✨"}
                            {run.status === "failed" && "💥"}
                            {run.status === "started" && "⚡"}
                            {run.status === "success" && t("statusSuccess")}
                            {run.status === "failed" && t("statusFailed")}
                            {run.status === "started" && t("statusRunning")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-text-secondary">
                          {new Date(run.startedAt).toLocaleString(locale, { hour12: false })}
                        </td>
                        <td className="px-4 py-3 text-text-secondary font-mono">{formatDuration(run.durationMs)}</td>
                      </tr>
                    );
                  })}
                  {!loading && runs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-text-muted font-medium">
                        {adminKey ? t("noRunsYet") : t("enterAdminKeyToView")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-text-muted mt-8 mb-4 font-medium">
          {t("autoRefreshNote")}
        </div>
      </div>
    </div>
  );
}