import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    globals: false,
    setupFiles: ["./tests/setup.ts"],
    // Chỉ khớp "tests/**" trước đây khiến các test nằm cạnh source (vd
    // src/lib/api/rate-limit.test.ts) bị bỏ sót hoàn toàn khỏi `npm run
    // test` dù file vẫn tồn tại và pass khi chạy trực tiếp — mở rộng glob
    // để không còn test nào bị "mồ côi" theo kiểu này.
    include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "./src"),
    },
  },
});