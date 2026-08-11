// src/lib/fix/AutoFixEngine.ts
/**
 * AutoFixEngine — quét dữ liệu theo rule, đối chiếu với live provider
 * (nếu có cấu hình), và tự sửa các field lệch mà rule cho phép.
 *
 * Thiết kế rule-based có chủ đích: KHÔNG để AI tự quyết field nào được
 * sửa — mỗi rule khai báo rõ field nào nó được phép chạm vào
 * (`allowedFields`), và MỌI thay đổi đều đi qua AuditLogger. Việc này
 * giới hạn "bán kính nổ" nếu live provider trả dữ liệu sai (xem cảnh
 * báo trong AmbrProvider.ts) — rule chỉ sửa field nó khai báo, không
 * bao giờ ghi đè nguyên object.
 */

import { prisma } from "@/lib/prisma";
import { DataSourceManager } from "@/lib/data-sources/DataSourceManager";
import { DiffEngine } from "@/lib/sync/DiffEngine";
import { createAuditLog } from "@/lib/agent/AuditLogger";
import type { EntityType } from "@/agent/core/schemas";

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

const MODEL_BY_TYPE: Record<EntityType, keyof typeof prisma> = {
  character: "character",
  weapon: "weapon",
  material: "material",
  domain: "domain",
  artifact: "artifactSet",
};

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
   * provider. CHỈ áp dụng nếu đã cấu hình live provider — không có gì
   * để so sánh thì không có gì để tự sửa.
   */
  static getDefaultRules(): FixRule[] {
    return [
      { name: "character-base-stats", entityType: "character", allowedFields: ["baseHp", "baseAtk", "baseDef"] },
      { name: "weapon-base-atk", entityType: "weapon", allowedFields: ["baseAtk"] },
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
      // Chạy theo lô nhỏ (CONCURRENCY record song song, nghỉ giữa các
      // lô) thay vì tuần tự từng record hoặc bắn hết cùng lúc — vài
      // trăm nhân vật/vũ khí gọi tuần tự sẽ rất chậm (mỗi lần round-trip
      // network), còn bắn đồng thời hết dễ bị chính live provider chặn
      // vì spike request bất thường (xem cảnh báo rate limit trong
      // AmbrProvider — hầu hết API công khai dạng này đều có giới hạn
      // ngầm dù không công bố).
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
    const modelKey = MODEL_BY_TYPE[type];
    const rows = await (prisma[modelKey] as any).findMany({ select: { id: true } });
    return rows.map((r: { id: string }) => r.id);
  }

  private async applyRuleToEntity(rule: FixRule, id: string): Promise<FixApplied | null> {
    const [local, live] = await Promise.all([
      this.dataManager.fetchLocal(rule.entityType, id),
      this.dataManager.fetch(rule.entityType, id, true),
    ]);
    if (!local || !live) return null;

    const diff = DiffEngine.diff(local, live);
    const relevant = diff.fields.filter((f) => rule.allowedFields.includes(f.field));
    if (relevant.length === 0) return null;

    const updateData: Record<string, unknown> = {};
    for (const f of relevant) updateData[f.field] = f.live;

    const modelKey = MODEL_BY_TYPE[rule.entityType];
    await (prisma[modelKey] as any).update({ where: { id }, data: updateData });

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
