import type { ReactNode, CSSProperties } from "react";
import Link from "next/link";
import { SafeImage } from "./SafeImage";
import { TiltCard } from "./TiltCard";
import { RarityStars } from "./RarityStars";
import { ElementIcon } from "@/features/characters/components/ElementIcon";
import { rarityDotClass, rarityRibbonClass, rarityStars, elementColorVar, rarityColorVar } from "@/lib/ui/theme";

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
  /** Frame style: none, simple, ornate, premium */
  frameStyle?: "none" | "simple" | "ornate" | "premium";
  /** Background type: none, elemental-gradient, solid */
  backgroundType?: "none" | "elemental-gradient" | "solid";
  /** Element name for styling (Pyro, Hydro, etc.) */
  element?: string;
  /** Use enhanced RarityStars component instead of text */
  useEnhancedStars?: boolean;
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
  /**
   * URL dự phòng cho SafeImage, thử lần lượt khi imageSrc lỗi. Dùng để
   * truyền local asset path hoặc iconUrlOriginal từ DB làm fallback CDN.
   */
  fallbackSrcs?: Array<string | null | undefined>;
}

const DEFAULT_SIZES =
  "(max-width: 640px) 33vw, (max-width: 1024px) 16vw, 130px";

/** Bảng dải màu nền nguyên tố chuẩn game Genshin Impact - Đậm đà, rực rỡ, không nhạt nhẽo hay trắng xám */
const ELEMENT_GRADIENTS: Record<string, string> = {
  Pyro: "radial-gradient(circle at 50% 25%, rgba(255, 107, 61, 0.45) 0%, rgba(185, 28, 28, 0.28) 55%, #150906 100%)",
  Hydro: "radial-gradient(circle at 50% 25%, rgba(50, 180, 230, 0.45) 0%, rgba(14, 116, 144, 0.28) 55%, #05141f 100%)",
  Anemo: "radial-gradient(circle at 50% 25%, rgba(92, 212, 188, 0.45) 0%, rgba(13, 148, 136, 0.28) 55%, #061915 100%)",
  Electro: "radial-gradient(circle at 50% 25%, rgba(176, 117, 221, 0.45) 0%, rgba(126, 34, 206, 0.28) 55%, #180926 100%)",
  Dendro: "radial-gradient(circle at 50% 25%, rgba(157, 207, 70, 0.45) 0%, rgba(101, 163, 13, 0.28) 55%, #0f1c08 100%)",
  Cryo: "radial-gradient(circle at 50% 25%, rgba(140, 228, 236, 0.45) 0%, rgba(6, 182, 212, 0.28) 55%, #06181f 100%)",
  Geo: "radial-gradient(circle at 50% 25%, rgba(222, 179, 72, 0.45) 0%, rgba(180, 115, 20, 0.28) 55%, #1f1506 100%)",
};

/** Bảng dải màu nền theo phẩm cấp sao (Rarity) chuẩn game Genshin Impact */
const RARITY_GRADIENTS: Record<number, string> = {
  5: "radial-gradient(circle at 50% 25%, rgba(234, 197, 87, 0.42) 0%, rgba(180, 115, 20, 0.26) 55%, #1f1506 100%)",
  4: "radial-gradient(circle at 50% 25%, rgba(167, 136, 212, 0.42) 0%, rgba(107, 50, 160, 0.26) 55%, #180926 100%)",
  3: "radial-gradient(circle at 50% 25%, rgba(122, 165, 198, 0.42) 0%, rgba(60, 100, 140, 0.26) 55%, #0b1722 100%)",
  2: "radial-gradient(circle at 50% 25%, rgba(94, 168, 115, 0.35) 0%, rgba(45, 95, 60, 0.22) 55%, #0a1710 100%)",
  1: "radial-gradient(circle at 50% 25%, rgba(150, 150, 150, 0.35) 0%, rgba(80, 80, 80, 0.22) 55%, #121212 100%)",
};

/**
 * EntityCard — Thẻ hiển thị chuẩn game Genshin Impact
 * Tự động đồng bộ màu nền theo Nguyên Tố (Vision) hoặc Phẩm Cấp (Rarity).
 * Hover phát sáng rực rỡ theo màu nguyên tố riêng (--el).
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
  element,
  useEnhancedStars = false,
  priority = false,
  sizes = DEFAULT_SIZES,
  cornerBadge,
  imageSlot,
  elementColor,
  wrapperClassName,
  fallbackSrcs,
}: EntityCardProps) {
  const effectiveElement = element || (elementColor ? undefined : undefined);
  const finalElementColor = elementColor || (effectiveElement ? elementColorVar(effectiveElement) : rarityColorVar(rarity));

  // Gốc --el được gán TRỰC TIẾP lên container để CSS :hover thừa hưởng đúng biến màu
  const rootStyle: CSSProperties = {
    "--el": finalElementColor,
  } as CSSProperties;

  const imageShapeClass = imageGrow ? "flex-1" : aspect === "portrait" ? "aspect-[3/4]" : "aspect-square";

  // Nền thẻ: Ưu tiên màu nguyên tố của nhân vật, fallback theo độ hiếm vũ khí/vật phẩm
  const backgroundGradient = element && ELEMENT_GRADIENTS[element]
    ? ELEMENT_GRADIENTS[element]
    : RARITY_GRADIENTS[rarity] || RARITY_GRADIENTS[5];

  // Badge nguyên tố góc trên bên trái: tự động hiển thị nếu có element và chưa truyền cornerBadge riêng
  const resolvedBadge = cornerBadge ?? (element ? (
    <div className="absolute top-1.5 left-1.5 bg-black/55 backdrop-blur-md rounded-full p-1 border border-white/10 shadow-sm z-10 pointer-events-none">
      <ElementIcon vision={element} size={15} glow={false} />
    </div>
  ) : null);

  const inner = (
    <div className="h-full flex flex-col justify-between">
      <span className={rarityRibbonClass(rarity)} aria-hidden />

      {/* Vùng ảnh nhân vật/vũ khí: Đặt trực tiếp trên nền gradient nguyên tố game, không dùng hộp xám trắng */}
      <div
        className={`relative w-full overflow-hidden ${imageShapeClass} ${imageFit === "contain" ? "p-1.5" : ""}`}
        style={{ background: backgroundGradient }}
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
            fallbackSrcs={fallbackSrcs}
            className={`${
              imageFit === "contain" ? "object-contain p-1" : "object-cover"
            } group-hover:scale-105 transition-transform duration-300 ease-out`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
            Không có ảnh
          </div>
        )}

        {resolvedBadge}
      </div>

      {/* Thanh viền nguyên tố tinh tế ngăn cách ảnh và tên */}
      <div
        className="h-[2px] w-full shrink-0"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${finalElementColor} 50%, transparent 100%)`,
        }}
      />

      {/* Khối thông tin: Tên, Vũ khí/Chỉ số và Sao độ hiếm */}
      <div className={compact ? "px-2 py-1.5 bg-bg-card/95" : "p-2.5 sm:p-3 bg-bg-card/95"}>
        <div
          className={`font-semibold truncate text-text-primary group-hover:text-accent-bright transition-colors ${
            compact ? "text-xs" : "text-sm"
          }`}
          title={name}
        >
          {name}
        </div>
        {!compact && (
          <div className="flex justify-between items-center mt-1 text-xs">
            <span className="text-eyebrow text-text-muted truncate max-w-[65%]">{subtitle}</span>
            <span className="flex items-center gap-1 shrink-0" aria-label={`${rarity} sao`}>
              <span className={rarityDotClass(rarity)} aria-hidden />
              {useEnhancedStars ? (
                <RarityStars count={rarity} size="sm" />
              ) : (
                <span className="text-[10px] text-text-muted tracking-tight">{rarityStars(rarity)}</span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const cardClass = `surface-card entity-elemental relative overflow-hidden group h-full flex flex-col rounded-xl border border-border/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${wrapperClassName ?? ""}`.trim();

  if (compact) {
    return (
      <Link href={href} className={cardClass} style={rootStyle}>
        {inner}
      </Link>
    );
  }

  return (
    <TiltCard href={href} className={cardClass} style={rootStyle}>
      {inner}
    </TiltCard>
  );
}
