/**
 * scripts/assets/validate-assets-ci.ts
 *
 * Script kiểm định Asset toàn diện cho LEIBO phục vụ CI/CD và quy trình phát triển.
 * Tuân thủ quy trình 8 bước:
 * 1. Thu thập toàn bộ asset hiện có
 * 2. Phân loại theo loại dữ liệu
 * 3. Tạo mapping manifest bằng ID ổn định
 * 4. Kiểm tra file và metadata tự động
 * 5. Tạo bảng đối chiếu hình ảnh để xác nhận trực quan (public/asset-audit-report.html)
 * 6. Đánh dấu asset đã xác minh (VERIFIED / VALID / INVALID / MISSING)
 * 7. Chạy trong CI mỗi khi có commit/PR
 * 8. Chặn deploy nếu có mapping sai quy chuẩn
 *
 * Nguyên tắc bất di bất dịch:
 * "Không tự động chọn hình ảnh gần giống để thay thế khi không tìm thấy ảnh chính xác.
 *  Thà hiển thị placeholder còn hơn hiển thị nhân vật, vũ khí hay artwork phiên bản không liên quan."
 */

import "dotenv/config";
import fs from "fs";
import path from "path";
import { prisma } from "../../src/lib/db/prisma";
import { VERSION_KEY_ART_MAP, VERSION_THEMES } from "../../src/core/game/version-art";
import {
  buildAssetKey,
  buildManifest,
  createAssetEntry,
  getCanonicalAssetPath,
} from "../../src/core/assets/asset-manifest";
import { validateAssetEntry } from "../../src/core/assets/asset-validator";
import { writeAuditReports } from "../../src/core/assets/asset-audit-reporter";
import type { AssetAuditResult, AssetMappingEntry } from "../../src/core/assets/types";

async function main() {
  console.log("===============================================================");
  console.log("LEIBO - HE THONG KIEM DINH & QUAN LY ASSET (ASSET VALIDATION)");
  console.log("===============================================================\n");

  const entries: Record<string, AssetMappingEntry> = {};

  // ── BƯỚC 1 & 2: Thu thập và phân loại dữ liệu từ Database & Static Catalogs ──
  console.log("🔍 Đang thu thập dữ liệu thực thể từ Game Database...");

  let dbCharacters: Array<{ id: string; name: string }> = [];
  let dbWeapons: Array<{ id: string; name: string }> = [];
  let dbArtifacts: Array<{ id: string; name: string }> = [];

  try {
    [dbCharacters, dbWeapons, dbArtifacts] = await Promise.all([
      prisma.character.findMany({ select: { id: true, name: true } }),
      prisma.weapon.findMany({ select: { id: true, name: true } }),
      prisma.artifactSet.findMany({ select: { id: true, name: true } }),
    ]);
  } catch {
    console.warn("⚠️ Không kết nối được Database trực tiếp, sử dụng Static Manifest Catalog.");
    // Fallback static list cho CI trường hợp không có service container Postgres
    const charIconDir = path.resolve(process.cwd(), "public/local-genshin-assets/characters/icon");
    if (fs.existsSync(charIconDir)) {
      dbCharacters = fs
        .readdirSync(charIconDir)
        .filter((f) => f.endsWith(".png"))
        .map((f) => {
          const id = f.replace(".png", "");
          return { id, name: id.toUpperCase() };
        });
    }
  }

  console.log(`- Nhân vật: ${dbCharacters.length}`);
  console.log(`- Vũ khí:   ${dbWeapons.length}`);
  console.log(`- Thánh di vật: ${dbArtifacts.length}`);

  // ── BƯỚC 3: Tạo Mapping Manifest bằng ID ổn định ──
  console.log("\n📦 Đang khởi tạo Asset Mapping Manifest...");

  // 1. Ánh xạ Version Key Art (1.0 đến 7.2)
  for (const [version, targetPath] of Object.entries(VERSION_KEY_ART_MAP)) {
    const theme = VERSION_THEMES[version]?.vi || `Phiên bản ${version}`;
    const key = buildAssetKey("version", version, "keyArt");
    // Ưu tiên WebP nếu có
    const webpPath = targetPath.replace(".jpg", ".webp");
    const chosenPath = fs.existsSync(path.resolve(process.cwd(), "public" + webpPath))
      ? webpPath
      : targetPath;

    entries[key] = createAssetEntry(
      "version",
      version,
      "keyArt",
      `Key Visual Phiên Bản ${version}: ${theme}`,
      chosenPath
    );
  }

  // 2. Ánh xạ Nhân vật (Icon, Side, Splash)
  for (const c of dbCharacters) {
    // Icon
    const iconKey = buildAssetKey("character", c.id, "icon");
    entries[iconKey] = createAssetEntry(
      "character",
      c.id,
      "icon",
      `Avatar Icon: ${c.name}`,
      getCanonicalAssetPath("character", c.id, "icon")
    );

    // Splash Art
    const splashKey = buildAssetKey("character", c.id, "splash");
    entries[splashKey] = createAssetEntry(
      "character",
      c.id,
      "splash",
      `Gacha Splash Art: ${c.name}`,
      getCanonicalAssetPath("character", c.id, "splash")
    );
  }

  // 3. Ánh xạ Vũ khí (Icon)
  for (const w of dbWeapons) {
    const key = buildAssetKey("weapon", w.id, "icon");
    entries[key] = createAssetEntry(
      "weapon",
      w.id,
      "icon",
      `Vũ Khí: ${w.name}`,
      getCanonicalAssetPath("weapon", w.id, "icon")
    );
  }

  // 4. Ánh xạ Thánh di vật (Set Icon)
  for (const a of dbArtifacts) {
    const key = buildAssetKey("artifact", a.id, "set");
    entries[key] = createAssetEntry(
      "artifact",
      a.id,
      "set",
      `Bộ Thánh Di Vật: ${a.name}`,
      getCanonicalAssetPath("artifact", a.id, "set")
    );
  }

  console.log(`=> Đã tạo ánh xạ cho tổng cộng: ${Object.keys(entries).length} assets.`);

  // ── BƯỚC 4 & 6: Kiểm tra file, metadata và đánh dấu xác minh tự động ──
  console.log("\n⚡ Đang thực thi kiểm định kỹ thuật (File, Format, Resolution, Consistency)...");

  const auditResults: AssetAuditResult[] = [];
  const validatedEntries: Record<string, AssetMappingEntry> = {};
  let criticalErrorsCount = 0;

  for (const entry of Object.values(entries)) {
    const res = await validateAssetEntry(entry);
    auditResults.push(res);
    validatedEntries[entry.key] = res.entry;

    if (!res.isValid) {
      // Phân loại lỗi
      if (entry.status === "INVALID") {
        criticalErrorsCount++;
        console.error(`❌ [LỖI KIỂM ĐỊNH] ${entry.key}:`);
        res.errors.forEach((e) => console.error(`   - ${e}`));
      }
    }
  }

  const manifest = buildManifest(validatedEntries);

  // ── BƯỚC 5: Tạo Bảng đối chiếu hình ảnh trực quan (HTML + JSON) ──
  const outHtmlPath = path.resolve(process.cwd(), "public/asset-audit-report.html");
  const outJsonPath = path.resolve(
    process.cwd(),
    "public/local-genshin-assets/asset-validation-report.json"
  );
  const outManifestPath = path.resolve(
    process.cwd(),
    "public/local-genshin-assets/asset-mapping-manifest.json"
  );

  writeAuditReports(manifest, auditResults, outHtmlPath, outJsonPath);
  fs.writeFileSync(outManifestPath, JSON.stringify(manifest, null, 2), "utf8");

  console.log(`\n📄 Đã sinh bảng đối chiếu trực quan tại: public/asset-audit-report.html`);
  console.log(`📄 Đã lưu báo cáo JSON tại: public/local-genshin-assets/asset-validation-report.json`);
  console.log(`📄 Đã lưu Manifest tại: public/local-genshin-assets/asset-mapping-manifest.json`);

  // ── TỔNG HỢP KẾT QUẢ ──
  console.log("\n---------------- TỔNG HỢP KIỂM ĐỊNH ASSET ----------------");
  console.log(`- Tổng số Asset được ánh xạ: ${manifest.stats.total}`);
  console.log(`- Đạt chuẩn xác minh (VERIFIED): ${manifest.stats.verified}`);
  console.log(`- Vi phạm quy tắc (INVALID):   ${manifest.stats.invalid}`);
  console.log(`- Chưa có file (MISSING):        ${manifest.stats.missing}`);
  console.log("----------------------------------------------------------\n");

  // ── BƯỚC 8: Không cho phép mapping sai hoặc vi phạm ngữ nghĩa lên Production ──
  // Kiểm tra đặc biệt: Version Key Art không bao giờ được phép vi phạm quy tắc ảnh nhân vật
  const versionViolations = auditResults.filter(
    (r) => r.entry.category === "version" && r.entry.status === "INVALID"
  );

  if (versionViolations.length > 0) {
    console.error("🚨 PHÁT HIỆN VI PHẠM NGHIÊM TRỌNG TRÊN KEY VISUAL PHIÊN BẢN:");
    for (const v of versionViolations) {
      console.error(`- ${v.entry.id}: ${v.errors.join(", ")}`);
    }
    process.exit(1);
  }

  if (criticalErrorsCount > 0) {
    console.error(`🚨 Phát hiện ${criticalErrorsCount} lỗi kiểm định vi phạm quy chuẩn asset!`);
    console.error(`Xem chi tiết trong: public/asset-audit-report.html`);
    process.exit(1);
  }

  console.log("✅ Toàn bộ Asset được kiểm định thành công! Đạt chuẩn đưa lên Production.");
}

main().catch((err) => {
  console.error("Lỗi khi chạy Asset Validation CI:", err);
  process.exit(1);
});
