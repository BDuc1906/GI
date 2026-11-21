"use client";

import Link from "next/link";
import { EntityVisual } from "@/components/ui/EntityVisual";
import { localWeaponIcon } from "@/lib/ui/local-assets";
import { rarityTextClass } from "@/lib/ui/theme";

interface WeaponCardProps {
  id: string;
  name: string;
  type: string;
  rarity: number;
  baseAtk: number | null;
  subStatName: string | null;
  subStatValue: string | null;
  iconUrl: string | null;
}

const STAR = "★";

export function WeaponCard({
  id,
  name,
  type,
  rarity,
  baseAtk,
  subStatName,
  subStatValue,
  iconUrl,
}: WeaponCardProps) {
  const localIcon = localWeaponIcon(id);

  return (
    <Link
      href={`/weapons/${id}`}
      className="group relative flex flex-col h-full rounded-2xl border border-border/80 bg-bg-card hover:bg-bg-elevated/80 hover:border-border-strong hover:shadow-md transition-all duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-accent-500/40"
    >
      {/* ── LOẠI VŨ KHÍ GÓC TRÊN BÊN TRÁI ── */}
      <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-semibold text-text-secondary shadow pointer-events-none">
        {type}
      </div>

      {/* ── ICON VŨ KHÍ VUÔNG CHIẾM PHẦN LỚN DIỆN TÍCH ── */}
      <EntityVisual
        entityType="weapon"
        entityId={id}
        alt={name}
        initialSrc={localIcon}
        fallbackSrcs={[iconUrl]}
        size="fill"
        aspectRatio="square"
        fit="contain"
        sizes="(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 140px"
        wrapperClassName="w-full aspect-square bg-bg-elevated/50 p-2 overflow-hidden flex items-center justify-center"
        className="p-1 group-hover:scale-105 transition-transform duration-300 ease-out"
      />

      {/* ── KHỐI THÔNG TIN: TÊN ĐỒNG NHẤT 2 DÒNG + SỐ SAO + CHỈ SỐ ── */}
      <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 bg-bg-card/95 border-t border-border/40 text-center">
        {/* Tên vũ khí tối đa 2 dòng, cùng chiều cao */}
        <div className="h-[2.4rem] sm:h-[2.6rem] flex items-center justify-center">
          <span
            className="text-xs sm:text-[13px] font-semibold text-text-primary group-hover:text-accent-bright transition-colors line-clamp-2 leading-snug"
            title={name}
          >
            {name}
          </span>
        </div>

        {/* Số sao đặt cùng một vị trí */}
        <div className="mt-1 flex items-center justify-center gap-1">
          <span className={`text-xs tracking-tight ${rarityTextClass(rarity)}`}>
            {STAR.repeat(rarity)}
          </span>
        </div>

        {/* Chỉ số phụ gọn gàng: Base ATK & Substat */}
        <div className="mt-2 pt-2 border-t border-border/40 flex flex-col gap-0.5 text-[11px] text-text-secondary font-mono">
          {baseAtk && (
            <div className="flex items-center justify-between text-text-muted">
              <span>ATK Cơ bản:</span>
              <span className="font-semibold text-text-primary">{Math.round(baseAtk)}</span>
            </div>
          )}
          {subStatName && subStatValue && (
            <div className="flex items-center justify-between text-accent-bright truncate">
              <span className="truncate max-w-[90px]">{subStatName}:</span>
              <span className="font-semibold">{subStatValue}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
