/**
 * Icon giao diện dùng chung — sử dụng asset game Genshin Impact thật 100%.
 * Không dùng icon tự vẽ, không dùng thư viện icon ngoài (Lucide/Heroicons).
 */
interface UiIconProps {
  size?: number;
  className?: string;
}

/** Icon tìm kiếm / kho lưu trữ — dùng asset game Archive / Items chuẩn */
export function SearchIcon({ size = 18, className = "" }: UiIconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/local-genshin-assets/ui/items.png"
      alt="Search"
      width={size}
      height={size}
      className={`inline-block object-contain shrink-0 ${className}`}
      loading="lazy"
    />
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
