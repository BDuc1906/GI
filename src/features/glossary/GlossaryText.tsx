
"use client";

/**
 * src/components/glossary/GlossaryText.tsx
 *
 * "Auto-linkify" cho toàn site: đưa vào 1 đoạn văn bản thường, component
 * tự quét và bọc mọi từ khóa hiệu ứng/cộng hưởng nhận diện được bằng
 * <GlossaryTerm>, phần còn lại giữ nguyên text thường.
 *
 * CÁCH ÁP DỤNG RA TOÀN WEB: ở bất kỳ trang/component nào đang render
 * text thô kiểu {description} hoặc {character.overview}, đổi thành
 * <GlossaryText text={description} /> — không cần biết trước trong đó
 * có từ khóa nào, component tự tìm.
 *
 * Ví dụ:
 *   // Trước
 *   <p>{r.description}</p>
 *   // Sau — mọi tên phản ứng/cộng hưởng nhắc tới trong r.description
 *   // (vd Hyperbloom mô tả có nhắc "Sum Suê") sẽ tự thành link chéo
 *   <p><GlossaryText text={r.description} /></p>
 *
 * ĐA NGÔN NGỮ (2026-08): lấy locale qua useLocale(), truyền vào
 * findGlossaryMatches() để quét đúng bộ từ khóa theo ngôn ngữ (vd khi
 * locale="en", quét theo "Vaporize" thay vì "Bốc Hơi"). Text truyền vào
 * component này vẫn phải là text ĐÃ đúng locale từ nơi gọi — component
 * chỉ quét/link, không tự dịch nội dung text.
 */
import { Fragment } from "react";
import { useLocale } from "next-intl";
import { findGlossaryMatches } from "@/lib/i18n/glossary";
import { GlossaryTerm } from "./GlossaryTerm";

export function GlossaryText({ text, excludeId }: { text: string; excludeId?: string }) {
  const locale = useLocale();
  const matches = findGlossaryMatches(text, locale).filter((m) => m.termId !== excludeId);
  if (matches.length === 0) return <>{text}</>;

  const nodes: React.ReactNode[] = [];
  let cursor = 0;

  matches.forEach((m, i) => {
    if (m.start > cursor) {
      nodes.push(<Fragment key={`t-${i}`}>{text.slice(cursor, m.start)}</Fragment>);
    }
    nodes.push(
      <GlossaryTerm key={`m-${i}`} id={m.termId}>
        {text.slice(m.start, m.end)}
      </GlossaryTerm>
    );
    cursor = m.end;
  });

  if (cursor < text.length) {
    nodes.push(<Fragment key="t-last">{text.slice(cursor)}</Fragment>);
  }

  return <>{nodes}</>;
}
