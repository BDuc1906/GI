"use client";

import { useEffect, useRef, useState } from "react";

export interface CharacterTheme {
  id: string;
  name: string;
  element: string; // Anemo, Geo, Hydro, etc.
  elementVi: string;
  region: string; // Vùng đất
  splashPath: string; // /local-genshin-assets/characters/splash/...
  colors: [string, string]; // [primary, secondary]
  desc: string;
  // CSS variables override khi chọn theme này
  bgPrimary: string;
  bgCard: string;
  borderColor: string;
}

/**
 * Danh sách chủ đề nhân vật — 100% dữ liệu game chính xác
 * Màu sắc lấy theo vision + outfit chính thức của nhân vật
 */
export const CHARACTER_THEMES: CharacterTheme[] = [
  // ─── Anemo ───
  {
    id: "kazuha",
    name: "Kaedehara Kazuha",
    element: "Anemo",
    elementVi: "Phong",
    region: "Inazuma",
    splashPath: "/local-genshin-assets/characters/splash/kaedehara-kazuha.png",
    colors: ["#2dd4bf", "#dc2626"],
    desc: "Ngọc bích Anemo · Lá phong đỏ thẫm · Mặc định",
    bgPrimary: "#0c1a19",
    bgCard: "#122220",
    borderColor: "#1a3836",
  },
  {
    id: "wanderer",
    name: "Wanderer (Scaramouche)",
    element: "Anemo",
    elementVi: "Phong",
    region: "Sumeru",
    splashPath: "/local-genshin-assets/characters/splash/wanderer.png",
    colors: ["#6ee7b7", "#818cf8"],
    desc: "Ngọc lục bảo Anemo · Tím xanh huyền bí · Xứ sa mạc",
    bgPrimary: "#0e1220",
    bgCard: "#151c32",
    borderColor: "#1e2845",
  },
  // ─── Electro ───
  {
    id: "raiden",
    name: "Raiden Shogun",
    element: "Electro",
    elementVi: "Lôi",
    region: "Inazuma",
    splashPath: "/local-genshin-assets/characters/splash/raiden-shogun.png",
    colors: ["#a855f7", "#6b21a8"],
    desc: "Tím lôi vĩnh cửu · Lôi Thần Narukami · Nhật Nguyệt",
    bgPrimary: "#0f0b1a",
    bgCard: "#17112a",
    borderColor: "#261a45",
  },
  {
    id: "yae-miko",
    name: "Yae Miko",
    element: "Electro",
    elementVi: "Lôi",
    region: "Inazuma",
    splashPath: "/local-genshin-assets/characters/splash/yae-miko.png",
    colors: ["#f472b6", "#a855f7"],
    desc: "Hồng đào Electro · Kiko của Narukami Shrine · Linh hồ",
    bgPrimary: "#1a0f1a",
    bgCard: "#271524",
    borderColor: "#3d1e3a",
  },
  // ─── Pyro ───
  {
    id: "hutao",
    name: "Hu Tao",
    element: "Pyro",
    elementVi: "Hỏa",
    region: "Liyue",
    splashPath: "/local-genshin-assets/characters/splash/hu-tao.png",
    colors: ["#f43f5e", "#ea580c"],
    desc: "Đỏ rực Vãng Sinh · Hoa liên · Tàn tro ấm áp",
    bgPrimary: "#1a0c0c",
    bgCard: "#271212",
    borderColor: "#3d1a1a",
  },
  {
    id: "arlecchino",
    name: "Arlecchino",
    element: "Pyro",
    elementVi: "Hỏa",
    region: "Fatui",
    splashPath: "/local-genshin-assets/characters/splash/arlecchino.png",
    colors: ["#ef4444", "#1c1c1c"],
    desc: "Đỏ huyết · Trắng ngà · Hề Vương Fatui",
    bgPrimary: "#140808",
    bgCard: "#1e0d0d",
    borderColor: "#2d1515",
  },
  {
    id: "mavuika",
    name: "Mavuika",
    element: "Pyro",
    elementVi: "Hỏa",
    region: "Natlan",
    splashPath: "/local-genshin-assets/characters/splash/mavuika.png",
    colors: ["#f97316", "#e11d48"],
    desc: "Lửa Natlan · Cam rực rỡ · Hào khí Archon Pyro",
    bgPrimary: "#180e06",
    bgCard: "#221508",
    borderColor: "#3a2010",
  },
  // ─── Hydro ───
  {
    id: "furina",
    name: "Furina",
    element: "Hydro",
    elementVi: "Thủy",
    region: "Fontaine",
    splashPath: "/local-genshin-assets/characters/splash/furina.png",
    colors: ["#38bdf8", "#0284c7"],
    desc: "Lam ngọc Thủy · Ca kịch Fontaine · Thần biển sâu",
    bgPrimary: "#060f1a",
    bgCard: "#0a1826",
    borderColor: "#0f2540",
  },
  {
    id: "neuvillette",
    name: "Neuvillette",
    element: "Hydro",
    elementVi: "Thủy",
    region: "Fontaine",
    splashPath: "/local-genshin-assets/characters/splash/neuvillette.png",
    colors: ["#7dd3fc", "#1d4ed8"],
    desc: "Xanh hoàng gia Hydro · Thẩm phán Fontaine · Rồng biển",
    bgPrimary: "#06101e",
    bgCard: "#0a1930",
    borderColor: "#10284a",
  },
  // ─── Geo ───
  {
    id: "zhongli",
    name: "Zhongli",
    element: "Geo",
    elementVi: "Nham",
    region: "Liyue",
    splashPath: "/local-genshin-assets/characters/splash/zhongli.png",
    colors: ["#eab308", "#92400e"],
    desc: "Hoàng kim hổ phách · Sa khoáng Liyue · Nham Vương",
    bgPrimary: "#140f04",
    bgCard: "#1e1806",
    borderColor: "#32280a",
  },
  // ─── Dendro ───
  {
    id: "nahida",
    name: "Nahida",
    element: "Dendro",
    elementVi: "Thảo",
    region: "Sumeru",
    splashPath: "/local-genshin-assets/characters/splash/nahida.png",
    colors: ["#84cc16", "#4d7c0f"],
    desc: "Mầm xanh Thảo · Trí tuệ vũ trụ · Archon Sumeru",
    bgPrimary: "#080f04",
    bgCard: "#0e1a08",
    borderColor: "#162810",
  },
  {
    id: "alhaitham",
    name: "Al-Haitham",
    element: "Dendro",
    elementVi: "Thảo",
    region: "Sumeru",
    splashPath: "/local-genshin-assets/characters/splash/alhaitham.png",
    colors: ["#4ade80", "#1a6b3a"],
    desc: "Xanh lá trầm · Học giả Sumeru · Bóng tối Dendro",
    bgPrimary: "#060e08",
    bgCard: "#0a1810",
    borderColor: "#10261a",
  },
  // ─── Cryo ───
  {
    id: "ayaka",
    name: "Kamisato Ayaka",
    element: "Cryo",
    elementVi: "Băng",
    region: "Inazuma",
    splashPath: "/local-genshin-assets/characters/splash/kamisato-ayaka.png",
    colors: ["#bae6fd", "#93c5fd"],
    desc: "Băng tuyết thanh nhã · Bạch hạc sương mai · Inazuma",
    bgPrimary: "#060e14",
    bgCard: "#0a1820",
    borderColor: "#102030",
  },
  {
    id: "wriothesley",
    name: "Wriothesley",
    element: "Cryo",
    elementVi: "Băng",
    region: "Fontaine",
    splashPath: "/local-genshin-assets/characters/splash/wriothesley.png",
    colors: ["#e0f2fe", "#475569"],
    desc: "Trắng băng · Tối thép xám · Giám đốc ngục Fontaine",
    bgPrimary: "#080d12",
    bgCard: "#0e151e",
    borderColor: "#162030",
  },
];

const STORAGE_KEY = "leibo_character_theme";

/**
 * Bộ chọn chủ đề màu sắc web của nhân vật Genshin Impact.
 * Hiển thị ảnh nhân vật thật trong dropdown.
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
        applyTheme(saved);
      } else {
        applyTheme("kazuha");
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

  function applyTheme(themeId: string) {
    const theme = CHARACTER_THEMES.find((t) => t.id === themeId);
    if (!theme) return;
    const root = document.documentElement;
    root.setAttribute("data-char-theme", themeId);
    // Apply full palette
    root.style.setProperty("--char-bg-primary", theme.bgPrimary);
    root.style.setProperty("--char-bg-card", theme.bgCard);
    root.style.setProperty("--char-border", theme.borderColor);
    root.style.setProperty("--char-accent", theme.colors[0]);
    root.style.setProperty("--char-accent-2", theme.colors[1]);
  }

  const handleSelectTheme = (themeId: string) => {
    setSelectedTheme(themeId);
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, themeId);
      applyTheme(themeId);
    } catch {
      // Ignored
    }
  };

  const currentTheme = CHARACTER_THEMES.find((t) => t.id === selectedTheme) || CHARACTER_THEMES[0];

  // Element colors for vision icon badge
  const elementColors: Record<string, string> = {
    Anemo: "#5cd4bc",
    Geo: "#deb348",
    Electro: "#b075dd",
    Dendro: "#9dcf46",
    Hydro: "#32b4e6",
    Pyro: "#ff6b3d",
    Cryo: "#8ce4ec",
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Nút bấm: ảnh nhân vật nhỏ + chữ "Theme" */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Chọn chủ đề màu sắc nhân vật"
        aria-expanded={open}
        title={`Chủ đề nhân vật: ${currentTheme.name}`}
        className="inline-flex items-center gap-2 h-9 px-2.5 sm:px-3 rounded-xl border border-border/80 bg-bg-card/75 text-text-secondary hover:border-accent-500 hover:text-text-primary hover:bg-bg-elevated transition-all text-xs font-semibold cursor-pointer shrink-0"
      >
        {/* Ảnh nhân vật nhỏ */}
        <div className="relative w-6 h-6 rounded-full overflow-hidden border-2 shrink-0" style={{ borderColor: currentTheme.colors[0] }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentTheme.splashPath}
            alt={currentTheme.name}
            className="w-full h-full object-cover object-top scale-150 translate-y-1"
          />
        </div>
        <span className="tracking-wide">Theme</span>
      </button>

      {/* Menu dropdown */}
      {open && (
        <div
          role="listbox"
          aria-label="Danh sách chủ đề màu sắc nhân vật"
          className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-bg-card/98 backdrop-blur-xl shadow-2xl z-50 p-2.5 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* Header */}
          <div className="px-2 py-1.5 mb-2 border-b border-border/60 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary font-mono">
              Chủ Đề Nhân Vật
            </span>
            <span className="text-[10px] text-text-muted">
              {CHARACTER_THEMES.length} chủ đề
            </span>
          </div>

          {/* Scrollable list */}
          <div className="flex flex-col gap-0.5 max-h-80 overflow-y-auto pr-1">
            {CHARACTER_THEMES.map((theme) => {
              const isSelected = theme.id === selectedTheme;
              const elColor = elementColors[theme.element] ?? "#fff";
              return (
                <button
                  key={theme.id}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelectTheme(theme.id)}
                  className={`w-full text-left px-2 py-2 rounded-xl transition-all flex items-center gap-3 cursor-pointer group ${
                    isSelected
                      ? "bg-bg-elevated border border-accent-500/60 shadow-sm"
                      : "hover:bg-bg-elevated/60 border border-transparent"
                  }`}
                >
                  {/* Ảnh nhân vật */}
                  <div
                    className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border-2"
                    style={{ borderColor: isSelected ? theme.colors[0] : "rgba(255,255,255,0.1)" }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={theme.splashPath}
                      alt={theme.name}
                      className="w-full h-full object-cover object-top scale-[1.6] translate-y-1.5 group-hover:scale-[1.8] transition-transform duration-300"
                    />
                    {/* Vision element color overlay at bottom */}
                    <div
                      className="absolute inset-x-0 bottom-0 h-1.5 rounded-b-full opacity-80"
                      style={{ backgroundColor: elColor }}
                    />
                  </div>

                  {/* Text info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span
                        className={`text-xs font-bold truncate ${
                          isSelected ? "text-accent-bright" : "text-text-primary"
                        }`}
                      >
                        {theme.name}
                      </span>
                      {/* Element + Region tag */}
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded-full font-bold shrink-0"
                        style={{
                          backgroundColor: `${elColor}22`,
                          color: elColor,
                          border: `1px solid ${elColor}44`,
                        }}
                      >
                        {theme.elementVi}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-muted truncate leading-tight">
                      {theme.desc}
                    </p>
                  </div>

                  {/* Active check */}
                  {isSelected && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: theme.colors[0] }}
                    />
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
