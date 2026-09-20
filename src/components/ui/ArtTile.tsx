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
  href,
  accent = "var(--rarity-5)",
  tag,
  className = "",
  children,
}: ArtTileProps) {
  const style = {
    "--tile-accent": accent,
    background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 55%, #14141c) 0%, #0b0b10 100%)`,
  } as CSSProperties;

  const content = (
    <>
      {tag && (
        <span className="absolute right-2 top-2 z-10 rounded-full border border-white/20 bg-black/40 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
          {tag}
        </span>
      )}

      <div className="relative z-10 flex h-full flex-col items-center justify-center gap-1 px-3 py-4 text-center text-white">
        <span className="text-base font-semibold leading-tight [text-shadow:0_1px_8px_rgba(0,0,0,0.6)]">
          {label}
        </span>
        {description && (
          <span className="line-clamp-2 text-xs leading-snug text-white/75">{description}</span>
        )}
        {children}
      </div>
    </>
  );

  const base = `group relative isolate block overflow-hidden rounded-2xl border border-border min-h-36 ${className}`.trim();

  if (href) {
    return (
      <Link
        href={href}
        style={style}
        className={`${base} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:[border-color:var(--tile-accent)]`}
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
