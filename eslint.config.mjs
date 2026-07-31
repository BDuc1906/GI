import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // scripts/** đọc dữ liệu thô từ package `genshin-db`, vốn không có type
    // definitions chính thức (dữ liệu trả về gần như "any" thật sự). Ép kiểu
    // chặt ở đây chỉ tạo ra các type giả (fake) không phản ánh đúng thực tế,
    // nên nới lỏng riêng cho thư mục này thay vì tắt rule toàn cục.
    files: ["scripts/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
