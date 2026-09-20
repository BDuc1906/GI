import { cn } from "@/lib/utils";
import { elementColorVar } from "@/lib/ui/theme";

interface ElementalFrameProps {
  element: string;
  variant?: "simple" | "ornate" | "premium";
  animated?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Component frame trang trí theo nguyên tố chuẩn game Genshin Impact
 * 
 * @param element - Tên nguyên tố (Pyro, Hydro, Anemo, Electro, Dendro, Cryo, Geo)
 * @param variant - Kiểu frame: simple (đơn giản), ornate (trang trí), premium (cao cấp)
 * @param animated - Bật/tắt animation
 * @param children - Nội dung bên trong frame
 * @param className - Class CSS bổ sung
 */
export function ElementalFrame({ 
  element, 
  variant = "ornate", 
  animated = true, 
  children, 
  className 
}: ElementalFrameProps) {
  const elementColor = elementColorVar(element);
  
  const frameStyles = {
    simple: "border-2",
    ornate: "border-3 border-double",
    premium: "border-4"
  };

  const glowIntensity = {
    simple: "shadow-sm",
    ornate: "shadow-md", 
    premium: "shadow-lg"
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg",
        frameStyles[variant],
        glowIntensity[variant],
        animated && "animate-frame-glow",
        className
      )}
      style={{
        borderColor: elementColor,
        boxShadow: animated 
          ? `0 0 20px ${elementColor}40, 0 0 40px ${elementColor}20, inset 0 0 20px ${elementColor}10`
          : `0 0 10px ${elementColor}30`,
        '--el': elementColor
      } as React.CSSProperties}
    >
      {/* Decorative corner elements */}
      {variant === "ornate" || variant === "premium" ? (
        <>
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 opacity-60" style={{ borderColor: elementColor }} />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 opacity-60" style={{ borderColor: elementColor }} />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 opacity-60" style={{ borderColor: elementColor }} />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 opacity-60" style={{ borderColor: elementColor }} />
        </>
      ) : null}

      {/* Inner glow effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(circle at center, ${elementColor}20 0%, transparent 70%)`,
        }}
      />

      {/* Animated shine effect */}
      {animated && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-0 hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, transparent 0%, ${elementColor}10 50%, transparent 100%)`,
            animation: 'shine-sweep 3s ease-in-out infinite'
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}