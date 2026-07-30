import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { assertEnv } from "./env";

assertEnv();

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  // Neon (như hầu hết managed Postgres) luôn dùng chứng chỉ SSL hợp lệ, kể cả
  // qua pooler — không có tình huống self-signed cần tắt verify ở dev như
  // một số nhà cung cấp khác, nên bật rejectUnauthorized ở mọi môi trường.
  ssl: { rejectUnauthorized: true },
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;