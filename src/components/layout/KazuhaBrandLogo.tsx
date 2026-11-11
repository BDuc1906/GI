"use client";

import React from "react";

interface KazuhaBrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withSubtitle?: boolean;
}

/**
 * Biểu tượng Thương Hiệu Kazuha Kaedehara (LEIBO)
 * Thiết kế chuẩn xác 100% theo phong cách Splash Art nhân vật Kaedehara Kazuha:
 * - Lá phong Đỏ Thu Inazuma Momiji đặc trưng với gân lá màu trắng ngà sắc nét.
 * - Lá phong Ngọc Phong Anemo màu xanh mint bay lượn bên cạnh.
 * - Dải lụa gió Anemo xoáy lốc (Chihayaburu Wind Spiral) & vệt chém kiếm đạo Katana phát sáng.
 * - Mây Kasumi vàng kim truyền thống Nhật Bản.
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
      {/* Huy hiệu Lá Phong & Làn Gió Kazuha */}
      <div className={`relative ${iconDimensions} shrink-0 transition-transform duration-300 group-hover:scale-105`}>
        {/* Lớp hào quang Anemo phát sáng nền (Anemo Jade Glow) */}
        <div
          className="absolute inset-0 rounded-full blur-[8px] opacity-40 group-hover:opacity-80 transition-opacity"
          style={{
            background:
              "radial-gradient(circle, rgba(45,212,191,0.65) 0%, rgba(244,63,94,0.45) 55%, transparent 100%)",
          }}
        />

        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-md overflow-visible"
        >
          <defs>
            {/* Gradient Lá Phong Đỏ Thu Inazuma (Autumn Scarlet / Crimson) */}
            <linearGradient id="kazuhaMomijiRed" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="35%" stopColor="#e11d48" />
              <stop offset="75%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Gradient Lá Phong Ngọc Phong Anemo (Anemo Teal Leaf) */}
            <linearGradient id="kazuhaMomijiTeal" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f766e" />
              <stop offset="45%" stopColor="#14b8a6" />
              <stop offset="85%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#99f6e4" />
            </linearGradient>

            {/* Gradient Làn Gió Anemo Swirl (Wind Ribbon) */}
            <linearGradient id="kazuhaWindRibbon" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#134e4a" />
              <stop offset="40%" stopColor="#0d9488" />
              <stop offset="75%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#a5f3fc" />
            </linearGradient>

            {/* Gradient Ánh Kiếm Katana Vàng Kim / Thanh Ngọc */}
            <linearGradient id="kazuhaKatanaSlash" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2dd4bf" />
              <stop offset="60%" stopColor="#a5f3fc" />
              <stop offset="100%" stopColor="#ffffff" />
            </linearGradient>

            {/* Mây Kasumi Vàng Kim Cổ Điển */}
            <linearGradient id="kazuhaKasumiGold" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.9" />
            </linearGradient>

            {/* Bộ lọc đổ bóng phát sáng */}
            <filter id="anemoGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Dải mây Kasumi vàng kim truyền thống Nhật Bản phía sau */}
          <g opacity="0.8" className="transition-all duration-500 group-hover:opacity-100">
            {/* Thanh mây ngang bo tròn trên */}
            <rect x="12" y="24" width="28" height="3" rx="1.5" fill="url(#kazuhaKasumiGold)" />
            <rect x="22" y="29" width="20" height="2.5" rx="1.25" fill="url(#kazuhaKasumiGold)" />
            {/* Thanh mây ngang bo tròn dưới */}
            <rect x="62" y="68" width="26" height="3" rx="1.5" fill="url(#kazuhaKasumiGold)" />
            <rect x="56" y="73" width="22" height="2.5" rx="1.25" fill="url(#kazuhaKasumiGold)" />
          </g>

          {/* 2. Dải lụa gió Anemo cuộn tròn quanh huy hiệu (Chihayaburu Wind Spiral) */}
          <path
            d="M 12 56 
               C 8 36, 20 14, 46 12 
               C 74 10, 92 28, 88 56 
               C 84 80, 62 92, 40 88 
               C 22 84, 14 70, 18 56"
            stroke="url(#kazuhaWindRibbon)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeDasharray="95 12"
            className="transition-transform duration-1000 ease-out group-hover:rotate-45"
            style={{ transformOrigin: "50px 50px" }}
          />

          {/* 3. Vết chém kiếm đạo Katana tỏa sáng (Cyan Wind Blade Arc) */}
          <path
            d="M 10 82 Q 50 48 90 18"
            stroke="url(#kazuhaKatanaSlash)"
            strokeWidth="2"
            strokeLinecap="round"
            filter="url(#anemoGlow)"
            className="transition-opacity duration-300 group-hover:opacity-100 opacity-80"
          />

          {/* 4. Lá phong nhỏ màu xanh Anemo bay theo gió (như trong splash art) */}
          <g
            transform="translate(68, 16) rotate(-22) scale(0.38)"
            className="transition-transform duration-700 group-hover:translate-x-1 group-hover:-translate-y-1"
          >
            {/* Thân lá phong xanh */}
            <path
              d="M 50 6 
                 C 53 17, 56 22, 63 24 
                 C 58 28, 56 34, 57 41 
                 C 64 35, 68 31, 74 30 
                 C 73 36, 78 37, 90 40 
                 C 82 46, 80 49, 81 54 
                 C 74 55, 69 55, 66 58 
                 C 74 61, 79 64, 84 69 
                 C 76 72, 73 73, 69 74 
                 C 64 70, 57 70, 52 74 
                 L 52 95 
                 C 52 96, 48 96, 48 95 
                 L 48 74 
                 C 43 70, 36 70, 31 74 
                 C 27 73, 24 72, 16 69 
                 C 21 64, 26 61, 34 58 
                 C 31 55, 26 55, 19 54 
                 C 20 49, 18 46, 10 40 
                 C 22 37, 27 36, 26 30 
                 C 32 31, 36 35, 43 41 
                 C 44 34, 42 28, 37 24 
                 C 44 22, 47 17, 50 6 Z"
              fill="url(#kazuhaMomijiTeal)"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            {/* Gân lá màu trắng ngà */}
            <path
              d="M 50 74 L 50 14 M 50 74 L 88 41 M 50 74 L 12 41 M 50 74 L 82 68 M 50 74 L 18 68"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
              opacity="0.95"
            />
          </g>

          {/* 5. LÁ PHONG ĐỎ THU TRUNG TÂM (Chuẩn xác hình dáng & gân lá trong ảnh) */}
          <g
            transform="translate(18, 14) rotate(10) scale(0.68)"
            className="transition-transform duration-500 group-hover:scale-[0.72]"
            style={{ transformOrigin: "50px 50px" }}
          >
            {/* Thân lá phong Đỏ Kazuha */}
            <path
              d="M 50 6 
                 C 53 17, 56 22, 63 24 
                 C 58 28, 56 34, 57 41 
                 C 64 35, 68 31, 74 30 
                 C 73 36, 78 37, 90 40 
                 C 82 46, 80 49, 81 54 
                 C 74 55, 69 55, 66 58 
                 C 74 61, 79 64, 84 69 
                 C 76 72, 73 73, 69 74 
                 C 64 70, 57 70, 52 74 
                 L 52 95 
                 C 52 96, 48 96, 48 95 
                 L 48 74 
                 C 43 70, 36 70, 31 74 
                 C 27 73, 24 72, 16 69 
                 C 21 64, 26 61, 34 58 
                 C 31 55, 26 55, 19 54 
                 C 20 49, 18 46, 10 40 
                 C 22 37, 27 36, 26 30 
                 C 32 31, 36 35, 43 41 
                 C 44 34, 42 28, 37 24 
                 C 44 22, 47 17, 50 6 Z"
              fill="url(#kazuhaMomijiRed)"
              stroke="#ffffff"
              strokeWidth="1.2"
              className="drop-shadow-sm"
            />

            {/* Hệ thống gân lá trắng ngà sắc nét tỏa ra 5 cánh như trong splash art */}
            {/* Gân chính trung tâm */}
            <path d="M 50 74 L 50 14" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.95" />
            {/* Gân sang 2 thùy lớn bên hông */}
            <path d="M 50 74 L 88 41" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.95" />
            <path d="M 50 74 L 12 41" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.95" />
            {/* Gân sang 2 thùy dưới */}
            <path d="M 50 74 L 82 68" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.95" />
            <path d="M 50 74 L 18 68" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.95" />

            {/* Các nhánh gân phụ nhỏ sắc nét */}
            <path d="M 50 52 L 61 36" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
            <path d="M 50 52 L 39 36" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
            <path d="M 50 36 L 56 24" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
            <path d="M 50 36 L 44 24" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.9" />
            <path d="M 68 58 L 73 40" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" opacity="0.85" />
            <path d="M 32 58 L 27 40" stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" opacity="0.85" />
          </g>

          {/* 6. Hạt tinh hoa phong phát sáng lấp lánh tâm lá phong */}
          <circle cx="52" cy="50" r="2.2" fill="#a5f3fc" filter="url(#anemoGlow)" />
        </svg>
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
