
"use client";

/**
 * src/components/glossary/ReactionPillLink.tsx
 *
 * Giữ liên kết mở glossary có thể dùng trong văn bản mà không tạo badge.
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
      className="text-xs font-medium underline decoration-dotted underline-offset-2 hover:brightness-125 transition cursor-pointer"
      style={{ color: style.color }}
    >
      {label}
    </button>
  );
}
