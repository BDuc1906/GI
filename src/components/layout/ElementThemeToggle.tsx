"use client";

import { useState } from "react";

/**
 * Element Theme Toggle - Chuyển đổi Dark/Light Mode bằng Nguyên tố
 * - Click Nham/Lôi → Dark Mode
 * - Click Phong/Thủy → Light Mode
 */

export function ElementThemeToggle() {
  const [isDark, setIsDark] = useState(true);

  const handleToggle = (element: string) => {
    if (element === "Geo" || element === "Electro") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDark(false);
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-bg-card border-2 border-border rounded-full p-2 shadow-lg">
        <div className="flex gap-2">
          <button
            onClick={() => handleToggle("Geo")}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
              isDark ? "bg-gold/20 border-2 border-gold" : "border-2 border-transparent hover:border-gold/50"
            }`}
            title="Nham - Dark Mode"
          >
            🪨
          </button>
          <button
            onClick={() => handleToggle("Electro")}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
              isDark ? "bg-gold/20 border-2 border-gold" : "border-2 border-transparent hover:border-gold/50"
            }`}
            title="Lôi - Dark Mode"
          >
            ⚡
          </button>
          <button
            onClick={() => handleToggle("Anemo")}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
              !isDark ? "bg-gold/20 border-2 border-gold" : "border-2 border-transparent hover:border-gold/50"
            }`}
            title="Phong - Light Mode"
          >
            🌪️
          </button>
          <button
            onClick={() => handleToggle("Hydro")}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all ${
              !isDark ? "bg-gold/20 border-2 border-gold" : "border-2 border-transparent hover:border-gold/50"
            }`}
            title="Thủy - Light Mode"
          >
            💧
          </button>
        </div>
      </div>
    </div>
  );
}