// Đồng bộ docs/api.md (nguồn thật, sửa ở đây) -> public/docs/api.md (bản
// Next.js thực sự serve tại /docs/api.md, vì "public/" là thư mục DUY NHẤT
// Next.js expose làm static asset — "docs/" ở gốc repo không được serve).
//
// Chạy tự động qua "predev"/"prebuild" trong package.json — không cần nhớ
// copy tay, không lệch nội dung giữa 2 file theo thời gian.
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "../..");
const src = join(rootDir, "docs", "api.md");
const destDir = join(rootDir, "public", "docs");
const dest = join(destDir, "api.md");

mkdirSync(destDir, { recursive: true });
copyFileSync(src, dest);

console.log(`[sync-docs] Đã đồng bộ docs/api.md -> public/docs/api.md`);
