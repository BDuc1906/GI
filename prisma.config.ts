import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  // Prisma Migrate cần quyền tạo/xoá bảng (DDL) và shadow database.
  // Vì vậy CLI dùng DIRECT_URL (direct connection, không qua pooler) — không phải DATABASE_URL (pooler, dùng cho app runtime).
  datasource: {
    url: env("DIRECT_URL"),
  },
});
