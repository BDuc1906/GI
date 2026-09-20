"use client";

import { useEffect, useRef } from "react";
import { elementColorVar } from "@/lib/ui/theme";
import { cn } from "@/lib/utils";

interface ParticleSystemProps {
  element?: string;
  intensity?: "low" | "medium" | "high";
  trigger?: "hover" | "click" | "auto";
  className?: string;
}

/**
 * Hệ thống particle effects cho tương tác nguyên tố chuẩn game Genshin Impact
 * Sử dụng Canvas API để render hiệu ứng particle hiệu năng cao
 * 
 * @param element - Tên nguyên tố (Pyro, Hydro, Anemo, Electro, Dendro, Cryo, Geo)
 * @param intensity - Cường độ particle: low, medium, high
 * @param trigger - Kích hoạt: hover, click, auto
 * @param className - Class CSS bổ sung
 */
export function ParticleSystem({ 
  element = "Pyro", 
  intensity = "medium", 
  trigger = "hover",
  className 
}: ParticleSystemProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const isActiveRef = useRef(false);

  const elementColor = elementColorVar(element);
  
  const intensityConfig = {
    low: { particleCount: 20, speed: 0.5, size: 2 },
    medium: { particleCount: 40, speed: 1, size: 3 },
    high: { particleCount: 60, speed: 1.5, size: 4 }
  };

  const config = intensityConfig[intensity];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = Array.from({ length: config.particleCount }, () => 
        createParticle(canvas.width, canvas.height, config.size, config.particleCount)
      );
    };
    initParticles();

    // Animation loop
    let animationFrameId: number | undefined;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particlesRef.current.forEach(particle => {
        updateParticle(particle, canvas.width, canvas.height, config.speed, mouseRef.current, isActiveRef.current);
        drawParticle(ctx, particle, elementColor);
      });

      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    // Event handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    const handleMouseEnter = () => isActiveRef.current = true;
    const handleMouseLeave = () => isActiveRef.current = false;

    if (trigger === "hover" || trigger === "auto") {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseenter', handleMouseEnter);
      canvas.addEventListener('mouseleave', handleMouseLeave);
    }

    if (trigger === "auto") {
      isActiveRef.current = true;
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseenter', handleMouseEnter);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [element, intensity, trigger, config, elementColor]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("absolute inset-0 pointer-events-none", className)}
      style={{ opacity: trigger === "auto" ? 0.6 : 0.3 }}
    />
  );
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  alpha: number;
}

function createParticle(width: number, height: number, baseSize: number, _particleCount: number): Particle {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    size: Math.random() * baseSize + 1,
    life: Math.random() * 100 + 50,
    maxLife: 150,
    alpha: Math.random() * 0.5 + 0.3
  };
}

function updateParticle(
  particle: Particle, 
  width: number, 
  height: number, 
  speed: number,
  mouse: { x: number; y: number },
  isActive: boolean
) {
  // Update position
  particle.x += particle.vx * speed;
  particle.y += particle.vy * speed;

  // Mouse interaction
  if (isActive) {
    const dx = mouse.x - particle.x;
    const dy = mouse.y - particle.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < 100) {
      const force = (100 - dist) / 100;
      particle.vx -= (dx / dist) * force * 0.5;
      particle.vy -= (dy / dist) * force * 0.5;
    }
  }

  // Boundary wrapping
  if (particle.x < 0) particle.x = width;
  if (particle.x > width) particle.x = 0;
  if (particle.y < 0) particle.y = height;
  if (particle.y > height) particle.y = 0;

  // Life cycle
  particle.life--;
  if (particle.life <= 0) {
    particle.x = Math.random() * width;
    particle.y = Math.random() * height;
    particle.life = particle.maxLife;
  }

  // Alpha based on life
  particle.alpha = (particle.life / particle.maxLife) * 0.7;
}

function drawParticle(ctx: CanvasRenderingContext2D, particle: Particle, color: string) {
  ctx.beginPath();
  ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
  
  // Handle CSS variables by using a simple fallback
  let fillColor = color;
  if (color.startsWith('var(')) {
    // For CSS variables, use a fallback color based on element
    const elementColors: Record<string, string> = {
      'var(--el-pyro)': '255, 112, 67',
      'var(--el-hydro)': '53, 184, 234', 
      'var(--el-anemo)': '95, 214, 190',
      'var(--el-electro)': '177, 122, 224',
      'var(--el-dendro)': '164, 210, 74',
      'var(--el-cryo)': '143, 230, 238',
      'var(--el-geo)': '224, 182, 76',
      'var(--accent-500)': '201, 160, 90'
    };
    fillColor = `rgb(${elementColors[color] || '201, 160, 90'})`;
  }
  
  ctx.fillStyle = fillColor;
  ctx.globalAlpha = particle.alpha;
  ctx.fill();
  ctx.globalAlpha = 1;
  
  // Glow effect
  ctx.shadowBlur = 8;
  ctx.shadowColor = fillColor;
}