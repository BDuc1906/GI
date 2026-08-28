import { dirname } from "path";
import { fileURLToPath } from "url";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
void __dirname; // giữ lại vì có thể cần cho cấu hình khác sau này

// Lọc chỉ giữ rule "@next/next/*" từ configs tổng hợp của
// @next/eslint-plugin-next — configs đó liệt kê SẴN cả rule tên
// "react/*"/"jsx-a11y/*"/"import/*" (khuyến nghị chung của Next.js), nhưng
// các plugin đó ta đăng ký và cấu hình riêng ở dưới, khớp đúng
// node_modules/eslint-config-next/index.js — không lấy trùng qua đây.
const nextNextRules = Object.fromEntries(
  Object.entries({
    ...nextPlugin.configs.recommended.rules,
    ...nextPlugin.configs["core-web-vitals"].rules,
  }).filter(([ruleName]) => ruleName.startsWith("@next/next/"))
);

const eslintConfig = [
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts"],
  },

  // TRƯỚC ĐÂY dùng `...compat.extends("next/typescript")` (FlatCompat) —
  // ĐÃ BỎ vì đây chính là nguyên nhân "Converting circular structure to
  // JSON" (github.com/eslint/eslint/issues/20237, bug đang mở của chính
  // ESLint, không phải lỗi ở project này): `next/typescript` nạp
  // `typescript-eslint` (bản NESTED bên trong eslint-config-next) qua
  // lớp tương thích cấu hình kiểu cũ (`.eslintrc`) — cấu hình
  // `configs['flat/all']` của typescript-eslint tự tham chiếu vòng lặp
  // đến chính plugin, và FlatCompat cố JSON.stringify để validate/hiển
  // thị lỗi thì crash. Giờ import `typescript-eslint` TRỰC TIẾP (bản ở
  // top-level, khai trong package.json) và dùng thẳng
  // `tseslint.configs.recommended` — vốn ĐÃ LÀ flat config chuẩn, không
  // cần qua lớp compat nào cả, nên không thể dính bug này nữa.
  ...tseslint.configs.recommended,

  {
    rules: {
      // Quy ước trong toàn bộ src/agent/tools/*.tool.ts: tham số bắt
      // buộc phải khai (khớp chữ ký BaseTool.run()) nhưng chưa dùng tới
      // đặt tên bắt đầu bằng "_" (vd "_context") — cấu hình rule để
      // công nhận quy ước này thay vì phải sửa từng file.
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },

  {
    plugins: {
      "@next/next": nextPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
      import: importPlugin,
    },
    settings: {
      react: {
        // TRƯỚC ĐÂY: version: "detect" — bỏ, vì đường code tự dò
        // version của eslint-plugin-react gọi context.getFilename(),
        // một API đã bị ESLint 10 xoá khỏi flat config context, khiến
        // rule "react/display-name" crash ("getFilename is not a
        // function"). Khai thẳng version (khớp "react": "^19.0.0" ở
        // package.json) để bỏ qua hẳn bước tự dò này.
        version: "19.0.0",
      },
    },
    rules: {
      // Tương đương extends: ['plugin:react/recommended',
      // 'plugin:react-hooks/recommended', 'plugin:@next/next/recommended']
      // + 'plugin:@next/next/core-web-vitals' trong index.js gốc.
      ...reactPlugin.configs.recommended.rules,
      ...reactHooksPlugin.configs.recommended.rules,
      ...nextNextRules,

      // Rule override — copy y hệt node_modules/eslint-config-next/index.js
      "import/no-anonymous-default-export": "warn",
      "react/no-unknown-property": "off",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      "react/jsx-no-target-blank": "off",
      "jsx-a11y/alt-text": [
        "warn",
        {
          elements: ["img"],
          img: ["Image"],
        },
      ],
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",
    },
  },

  // Script seed làm việc với dữ liệu thô từ `genshin-db`, một package
  // không có type definitions chính thức — tắt riêng rule này cho scripts/**.
  {
    files: ["scripts/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
