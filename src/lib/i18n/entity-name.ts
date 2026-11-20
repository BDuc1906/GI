/**
 * src/lib/i18n/entity-name.ts
 *
 * Chọn tên hiển thị ĐÚNG NGÔN NGỮ hiện tại cho 1 entity (nhân vật/vũ khí/
 * thánh di vật/bí cảnh/nguyên liệu) có cột `nameTranslations Json?`.
 *
 * Đồng thời hỗ trợ truy xuất trạng thái bản dịch (official, machine_translated, fallback)
 * để minh bạch hóa nguồn dữ liệu cho người dùng.
 */

import {
  determineTranslationStatus,
  type LocalizedResult,
} from "@/core/i18n/translation-status";

interface NamedEntity {
  name: string;
  nameTranslations?: unknown; // Prisma JsonValue
}

/**
 * Trả về kết quả dịch kèm trạng thái nguồn gốc và cờ fallback
 */
export function getLocalizedNameWithStatus(
  entity: NamedEntity,
  locale: string
): LocalizedResult<string> {
  const translations = entity.nameTranslations as Record<string, string> | null | undefined;
  const translatedValue = translations?.[locale];

  const { status, isFallback, sourceLocale } = determineTranslationStatus(
    locale,
    Boolean(translatedValue && translatedValue.trim().length > 0)
  );

  return {
    value: translatedValue || entity.name,
    status,
    targetLocale: locale,
    sourceLocale: isFallback ? sourceLocale : locale,
    isFallback,
  };
}

/**
 * Hàm tiện ích trả về chuỗi tên đơn thuần (tương thích ngược hoàn toàn)
 */
export function getLocalizedName(entity: NamedEntity, locale: string): string {
  return getLocalizedNameWithStatus(entity, locale).value;
}
