"use client";

import { useState } from "react";

/**
 * Chỉ hiển thị icon nguyên tố CHUẨN lấy từ DB (iconUrl).
 * Nếu không có hoặc ảnh lỗi -> không hiện gì cả (không dùng hình/chấm dự phòng
 * nào khác để tránh gây hiểu nhầm là icon thật).
 */
export function ElementIcon({
  vision,
  iconUrl,
  size = 20,
  className = "",
}: {
  vision: string;
  iconUrl?: string | null;
  size?: number;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);

  if (!iconUrl || broken) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={iconUrl}
      alt={vision}
      width={size}
      height={size}
      className={`inline-block object-contain ${className}`}
      style={{ filter: "drop-shadow(0 0 3px rgba(0,0,0,0.5))" }}
      loading="lazy"
      onError={() => setBroken(true)}
    />
  );
}