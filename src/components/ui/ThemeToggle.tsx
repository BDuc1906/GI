"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/**
 * Nút bật/tắt chế độ sáng/tối với icon mặt trời và mặt trăng.
 * Tách biệt hoàn toàn khỏi phần chọn theme màu sắc.
 * Dùng pattern "mounted flag" chuẩn của next-themes để né hydration mismatch.
 */
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className="w-9 h-9 rounded-xl border border-border/80 bg-bg-card/75 flex items-center justify-center text-text-muted"
        aria-hidden="true"
      >
        <span className="w-4 h-4 rounded-full bg-border/40" />
      </div>
    );
  }

  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
      title={isDark ? "Chuyển sang chế độ sáng (Light)" : "Chuyển sang chế độ tối (Dark)"}
      className="w-9 h-9 flex items-center justify-center rounded-xl border border-border/80 bg-bg-card/75 text-text-secondary hover:border-accent-500 hover:text-accent-bright hover:bg-bg-elevated transition-all duration-200 shrink-0 cursor-pointer group"
    >
      {isDark ? (
        /* Icon mặt trời — biểu tượng chế độ sáng với tia sáng sắc nét */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-[18px] h-[18px] text-amber-300 group-hover:rotate-45 transition-transform duration-300"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4.5" fill="currentColor" fillOpacity={0.25} />
          <line x1="12" y1="2" x2="12" y2="4.5" />
          <line x1="12" y1="19.5" x2="12" y2="22" />
          <line x1="4.93" y1="4.93" x2="6.7" y2="6.7" />
          <line x1="17.3" y1="17.3" x2="19.07" y2="19.07" />
          <line x1="2" y1="12" x2="4.5" y2="12" />
          <line x1="19.5" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="19.07" x2="6.7" y2="17.3" />
          <line x1="17.3" y1="6.7" x2="19.07" y2="4.93" />
        </svg>
      ) : (
        /* Icon mặt trăng — biểu tượng chế độ tối */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-[18px] h-[18px] text-teal-400 group-hover:-rotate-12 transition-transform duration-300"
          aria-hidden="true"
        >
          <path
            d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
            fill="currentColor"
            fillOpacity={0.25}
          />
        </svg>
      )}
    </button>
  );
}