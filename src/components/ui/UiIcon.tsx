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

/** Icon Paimon trợ thủ / ngôn ngữ — dùng asset game Paimon chuẩn */
export function GlobeIcon({ size = 18, className = "" }: UiIconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/local-genshin-assets/ui/paimon_hello.png"
      alt="Language"
      width={size}
      height={size}
      className={`inline-block object-contain shrink-0 ${className}`}
      loading="lazy"
    />
  );
}
