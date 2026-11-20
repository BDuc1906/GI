/**
 * src/core/i18n/translation-status.ts
 *
 * HỆ THỐNG PHÂN LOẠI NGUỒN VÀ TRẠNG THÁI BẢN DỊCH (LEIBO TRANSLATION GOVERNANCE)
 *
 * Chuẩn hóa 5 trạng thái tin cậy của bản dịch:
 * - official: Lấy từ dữ liệu ngôn ngữ chính thức của game (13 ngôn ngữ qua genshin-db)
 * - human_verified: Đã được người có chuyên môn kiểm duyệt và xác minh
 * - machine_translated: Dịch máy (Azure Translator, DeepL, v.v. - ví dụ: Ý "it", Thổ Nhĩ Kỳ "tr")
 * - fallback: Chưa có bản dịch, đang dùng ngôn ngữ mặc định (thường là English hoặc Vietnamese)
 * - needs_review: Có bản dịch nhưng đang chờ kiểm tra
 */

export type TranslationStatus =
  | "official"
  | "human_verified"
  | "machine_translated"
  | "fallback"
  | "needs_review";

export const OFFICIAL_GAME_LOCALES = new Set([
  "en",
  "vi",
  "zh-CN",
  "zh-TW",
  "ja",
  "ko",
  "id",
  "th",
  "de",
  "fr",
  "pt",
  "es",
  "ru",
]);

export const MACHINE_TRANSLATED_LOCALES = new Set(["it", "tr"]);

export interface LocalizedResult<T> {
  value: T;
  status: TranslationStatus;
  targetLocale: string;
  sourceLocale: string;
  isFallback: boolean;
}

/**
 * Xác định trạng thái của bản dịch dựa trên locale và nguồn
 */
export function determineTranslationStatus(
  targetLocale: string,
  hasLocalizedValue: boolean,
  isHumanVerified = false
): { status: TranslationStatus; isFallback: boolean; sourceLocale: string } {
  if (!hasLocalizedValue) {
    return {
      status: "fallback",
      isFallback: true,
      sourceLocale: "en",
    };
  }

  if (isHumanVerified) {
    return {
      status: "human_verified",
      isFallback: false,
      sourceLocale: targetLocale,
    };
  }

  if (OFFICIAL_GAME_LOCALES.has(targetLocale)) {
    return {
      status: "official",
      isFallback: false,
      sourceLocale: targetLocale,
    };
  }

  if (MACHINE_TRANSLATED_LOCALES.has(targetLocale)) {
    return {
      status: "machine_translated",
      isFallback: false,
      sourceLocale: targetLocale,
    };
  }

  return {
    status: "needs_review",
    isFallback: false,
    sourceLocale: targetLocale,
  };
}
