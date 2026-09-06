"use client";

import { useRouter } from "@/i18n/navigation";

export interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export function BackButton({ href, label = "Back", className = "" }: BackButtonProps) {
  const router = useRouter();
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (href) {
      router.push(href);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        inline-flex items-center gap-2 text-sm text-text-secondary 
        hover:text-accent-bright transition-colors
        focus:outline-none focus:ring-2 focus:ring-accent-bright focus:ring-offset-2 
        focus:ring-offset-bg-primary rounded px-3 py-1.5
        ${className}
      `}
      aria-label={label}
    >
      <span aria-hidden>←</span>
      {label}
    </button>
  );
}
