import { SafeImage } from "@/components/ui/SafeImage";

type ThumbSize = "sm" | "md" | "lg" | "banner";

const SIZE_CLASS: Record<ThumbSize, string> = {
  sm: "w-10 h-10",
  md: "w-14 h-14",
  lg: "w-24 h-24",
  banner: "w-full aspect-[16/9]",
};

const SIZES_ATTR: Record<ThumbSize, string> = {
  sm: "40px",
  md: "56px",
  lg: "96px",
  banner: "(max-width: 768px) 100vw, 400px",
};

interface EntityThumbProps {
  /** URL theo thứ tự thử (xem imageFor / imageCandidates). Rỗng → chỉ hiện biểu tượng loại. */
  candidates: string[];
  alt: string;
  size?: ThumbSize;
  round?: boolean;
  /** "cover" cho ảnh phong cảnh/nền; mặc định "contain" cho icon. */
  fit?: "contain" | "cover";
  priority?: boolean;
  className?: string;
}

/** Ô ảnh vuông/tròn/banner có biểu tượng thay thế theo loại. Tự bọc `relative` nên dùng ở đâu cũng được. */
export function EntityThumb({
  candidates,
  alt,
  size = "sm",
  round = false,
  fit = "contain",
  priority,
  className = "",
}: EntityThumbProps) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-bg-elevated text-text-muted ${SIZE_CLASS[size]} ${
        round ? "rounded-full" : "rounded-lg"
      } ${className}`}
    >
      <SafeImage
        src={candidates[0]}
        fallbackSrcs={candidates.slice(1)}
        alt={alt}
        fill
        sizes={SIZES_ATTR[size]}
        priority={priority}
        className={fit === "cover" ? "object-cover" : "object-contain p-0.5"}
        fallbackClassName="w-full h-full flex items-center justify-center"
      />
    </div>
  );
}
