/**
 * Vision Ring — vòng conic-gradient ghép từ 7 màu nguyên tố chính thức
 * (xem .vision-ring trong globals.css). Đây là chữ ký thị giác DUY NHẤT
 * của LEIBO — dùng đúng 3 nơi: logo (SiteNav), nền hero, và loading state.
 * Không lặp lại thêm nơi khác để giữ ý nghĩa "đặc biệt".
 */
export function VisionRing({
  size = 22,
  spin = false,
  className = "",
}: {
  size?: number;
  spin?: boolean;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={`inline-block rounded-full vision-ring vision-ring-mask ${spin ? "animate-ring-spin" : ""} ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
