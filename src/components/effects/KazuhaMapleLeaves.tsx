"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Hiệu ứng lá phong rơi đặc trưng của Kaedehara Kazuha (Chihayaburu & Manyou no Itto).
 * Thiết kế chuẩn 100% theo phong cách Splash Art nhân vật Kaedehara Kazuha:
 * - Hình dáng lá phong Momiji 7 thùy đặc trưng của Genshin Impact.
 * - Hệ thống gân lá màu trắng ngà sắc nét tỏa đều từ cuống tới 5 thùy chính.
 * - Màu sắc pha trộn chuẩn Artwork: Đỏ phong thu (Crimson/Scarlet), Ngọc phong Anemo (Teal/Mint), và Vàng hổ phách.
 * - Làn gió Anemo và hạt tinh tú khuếch tán bay bổng theo nhịp điệu tự nhiên.
 * - Canvas 2D siêu nhẹ, 60fps mượt mà, tự động tạm dừng khi rời tab để tiết kiệm 100% tài nguyên.
 */

interface LeafParticle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  angle: number;
  vAngle: number;
  flip: number;
  vFlip: number;
  swayPhase: number;
  swaySpeed: number;
  swayAmp: number;
  opacity: number;
  spriteIndex: number;
}

interface SparkleParticle {
  x: number;
  y: number;
  size: number;
  vx: number;
  vy: number;
  opacity: number;
  pulsePhase: number;
  color: string;
}

interface WindStreak {
  x: number;
  y: number;
  len: number;
  speed: number;
  opacity: number;
  curv: number;
}

const emptySubscribe = () => () => {};

export function KazuhaMapleLeaves({
  className = "",
  density = "medium",
}: {
  className?: string;
  density?: "low" | "medium" | "high";
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const _isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const [enabled, setEnabled] = useState(() => {
    if (typeof window === "undefined") return true;
    const saved = localStorage.getItem("leibo_kazuha_leaves");
    return saved !== null ? saved === "true" : true;
  });

  const toggleLeaves = () => {
    setEnabled((prev) => {
      const next = !prev;
      localStorage.setItem("leibo_kazuha_leaves", String(next));
      return next;
    });
  };

  useEffect(() => {
    if (!enabled) return;

    // Tôn trọng thiết lập giảm chuyển động của hệ điều hành
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let isVisible = true;
    let width = 0;
    let height = 0;

    // 1. Tạo trước các Sprite lá phong Momiji chuẩn Artwork bằng Offscreen Canvas
    const SPRITE_SIZE = 72;
    const colorPalettes = [
      // 1. Autumn Crimson (Đỏ phong Inazuma kinh điển)
      { primary: "#f43f5e", secondary: "#be123c", vein: "#ffffff" },
      // 2. Kazuha Scarlet / Orange (Đỏ cam áo Kazuha)
      { primary: "#ea580c", secondary: "#9a3412", vein: "#ffffff" },
      // 3. Anemo Jade Mint (Lá ngọc phong xanh ngọc trong splash art)
      { primary: "#14b8a6", secondary: "#0f766e", vein: "#ffffff" },
      // 4. Anemo Bright Teal (Lá xanh phong sáng)
      { primary: "#2dd4bf", secondary: "#0d9488", vein: "#ffffff" },
      // 5. Sunset Amber Gold (Vàng hổ phách chiều thu)
      { primary: "#f59e0b", secondary: "#b45309", vein: "#ffffff" },
      // 6. Deep Wine Momiji (Đỏ thẫm trầm)
      { primary: "#e11d48", secondary: "#881337", vein: "#ffffff" },
    ];

    const leafSprites: HTMLCanvasElement[] = colorPalettes.map((pal) => {
      const off = document.createElement("canvas");
      off.width = SPRITE_SIZE;
      off.height = SPRITE_SIZE;
      const oCtx = off.getContext("2d");
      if (!oCtx) return off;

      const scale = SPRITE_SIZE / 100;

      // Gradient thân lá
      const grad = oCtx.createLinearGradient(15, 10, 85, 90);
      grad.addColorStop(0, pal.primary);
      grad.addColorStop(0.7, pal.primary);
      grad.addColorStop(1, pal.secondary);

      oCtx.save();
      oCtx.scale(scale, scale);

      // Thân lá phong 7 thùy chuẩn Kaedehara Kazuha
      oCtx.beginPath();
      oCtx.moveTo(50, 6);
      oCtx.bezierCurveTo(53, 17, 56, 22, 63, 24);
      oCtx.bezierCurveTo(58, 28, 56, 34, 57, 41);
      oCtx.bezierCurveTo(64, 35, 68, 31, 74, 30);
      oCtx.bezierCurveTo(73, 36, 78, 37, 90, 40);
      oCtx.bezierCurveTo(82, 46, 80, 49, 81, 54);
      oCtx.bezierCurveTo(74, 55, 69, 55, 66, 58);
      oCtx.bezierCurveTo(74, 61, 79, 64, 84, 69);
      oCtx.bezierCurveTo(76, 72, 73, 73, 69, 74);
      oCtx.bezierCurveTo(64, 70, 57, 70, 52, 74);
      oCtx.lineTo(52, 95);
      oCtx.bezierCurveTo(52, 96, 48, 96, 48, 95);
      oCtx.lineTo(48, 74);
      oCtx.bezierCurveTo(43, 70, 36, 70, 31, 74);
      oCtx.bezierCurveTo(27, 73, 24, 72, 16, 69);
      oCtx.bezierCurveTo(21, 64, 26, 61, 34, 58);
      oCtx.bezierCurveTo(31, 55, 26, 55, 19, 54);
      oCtx.bezierCurveTo(20, 49, 18, 46, 10, 40);
      oCtx.bezierCurveTo(22, 37, 27, 36, 26, 30);
      oCtx.bezierCurveTo(32, 31, 36, 35, 43, 41);
      oCtx.bezierCurveTo(44, 34, 42, 28, 37, 24);
      oCtx.bezierCurveTo(44, 22, 47, 17, 50, 6);
      oCtx.closePath();

      oCtx.fillStyle = grad;
      oCtx.fill();

      // Viền mỏng sắc nét tạo chiều sâu ukiyo-e
      oCtx.strokeStyle = "rgba(255, 255, 255, 0.5)";
      oCtx.lineWidth = 1;
      oCtx.stroke();

      // Gân lá trắng ngà nổi bật đặc trưng
      oCtx.strokeStyle = pal.vein;
      oCtx.lineWidth = 1.6;
      oCtx.lineCap = "round";
      oCtx.globalAlpha = 0.92;

      // Gân chính
      oCtx.beginPath();
      oCtx.moveTo(50, 74);
      oCtx.lineTo(50, 14);
      // Gân thùy ngang
      oCtx.moveTo(50, 74);
      oCtx.lineTo(88, 41);
      oCtx.moveTo(50, 74);
      oCtx.lineTo(12, 41);
      // Gân thùy dưới
      oCtx.moveTo(50, 74);
      oCtx.lineTo(82, 68);
      oCtx.moveTo(50, 74);
      oCtx.lineTo(18, 68);

      // Gân phụ
      oCtx.moveTo(50, 52);
      oCtx.lineTo(61, 36);
      oCtx.moveTo(50, 52);
      oCtx.lineTo(39, 36);
      oCtx.moveTo(50, 36);
      oCtx.lineTo(56, 24);
      oCtx.moveTo(50, 36);
      oCtx.lineTo(44, 24);
      oCtx.stroke();

      oCtx.restore();

      return off;
    });

    // 2. Resize Canvas thích ứng màn hình
    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // 3. Khởi tạo các hạt lá phong theo mật độ
    const isMobile = width < 768;
    const countMultiplier = density === "low" ? 0.6 : density === "high" ? 1.4 : 1.0;
    const leafCount = Math.floor((isMobile ? 16 : 28) * countMultiplier);

    const createLeaf = (initialSpawn = false): LeafParticle => {
      return {
        x: Math.random() * (width + 120) - 60,
        y: initialSpawn ? Math.random() * height : -35 - Math.random() * 80,
        size: isMobile ? 18 + Math.random() * 12 : 22 + Math.random() * 18,
        vx: 0.35 + Math.random() * 0.75,
        vy: 0.85 + Math.random() * 1.35,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 0.035,
        flip: Math.random() * Math.PI * 2,
        vFlip: 0.02 + Math.random() * 0.03,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.02,
        swayAmp: 18 + Math.random() * 26,
        opacity: 0.75 + Math.random() * 0.25,
        spriteIndex: Math.floor(Math.random() * leafSprites.length),
      };
    };

    const leaves: LeafParticle[] = Array.from({ length: leafCount }, () => createLeaf(true));

    // 4. Vệt gió Anemo lướt nhẹ thoảng qua
    const windStreaks: WindStreak[] = Array.from({ length: 3 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      len: Math.random() * 120 + 80,
      speed: Math.random() * 2 + 1.5,
      opacity: Math.random() * 0.25 + 0.1,
      curv: (Math.random() - 0.5) * 25,
    }));

    // 5. Hạt tinh tú Anemo lấp lánh (Anemo Motes)
    const sparkleCount = isMobile ? 8 : 14;
    const sparkles: SparkleParticle[] = Array.from({ length: sparkleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 2,
      vx: 0.2 + Math.random() * 0.5,
      vy: 0.3 + Math.random() * 0.6,
      opacity: 0.3 + Math.random() * 0.5,
      pulsePhase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.4 ? "#5eead4" : "#fef08a",
    }));

    // 6. Tương tác chuột tạo luồng gió nhẹ
    let mouseWindX = 0;
    let lastMouseX = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - lastMouseX;
      lastMouseX = e.clientX;
      mouseWindX = Math.max(-2, Math.min(2, delta * 0.05));
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 7. Tối ưu: Dừng animation khi ra khỏi tầm nhìn (IntersectionObserver & visibilitychange)
    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // 8. Vòng lặp render chính (60fps)
    let time = 0;

    const render = () => {
      if (isVisible && width > 0 && height > 0) {
        time += 1;
        ctx.clearRect(0, 0, width, height);

        // Ngọn gió Anemo theo nhịp điệu tự nhiên (Kazuha Breeze)
        const windGust = Math.sin(time * 0.008) * 0.9 + Math.cos(time * 0.015) * 0.5 + mouseWindX;
        mouseWindX *= 0.95;

        // Vẽ vệt gió Anemo
        for (const st of windStreaks) {
          st.x += st.speed + windGust * 0.6;
          st.y += st.speed * 0.35;
          if (st.x > width + st.len) {
            st.x = -st.len;
            st.y = Math.random() * height;
          }
          ctx.save();
          ctx.strokeStyle = `rgba(45, 212, 191, ${st.opacity})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(st.x, st.y);
          ctx.quadraticCurveTo(st.x + st.len * 0.5, st.y + st.curv, st.x + st.len, st.y);
          ctx.stroke();
          ctx.restore();
        }

        // Vẽ các hạt tinh tú Anemo
        for (const sp of sparkles) {
          sp.x += sp.vx + windGust * 0.5;
          sp.y += sp.vy;
          sp.pulsePhase += 0.04;

          if (sp.y > height + 10) {
            sp.y = -10;
            sp.x = Math.random() * width;
          }
          if (sp.x > width + 20) sp.x = -10;
          if (sp.x < -20) sp.x = width + 10;

          const alpha = sp.opacity * (0.6 + 0.4 * Math.sin(sp.pulsePhase));
          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
          ctx.fillStyle = sp.color;
          ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
          ctx.shadowColor = sp.color;
          ctx.shadowBlur = 6;
          ctx.fill();
        }
        ctx.shadowBlur = 0;

        // Vẽ các lá phong rơi
        for (const leaf of leaves) {
          leaf.swayPhase += leaf.swaySpeed;
          leaf.flip += leaf.vFlip;
          leaf.angle += leaf.vAngle;

          const sway = Math.sin(leaf.swayPhase) * leaf.swayAmp;
          leaf.x += leaf.vx + Math.cos(leaf.swayPhase * 0.7) * 0.4 + windGust * 0.7;
          leaf.y += leaf.vy + Math.abs(Math.sin(leaf.swayPhase)) * 0.25;

          // Khi rơi xuống đáy hoặc bay sang rìa, hồi sinh lại phía trên
          if (leaf.y > height + 40 || leaf.x > width + 50 || leaf.x < -60) {
            Object.assign(leaf, createLeaf(false));
          }

          const sprite = leafSprites[leaf.spriteIndex];
          if (!sprite) continue;

          // Xoay lật 3D (pitch tumbling)
          const scaleY = Math.cos(leaf.flip);
          const drawX = leaf.x + sway;
          const drawY = leaf.y;

          ctx.save();
          ctx.translate(drawX, drawY);
          ctx.rotate(leaf.angle);
          ctx.scale(1, scaleY);
          ctx.globalAlpha = leaf.opacity;

          ctx.drawImage(
            sprite,
            -leaf.size / 2,
            -leaf.size / 2,
            leaf.size,
            leaf.size
          );

          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled, density]);

  return (
    <div className={`pointer-events-none absolute inset-0 z-0 overflow-hidden ${className}`}>
      <canvas ref={canvasRef} className="h-full w-full opacity-90 transition-opacity duration-700" />

      {/* Nút bật/tắt hiệu ứng phong thu Kazuha */}
      <div className="pointer-events-auto absolute bottom-3 right-3 z-10 flex items-center gap-1.5 opacity-40 transition-opacity hover:opacity-100">
        <button
          type="button"
          onClick={toggleLeaves}
          className="rounded-full border border-border/70 bg-bg-surface/85 px-2.5 py-1 text-[11px] font-medium text-text-secondary shadow-sm backdrop-blur-sm transition-all hover:border-accent-500 hover:text-accent-bright"
          title={enabled ? "Tạm dừng hiệu ứng lá phong rơi" : "Bật lại hiệu ứng lá phong rơi"}
          aria-label={enabled ? "Tạm dừng hiệu ứng lá phong" : "Bật hiệu ứng lá phong"}
        >
          <span className="inline-block mr-1 text-rose-400">🍁</span>
          {enabled ? "Tắt lá rơi" : "Bật lá rơi"}
        </button>
      </div>
    </div>
  );
}
