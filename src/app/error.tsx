
"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Error boundary cấp app. Next.js yêu cầu file này là Client Component
 * ("use client") vì nó cần render lại khi user bấm "reset".
 *
 * Bắt các lỗi throw ra từ Server Component phía trên nó trong cây route
 * (vd: prisma query fail vì Neon suspend/mất kết nối, DATABASE_URL sai...).
 * Không bắt được lỗi trong root layout.tsx — muốn bắt cả layout thì cần
 * global-error.tsx riêng (ít quan trọng hơn, có thể làm sau).
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log ra console server/client để debug — khi có Sentry (Phase vận
    // hành) thì thay dòng này bằng Sentry.captureException(error).
    console.error("[LEIBO] Route error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <p className="font-display text-5xl font-bold text-red-400/80 mb-4">
        ⚠
      </p>
      <h1 className="font-display text-2xl font-bold tracking-wide text-neutral-100 uppercase mb-3">
        Đã Có Lỗi Xảy Ra
      </h1>
      <p className="text-sm text-[color:var(--parchment-dim)] max-w-md mb-2">
        Không thể tải dữ liệu lúc này — có thể do mất kết nối cơ sở dữ liệu
        tạm thời. Vui lòng thử lại.
      </p>
      {process.env.NODE_ENV !== "production" && (
        <p className="text-xs text-red-400/70 max-w-lg mb-6 font-mono break-words">
          {error.message}
        </p>
      )}
      <div className="flex flex-wrap gap-3 justify-center mt-4">
        <button
          onClick={() => reset()}
          className="rounded-lg border border-[color:var(--gold)]/40 bg-neutral-900/40 px-5 py-2 text-sm font-medium text-[color:var(--gold-bright)] hover:border-[color:var(--gold-bright)] transition-colors"
        >
          Thử Lại
        </button>
        <Link
          href="/"
          className="rounded-lg border border-neutral-800 bg-neutral-900/40 px-5 py-2 text-sm font-medium text-neutral-300 hover:text-[color:var(--gold-bright)] hover:border-[color:var(--gold)]/40 transition-colors"
        >
          Về Trang Chủ
        </Link>
      </div>
    </div>
  );
}
