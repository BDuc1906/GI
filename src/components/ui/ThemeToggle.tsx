"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

/** Chọn chế độ sáng/tối độc lập với bảng màu nhân vật. */
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className="flex items-center gap-1 rounded-xl border border-border/80 bg-bg-card/75 p-1 opacity-50"
        aria-hidden="true"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 rounded-lg p-2 text-text-muted"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8 rounded-lg p-2 text-text-muted"
          aria-hidden="true"
        >
          <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
        </svg>
      </div>
    );
  }

  const currentTheme = resolvedTheme || theme;
  const isDark = currentTheme === "dark";

  return (
    <div
      role="group"
      aria-label="Chế độ giao diện"
      className="flex items-center gap-1 rounded-xl border border-border/80 bg-bg-card/75 p-1 shrink-0"
    >
      <button
        type="button"
        onClick={() => setTheme("light")}
        aria-label="Chế độ sáng"
        aria-pressed={!isDark}
        title="Chế độ sáng (Light)"
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
          !isDark
            ? "bg-bg-elevated text-amber-500 shadow-sm"
            : "text-text-muted hover:bg-bg-elevated hover:text-amber-500"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[18px] w-[18px]"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => setTheme("dark")}
        aria-label="Chế độ tối"
        aria-pressed={isDark}
        title="Chế độ tối (Dark)"
        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
          isDark
            ? "bg-bg-elevated text-teal-500 shadow-sm"
            : "text-text-muted hover:bg-bg-elevated hover:text-teal-500"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[18px] w-[18px]"
          aria-hidden="true"
        >
          <path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z" />
        </svg>
      </button>
    </div>
  );
}