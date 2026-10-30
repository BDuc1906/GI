"use client";

import { useEffect, useRef, useState } from "react";

export interface CharacterTheme {
  id: string;
  name: string;
  visionVi: string;
  colors: [string, string];
  desc: string;
}

export const CHARACTER_THEMES: CharacterTheme[] = [
  {
    id: "kazuha",
    name: "Kaedehara Kazuha",
    visionVi: "Phong · Mặc định",
    colors: ["#2dd4bf", "#dc2626"],
    desc: "Ngọc bích Anemo kết hợp phong diệp đỏ thẫm",
  },
  {
    id: "raiden",
    name: "Raiden Shogun",
    visionVi: "Lôi · Narukami",
    colors: ["#a855f7", "#6b21a8"],
    desc: "Ánh chớp tím vĩnh hằng của Lôi Thần",
  },
  {
    id: "hutao",
    name: "Hu Tao",
    visionVi: "Hỏa · Vãng Sinh",
    colors: ["#f43f5e", "#ea580c"],
    desc: "Điệp vũ hoa liên đỏ rực và tàn tro ấm áp",
  },
  {
    id: "zhongli",
    name: "Zhongli",
    visionVi: "Nham · Nham Vương",
    colors: ["#eab308", "#ca8a04"],
    desc: "Hoàng kim hổ phách và sa khoáng Liyue",
  },
  {
    id: "furina",
    name: "Furina",
    visionVi: "Thủy · Fontaine",
    colors: ["#38bdf8", "#0284c7"],
    desc: "Lam ngọc nước biển và ca kịch biển sâu",
  },
  {
    id: "nahida",
    name: "Nahida",
    visionVi: "Thảo · Sumeru",
    colors: ["#84cc16", "#4d7c0f"],
    desc: "Mầm non thảo mộc và ánh sáng trí tuệ",
  },
  {
    id: "ayaka",
    name: "Kamisato Ayaka",
    visionVi: "Băng · Inazuma",
    colors: ["#67e8f9", "#93c5fd"],
    desc: "Băng tuyết thanh nhã và bạch hạc sương mai",
  },
  {
    id: "mavuika",
    name: "Mavuika",
    visionVi: "Hỏa · Natlan",
    colors: ["#f97316", "#e11d48"],
    desc: "Ngọn lửa rực cháy và hào khí chiến binh Natlan",
  },
];

const STORAGE_KEY = "leibo_character_theme";

/**
 * Bộ chọn chủ đề màu sắc web của nhân vật Genshin Impact.
 * Nút ghi chữ "Theme" trên thanh điều hướng, mở dropdown chọn
 * màu sắc chủ đề theo nhân vật yêu thích.
 */
export function CharacterThemeSelector() {
  const [open, setOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<string>("kazuha");
  const containerRef = useRef<HTMLDivElement>(null);

  // Đọc từ localStorage lúc mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && CHARACTER_THEMES.some((t) => t.id === saved)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedTheme(saved);
        document.documentElement.setAttribute("data-char-theme", saved);
      } else {
        document.documentElement.setAttribute("data-char-theme", "kazuha");
      }
    } catch {
      // Ignored if local storage unavailable
    }
  }, []);

  // Đóng khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTheme = (themeId: string) => {
    setSelectedTheme(themeId);
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, themeId);
      document.documentElement.setAttribute("data-char-theme", themeId);
    } catch {
      // Ignored
    }
  };

  const currentTheme = CHARACTER_THEMES.find((t) => t.id === selectedTheme) || CHARACTER_THEMES[0];

  return (
    <div ref={containerRef} className="relative">
      {/* Nút bấm hiển thị chữ Theme + indicator màu nhân vật hiện tại */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Chọn chủ đề màu sắc nhân vật"
        aria-expanded={open}
        title={`Chủ đề nhân vật: ${currentTheme.name}`}
        className="inline-flex items-center gap-1.5 h-9 px-2.5 sm:px-3 rounded-xl border border-border/80 bg-bg-card/75 text-text-secondary hover:border-accent-500 hover:text-text-primary hover:bg-bg-elevated transition-all text-xs font-semibold cursor-pointer shrink-0"
      >
        {/* Biểu tượng 2 chấm màu nhân vật */}
        <span className="flex items-center -space-x-1">
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/30 shadow-xs"
            style={{ backgroundColor: currentTheme.colors[0] }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full border border-black/30 shadow-xs"
            style={{ backgroundColor: currentTheme.colors[1] }}
          />
        </span>
        <span className="tracking-wide">Theme</span>
      </button>

      {/* Menu dropdown chọn chủ đề nhân vật */}
      {open && (
        <div
          role="listbox"
          aria-label="Danh sách chủ đề màu sắc nhân vật"
          className="absolute right-0 top-full mt-2 w-72 sm:w-80 rounded-2xl border border-border bg-bg-card/95 backdrop-blur-xl shadow-2xl z-50 p-2.5 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header dropdown */}
          <div className="px-2 py-1.5 mb-1.5 border-b border-border/60 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary font-mono">
              Chủ đề nhân vật
            </span>
            <span className="text-[10px] text-text-muted">
              {CHARACTER_THEMES.length} phối màu
            </span>
          </div>

          {/* List items */}
          <div className="flex flex-col gap-1 max-h-80 overflow-y-auto pr-1">
            {CHARACTER_THEMES.map((theme) => {
              const isSelected = theme.id === selectedTheme;
              return (
                <button
                  key={theme.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`w-full text-left p-2 rounded-xl transition-all flex items-center gap-3 cursor-pointer group ${
                    isSelected
                      ? "bg-bg-elevated border border-accent-500/60 shadow-sm"
                      : "hover:bg-bg-elevated/70 border border-transparent"
                  }`}
                >
                  {/* Swatch màu đôi của nhân vật */}
                  <div className="flex items-center -space-x-1.5 shrink-0">
                    <span
                      className="w-5 h-5 rounded-full border-2 border-bg-card shadow-sm group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: theme.colors[0] }}
                    />
                    <span
                      className="w-5 h-5 rounded-full border-2 border-bg-card shadow-sm group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: theme.colors[1] }}
                    />
                  </div>

                  {/* Tên & mô tả */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={`text-xs font-bold truncate ${
                          isSelected ? "text-accent-bright" : "text-text-primary"
                        }`}
                      >
                        {theme.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-secondary text-text-muted font-medium shrink-0">
                        {theme.visionVi}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted truncate mt-0.5">
                      {theme.desc}
                    </p>
                  </div>

                  {/* Active check indicator */}
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-accent-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
