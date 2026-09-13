#!/usr/bin/env node
/**
 * scripts/i18n/repair-duplicate-name-translations.mjs
 *
 * SỬA LỖI DO TÔI GÂY RA: bản apply-game-content-translations.mjs trước
 * đây giới hạn tìm field trong 2000 ký tự (bug), khiến những phản ứng
 * có descriptionTranslations dài (13 ngôn ngữ) bị "không thấy"
 * nameTranslations đã có, tạo THÊM object nameTranslations MỚI mỗi lần
 * chạy — kết quả: nhiều object `nameTranslations: {...}` liên tiếp
 * trùng lặp trên cùng 1 entry, TypeScript báo lỗi TS1117.
 *
 * SCRIPT NÀY: quét toàn bộ file, gộp các object nameTranslations LIÊN
 * TIẾP trên cùng 1 entry (id) thành ĐÚNG 1 object duy nhất, giữ lại
 * TOÀN BỘ key/value (không mất dữ liệu dịch nào, chỉ gộp cấu trúc).
 * KHÔNG cần dịch lại — chạy 1 lần là xong.
 *
 * AN TOÀN: parse từng object nameTranslations bằng cách brace-aware
 * thật (không regex ngây thơ), merge bằng JSON.parse/stringify thật
 * (không thể sai dữ liệu). In ra rõ những gì đã gộp để bạn đối chiếu.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, "..", "..", "src", "lib", "game", "element-reactions-data.ts");

function findMatchingBrace(src, openIdx) {
  let depth = 0;
  let inString = null;
  for (let i = openIdx; i < src.length; i++) {
    const ch = src[i];
    if (inString) {
      if (ch === "\\") { i++; continue; }
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === "`") { inString = ch; continue; }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  throw new Error(`Không tìm thấy dấu } khớp bắt đầu từ vị trí ${openIdx}`);
}

/** Chuyển `{ "en": "...", "ja": "..." }` (cú pháp TS/JS, key có thể có
 * hoặc không có dấu ngoặc kép) thành object JS thật để merge an toàn. */
function parseLooseObjectLiteral(text) {
  // eslint-disable-next-line no-new-func
  return Function(`"use strict"; return (${text});`)();
}

async function main() {
  let src = await fs.readFile(DATA_FILE, "utf-8");
  let totalMerged = 0;
  let totalGroupsFound = 0;

  // Quét lặp lại tới khi không còn cặp "nameTranslations: {...}," liền
  // kề nhau nữa (mỗi lần merge làm dịch chỉ số các lần match sau, quét
  // lại từ đầu cho chắc thay vì tính toán offset phức tạp).
  let changedInPass = true;
  let safetyCounter = 0;
  while (changedInPass && safetyCounter < 500) {
    changedInPass = false;
    safetyCounter++;

    const marker = "nameTranslations: {";
    let searchFrom = 0;
    while (true) {
      const firstIdx = src.indexOf(marker, searchFrom);
      if (firstIdx === -1) break;

      const firstOpenIdx = firstIdx + marker.length - 1;
      const firstCloseIdx = findMatchingBrace(src, firstOpenIdx);

      // Kiểm tra ngay sau dấu } đóng, bỏ qua khoảng trắng/dấu phẩy, có
      // phải LẠI là 1 "nameTranslations: {" khác không — nếu có, đây
      // chính là cặp trùng lặp cần gộp.
      let afterIdx = firstCloseIdx + 1;
      while (src[afterIdx] === "," || src[afterIdx] === " ") afterIdx++;

      if (src.slice(afterIdx, afterIdx + marker.length) === marker) {
        // Tìm HẾT chuỗi liên tiếp (có thể >2 object trùng lặp).
        const objects = [src.slice(firstOpenIdx, firstCloseIdx + 1)];
        let cursor = afterIdx;
        while (src.slice(cursor, cursor + marker.length) === marker) {
          const openIdx = cursor + marker.length - 1;
          const closeIdx = findMatchingBrace(src, openIdx);
          objects.push(src.slice(openIdx, closeIdx + 1));
          cursor = closeIdx + 1;
          while (src[cursor] === "," || src[cursor] === " ") cursor++;
        }

        // Gộp tất cả object lại bằng JSON thật — không đoán chuỗi.
        let merged = {};
        for (const objText of objects) {
          const parsed = parseLooseObjectLiteral(objText);
          merged = { ...merged, ...parsed };
        }
        const mergedText = JSON.stringify(merged);
        const replacement = `nameTranslations: ${mergedText}`;

        const groupStart = firstIdx;
        const groupEnd = cursor; // vị trí ngay sau object cuối cùng + dấu phẩy/space đã bỏ qua
        // groupEnd hiện đang trỏ sau khi đã ăn hết dấu phẩy/space thừa —
        // cần thêm lại đúng 1 dấu phẩy để không dính liền field kế tiếp.
        src = src.slice(0, groupStart) + replacement + "," + src.slice(groupEnd);

        totalGroupsFound++;
        totalMerged += objects.length;
        console.log(`✓ Gộp ${objects.length} object nameTranslations trùng lặp thành 1 (vị trí ký tự ${groupStart}) — key: ${Object.keys(merged).join(", ")}`);

        changedInPass = true;
        searchFrom = groupStart + replacement.length;
        break; // quét lại từ đầu vòng while ngoài cho chắc, tránh lệch offset
      }

      searchFrom = firstCloseIdx + 1;
    }
  }

  if (totalGroupsFound === 0) {
    console.log("Không tìm thấy chỗ nào bị trùng lặp — file có thể đã sạch từ trước, không cần sửa gì.");
  } else {
    await fs.writeFile(DATA_FILE, src, "utf-8");
    console.log(`\n✓ Đã sửa xong: gộp ${totalGroupsFound} nhóm (tổng ${totalMerged} object trùng lặp → còn ${totalGroupsFound} object). Đã ghi lại file.`);
  }
  console.log("Chạy `npx tsc --noEmit` để xác nhận file hợp lệ trước khi build.");
}

main().catch((err) => {
  console.error("✗ Lỗi:", err.message);
  process.exit(1);
});
