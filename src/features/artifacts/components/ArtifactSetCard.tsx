"use client";

import Link from "next/link";
import { EntityVisual } from "@/components/ui/EntityVisual";
import { localArtifactSetIcon } from "@/lib/ui/local-assets";

interface ArtifactSetCardProps {
  id: string;
  name: string;
  rarityRange: number[];
  twoPieceBonus: string | null;
  fourPieceBonus: string | null;
  imageSrc: string | null;
}

export function ArtifactSetCard({
  id,
  name,
  rarityRange,
  twoPieceBonus,
  fourPieceBonus,
  imageSrc,
}: ArtifactSetCardProps) {
  const localIcon = localArtifactSetIcon(id);
  const maxRarity = Math.max(...(rarityRange || [4]));

  return (
    <Link
      href={`/artifacts/${id}`}
      className="group relative flex flex-col h-full rounded-2xl border border-border/80 bg-bg-card hover:bg-bg-elevated/80 hover:border-border-strong hover:shadow-md transition-all duration-200 overflow-hidden"
    >
      {/* ── ĐỘ HIẾM GÓC TRÊN BÊN TRÁI ── */}
      <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-amber-300 shadow pointer-events-none">
        {maxRarity >= 5 ? "4★ - 5★" : `${maxRarity}★`}
      </div>

      {/* ── DẤU HIỆU HIỆU ỨNG 4 MÓN GÓC TRÊN BÊN PHẢI ── */}
      {fourPieceBonus && (
        <div className="absolute top-2 right-2 z-10 px-1.5 py-0.5 rounded-md bg-accent-500/20 text-accent-bright border border-accent-500/40 text-[10px] font-bold shadow pointer-events-none">
          4 Món
        </div>
      )}

      {/* ── ẢNH ĐẠI DIỆN CHÍNH BỘ THÁNH DI VẬT ── */}
      <EntityVisual
        entityType="artifact"
        entityId={id}
        alt={name}
        initialSrc={localIcon}
        fallbackSrcs={[imageSrc]}
        size="fill"
        aspectRatio="square"
        fit="contain"
        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 140px"
        wrapperClassName="w-full aspect-square bg-bg-elevated/50 p-2 overflow-hidden flex items-center justify-center"
        className="p-1 group-hover:scale-105 transition-transform duration-300 ease-out"
      />

      {/* ── KHỐI THÔNG TIN: TÊN ĐỒNG NHẤT 2 DÒNG + HIỆU ỨNG 2 MÓN ── */}
      <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 bg-bg-card/95 border-t border-border/40 text-center">
        {/* Tên bộ thánh di vật tối đa 2 dòng, cùng chiều cao */}
        <div className="h-[2.4rem] sm:h-[2.6rem] flex items-center justify-center">
          <span
            className="text-xs sm:text-[13px] font-semibold text-text-primary group-hover:text-accent-bright transition-colors line-clamp-2 leading-snug"
            title={name}
          >
            {name}
          </span>
        </div>

        {/* Hiệu ứng 2 món ngắn gọn */}
        <div className="mt-2 pt-2 border-t border-border/40 text-left">
          {twoPieceBonus ? (
            <p className="text-[11px] text-text-secondary line-clamp-2 leading-tight">
              <strong className="text-text-primary font-medium">2 Món:</strong>{" "}
              {twoPieceBonus}
            </p>
          ) : (
            <p className="text-[11px] text-text-muted italic">
              Không có kích hoạt 2 món
            </p>
          )}

          {/* Dấu hiệu cho biết có hiệu ứng 4 món thay vì đưa cả đoạn mô tả dài vào thẻ */}
          {fourPieceBonus && (
            <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] text-accent-bright font-medium">
              <span>✦</span> Có hiệu ứng 4 món riêng biệt
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
