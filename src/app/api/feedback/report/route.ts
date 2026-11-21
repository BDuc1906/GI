import { NextRequest } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { ok, fail } from "@/lib/api/response";
import { withErrorHandling } from "@/lib/api/errors";
import { withRateLimit } from "@/lib/api/rate-limit";

export const dynamic = "force-dynamic";

const VALID_ENTITY_TYPES = ["character", "weapon", "artifact", "build", "domain", "material", "general"];
const VALID_ISSUE_TYPES = ["image", "stats", "translation", "build", "other"];

interface ReportRequestBody {
  entityType: string;
  entityId: string;
  entityName?: string;
  issueType: string;
  description: string;
  email?: string;
  locale?: string;
}

export const POST = withErrorHandling(
  withRateLimit(
    async (req: NextRequest) => {
      let body: ReportRequestBody;
      try {
        body = await req.json();
      } catch {
        return fail(400, "BAD_REQUEST", "Dữ liệu JSON không hợp lệ.");
      }

      const { entityType, entityId, entityName, issueType, description, email, locale } = body;

      if (!entityId || typeof entityId !== "string" || entityId.trim().length === 0) {
        return fail(400, "BAD_REQUEST", "Thiếu entityId hợp lệ.");
      }

      if (!VALID_ENTITY_TYPES.includes(entityType)) {
        return fail(
          400,
          "BAD_REQUEST",
          `Loại thực thể không hợp lệ. Phải là một trong: ${VALID_ENTITY_TYPES.join(", ")}`
        );
      }

      if (!VALID_ISSUE_TYPES.includes(issueType)) {
        return fail(
          400,
          "BAD_REQUEST",
          `Loại vấn đề không hợp lệ. Phải là một trong: ${VALID_ISSUE_TYPES.join(", ")}`
        );
      }

      if (!description || typeof description !== "string" || description.trim().length < 5) {
        return fail(400, "BAD_REQUEST", "Mô tả lỗi phải có ít nhất 5 ký tự.");
      }

      if (description.length > 1000) {
        return fail(400, "BAD_REQUEST", "Mô tả không được vượt quá 1000 ký tự.");
      }

      const cleanDesc = description.trim();
      const cleanEmail = typeof email === "string" && email.includes("@") ? email.trim() : null;

      const log = await prisma.auditLog.create({
        data: {
          action: "USER_DATA_REPORT",
          entityType,
          entityId: entityId.trim(),
          performedBy: cleanEmail ? `user:${cleanEmail}` : "user:community",
          reason: `[${issueType.toUpperCase()}] ${cleanDesc.slice(0, 100)}`,
          status: "pending_review",
          newValue: {
            entityName: entityName || entityId,
            issueType,
            description: cleanDesc,
            contactEmail: cleanEmail,
            locale: locale || "vi",
            reportedAt: new Date().toISOString(),
          },
        },
      });

      return ok({
        reported: true,
        reportId: log.id,
        message: "Báo cáo của bạn đã được tiếp nhận vào hàng đợi kiểm duyệt. Cảm ơn bạn!",
      });
    },
    { prefix: "feedback-report", limit: 10, window: "60 s" }
  )
);
