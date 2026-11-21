"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface AdminLoginFormProps {
  onLogin: (key: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export function AdminLoginForm({ onLogin, loading, error }: AdminLoginFormProps) {
  const t = useTranslations("Admin");
  const [key, setKey] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!key.trim()) return;
    await onLogin(key.trim());
  };

  return (
    <div className="max-w-md mx-auto my-12 bg-bg-card border border-border rounded-2xl p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gold-bright/10 border border-gold-bright/30 flex items-center justify-center text-lg">
          🛡️
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-text-primary">
            Xác thực Quyền Quản Trị
          </h2>
          <p className="text-xs text-text-muted">
            Phiên làm việc bảo mật qua HttpOnly Cookie (chuẩn 2026, chống XSS)
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="admin-key" className="block text-xs font-semibold text-text-secondary mb-1.5">
            {t("adminKeyLabel")}
          </label>
          <input
            id="admin-key"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={t("adminKeyPlaceholder")}
            disabled={loading}
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-bg-input border border-border text-text-primary text-sm outline-none focus:border-gold-bright/70 focus:ring-1 focus:ring-gold-bright/40 transition-all disabled:opacity-50"
          />
        </div>

        {error && (
          <div className="p-3 rounded-lg border border-danger/40 bg-danger/10 text-danger text-xs font-medium">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !key.trim()}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-gold-primary to-gold-bright text-bg-primary font-bold text-sm hover:brightness-110 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-gold-bright/10"
        >
          {loading ? "Đang xác thực..." : "Đăng nhập Quản Trị"}
        </button>

        <p className="text-[11px] text-text-muted text-center pt-2 leading-relaxed">
          Khóa bí mật được gửi một lần qua kênh mã hóa HTTPS và ký số phiên làm việc. Trình duyệt không lưu trữ khóa gốc trong bộ nhớ cục bộ.
        </p>
      </form>
    </div>
  );
}
