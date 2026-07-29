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

// genshin-db chỉ lưu TÊN FILE ảnh, không lưu URL đầy đủ.
// CDN chính thức của repo genshin-db trên jsDelivr (ảnh được host kèm theo package).
const IMG_BASE = "https://cdn.jsdelivr.net/npm/genshin-db@5/images";

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function img(folder: string, filename?: string) {
  return filename ? `${IMG_BASE}/${folder}/${filename}.png` : null;
}

async function seedCharacters() {
  const names = genshindb.characters("names", { matchCategories: true }) as string[];
  let count = 0;
  for (const name of names) {
    const c = genshindb.characters(name);
    if (!c || !c.name || !c.rarity) continue;

    const lvl1 = c.stats(1);
    const lvl90 = c.stats(90, "+");

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
        iconUrl: img("characters", c.images?.filename_icon),
        splashUrl: img("characters", c.images?.filename_gachaSplash),
        baseHp: lvl1?.hp ?? null,
        baseAtk: lvl1?.attack ?? null,
        baseDef: lvl1?.defense ?? null,
        ascensionStat: c.substatText || null,
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
        iconUrl: img("characters", c.images?.filename_icon),
        splashUrl: img("characters", c.images?.filename_gachaSplash),
        baseHp: lvl1?.hp ?? null,
        baseAtk: lvl1?.attack ?? null,
        baseDef: lvl1?.defense ?? null,
        ascensionStat: c.substatText || null,
      },
    });

    // Chòm sao mệnh + kỹ năng lấy riêng từ genshindb.constellations / genshindb.talents theo id nhân vật (bổ sung sau nếu cần).
    void lvl90; // giữ lại để dùng nếu muốn thêm cột "chỉ số cấp 90" sau này

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

    const refinements = [w.r1, w.r2, w.r3, w.r4, w.r5].filter(Boolean);

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
        effectDescription: w.effectTemplateRaw || null,
        passiveByRefinement: refinements.length ? JSON.parse(JSON.stringify(refinements)) : undefined,
        description: w.description || null,
        iconUrl: img("weapons", w.images?.filename_icon),
      },
      update: {
        name: w.name,
        type: w.weaponText,
        rarity: w.rarity,
        baseAtk: w.baseAtkValue ?? null,
        subStatName: w.mainStatText || null,
        subStatValue: w.baseStatText || null,
        effectName: w.effectName || null,
        effectDescription: w.effectTemplateRaw || null,
        passiveByRefinement: refinements.length ? JSON.parse(JSON.stringify(refinements)) : undefined,
        description: w.description || null,
        iconUrl: img("weapons", w.images?.filename_icon),
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
        iconUrl: img("artifacts", a.images?.filename_flower ?? a.images?.filename_circlet),
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
        iconUrl: img("artifacts", a.images?.filename_flower ?? a.images?.filename_circlet),
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
