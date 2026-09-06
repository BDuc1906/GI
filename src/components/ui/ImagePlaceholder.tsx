import { type ReactNode } from "react";

export interface ImagePlaceholderProps {
  icon?: ReactNode;
  label?: string;
  className?: string;
  type?: "character" | "weapon" | "artifact" | "generic";
}

export function ImagePlaceholder({ 
  icon, 
  label = "Image unavailable", 
  className = "",
  type = "generic"
}: ImagePlaceholderProps) {
  const baseClass = "w-full h-full flex flex-col items-center justify-center text-text-muted text-xs gap-1";
  
  const typeClasses: Record<string, string> = {
    character: "bg-gradient-to-br from-bg-secondary/40 to-bg-elevated/40",
    weapon: "bg-gradient-to-br from-bg-elevated/40 to-bg-secondary/40",
    artifact: "bg-gradient-to-br from-bg-elevated/20 to-bg-secondary/20",
    generic: "bg-bg-secondary/30",
  };

  return (
    <div
      role="img"
      aria-label={label}
      className={`${baseClass} ${typeClasses[type]} ${className}`}
    >
      {icon && <div className="text-xl opacity-60">{icon}</div>}
      <span className="text-[10px]">{label}</span>
    </div>
  );
}
