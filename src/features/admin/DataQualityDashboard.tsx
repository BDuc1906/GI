"use client";

import { useState } from "react";
import type { DataQualityReport } from "@/app/api/admin/data-quality/route";

interface DataQualityDashboardProps {
  report: DataQualityReport;
  onRefresh: () => void;
  loading: boolean;
}

const LOCALE_NAMES: Record<string, { name: string; flag: string }> = {
  vi: { name: "Tiếng Việt", flag: "🇻🇳" },
  en: { name: "English", flag: "🇺🇸" },
  "zh-CN": { name: "简体中文", flag: "🇨🇳" },
  "zh-TW": { name: "繁體中文", flag: "🇹🇼" },
  ja: { name: "日本語", flag: "🇯🇵" },
  ko: { name: "한국어", flag: "🇰🇷" },
  es: { name: "Español", flag: "🇪🇸" },
  fr: { name: "Français", flag: "🇫🇷" },
  ru: { name: "Русский", flag: "🇷🇺" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  pt: { name: "Português", flag: "🇧🇷" },
  id: { name: "Bahasa Indonesia", flag: "🇮🇩" },
  th: { name: "ไทย", flag: "🇹🇭" },
  tr: { name: "Türkçe", flag: "🇹🇷" },
  it: { name: "Italiano", flag: "🇮🇹" },
};

export function DataQualityDashboard({ report, onRefresh, loading }: DataQualityDashboardProps) {
  const [activeTab, setActiveTab] = useState<"locales" | "providers" | "builds" | "alerts">("locales");

  const trustScoreColor =
    report.overallTrustScore >= 90
      ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
      : report.overallTrustScore >= 75
      ? "text-amber-400 border-amber-500/40 bg-amber-500/10"
      : "text-red-400 border-red-500/40 bg-red-500/10";

  return (
    <div className="space-y-8">
      {/* ── TOP EXECUTIVE SUMMARY ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Overall Trust Score */}
        <div className={`p-6 rounded-2xl border flex flex-col justify-between ${trustScoreColor}`}>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider font-semibold opacity-90">
                Data Trust Score
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full border border-current font-mono">
                2026 Audit
              </span>
            </div>
            <div className="text-5xl font-black font-mono tracking-tight my-2">
              {report.overallTrustScore}%
            </div>
            <p className="text-xs opacity-80 leading-relaxed">
              Điểm độ tin cậy dữ liệu tổng hợp dựa trên 4 tiêu chí: Build Coverage, Đa ngôn ngữ, Tính toàn vẹn Asset và Nhà cung cấp.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-current/20 flex items-center justify-between text-xs">
            <span>Tiêu chuẩn:</span>
            <strong className="font-semibold">HoYoverse + KQM Guidelines</strong>
          </div>
        </div>

        {/* Build Coverage KPI */}
        <div className="p-6 rounded-2xl border border-border bg-bg-card flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-text-muted font-semibold block mb-2">
              Build Verification Coverage
            </span>
            <div className="text-3xl font-bold font-mono text-emerald-300">
              {report.characters.buildCoveragePercent}%
            </div>
            <div className="text-xs text-text-secondary mt-1">
              <strong>{report.characters.withVerifiedBuild}</strong> / {report.characters.playableCount} nhân vật đã xác minh KQM
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/60">
            <div className="w-full h-2 rounded-full bg-bg-secondary overflow-hidden flex">
              <div
                style={{ width: `${report.characters.buildCoveragePercent}%` }}
                className="bg-emerald-500 h-full"
              />
            </div>
            <div className="flex justify-between text-[11px] text-text-muted mt-1.5">
              <span>Mục tiêu 100%</span>
              <span>Thiếu: {report.characters.missingBuildCount}</span>
            </div>
          </div>
        </div>

        {/* Localization Completeness */}
        <div className="p-6 rounded-2xl border border-border bg-bg-card flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-text-muted font-semibold block mb-2">
              Trung bình Đa Ngôn Ngữ (15 Locales)
            </span>
            <div className="text-3xl font-bold font-mono text-blue-300">
              {report.localization.averageCompleteness}%
            </div>
            <div className="text-xs text-text-secondary mt-1">
              Tổng <strong>{report.localization.referenceTotalKeys}</strong> keys chuẩn hóa mỗi ngôn ngữ
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/60">
            <div className="w-full h-2 rounded-full bg-bg-secondary overflow-hidden">
              <div
                style={{ width: `${report.localization.averageCompleteness}%` }}
                className="bg-blue-500 h-full"
              />
            </div>
            <div className="flex justify-between text-[11px] text-text-muted mt-1.5">
              <span>Đồng bộ 15 ngôn ngữ</span>
              <span>100% JSON sync</span>
            </div>
          </div>
        </div>

        {/* Weapons & Catalog Health */}
        <div className="p-6 rounded-2xl border border-border bg-bg-card flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-wider text-text-muted font-semibold block mb-2">
              Toàn Vẹn Vũ Khí &amp; Catalog
            </span>
            <div className="text-3xl font-bold font-mono text-gold-bright">
              {report.weapons.integrityPercent}%
            </div>
            <div className="text-xs text-text-secondary mt-1">
              <strong>{report.weapons.withIconCount}</strong> / {report.weapons.totalInDb} vũ khí có đầy đủ icon &amp; stats
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between text-xs text-text-secondary">
            <span>Alerts đang hoạt động:</span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
              {report.alerts.length}
            </span>
          </div>
        </div>
      </div>

      {/* ── NAVIGATION TABS ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("locales")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "locales"
                ? "bg-blue-500/20 border border-blue-500/50 text-blue-200"
                : "bg-bg-card border border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            🌐 Độ phủ 15 Ngôn ngữ ({report.localization.locales.length})
          </button>
          <button
            onClick={() => setActiveTab("providers")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "providers"
                ? "bg-accent-500/20 border border-accent-500/50 text-accent-bright"
                : "bg-bg-card border border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            🏛️ Nhà cung cấp &amp; Trust Tiers ({report.providers.length})
          </button>
          <button
            onClick={() => setActiveTab("builds")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "builds"
                ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-200"
                : "bg-bg-card border border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            🛡️ Roster &amp; KQM Builds Review
          </button>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "alerts"
                ? "bg-amber-500/20 border border-amber-500/50 text-amber-200"
                : "bg-bg-card border border-border text-text-secondary hover:text-text-primary"
            }`}
          >
            ⚠️ Cảnh báo chất lượng ({report.alerts.length})
          </button>
        </div>

        <button
          onClick={onRefresh}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-bg-card border border-border text-text-primary hover:border-gold-bright/60 transition-colors text-xs font-semibold disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Đang quét..." : "Quét lại chất lượng"}
        </button>
      </div>

      {/* ── TAB CONTENT ── */}
      {activeTab === "locales" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {report.localization.locales.map((loc) => {
            const info = LOCALE_NAMES[loc.locale] || { name: loc.locale, flag: "🌐" };
            const isFull = loc.percentage >= 99;

            return (
              <div
                key={loc.locale}
                className="p-4 rounded-xl border border-border bg-bg-card flex flex-col justify-between space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{info.flag}</span>
                    <div>
                      <h4 className="font-bold text-sm text-text-primary">{info.name}</h4>
                      <span className="text-[10px] text-text-muted font-mono">{loc.locale}</span>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold ${
                      isFull ? "text-emerald-400" : "text-amber-400"
                    }`}
                  >
                    {loc.percentage}%
                  </span>
                </div>

                <div>
                  <div className="w-full h-1.5 rounded-full bg-bg-secondary overflow-hidden">
                    <div
                      style={{ width: `${loc.percentage}%` }}
                      className={`h-full ${isFull ? "bg-emerald-500" : "bg-amber-500"}`}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-text-muted mt-1.5">
                    <span>{loc.translatedKeys} keys</span>
                    {loc.missingKeysCount > 0 ? (
                      <span className="text-amber-300 font-semibold">
                        Thiếu {loc.missingKeysCount}
                      </span>
                    ) : (
                      <span className="text-emerald-400">Đầy đủ</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === "providers" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {report.providers.map((p, idx) => (
            <div key={idx} className="p-6 rounded-2xl border border-border bg-bg-card space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] px-2.5 py-1 rounded-full bg-accent-500/15 border border-accent-500/30 text-accent-bright font-mono uppercase tracking-wider">
                    {p.trustTier}
                  </span>
                  <h3 className="font-bold text-base text-text-primary mt-2">{p.name}</h3>
                  <p className="text-xs text-text-secondary mt-1">{p.role}</p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold ${
                    p.status === "HEALTHY"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                  }`}
                >
                  {p.status}
                </span>
              </div>
              <div className="pt-3 border-t border-border/60 text-xs text-text-muted leading-relaxed">
                <strong>Quy tắc quản trị:</strong> {p.note}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "builds" && (
        <div className="space-y-6">
          <div className="bg-bg-card border border-border rounded-2xl p-6">
            <h3 className="font-bold text-base text-text-primary mb-2">
              Phân bổ Trạng thái Kiểm định Roster (KQM 4-Layer)
            </h3>
            <p className="text-xs text-text-secondary mb-6">
              Mỗi nhân vật được đánh giá theo 4 tầng: (1) Cấu trúc DB, (2) Cơ chế Gameplay, (3) Tính toán KQMS 20-Roll, (4) Thẩm định biên tập viên.
            </p>

            <div className="w-full h-4 rounded-full bg-bg-secondary overflow-hidden flex mb-4">
              <div
                style={{
                  width: `${(report.buildsReview.verified / report.characters.playableCount) * 100}%`,
                }}
                className="bg-emerald-500 h-full"
                title={`Verified: ${report.buildsReview.verified}`}
              />
              <div
                style={{
                  width: `${(report.buildsReview.inReview / report.characters.playableCount) * 100}%`,
                }}
                className="bg-blue-500 h-full"
                title={`In Review: ${report.buildsReview.inReview}`}
              />
              <div
                style={{
                  width: `${(report.buildsReview.draft / report.characters.playableCount) * 100}%`,
                }}
                className="bg-yellow-500 h-full"
                title={`Draft: ${report.buildsReview.draft}`}
              />
              <div
                style={{
                  width: `${(report.buildsReview.outdated / report.characters.playableCount) * 100}%`,
                }}
                className="bg-orange-500 h-full"
                title={`Outdated: ${report.buildsReview.outdated}`}
              />
              <div
                style={{
                  width: `${(report.buildsReview.missing / report.characters.playableCount) * 100}%`,
                }}
                className="bg-red-500/60 h-full"
                title={`Missing: ${report.buildsReview.missing}`}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                <span className="text-[10px] uppercase text-emerald-400 font-bold block">Verified</span>
                <span className="text-xl font-bold font-mono text-emerald-200">
                  {report.buildsReview.verified}
                </span>
              </div>
              <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10">
                <span className="text-[10px] uppercase text-blue-400 font-bold block">In Review</span>
                <span className="text-xl font-bold font-mono text-blue-200">
                  {report.buildsReview.inReview}
                </span>
              </div>
              <div className="p-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10">
                <span className="text-[10px] uppercase text-yellow-400 font-bold block">Draft</span>
                <span className="text-xl font-bold font-mono text-yellow-200">
                  {report.buildsReview.draft}
                </span>
              </div>
              <div className="p-3 rounded-xl border border-orange-500/30 bg-orange-500/10">
                <span className="text-[10px] uppercase text-orange-400 font-bold block">Outdated</span>
                <span className="text-xl font-bold font-mono text-orange-200">
                  {report.buildsReview.outdated}
                </span>
              </div>
              <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/10">
                <span className="text-[10px] uppercase text-red-400 font-bold block">Missing</span>
                <span className="text-xl font-bold font-mono text-red-200">
                  {report.buildsReview.missing}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "alerts" && (
        <div className="space-y-3">
          {report.alerts.length === 0 ? (
            <div className="p-8 text-center text-text-muted bg-bg-card border border-border rounded-2xl">
              ✓ Tuyệt vời! Không phát hiện cảnh báo chất lượng dữ liệu nào.
            </div>
          ) : (
            report.alerts.map((alert, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-border bg-bg-card flex items-start gap-3"
              >
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase shrink-0 ${
                    alert.severity === "high"
                      ? "bg-red-500/20 text-red-300 border border-red-500/40"
                      : alert.severity === "medium"
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                  }`}
                >
                  {alert.severity}
                </span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-text-secondary uppercase">
                      [{alert.category}]
                    </span>
                    {alert.targetId && (
                      <span className="text-xs font-mono px-1.5 py-0.2 rounded bg-bg-secondary text-text-muted">
                        {alert.targetId}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-text-primary mt-0.5">{alert.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
