"use client";

import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { routing } from "@/i18n/routing";
import { usePathname, useRouter } from "@/i18n/navigation";

// Tên hiển thị BẰNG CHÍNH ngôn ngữ đó (không dịch qua tiếng Anh/Việt) —
// đúng chuẩn UX cho bộ chọn ngôn ngữ: người đọc tiếng Nhật cần thấy
// "日本語", không phải "Japanese" hay "Tiếng Nhật", để nhận ra ngay cả khi
// họ không đọc được ngôn ngữ hiện tại của trang.
const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  vi: "Tiếng Việt",
  "zh-CN": "简体中文",
  "zh-TW": "繁體中文",
  ja: "日本語",
  ko: "한국어",
  id: "Bahasa Indonesia",
  th: "ภาษาไทย",
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
  pt: "Português",
  es: "Español",
  ru: "Русский",
  tr: "Türkçe",
};

/**
 * Icon globe thay cho <select> hiển thị chữ — nhất quán với SearchBar
 * (cũng thu gọn thành icon). Bấm vào icon để bung menu chọn ngôn ngữ,
 * đóng khi click ra ngoài hoặc chọn xong.
 */
export function LanguageSwitcher() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleChange(nextLocale: string) {
    setOpen(false);
    startTransition(() => {
      // router.replace từ next-intl tự thay tiền tố locale trong URL hiện
      // tại (vd đang ở "/vi/characters/kazuha" → "/ja/characters/kazuha"),
      // giữ nguyên toàn bộ path + dynamic params ([id]...) — không quay về
      // trang chủ như cách làm đơn giản (chỉ push("/")) sẽ gây khó chịu.
      router.replace(
        // @ts-expect-error -- pathname từ usePathname() là kiểu string
        // thuần (typed routes tắt ở next.config.ts), next-intl router
        // vẫn chấp nhận runtime nhưng type generic yêu cầu literal khớp
        // routing.pathnames (không dùng ở đây vì mọi path đều 1-1).
        { pathname, params },
        { locale: nextLocale }
      );
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("language")}
        aria-expanded={open}
        aria-haspopup="listbox"
        title={t("language")}
        disabled={isPending}
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-border text-text-secondary hover:border-gold hover:text-text-primary transition-colors disabled:opacity-50"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <path
            d="M3 12h18M12 3c2.5 2.7 3.8 6 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-6-3.8-9s1.3-6.3 3.8-9Z"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={t("language")}
          className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 w-40 max-h-72 overflow-y-auto rounded-lg border border-border bg-bg-card shadow-xl z-50 py-1"
        >
          {routing.locales.map((l) => (
            <button
              key={l}
              type="button"
              role="option"
              aria-selected={l === locale}
              onClick={() => handleChange(l)}
              className={`w-full text-left px-3 py-1.5 text-sm transition-colors hover:bg-bg-elevated ${
                l === locale ? "text-[color:var(--gold-bright)] font-semibold" : "text-text-secondary"
              }`}
            >
              {LOCALE_LABELS[l] ?? l}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
