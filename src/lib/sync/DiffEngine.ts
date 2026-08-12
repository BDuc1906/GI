// src/lib/sync/DiffEngine.ts
/**
 * DiffEngine — so sánh 2 object phẳng-ish (record DB) và trả về danh
 * sách field khác nhau. Dùng cho CompareTool (hiển thị cho người dùng)
 * và AutoFixEngine (quyết định field nào cần fix).
 *
 * Cố tình ĐƠN GIẢN: so sánh shallow theo từng key ở object `live`, dùng
 * JSON.stringify để so các giá trị lồng nhau (JSON columns như
 * ascensionMaterials, talents...) — không cần diff sâu từng phần tử
 * mảng, vì mục đích là "có khác không, khác gì" cho con người/AI đọc,
 * không phải patch tự động từng phần tử.
 */

export interface FieldDiff {
  field: string;
  local: unknown;
  live: unknown;
}

export interface DiffResult {
  hasDiff: boolean;
  fields: FieldDiff[];
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value, (_key, v) => {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return Object.keys(v)
        .sort()
        .reduce((acc: Record<string, unknown>, k) => {
          acc[k] = (v as Record<string, unknown>)[k];
          return acc;
        }, {});
    }
    return v;
  });
}

function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  // Dùng "==" có chủ đích để coi null và undefined là tương đương
  // (dự án bạn cấu hình eslint eqeqeq cho phép so sánh với null) —
  // không cần eslint-disable vì rule đã tự loại trừ trường hợp này.
  if (a == null || b == null) return a == b;
  return stableStringify(a) === stableStringify(b);
}

export class DiffEngine {
  /**
   * So sánh `local` (dữ liệu trong DB) với `live` (dữ liệu từ nguồn
   * ngoài). Chỉ xét các key XUẤT HIỆN trong `live` — live provider chỉ
   * trả về field nó thực sự lấy được (xem AmbrProvider), field nào
   * live không có thì coi là "không kiểm tra được", không báo sai lệch
   * giả.
   */
  static diff(local: Record<string, unknown> | null, live: Record<string, unknown> | null): DiffResult {
    if (!live) return { hasDiff: false, fields: [] };
    if (!local) {
      return {
        hasDiff: true,
        fields: Object.entries(live).map(([field, value]) => ({ field, local: undefined, live: value })),
      };
    }

    const fields: FieldDiff[] = [];
    for (const [field, liveValue] of Object.entries(live)) {
      if (liveValue === undefined) continue; // provider không lấy được field này
      const localValue = local[field];
      if (!valuesEqual(localValue, liveValue)) {
        fields.push({ field, local: localValue, live: liveValue });
      }
    }

    return { hasDiff: fields.length > 0, fields };
  }
}
