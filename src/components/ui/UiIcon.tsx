/**
 * Icon giao diện dùng chung — CHỈ 2 icon: Tìm kiếm và Ngôn ngữ.
 *
 * Hình vẽ lấy nguyên từ bộ Lucide (https://lucide.dev, giấy phép ISC), không tự vẽ.
 * Nếu sau này cần thêm icon: cài `lucide-react` rồi import `Search`, `Globe`... trực tiếp
 * và xoá file này; giữ nguyên chữ ký props (size, className) nên thay thế 1-1.
 *
 * Game không có icon cho các nút này nên dùng bộ icon chuẩn thay vì vẽ tay.
 */
interface UiIconProps {
  size?: number;
  className?: string;
}

function Svg({ size = 18, className, children }: UiIconProps & { children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  );
}

/** Lucide "search" */
export function SearchIcon(props: UiIconProps) {
  return (
    <Svg {...props}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </Svg>
  );
}

/** Lucide "globe" */
export function GlobeIcon(props: UiIconProps) {
  return (
    <Svg {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </Svg>
  );
}
