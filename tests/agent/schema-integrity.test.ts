
// tests/agent/schema-integrity.test.ts
/**
 * Test này tồn tại vì 1 sự cố thật đã xảy ra: migration
 * 20260811015049_add_agent_tables DROP bảng AgentSession + AuditLog
 * nhưng prisma/schema.prisma không được cập nhật theo, và KHÔNG có test
 * nào bắt được việc này. Lý do sâu hơn khiến nó lọt qua trót lọt:
 * tests/setup.ts mock CỨNG toàn bộ "@prisma/client" cho mọi test (để
 * test không cần tải engine binary qua network) — nghĩa là trước khi có
 * file này, KHÔNG một test nào trong dự án từng chạm vào Prisma Client
 * THẬT, nên không có cách nào phát hiện model bị thiếu.
 *
 * File này CỐ Ý dùng `vi.unmock` + dynamic import để lấy lại
 * "@prisma/client" thật (đã generate từ prisma/schema.prisma qua bước
 * "Prisma generate" chạy trước "Test" trong .github/workflows/ci.yml),
 * bỏ qua mock global — đây là cách duy nhất để test này có ý nghĩa.
 * KHÔNG cần DB thật: Prisma.dmmf là metadata tĩnh sinh ra lúc
 * `prisma generate`, không gọi network/DB.
 *
 * Khi thêm model mới mà agent phụ thuộc vào, thêm tên model vào
 * REQUIRED_AGENT_MODELS bên dưới.
 */
import { describe, expect, it, vi } from "vitest";

vi.unmock("@prisma/client");

const REQUIRED_AGENT_MODELS = ["AgentSession", "AuditLog"] as const;

describe("Prisma schema integrity (agent models) — dùng @prisma/client THẬT, không mock", () => {
  it.each(REQUIRED_AGENT_MODELS)(
    "model %s phải tồn tại trong Prisma DMMF (schema.prisma đã generate đúng)",
    async (modelName) => {
      const { Prisma } = await import("@prisma/client");
      const modelNames = Prisma.dmmf.datamodel.models.map((m) => m.name);
      expect(
        modelNames.includes(modelName),
        `Model "${modelName}" KHÔNG có trong Prisma Client đã generate. ` +
          `Kiểm tra prisma/schema.prisma có khai báo "model ${modelName}" ` +
          `và CI đã chạy "npx prisma generate" sau lần sửa schema gần nhất chưa. ` +
          `Nếu test này tự dưng đỏ sau khi bạn KHÔNG đổi gì liên quan agent, ` +
          `nhiều khả năng ai đó vừa sửa schema.prisma/migration mà quên đồng bộ code.`
      ).toBe(true);
    }
  );

  it("PrismaClient thật phải có delegate agentSession (dùng bởi src/agent/utils/db-memory.ts)", async () => {
    const { PrismaClient } = await import("@prisma/client");
    // Không cần connect DB — chỉ cần property tồn tại trên instance,
    // đủ để phát hiện model bị thiếu khỏi generated client.
    const client = new PrismaClient() as unknown as Record<string, unknown>;
    expect(typeof client.agentSession).toBe("object");
    await (client as unknown as { $disconnect: () => Promise<void> }).$disconnect();
  });

  it("PrismaClient thật phải có delegate auditLog (dùng bởi src/lib/agent/AuditLogger.ts)", async () => {
    const { PrismaClient } = await import("@prisma/client");
    const client = new PrismaClient() as unknown as Record<string, unknown>;
    expect(typeof client.auditLog).toBe("object");
    await (client as unknown as { $disconnect: () => Promise<void> }).$disconnect();
  });
});
