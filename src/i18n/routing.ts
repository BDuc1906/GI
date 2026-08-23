import { defineRouting } from "next-intl/routing";

/**
 * Danh sách locale = đúng 15 "Text Language" mà chính Genshin Impact hỗ
 * trợ (Settings trong game) — không bịa thêm/bớt ngôn ngữ so với game gốc,
 * để người dùng LEIBO luôn tìm được ngôn ngữ họ đang chơi game.
 *
 * Mã locale dùng chuẩn BCP-47 phổ biến nhất cho từng ngôn ngữ:
 * - "zh-CN" (Giản thể) / "zh-TW" (Phồn thể) để phân biệt 2 biến thể
 *   Trung văn mà game có, thay vì gộp chung "zh".
 * - Các mã còn lại (ja, ko, id, th, de, fr, it, pt, es, ru, tr) là mã
 *   ISO 639-1 chuẩn, không cần vùng miền cụ thể.
 */
export const routing = defineRouting({
  locales: [
    "en", // English — mặc định
    "vi", // Tiếng Việt
    "zh-CN", // 简体中文
    "zh-TW", // 繁體中文
    "ja", // 日本語
    "ko", // 한국어
    "id", // Bahasa Indonesia
    "th", // ภาษาไทย
    "de", // Deutsch
    "fr", // Français
    "it", // Italiano
    "pt", // Português
    "es", // Español
    "ru", // Русский
    "tr", // Türkçe
  ],
  defaultLocale: "en",
  // "always": mọi URL đều có tiền tố locale (kể cả tiếng Anh mặc định →
  // "/en/characters"), đúng yêu cầu SEO đa ngôn ngữ đã chọn — khác với
  // "as-needed" (locale mặc định ẩn tiền tố, dễ gây nhầm lẫn origin
  // content vs bản dịch khi submit hreflang cho Google Search Console).
  localePrefix: "always",
});

export type AppLocale = (typeof routing.locales)[number];
