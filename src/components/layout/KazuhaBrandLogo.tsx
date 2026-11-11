"use client";

import React from "react";

interface KazuhaBrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  withSubtitle?: boolean;
}

export function KazuhaBrandLogo({
  className = "",
  size = "md",
  withSubtitle = true,
}: KazuhaBrandLogoProps) {
  const iconDimensions = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
  }[size];

  const titleSize = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none group ${className}`}>
      {/* Biểu tượng Lá Phong Gió Thu Kazuha (Kazuha Momiji Crest) */}
      <div className={`relative ${iconDimensions} shrink-0 transition-transform duration-300 group-hover:scale-110`}>
        {/* Làn gió xoáy Anemo phát sáng nền (Anemo Aura) */}
        <div
          className="absolute inset-0 rounded-full blur-[6px] opacity-40 group-hover:opacity-75 transition-opacity"
          style={{
            background: "radial-gradient(circle, rgba(45,212,191,0.6) 0%, rgba(244,63,94,0.4) 70%, transparent 100%)",
          }}
        />

        {/* Khung viền huy hiệu Ronin tinh tế */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full relative z-10 drop-shadow-md"
        >
          <defs>
            {/* Gradient Lá Phong Đỏ Thu (Momiji Red Gradient) */}
            <linearGradient id="kazuhaMapleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="45%" stopColor="#e11d48" />
              <stop offset="85%" stopColor="#fb923c" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>

            {/* Gradient Làn Gió Phong (Anemo Wind Teal Gradient) */}
            <linearGradient id="kazuhaAnemoGrad" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#14b8a6" />
              <stop offset="50%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#99f6e4" />
            </linearGradient>

            {/* Hiệu ứng ánh kim Vàng Lãng Khách */}
            <linearGradient id="kazuhaGoldShine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Vòng cung gió Anemo cuộn tròn (Chihayaburu Wind Spiral) */}
          <path
            d="M 6 24 C 6 12 18 4 28 6 C 38 8 44 18 42 28 C 40 38 30 44 20 42 C 12 40 8 32 10 26"
            stroke="url(#kazuhaAnemoGrad)"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeDasharray="45 10"
            className="transition-all duration-700 group-hover:rotate-45"
            style={{ transformOrigin: "center" }}
          />

          {/* Vết chém kiếm đạo Ronin (Katana Slash Arc) */}
          <path
            d="M 4 38 Q 24 20 44 10"
            stroke="url(#kazuhaGoldShine)"
            strokeWidth="1.5"
            strokeLinecap="round"
            opacity="0.8"
          />

          {/* Biểu tượng Lá Phong Phong Cách Inazuma (Stylized Momiji Leaf) */}
          <path
            d="M 24 7 
               C 25 12, 28 15, 33 13 
               C 32 17, 36 20, 41 21 
               C 36 23, 35 27, 38 32 
               C 33 30, 30 33, 29 38 
               C 27 34, 25 35, 24 41 
               C 23 35, 21 34, 19 38 
               C 18 33, 15 30, 10 32 
               C 13 27, 12 23, 7 21 
               C 12 20, 16 17, 15 13 
               C 20 15, 23 12, 24 7 Z"
            fill="url(#kazuhaMapleGrad)"
            stroke="#ffe4e6"
            strokeWidth="1.2"
          />

          {/* Gân lá phong phong cách ấn chú Nguyên tố Phong */}
          <path
            d="M 24 13 L 24 37"
            stroke="#fff"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.85"
          />
          <path
            d="M 24 20 L 32 16"
            stroke="#fff"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            d="M 24 20 L 16 16"
            stroke="#fff"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            d="M 24 26 L 33 24"
            stroke="#fff"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.75"
          />
          <path
            d="M 24 26 L 15 24"
            stroke="#fff"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.75"
          />

          {/* Hạt linh hồn gió lấp lánh tâm lá phong */}
          <circle cx="24" cy="20" r="2.2" fill="#99f6e4" />
        </svg>
      </div>

      {/* Typography Tên Thương Hiệu LEIBO */}
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-1.5 leading-none">
          <span
            className={`font-display font-black tracking-wider ${titleSize} transition-all duration-300 drop-shadow-sm`}
            style={{
              background:
                "linear-gradient(105deg, #2dd4bf 0%, #fef08a 32%, #f43f5e 72%, #fb923c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            LEIBO
          </span>
          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded border border-rose-500/30 bg-rose-500/10 text-rose-400">
            楓
          </span>
        </div>

        {withSubtitle && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-[9px] font-mono tracking-[0.22em] text-text-muted uppercase font-bold group-hover:text-teal-400 transition-colors">
              TEYVAT ARCHIVES
            </span>
            <span className="w-1 h-1 rounded-full bg-amber-400/80 animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
}
