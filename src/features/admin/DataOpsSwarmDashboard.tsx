"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import type { ContinuousDataOpsReport } from "@/agent/swarm/data-ops-swarm";

interface DataOpsSwarmDashboardProps {
  adminKey?: string;
}

const AGENT_AVATARS: Record<string, string> = {
  Paimon: "/local-genshin-assets/characters/icons/paimon.png",
  Albedo: "/local-genshin-assets/characters/icons/albedo.png",
  Keqing: "/local-genshin-assets/characters/icons/keqing.png",
  Zhongli: "/local-genshin-assets/characters/icons/zhongli.png",
};

const AGENT_COLORS: Record<string, { badge: string; border: string; glow: string }> = {
  Paimon: { badge: "bg-amber-400/20 text-amber-300 border-amber-400/40", border: "hover:border-amber-400/60", glow: "from-amber-500/10" },
  Albedo: { badge: "bg-sky-400/20 text-sky-300 border-sky-400/40", border: "hover:border-sky-400/60", glow: "from-sky-500/10" },
  Keqing: { badge: "bg-purple-400/20 text-purple-300 border-purple-400/40", border: "hover:border-purple-400/60", glow: "from-purple-500/10" },
  Zhongli: { badge: "bg-amber-500/20 text-amber-400 border-amber-500/40", border: "hover:border-amber-500/60", glow: "from-amber-600/10" },
};

export function DataOpsSwarmDashboard({ adminKey }: DataOpsSwarmDashboardProps) {
  const [report, setReport] = useState<ContinuousDataOpsReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [runningPipeline, setRunningPipeline] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/data-ops/pipeline");
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || "Không thể tải báo cáo pipeline DataOps");
      }
      setReport(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    async function init() {
      try {
        const res = await fetch("/api/admin/data-ops/pipeline");
        const json = await res.json();
        if (!ignore) {
          if (!res.ok || !json.success) {
            throw new Error(json?.error?.message || "Không thể tải báo cáo pipeline DataOps");
          }
          setReport(json.data);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : String(err));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    init();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleTriggerPipeline() {
    try {
      setRunningPipeline(true);
      setError(null);
      const res = await fetch("/api/admin/data-ops/pipeline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(adminKey ? { Authorization: `Bearer ${adminKey}` } : {}),
        },
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setReport(json.data);
      } else {
        // Fallback to GET read-only run if not admin authorized
        await fetchStatus();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunningPipeline(false);
    }
  }

  return (
    <div className="bg-bg-card border border-border/80 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-display text-xl sm:text-2xl font-bold text-text-primary">
              Quy Trình Liên Tục Đội Ngũ AI Agent (A2A Continuous DataOps)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Quy trình phối hợp khép kín 4 tầng giữa các chuyên gia AI:{" "}
            <strong>Paimon</strong> (Lấy) &rarr; <strong>Albedo</strong> (Lọc) &rarr;{" "}
            <strong>Keqing</strong> (Kiểm định) &rarr; <strong>Zhongli</strong> (Cập nhật & Xuất bản).
          </p>
        </div>

        <button
          onClick={handleTriggerPipeline}
          disabled={runningPipeline || loading}
          className="btn-anemo px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-2 self-start sm:self-auto shrink-0 shadow-sm disabled:opacity-50"
        >
          {runningPipeline ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              <span>Đang thực thi quy trình...</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              <span>Kích hoạt quy trình liên tục</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-xs sm:text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Overview Status Banner */}
      {report && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-bg-elevated/70 border border-border/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  report.overallStatus === "success"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                    : report.overallStatus === "warning"
                      ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                      : "bg-red-500/20 text-red-400 border border-red-500/40"
                }`}
              >
                {report.overallStatus === "success"
                  ? "✓ TOÀN VẸN 100%"
                  : report.overallStatus === "warning"
                    ? "⚠ CẢNH BÁO NHẸ"
                    : "✕ PHÁT HIỆN LỖI"}
              </span>
              <span className="text-xs text-text-muted font-mono">
                Pipeline ID: {report.pipelineId}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-primary font-medium">
              {report.executiveSummaryVi}
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-text-secondary">
            <div>
              <span className="text-text-muted">Tổng thời gian:</span>{" "}
              <span className="font-bold text-accent-bright">
                {(report.totalDurationMs / 1000).toFixed(2)}s
              </span>
            </div>
            {report.certifiedBySwarm && (
              <div className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                ✓ CERTIFIED BY SWARM
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4 Agent Steps Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {report?.steps.map((step, idx) => {
          const colors = AGENT_COLORS[step.agentName] ?? {
            badge: "bg-accent-500/20 text-accent-bright border-accent-500/40",
            border: "hover:border-accent-500",
            glow: "from-accent-500/10",
          };
          const avatar = AGENT_AVATARS[step.agentName] || "/local-genshin-assets/characters/icons/paimon.png";

          return (
            <div
              key={step.step}
              className={`relative bg-gradient-to-br ${colors.glow} via-bg-card to-bg-card border border-border/80 ${colors.border} rounded-2xl p-5 transition-all shadow-sm flex flex-col justify-between space-y-4`}
            >
              {/* Step Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-bg-elevated border border-white/10 shrink-0">
                    <Image
                      src={avatar}
                      alt={step.agentName}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-text-muted uppercase">
                        Bước {idx + 1}/4
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${colors.badge}`}>
                        {step.agentName}
                      </span>
                    </div>
                    <h4 className="font-display text-sm sm:text-base font-bold text-text-primary mt-0.5">
                      {step.titleVi}
                    </h4>
                  </div>
                </div>

                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    step.status === "success"
                      ? "text-emerald-400 bg-emerald-500/10"
                      : step.status === "warning"
                        ? "text-amber-400 bg-amber-500/10"
                        : "text-red-400 bg-red-500/10"
                  }`}
                >
                  {step.status.toUpperCase()} ({(step.durationMs / 1000).toFixed(2)}s)
                </span>
              </div>

              {/* Step Summary */}
              <p className="text-xs text-text-secondary leading-relaxed">
                {step.summaryVi}
              </p>

              {/* Key Metrics */}
              <div className="pt-2 border-t border-border/40 grid grid-cols-2 gap-2 text-[11px]">
                {Object.entries(step.metrics).map(([k, v]) => (
                  <div key={k} className="p-2 rounded-lg bg-bg-elevated/50 flex flex-col">
                    <span className="text-text-muted truncate">{k}</span>
                    <span className="font-semibold text-text-primary mt-0.5 truncate font-mono">
                      {String(v)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Warnings if any */}
              {step.warnings && step.warnings.length > 0 && (
                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 space-y-1">
                  {step.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-1">
                      <span>•</span>
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
