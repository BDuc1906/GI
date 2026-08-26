/**
 * src/lib/entity-name.ts
 *
 * Chọn tên hiển thị ĐÚNG NGÔN NGỮ hiện tại cho 1 entity (nhân vật/vũ khí/
 * thánh di vật/bí cảnh/nguyên liệu) có cột `nameTranslations Json?`
 * (điền bởi scripts/seed-name-translations.ts — xem file đó để biết
 * nguồn dữ liệu).
 *
 * Luôn có fallback an toàn về `entity.name` (tiếng Anh) nếu:
 *   - Chưa chạy seed-name-translations.ts lần nào (nameTranslations null).
 *   - Locale hiện tại không có trong bản dịch (vd thiếu AZURE_TRANSLATOR_KEY
 *     lúc seed nên it/tr chưa được điền).
 * → Không bao giờ hiện chuỗi rỗng/undefined ngoài UI dù thiếu dữ liệu.
 */

interface NamedEntity {
  name: string;
  nameTranslations?: unknown; // Prisma JsonValue — ép kiểu an toàn bên trong hàm
}

export function getLocalizedName(entity: NamedEntity, locale: string): string {
  const translations = entity.nameTranslations as Record<string, string> | null | undefined;
  return translations?.[locale] || entity.name;
}
