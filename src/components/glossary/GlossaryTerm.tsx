"use client";

/**
 * src/components/glossary/GlossaryTerm.tsx
 *
 * 1 từ khóa hiệu ứng/cộng hưởng có thể tương tác:
 *   - Di chuột vào (desktop): hiện tooltip GỐC của trình duyệt (thuộc
 *     tính `title`), tóm tắt 1 câu.
 *   - Bấm vào (mọi thiết bị, kể cả cảm ứng): mở popup chi tiết đầy đủ
 *     qua GlossaryProvider — vì hover không có trên mobile nên bấm luôn
 *     đi thẳng tới nội dung đầy đủ, không cần 2 bước.
 *
 * Dùng trực tiếp khi biết chắc id: <GlossaryTerm id="vaporize">Bốc Hơi</GlossaryTerm>
 * Hoặc dùng gián tiếp qua <GlossaryText text="..."/> để tự động quét và
 * bọc từ khóa trong 1 đoạn văn bản bất kỳ — xem GlossaryText.tsx.
 *
 * ĐA NGÔN NGỮ (2026-08): lấy locale qua useLocale(), truyền vào
 * getGlossaryTerm() để tooltip hiện đúng bản dịch.
 *
 * SỬA (2026-09, lần 1): từ khóa được bọc trong 1 phần tử <button> để bấm
 * mở popup — nhưng <button> mặc định (hoặc CSS nút bấm chung của site,
 * tuỳ theme) có thể tự thêm nền/viền/padding/cỡ chữ riêng, khiến 1 từ
 * nằm giữa câu bỗng phình to thành cái hộp tách biệt hẳn khỏi văn bản
 * xung quanh. Ép thẳng `font: inherit` + reset nền/viền/padding qua
 * `style` (thắng mọi CSS ngoài do inline style luôn có độ ưu tiên cao
 * hơn class) để từ khóa LUÔN cùng cỡ chữ với đoạn văn chứa nó.
 *
 * SỬA (2026-09, lần 2): tooltip hover cũ tự vẽ bằng 1 <span> định vị
 * `absolute` + `left-1/2 -translate-x-1/2` (canh giữa phía trên từ
 * khóa), rộng cố định 224px (w-56). Trong ngữ cảnh DÀY ĐẶC như 1 ô bảng
 * hẹp (bảng phản ứng ở elements/page.tsx), tooltip 224px này rộng hơn cả
 * chính ô đang chứa nó — tràn sang đè lên cột/hàng bên cạnh, gây báo lỗi
 * "bị che mất". Bỏ hẳn tooltip tự vẽ này, thay bằng thuộc tính `title`
 * gốc của trình duyệt: trình duyệt tự lo việc định vị/tránh tràn màn
 * hình, không bao giờ đè lên nội dung trang, không cần bảo trì CSS định
 * vị riêng. Popup chi tiết khi bấm (qua GlossaryProvider) không đổi.
 */
import { useLocale } from "next-intl";
import { getGlossaryTerm } from "@/lib/i18n/glossary";
import { useGlossary } from "./GlossaryProvider";

export function GlossaryTerm({ id, children }: { id: string; children: React.ReactNode }) {
  const locale = useLocale();
  const term = getGlossaryTerm(id, locale);
  const { open } = useGlossary();

  if (!term) return <>{children}</>;

  return (
    <button
      type="button"
      onClick={() => open(id)}
      title={term.summary}
      className="underline decoration-dotted underline-offset-2 hover:decoration-solid transition-colors cursor-help"
      style={{
        // Reset triệt để mọi style <button> mặc định/toàn cục có thể
        // đang áp lên site (nền, viền, padding, bo góc, cỡ chữ riêng).
        font: "inherit",
        color: term.accentColor,
        background: "transparent",
        border: "none",
        padding: 0,
        margin: 0,
        borderRadius: 0,
        fontWeight: 500,
      }}
    >
      {children}
    </button>
  );
}
