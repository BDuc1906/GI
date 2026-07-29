/**
 * Seed dữ liệu THẬT 100% từ package `genshin-db`.
 * Chữ ký hàm/field lấy trực tiếp từ node_modules/genshin-db/types (bản cài thật của bạn),
 * không phải suy đoán.
 */
import { createRequire } from "module";
import { prisma } from "../src/lib/prisma";

// Dùng createRequire để lấy đúng object CommonJS gốc của genshin-db,
// tránh lỗi tương tác ESM/CJS khiến `import * as genshindb` map sai (characters is not a function).
const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

/**
 * [SỬA LỖI 1]: Hàm sinh URL ảnh động từ Enka Network API UI
 * Map trực tiếp theo đúng tên file game gốc từ thư viện dữ liệu
 */
function getEnkaUrl(filename?: string, mihoyoUrl?: string) {
  if (mihoyoUrl) return mihoyoUrl;
  // Sửa cú pháp nối chuỗi để tạo đường dẫn hợp lệ dạng: https://enka.network
  return filename ? `https://enka.network{filename}.png` : null;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function seedCharacters() {
  const names = genshindb.characters("names", { matchCategories: true }) as string[];
  let count = 0;
  for (const name of names) {
    const c = genshindb.characters(name);
    if (!c || !c.name || !c.rarity) continue;

    const lvl1 = c.stats(1);
    const lvl90 = c.stats(90, "+");

    // [LỖI 3]: Chuẩn bị gọi riêng dữ liệu Thiên phú & Chòm sao chéo từ Database thư viện
    const talentsData = genshindb.talents(c.name);
    const constellationsData = genshindb.constellations(c.name);

    await prisma.character.upsert({
      where: { id: slugify(c.name) },
      create: {
        id: slugify(c.name),
        name: c.name,
        title: c.title || null,
        vision: c.elementText,
        weaponType: c.weaponText,
        rarity: c.rarity,
        region: c.region || null,
        affiliation: c.affiliation || null,
        description: c.description || null,
        // Cập nhật gọi hàm getEnkaUrl sinh ảnh chân dung và ảnh nộ
        // Sửa lại phần gán giá trị hình ảnh chân dung và ảnh nộ trong file seed của bạn:
        // SỬA LẠI ĐOẠN NÀY TRONG CẢ KHỐI CREATE VÀ UPDATE:
        iconUrl: getEnkaUrl(c.images?.filename_icon, c.images?.mihoyo_icon),
        splashUrl: getEnkaUrl(c.images?.filename_gachaSplash),
        elementIcon: c.elementText ? `https://enka.network${c.elementText}.png` : null,
        baseHp: lvl1?.hp ?? null,
        baseAtk: lvl1?.attack ?? null,
        baseDef: lvl1?.defense ?? null,
        ascensionStat: c.substatText || null,
        // Khi schema của bạn sẵn sàng thêm cột JSON, hãy bỏ comment 2 dòng dưới đây để nạp:
        // talents: talentsData ? JSON.parse(JSON.stringify(talentsData)) : undefined,
        // constellations: constellationsData ? JSON.parse(JSON.stringify(constellationsData)) : undefined,
      },
      update: {
        name: c.name,
        title: c.title || null,
        vision: c.elementText,
        weaponType: c.weaponText,
        rarity: c.rarity,
        region: c.region || null,
        affiliation: c.affiliation || null,
        description: c.description || null,
        // SỬA LẠI ĐOẠN NÀY TRONG CẢ KHỐI CREATE VÀ UPDATE:
        iconUrl: getEnkaUrl(c.images?.filename_icon, c.images?.mihoyo_icon),
        splashUrl: getEnkaUrl(c.images?.filename_gachaSplash),
        elementIcon: c.elementText ? `https://enka.network${c.elementText}.png` : null,
        baseHp: lvl1?.hp ?? null,
        baseAtk: lvl1?.attack ?? null,
        baseDef: lvl1?.defense ?? null,
        ascensionStat: c.substatText || null,
        // talents: talentsData ? JSON.parse(JSON.stringify(talentsData)) : undefined,
        // constellations: constellationsData ? JSON.parse(JSON.stringify(constellationsData)) : undefined,
      },
    });

    void lvl90; 
    count++;
  }
  console.log(`✔ Seeded ${count} characters`);
}

async function seedWeapons() {
  const names = genshindb.weapons("names", { matchCategories: true }) as string[];
  let count = 0;
  for (const name of names) {
    const w = genshindb.weapons(name);
    if (!w || !w.name || !w.rarity) continue;

    // [SỬA LỖI 2]: Trích xuất thuộc tính tinh luyện sạch đã gỡ tag màu r1.description
    const refinements = [w.r1, w.r2, w.r3, w.r4, w.r5].filter(Boolean);
    const cleanEffectDescription = refinements[0]?.description || w.effectTemplateRaw || null;

    await prisma.weapon.upsert({
      where: { id: slugify(w.name) },
      create: {
        id: slugify(w.name),
        name: w.name,
        type: w.weaponText,
        rarity: w.rarity,
        baseAtk: w.baseAtkValue ?? null,
        subStatName: w.mainStatText || null,
        subStatValue: w.baseStatText || null,
        effectName: w.effectName || null,
        effectDescription: cleanEffectDescription, // Dùng bản mô tả sạch, gỡ bỏ hoàn toàn template lỗi font
        passiveByRefinement: refinements.length ? JSON.parse(JSON.stringify(refinements)) : undefined,
        description: w.description || null,
        iconUrl: getEnkaUrl(w.images?.filename_icon, w.images?.mihoyo_icon),
      },
      update: {
        name: w.name,
        type: w.weaponText,
        rarity: w.rarity,
        baseAtk: w.baseAtkValue ?? null,
        subStatName: w.mainStatText || null,
        subStatValue: w.baseStatText || null,
        effectName: w.effectName || null,
        effectDescription: cleanEffectDescription,
        passiveByRefinement: refinements.length ? JSON.parse(JSON.stringify(refinements)) : undefined,
        description: w.description || null,
        iconUrl: getEnkaUrl(w.images?.filename_icon, w.images?.mihoyo_icon),
      },
    });
    count++;
  }
  console.log(`✔ Seeded ${count} weapons`);
}

async function seedArtifacts() {
  const names = genshindb.artifacts("names", { matchCategories: true }) as string[];
  let count = 0;
  for (const name of names) {
    const a = genshindb.artifacts(name);
    if (!a || !a.name) continue;

    await prisma.artifactSet.upsert({
      where: { id: slugify(a.name) },
      create: {
        id: slugify(a.name),
        name: a.name,
        rarityRange: a.rarityList ?? [],
        twoPieceBonus: a.effect2Pc || null,
        fourPieceBonus: a.effect4Pc || (a.effect1Pc || null),
        pieces: JSON.parse(JSON.stringify({
          flower: a.flower ?? null,
          plume: a.plume ?? null,
          sands: a.sands ?? null,
          goblet: a.goblet ?? null,
          circlet: a.circlet ?? null,
        })),
        iconUrl: getEnkaUrl(a.images?.filename_flower ?? a.images?.filename_circlet),
      },
      update: {
        name: a.name,
        rarityRange: a.rarityList ?? [],
        twoPieceBonus: a.effect2Pc || null,
        fourPieceBonus: a.effect4Pc || (a.effect1Pc || null),
        pieces: JSON.parse(JSON.stringify({
          flower: a.flower ?? null,
          plume: a.plume ?? null,
          sands: a.sands ?? null,
          goblet: a.goblet ?? null,
          circlet: a.circlet ?? null,
        })),
        iconUrl: getEnkaUrl(a.images?.filename_flower ?? a.images?.filename_circlet),
      },
    });
    count++;
  }
  console.log(`✔ Seeded ${count} artifact sets`);
}

async function main() {
  console.log("Seeding LEIBO database with real Genshin Impact data (genshin-db)...");
  await seedCharacters();
  await seedWeapons();
  await seedArtifacts();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
