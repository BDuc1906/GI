"use client";

import Link from "next/link";
import { useAdminAuth } from "@/features/admin/useAdminAuth";
import { AdminLoginForm } from "@/features/admin/AdminLoginForm";
import { AgentControlCenter } from "@/features/admin/AgentControlCenter";

export default function AdminAgentsPage() {
  const { isAuthenticated, loading: authLoading, error: authError, login, logout } = useAdminAuth();

  if (authLoading && isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-text-secondary text-sm">
          <div className="w-5 h-5 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
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
            <h1 className="font-display text-2xl font-bold text-accent-bright mb-1">
              LEIBO Agent Control Center
            </h1>
            <p className="text-xs text-text-secondary">
              Vui lòng xác thực quyền quản trị viên để điều khiển và giám sát AI Agents.
            </p>
          </div>
          <AdminLoginForm onLogin={login} loading={authLoading} error={authError} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-text-muted">
            <Link href="/admin" className="hover:text-text-primary transition-colors">
              ← Quay lại Dashboard
            </Link>
            <span>/</span>
            <span className="text-accent-bright font-semibold">Agent Control Center</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/data-quality"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              📊 Data Quality
            </Link>
            <Link
              href="/admin/builds"
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              🛡️ Build Review
            </Link>
            <button
              onClick={logout}
              className="text-danger hover:underline transition-colors font-medium"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        {/* Main Agent Control Center Component */}
        <AgentControlCenter />
      </div>
    </div>
  );
}
