// src/app/api/admin/fix/route.ts
/**
 * API Route: /api/admin/fix
 * Trigger auto-fix thủ công - Yêu cầu quyền admin (Authorization: Bearer <ADMIN_API_KEY>)
 */

import { NextRequest } from "next/server";
import { AutoFixEngine } from "@/lib/fix/AutoFixEngine";
import { requireAdmin } from "@/agent/utils/auth";
import { ok, fail } from "@/lib/api/response";
import { EntityTypeSchema } from "@/agent/core/schemas";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin(req);

    const body = await req.json().catch(() => ({}));
    const parsedType = EntityTypeSchema.safeParse(body?.entityType);
    const entityType = parsedType.success ? parsedType.data : undefined;

    const engine = new AutoFixEngine();
    for (const rule of AutoFixEngine.getDefaultRules()) {
      engine.registerRule(rule);
    }

    const result = await engine.runFullScan(entityType);

    return ok({
      message: `Tự động sửa ${result.fixedCount} lỗi dữ liệu`,
      performedBy: user.id,
      fixes: result.fixes,
      fixedCount: result.fixedCount,
      skipped: result.skipped,
    });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("UNAUTHORIZED")) {
      return fail(401, "UNAUTHORIZED", error.message);
    }
    if (error instanceof Error && error.message.startsWith("FORBIDDEN")) {
      return fail(403, "FORBIDDEN", error.message);
    }
    console.error("[Fix API] Error:", error);
    return fail(500, "FIX_ERROR", error instanceof Error ? error.message : "Lỗi không xác định");
  }
}