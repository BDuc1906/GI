"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { elementColorVar } from "@/lib/ui/theme";

/**
 * Icon nguyên tố với animation và glow effects chuẩn game Genshin Impact
 * 
 * @param vision - Tên nguyên tố (Pyro, Hydro, Anemo, Electro, Dendro, Cryo, Geo)
 * @param iconUrl - URL icon từ DB
 * @param size - Kích thước icon (default: 20px)
 * @param animated - Bật/tắt animation pulse/glow
 * @param glow - Bật/tắt glow effect
 * @param className - Class CSS bổ sung
 */
export function ElementIcon({
  vision,
  iconUrl,
  size = 20,
  animated = false,
  glow = true,
  className = "",
}: {
  vision: string;
  iconUrl?: string | null;
  size?: number;
  animated?: boolean;
  glow?: boolean;
  className?: string;
}) {
  const [broken, setBroken] = useState(false);

  if (!iconUrl || broken) return null;

  const elementColor = elementColorVar(vision);
  const glowStyle = glow ? {
    boxShadow: `0 0 ${size * 0.3}px ${elementColor}40, 0 0 ${size * 0.6}px ${elementColor}20`,
    filter: `drop-shadow(0 0 ${size * 0.15}px ${elementColor})`
  } : {
    filter: "drop-shadow(0 0 3px rgba(0,0,0,0.5))"
  };

  return (
    <div 
      className={cn(
        "relative inline-flex items-center justify-center",
        animated && "animate-elemental-pulse",
        className
      )}
      style={{ 
        width: size, 
        height: size,
        '--el': elementColor
      } as React.CSSProperties}
    >
      {/* Glow ring behind icon */}
      {glow && (
        <div 
          className="absolute inset-0 rounded-full opacity-50"
          style={{
            background: `radial-gradient(circle, ${elementColor}40 0%, transparent 70%)`,
            animation: animated ? 'glow-pulse 2s ease-in-out infinite' : undefined
          }}
        />
      )}
      
      {/* Main icon */}
      <img
        src={iconUrl}
        alt={vision}
        width={size}
        height={size}
        className="relative z-10 object-contain"
        style={glowStyle}
        loading="lazy"
        onError={() => setBroken(true)}
      />
    </div>
  );
}