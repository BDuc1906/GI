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

// Postgres cục bộ dùng trong CI/test (service container trong
// .github/workflows/ci.yml) và khi chạy `db:migrate`/`db:seed` ở máy dev không
// hỗ trợ TLS — chỉ Neon (production) mới luôn có SSL hợp lệ. Phân biệt theo
// hostname thay vì hardcode 1 cấu hình cho mọi môi trường.
function isLocalDatabase(raw: string): boolean {
  const { hostname } = new URL(raw);
  return hostname === "localhost" || hostname === "127.0.0.1";
}

const rawDatabaseUrl = process.env.DATABASE_URL as string;

const adapter = new PrismaPg({
  connectionString: connectionStringWithoutSslMode(rawDatabaseUrl),
  // Neon (như hầu hết managed Postgres) luôn dùng chứng chỉ SSL hợp lệ, kể cả
  // qua pooler — không có tình huống self-signed cần tắt verify ở dev như
  // một số nhà cung cấp khác, nên bật rejectUnauthorized khi không phải DB
  // local. DB local (CI, docker, dev máy) không hỗ trợ TLS nên tắt hẳn SSL
  // trong trường hợp đó.
  ssl: isLocalDatabase(rawDatabaseUrl) ? false : { rejectUnauthorized: true },
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;