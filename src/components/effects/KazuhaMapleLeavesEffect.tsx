"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

interface LeafParticle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  angle: number;
  angularSpeed: number;
  flipAngle: number;
  flipSpeed: number;
  opacity: number;
  colorType: "crimson" | "teal" | "amber";
  swingAmplitude: number;
  swingFrequency: number;
  swingPhase: number;
}

interface WindStreak {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
  curvature: number;
}

interface KazuhaMapleLeavesEffectProps {
  className?: string;
  density?: "low" | "medium" | "high";
  interactive?: boolean;
}

export function KazuhaMapleLeavesEffect({
  className = "",
  density = "medium",
  interactive = true,
}: KazuhaMapleLeavesEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const mousePos = useRef<{ x: number; y: number; active: boolean }>({ x: 0, y: 0, active: false });

  // Vẽ hình lá phong chuẩn Inazuma Momiji (như trong splash art Kazuha)
  const drawGenshinMomiji = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      size: number,
      colorType: "crimson" | "teal" | "amber",
      flipScale: number
    ) => {
      ctx.save();
      ctx.scale(flipScale, 1);

      // Thang tỉ lệ 100x100 chuẩn
      const scale = size / 100;
      ctx.scale(scale, scale);
      ctx.translate(-50, -50);

      // Gradient màu tương ứng
      const grad = ctx.createLinearGradient(0, 0, 100, 100);
      if (colorType === "crimson") {
        grad.addColorStop(0, "#f43f5e");
        grad.addColorStop(0.4, "#e11d48");
        grad.addColorStop(0.8, "#ea580c");
        grad.addColorStop(1, "#f97316");
      } else if (colorType === "teal") {
        grad.addColorStop(0, "#0d9488");
        grad.addColorStop(0.5, "#14b8a6");
        grad.addColorStop(1, "#5eead4");
      } else {
        grad.addColorStop(0, "#d97706");
        grad.addColorStop(0.6, "#f59e0b");
        grad.addColorStop(1, "#fbbf24");
      }

      ctx.fillStyle = grad;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1;

      // 1. Vẽ thân lá 7 thùy chuẩn Kazuha
      ctx.beginPath();
      ctx.moveTo(50, 6);
      ctx.bezierCurveTo(53, 17, 56, 22, 63, 24);
      ctx.bezierCurveTo(58, 28, 56, 34, 57, 41);
      ctx.bezierCurveTo(64, 35, 68, 31, 74, 30);
      ctx.bezierCurveTo(73, 36, 78, 37, 90, 40);
      ctx.bezierCurveTo(82, 46, 80, 49, 81, 54);
      ctx.bezierCurveTo(74, 55, 69, 55, 66, 58);
      ctx.bezierCurveTo(74, 61, 79, 64, 84, 69);
      ctx.bezierCurveTo(76, 72, 73, 73, 69, 74);
      ctx.bezierCurveTo(64, 70, 57, 70, 52, 74);
      ctx.lineTo(52, 95);
      ctx.bezierCurveTo(52, 96, 48, 96, 48, 95);
      ctx.lineTo(48, 74);
      ctx.bezierCurveTo(43, 70, 36, 70, 31, 74);
      ctx.bezierCurveTo(27, 73, 24, 72, 16, 69);
      ctx.bezierCurveTo(21, 64, 26, 61, 34, 58);
      ctx.bezierCurveTo(31, 55, 26, 55, 19, 54);
      ctx.bezierCurveTo(20, 49, 18, 46, 10, 40);
      ctx.bezierCurveTo(22, 37, 27, 36, 26, 30);
      ctx.bezierCurveTo(32, 31, 36, 35, 43, 41);
      ctx.bezierCurveTo(44, 34, 42, 28, 37, 24);
      ctx.bezierCurveTo(44, 22, 47, 17, 50, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 2. Gân lá màu trắng ngà sắc nét đặc trưng trong game (Radiating White Veins)
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 1.8;
      ctx.lineCap = "round";

      // Gân chính giữa
      ctx.beginPath();
      ctx.moveTo(50, 74);
      ctx.lineTo(50, 14);
      // Gân sang 2 thùy chính ngang
      ctx.moveTo(50, 74);
      ctx.lineTo(87, 41);
      ctx.moveTo(50, 74);
      ctx.lineTo(13, 41);
      // Gân sang 2 thùy dưới
      ctx.moveTo(50, 74);
      ctx.lineTo(81, 67);
      ctx.moveTo(50, 74);
      ctx.lineTo(19, 67);

      // Nhánh phụ nhỏ
      ctx.moveTo(50, 52);
      ctx.lineTo(60, 36);
      ctx.moveTo(50, 52);
      ctx.lineTo(40, 36);
      ctx.moveTo(50, 36);
      ctx.lineTo(56, 24);
      ctx.moveTo(50, 36);
      ctx.lineTo(44, 24);
      ctx.stroke();

      ctx.restore();
    },
    []
  );

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth || window.innerWidth);
    let height = (canvas.height = canvas.offsetHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || window.innerWidth;
      height = canvas.height = canvas.offsetHeight || window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Xác định số lượng lá theo mật độ
    const count = {
      low: 12,
      medium: 22,
      high: 36,
    }[density];

    // Khởi tạo các hạt lá phong
    const leaves: LeafParticle[] = Array.from({ length: count }, () => {
      // 55% đỏ cam, 30% xanh phong anemo, 15% vàng hổ phách
      const rand = Math.random();
      const colorType: "crimson" | "teal" | "amber" =
        rand < 0.55 ? "crimson" : rand < 0.85 ? "teal" : "amber";

      return {
        x: Math.random() * width,
        y: Math.random() * height - height * 0.2,
        size: Math.random() * 16 + 18, // 18px -> 34px
        speedY: Math.random() * 0.9 + 0.6,
        speedX: Math.random() * 0.8 + 0.4,
        angle: Math.random() * Math.PI * 2,
        angularSpeed: (Math.random() - 0.5) * 0.03,
        flipAngle: Math.random() * Math.PI * 2,
        flipSpeed: Math.random() * 0.04 + 0.02,
        opacity: Math.random() * 0.45 + 0.55,
        colorType,
        swingAmplitude: Math.random() * 40 + 20,
        swingFrequency: Math.random() * 0.015 + 0.01,
        swingPhase: Math.random() * Math.PI * 2,
      };
    });

    // Vệt gió Anemo thoảng qua (Anemo Wind Streaks)
    const windStreaks: WindStreak[] = Array.from({ length: 4 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      length: Math.random() * 150 + 100,
      speed: Math.random() * 2.5 + 2,
      opacity: Math.random() * 0.2 + 0.1,
      curvature: (Math.random() - 0.5) * 30,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 1. Vẽ các vệt gió phong Anemo lướt nhẹ
      for (const streak of windStreaks) {
        streak.x += streak.speed;
        streak.y += streak.speed * 0.3;
        if (streak.x > width + streak.length) {
          streak.x = -streak.length;
          streak.y = Math.random() * height;
        }

        ctx.save();
        ctx.strokeStyle = `rgba(45, 212, 191, ${streak.opacity})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(streak.x, streak.y);
        ctx.quadraticCurveTo(
          streak.x + streak.length * 0.5,
          streak.y + streak.curvature,
          streak.x + streak.length,
          streak.y
        );
        ctx.stroke();
        ctx.restore();
      }

      // 2. Vẽ từng chiếc lá phong chao liệng trong gió
      for (const leaf of leaves) {
        leaf.swingPhase += leaf.swingFrequency;
        const swingOffset = Math.sin(leaf.swingPhase) * leaf.swingAmplitude;

        leaf.y += leaf.speedY;
        leaf.x += leaf.speedX + Math.cos(leaf.swingPhase) * 0.5;
        leaf.angle += leaf.angularSpeed;
        leaf.flipAngle += leaf.flipSpeed;

        // Tương tác chuột: đẩy lá phong khi rê chuột qua
        if (interactive && mousePos.current.active) {
          const dx = leaf.x - mousePos.current.x;
          const dy = leaf.y - mousePos.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const force = (120 - dist) / 120;
            leaf.x += (dx / dist) * force * 5;
            leaf.y += (dy / dist) * force * 5;
            leaf.angle += force * 0.1;
          }
        }

        // Tái tạo khi lá rơi khỏi màn hình
        if (leaf.y > height + 40 || leaf.x > width + 40) {
          leaf.y = -30;
          leaf.x = Math.random() * (width + 100) - 100;
        }

        const flipScale = Math.cos(leaf.flipAngle);

        ctx.save();
        ctx.translate(leaf.x + swingOffset, leaf.y);
        ctx.rotate(leaf.angle);
        ctx.globalAlpha = leaf.opacity;

        drawGenshinMomiji(ctx, leaf.size, leaf.colorType, flipScale);

        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [enabled, density, interactive, drawGenshinMomiji]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mousePos.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    };
  };

  const handleMouseLeave = () => {
    mousePos.current.active = false;
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`pointer-events-none relative overflow-hidden ${className}`}
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block absolute inset-0 pointer-events-none"
      />

      {/* Nút bật/tắt hiệu ứng lá phong Kazuha tinh tế góc phải dưới (khi hover) */}
      <button
        type="button"
        onClick={() => setEnabled((v) => !v)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="pointer-events-auto absolute bottom-2 right-2 p-1.5 rounded-lg border border-border/40 bg-bg-surface/60 backdrop-blur-sm text-[11px] text-text-muted hover:text-accent-bright hover:border-accent-500/60 transition-all flex items-center gap-1 opacity-40 hover:opacity-100"
        title={enabled ? "Tắt hiệu ứng lá phong bay" : "Bật hiệu ứng lá phong bay"}
      >
        <span className="text-rose-400">🍁</span>
        {isHovered && <span>{enabled ? "Tắt lá rơi" : "Bật lá rơi"}</span>}
      </button>
    </div>
  );
}
