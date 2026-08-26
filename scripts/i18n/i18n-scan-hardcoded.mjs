#!/usr/bin/env node
/**
 * scripts/i18n-scan-hardcoded.mjs
 *
 * Tự quét src/app/[locale] và src/components, báo cáo chính xác file:dòng
 * nào còn chuỗi tiếng Việt hardcode (không nằm trong t()/getTranslations)
 * — tức là những chỗ SẼ hiện sai ngôn ngữ y hệt các bug đã sửa trước đó.
 *
 * Đây KHÔNG phải dịch tự động — script này chỉ PHÁT HIỆN, không tự sửa,
 * vì việc quyết định key nào, đặt tên gì, JSX cấu trúc ra sao cần con
 * người (hoặc Claude) đọc hiểu ngữ cảnh, không nên tự động refactor mù.
 *
 * CÁCH DÙNG:
 *   node scripts/i18n-scan-hardcoded.mjs
 *
 * Nên chạy trước mỗi lần deploy, hoặc gắn vào CI (thoát mã lỗi khác 0 nếu
 * tìm thấy dòng nghi vấn, chặn merge cho tới khi xử lý).
 *
 * LƯU Ý: script dùng heuristic (tìm ký tự có dấu tiếng Việt), nên:
 *   - Bỏ qua dòng bắt đầu bằng // hoặc * (comment code, không hiển thị
 *     cho người dùng nên không cần dịch).
 *   - Vẫn có thể báo nhầm (false positive) với các chuỗi vốn dĩ nên giữ
 *     nguyên (vd tên ngôn ngữ bản địa trong LanguageSwitcher.tsx: "Tiếng
 *     Việt"). Xem danh sách IGNORE_FILES bên dưới để loại trừ thủ công.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const SCAN_DIRS = [
  path.join(ROOT, "src", "app", "[locale]"),
  path.join(ROOT, "src", "components"),
];

// Các file CỐ TÌNH giữ tiếng Việt/bản ngữ, không phải bug — loại khỏi báo cáo.
const IGNORE_FILES = new Set([
  path.join(ROOT, "src", "components", "LanguageSwitcher.tsx"), // tên ngôn ngữ giữ nguyên bản ngữ, không dịch
]);

const VIETNAMESE_CHARS = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".next") continue;
      files.push(...(await walk(full)));
    } else if (/\.(tsx|ts)$/.test(entry.name)) {
      files.push(full);
    }
  }
  return files;
}

function isCommentLine(line) {
  const trimmed = line.trim();
  return trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*");
}

async function scanFile(filePath) {
  const content = await fs.readFile(filePath, "utf-8");
  const lines = content.split("\n");
  const hits = [];
  lines.forEach((line, idx) => {
    if (isCommentLine(line)) return;
    if (VIETNAMESE_CHARS.test(line)) {
      hits.push({ line: idx + 1, text: line.trim() });
    }
  });
  return hits;
}

async function main() {
  let allFiles = [];
  for (const dir of SCAN_DIRS) {
    allFiles.push(...(await walk(dir)));
  }
  allFiles = allFiles.filter((f) => !IGNORE_FILES.has(f));

  let totalHits = 0;
  const report = [];

  for (const file of allFiles) {
    const hits = await scanFile(file);
    if (hits.length > 0) {
      report.push({ file: path.relative(ROOT, file), hits });
      totalHits += hits.length;
    }
  }

  if (report.length === 0) {
    console.log("✓ Không tìm thấy text tiếng Việt hardcode nào trong src/app/[locale] và src/components.");
    process.exit(0);
  }

  console.log(`⚠ Tìm thấy ${totalHits} dòng nghi vấn trong ${report.length} file:\n`);
  for (const { file, hits } of report) {
    console.log(`── ${file} (${hits.length} dòng) ──`);
    for (const hit of hits) {
      const preview = hit.text.length > 90 ? hit.text.slice(0, 90) + "…" : hit.text;
      console.log(`  ${hit.line}: ${preview}`);
    }
    console.log("");
  }

  console.log("Xem lại từng dòng trên — nếu là text hiển thị cho người dùng, cần bọc qua t()/getTranslations() và thêm key vào src/messages/*.json.");
  process.exit(1);
}

main().catch((err) => {
  console.error("✗ Lỗi:", err.message);
  process.exit(1);
});
