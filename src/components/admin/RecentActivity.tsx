// src/components/admin/RecentActivity.tsx
"use client";

import { useEffect, useState } from "react";

interface AuditLogEntry {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  reason: string | null;
  status: string;
  error: string | null;
  createdAt: string;
}

interface RecentActivityProps {
  adminKey: string;
  refreshToken: number; // đổi giá trị này (vd Date.now()) để ép re-fetch từ component cha
}

/**
 * Danh sách các lần AI Agent (hoặc AutoFixEngine) sửa dữ liệu gần nhất
 * — đọc từ bảng AuditLog qua GET /api/admin/audit-logs. Đây chính là
 * "hộp đen" bắt buộc phải có trước khi tin tưởng FixTool/AutoFixEngine
 * chạy thật trên production (xem docs/SECURITY-agent-addendum.md).
 */
export function RecentActivity({ adminKey, refreshToken }: RecentActivityProps) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!adminKey) return;

    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/audit-logs?limit=20", {
          headers: { Authorization: `Bearer ${adminKey}` },
        });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json?.error?.message || `HTTP ${res.status}`);
        if (!cancelled) setLogs(json.data.logs);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Lỗi không xác định");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [adminKey, refreshToken]);

  if (!adminKey) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center text-muted text-sm">
        Nhập Admin Key ở panel bên trên để xem lịch sử thay đổi dữ liệu.
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h2 className="text-sm font-semibold text-secondary uppercase tracking-wider">
          📋 Lịch sử AI Agent sửa dữ liệu
        </h2>
        {loading && <span className="text-xs text-muted">Đang tải...</span>}
      </div>

      {error && <p className="px-4 py-3 text-sm text-red-400">⚠️ {error}</p>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-[var(--bg-secondary)]">
            <tr>
              <th className="px-4 py-2 text-left text-secondary font-medium">Hành động</th>
              <th className="px-4 py-2 text-left text-secondary font-medium">Entity</th>
              <th className="px-4 py-2 text-left text-secondary font-medium">Thực hiện bởi</th>
              <th className="px-4 py-2 text-left text-secondary font-medium">Trạng thái</th>
              <th className="px-4 py-2 text-left text-secondary font-medium">Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-t border-border hover:bg-[var(--bg-secondary)] transition-colors">
                <td className="px-4 py-2 text-primary">{log.action}</td>
                <td className="px-4 py-2 text-secondary">
                  {log.entityType} / {log.entityId}
                </td>
                <td className="px-4 py-2 text-secondary">{log.performedBy}</td>
                <td className="px-4 py-2">
                  {log.status === "success" ? (
                    <span className="text-green-400">✅ OK</span>
                  ) : (
                    <span className="text-red-400 cursor-help" title={log.error || undefined}>
                      ❌ Lỗi
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 text-muted">{new Date(log.createdAt).toLocaleString("vi-VN", { hour12: false })}</td>
              </tr>
            ))}
            {!loading && logs.length === 0 && !error && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  Chưa có hành động nào được ghi lại.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
