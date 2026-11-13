"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { SWARM_PERSONAS } from "@/agent/swarm";
import type { AgentRole } from "@/agent/swarm";
import type { SwarmExecutiveBriefing, AgentOpsReport } from "@/agent/ops/swarm-ops";

interface SwarmOpsDashboardProps {
  adminKey?: string;
}

export function SwarmOpsDashboard({ adminKey }: SwarmOpsDashboardProps) {
  const [briefing, setBriefing] = useState<SwarmExecutiveBriefing | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBriefing = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/swarm-ops");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || "Không thể tải báo cáo vận hành");
      }
      setBriefing(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBriefing();
  }, [fetchBriefing]);

  async function triggerReaudit() {
    try {
      setActionLoading(true);
      const res = await fetch("/api/admin/swarm-ops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminKey ? { Authorization: `Bearer ${adminKey}` } : {}),
        },
        body: JSON.stringify({ action: "audit" }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setBriefing(json.data);
      } else {
        // Fallback to GET if admin auth fails
        await fetchBriefing();
      }
    } catch {
      await fetchBriefing();
    } finally {
      setActionLoading(false);
    }
  }

  if (loading && !briefing) {
    return (
      <div className="bg-bg-card border border-border rounded-2xl p-6 text-center space-y-3">
        <div className="animate-spin text-3xl">🧭</div>
        <p className="text-sm text-text-secondary font-medium">
          Paimon và Đội Ngũ 5 AI Agent đang tiến hành rà soát vận hành toàn bộ website...
        </p>
      </div>
    );
  }

  if (error && !briefing) {
    return (
      <div className="bg-bg-card border border-rose-500/40 rounded-2xl p-6 text-center text-rose-400 text-sm">
        <p>Lỗi kiểm toán: {error}</p>
        <button
          onClick={fetchBriefing}
          className="mt-3 px-4 py-1.5 rounded-lg bg-bg-elevated border border-border text-xs text-text-primary hover:border-accent-500"
        >
          Thử Lại
        </button>
      </div>
    );
  }

  if (!briefing) return null;

  return (
    <div className="space-y-6">
      {/* Executive Command Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-accent-500/30 bg-gradient-to-r from-bg-card via-bg-elevated to-bg-card p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <h2 className="text-lg font-bold text-text-primary">
                Trung Tâm Tác Chiến & Vận Hành Độc Lập LEIBO AI Swarm
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                🟢 5/5 Agent Trực Tuyến
              </span>
            </div>
            <p className="text-xs text-text-muted max-w-2xl leading-relaxed">
              {briefing.coordinatorNoteVi}
            </p>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Score Ring */}
            <div className="flex items-center gap-2 bg-bg-card/80 border border-border rounded-xl px-3.5 py-2">
              <div className="text-2xl font-mono font-extrabold text-accent-bright">
                {briefing.overallHealthScore}
                <span className="text-xs font-normal text-text-muted">/100</span>
              </div>
              <div className="text-[11px] text-text-muted leading-tight">
                Chỉ số Sức Khỏe
                <br />
                <span className="text-emerald-400 font-semibold">Tác Chiến Tốt</span>
              </div>
            </div>

            <button
              type="button"
              onClick={triggerReaudit}
              disabled={actionLoading}
              className="px-4 py-2.5 rounded-xl bg-accent-500 text-white hover:bg-accent-bright font-semibold text-xs transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              {actionLoading ? "Đang Hội Chẩn…" : "⚡ Triệu Tập Kiểm Toán"}
            </button>
          </div>
        </div>
      </div>

      {/* 5 Specialists Operations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(Object.entries(briefing.reports) as Array<[AgentRole, AgentOpsReport]>).map(
          ([roleKey, report]) => {
            const persona = SWARM_PERSONAS[roleKey];
            const isHealthy = report.status === "healthy";

            return (
              <div
                key={roleKey}
                className="bg-bg-card border border-border rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-sm hover:border-accent-500/40 transition-colors"
                style={{ borderTop: `3px solid ${persona.accentColor}` }}
              >
                {/* Agent Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border shrink-0 bg-bg-elevated">
                      <Image
                        src={persona.avatarUrl}
                        alt={persona.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-bold text-text-primary">
                          {persona.name}
                        </h3>
                        <span
                          className="text-[10px] px-1.5 py-0.2 rounded font-semibold"
                          style={{
                            backgroundColor: `${persona.accentColor}20`,
                            color: persona.accentColor,
                          }}
                        >
                          {persona.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-text-muted">{persona.titleVi}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                      isHealthy
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {isHealthy ? "Chuẩn Xác" : "Cần Lưu Ý"}
                  </span>
                </div>

                {/* Summary */}
                <p className="text-xs text-text-secondary leading-relaxed">
                  {report.summaryVi}
                </p>

                {/* Metrics Table */}
                <div className="bg-bg-elevated/50 rounded-xl p-3 border border-border/70 space-y-1.5 text-xs">
                  {Object.entries(report.metrics).map(([mKey, mVal]) => (
                    <div key={mKey} className="flex items-center justify-between">
                      <span className="text-text-muted text-[11px]">{mKey}:</span>
                      <span className="font-medium text-text-primary font-mono text-[11px]">
                        {mVal}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                <div className="text-[11px] text-text-muted space-y-1 pt-1 border-t border-border/40">
                  <span className="font-semibold text-text-primary">Khuyến nghị chuyên gia:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-text-secondary">
                    {report.recommendationsVi.map((rec, rIdx) => (
                      <li key={rIdx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
