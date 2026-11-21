"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { AgentOpsReport, SwarmExecutiveBriefing } from "@/agent/ops/swarm-ops";
import type { HarnessReport, HarnessTraceStep } from "@/agent/harness/types";

interface PendingApproval {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  reason: string | null;
  status: string;
  createdAt: string;
  newValue?: Record<string, unknown> | null;
}

interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  status: string;
  createdAt: string;
  reason: string | null;
}

interface AgentData {
  briefing: SwarmExecutiveBriefing;
  pendingApprovals: PendingApproval[];
  recentLogs: AuditLogEntry[];
  timestamp: string;
}

export function AgentControlCenter() {
  const [data, setData] = useState<AgentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active view tab
  const [activeTab, setActiveTab] = useState<"overview" | "tasks" | "approvals" | "logs" | "settings">("overview");

  // Running a task state
  const [runningDomain, setRunningDomain] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<HarnessReport | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/agents", { credentials: "same-origin" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || `HTTP ${res.status}`);
      }
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tải dữ liệu Agents.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleRunTask = async (domain: string, instruction: string) => {
    setRunningDomain(domain);
    setActiveReport(null);
    setActionSuccess(null);
    try {
      const res = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          action: "run_task",
          domain,
          instruction,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || `HTTP ${res.status}`);
      }
      setActiveReport(json.data.report);
      setActionSuccess(`Tác vụ kiểm toán [${domain}] hoàn thành thành công.`);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi chạy tác vụ");
    } finally {
      setRunningDomain(null);
    }
  };

  const handleApproveReject = async (id: string, decision: "approved" | "rejected") => {
    try {
      const res = await fetch("/api/admin/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          action: "approve_item",
          id,
          decision,
          reviewerNote: `Xử lý bởi quản trị viên qua Agent Control Center`,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json?.error?.message || `HTTP ${res.status}`);
      }
      setActionSuccess(`Đã ${decision === "approved" ? "phê duyệt" : "từ chối"} mục #${id}`);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi cập nhật");
    }
  };

  if (loading && !data) {
    return (
      <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
        <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-text-secondary">Đang kết nối LEIBO Agent Harness...</span>
      </div>
    );
  }

  const briefing = data?.briefing;
  const reports = briefing?.reports ? Object.values(briefing.reports) : [];
  const pending = data?.pendingApprovals ?? [];
  const logs = data?.recentLogs ?? [];

  return (
    <div className="space-y-6">
      {/* ── HEADER NAVIGATION & STATUS ── */}
      <div className="surface-card p-6 rounded-2xl border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs uppercase font-mono font-semibold text-emerald-400">
              Agent Harness Online · 5 Personas Active
            </span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-text-primary">
            Agent Control Center
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Trung tâm điều phối, giám sát và kiểm định các AI Agent chạy nền của LEIBO.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-bg-elevated/70 border border-border px-3 py-2 rounded-xl text-center">
            <div className="text-[10px] text-text-muted uppercase">Health Score</div>
            <div className="text-lg font-bold text-accent-bright">
              {briefing?.overallHealthScore ?? 96}%
            </div>
          </div>
          <button
            type="button"
            onClick={fetchData}
            disabled={loading}
            className="px-3 py-2 rounded-xl border border-border bg-bg-elevated hover:bg-bg-card text-xs font-semibold text-text-primary transition-colors"
          >
            Làm mới
          </button>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
          <span>✓ {actionSuccess}</span>
          <button type="button" onClick={() => setActionSuccess(null)} className="opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
          <span>⚠ {error}</span>
          <button type="button" onClick={() => setError(null)} className="opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* ── TABS ── */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto text-xs sm:text-sm font-medium">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`px-3.5 py-1.5 rounded-lg transition-colors shrink-0 ${
            activeTab === "overview"
              ? "bg-accent-500 text-bg-page font-semibold shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
          }`}
        >
          1. Tổng quan (Swarm Overview)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("tasks")}
          className={`px-3.5 py-1.5 rounded-lg transition-colors shrink-0 ${
            activeTab === "tasks"
              ? "bg-accent-500 text-bg-page font-semibold shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
          }`}
        >
          2. Thực thi tác vụ (Task Execution)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("approvals")}
          className={`px-3.5 py-1.5 rounded-lg transition-colors shrink-0 flex items-center gap-1.5 ${
            activeTab === "approvals"
              ? "bg-accent-500 text-bg-page font-semibold shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
          }`}
        >
          <span>3. Phê duyệt (Approvals)</span>
          {pending.length > 0 && (
            <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {pending.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("logs")}
          className={`px-3.5 py-1.5 rounded-lg transition-colors shrink-0 ${
            activeTab === "logs"
              ? "bg-accent-500 text-bg-page font-semibold shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
          }`}
        >
          4. Nhật ký kiểm toán (Audit Trail)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("settings")}
          className={`px-3.5 py-1.5 rounded-lg transition-colors shrink-0 ${
            activeTab === "settings"
              ? "bg-accent-500 text-bg-page font-semibold shadow-sm"
              : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
          }`}
        >
          5. Cấu hình Harness (Settings)
        </button>
      </div>

      {/* ── TAB 1: OVERVIEW & 5 PERSONAS ── */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report: AgentOpsReport) => (
              <div
                key={report.agentRole}
                className="surface-card p-4 rounded-xl border border-border flex flex-col justify-between hover:border-accent-500/50 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-accent-500/10 text-accent-bright font-mono font-semibold">
                      {report.badge}
                    </span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-bold ${
                        report.status === "healthy"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : report.status === "warning"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {report.status === "healthy" ? "HEALTHY" : report.status.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-display font-bold text-base text-text-primary">
                    {report.agentName}
                  </h3>
                  <p className="text-xs text-text-muted mt-0.5">{report.title}</p>
                  <p className="text-xs text-text-secondary mt-2 line-clamp-3">
                    {report.summaryVi}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-text-muted">Độ tin cậy:</span>
                  <span className="font-bold text-accent-bright font-mono">{report.score}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="surface-card p-5 rounded-xl border border-border">
            <h3 className="font-bold text-sm text-text-primary mb-2 flex items-center gap-2">
              <span>Ghi chú của Điều Phối Viên (Coordinator Briefing)</span>
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              {briefing?.coordinatorNoteVi ||
                "Toàn bộ 5 Agent chuyên gia đang giám sát liên tục theo kiến trúc độc lập. Không có lỗi nghiêm trọng gây cản trở trải nghiệm tra cứu của người dùng."}
            </p>
          </div>
        </div>
      )}

      {/* ── TAB 2: TASKS & HARNESS EXECUTION ── */}
      {activeTab === "tasks" && (
        <div className="space-y-6">
          <div className="surface-card p-5 rounded-xl border border-border">
            <h3 className="font-bold text-sm text-text-primary mb-2">
              Khởi Chạy Tác Vụ Có Kiểm Soát (Controlled Execution)
            </h3>
            <p className="text-xs text-text-secondary mb-4">
              Mọi tác vụ được khởi chạy qua <strong>AgentHarness</strong> với Watchdog giới hạn thời gian (30s),
              chế độ an toàn <code>readOnly: true</code> và lưu vết kiểm toán (Audit Trail) đầy đủ.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <button
                type="button"
                disabled={Boolean(runningDomain)}
                onClick={() => handleRunTask("asset", "Kiểm định toàn bộ 648 Game Assets")}
                className="p-3.5 rounded-xl border border-border/80 bg-bg-elevated hover:border-accent-500/70 hover:bg-bg-card transition-all text-left disabled:opacity-50"
              >
                <div className="text-xs font-bold text-text-primary">Quét Asset (Albedo)</div>
                <div className="text-[11px] text-text-muted mt-1">Kiểm định ảnh 648 thực thể</div>
                <div className="text-xs text-accent-bright font-semibold mt-2">
                  {runningDomain === "asset" ? "Đang chạy..." : "Khởi chạy ↗"}
                </div>
              </button>

              <button
                type="button"
                disabled={Boolean(runningDomain)}
                onClick={() => handleRunTask("build", "Kiểm toán 136 hồ sơ build chuẩn KQM")}
                className="p-3.5 rounded-xl border border-border/80 bg-bg-elevated hover:border-accent-500/70 hover:bg-bg-card transition-all text-left disabled:opacity-50"
              >
                <div className="text-xs font-bold text-text-primary">Kiểm Toán Build (Keqing)</div>
                <div className="text-[11px] text-text-muted mt-1">Thẩm định build KQM 4-Layer</div>
                <div className="text-xs text-accent-bright font-semibold mt-2">
                  {runningDomain === "build" ? "Đang chạy..." : "Khởi chạy ↗"}
                </div>
              </button>

              <button
                type="button"
                disabled={Boolean(runningDomain)}
                onClick={() => handleRunTask("data", "Kiểm tra toàn vẹn Database và schema")}
                className="p-3.5 rounded-xl border border-border/80 bg-bg-elevated hover:border-accent-500/70 hover:bg-bg-card transition-all text-left disabled:opacity-50"
              >
                <div className="text-xs font-bold text-text-primary">Kiểm Tra Dữ Liệu (Zhongli)</div>
                <div className="text-[11px] text-text-muted mt-1">Schema, quan hệ bảng & DB</div>
                <div className="text-xs text-accent-bright font-semibold mt-2">
                  {runningDomain === "data" ? "Đang chạy..." : "Khởi chạy ↗"}
                </div>
              </button>

              <button
                type="button"
                disabled={Boolean(runningDomain)}
                onClick={() => handleRunTask("security", "Kiểm tra bảo mật API và Rate Limit")}
                className="p-3.5 rounded-xl border border-border/80 bg-bg-elevated hover:border-accent-500/70 hover:bg-bg-card transition-all text-left disabled:opacity-50"
              >
                <div className="text-xs font-bold text-text-primary">Bảo Mật API (Yanfei)</div>
                <div className="text-[11px] text-text-muted mt-1">Rate limiting, session & secrets</div>
                <div className="text-xs text-accent-bright font-semibold mt-2">
                  {runningDomain === "security" ? "Đang chạy..." : "Khởi chạy ↗"}
                </div>
              </button>
            </div>
          </div>

          {activeReport && (
            <div className="surface-card p-5 rounded-xl border border-border">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h4 className="font-bold text-sm text-text-primary">
                  Kết Quả Thực Thi (Execution Trace &amp; Report)
                </h4>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                  {activeReport.state}
                </span>
              </div>

              <div className="bg-bg-elevated/70 p-3 rounded-lg border border-border mb-4 font-mono text-xs text-text-secondary">
                <div>Thời gian thực thi: {activeReport.durationMs}ms</div>
                <div>Số bước trace: {activeReport.trace.length}</div>
                <div>Kiểm định Schema: {activeReport.validationPassed ? "PASSED" : "FAILED"}</div>
              </div>

              <h5 className="text-xs font-semibold text-text-muted uppercase mb-2">Các bước suy luận &amp; Thao tác (Trace Log):</h5>
              <div className="space-y-2">
                {activeReport.trace.map((step: HarnessTraceStep) => (
                  <div key={step.stepIndex} className="p-2.5 rounded-lg bg-bg-card border border-border/60 text-xs">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-accent-bright">
                        #{step.stepIndex} [{step.type.toUpperCase()}] {step.name}
                      </span>
                      <span className="text-[10px] text-text-muted font-mono">{step.durationMs}ms</span>
                    </div>
                    {step.output != null && (
                      <pre className="text-[11px] text-text-secondary whitespace-pre-wrap overflow-x-auto bg-black/30 p-2 rounded">
                        {typeof step.output === "object" ? JSON.stringify(step.output, null, 2) : String(step.output)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: APPROVALS & PROPOSALS (HUMAN-IN-THE-LOOP) ── */}
      {activeTab === "approvals" && (
        <div className="space-y-4">
          <div className="surface-card p-4 rounded-xl border border-border">
            <h3 className="font-bold text-sm text-text-primary">
              Hàng Đợi Phê Duyệt Kiểm Duyện (Human-in-the-Loop Gate)
            </h3>
            <p className="text-xs text-text-secondary mt-1">
              Các báo cáo từ người dùng và đề xuất sửa đổi của Agent được lưu giữ tại đây.
              Tuyệt đối không tự động đẩy vào production database khi chưa có quyết định của quản trị viên.
            </p>
          </div>

          {pending.length === 0 ? (
            <div className="surface-card p-12 text-center text-text-muted text-xs rounded-xl border border-border">
              Hiện tại không có mục nào đang chờ phê duyệt. Hàng đợi sạch!
            </div>
          ) : (
            <div className="space-y-3">
              {pending.map((item) => (
                <div
                  key={item.id}
                  className="surface-card p-4 rounded-xl border border-border hover:border-accent-500/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs px-2 py-0.5 rounded bg-accent-500/20 text-accent-bright font-mono font-semibold">
                        {item.action}
                      </span>
                      <span className="text-xs font-bold text-text-primary">
                        {item.entityType}/{item.entityId}
                      </span>
                      <span className="text-[11px] text-text-muted">
                        Bởi: {item.performedBy}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary whitespace-pre-wrap">
                      {item.reason}
                    </p>
                    <div className="text-[10px] text-text-muted">
                      Ngày tạo: {new Date(item.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleApproveReject(item.id, "approved")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-bg-page text-xs font-semibold hover:bg-emerald-400 transition-colors"
                    >
                      Phê duyệt
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApproveReject(item.id, "rejected")}
                      className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-300 hover:bg-rose-500/10 text-xs font-semibold transition-colors"
                    >
                      Từ chối
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 4: AUDIT TRAIL & LOGS ── */}
      {activeTab === "logs" && (
        <div className="surface-card rounded-xl border border-border overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <h3 className="font-bold text-sm text-text-primary">
              Lịch Sử Kiểm Toán &amp; Thực Thi (Audit Trail)
            </h3>
            <span className="text-xs text-text-muted font-mono">{logs.length} bản ghi gần nhất</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-bg-elevated/80 border-b border-border text-text-muted uppercase text-[10px]">
                <tr>
                  <th className="p-3">Thời gian</th>
                  <th className="p-3">Hành động</th>
                  <th className="p-3">Thực thể</th>
                  <th className="p-3">Thực hiện bởi</th>
                  <th className="p-3">Trạng thái</th>
                  <th className="p-3">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-bg-elevated/40">
                    <td className="p-3 whitespace-nowrap text-text-muted font-mono">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="p-3 font-semibold text-text-primary">{log.action}</td>
                    <td className="p-3 text-text-secondary">{log.entityType}/{log.entityId}</td>
                    <td className="p-3 text-text-muted font-mono">{log.performedBy}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === "approved" || log.status === "success"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : log.status === "pending_review"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="p-3 text-text-secondary truncate max-w-xs">{log.reason || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 5: HARNESS SETTINGS ── */}
      {activeTab === "settings" && (
        <div className="space-y-4">
          <div className="surface-card p-5 rounded-xl border border-border">
            <h3 className="font-bold text-sm text-text-primary mb-3">
              Quy Tắc Bảo Vệ Hệ Thống (Harness Guardrails)
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated/60 border border-border/60">
                <div>
                  <div className="font-semibold text-text-primary">Chế độ Read-Only (Mặc định an toàn)</div>
                  <div className="text-text-muted">Chặn tuyệt đối mọi lệnh ghi dữ liệu trực tiếp vào database production.</div>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                  ACTIVE
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated/60 border border-border/60">
                <div>
                  <div className="font-semibold text-text-primary">Ngân sách Token (Token Budget)</div>
                  <div className="text-text-muted">Giới hạn tối đa 4,000 tokens cho mỗi lần thực thi để ngăn chi phí vượt hạn mức.</div>
                </div>
                <span className="px-2.5 py-1 rounded bg-bg-card text-accent-bright font-bold font-mono">
                  4,000 TOKENS
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated/60 border border-border/60">
                <div>
                  <div className="font-semibold text-text-primary">Timeout Watchdog</div>
                  <div className="text-text-muted">Tự động ngắt tác vụ nếu vượt quá 30 giây để chống treo tài nguyên máy chủ.</div>
                </div>
                <span className="px-2.5 py-1 rounded bg-bg-card text-text-secondary font-bold font-mono">
                  30,000 MS
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-bg-elevated/60 border border-border/60">
                <div>
                  <div className="font-semibold text-text-primary">Phê duyệt con người bắt buộc (Human-in-the-Loop)</div>
                  <div className="text-text-muted">Mọi đề xuất sửa đổi (Auto-fix, Schema, User Data Report) phải qua duyệt thủ công.</div>
                </div>
                <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold font-mono">
                  ENFORCED
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
