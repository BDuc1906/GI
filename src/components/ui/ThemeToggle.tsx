"use client";

import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const t = useTranslations("Theme");
  const tn = useTranslations("Nav");
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Pattern "mounted flag" chuẩn của next-themes để né hydration mismatch
  // (server luôn render mặc định "chưa mounted", chỉ đọc theme thật sau
  // mount ở client) — không có cách nào tránh set-state ở đây mà vẫn giữ
  // đúng hành vi này.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="px-3 py-1.5 text-sm rounded-full border border-border bg-bg-card text-text-secondary hover:border-gold hover:text-gold-bright transition-all"
      aria-label={t("toggleLabel")}
    >
      {tn("theme")}
    </button>
  );
}