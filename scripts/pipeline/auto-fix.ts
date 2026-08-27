/**
 * scripts/pipeline/auto-fix.ts
 *
 * Quét TOÀN BỘ dữ liệu qua AutoFixEngine (rule-based, mỗi rule chỉ được
 * đụng vào field đã khai báo trong `allowedFields`, mọi thay đổi đều ghi
 * AuditLog — xem src/lib/fix/AutoFixEngine.ts) và tự áp các lệch phát
 * hiện được so với live provider.
 *
 * Đây là cách chạy TỰ ĐỘNG (không cần admin gọi tay POST /api/admin/fix)
 * — dùng chung 1 class AutoFixEngine, cùng rule, cùng cơ chế audit log,
 * chỉ khác là chạy trực tiếp trong CI thay vì qua HTTP.
 *
 * Chạy thử ở máy dev: npx tsx --env-file=.env scripts/pipeline/auto-fix.ts
 * (được gọi tự động bởi .github/workflows/auto-fix.yml — KHÔNG dùng
 * --env-file ở đó vì GitHub Actions đã inject env trực tiếp)
 */

import { assertEnv } from "../../src/lib/infra/env";
assertEnv();

import { AutoFixEngine } from "../../src/lib/fix/AutoFixEngine";
import { notifyOps } from "../../src/lib/infra/notify";

async function main() {
  const engine = new AutoFixEngine();
  for (const rule of AutoFixEngine.getDefaultRules()) {
    engine.registerRule(rule);
  }

  const result = await engine.runFullScan();

  console.log(`[auto-fix] Đã sửa ${result.fixedCount} bản ghi.`);
  if (result.fixes.length > 0) {
    console.log(JSON.stringify(result.fixes, null, 2));
  }
  if (result.skipped.length > 0) {
    console.log(`[auto-fix] Bỏ qua ${result.skipped.length} bản ghi (xem lý do bên dưới):`);
    console.log(JSON.stringify(result.skipped.slice(0, 20), null, 2));
  }

  if (result.fixedCount > 0) {
    await notifyOps({
      source: "auto-fix",
      severity: "info",
      title: `AutoFixEngine đã tự sửa ${result.fixedCount} bản ghi lệch với nguồn live`,
      detail: result.fixes
        .map((f) => `${f.entityType}/${f.entityId}: ${f.fields.join(", ")} (rule: ${f.rule})`)
        .join("\n"),
    });
  }

  // "Chưa cấu hình live data provider" là no-op HỢP LỆ (rule tự bỏ qua
  // toàn bộ, không phải lỗi) — chỉ coi là lỗi thật nếu lý do khác, để
  // workflow biết khi nào cần tạo GitHub issue cảnh báo.
  const realErrors = result.skipped.filter(
    (s) => !s.reason.includes("Chưa cấu hình live data provider")
  );
  if (realErrors.length > 0) {
    console.error(`[auto-fix] ${realErrors.length} lỗi thật khi scan (không tính no-op do thiếu live provider).`);
    await notifyOps({
      source: "auto-fix",
      severity: "warning",
      title: `AutoFixEngine gặp ${realErrors.length} lỗi khi quét`,
      detail: realErrors.map((s) => `${s.entityType}/${s.entityId}: ${s.reason}`).join("\n"),
    });
    process.exitCode = 1;
  }
}

main().catch(async (err) => {
  console.error("[auto-fix] Lỗi không bắt được:", err);
  await notifyOps({
    source: "auto-fix",
    severity: "error",
    title: "AutoFixEngine crash — cần kiểm tra thủ công",
    detail: err instanceof Error ? err.message : String(err),
  });
  process.exitCode = 1;
});
