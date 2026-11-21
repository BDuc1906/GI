"use client";

import { useCallback, useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { localCharacterIcon } from "@/lib/ui/local-assets";
import { rarityTextClass } from "@/lib/ui/theme";
import type { AdminBuildsResponse, AdminCharacterBuildSummary } from "@/app/api/admin/builds/route";
import type { BuildReviewStatus } from "@/core/build-profile/types";
import { useAdminAuth } from "@/features/admin/useAdminAuth";
import { AdminLoginForm } from "@/features/admin/AdminLoginForm";

const STATUS_CONFIG: Record<
  BuildReviewStatus | "MISSING",
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  VERIFIED: {
    label: "Đã xác minh (Verified)",
    bg: "bg-emerald-500/15",
    text: "text-emerald-300",
    border: "border-emerald-500/40",
    icon: "✓",
  },
  IN_REVIEW: {
    label: "Đang kiểm định (In Review)",
    bg: "bg-blue-500/15",
    text: "text-blue-300",
    border: "border-blue-500/40",
    icon: "⏳",
  },
  DRAFT: {
    label: "Bản nháp (Draft)",
    bg: "bg-yellow-500/15",
    text: "text-yellow-300",
    border: "border-yellow-500/40",
    icon: "✎",
  },
  OUTDATED: {
    label: "Cần cập nhật (Outdated)",
    bg: "bg-orange-500/15",
    text: "text-orange-300",
    border: "border-orange-500/40",
    icon: "⚠",
  },
  MISSING: {
    label: "Chưa có build (Missing)",
    bg: "bg-red-500/15",
    text: "text-red-300",
    border: "border-red-500/40",
    icon: "✕",
  },
};

const STAR = "★";

export default function AdminBuildsPage() {
  const { isAuthenticated, loading: authLoading, error: authError, login, logout } = useAdminAuth();
  const [data, setData] = useState<AdminBuildsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [visionFilter, setVisionFilter] = useState<string>("ALL");

  // Inspection Modal
  const [selectedChar, setSelectedChar] = useState<AdminCharacterBuildSummary | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBuilds = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/builds", {
        credentials: "same-origin",
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        throw new Error(body?.error?.message || `HTTP ${res.status}`);
      }
      setData(body.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBuilds();
  }, [fetchBuilds]);

  // Handle Review Status Update
  const handleUpdateStatus = async (
    characterId: string,
    profileId: string,
    newStatus: BuildReviewStatus
  ) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/builds", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          characterId,
          profileId,
          status: newStatus,
          reviewer: "Admin Dashboard",
          reason: "Manual review verification via LEIBO Admin",
        }),
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        throw new Error(body?.error?.message || "Cập nhật thất bại");
      }
      await fetchBuilds();
      if (selectedChar && selectedChar.id === characterId) {
        const updated = selectedChar.profiles.map((p) =>
          p.profileId === profileId ? { ...p, reviewStatus: newStatus } : p
        );
        setSelectedChar({ ...selectedChar, profiles: updated, overallStatus: newStatus });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setActionLoading(false);
    }
  };

  // Filtered characters
  const characters = data?.characters;
  const filteredCharacters = useMemo(() => {
    if (!characters) return [];
    return characters.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" || c.overallStatus === statusFilter;
      const matchesVision =
        visionFilter === "ALL" || c.vision.toLowerCase() === visionFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesVision;
    });
  }, [characters, searchTerm, statusFilter, visionFilter]);

  if (authLoading && isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
        <div className="flex items-center gap-3 text-text-secondary text-sm">
          <div className="w-5 h-5 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span>Đang kiểm tra quyền quản trị build...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary p-4 md:p-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="font-display text-2xl font-bold text-emerald-300 mb-1">
              LEIBO Build Review Hub
            </h1>
            <p className="text-xs text-text-secondary">
              Vui lòng xác thực quyền quản trị để truy cập Build Database &amp; KQM Review Engine
            </p>
          </div>
          <AdminLoginForm onLogin={login} loading={authLoading} error={authError} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary p-4 md:p-8">
      {/* ── HEADER NAVIGATION ── */}
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
            <span className="text-xs font-semibold text-text-primary">Build Database</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1 flex items-center gap-2">
            <span>LEIBO Build Coverage &amp; Review Hub</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
              KQM Standards
            </span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Quản lý tiến độ kiểm duyệt toàn bộ roster, 4 tầng validation (Structural, Gameplay, Calculation, Review).
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/data-quality"
            className="px-3 py-1.5 rounded-lg border border-blue-500/40 bg-blue-500/10 text-blue-200 text-xs font-semibold hover:bg-blue-500/20 transition-colors"
          >
            📊 Data Quality
          </Link>
          <button
            onClick={fetchBuilds}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-accent-500 text-bg-primary font-bold text-xs hover:bg-accent-400 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Đang tải..." : "Làm mới"}
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
          <button
            onClick={fetchBuilds}
            className="underline hover:text-red-200 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* ── KPI METRICS CARDS ── */}
      {data && (
        <div className="max-w-7xl mx-auto mb-8 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="p-4 rounded-xl border border-border bg-bg-card">
              <span className="text-[11px] text-text-muted uppercase tracking-wider block">
                Tổng nhân vật
              </span>
              <span className="text-2xl font-bold font-mono text-text-primary">
                {data.metrics.totalPlayable}
              </span>
              <span className="text-[11px] text-text-secondary block mt-0.5">Roster có thể chơi</span>
            </div>

            <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20">
              <span className="text-[11px] text-emerald-300 uppercase tracking-wider block">
                Đã xác minh (Verified)
              </span>
              <span className="text-2xl font-bold font-mono text-emerald-200">
                {data.metrics.verifiedCount}
              </span>
              <span className="text-[11px] text-emerald-400/80 block mt-0.5">
                {data.metrics.coveragePercent}% tổng roster
              </span>
            </div>

            <div className="p-4 rounded-xl border border-blue-500/40 bg-blue-950/20">
              <span className="text-[11px] text-blue-300 uppercase tracking-wider block">
                Đang kiểm định
              </span>
              <span className="text-2xl font-bold font-mono text-blue-200">
                {data.metrics.inReviewCount}
              </span>
              <span className="text-[11px] text-blue-400/80 block mt-0.5">In Review</span>
            </div>

            <div className="p-4 rounded-xl border border-yellow-500/40 bg-yellow-950/20">
              <span className="text-[11px] text-yellow-300 uppercase tracking-wider block">
                Bản nháp (Draft)
              </span>
              <span className="text-2xl font-bold font-mono text-yellow-200">
                {data.metrics.draftCount}
              </span>
              <span className="text-[11px] text-yellow-400/80 block mt-0.5">Chờ biên tập viên</span>
            </div>

            <div className="p-4 rounded-xl border border-orange-500/40 bg-orange-950/20">
              <span className="text-[11px] text-orange-300 uppercase tracking-wider block">
                Cần cập nhật
              </span>
              <span className="text-2xl font-bold font-mono text-orange-200">
                {data.metrics.outdatedCount}
              </span>
              <span className="text-[11px] text-orange-400/80 block mt-0.5">Sau patch mới</span>
            </div>

            <div className="p-4 rounded-xl border border-red-500/40 bg-red-950/20">
              <span className="text-[11px] text-red-300 uppercase tracking-wider block">
                Chưa có build
              </span>
              <span className="text-2xl font-bold font-mono text-red-200">
                {data.metrics.missingCount}
              </span>
              <span className="text-[11px] text-red-400/80 block mt-0.5">Missing / Auto</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="p-4 rounded-2xl border border-border/80 bg-bg-card">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-text-primary flex items-center gap-2">
                <span>Tiến độ hoàn thiện Verified Coverage:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {data.metrics.coveragePercent}%
                </span>
              </span>
              <span className="text-text-muted">
                Mục tiêu phát hành: <strong>100%</strong> (0 build không rõ nguồn)
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-bg-secondary overflow-hidden flex">
              <div
                style={{ width: `${(data.metrics.verifiedCount / data.metrics.totalPlayable) * 100}%` }}
                className="bg-emerald-500 h-full"
                title={`Verified: ${data.metrics.verifiedCount}`}
              />
              <div
                style={{ width: `${(data.metrics.inReviewCount / data.metrics.totalPlayable) * 100}%` }}
                className="bg-blue-500 h-full"
                title={`In Review: ${data.metrics.inReviewCount}`}
              />
              <div
                style={{ width: `${(data.metrics.draftCount / data.metrics.totalPlayable) * 100}%` }}
                className="bg-yellow-500 h-full"
                title={`Draft: ${data.metrics.draftCount}`}
              />
              <div
                style={{ width: `${(data.metrics.outdatedCount / data.metrics.totalPlayable) * 100}%` }}
                className="bg-orange-500 h-full"
                title={`Outdated: ${data.metrics.outdatedCount}`}
              />
              <div
                style={{ width: `${(data.metrics.missingCount / data.metrics.totalPlayable) * 100}%` }}
                className="bg-red-500/50 h-full"
                title={`Missing: ${data.metrics.missingCount}`}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── FILTERS & SEARCH ── */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative min-w-[280px]">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên nhân vật (Kazuha, Raiden...)..."
            className="w-full px-4 py-2 rounded-xl border border-border bg-bg-card text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {["ALL", "VERIFIED", "IN_REVIEW", "DRAFT", "OUTDATED", "MISSING"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === st
                  ? "bg-accent-500/20 border-accent-500 text-accent-bright"
                  : "bg-bg-card border-border/70 text-text-secondary hover:text-text-primary"
              }`}
            >
              {st === "ALL" ? "Tất cả" : STATUS_CONFIG[st as BuildReviewStatus | "MISSING"]?.label}
            </button>
          ))}
        </div>

        {/* Vision Filter */}
        <div className="flex items-center gap-1 text-xs">
          {["ALL", "Anemo", "Geo", "Electro", "Dendro", "Hydro", "Pyro", "Cryo"].map((v) => (
            <button
              key={v}
              onClick={() => setVisionFilter(v)}
              className={`px-2.5 py-1 rounded-md border text-[11px] font-medium transition-colors cursor-pointer ${
                visionFilter === v
                  ? "bg-text-primary text-bg-primary border-text-primary"
                  : "bg-bg-card border-border text-text-secondary hover:text-text-primary"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* ── ROSTER BUILD TABLE ── */}
      <div className="max-w-7xl mx-auto rounded-2xl border border-border/80 bg-bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-bg-secondary/40 text-text-muted font-semibold">
                <th className="py-3 px-4">Nhân vật</th>
                <th className="py-3 px-4">Profiles lối chơi</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Nguồn KQM / Tham chiếu</th>
                <th className="py-3 px-4">Kiểm định 4 Tầng</th>
                <th className="py-3 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredCharacters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-text-muted">
                    {loading ? "Đang tải danh sách..." : "Không tìm thấy nhân vật phù hợp."}
                  </td>
                </tr>
              ) : (
                filteredCharacters.map((c) => {
                  const statusStyle =
                    STATUS_CONFIG[c.overallStatus] || STATUS_CONFIG.MISSING;
                  const iconUrl = localCharacterIcon(c.id);

                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-bg-elevated/40 transition-colors"
                    >
                      {/* Character avatar + name */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-bg-secondary border border-border shrink-0">
                            <SafeImage
                              src={iconUrl}
                              fallbackSrcs={[]}
                              alt={c.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-sm text-text-primary">
                                {c.name}
                              </span>
                              <span className={`text-[10px] ${rarityTextClass(c.rarity)}`}>
                                {STAR.repeat(c.rarity)}
                              </span>
                            </div>
                            <span className="text-[11px] text-text-muted">
                              {c.vision} • {c.weaponType}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Profiles count & list */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-text-primary">
                            {c.profilesCount > 0
                              ? `${c.profilesCount} profile(s)`
                              : "0 profile"}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {c.profiles.map((p) => (
                              <span
                                key={p.profileId}
                                className="px-2 py-0.5 rounded bg-bg-elevated border border-border/70 text-[10px] text-text-secondary truncate max-w-[160px]"
                                title={`${p.nameVi} (${p.role})`}
                              >
                                {p.nameVi}
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                        >
                          <span>{statusStyle.icon}</span>
                          <span>{c.overallStatus}</span>
                        </span>
                      </td>

                      {/* Source */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-0.5">
                          {c.primarySource ? (
                            <span className="font-medium text-text-primary truncate max-w-[200px]">
                              {c.primarySource}
                            </span>
                          ) : (
                            <span className="text-text-muted italic">Chưa gắn nguồn</span>
                          )}
                          {c.verifiedAt && (
                            <span className="text-[10px] text-text-muted">
                              Xác minh: {c.verifiedAt} {c.reviewer ? `• ${c.reviewer}` : ""}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4-Layer Validation status */}
                      <td className="py-3 px-4">
                        {c.profilesCount > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${
                                c.hasErrors ? "bg-red-500" : "bg-emerald-500"
                              }`}
                              title={
                                c.hasErrors
                                  ? "Có lỗi kiểm định cần xử lý"
                                  : "Cấu trúc & Gameplay hợp lệ"
                              }
                            />
                            <span className="text-[11px] text-text-secondary">
                              {c.hasErrors
                                ? "Cảnh báo lỗi"
                                : c.warningsCount > 0
                                ? `${c.warningsCount} chú ý`
                                : "100% Valid"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-text-muted text-[11px]">—</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedChar(c)}
                          className="px-3 py-1.5 rounded-lg border border-border bg-bg-elevated text-text-primary hover:border-accent-500 hover:text-accent-bright transition-colors text-xs font-semibold cursor-pointer"
                        >
                          Kiểm định &amp; Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── INSPECTION & REVIEW MODAL ── */}
      {selectedChar && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-border/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden bg-bg-secondary border border-border shrink-0">
                  <SafeImage
                    src={localCharacterIcon(selectedChar.id)}
                    fallbackSrcs={[]}
                    alt={selectedChar.name}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <span>{selectedChar.name}</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent-500/20 text-accent-bright border border-accent-500/30">
                      {selectedChar.vision} • {selectedChar.weaponType}
                    </span>
                  </h2>
                  <p className="text-xs text-text-secondary mt-0.5">
                    ID: <code>{selectedChar.id}</code> • {selectedChar.profilesCount} profile(s)
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedChar(null)}
                className="text-text-muted hover:text-text-primary p-2 text-base cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Profiles detail */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-text-primary uppercase tracking-wider">
                Danh sách Profiles &amp; Kết quả kiểm định 4 Tầng:
              </h3>

              {selectedChar.profiles.length === 0 ? (
                <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-200 text-xs">
                  Nhân vật này chưa có bất kỳ profile nào trong hệ thống. Cần tạo profile KQM chuẩn trước khi duyệt Verified.
                </div>
              ) : (
                selectedChar.profiles.map((p) => {
                  const val = p.validation;
                  const errors = val?.issues.filter((i) => i.severity === "error") || [];
                  const warnings = val?.issues.filter((i) => i.severity === "warning") || [];

                  return (
                    <div
                      key={p.profileId}
                      className="p-4 rounded-xl border border-border/80 bg-bg-elevated/40 space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-text-primary">
                              {p.nameVi}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-bg-card border border-border text-text-muted">
                              {p.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-secondary mt-0.5">
                            Nguồn: <strong>{p.primarySource}</strong> ({p.gameVersionVerified}) • Xác minh: {p.verifiedAt} ({p.reviewer})
                          </p>
                        </div>

                        {/* Status switcher */}
                        <div className="flex items-center gap-1.5">
                          {(["VERIFIED", "IN_REVIEW", "DRAFT", "OUTDATED"] as BuildReviewStatus[]).map(
                            (st) => (
                              <button
                                key={st}
                                disabled={actionLoading}
                                onClick={() =>
                                  handleUpdateStatus(selectedChar.id, p.profileId, st)
                                }
                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                                  p.reviewStatus === st
                                    ? "bg-accent-500 text-bg-primary border-accent-500 shadow-sm"
                                    : "bg-bg-card border-border text-text-muted hover:text-text-primary"
                                }`}
                              >
                                {st}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      {/* 4-Layer checklist */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-2 border-t border-border/50">
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-400">✓</span>
                          <span><strong>Tầng 1 (Structural):</strong> Cấu trúc &amp; ID trong DB</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-400">✓</span>
                          <span><strong>Tầng 2 (Gameplay):</strong> Cơ chế kit &amp; Main stats</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-emerald-400">✓</span>
                          <span><strong>Tầng 3 (Calculation):</strong> KQMS 20-Roll &amp; ER ranges</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={p.reviewStatus === "VERIFIED" ? "text-emerald-400" : "text-yellow-400"}>
                            {p.reviewStatus === "VERIFIED" ? "✓" : "✎"}
                          </span>
                          <span><strong>Tầng 4 (Human Review):</strong> {p.reviewStatus}</span>
                        </div>
                      </div>

                      {/* Display issues if any */}
                      {(errors.length > 0 || warnings.length > 0) && (
                        <div className="mt-2 space-y-1 bg-bg-card/70 p-2.5 rounded-lg border border-border/60 text-[11px]">
                          {errors.map((e, idx) => (
                            <p key={idx} className="text-red-400 flex items-center gap-1">
                              <span>✕</span>
                              <span>[{e.layer}] {e.message}</span>
                            </p>
                          ))}
                          {warnings.map((w, idx) => (
                            <p key={idx} className="text-yellow-400 flex items-center gap-1">
                              <span>⚠</span>
                              <span>[{w.layer}] {w.message}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-2 border-t border-border/80 pt-4">
              <button
                onClick={() => setSelectedChar(null)}
                className="px-4 py-2 rounded-xl border border-border bg-bg-elevated text-text-primary text-xs font-semibold hover:bg-bg-secondary transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
