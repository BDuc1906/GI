import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTypescript,

  // Script seed làm việc với dữ liệu thô từ `genshin-db`, một package
  // không có type definitions chính thức — tắt riêng rule này cho scripts/**.
  {
    files: ["scripts/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },

  globalIgnores([".next/**", "node_modules/**", "next-env.d.ts"]),
]);

export default eslintConfig;
