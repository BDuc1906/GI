import type { ReactNode } from "react";

interface ListPageLayoutProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "7xl" | "6xl" | "full";
}

/**
 * Khung chứa chuẩn mực cho mọi trang danh sách thực thể LEIBO.
 * Chuẩn hóa padding, responsive gutter và ngăn ngừa tràn ngang (overflow-x).
 */
export function ListPageLayout({
  children,
  className = "",
  maxWidth = "7xl",
}: ListPageLayoutProps) {
  const maxWClass =
    maxWidth === "6xl"
      ? "max-w-6xl"
      : maxWidth === "full"
      ? "max-w-full"
      : "max-w-7xl";

  return (
    <main
      className={`w-full ${maxWClass} mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 overflow-x-hidden ${className}`}
    >
      {children}
    </main>
  );
}
