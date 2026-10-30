/**
 * Icon giao diện dùng chung — sử dụng asset game Genshin Impact thật 100%.
 * Không dùng icon tự vẽ, không dùng thư viện icon ngoài (Lucide/Heroicons).
 */
interface UiIconProps {
  size?: number;
  className?: string;
}

/** Icon tìm kiếm — biểu tượng kính lúp chuẩn (Magnifying Glass) */
export function SearchIcon({ size = 18, className = "" }: UiIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

/** Icon quả địa cầu (Globe) chuẩn quốc tế */
export function GlobeIcon({ size = 18, className = "" }: UiIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`inline-block shrink-0 ${className}`}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
