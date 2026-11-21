"use client";

import Link from "next/link";
import { EntityVisual } from "@/components/ui/EntityVisual";
import { localMaterialIcon } from "@/lib/ui/local-assets";

interface MaterialCardProps {
  id: string;
  name: string;
  category: string;
  categoryLabel: string;
  iconUrl?: string | null;
  iconUrlOriginal?: string | null;
  gameVersion?: string | null;
}

export function MaterialCard({
  id,
  name,
  categoryLabel,
  iconUrl,
  iconUrlOriginal,
  gameVersion,
}: MaterialCardProps) {
  const localIcon = localMaterialIcon(id);

  return (
    <Link
      href={`/materials/${id}`}
      className="group relative flex flex-col h-full rounded-2xl border border-border/80 bg-bg-card hover:bg-bg-elevated/80 hover:border-border-strong hover:shadow-md transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-accent-500/40 text-center"
    >
      {/* ── PHIÊN BẢN (NẾU CÓ) Ở GÓC TRÊN BÊN PHẢI ── */}
      {gameVersion && (
        <div className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-text-muted shadow pointer-events-none">
          v{gameVersion}
        </div>
      )}

      {/* ── ICON NGUYÊN LIỆU VUÔNG ── */}
      <EntityVisual
        entityType="material"
        entityId={id}
        alt={name}
        initialSrc={localIcon}
        fallbackSrcs={[iconUrl, iconUrlOriginal]}
        size="fill"
        aspectRatio="square"
        fit="contain"
        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 140px"
        wrapperClassName="w-full aspect-square bg-bg-elevated/50 p-2 overflow-hidden flex items-center justify-center"
        className="p-1 group-hover:scale-105 transition-transform duration-300 ease-out"
      />

      {/* ── KHỐI THÔNG TIN: TÊN ĐỒNG NHẤT 2 DÒNG + DANH MỤC ── */}
      <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 bg-bg-card/95 border-t border-border/40 text-center">
        {/* Tên nguyên liệu tối đa 2 dòng, cùng chiều cao */}
        <div className="h-[2.4rem] sm:h-[2.6rem] flex items-center justify-center">
          <span
            className="text-xs sm:text-[13px] font-semibold text-text-primary group-hover:text-accent-bright transition-colors line-clamp-2 leading-snug"
            title={name}
          >
            {name}
          </span>
        </div>

        {/* Danh mục nguyên liệu ở chân thẻ */}
        <div className="mt-2 pt-1.5 border-t border-border/40 w-full truncate">
          <span className="text-[10px] sm:text-[11px] text-text-muted">
            {categoryLabel}
          </span>
        </div>
      </div>
    </Link>
  );
}
