// src/lib/fix/AutoFixEngine.ts
/**
 * AutoFixEngine — quét dữ liệu theo rule, đối chiếu với live provider
 * (nếu có cấu hình), và tự sửa các field lệch mà rule cho phép.
 *
 * Thiết kế rule-based có chủ đích: KHÔNG để AI tự quyết field nào được
 * sửa — mỗi rule khai báo rõ field nào nó được phép chạm vào
 * (`allowedFields`), và MỌI thay đổi đều đi qua AuditLogger.
 *
 * VÁ 0% ANY: bỏ `prisma[modelKey] as any`, thay bằng switch tường minh
 * (`findManyIds`/`updateByType`) — dài hơn nhưng TypeScript kiểm tra
 * đúng field hợp lệ cho từng bảng thật, bắt lỗi field sai ngay lúc
 * build thay vì runtime.
 */

import { prisma } from "@/lib/prisma";
import { DataSourceManager } from "@/lib/data-sources/DataSourceManager";
import { DiffEngine } from "@/lib/sync/DiffEngine";
import { createAuditLog } from "@/lib/agent/AuditLogger";
import type { EntityType, EntityRecordMap } from "@/agent/core/types";
import type { Prisma } from "@prisma/client";

export interface FixRule {
  name: string;
  entityType: EntityType;
  /** Field engine được phép ghi đè khi rule này phát hiện lệch. */
  allowedFields: string[];
}

export interface FixApplied {
  entityType: EntityType;
  entityId: string;
  rule: string;
  fields: string[];
}

export interface RunFullScanResult {
  fixedCount: number;
  fixes: FixApplied[];
  skipped: Array<{ entityType: EntityType; entityId: string; reason: string }>;
}

type EntityUpdateInput =
  | Prisma.CharacterUpdateInput
  | Prisma.WeaponUpdateInput
  | Prisma.MaterialUpdateInput
  | Prisma.DomainUpdateInput
  | Prisma.ArtifactSetUpdateInput;

// Số record gọi live provider ĐỒNG THỜI trong 1 lô + thời gian nghỉ
// giữa các lô — tránh vừa chậm (tuần tự) vừa dễ bị chặn (bắn hết cùng
// lúc). Có thể chỉnh qua env nếu live provider thật có giới hạn khác.
const CONCURRENCY = parseInt(process.env.AGENT_FIX_CONCURRENCY || "5", 10);
const BATCH_DELAY_MS = parseInt(process.env.AGENT_FIX_BATCH_DELAY_MS || "300", 10);

export class AutoFixEngine {
  private rules: FixRule[] = [];
  private dataManager = new DataSourceManager();

  registerRule(rule: FixRule): void {
    this.rules.push(rule);
  }

  /**
   * Rule mặc định: đối chiếu số liệu cơ bản (baseHp/baseAtk/baseDef cho
   * character, baseAtk cho weapon, bonus cho artifact) với live
   * provider. CHỈ áp dụng nếu đã cấu hình live provider.
   */
  static getDefaultRules(): FixRule[] {
    return [
      // baseHp/baseAtk/baseDef LÀ field thật trên Character (Float?
      // trong schema) — đã verify tồn tại trong DB, còn việc
      // JmpBlueProvider có TRẢ VỀ được giá trị hay không thì chưa xác
      // nhận (xem comment trong JmpBlueProvider.ts); nếu không, giá
      // trị undefined bị lọc bỏ, rule thành no-op an toàn.
      { name: "character-base-stats", entityType: "character", allowedFields: ["baseHp", "baseAtk", "baseDef"] },
      // baseAtk cho weapon ĐÃ VERIFY THẬT — field "baseAttack" trong
      // response, map đúng trong JmpBlueProvider.parseWeapon().
      { name: "weapon-base-atk", entityType: "weapon", allowedFields: ["baseAtk"] },
      // Chưa verify field bonus 2/4 món thật — xem
      // GENSHIN-API-REFERENCE.md để test tiếp nếu muốn chắc chắn.
      { name: "artifact-set-bonus", entityType: "artifact", allowedFields: ["twoPieceBonus", "fourPieceBonus"] },
    ];
  }

  async runFullScan(entityTypeFilter?: string): Promise<RunFullScanResult> {
    if (!this.dataManager.hasLiveProvider()) {
      return {
        fixedCount: 0,
        fixes: [],
        skipped: [
          {
            entityType: "character",
            entityId: "*",
            reason:
              "Chưa cấu hình live data provider (AGENT_LIVE_PROVIDER) — không có gì để đối chiếu, bỏ qua toàn bộ scan.",
          },
        ],
      };
    }

    const fixes: FixApplied[] = [];
    const skipped: RunFullScanResult["skipped"] = [];

    const rules = entityTypeFilter
      ? this.rules.filter((r) => r.entityType === entityTypeFilter)
      : this.rules;

    for (const rule of rules) {
      const ids = await this.listIds(rule.entityType);
      for (let i = 0; i < ids.length; i += CONCURRENCY) {
        const batch = ids.slice(i, i + CONCURRENCY);
        const results = await Promise.allSettled(batch.map((id) => this.applyRuleToEntity(rule, id)));

        results.forEach((res, idx) => {
          const id = batch[idx];
          if (res.status === "fulfilled") {
            if (res.value) fixes.push(res.value);
          } else {
            skipped.push({
              entityType: rule.entityType,
              entityId: id,
              reason: res.reason instanceof Error ? res.reason.message : String(res.reason),
            });
          }
        });

        if (i + CONCURRENCY < ids.length) {
          await new Promise((r) => setTimeout(r, BATCH_DELAY_MS));
        }
      }
    }

    return { fixedCount: fixes.length, fixes, skipped };
  }

  private async listIds(type: EntityType): Promise<string[]> {
    let rows: Array<{ id: string }>;
    switch (type) {
      case "character":
        rows = await prisma.character.findMany({ select: { id: true } });
        break;
      case "weapon":
        rows = await prisma.weapon.findMany({ select: { id: true } });
        break;
      case "material":
        rows = await prisma.material.findMany({ select: { id: true } });
        break;
      case "domain":
        rows = await prisma.domain.findMany({ select: { id: true } });
        break;
      case "artifact":
        rows = await prisma.artifactSet.findMany({ select: { id: true } });
        break;
    }
    return rows.map((r) => r.id);
  }

  private async updateByType(
    type: EntityType,
    id: string,
    data: EntityUpdateInput
  ): Promise<EntityRecordMap[EntityType]> {
    switch (type) {
      case "character":
        return prisma.character.update({ where: { id }, data: data as Prisma.CharacterUpdateInput });
      case "weapon":
        return prisma.weapon.update({ where: { id }, data: data as Prisma.WeaponUpdateInput });
      case "material":
        return prisma.material.update({ where: { id }, data: data as Prisma.MaterialUpdateInput });
      case "domain":
        return prisma.domain.update({ where: { id }, data: data as Prisma.DomainUpdateInput });
      case "artifact":
        return prisma.artifactSet.update({ where: { id }, data: data as Prisma.ArtifactSetUpdateInput });
    }
  }

  private async applyRuleToEntity(rule: FixRule, id: string): Promise<FixApplied | null> {
    const [local, live] = await Promise.all([
      this.dataManager.fetchLocal(rule.entityType, id),
      this.dataManager.fetch(rule.entityType, id, true),
    ]);
    if (!local || !live) return null;

    // Ép qua `unknown` trước khi vào DiffEngine (nhận Record<string,
    // unknown> chung cho mọi loại entity — xem comment trong
    // DiffEngine.ts) — record Prisma không có index signature nên cần
    // 1 bước trung gian `unknown`, đây là type assertion tường minh,
    // không phải `any`.
    const diff = DiffEngine.diff(
      local as unknown as Record<string, unknown>,
      live as unknown as Record<string, unknown>
    );
    const relevant = diff.fields.filter((f) => rule.allowedFields.includes(f.field));
    if (relevant.length === 0) return null;

    const updateData: Record<string, unknown> = {};
    for (const f of relevant) updateData[f.field] = f.live;

    await this.updateByType(rule.entityType, id, updateData as unknown as EntityUpdateInput);

    await createAuditLog({
      action: `auto_fix_${rule.entityType}`,
      entityType: rule.entityType,
      entityId: id,
      oldValue: Object.fromEntries(relevant.map((f) => [f.field, f.local])),
      newValue: updateData,
      performedBy: "ai_agent_auto",
      reason: `Rule "${rule.name}" phát hiện lệch với nguồn live (${relevant.map((f) => f.field).join(", ")})`,
    });

    return { entityType: rule.entityType, entityId: id, rule: rule.name, fields: relevant.map((f) => f.field) };
  }
}
