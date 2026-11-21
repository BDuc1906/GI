// src/app/admin/page.tsx
/**
 * Trang quản trị — dashboard cho pipeline crawl/seed + điều khiển AI
 * Agent (fix/sync) + lịch sử thay đổi dữ liệu.
 *
 * UI đơn giản, hiện đại 2026 - không fancy effects, không màu mè
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { StatsCards } from "@/features/admin/StatsCards";
import { AgentControlPanel } from "@/features/admin/AgentControlPanel";
import { DataHealth, type FixScanSummary } from "@/features/admin/DataHealth";
import { RecentActivity } from "@/features/admin/RecentActivity";
import { SwarmOpsDashboard } from "@/features/admin/SwarmOpsDashboard";
import { DataOpsSwarmDashboard } from "@/features/admin/DataOpsSwarmDashboard";
import { useAdminAuth } from "@/features/admin/useAdminAuth";
import { AdminLoginForm } from "@/features/admin/AdminLoginForm";

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
  const { isAuthenticated, loading: authLoading, error: authError, login, logout } = useAdminAuth();

  const PIPELINE_LABELS: Record<string, string> = {
    crawl: t("pipelineCrawl"),
    seed: t("pipelineSeed"),
    mirror: t("pipelineMirror"),
    "update-data": t("pipelineUpdateData"),
    "agent-sync": t("pipelineAgentSync"),
  };

  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [latestStatus, setLatestStatus] = useState<LatestStatus>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFixResult, setLastFixResult] = useState<FixScanSummary | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  const fetchPipelineStatus = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/pipeline-status?limit=50", {
        credentials: "same-origin",
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
  }, [isAuthenticated]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPipelineStatus();
    const interval = setInterval(fetchPipelineStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchPipelineStatus, refreshToken]);

  if (authLoading && isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-text-secondary text-sm">
          <div className="w-5 h-5 border-2 border-gold-bright border-t-transparent rounded-full animate-spin" />
          <span>Đang kiểm tra phiên quản trị bảo mật...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="font-display text-3xl font-bold text-gold-bright mb-1">{t("title")}</h1>
            <p className="text-sm text-text-secondary">{t("subtitle")}</p>
          </div>
          <AdminLoginForm onLogin={login} loading={authLoading} error={authError} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-bg-card border border-border rounded-xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs uppercase tracking-wider font-mono text-emerald-400 font-semibold">
                  Secure Admin Session Active
                </span>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-gold-bright mb-2">
                {t("title")}
              </h1>
              <p className="text-sm text-text-secondary font-medium">{t("subtitle")}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/admin/agents"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent-500/20 border border-accent-500/40 text-accent-bright rounded-lg hover:bg-accent-500/30 transition-colors text-sm font-semibold"
              >
                <span>🤖 Agent Control Center</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-accent-500/30 font-mono">Harness</span>
              </Link>
              <Link
                href="/admin/data-quality"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-500/20 border border-blue-500/40 text-blue-200 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-semibold"
              >
                <span>📊 Data Quality</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/30 font-mono">Trust</span>
              </Link>
              <Link
                href="/admin/builds"
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 rounded-lg hover:bg-emerald-500/30 transition-colors text-sm font-semibold"
              >
                <span>🛡️ Build Review &amp; Coverage</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/30 font-mono">KQM</span>
              </Link>
              <button
                onClick={() => setRefreshToken(Date.now())}
                className="px-4 py-2.5 bg-bg-input border border-border rounded-lg hover:border-border-strong transition-colors text-sm font-semibold"
              >
                {t("refresh")}
              </button>
              <button
                onClick={logout}
                className="px-4 py-2.5 bg-danger/10 border border-danger/30 text-danger hover:bg-danger/20 rounded-lg transition-colors text-sm font-semibold"
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-danger/10 border border-danger/30 rounded-xl p-4 mb-6 text-sm text-danger">
            {error}
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

        {/* AI Agent Continuous DataOps Pipeline (A2A Swarm) */}
        <div className="mb-8">
          <DataOpsSwarmDashboard />
        </div>

        {/* AI Agent Swarm Autonomous Site Operations */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-accent-500 rounded-full" />
            <h2 className="font-display text-xl font-semibold text-text-primary">
              Đội Ngũ AI Agent Vận Hành Hệ Thống (Swarm Operations)
            </h2>
          </div>
          <SwarmOpsDashboard />
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
              isAuthenticated={isAuthenticated}
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
          <RecentActivity isAuthenticated={isAuthenticated} refreshToken={refreshToken} />
        </div>

        {/* Pipeline History */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-geo-glow rounded-full" />
            <h2 className="font-display text-xl font-semibold text-text-primary">
              {t("pipelineHistory", { count: runs.length })} {loading && <span className="text-text-muted normal-case">— {t("loading")}</span>}
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
                    const statusColor = run.status === "success" ? "text-success" : run.status === "failed" ? "text-danger" : "text-warning";
                    
                    return (
                      <tr 
                        key={run.id} 
                        className="border-t border-border hover:bg-bg-secondary/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-text-primary font-medium">{PIPELINE_LABELS[run.name] || run.name}</td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-semibold ${statusColor}`}>
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
                        {t("noRunsYet")}
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
