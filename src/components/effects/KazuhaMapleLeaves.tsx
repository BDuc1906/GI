"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Hiệu ứng lá phong rơi đặc trưng của Kaedehara Kazuha (Chihayaburu & Manyou no Itto).
 * - Canvas 2D siêu nhẹ, 60fps mượt mà, không giật lag.
 * - Lá phong Momiji chuẩn Genshin Impact với nhiều dải màu thu (Đỏ phong, Đỏ thẫm, Cam hoàng hôn, Hổ phách, Gió Phong Anemo).
 * - Vật lý lượn sóng tự nhiên, xoay lật 3D (pitch & yaw tumbling) theo ngọn gió Anemo.
 * - Tự động tạm dừng khi rời tab hoặc scroll ra ngoài viewport để tiết kiệm 100% CPU/GPU.
 * - Hỗ trợ tùy chọn tắt/bật có lưu trạng thái trong localStorage.
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

const emptySubscribe = () => () => {};

export function KazuhaMapleLeaves() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);

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

    // 1. Tạo trước các Sprite lá phong Momiji bằng Offscreen Canvas để tối đa hiệu năng
    const SPRITE_SIZE = 64;
    const colorPalettes = [
      // Kazuha Crimson (Đỏ phong lá rụng)
      { primary: "#dc2626", secondary: "#991b1b", vein: "#fef08a" },
      // Vibrant Scarlet (Đỏ thẫm rực rỡ)
      { primary: "#e11d48", secondary: "#881337", vein: "#fed7aa" },
      // Sunset Autumn Orange (Cam mùa thu)
      { primary: "#ea580c", secondary: "#c2410c", vein: "#fef3c7" },
      // Amber Gold (Vàng hổ phách)
      { primary: "#f59e0b", secondary: "#b45309", vein: "#ffffff" },
      // Deep Wine Momiji (Đỏ rượu trầm)
      { primary: "#b91c1c", secondary: "#4c0519", vein: "#fecdd3" },
      // Anemo x Autumn Swirl (Khuếch tán phong nguyên tố Kazuha)
      { primary: "#0d9488", secondary: "#dc2626", vein: "#5eead4" },
    ];

    const leafSprites: HTMLCanvasElement[] = colorPalettes.map((pal) => {
      const off = document.createElement("canvas");
      off.width = SPRITE_SIZE;
      off.height = SPRITE_SIZE;
      const oCtx = off.getContext("2d");
      if (!oCtx) return off;

      const cx = SPRITE_SIZE / 2;
      const cy = SPRITE_SIZE / 2;
      const s = SPRITE_SIZE / 42; // scale factor

      // Gradient lá
      const grad = oCtx.createRadialGradient(cx, cy, 2, cx, cy, SPRITE_SIZE / 2);
      grad.addColorStop(0, pal.primary);
      grad.addColorStop(0.7, pal.primary);
      grad.addColorStop(1, pal.secondary);

      oCtx.save();
      oCtx.translate(cx, cy);

      // Vẽ hình dáng 7 thùy nhọn đặc trưng của lá phong Nhật Bản (Momiji)
      oCtx.beginPath();
      oCtx.moveTo(0, -18 * s);
      oCtx.bezierCurveTo(2 * s, -12 * s, 5 * s, -8 * s, 3 * s, -4 * s);

      // Thùy trên phải
      oCtx.bezierCurveTo(8 * s, -9 * s, 14 * s, -12 * s, 16 * s, -11 * s);
      oCtx.bezierCurveTo(14 * s, -6 * s, 9 * s, -3 * s, 5 * s, -1 * s);

      // Thùy giữa phải
      oCtx.bezierCurveTo(11 * s, 1 * s, 16 * s, 2 * s, 17 * s, 5 * s);
      oCtx.bezierCurveTo(13 * s, 7 * s, 8 * s, 5 * s, 4 * s, 3 * s);

      // Thùy dưới phải
      oCtx.bezierCurveTo(7 * s, 8 * s, 11 * s, 12 * s, 10 * s, 14 * s);
      oCtx.bezierCurveTo(7 * s, 13 * s, 4 * s, 9 * s, 2 * s, 6 * s);

      // Cuống lá (stem)
      oCtx.lineTo(1 * s, 17 * s);
      oCtx.lineTo(-1 * s, 17 * s);
      oCtx.lineTo(-2 * s, 6 * s);

      // Thùy dưới trái
      oCtx.bezierCurveTo(-4 * s, 9 * s, -7 * s, 13 * s, -10 * s, 14 * s);
      oCtx.bezierCurveTo(-11 * s, 12 * s, -7 * s, 8 * s, -4 * s, 3 * s);

      // Thùy giữa trái
      oCtx.bezierCurveTo(-8 * s, 5 * s, -13 * s, 7 * s, -17 * s, 5 * s);
      oCtx.bezierCurveTo(-16 * s, 2 * s, -11 * s, 1 * s, -5 * s, -1 * s);

      // Thùy trên trái
      oCtx.bezierCurveTo(-9 * s, -3 * s, -14 * s, -6 * s, -16 * s, -11 * s);
      oCtx.bezierCurveTo(-14 * s, -12 * s, -8 * s, -9 * s, -3 * s, -4 * s);

      // Quay lại thùy đỉnh
      oCtx.bezierCurveTo(-5 * s, -8 * s, -2 * s, -12 * s, 0, -18 * s);
      oCtx.closePath();

      oCtx.fillStyle = grad;
      oCtx.fill();

      // Gân lá tinh tế
      oCtx.strokeStyle = pal.vein;
      oCtx.globalAlpha = 0.45;
      oCtx.lineWidth = 1;

      // Gân chính
      oCtx.beginPath();
      oCtx.moveTo(0, 16 * s);
      oCtx.lineTo(0, -16 * s);

      // Gân nhánh tỏa ra các thùy
      oCtx.moveTo(0, 0);
      oCtx.lineTo(13 * s, -9 * s);
      oCtx.moveTo(0, 0);
      oCtx.lineTo(-13 * s, -9 * s);
      oCtx.moveTo(0, 2 * s);
      oCtx.lineTo(14 * s, 4 * s);
      oCtx.moveTo(0, 2 * s);
      oCtx.lineTo(-14 * s, 4 * s);
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

    // 3. Khởi tạo các hạt lá phong
    const isMobile = width < 768;
    const leafCount = isMobile ? 18 : 32;

    const createLeaf = (initialSpawn = false): LeafParticle => {
      return {
        x: Math.random() * (width + 100) - 50,
        y: initialSpawn ? Math.random() * height : -30 - Math.random() * 80,
        size: isMobile ? 16 + Math.random() * 12 : 18 + Math.random() * 18,
        vx: 0.3 + Math.random() * 0.8,
        vy: 0.8 + Math.random() * 1.4,
        angle: Math.random() * Math.PI * 2,
        vAngle: (Math.random() - 0.5) * 0.035,
        flip: Math.random() * Math.PI * 2,
        vFlip: 0.02 + Math.random() * 0.03,
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.02 + Math.random() * 0.025,
        swayAmp: 18 + Math.random() * 24,
        opacity: 0.65 + Math.random() * 0.35,
        spriteIndex: Math.floor(Math.random() * leafSprites.length),
      };
    };

    const leaves: LeafParticle[] = Array.from({ length: leafCount }, () => createLeaf(true));

    // 4. Hạt tinh tú Anemo lấp lánh (Anemo Motes)
    const sparkleCount = isMobile ? 8 : 16;
    const sparkles: SparkleParticle[] = Array.from({ length: sparkleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: 1 + Math.random() * 2,
      vx: 0.2 + Math.random() * 0.5,
      vy: 0.3 + Math.random() * 0.7,
      opacity: 0.3 + Math.random() * 0.5,
      pulsePhase: Math.random() * Math.PI * 2,
      color: Math.random() > 0.4 ? "#5eead4" : "#fde047",
    }));

    // 5. Tương tác chuột tạo luồng gió nhẹ
    let mouseWindX = 0;
    let lastMouseX = 0;
    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - lastMouseX;
      lastMouseX = e.clientX;
      mouseWindX = Math.max(-2, Math.min(2, delta * 0.05));
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 6. Tối ưu: Dừng animation khi ra khỏi tầm nhìn (IntersectionObserver & visibilitychange)
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

    // 7. Vòng lặp render chính (60fps)
    let time = 0;

    const render = () => {
      if (isVisible && width > 0 && height > 0) {
        time += 1;
        ctx.clearRect(0, 0, width, height);

        // Ngọn gió Anemo theo nhịp điệu tự nhiên (Kazuha Breeze)
        const windGust = Math.sin(time * 0.008) * 0.9 + Math.cos(time * 0.015) * 0.5 + mouseWindX;
        mouseWindX *= 0.95; // tiêu tán gió chuột dần

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

          const swayOffset = Math.sin(leaf.swayPhase) * leaf.swayAmp;
          leaf.x += leaf.vx + windGust * 0.8;
          leaf.y += leaf.vy;

          // Hồi sinh lá khi rơi ra khỏi màn hình
          if (leaf.y > height + 40 || leaf.x > width + 80 || leaf.x < -80) {
            Object.assign(leaf, createLeaf(false));
          }

          // Hiệu ứng lật 3D (pitch tumbling)
          const scaleY = Math.cos(leaf.flip);
          const sprite = leafSprites[leaf.spriteIndex];

          ctx.save();
          ctx.translate(leaf.x + swayOffset, leaf.y);
          ctx.rotate(leaf.angle + (windGust * 0.15));
          ctx.scale(1, Math.max(0.15, Math.abs(scaleY)));
          ctx.globalAlpha = leaf.opacity * (0.7 + 0.3 * Math.abs(scaleY));

          // Bóng mờ nhẹ tạo chiều sâu không gian
          ctx.shadowColor = "rgba(0, 0, 0, 0.25)";
          ctx.shadowBlur = 4;
          ctx.shadowOffsetY = 2;

          ctx.drawImage(sprite, -leaf.size / 2, -leaf.size / 2, leaf.size, leaf.size);
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibility);
      observer.disconnect();
    };
  }, [enabled]);

  if (!isClient) return null;

  return (
    <>
      {enabled && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none w-full h-full z-1"
          style={{ willChange: "transform" }}
        />
      )}

      {/* Nút bật/tắt hiệu ứng lá phong Kazuha tinh tế ở góc dưới banner */}
      <button
        type="button"
        onClick={toggleLeaves}
        title={enabled ? "Tạm tắt lá phong rơi" : "Bật hiệu ứng lá phong rơi Kazuha"}
        aria-label={enabled ? "Tắt lá phong rơi" : "Bật lá phong rơi"}
        className={`absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs transition-all backdrop-blur-md border ${
          enabled
            ? "bg-bg-card/70 border-accent-500/50 text-accent-bright hover:bg-bg-elevated hover:border-accent-500 shadow-sm"
            : "bg-bg-card/40 border-border text-text-muted hover:text-text-primary hover:border-border-strong"
        }`}
      >
        <svg
          className={`w-3.5 h-3.5 transition-transform ${enabled ? "text-amber-400 rotate-12 scale-110" : "opacity-60"}`}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          {/* Biểu tượng lá phong */}
          <path d="M12 2C12.5 4.5 13.5 6 15 7C17 5 19 3 20 4C19 6 18 8 16.5 9.5C18.5 10 21 11 21 12.5C19.5 13.5 17.5 13 16 12C16.5 14 17 16 16 17C14.5 16.5 13.5 15 13 13.5C12.8 17 12.5 20 12 22C11.5 20 11.2 17 11 13.5C10.5 15 9.5 16.5 8 17C7 16 7.5 14 8 12C6.5 13 4.5 13.5 3 12.5C3 11 5.5 10 7.5 9.5C6 8 5 6 4 4C5 3 7 5 9 7C10.5 6 11.5 4.5 12 2Z" />
        </svg>
        <span className="hidden xs:inline font-medium text-[11px]">
          {enabled ? "Lá phong: Bật" : "Lá phong: Tắt"}
        </span>
      </button>
    </>
  );
}
