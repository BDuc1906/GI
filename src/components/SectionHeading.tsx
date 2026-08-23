import type { ReactNode } from "react";

/**
 * Heading section dùng chung cho trang chi tiết (nhân vật/vũ khí). Thay
 * cho 6 khối lặp lại "font-display uppercase border-b text-gold" ở bản cũ.
 * `elementColor` cho phép hairline nhuộm màu nguyên tố của chính trang đó
 * (vd trang Hồ Đào sẽ có hairline hơi ánh đỏ cam) — chi tiết rất nhỏ,
 * không lấn át nội dung, nhưng nối liền với hệ màu nguyên tố toàn site.
 */
export function SectionHeading({
  children,
  elementColor,
}: {
  children: ReactNode;
  elementColor?: string;
}) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <h2 className="font-display text-display-3 font-semibold text-text-primary shrink-0">
        {children}
      </h2>
      <span
        className="flex-1 h-px"
        style={{ background: elementColor ? `color-mix(in srgb, ${elementColor} 55%, var(--border-color))` : "var(--border-color)" }}
        aria-hidden
      />
    </div>
  );
}
