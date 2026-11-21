"use client";

import { useState, type ReactNode } from "react";
import { Link } from "@/i18n/navigation";

interface ListFilterToolbarProps {
  searchSlot?: ReactNode;
  children?: ReactNode;
  activeCount?: number;
  clearHref?: string;
  onClear?: () => void;
  clearLabel?: string;
  mobileFilterLabel?: string;
  resultCount?: ReactNode;
  className?: string;
}

/**
 * Thanh công cụ bộ lọc & tìm kiếm chuẩn hóa cho LEIBO List Page Design System v1.0.
 * Hỗ trợ:
 * - Ô tìm kiếm tích hợp
 * - Thu gọn/mở rộng bộ lọc trên Mobile để không chiếm dụng màn hình
 * - Hiển thị badge số lượng bộ lọc đang kích hoạt
 * - Nút xóa nhanh tất cả bộ lọc
 * - Luôn hiển thị đầy đủ trên Desktop (md:block)
 */
export function ListFilterToolbar({
  searchSlot,
  children,
  activeCount = 0,
  clearHref,
  onClear,
  clearLabel = "Xóa bộ lọc",
  mobileFilterLabel = "Bộ lọc",
  resultCount,
  className = "",
}: ListFilterToolbarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div
      className={`surface-glass rounded-2xl border border-border/80 p-4 sm:p-5 space-y-4 shadow-sm ${className}`}
    >
      {/* ── HÀNG 1: Ô TÌM KIẾM + NÚT TOGGLE BỘ LỌC MOBILE + RESET ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Vùng tìm kiếm */}
        <div className="flex-1 min-w-0">{searchSlot}</div>

        {/* Nút bấm điều khiển & trạng thái */}
        <div className="flex items-center gap-2 justify-between sm:justify-end shrink-0">
          {/* Nút mở rộng bộ lọc trên Mobile */}
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            aria-expanded={isMobileOpen}
            className="md:hidden inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-bg-elevated text-text-primary border border-border hover:border-accent-500/50 transition-colors"
          >
            <svg
              className="w-3.5 h-3.5 text-accent-bright"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            <span>{mobileFilterLabel}</span>
            {activeCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-accent-500 text-bg-primary text-[10px] font-bold flex items-center justify-center">
                {activeCount}
              </span>
            )}
            <span className="text-[10px] text-text-muted ml-0.5">
              {isMobileOpen ? "▲" : "▼"}
            </span>
          </button>

          {/* Nút xóa nhanh tất cả bộ lọc */}
          {activeCount > 0 && (
            <>
              {clearHref ? (
                <Link
                  href={clearHref}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-accent-bright hover:underline hover:bg-accent-500/10 transition-colors"
                >
                  <span>&times;</span>
                  <span>{clearLabel}</span>
                </Link>
              ) : onClear ? (
                <button
                  type="button"
                  onClick={onClear}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-accent-bright hover:underline hover:bg-accent-500/10 transition-colors"
                >
                  <span>&times;</span>
                  <span>{clearLabel}</span>
                </button>
              ) : null}
            </>
          )}

          {/* Result count slot (nếu truyền) */}
          {resultCount && (
            <div className="hidden sm:block text-xs text-text-muted">{resultCount}</div>
          )}
        </div>
      </div>

      {/* ── HÀNG 2: CÁC NHÓM BỘ LỌC (TỰ ĐỘNG THU GỌN TRÊN MOBILE, LUÔN HIỆN TRÊN DESKTOP) ── */}
      {children && (
        <div
          className={`${
            isMobileOpen ? "block" : "hidden"
          } md:block pt-3 border-t border-border/50 space-y-3 transition-all duration-200`}
        >
          {children}
        </div>
      )}
    </div>
  );
}
