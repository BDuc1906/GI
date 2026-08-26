"use client";

// Đổi tên từ "Hero" thành "HomeHero" — dự án đã có model/entity
// "Character" (nhân vật Genshin), nên tên "Hero" (thuật ngữ chuẩn ngành
// cho banner đầu trang) dễ gây hiểu nhầm là liên quan tới nhân vật game.
// "HomeHero" = banner đầu trang chủ, rõ nghĩa và không đụng khái niệm.

import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";
import { Link } from "@/i18n/navigation";

/**
 * Hero mới cho trang chủ LEIBO.
 *
 * Thiết kế có chủ đích, KHÔNG thêm màu mới:
 * - Chỉ dùng lại đúng 2 tông đã có trong globals.css (--gold / nền tối),
 *   không thêm gradient sặc sỡ, không thêm màu thứ 3.
 * - "LEIBO" hiện dần từng ký tự khi trang tải (kinetic typography) — thay
 *   vì chữ xuất hiện cứng ngay lập tức, tạo cảm giác có chủ ý, cao cấp.
 * - Một vùng sáng vàng RẤT mờ (opacity thấp) theo con trỏ chuột, mô phỏng
 *   "ánh sáng nguyên tố" nhưng tối giản — không phải particle/3D nặng.
 * - Bố cục giữ nguyên cấu trúc cũ (title, tagline, mô tả, 2 nút) để không
 *   phá vỡ nội dung, chỉ nâng cấp cách trình bày.
 *
 * Tôn trọng prefers-reduced-motion: tắt hết animation nếu người dùng bật.
 */

const TITLE = "LEIBO";

export function HomeHero() {
  const t = useTranslations("Hero");
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const el = glowRef.current;
    if (!el) return;

    let raf = 0;
    function handleMove(e: MouseEvent) {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = el!.parentElement!.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        el!.style.setProperty("--glow-x", `${x}%`);
        el!.style.setProperty("--glow-y", `${y}%`);
      });
    }

    const section = el.parentElement;
    section?.addEventListener("mousemove", handleMove);
    return () => {
      section?.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="relative text-center py-20 md:py-32 overflow-hidden">
      {/* Ambient glow theo chuột — vàng rất mờ, chỉ 1 màu, không mới */}
      <div
        ref={glowRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 md:opacity-100 transition-opacity duration-700"
        style={
          {
            "--glow-x": "50%",
            "--glow-y": "35%",
            background:
              "radial-gradient(600px circle at var(--glow-x) var(--glow-y), rgba(201, 166, 107, 0.07), transparent 65%)",
          } as React.CSSProperties
        }
      />

      <div className="relative z-10">
        <h1
          className="font-display text-6xl md:text-8xl font-bold text-gold-bright tracking-wide"
          aria-label={TITLE}
        >
          <span aria-hidden className="inline-flex">
            {TITLE.split("").map((letter, i) => (
              <span
                key={i}
                className="inline-block opacity-0 animate-letter-in"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {letter}
              </span>
            ))}
          </span>
        </h1>

        <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mt-6 font-light animate-fade-in-up [animation-delay:500ms]">
          {t("tagline")}
        </p>
        <p className="text-sm text-text-muted max-w-xl mx-auto mt-3 animate-fade-in-up [animation-delay:650ms]">
          {t("description")}
        </p>

        <div className="flex flex-wrap justify-center gap-4 mt-10 animate-fade-in-up [animation-delay:800ms]">
          <Link
            href="/characters"
            className="px-8 py-3 bg-gold text-text-inverted font-semibold rounded-full shadow-lg transition-all hover:shadow-xl hover:-translate-y-0.5"
          >
            {t("exploreCharacters")}
          </Link>
          <Link
            href="/weapons"
            className="px-8 py-3 border border-border text-text-secondary font-semibold rounded-full transition-all hover:border-gold hover:text-gold-bright"
          >
            {t("weaponArsenal")}
          </Link>
        </div>
      </div>
    </section>
  );
}
