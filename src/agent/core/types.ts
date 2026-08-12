// src/agent/core/types.ts
/**
 * Kiểu dùng chung cho toàn bộ AI Agent — thay thế mọi chỗ trước đây
 * dùng `any`. Nguyên tắc:
 *
 * 1. Nơi nào code THỰC SỰ đọc/ghi field cụ thể (DiffEngine, AutoFixEngine,
 *    provider parser, AuditLogger) → dùng type CHÍNH XÁC lấy từ
 *    `@prisma/client` (do Prisma tự sinh từ schema thật, không phải
 *    tự khai báo tay nên không thể lệch schema).
 * 2. Nơi nào chỉ "đi qua" (pass-through) mà không đọc field nào (search
 *    trả JSON thẳng cho LLM, tool params trước khi validate) → dùng
 *    `unknown`, KHÔNG dùng `any`. Khác biệt quan trọng: `unknown` bắt
 *    buộc phải kiểm tra/ép kiểu trước khi truy cập field (an toàn),
 *    còn `any` tắt hoàn toàn kiểm tra kiểu (đây mới là thứ ESLint
 *    `no-explicit-any` muốn chặn).
 */

import type { Character, Weapon, Material, Domain, ArtifactSet } from "@prisma/client";
import type { EntityType } from "./schemas";

// Re-export để các file khác chỉ cần import từ 1 chỗ (types.ts) thay vì
// phải nhớ EntityType gốc nằm ở schemas.ts.
export type { EntityType } from "./schemas";

/** Map từ EntityType (string) sang đúng type Prisma tương ứng. */
export interface EntityRecordMap {
  character: Character;
  weapon: Weapon;
  material: Material;
  domain: Domain;
  artifact: ArtifactSet;
}

/** Type Prisma cụ thể ứng với 1 EntityType — dùng trong hàm generic. */
export type EntityRecord<T extends EntityType> = EntityRecordMap[T];

/** Hợp của toàn bộ record entity — dùng khi không cần biết cụ thể loại nào. */
export type AnyEntityRecord = Character | Weapon | Material | Domain | ArtifactSet;

/**
 * Dữ liệu 1 phần từ nguồn "live" (API ngoài) — LUÔN là Partial vì
 * provider chỉ trả về field nó thực sự lấy được (xem AmbrProvider/
 * JmpBlueProvider), không đảm bảo đủ mọi field như record DB thật.
 */
export type LiveEntityData<T extends EntityType> = Partial<EntityRecordMap[T]>;

/**
 * Giá trị 1 field bất kỳ trong record entity — dùng cho DiffEngine so
 * sánh giá trị field mà không cần biết trước kiểu cụ thể là gì (string,
 * number, Date, JSON...). `unknown` ở đây là ĐÚNG chỗ dùng: DiffEngine
 * chỉ so sánh bằng JSON.stringify, không đọc cấu trúc bên trong.
 */
export type FieldValue = unknown;
