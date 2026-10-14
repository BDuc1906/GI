import type { CSSProperties, ReactNode } from "react";
import { Link } from "@/i18n/navigation";

/**
 * Tile nền gradient — chữ căn giữa (kiểu lưới chọn game). Đã bỏ toàn bộ hệ
 * thống ảnh nền (art/icon/SafeImage) — tile chỉ còn nền gradient theo
 * `accent`, không phụ thuộc ảnh từ DB hay file local nào nữa.
 */
interface ArtTileProps {
  label: string;
  description?: string;
  /** Biểu tượng game Genshin Impact thật */
  icon?: string;
  /** Có href → tile là link; không có → tile tĩnh (vd. đồng hồ đếm ngược). */
  href?: string;
  /** Màu nhấn (CSS color / var) cho nền gradient + viền khi hover. */
  accent?: string;
  /** Badge nhỏ góc trên phải (Hot, Meta, Tool...). */
  tag?: string;
  className?: string;
  /** Nội dung thêm, đặt giữa dưới nhãn (vd. số đếm ngược). */
  children?: ReactNode;
}

export function ArtTile({
  label,
  description,
  icon,
  href,
  accent = "var(--rarity-5)",
  tag,
  className = "",
  children,
}: ArtTileProps) {
  const style = {
    "--tile-accent": accent,
    background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 45%, #102a24) 0%, #0a1c18 100%)`,
  } as CSSProperties;

  const content = (
    <>
      {tag && (
        <span className="absolute right-2 top-2 z-10 rounded-full border border-white/20 bg-black/50 px-2 py-0.5 text-[10px] font-semibold text-white/90 backdrop-blur-md shadow-sm">
          {tag}
        </span>
      )}

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1 px-3 py-3 text-center text-white">
        {icon && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={icon} alt="" width={36} height={36} className="w-9 h-9 object-contain drop-shadow-md group-hover:scale-110 transition-transform duration-300 mb-1" />
        )}
        <span className="text-base font-semibold leading-tight [text-shadow:0_1px_8px_rgba(0,0,0,0.6)] group-hover:text-white transition-colors">
          {label}
        </span>
        {description && (
          <span className="line-clamp-2 text-xs leading-snug text-white/70 group-hover:text-white/90 transition-colors">{description}</span>
        )}
        {children}
      </div>
      {/* Subtle border shine effect */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ring-1 ring-inset ring-white/20" />
    </>
  );

  const base = `group relative isolate block overflow-hidden rounded-2xl border border-border/70 min-h-36 ${className}`.trim();

  if (href) {
    return (
      <Link
        href={href}
        style={style}
        className={`${base} transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[color-mix(in_srgb,var(--tile-accent)_20%,transparent)] hover:[border-color:var(--tile-accent)]`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div style={style} className={base}>
      {content}
    </div>
  );
}
