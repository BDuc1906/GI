#!/usr/bin/env node
// scripts/add-path-headers.mjs
/**
 * Tự động chèn dòng comment ghi đường dẫn tương đối vào ĐẦU các file có
 * tên trùng lặp nhiều nơi trong dự án Next.js App Router (route.ts,
 * page.tsx, layout.tsx, index.ts) — để mở file lên là biết ngay nó
 * thuộc route/thư mục nào, không cần nhìn tên tab.
 *
 * AN TOÀN: bỏ qua node_modules, .next, .git; bỏ qua file ĐÃ có comment
 * đường dẫn ở dòng đầu (chạy lại nhiều lần không bị chèn trùng); chỉ
 * thêm 1 dòng comment, không đổi bất kỳ dòng code nào khác.
 *
 * Cách chạy (từ thư mục gốc repo):
 *   node scripts/add-path-headers.mjs          # xem trước, KHÔNG ghi file
 *   node scripts/add-path-headers.mjs --write  # ghi thật vào file
 *
 * Muốn áp dụng cho tên file khác/rộng hơn, sửa TARGET_FILENAMES bên dưới.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, extname } from "node:path";

const ROOT = process.cwd();
const DRY_RUN = !process.argv.includes("--write");

const TARGET_FILENAMES = new Set(["route.ts", "page.tsx", "layout.tsx", "index.ts", "index.tsx"]);
const IGNORE_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build", ".vercel"]);

function commentPrefix(filePath) {
  return extname(filePath) === ".sql" ? "--" : "//";
}

function alreadyHasPathHeader(content, relPath) {
  const firstLine = content.split(/\r?\n/, 1)[0].trim();
  // Chấp nhận cả "// path" lẫn "// path\r" và các biến thể prefix comment
  return firstLine === `// ${relPath}` || firstLine === `-- ${relPath}`;
}

function walk(dir, results = []) {
  for (const entry of readdirSync(dir)) {
    if (IGNORE_DIRS.has(entry)) continue;
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, results);
    } else if (TARGET_FILENAMES.has(entry)) {
      results.push(fullPath);
    }
  }
  return results;
}

function main() {
  const files = walk(join(ROOT, "src"));
  let changed = 0;
  let skipped = 0;

  for (const filePath of files) {
    const relPath = relative(ROOT, filePath).split("\\").join("/"); // Windows-safe
    const content = readFileSync(filePath, "utf8");

    if (alreadyHasPathHeader(content, relPath)) {
      skipped++;
      continue;
    }

    const prefix = commentPrefix(filePath);
    const newContent = `${prefix} ${relPath}\n${content}`;

    console.log(`${DRY_RUN ? "[xem trước]" : "[đã sửa]  "} ${relPath}`);

    if (!DRY_RUN) {
      writeFileSync(filePath, newContent, "utf8");
    }
    changed++;
  }

  console.log(`\n${changed} file ${DRY_RUN ? "sẽ được sửa" : "đã được sửa"}, ${skipped} file đã có sẵn header (bỏ qua).`);
  if (DRY_RUN) {
    console.log(`\nChạy lại với "node scripts/add-path-headers.mjs --write" để ghi thật vào file.`);
  }
}

main();
