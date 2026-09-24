/**
 * scripts/lib/audit-diff.ts
 *
 * BỔ SUNG (2026-09-22) — "chuẩn theo wiki lớn, làm tốt hơn":
 * MediaWiki (Fandom, Genshin Impact Wiki...) giữ lại LỊCH SỬ MỌI LẦN SỬA
 * (kể cả bot tự động) qua bảng revision/text — diff được, revert được.
 * Trước khi có file này, LEIBO đã có sẵn bảng `AuditLog` với ĐÚNG hình
 * dạng cần thiết (`oldValue`/`newValue` JSON, `entityType`/`entityId`,
 * `performedBy`, `createdAt`) — NHƯNG chỉ AI Agent (`src/agent/tools/
 * fix.tool.ts`) và AutoFixEngine (`src/lib/fix/AutoFixEngine.ts`) ghi vào
 * đó. Pipeline seed/crawl THƯỜNG NGÀY (chạy tự động qua auto-fix.yml/
 * update-data.yml, ghi đè hàng nghìn dòng mỗi lần genshin-db cập nhật
 * patch mới) không ghi log gì cả — giá trị CŨ (vd ATK vũ khí trước khi
 * rebalance) bị mất vĩnh viễn ngay khi patch mới seed đè lên.
 *
 * File này lấp khoảng trống đó, tái dùng NGUYÊN bảng AuditLog đã có sẵn
 * (không cần bảng/migration mới) — và làm TỐT HƠN wiki ở điểm: wiki chỉ
 * lưu 2 blob wikitext (cũ/mới) để người đọc tự so sánh bằng mắt; ở đây
 * diff được tính SẴN, chỉ chứa đúng field nào đổi + giá trị cũ/mới của
 * riêng field đó — máy đọc được ngay (vd tự động hiển thị "ATK: 41 → 44"
 * trên trang changelog vũ khí, không cần con người tự so 2 khối JSON).
 *
 * CÁCH DÙNG (xem ví dụ nối dây thật ở scripts/seed/seed-characters.ts):
 *   const existing = await prisma.character.findUnique({ where: { id } });
 *   await prisma.character.upsert({ where: { id }, create, update });
 *   await logDataSyncChange({
 *     entityType: "character", entityId: id,
 *     oldRecord: existing, newRecord: payload, source: "seed-characters",
 *   });
 */

import { createAuditLog } from "../../src/lib/agent/AuditLogger";

// Field "ồn" tự sinh bởi Prisma, không phản ánh thay đổi dữ liệu THẬT từ
// nguồn genshin-db — luôn bỏ qua khi diff, nếu không AuditLog sẽ ghi
// "thay đổi" ở MỌI lần seed dù dữ liệu game không hề đổi gì (vì updatedAt
// luôn khác nhau).
const DEFAULT_IGNORE_FIELDS = ["updatedAt", "createdAt"];

/**
 * So sánh record cũ (đọc từ DB trước khi upsert) với payload mới sắp
 * ghi — trả về map các field THẬT SỰ thay đổi, dạng { field: value },
 * tách riêng bên cũ/bên mới. Rỗng nếu không có gì đổi.
 *
 * So sánh qua JSON.stringify để bắt được cả thay đổi trong field JSON
 * lồng nhau (vd statsByLevel, ascensionMaterials) — 2 object khác thứ tự
 * key nhưng cùng nội dung sẽ bị coi là "khác nhau" (chấp nhận được: hiếm
 * khi genshin-db đổi thứ tự key mà giữ nguyên nội dung, và false-positive
 * ở đây chỉ tốn thêm 1 dòng AuditLog, không gây sai dữ liệu).
 */
export function diffRecords(
  oldRecord: Record<string, unknown> | null,
  newRecord: Record<string, unknown>,
  ignoreFields: string[] = DEFAULT_IGNORE_FIELDS
): { old: Record<string, unknown>; new: Record<string, unknown>; changedFields: string[] } {
  const oldDiff: Record<string, unknown> = {};
  const newDiff: Record<string, unknown> = {};
  const changedFields: string[] = [];

  if (!oldRecord) return { old: oldDiff, new: newDiff, changedFields };

  const keys = new Set([...Object.keys(oldRecord), ...Object.keys(newRecord)]);
  for (const key of keys) {
    if (ignoreFields.includes(key)) continue;
    const oldVal = oldRecord[key];
    const newVal = newRecord[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      oldDiff[key] = oldVal;
      newDiff[key] = newVal;
      changedFields.push(key);
    }
  }
  return { old: oldDiff, new: newDiff, changedFields };
}

export interface LogDataSyncChangeParams {
  entityType: string;
  entityId: string;
  /** Record đọc từ DB TRƯỚC khi upsert — null nếu entity hoàn toàn mới. */
  oldRecord: Record<string, unknown> | null;
  /** Payload vừa ghi vào DB (giá trị mới). */
  newRecord: Record<string, unknown>;
  /** Tên script gọi hàm này, vd "seed-characters" — để biết log tới từ đâu. */
  source: string;
  ignoreFields?: string[];
}

/**
 * Ghi 1 dòng AuditLog nếu record THẬT SỰ thay đổi (hoặc là record mới).
 * Không ghi gì nếu không có gì đổi — tránh phình bảng AuditLog với hàng
 * nghìn dòng "không đổi gì" mỗi lần seed (đa số entity KHÔNG đổi giữa 2
 * lần patch liên tiếp).
 */
export async function logDataSyncChange(params: LogDataSyncChangeParams): Promise<void> {
  const { entityType, entityId, oldRecord, newRecord, source, ignoreFields } = params;
  const isNew = oldRecord === null;

  if (!isNew) {
    const diff = diffRecords(oldRecord, newRecord, ignoreFields);
    if (diff.changedFields.length === 0) return; // không đổi gì thật -> không ghi log

    await createAuditLog({
      action: `data_sync_update_${entityType}`,
      entityType,
      entityId,
      oldValue: diff.old,
      newValue: diff.new,
      performedBy: `system:${source}`,
      reason: `Nguồn dữ liệu (genshin-db) thay đổi ${diff.changedFields.length} field: ${diff.changedFields.join(", ")}`,
    });
    return;
  }

  await createAuditLog({
    action: `data_sync_create_${entityType}`,
    entityType,
    entityId,
    newValue: newRecord,
    performedBy: `system:${source}`,
    reason: "Entity mới xuất hiện trong nguồn dữ liệu (genshin-db)",
  });
}
