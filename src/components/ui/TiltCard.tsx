"use client";

import Link from "next/link";
import { useRef, type ReactNode } from "react";

/**
 * Thay thế cho <Link> thường ở các card nhân vật/vũ khí — thêm 2 hiệu ứng
 * khi hover, cả 2 đều dùng lại đúng tông vàng sẵn có, không thêm màu mới:
 *
 * 1. Tilt: card nghiêng rất nhẹ (tối đa 6deg) theo vị trí chuột, tạo cảm
 *    giác "vật thể có chiều sâu" thay vì ảnh phẳng — giống cách các thẻ
 *    bài vật lý phản ứng khi cầm nghiêng dưới ánh sáng.
 * 2. Shine: một dải sáng vàng RẤT mờ lướt qua theo đúng vị trí con trỏ,
 *    mô phỏng ánh kim phản chiếu trên di vật/vũ khí thật trong game.
 *
 * Biên độ cố tình giữ nhỏ (6deg, opacity thấp) — mục tiêu là cảm giác
 * "cao cấp, có hồn" chứ không phải hiệu ứng phô trương gây rối mắt khi
 * lướt nhanh qua nhiều card trong lưới.
 *
 * Tôn trọng prefers-reduced-motion: tắt hẳn tilt/shine, giữ lại hiệu ứng
 * hover cũ (translateY + border) đã có sẵn trong class .relic-frame.
 */
export function TiltCard({
  href,
  className = "",
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reducedMotion = useRef(false);

  if (typeof window !== "undefined" && reducedMotion.current === false) {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }

  function handleMove(e: React.MouseEvent<HTMLAnchorElement>) {
    if (reducedMotion.current) return;
    const el = ref.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width; // 0 → 1
    const py = (e.clientY - rect.top) / rect.height; // 0 → 1

    const maxTilt = 6; // deg — biên độ nhỏ, có chủ đích
    const rotateY = (px - 0.5) * maxTilt * 2;
    const rotateX = (0.5 - py) * maxTilt * 2;

    el.style.setProperty("--tilt-x", `${rotateX}deg`);
    el.style.setProperty("--tilt-y", `${rotateY}deg`);
    el.style.setProperty("--shine-x", `${px * 100}%`);
    el.style.setProperty("--shine-y", `${py * 100}%`);
  }

  function handleLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--tilt-x", "0deg");
    el.style.setProperty("--tilt-y", "0deg");
  }

  return (
    <Link
      ref={ref}
      href={href}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`tilt-card ${className}`}
    >
      {children}
    </Link>
  );
}
