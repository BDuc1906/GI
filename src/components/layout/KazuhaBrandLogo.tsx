"use client";

import React from "react";

interface KazuhaBrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withSubtitle?: boolean;
}

/**
 * Biểu tượng Thương Hiệu Kazuha Kaedehara (LEIBO)
 * Sử dụng 100% asset game Genshin Impact chính thức từ HoYoverse:
 * - Avatar Kaedehara Kazuha chính thức từ game client
 * - Hào quang nguyên tố Phong Anemo phát sáng
 * - Tuyệt đối không dùng icon tự vẽ / vector thủ công ngoài game
 */
export function KazuhaBrandLogo({
  className = "",
  size = "md",
  withSubtitle = true,
}: KazuhaBrandLogoProps) {
  const iconDimensions = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  }[size];

  const titleSize = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none group ${className}`}>
      {/* Huy hiệu Kazuha chính thức từ game client */}
      <div className={`relative ${iconDimensions} shrink-0 transition-transform duration-300 group-hover:scale-105`}>
        {/* Lớp hào quang Anemo phát sáng nền (Anemo Jade Glow) */}
        <div
          className="absolute inset-0 rounded-full blur-[8px] opacity-40 group-hover:opacity-80 transition-opacity"
          style={{
            background:
              "radial-gradient(circle, rgba(45,212,191,0.65) 0%, rgba(244,63,94,0.45) 55%, transparent 100%)",
          }}
        />

        {/* Khung Icon nhân vật chính thức từ game client */}
        <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-emerald-400/60 group-hover:border-teal-300 transition-colors shadow-md bg-gradient-to-br from-emerald-950/80 to-teal-900/60 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/local-genshin-assets/characters/icon/kaedehara-kazuha.png"
            alt="Kaedehara Kazuha"
            className="w-full h-full object-cover scale-110 group-hover:scale-120 transition-transform duration-300"
            width={48}
            height={48}
          />
        </div>
      </div>

      {/* Typography thương hiệu LEIBO mang phong vị kiếm sĩ lãng du */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-display font-black tracking-wider ${titleSize} transition-all duration-300 drop-shadow-sm`}
            style={{
              background:
                "linear-gradient(105deg, #2dd4bf 0%, #fef08a 35%, #f43f5e 72%, #fb923c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            LEIBO
          </span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border border-rose-500/30 bg-rose-500/10 text-rose-400">
            楓
          </span>
        </div>

        {withSubtitle && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[9px] font-mono tracking-[0.22em] text-text-muted uppercase font-bold group-hover:text-teal-400 transition-colors">
              TEYVAT ARCHIVES
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400/80 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
