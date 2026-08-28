"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Bọc quanh 1 section để nó "hiện dần + trượt nhẹ lên" đúng lúc cuộn tới,
 * thay vì hiện sẵn cứng ngay khi trang tải xong.
 *
 * Vì sao không dùng CSS `animation-timeline: scroll()` (native, không cần
 * JS): trình duyệt hỗ trợ chưa đồng đều đủ để dùng làm hiệu ứng chính cho
 * toàn site vào 2026 — IntersectionObserver ổn định hơn, chạy được mọi nơi,
 * và code ít hơn so với việc phải viết @supports fallback đầy đủ.
 *
 * Dùng đúng 1 lần cho mỗi section (không lặp lại cho từng item bên trong)
 * — hiệu ứng "cả khối cùng hiện lên" trông có chủ đích hơn nhiều so với
 * mỗi card tự trigger riêng lẻ, dễ gây rối mắt khi cuộn nhanh.
 *
 * delay (ms, optional): dùng khi có 2-3 ScrollReveal liền kề trong cùng
 * viewport lúc tải trang lần đầu (hiếm khi xảy ra vì section thường đủ
 * dài để cuộn), để chúng không hiện cùng lúc y hệt nhau.
 */
export function ScrollReveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Nếu trình duyệt không hỗ trợ IntersectionObserver (hiếm ở 2026),
    // hiện luôn nội dung thay vì để nó kẹt ở trạng thái ẩn vĩnh viễn.
    if (typeof IntersectionObserver === "undefined") {
      // Fallback hiếm khi trình duyệt không hỗ trợ IntersectionObserver:
      // không có API nào để subscribe, nên không có cách nào khác ngoài
      // set thẳng ngay trong nhánh này.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect(); // chỉ chạy 1 lần, không lặp lại khi cuộn qua lại
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -80px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${visible ? "reveal-visible" : "reveal-hidden"} ${className}`}
      style={visible && delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  );
}
