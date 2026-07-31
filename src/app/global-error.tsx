"use client";

import { useEffect } from "react";

/**
 * error.tsx chỉ bắt lỗi từ các Server Component NẰM TRONG layout.tsx,
 * không bắt được lỗi ném ra từ chính layout.tsx (vd ThemeProvider crash,
 * lỗi trong <head>, v.v.). global-error.tsx là cấp bắt lỗi cao nhất của
 * Next.js App Router cho đúng trường hợp này.
 *
 * Vì lỗi có thể xảy ra ngay trong layout, file này phải tự render lại
 * toàn bộ <html>/<body> — không thể chỉ render children như error.tsx.
 * Cũng không phụ thuộc vào ThemeProvider/globals.css vì chính những thứ đó
 * có thể là nguyên nhân gây lỗi.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Khi có Sentry (giai đoạn vận hành) thay dòng này bằng
    // Sentry.captureException(error).
    console.error("[LEIBO] Lỗi ở tầng root layout:", error);
  }, [error]);

  return (
    <html lang="vi">
      <body style={{ margin: 0, background: "#0a0a0a", color: "#e5e5e5" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "1.5rem",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <p style={{ fontSize: "3rem", marginBottom: "1rem", color: "#f87171cc" }}>⚠</p>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.75rem" }}>
            Lỗi Nghiêm Trọng
          </h1>
          <p style={{ fontSize: "0.875rem", color: "#a3a3a3", maxWidth: "28rem", marginBottom: "1.5rem" }}>
            Đã có lỗi xảy ra ở tầng gốc của trang. Vui lòng thử lại hoặc tải lại trang.
          </p>
          {process.env.NODE_ENV !== "production" && (
            <p
              style={{
                fontSize: "0.75rem",
                color: "#f8717199",
                maxWidth: "32rem",
                marginBottom: "1.5rem",
                fontFamily: "monospace",
                wordBreak: "break-word",
              }}
            >
              {error.message}
            </p>
          )}
          <button
            onClick={() => reset()}
            style={{
              borderRadius: "0.5rem",
              border: "1px solid #404040",
              background: "#171717",
              padding: "0.5rem 1.25rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: "#e5e5e5",
              cursor: "pointer",
            }}
          >
            Thử Lại
          </button>
        </div>
      </body>
    </html>
  );
}
