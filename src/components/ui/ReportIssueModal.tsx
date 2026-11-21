"use client";

import React, { useState } from "react";

export interface ReportIssueModalProps {
  entityType: "character" | "weapon" | "artifact" | "build" | "domain" | "material" | "general";
  entityId: string;
  entityName?: string;
  className?: string;
}

const ISSUE_TYPES = [
  { value: "stats", label: "Chỉ số hoặc hiệu ứng lệch game" },
  { value: "image", label: "Hình ảnh sai, mờ hoặc không hiển thị" },
  { value: "translation", label: "Lỗi dịch thuật / chính tả" },
  { value: "build", label: "Đề xuất build / vũ khí chưa chính xác" },
  { value: "other", label: "Vấn đề khác" },
];

export function ReportIssueModal({
  entityType,
  entityId,
  entityName,
  className = "",
}: ReportIssueModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [issueType, setIssueType] = useState("stats");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleOpen = () => {
    setIsOpen(true);
    setSuccess(false);
    setErrorMsg(null);
  };

  const handleClose = () => {
    setIsOpen(false);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (description.trim().length < 5) {
      setErrorMsg("Vui lòng nhập mô tả chi tiết ít nhất 5 ký tự.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/feedback/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entityType,
          entityId,
          entityName: entityName || entityId,
          issueType,
          description: description.trim(),
          email: email.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data?.error?.message || "Không thể gửi báo cáo lúc này.");
      }

      setSuccess(true);
      setDescription("");
      setEmail("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Đã xảy ra lỗi khi gửi báo cáo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className={`inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent-bright transition-colors py-1 px-2.5 rounded-lg border border-border/50 hover:border-accent-500/40 bg-bg-card/40 hover:bg-bg-elevated ${className}`}
        title="Góp ý hoặc báo lỗi dữ liệu cho ban biên tập"
      >
        <svg
          className="w-3.5 h-3.5 opacity-70"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
          />
        </svg>
        <span>Báo dữ liệu sai</span>
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={handleClose}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-bg-card border border-border p-6 shadow-2xl relative select-text"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  Báo lỗi dữ liệu {entityName ? `— ${entityName}` : ""}
                </h3>
                <p className="text-xs text-text-secondary mt-1">
                  Mọi đóng góp sẽ được lưu vào hàng đợi kiểm duyệt để cập nhật chính xác nhất.
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg transition-colors"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            {success ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-xl font-bold">
                  ✓
                </div>
                <h4 className="text-sm font-semibold text-text-primary">
                  Đã tiếp nhận báo cáo của bạn!
                </h4>
                <p className="text-xs text-text-secondary max-w-xs mx-auto">
                  Cảm ơn bạn đã hỗ trợ hoàn thiện dữ liệu Genshin trên LEIBO. Đội ngũ sẽ kiểm tra và cập nhật sớm nhất.
                </p>
                <button
                  type="button"
                  onClick={handleClose}
                  className="mt-4 px-4 py-2 text-xs font-semibold rounded-lg bg-accent-500 text-bg-page hover:bg-accent-400 transition-colors"
                >
                  Xong
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {errorMsg && (
                  <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block font-medium text-text-secondary mb-1">
                    Loại vấn đề
                  </label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border text-text-primary focus:outline-hidden focus:border-accent-500"
                  >
                    {ISSUE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-text-secondary mb-1">
                    Mô tả chi tiết <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="VD: Chỉ số tấn công cơ bản cấp 90 hiển thị là 608 nhưng thực tế trong game là 674..."
                    className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border text-text-primary focus:outline-hidden focus:border-accent-500 placeholder:text-text-muted/60"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-text-secondary mb-1">
                    Email liên hệ (tùy chọn)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="traveler@example.com (để nhận thông báo khi cập nhật)"
                    className="w-full px-3 py-2 rounded-lg bg-bg-elevated border border-border text-text-primary focus:outline-hidden focus:border-accent-500 placeholder:text-text-muted/60"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="px-3.5 py-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-accent-500 text-bg-page font-semibold hover:bg-accent-400 disabled:opacity-50 transition-colors flex items-center gap-1.5"
                  >
                    {loading && (
                      <span className="w-3 h-3 border-2 border-bg-page border-t-transparent rounded-full animate-spin" />
                    )}
                    <span>Gửi báo cáo</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
