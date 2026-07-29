import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  // Bắt buộc SSL khi kết nối Supabase. Strict ở production, cho phép self-signed ở dev
  // (Supabase dùng chứng chỉ hợp lệ nên rejectUnauthorized: true vẫn chạy tốt trong hầu hết trường hợp,
  // đổi thành false chỉ khi bạn gặp lỗi self-signed certificate cụ thể từ pooler).
  ssl: { rejectUnauthorized: process.env.NODE_ENV === "production" },
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
