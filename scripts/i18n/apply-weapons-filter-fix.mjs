#!/usr/bin/env node
/**
 * scripts/i18n/apply-weapons-filter-fix.mjs
 *
 * Vá 2 lỗi: (1) src/app/[locale]/weapons/page.tsx đặt tên biến vòng lặp
 * trùng với hàm dịch `t` (che khuất mất `t`, khiến bộ lọc loại vũ khí
 * luôn hiện tên tiếng Anh thô "Sword/Claymore..." dù đã có sẵn namespace
 * WeaponType đầy đủ bản dịch); (2) nhãn "None" (nhân vật không nguyên
 * tố) ở characters/page.tsx chưa qua next-intl.
 *
 * AN TOÀN: chỉ sửa ĐÚNG đoạn văn bản cụ thể, không ghi đè cả file.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const WEAPONS_PAGE = path.join(__dirname, "..", "..", "src", "app", "[locale]", "weapons", "page.tsx");
const CHARACTERS_PAGE = path.join(__dirname, "..", "..", "src", "app", "[locale]", "characters", "page.tsx");

async function patchWeaponsPage() {
  let src = await fs.readFile(WEAPONS_PAGE, "utf-8");

  const oldLoop = `            {types.map((t) => {
              const active = type === t;
              return (
                <Link
                  key={t}
                  href={\`/weapons?\${buildQuery({ type: active ? undefined : t })}\`}
                  aria-pressed={active}
                  className="chip px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs"
                >
                  <WeaponIcon type={t} size={14} />
                  {t}
                </Link>
              );
            })}`;
  const newLoop = `            {types.map((weaponType) => {
              const active = type === weaponType;
              return (
                <Link
                  key={weaponType}
                  href={\`/weapons?\${buildQuery({ type: active ? undefined : weaponType })}\`}
                  aria-pressed={active}
                  className="chip px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs"
                >
                  <WeaponIcon type={weaponType} size={14} />
                  {tWeaponType(weaponType as "Sword" | "Claymore" | "Polearm" | "Bow" | "Catalyst")}
                </Link>
              );
            })}`;

  if (src.includes(newLoop)) {
    console.log("weapons/page.tsx: đã sửa từ trước, bỏ qua.");
    return;
  }
  if (!src.includes(oldLoop)) {
    console.log("⚠ weapons/page.tsx: không khớp đúng đoạn cần sửa — có thể file đã bị đổi khác, cần sửa tay. Bỏ qua.");
    return;
  }
  src = src.replace(oldLoop, newLoop);

  // Thêm khai báo tWeaponType ngay sau dòng const t = await getTranslations(namespace: "Weapons") THỨ 2
  // (dòng đầu tiên nằm trong generateMetadata, không cần sửa — chỉ cần
  // sửa ở component chính, nơi thực sự render bộ lọc).
  const marker = 'const t = await getTranslations({ locale, namespace: "Weapons" });';
  const occurrences = src.split(marker).length - 1;
  if (occurrences < 2) {
    console.log("⚠ weapons/page.tsx: không tìm đủ 2 lần khai báo t như kỳ vọng — cần kiểm tra tay.");
  } else {
    const firstIdx = src.indexOf(marker);
    const secondIdx = src.indexOf(marker, firstIdx + marker.length);
    const insertAt = secondIdx + marker.length;
    const insertion = '\n  const tWeaponType = await getTranslations({ locale, namespace: "WeaponType" });';
    src = src.slice(0, insertAt) + insertion + src.slice(insertAt);
  }

  await fs.writeFile(WEAPONS_PAGE, src, "utf-8");
  console.log("✓ weapons/page.tsx: đã sửa xong (biến t trùng tên + dịch nhãn loại vũ khí).");
}

async function patchCharactersPageNoneLabel() {
  let src = await fs.readFile(CHARACTERS_PAGE, "utf-8");
  if (src.includes("noElement")) {
    console.log("characters/page.tsx: nhãn None đã sửa từ trước, bỏ qua.");
    return;
  }
  const old = "                {getElementNameByKey(v, locale)}\n              </Link>\n            );\n          })}";
  const replacement = "                {v === \"None\" ? t(\"noElement\") : getElementNameByKey(v, locale)}\n              </Link>\n            );\n          })}";
  if (!src.includes(old)) {
    console.log('⚠ characters/page.tsx: không khớp đúng đoạn cần sửa — cần sửa tay. Tìm dòng `{getElementNameByKey(v, locale)}` và đổi thành `{v === "None" ? t("noElement") : getElementNameByKey(v, locale)}`.');
    return;
  }
  src = src.replace(old, replacement);
  await fs.writeFile(CHARACTERS_PAGE, src, "utf-8");
  console.log("✓ characters/page.tsx: đã sửa nhãn None.");
}

async function main() {
  await patchWeaponsPage();
  await patchCharactersPageNoneLabel();
  console.log("\nChạy `npx tsc --noEmit` để xác nhận trước khi build.");
}

main().catch((err) => {
  console.error("✗ Lỗi:", err.message);
  process.exit(1);
});
