import { vi } from "vitest";

/**
 * `@prisma/client` thật đòi hỏi `prisma generate` chạy xong (tải engine
 * binary qua network). Test ở đây không cần DB thật — chỉ cần đúng SHAPE
 * của `Prisma.PrismaClientKnownRequestError` / `PrismaClientInitializationError`
 * để `withErrorHandling` (src/lib/api/errors.ts) map đúng status code.
 * Mock tối thiểu, không thay thế cho việc `prisma generate` thật khi build/deploy.
 */
class PrismaClientKnownRequestError extends Error {
  code: string;
  constructor(message: string, opts: { code: string }) {
    super(message);
    this.name = "PrismaClientKnownRequestError";
    this.code = opts.code;
  }
}

class PrismaClientInitializationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PrismaClientInitializationError";
  }
}

vi.mock("@prisma/client", () => ({
  Prisma: { PrismaClientKnownRequestError, PrismaClientInitializationError },
  PrismaClientKnownRequestError,
  PrismaClientInitializationError,
  // PrismaClient không được test nào import trực tiếp (route test mock
  // "@/lib/prisma" ở tầng cao hơn) — vẫn khai báo để tránh crash nếu có
  // module nào import lỡ tay.
  PrismaClient: class {},
}));

export { PrismaClientKnownRequestError, PrismaClientInitializationError };
