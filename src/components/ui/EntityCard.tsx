import type { ReactNode, CSSProperties } from "react";
import Link from "next/link";
import { SafeImage } from "./SafeImage";
import { TiltCard } from "./TiltCard";
import { rarityDotClass, rarityRibbonClass, rarityStars } from "@/lib/ui/theme";

interface EntityCardProps {
  href: string;
  name: string;
  subtitle: string;
  rarity: number;
  imageSrc: string | null;
  imageFit?: "cover" | "contain";
  /** "portrait" = thẻ bài dọc (3:4, dùng splash art). "square" = icon
   *  vuông — mặc định giờ đây, vì lưới danh sách chuyển sang dùng icon
   *  thay vì splash art (xem resolveCharacterCardImage). Bỏ qua khi
   *  imageGrow=true. */
  aspect?: "square" | "portrait";
  /** true = lưới tra cứu mật độ cao (danh sách /characters, /weapons):
   *  bỏ hiệu ứng tilt 3D (nhiều card nhỏ + tilt liên tục khi rê chuột =
   *  rối mắt, ngược lại đúng mục tiêu ban đầu của TiltCard), rút gọn
   *  text dưới ảnh xuống chỉ còn tên. false (mặc định) = trang chủ/nổi
   *  bật: giữ đầy đủ hiệu ứng + subtitle + rarity stars. */
  compact?: boolean;
  /** true = ảnh giãn lấp đầy phần chiều cao còn lại (flex-1) thay vì giữ
   *  tỉ lệ cố định (aspect-square/3:4). Dùng cho tile chiếm nhiều ô trong
   *  lưới bento (vd. col-span-2 row-span-2) — nếu vẫn giữ aspect cố định,
   *  ảnh sẽ không lấp hết chiều cao 2 hàng, khiến tile không thẳng đáy
   *  với các card nhỏ bên cạnh. */
  imageGrow?: boolean;
  priority?: boolean;
  sizes?: string;
  cornerBadge?: ReactNode;
  imageSlot?: ReactNode;
  /** Màu nguyên tố riêng (var(--el-pyro) v.v.) — quyết định màu glow khi hover.
   *  Không truyền = dùng accent trung lập (vd. trang vũ khí không có nguyên tố). */
  elementColor?: string;
  /** Class thêm vào root của card (vd. "col-span-2 row-span-2" khi dùng
   *  trong lưới bento). Áp TRỰC TIẾP lên <Link>/<TiltCard> — KHÔNG bọc
   *  thêm <div> bên ngoài, vì grid item phải chính là root card thì
   *  "h-full" mới giãn đúng theo track của ô lưới cha; bọc thêm 1 lớp
   *  div sẽ khiến div đó giãn còn card bên trong vẫn theo chiều cao nội
   *  dung tự nhiên, gây lệch đáy giữa tile lớn/nhỏ. */
  wrapperClassName?: string;
}

const DEFAULT_SIZES =
  "(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 130px";

/**
 * Card dùng chung cho nhân vật / vũ khí / artifact. Rarity thể hiện qua
 * ribbon góc + dot nhỏ cạnh tên. Khi hover, card phát sáng theo ĐÚNG màu
 * nguyên tố của chính nó (--el) — ẩn dụ cơ chế "phản ứng nguyên tố" của
 * game, thay vì 1 màu vàng chung cho mọi thứ.
 *
 * Root luôn "h-full flex flex-col": khi đặt trong CSS grid, card tự giãn
 * lấp đúng chiều cao track được cấp (mặc định align-items: stretch của
 * grid) — đảm bảo mọi card trong cùng 1 hàng luôn thẳng đáy với nhau, kể
 * cả khi 1 card chiếm nhiều hàng hơn (xem wrapperClassName + imageGrow).
 */
export function EntityCard({
  href,
  name,
  subtitle,
  rarity,
  imageSrc,
  imageFit = "cover",
  aspect = "square",
  compact = false,
  imageGrow = false,
  priority = false,
  sizes = DEFAULT_SIZES,
  cornerBadge,
  imageSlot,
  elementColor,
  wrapperClassName,
}: EntityCardProps) {
  const style = elementColor ? ({ "--el": elementColor } as CSSProperties) : undefined;

  const imageShapeClass = imageGrow ? "flex-1" : aspect === "portrait" ? "aspect-[3/4]" : "aspect-square";

  const inner = (
    <div style={style} className="h-full flex flex-col">
      <span className={rarityRibbonClass(rarity)} aria-hidden />
      <div
        className={`relative w-full overflow-hidden ${imageShapeClass} ${
          imageFit === "contain" ? "bg-bg-elevated p-3" : "bg-bg-elevated"
        }`}
      >
        {imageSlot ? (
          imageSlot
        ) : imageSrc ? (
          <SafeImage
            src={imageSrc}
            alt={name}
            fill
            priority={priority}
            sizes={sizes}
            className={`${
              imageFit === "contain" ? "object-contain p-2" : "object-cover"
            } group-hover:scale-[1.05] transition-transform duration-500 ease-out`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
            Không có ảnh
          </div>
        )}
        {cornerBadge && (
          <div className="absolute top-2 left-2 bg-black/45 backdrop-blur-sm rounded-full p-1">
            {cornerBadge}
          </div>
        )}
      </div>
      <div className="entity-elemental-bar" />
      <div className={compact ? "px-2 py-1.5 bg-bg-card/90" : "p-3 bg-bg-card/90"}>
        <div className={`font-semibold truncate text-text-primary ${compact ? "text-xs" : "text-sm"}`}>
          {name}
        </div>
        {!compact && (
          <div className="flex justify-between items-center mt-1.5">
            <span className="text-eyebrow">{subtitle}</span>
            <span className="flex items-center gap-1.5" aria-label={`${rarity} sao`}>
              <span className={rarityDotClass(rarity)} aria-hidden />
              <span className="text-[10px] text-text-muted tracking-tight">{rarityStars(rarity)}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const cardClass = `surface-card entity-elemental relative overflow-hidden group h-full flex flex-col ${wrapperClassName ?? ""}`.trim();

  if (compact) {
    return (
      <Link href={href} className={cardClass}>
        {inner}
      </Link>
    );
  }

  return (
    <TiltCard href={href} className={cardClass}>
      {inner}
    </TiltCard>
  );
}
