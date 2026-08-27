/**
 * scripts/pipeline/verify-rollback.ts
 *
 * LƯỚI AN TOÀN cho scripts/pipeline/auto-fix.ts — vì AutoFixEngine chỉ
 * fetch live MỘT LẦN rồi tin luôn là đúng, nếu đúng lúc đó nguồn live
 * trả về dữ liệu lỗi/tạm thời (server lỗi, cache stale, rate-limit trả
 * body rỗng...) thì DB production sẽ bị ghi đè sai mà không ai biết.
 *
 * Script này đọc lại các AuditLog có action bắt đầu bằng "auto_fix_"
 * được tạo trong N phút gần nhất, fetch lại live data LẦN NỮA cho đúng
 * (entityType, entityId, field) đã sửa. Nếu giá trị live BÂY GIỜ khác
 * với giá trị vừa ghi vào DB lúc auto-fix chạy → coi lần fetch trước là
 * đáng ngờ, tự động revert field đó về giá trị CŨ (oldValue đã lưu sẵn
 * trong chính bản ghi AuditLog gốc), ghi thêm 1 AuditLog
 * "revert_auto_fix_*" mới, và báo qua notifyOps. Không cần ai bấm gì.
 *
 * Chạy: npx tsx --env-file=.env scripts/pipeline/verify-rollback.ts --window-minutes=40
 * (được gọi bởi .github/workflows/auto-fix.yml, ~30 phút SAU auto-fix.ts,
 * trong cùng 1 job)
 */

import { assertEnv } from "../../src/lib/infra/env";
assertEnv();

import type { Prisma } from "@prisma/client";
import { prisma } from "../../src/lib/db/prisma";
import { DataSourceManager } from "../../src/lib/data-sources/DataSourceManager";
import { createAuditLog } from "../../src/lib/agent/AuditLogger";
import { notifyOps } from "../../src/lib/infra/notify";
import type { EntityType } from "../../src/agent/core/types";

const windowArg = process.argv.find((a) => a.startsWith("--window-minutes="));
const WINDOW_MINUTES = windowArg ? Number(windowArg.split("=")[1]) : 60;

type EntityUpdateInput =
  | Prisma.CharacterUpdateInput
  | Prisma.WeaponUpdateInput
  | Prisma.MaterialUpdateInput
  | Prisma.DomainUpdateInput
  | Prisma.ArtifactSetUpdateInput;

// Cùng switch tường minh như FixTool/AutoFixEngine — không dùng
// `prisma[key] as any`.
async function updateByType(type: EntityType, id: string, data: EntityUpdateInput) {
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

async function main() {
  const cutoff = new Date(Date.now() - WINDOW_MINUTES * 60_000);

  const recentFixes = await prisma.auditLog.findMany({
    where: {
      action: { startsWith: "auto_fix_" },
      status: "success",
      createdAt: { gte: cutoff },
    },
    orderBy: { createdAt: "asc" },
  });

  if (recentFixes.length === 0) {
    console.log(`[verify-rollback] Không có auto-fix nào trong ${WINDOW_MINUTES} phút gần nhất — không có gì để kiểm tra lại.`);
    return;
  }

  const dataManager = new DataSourceManager();
  if (!dataManager.hasLiveProvider()) {
    console.log("[verify-rollback] Chưa cấu hình live provider — bỏ qua bước kiểm tra lại.");
    return;
  }

  let revertedCount = 0;
  const reverted: string[] = [];

  for (const entry of recentFixes) {
    const entityType = entry.entityType as EntityType;
    const newValue = entry.newValue as Record<string, unknown> | null;
    const oldValue = entry.oldValue as Record<string, unknown> | null;
    if (!newValue || !oldValue || typeof newValue !== "object" || typeof oldValue !== "object") continue;

    let live: Record<string, unknown> | null = null;
    try {
      live = (await dataManager.fetch(entityType, entry.entityId, true)) as unknown as Record<
        string,
        unknown
      > | null;
    } catch (err) {
      // Live provider lỗi NGAY LÚC kiểm tra lại — không đủ căn cứ để
      // revert (không biết đâu mới là giá trị đúng), bỏ qua bản ghi
      // này, để lần chạy verify-rollback kế tiếp tự xử lý.
      console.warn(`[verify-rollback] Không fetch được live cho ${entityType}/${entry.entityId}, bỏ qua:`, err);
      continue;
    }
    if (!live) continue;

    const revertFields: Record<string, unknown> = {};
    for (const field of Object.keys(newValue)) {
      const liveValueNow = live[field];
      // Chỉ revert khi live BÂY GIỜ khác với giá trị vừa ghi lúc
      // auto-fix chạy — nghĩa là lần fetch trước đáng ngờ.
      if (liveValueNow !== undefined && JSON.stringify(liveValueNow) !== JSON.stringify(newValue[field])) {
        revertFields[field] = oldValue[field];
      }
    }

    if (Object.keys(revertFields).length === 0) continue;

    await updateByType(entityType, entry.entityId, revertFields as unknown as EntityUpdateInput);

    await createAuditLog({
      action: `revert_auto_fix_${entityType}`,
      entityType,
      entityId: entry.entityId,
      oldValue: newValue,
      newValue: revertFields,
      performedBy: "ai_agent_auto",
      reason:
        `Kiểm tra lại sau ${WINDOW_MINUTES} phút: nguồn live không còn khớp giá trị đã fix ` +
        `(audit log gốc #${entry.id}) — revert về giá trị trước khi fix, nghi ngờ lần đọc live ` +
        `trước đó không ổn định.`,
    });

    revertedCount++;
    reverted.push(`${entityType}/${entry.entityId}: ${Object.keys(revertFields).join(", ")}`);
  }

  console.log(`[verify-rollback] Đã revert ${revertedCount}/${recentFixes.length} bản ghi vừa auto-fix.`);

  if (revertedCount > 0) {
    await notifyOps({
      source: "auto-fix",
      severity: "warning",
      title: `Đã tự ĐẢO NGƯỢC ${revertedCount} bản ghi — nghi ngờ live provider không ổn định`,
      detail: reverted.join("\n"),
    });
  }
}

main().catch(async (err) => {
  console.error("[verify-rollback] Lỗi không bắt được:", err);
  await notifyOps({
    source: "auto-fix",
    severity: "error",
    title: "verify-rollback crash — cần kiểm tra thủ công",
    detail: err instanceof Error ? err.message : String(err),
  });
  process.exitCode = 1;
});
