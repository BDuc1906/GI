/**
 * scripts/fix-broken-r2-urls.ts
 *
 * Sửa 1 LẦN các bản ghi trong DB đang lưu URL ảnh trỏ vào endpoint API
 * RIÊNG TƯ của R2 ("<accountId>.r2.cloudflarestorage.com") — hậu quả của
 * việc R2_PUBLIC_URL từng bị cấu hình sai (xem comment chi tiết trong
 * scripts/lib/r2-client.ts). Endpoint đó luôn trả 403 cho trình duyệt nên
 * mọi ảnh mang URL dạng này đang "chết" trên toàn site dù object thật sự
 * đã tồn tại trong bucket.
 *
 * Vì object đã nằm sẵn trong bucket (không cần tải/upload lại), việc sửa
 * chỉ đơn giản là ĐỔI TIỀN TỐ URL — không cần chạy lại toàn bộ
 * `images:mirror` (vốn tốn nhiều thời gian và gọi lại các nguồn hotlink
 * ngoài). Script này tách "key" (đường dẫn object, vd
 * "characters/kazuha/icon.png") ra khỏi URL cũ, rồi dựng lại URL đúng bằng
 * chính hàm r2PublicUrl() dùng ở nơi khác trong codebase — đảm bảo domain
 * đích luôn khớp với R2_PUBLIC_URL đang cấu hình lúc chạy script.
 *
 * CHẠY THỬ TRƯỚC (mặc định, KHÔNG ghi DB):
 *   npm run images:fix-public-url
 *
 * CHẠY THẬT (ghi DB):
 *   npm run images:fix-public-url -- --apply
 *
 * Yêu cầu: R2_PUBLIC_URL trong .env đã được đổi sang Custom Domain public
 * ĐÚNG trước khi chạy (script sẽ tự chặn nếu vẫn đang trỏ vào endpoint
 * riêng tư — xem assertIsPublicUrl trong r2-client.ts).
 */

import { assertEnv } from "../src/lib/env";
assertEnv();

import { prisma } from "../src/lib/prisma";
import { r2BucketName, r2PublicUrl, extractKeyFromPrivateR2Url, isPrivateR2Endpoint } from "./lib/r2-client";

const APPLY = process.argv.includes("--apply");

type ColumnFix = {
  table: string;
  id: string;
  column: string;
  oldUrl: string;
  newUrl: string;
};

/**
 * Tính URL mới cho 1 giá trị cột ảnh. Trả về null nếu:
 * - Giá trị rỗng/null (không có gì để sửa)
 * - Giá trị KHÔNG phải URL private-endpoint (vd đã đúng domain public rồi,
 *   hoặc vẫn đang hotlink enka.network/mihoyo — 2 trường hợp này KHÔNG
 *   thuộc phạm vi sự cố này, bỏ qua để tránh sửa nhầm)
 */
function computeFix(value: string | null): string | null {
  if (!value) return null;
  if (!isPrivateR2Endpoint(value)) return null;
  const key = extractKeyFromPrivateR2Url(value, r2BucketName());
  if (!key) {
    console.warn(
      `⚠️ URL trông giống endpoint riêng tư nhưng không tách được key (tên bucket không khớp?): ${value}`
    );
    return null;
  }
  return r2PublicUrl(key);
}

async function fixTable<T extends { id: string }>(
  tableName: string,
  rows: T[],
  columns: Array<keyof T & string>
): Promise<ColumnFix[]> {
  const fixes: ColumnFix[] = [];
  for (const row of rows) {
    for (const column of columns) {
      const current = row[column] as unknown as string | null;
      const next = computeFix(current);
      if (next && next !== current) {
        fixes.push({ table: tableName, id: row.id, column, oldUrl: current as string, newUrl: next });
      }
    }
  }
  return fixes;
}

async function applyFixes(tableName: string, fixes: ColumnFix[]): Promise<void> {
  // Gộp các fix theo id để chỉ update 1 lần / bản ghi (1 Character có tới
  // 4 cột ảnh: iconUrl, sideIconUrl, splashUrl, elementIcon).
  const byId = new Map<string, Record<string, string>>();
  for (const fix of fixes) {
    if (!byId.has(fix.id)) byId.set(fix.id, {});
    byId.get(fix.id)![fix.column] = fix.newUrl;
  }

  for (const [id, data] of byId) {
    switch (tableName) {
      case "character":
        await prisma.character.update({ where: { id }, data });
        break;
      case "material":
        await prisma.material.update({ where: { id }, data });
        break;
      case "weapon":
        await prisma.weapon.update({ where: { id }, data });
        break;
      case "artifactSet":
        await prisma.artifactSet.update({ where: { id }, data });
        break;
      case "domain":
        await prisma.domain.update({ where: { id }, data });
        break;
    }
  }
}

async function main() {
  console.log(
    APPLY
      ? "🔧 Chạy THẬT — sẽ ghi đè URL sai trong DB.\n"
      : "🔍 Chạy THỬ (dry-run) — sẽ KHÔNG ghi DB. Thêm `-- --apply` để ghi thật.\n"
  );

  const allFixes: ColumnFix[] = [];

  const characters = await prisma.character.findMany({
    select: { id: true, iconUrl: true, sideIconUrl: true, splashUrl: true, elementIcon: true },
  });
  const characterFixes = await fixTable("character", characters, [
    "iconUrl",
    "sideIconUrl",
    "splashUrl",
    "elementIcon",
  ]);
  allFixes.push(...characterFixes);

  const materials = await prisma.material.findMany({ select: { id: true, iconUrl: true } });
  allFixes.push(...(await fixTable("material", materials, ["iconUrl"])));

  const weapons = await prisma.weapon.findMany({ select: { id: true, iconUrl: true } });
  allFixes.push(...(await fixTable("weapon", weapons, ["iconUrl"])));

  const artifactSets = await prisma.artifactSet.findMany({ select: { id: true, iconUrl: true } });
  allFixes.push(...(await fixTable("artifactSet", artifactSets, ["iconUrl"])));

  const domains = await prisma.domain.findMany({ select: { id: true, imageUrl: true } });
  allFixes.push(...(await fixTable("domain", domains, ["imageUrl"])));

  if (allFixes.length === 0) {
    console.log("✔ Không tìm thấy URL nào trỏ vào endpoint riêng tư của R2. Không có gì để sửa.");
    return;
  }

  console.log(`Tìm thấy ${allFixes.length} cột ảnh cần sửa:\n`);
  const byTable = new Map<string, number>();
  for (const fix of allFixes) {
    byTable.set(fix.table, (byTable.get(fix.table) ?? 0) + 1);
  }
  for (const [table, count] of byTable) {
    console.log(`  - ${table}: ${count} cột`);
  }
  console.log("\nVí dụ 3 dòng đầu:");
  for (const fix of allFixes.slice(0, 3)) {
    console.log(`  [${fix.table}/${fix.id}].${fix.column}`);
    console.log(`    cũ: ${fix.oldUrl}`);
    console.log(`    mới: ${fix.newUrl}`);
  }

  if (!APPLY) {
    console.log(
      `\n👉 Đây là dry-run. Chạy "npm run images:fix-public-url -- --apply" để ghi ${allFixes.length} thay đổi trên vào DB thật.`
    );
    return;
  }

  console.log("\n💾 Đang ghi vào DB...");
  for (const table of byTable.keys()) {
    const tableFixes = allFixes.filter((f) => f.table === table);
    await applyFixes(table, tableFixes);
  }
  console.log(`✅ Đã sửa xong. Chạy "npm run db:verify" hoặc "tsx scripts/check-r2-objects.ts" để xác nhận lại.`);
}

main()
  .catch((err) => {
    console.error("❌ Script thất bại:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
