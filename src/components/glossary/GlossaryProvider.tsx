
"use client";

/**
 * src/components/glossary/GlossaryProvider.tsx
 *
 * Quản lý "đang mở popup chi tiết cho thuật ngữ nào" bằng Context, dùng
 * CHUNG cho cả trang — nhờ vậy chỉ có 1 modal duy nhất trong DOM (mount
 * ở layout gốc), thay vì mỗi GlossaryTerm tự vẽ 1 modal riêng (vừa tốn
 * vừa dễ vỡ z-index khi trang có hàng chục/hàng trăm chip).
 *
 * Đặt <GlossaryProvider> bọc quanh {children} ở
 * src/app/[locale]/layout.tsx để tính năng có hiệu lực TOÀN WEB — bất
 * cứ trang con nào cũng dùng được <GlossaryTerm>/<GlossaryText> mà
 * không cần tự thêm provider riêng.
 *
 * ĐA NGÔN NGỮ (2026-08): lấy locale hiện tại qua useLocale() của
 * next-intl (component này luôn nằm trong <NextIntlClientProvider>,
 * xem layout.tsx), truyền xuống getGlossaryTerm() để tra đúng bản dịch.
 * "Đóng" (aria-label nút X) và "Nhân vật liên quan:" chuyển qua
 * next-intl thay vì hardcode tiếng Việt — xem namespace "Glossary" ở
 * messages/*.json.
 */
import { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { getGlossaryTerm } from "@/lib/i18n/glossary";

interface GlossaryContextValue {
  openTermId: string | null;
  open: (id: string) => void;
  close: () => void;
}

const GlossaryContext = createContext<GlossaryContextValue | null>(null);

export function useGlossary(): GlossaryContextValue {
  const ctx = useContext(GlossaryContext);
  if (!ctx) {
    throw new Error("useGlossary() phải được gọi bên trong <GlossaryProvider>");
  }
  return ctx;
}

export function GlossaryProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const t = useTranslations("Glossary");
  const [openTermId, setOpenTermId] = useState<string | null>(null);
  const open = useCallback((id: string) => setOpenTermId(id), []);
  const close = useCallback(() => setOpenTermId(null), []);

  // Đóng bằng phím Esc — hành vi modal tiêu chuẩn.
  useEffect(() => {
    if (!openTermId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openTermId, close]);

  const term = openTermId ? getGlossaryTerm(openTermId, locale) : undefined;
  const dialogRef = useRef<HTMLDivElement>(null);

  return (
    <GlossaryContext.Provider value={{ openTermId, open, close }}>
      {children}
      {term && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          role="presentation"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="glossary-term-title"
            className="w-full max-w-md rounded-xl border border-border bg-[color:var(--surface,#15151a)] p-5 shadow-2xl"
            style={{ borderColor: `${term.accentColor}55` }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span
                  id="glossary-term-title"
                  className="font-display font-bold text-lg"
                  style={{ color: term.accentColor }}
                >
                  {term.title}
                </span>
                <div className="mt-1">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full border font-medium"
                    style={{
                      borderColor: `${term.accentColor}88`,
                      backgroundColor: `${term.accentColor}22`,
                      color: term.accentColor,
                    }}
                  >
                    {term.badge}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label={t("close")}
                className="shrink-0 rounded-full w-7 h-7 flex items-center justify-center text-text-muted hover:text-[color:var(--text)] hover:bg-white/5 transition-colors"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-text-muted leading-relaxed whitespace-pre-line">{term.detail}</p>
            {term.requiresCharacters && (
              <p className="text-xs text-text-muted mt-3 pt-3 border-t border-border">
                <span className="font-medium text-[color:var(--text)]">{t("relatedCharacters")} </span>
                {term.requiresCharacters}
              </p>
            )}
          </div>
        </div>
      )}
    </GlossaryContext.Provider>
  );
}
