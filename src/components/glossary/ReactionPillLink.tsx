
"use client";

/**
 * src/components/glossary/ReactionPillLink.tsx
 *
 * Giống GlossaryTerm (bấm mở popup chi tiết qua GlossaryProvider) nhưng
 * KHÔNG tự ý đổi màu theo accentColor của thuật ngữ — nhận `style` từ
 * bên ngoài, vì có những chỗ (vd elements/page.tsx) pill cần giữ đúng
 * màu theo NGUYÊN TỐ CỦA SECTION đang xem (xem reactionPillStyle trong
 * element-reactions-data.ts), không phải màu cố định của phản ứng.
 * Hover dùng thuộc tính `title` gốc của trình duyệt — nhẹ, không đụng
 * tới màu/khung của pill.
 *
 * ĐA NGÔN NGỮ (2026-08): GLOSSARY_MAP tĩnh cũ đã đổi thành
 * getGlossaryTerm(id, locale) — lấy locale qua useLocale() để tooltip
 * (title) hiện đúng bản dịch.
 */
import type { CSSProperties } from "react";
import { useLocale } from "next-intl";
import { getGlossaryTerm } from "@/lib/i18n/glossary";
import { useGlossary } from "./GlossaryProvider";

export function ReactionPillLink({
  id,
  label,
  style,
}: {
  id: string;
  label: string;
  style: CSSProperties;
}) {
  const locale = useLocale();
  const { open } = useGlossary();
  const term = getGlossaryTerm(id, locale);

  return (
    <button
      type="button"
      onClick={() => open(id)}
      title={term?.summary}
      className="text-xs px-3 py-1.5 rounded-full border font-medium hover:brightness-125 active:scale-95 transition cursor-pointer"
      style={style}
    >
      {label}
    </button>
  );
}
