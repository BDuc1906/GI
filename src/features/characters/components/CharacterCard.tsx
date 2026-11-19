"use client";

import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import { ElementIcon } from "@/features/characters/components/ElementIcon";
import { rarityTextClass } from "@/lib/ui/theme";

interface CharacterCardProps {
  id: string;
  name: string;
  vision: string | null;
  weaponType?: string;
  rarity: number;
  imageSrc: string | null;
  fallbackSrcs?: Array<string | null | undefined>;
  priority?: boolean;
  elementIcon?: string | null;
}

const STAR = "★";

export function CharacterCard({
  id,
  name,
  vision,
  weaponType,
  rarity,
  imageSrc,
  fallbackSrcs = [],
  priority = false,
  elementIcon,
}: CharacterCardProps) {
  return (
    <Link
      href={`/characters/${id}`}
      className="group relative flex flex-col h-full rounded-2xl border border-border/80 bg-bg-card hover:bg-bg-elevated/80 hover:border-border-strong hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* ── ICON NGUYÊN TỐ CỐ ĐỊNH Ở GÓC TRÊN BÊN TRÁI ── */}
      {vision && (
        <div className="absolute top-2 left-2 z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center shadow pointer-events-none">
          <ElementIcon vision={vision} iconUrl={elementIcon} size={15} glow={false} />
        </div>
      )}

      {/* ── ẢNH ICON CHÂN DUNG VUÔNG CHIẾM PHẦN LỚN DIỆN TÍCH ── */}
      <div className="relative w-full aspect-square bg-bg-elevated/50 p-2 overflow-hidden flex items-center justify-center">
        {imageSrc ? (
          <SafeImage
            src={imageSrc}
            fallbackSrcs={fallbackSrcs}
            alt={name}
            fill
            priority={priority}
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 140px"
            className="object-contain p-1 group-hover:scale-105 transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">
            Không có ảnh
          </div>
        )}
      </div>

      {/* ── KHỐI THÔNG TIN: TÊN ĐỒNG NHẤT 2 DÒNG + SỐ SAO CỐ ĐỊNH ── */}
      <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 bg-bg-card/95 border-t border-border/40 text-center">
        {/* Tên nhân vật tối đa 2 dòng, cùng chiều cao giữa các thẻ */}
        <div className="h-[2.4rem] sm:h-[2.6rem] flex items-center justify-center">
          <span
            className="text-xs sm:text-[13px] font-semibold text-text-primary group-hover:text-accent-bright transition-colors line-clamp-2 leading-snug"
            title={name}
          >
            {name}
          </span>
        </div>

        {/* Số sao đặt cùng một vị trí trên tất cả thẻ */}
        <div className="mt-1.5 flex items-center justify-center gap-1">
          <span className={`text-xs tracking-tight ${rarityTextClass(rarity)}`}>
            {STAR.repeat(rarity)}
          </span>
        </div>

        {/* Phụ đề loại vũ khí */}
        {weaponType && (
          <span className="text-[10px] sm:text-[11px] text-text-muted truncate mt-0.5 block">
            {weaponType}
          </span>
        )}
      </div>
    </Link>
  );
}
