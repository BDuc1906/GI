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
 * SỬA (Prisma 7): `new PrismaClient()` KHÔNG truyền option nào (như bản
 * gốc của file này) giờ THROW NGAY LÚC KHỞI TẠO — "A driver adapter is
 * required to connect to your database" — vì Prisma 7 bắt buộc mọi
 * client phải có driver adapter (`@prisma/adapter-pg` ở đây, khớp đúng
 * src/lib/db/prisma.ts). Test vẫn giữ đúng tinh thần ban đầu ("Không cần
 * connect DB — chỉ cần property tồn tại trên instance"): tạo `pg.Pool`
 * bằng 1 connection string BẤT KỲ hợp lệ về mặt cú pháp — cả `Pool` lẫn
 * `PrismaClient({ adapter })` đều chỉ kết nối THẬT khi có query đầu tiên
 * chạy (lazy), mà 2 test bên dưới không hề gọi query nào, chỉ đọc
 * `typeof client.agentSession`/`typeof client.auditLog` — nên không cần
 * Postgres thật đang chạy, dù CI thực tế có sẵn qua service container.
 */
import { describe, expect, it, vi } from "vitest";

vi.unmock("@prisma/client");

const REQUIRED_AGENT_MODELS = ["AgentSession", "AuditLog"] as const;

// Không cần khớp DB thật nào — chỉ cần đúng cú pháp Postgres connection
// string để `pg.Pool`/`PrismaPg` khởi tạo được object (lazy, không tự
// connect ngay). Ưu tiên DATABASE_URL thật nếu CI đã set (không hại gì),
// rơi về 1 chuỗi giả hợp lệ cú pháp nếu chưa set (vd chạy test này riêng
// lẻ ở máy dev chưa cấu hình .env).
const FAKE_CONNECTION_STRING =
  process.env.DATABASE_URL || "postgresql://user:pass@localhost:5432/schema_integrity_test";

async function createInspectableClient() {
  const { PrismaClient } = await import("@prisma/client");
  const { PrismaPg } = await import("@prisma/adapter-pg");
  const { Pool } = await import("pg");

  const pool = new Pool({ connectionString: FAKE_CONNECTION_STRING });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter }) as unknown as Record<string, unknown> & {
    $disconnect: () => Promise<void>;
  };
}

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
    const client = await createInspectableClient();
    expect(typeof client.agentSession).toBe("object");
    await client.$disconnect();
  });

  it("PrismaClient thật phải có delegate auditLog (dùng bởi src/lib/agent/AuditLogger.ts)", async () => {
    const client = await createInspectableClient();
    expect(typeof client.auditLog).toBe("object");
    await client.$disconnect();
  });
});
