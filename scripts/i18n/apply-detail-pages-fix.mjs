#!/usr/bin/env node
/**
 * scripts/i18n/apply-detail-pages-fix.mjs
 *
 * Vá các chỗ hiện tên nguyên tố (vision)/loại vũ khí (weaponType)/vùng
 * (region)/chữ "Traveler" còn thô (tiếng Anh cứng) ở các trang CHI TIẾT
 * (characters/[id], weapons/[id]) và các trang liệt kê chưa đụng tới
 * (search, trang chủ) — phần này KHÁC với characters/page.tsx và
 * weapons/page.tsx đã sửa ở đợt trước.
 *
 * AN TOÀN: chỉ splice đúng từng đoạn nhỏ, báo rõ ràng nếu không khớp
 * (không đoán bừa, không ghi đè cả file). Idempotent.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..", "..");
const p = (...parts) => path.join(ROOT, ...parts);

let totalOk = 0;
let totalWarn = 0;

async function patchFile(relPath, edits) {
  const filePath = p(...relPath.split("/"));
  let src;
  try {
    src = await fs.readFile(filePath, "utf-8");
  } catch {
    console.log(`⚠ ${relPath}: không tìm thấy file — bỏ qua.`);
    totalWarn++;
    return;
  }

  for (const { label, old, new: replacement, alreadyDoneMarker } of edits) {
    if (alreadyDoneMarker && src.includes(alreadyDoneMarker)) {
      console.log(`→ ${relPath} [${label}]: đã sửa từ trước, bỏ qua.`);
      continue;
    }
    if (!src.includes(old)) {
      console.log(`⚠ ${relPath} [${label}]: KHÔNG khớp đoạn cần sửa — cần bạn kiểm tra tay (file có thể đã khác so với dự kiến).`);
      totalWarn++;
      continue;
    }
    src = src.replace(old, replacement);
    console.log(`✓ ${relPath} [${label}]: đã sửa.`);
    totalOk++;
  }

  await fs.writeFile(filePath, src, "utf-8");
}

async function main() {
  // ---------- characters/[id]/page.tsx ----------
  await patchFile("src/app/[locale]/characters/[id]/page.tsx", [
    {
      label: "import getElementNameByKey + tRegion",
      old: 'import { getLocalizedName } from "@/lib/i18n/entity-name";',
      new: 'import { getLocalizedName } from "@/lib/i18n/entity-name";\nimport { getElementNameByKey } from "@/lib/game/element-reactions-data";',
      alreadyDoneMarker: "getElementNameByKey",
    },
    {
      label: "metadata description (vision/weaponType thô)",
      old: 'description: c.description ?? `${c.vision} · ${c.weaponType} · ${c.rarity}★`,',
      new: 'description: c.description ?? `${getElementNameByKey(c.vision, locale)} · ${await tWeaponTypeMeta(c.weaponType, locale)} · ${c.rarity}★`,',
      alreadyDoneMarker: "getElementNameByKey(c.vision",
    },
    {
      label: "breadcrumb Traveler + vision thô",
      old: '{ name: isTraveler ? `Traveler (${c.vision})` : getLocalizedName(c, locale), path: `/characters/${c.id}` }',
      new: '{ name: isTraveler ? `${t("traveler")} (${getElementNameByKey(c.vision, locale)})` : getLocalizedName(c, locale), path: `/characters/${c.id}` }',
    },
    {
      label: "h1 Traveler + vision thô",
      old: '{isTraveler ? `Traveler (${c.vision})` : getLocalizedName(c, locale)}',
      new: '{isTraveler ? `${t("traveler")} (${getElementNameByKey(c.vision, locale)})` : getLocalizedName(c, locale)}',
    },
    {
      label: "dòng vision · weaponType hiển thị",
      old: '{c.vision} · {c.weaponType}',
      new: '{getElementNameByKey(c.vision, locale)} · {tWeaponType(c.weaponType as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst")}',
    },
    {
      label: "region thô",
      old: '{c.region && <>{t("region")}: <span className="text-text-primary">{c.region}</span></>}',
      new: '{c.region && <>{t("region")}: <span className="text-text-primary">{tRegion(c.region as "Mondstadt" | "Liyue" | "Inazuma" | "Sumeru" | "Fontaine" | "Natlan" | "Snezhnaya" | "Nod-Krai")}</span></>}',
    },
  ]);

  // Thêm khai báo tWeaponType/tRegion trong component chính (không phải
  // generateMetadata) — tìm dòng setRequestLocale(locale) làm mốc, đây
  // là dòng CHỈ xuất hiện trong component chính, không có trong
  // generateMetadata.
  {
    const filePath = p("src", "app", "[locale]", "characters", "[id]", "page.tsx");
    let src = await fs.readFile(filePath, "utf-8");
    if (src.includes('namespace: "WeaponType" })') && src.includes('namespace: "Region" })')) {
      console.log('→ characters/[id]/page.tsx [khai báo tWeaponType/tRegion]: đã có từ trước, bỏ qua.');
    } else {
      const marker = "setRequestLocale(locale);";
      const idx = src.indexOf(marker);
      if (idx === -1) {
        console.log("⚠ characters/[id]/page.tsx: không tìm thấy setRequestLocale(locale) — cần thêm tay khai báo tWeaponType/tRegion.");
        totalWarn++;
      } else {
        const insertAt = idx + marker.length;
        const insertion =
          '\n  const tWeaponType = await getTranslations({ locale, namespace: "WeaponType" });' +
          '\n  const tRegion = await getTranslations({ locale, namespace: "Region" });';
        src = src.slice(0, insertAt) + insertion + src.slice(insertAt);
        await fs.writeFile(filePath, src, "utf-8");
        console.log("✓ characters/[id]/page.tsx: đã thêm khai báo tWeaponType/tRegion.");
        totalOk++;
      }
    }
  }

  // generateMetadata cần 1 bản dịch WeaponType RIÊNG (metadata là async
  // function độc lập, không share biến với component chính) — thêm hàm
  // helper nhỏ ngay trên generateMetadata.
  {
    const filePath = p("src", "app", "[locale]", "characters", "[id]", "page.tsx");
    let src = await fs.readFile(filePath, "utf-8");
    if (src.includes("async function tWeaponTypeMeta")) {
      console.log("→ characters/[id]/page.tsx [helper tWeaponTypeMeta]: đã có từ trước, bỏ qua.");
    } else {
      const marker = "export async function generateMetadata(";
      const idx = src.indexOf(marker);
      if (idx === -1) {
        console.log("⚠ characters/[id]/page.tsx: không tìm thấy generateMetadata — cần thêm tay hàm tWeaponTypeMeta.");
        totalWarn++;
      } else {
        const helper =
          'async function tWeaponTypeMeta(type: string, locale: string): Promise<string> {\n' +
          '  const t = await getTranslations({ locale, namespace: "WeaponType" });\n' +
          '  return t(type as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst");\n' +
          '}\n\n';
        src = src.slice(0, idx) + helper + src.slice(idx);
        await fs.writeFile(filePath, src, "utf-8");
        console.log("✓ characters/[id]/page.tsx: đã thêm helper tWeaponTypeMeta cho generateMetadata.");
        totalOk++;
      }
    }
  }

  // ---------- weapons/[id]/page.tsx ----------
  await patchFile("src/app/[locale]/weapons/[id]/page.tsx", [
    {
      label: "metadata description (type thô)",
      old: 'description: w.description ?? t("metaDescriptionFallback", { type: w.type, rarity: w.rarity }),',
      new: 'description: w.description ?? t("metaDescriptionFallback", { type: await tWeaponTypeMeta(w.type, locale), rarity: w.rarity }),',
      alreadyDoneMarker: "tWeaponTypeMeta(w.type",
    },
    {
      label: "dòng type hiển thị",
      old: '<span className="text-eyebrow mb-2">{w.type}</span>',
      new: '<span className="text-eyebrow mb-2">{tWeaponType(w.type as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst")}</span>',
    },
  ]);
  {
    const filePath = p("src", "app", "[locale]", "weapons", "[id]", "page.tsx");
    let src = await fs.readFile(filePath, "utf-8");
    if (!src.includes("async function tWeaponTypeMeta")) {
      const marker = "export async function generateMetadata(";
      const idx = src.indexOf(marker);
      if (idx !== -1) {
        const helper =
          'async function tWeaponTypeMeta(type: string, locale: string): Promise<string> {\n' +
          '  const t = await getTranslations({ locale, namespace: "WeaponType" });\n' +
          '  return t(type as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst");\n' +
          '}\n\n';
        src = src.slice(0, idx) + helper + src.slice(idx);
        console.log("✓ weapons/[id]/page.tsx: đã thêm helper tWeaponTypeMeta.");
        totalOk++;
      }
    }
    if (!src.includes('namespace: "WeaponType" })\n')) {
      const marker = "setRequestLocale(locale);";
      const idx = src.indexOf(marker);
      if (idx !== -1) {
        const insertAt = idx + marker.length;
        const insertion = '\n  const tWeaponType = await getTranslations({ locale, namespace: "WeaponType" });';
        src = src.slice(0, insertAt) + insertion + src.slice(insertAt);
        console.log("✓ weapons/[id]/page.tsx: đã thêm khai báo tWeaponType.");
        totalOk++;
      }
    }
    await fs.writeFile(filePath, src, "utf-8");
  }

  // ---------- search/page.tsx ----------
  await patchFile("src/app/[locale]/search/page.tsx", [
    {
      label: "import getElementNameByKey (không cần, search dùng weaponType/category)",
      old: 'const t = await getTranslations({ locale, namespace: "Search" });\n\n',
      new: 'const t = await getTranslations({ locale, namespace: "Search" });\n  const tWeaponType = await getTranslations({ locale, namespace: "WeaponType" });\n\n',
      alreadyDoneMarker: 'namespace: "WeaponType"',
    },
    {
      label: "subtitle nhân vật weaponType thô",
      old: "subtitle={c.weaponType}",
      new: 'subtitle={tWeaponType(c.weaponType as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst")}',
    },
    {
      label: "subtitle vũ khí type thô",
      old: "subtitle={w.type}",
      new: 'subtitle={tWeaponType(w.type as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst")}',
    },
  ]);

  // ---------- page.tsx (trang chủ) ----------
  await patchFile("src/app/[locale]/page.tsx", [
    {
      label: "khai báo tWeaponType",
      old: 'const t = await getTranslations({ locale, namespace: "Home" });\n\n',
      new: 'const t = await getTranslations({ locale, namespace: "Home" });\n  const tWeaponType = await getTranslations({ locale, namespace: "WeaponType" });\n\n',
      alreadyDoneMarker: 'namespace: "WeaponType"',
    },
    {
      label: "subtitle nhân vật weaponType thô",
      old: "subtitle={c.weaponType}",
      new: 'subtitle={tWeaponType(c.weaponType as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst")}',
    },
    {
      label: "subtitle vũ khí type thô",
      old: "subtitle={w.type}",
      new: 'subtitle={tWeaponType(w.type as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst")}',
    },
  ]);

  console.log(`\n✓ Hoàn tất: ${totalOk} chỗ sửa thành công, ${totalWarn} chỗ cần kiểm tra tay.`);
  console.log("Chạy `npx tsc --noEmit` để xác nhận trước khi build.");
}

main().catch((err) => {
  console.error("✗ Lỗi:", err.message);
  process.exit(1);
});
