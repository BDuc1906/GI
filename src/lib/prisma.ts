import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { assertEnv } from "./env";

assertEnv();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Bỏ "sslmode" khỏi connection string trước khi đưa cho `pg`. Lý do: ta đã
// khai báo SSL tường minh qua object `ssl` bên dưới — nếu URL còn giữ
// "sslmode=require/prefer/verify-ca", `pg-connection-string` sẽ tự suy ra
// một cấu hình ssl KHÁC từ chính chuỗi đó và log cảnh báo deprecation
// ("these modes will adopt standard libpq semantics..."), dù không ảnh
// hưởng tới kết nối thực tế. Giữ đúng 1 nguồn sự thật (object `ssl`) để
// tắt hẳn cảnh báo thay vì sống chung với nó.
function connectionStringWithoutSslMode(raw: string): string {
  const url = new URL(raw);
  url.searchParams.delete("sslmode");
  return url.toString();
}

const adapter = new PrismaPg({
  connectionString: connectionStringWithoutSslMode(process.env.DATABASE_URL as string),
  // Neon (như hầu hết managed Postgres) luôn dùng chứng chỉ SSL hợp lệ, kể cả
  // qua pooler — không có tình huống self-signed cần tắt verify ở dev như
  // một số nhà cung cấp khác, nên bật rejectUnauthorized ở mọi môi trường.
  ssl: { rejectUnauthorized: true },
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;