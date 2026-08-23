// src/app/admin/page.tsx
/**
 * Trang quản trị — dashboard cho pipeline crawl/seed + điều khiển AI
 * Agent (fix/sync) + lịch sử thay đổi dữ liệu.
 *
 * TRƯỚC ĐÂY: file này 0 byte (chưa ai viết). Có 1 bản dashboard pipeline
 * đã được viết đầy đủ nhưng đặt NHẦM CHỖ ở `src/app/api/admin/page.tsx`
 * (route thật của nó vô tình là URL "/api/admin" — rất dễ nhầm với API
 * route, và không nằm cạnh các API admin khác về mặt điều hướng). Trang
 * này lấy lại đúng phần dashboard pipeline đó (đổi sang dùng token màu
 * theo theme thay vì hex cứng — để tôn trọng dark/light mode của
 * ThemeToggle), rồi ghép thêm 3 phần AI Agent còn thiếu: điều khiển
 * fix/sync thủ công, chi tiết lần quét gần nhất, lịch sử audit log.
 *
 * XOÁ file `src/app/api/admin/page.tsx` cũ sau khi áp dụng file này,
 * để không còn 2 trang admin trùng chức năng ở 2 URL khác nhau.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
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

const PIPELINE_LABELS: Record<string, string> = {
  crawl: "Crawl dữ liệu",
  seed: "Seed database",
  mirror: "Mirror ảnh",
  "update-data": "Cập nhật dữ liệu",
  "agent-sync": "Agent trigger sync",
};

function formatDuration(ms: number | null): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

export default function AdminPage() {
  const [adminKey, setAdminKey] = useState("");
  const [runs, setRuns] = useState<PipelineRun[]>([]);
  const [latestStatus, setLatestStatus] = useState<LatestStatus>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFixResult, setLastFixResult] = useState<FixScanSummary | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  // Đọc admin key đã lưu ở lần trước (chỉ trong trình duyệt này)
  useEffect(() => {
    const saved = window.localStorage.getItem(ADMIN_KEY_STORAGE);
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
    fetchPipelineStatus();
    const interval = setInterval(fetchPipelineStatus, 30000);
    return () => clearInterval(interval);
  }, [fetchPipelineStatus, refreshToken]);

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-gold-bright">📊 Bảng điều khiển Admin</h1>
            <p className="text-sm text-text-secondary mt-1">Pipeline dữ liệu + AI Agent</p>
          </div>
          <button
            onClick={() => setRefreshToken(Date.now())}
            className="px-4 py-2 bg-bg-card border border-border rounded-lg hover:border-gold/50 transition-colors text-sm"
          >
            🔄 Refresh
          </button>
        </div>

        {!adminKey && (
          <div className="bg-bg-card border border-gold/30 rounded-xl p-4 mb-8 text-sm text-text-secondary">
            Nhập Admin Key ở panel &quot;Điều khiển AI Agent&quot; bên dưới để xem dữ liệu pipeline và audit log.
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 text-sm text-red-400">
            ⚠️ {error}
          </div>
        )}

        <div className="mb-8">
          <StatsCards latestStatus={latestStatus} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AgentControlPanel
            adminKey={adminKey}
            onAdminKeyChange={handleAdminKeyChange}
            onActionComplete={() => setRefreshToken(Date.now())}
            onFixResult={setLastFixResult}
          />
          <DataHealth lastScan={lastFixResult} />
        </div>

        <div className="mb-8">
          <RecentActivity adminKey={adminKey} refreshToken={refreshToken} />
        </div>

        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
              📋 Lịch sử pipeline ({runs.length}) {loading && <span className="text-text-muted normal-case">— đang tải...</span>}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-secondary">
                <tr>
                  <th className="px-4 py-2 text-left text-text-secondary font-medium">Pipeline</th>
                  <th className="px-4 py-2 text-left text-text-secondary font-medium">Trạng thái</th>
                  <th className="px-4 py-2 text-left text-text-secondary font-medium">Bắt đầu</th>
                  <th className="px-4 py-2 text-left text-text-secondary font-medium">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.id} className="border-t border-border hover:bg-bg-secondary transition-colors">
                    <td className="px-4 py-2 text-text-primary">{PIPELINE_LABELS[run.name] || run.name}</td>
                    <td className="px-4 py-2">
                      {run.status === "success" && <span className="text-green-400">✅ Thành công</span>}
                      {run.status === "failed" && (
                        <span className="text-red-400 cursor-help" title={run.error || undefined}>
                          ❌ Thất bại
                        </span>
                      )}
                      {run.status === "started" && <span className="text-yellow-400">⏳ Đang chạy</span>}
                    </td>
                    <td className="px-4 py-2 text-text-secondary">
                      {new Date(run.startedAt).toLocaleString("vi-VN", { hour12: false })}
                    </td>
                    <td className="px-4 py-2 text-text-secondary">{formatDuration(run.durationMs)}</td>
                  </tr>
                ))}
                {!loading && runs.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-text-muted">
                      {adminKey ? "Chưa có pipeline nào chạy." : "Nhập Admin Key để xem lịch sử."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-xs text-text-muted text-center">Tự động refresh mỗi 30 giây</div>
      </div>
    </div>
  );
}
