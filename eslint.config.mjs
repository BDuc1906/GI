import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import importPlugin from "eslint-plugin-import";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

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

  // CHỈ extend "next/typescript" qua FlatCompat — an toàn, không đụng vào
  // react/react-hooks/jsx-a11y. Phần còn lại của "next/core-web-vitals"
  // (xem node_modules/eslint-config-next/index.js) được khai tay bên dưới
  // để né bug "Converting circular structure to JSON" của FlatCompat khi
  // xử lý "plugin:react/recommended" / "plugin:react-hooks/recommended"
  // (github.com/eslint/eslint/issues/20237 — bug đang mở, chưa có bản vá).
  ...compat.extends("next/typescript"),

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
        version: "detect",
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
