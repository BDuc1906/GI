"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Chuyển Dark/Light bằng tên nguyên tố (chữ, không emoji):
 *   Nham / Lôi → Dark · Phong / Thủy → Light.
 * Dùng next-themes (cùng hệ thống với ThemeToggle ở header). Bản cũ chỉ thêm class
 * "dark" vào <html> — hệ thống màu của site đọc thuộc tính data-theme nên nút không có tác dụng.
 */
const OPTIONS = [
  { label: "Nham", title: "Nham - Dark Mode", theme: "dark" },
  { label: "Lôi", title: "Lôi - Dark Mode", theme: "dark" },
  { label: "Phong", title: "Phong - Light Mode", theme: "light" },
  { label: "Thủy", title: "Thủy - Light Mode", theme: "light" },
] as const;

export function ElementThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-bg-card border-2 border-border rounded-full p-2 shadow-lg">
        <div className="flex gap-2">
          {OPTIONS.map((o) => {
            const active = theme === o.theme;
            return (
              <button
                key={o.label}
                type="button"
                onClick={() => setTheme(o.theme)}
                aria-pressed={active}
                title={o.title}
                className={`px-3 h-10 rounded-full text-sm font-medium transition-all border-2 ${
                  active
                    ? "bg-bg-elevated border-accent-500 text-accent-bright"
                    : "border-transparent text-text-secondary hover:border-accent-500/50"
                }`}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
