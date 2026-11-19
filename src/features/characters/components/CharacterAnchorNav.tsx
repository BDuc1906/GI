"use client";

import { useEffect, useState } from "react";

interface AnchorItem {
  id: string;
  label: string;
  icon: string;
}

const ANCHORS: AnchorItem[] = [
  { id: "hero", label: "Tổng quan", icon: "✦" },
  { id: "build", label: "Build khuyên dùng", icon: "⚔️" },
  { id: "teams", label: "Đội hình đề xuất", icon: "👥" },
  { id: "stats", label: "Chỉ số nhân vật", icon: "📊" },
  { id: "talents", label: "Thiên phú", icon: "⚡" },
  { id: "constellations", label: "Cung mệnh", icon: "✨" },
  { id: "materials", label: "Nguyên liệu", icon: "📦" },
];

interface CharacterAnchorNavProps {
  elementColor?: string;
}

export function CharacterAnchorNav({ elementColor }: CharacterAnchorNavProps) {
  const [activeId, setActiveId] = useState<string>("hero");
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Xác định xem thanh đã cuộn qua vùng Hero chưa để bật style nổi
      setIsSticky(window.scrollY > 300);

      const sectionElements = ANCHORS.map((a) => ({
        id: a.id,
        el: document.getElementById(a.id),
      })).filter((item): item is { id: string; el: HTMLElement } => item.el !== null);

      const scrollPos = window.scrollY + 160;

      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const item = sectionElements[i];
        if (item.el.offsetTop <= scrollPos) {
          setActiveId(item.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const navOffset = 90;
    const elementPosition = el.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - navOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  return (
    <nav
      aria-label="Điều hướng nhanh trang nhân vật"
      className={`sticky top-16 z-30 mb-8 py-2.5 px-3 rounded-2xl transition-all duration-200 border ${
        isSticky
          ? "bg-bg-card/95 backdrop-blur-md border-border/80 shadow-lg"
          : "bg-bg-elevated/60 border-border/50"
      }`}
    >
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
        {ANCHORS.map((anchor) => {
          const isActive = activeId === anchor.id;
          return (
            <button
              key={anchor.id}
              onClick={() => scrollToSection(anchor.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                isActive
                  ? "bg-accent-500 text-bg-primary shadow-sm ring-1 ring-accent-500/50"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
              }`}
              style={
                isActive && elementColor
                  ? {
                      backgroundColor: elementColor,
                      color: "#fff",
                    }
                  : undefined
              }
            >
              <span className="text-[11px] opacity-90">{anchor.icon}</span>
              <span>{anchor.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
