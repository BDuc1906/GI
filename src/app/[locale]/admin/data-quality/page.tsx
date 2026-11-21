"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/features/admin/useAdminAuth";
import { AdminLoginForm } from "@/features/admin/AdminLoginForm";
import { DataQualityDashboard } from "@/features/admin/DataQualityDashboard";
import type { DataQualityReport } from "@/app/api/admin/data-quality/route";

export default function DataQualityPage() {
  const { isAuthenticated, loading: authLoading, error: authError, login, logout } = useAdminAuth();
  const [report, setReport] = useState<DataQualityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/data-quality", {
        credentials: "same-origin",
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        throw new Error(body?.error?.message || `HTTP ${res.status}`);
      }
      setReport(body.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchReport();
  }, [fetchReport]);

  if (authLoading && isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-text-secondary text-sm">
          <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <span>Đang xác thực phiên quản trị...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-blue-400 mb-1">
              LEIBO Data Quality &amp; Trust Hub
            </h1>
            <p className="text-xs text-text-secondary">
              Vui lòng đăng nhập quyền quản trị để xem báo cáo sức khỏe và độ tin cậy dữ liệu
            </p>
          </div>
          <AdminLoginForm onLogin={login} loading={authLoading} error={authError} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-4 md:p-8">
      <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="text-xs text-text-muted hover:text-accent-bright transition-colors"
            >
              ← Dashboard Quản Trị
            </Link>
            <span className="text-text-muted">/</span>
            <span className="text-xs font-semibold text-text-primary">Data Quality &amp; Trust</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1 flex items-center gap-2">
            <span>LEIBO Data Quality &amp; Trust Dashboard</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono">
              Live Health
            </span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Giám sát độ tin cậy toàn diện: Roster builds, Đa ngôn ngữ, Catalog vũ khí và Nhà cung cấp bên thứ ba.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/builds"
            className="px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 text-emerald-200 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
          >
            🛡️ Build Review
          </Link>
          <button
            onClick={fetchReport}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-accent-500 text-bg-primary font-bold text-xs hover:bg-accent-400 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Đang quét..." : "Làm mới"}
          </button>
          <button
            onClick={logout}
            className="px-3 py-1.5 rounded-lg bg-danger/10 border border-danger/30 text-danger text-xs font-semibold hover:bg-danger/20 transition-colors cursor-pointer"
          >
            Đăng xuất
          </button>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto mb-6 p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-300 text-xs flex items-center justify-between">
          <span>Lỗi: {error}</span>
          <button onClick={fetchReport} className="underline hover:text-red-200 cursor-pointer">
            Thử lại
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {report ? (
          <DataQualityDashboard report={report} onRefresh={fetchReport} loading={loading} />
        ) : (
          loading && (
            <div className="p-12 text-center text-text-muted flex flex-col items-center gap-3">
              <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Đang phân tích và tính toán chỉ số chất lượng dữ liệu...</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
