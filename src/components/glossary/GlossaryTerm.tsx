"use client";

/**
 * src/components/glossary/GlossaryTerm.tsx
 *
 * 1 từ khóa hiệu ứng/cộng hưởng có thể tương tác:
 *   - Di chuột vào (desktop): hiện tooltip CSS thuần, tóm tắt 1 câu.
 *   - Bấm vào (mọi thiết bị, kể cả cảm ứng): mở popup chi tiết đầy đủ
 *     qua GlossaryProvider — vì hover không có trên mobile nên bấm luôn
 *     đi thẳng tới nội dung đầy đủ, không cần 2 bước.
 *
 * Dùng trực tiếp khi biết chắc id: <GlossaryTerm id="vaporize">Bốc Hơi</GlossaryTerm>
 * Hoặc dùng gián tiếp qua <GlossaryText text="..."/> để tự động quét và
 * bọc từ khóa trong 1 đoạn văn bản bất kỳ — xem GlossaryText.tsx.
 */
import { GLOSSARY_MAP } from "@/lib/i18n/glossary";
import { useGlossary } from "./GlossaryProvider";

export function GlossaryTerm({ id, children }: { id: string; children: React.ReactNode }) {
  const term = GLOSSARY_MAP[id];
  const { open } = useGlossary();

  if (!term) return <>{children}</>;

  return (
    <span className="relative inline-block group">
      <button
        type="button"
        onClick={() => open(id)}
        className="underline decoration-dotted underline-offset-2 font-medium hover:decoration-solid transition-colors cursor-help"
        style={{ color: term.accentColor }}
      >
        {children}
      </button>
      {/* Tooltip hover — CSS thuần (group-hover), không tính toán vị trí
          bằng JS nên không cần thư viện popover/floating-ui. Tự ẩn trên
          thiết bị cảm ứng vì không có trạng thái :hover thật, người dùng
          bấm thẳng để xem chi tiết. */}
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 bottom-full z-50 mb-2 w-56 -translate-x-1/2 rounded-lg border bg-[color:var(--surface,#15151a)] p-2.5 text-xs leading-snug opacity-0 shadow-xl transition-opacity duration-150 group-hover:opacity-100"
        style={{ borderColor: `${term.accentColor}55` }}
      >
        <span className="block font-semibold mb-1" style={{ color: term.accentColor }}>
          {term.title}
        </span>
        <span className="block text-text-muted">{term.summary}</span>
        <span className="block text-text-muted/70 mt-1 italic">Bấm để xem chi tiết</span>
      </span>
    </span>
  );
}
