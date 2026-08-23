/**
 * scripts/seed-extra.ts
 *
 * Đọc data/raw/<folder>.json (sinh bởi crawl-extra-data.ts) và upsert vào
 * 15 model Prisma mới tương ứng. Gọi từ scripts/seed.ts, giống cách
 * seedCharacters/seedWeapons/... đã hoạt động.
 *
 * Mỗi model chỉ trích vài field scalar hay dùng để lọc; toàn bộ object
 * gốc luôn được lưu nguyên vào cột `raw` — không mất field nào dù chưa
 * được liệt kê rõ ở đây.
 */

import fs from "fs";
import path from "path";
import { prisma } from "../src/lib/prisma";

const DATA_RAW_DIR = path.join(process.cwd(), "data", "raw");

/**
 * Chuẩn hoá trường "source" (nguồn nhận được vật phẩm) về dạng chuỗi đơn.
 * Bản genshin-db mới đổi định dạng trường này từ string -> string[] cho
 * namecard/material (mỗi phần tử là 1 nguồn, vd quest khác nhau) — Prisma
 * schema (String?) không chấp nhận thẳng array nên phải join lại. Vẫn xử lý
 * được cả 2 dạng (string cũ, string[] mới) để không vỡ khi genshin-db đổi
 * định dạng lần nữa.
 */
function normalizeSource(source: unknown): string | null {
  if (source == null) return null;
  if (Array.isArray(source)) {
    const joined = source.filter((s) => typeof s === "string" && s.trim()).join("; ");
    return joined || null;
  }
  if (typeof source === "string") return source.trim() || null;
  return String(source);
}

function readRaw(folder: string): any[] {
  const filePath = path.join(DATA_RAW_DIR, `${folder}.json`);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️ Không tìm thấy ${filePath} — bỏ qua folder "${folder}" (chạy data:crawl trước).`);
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (err) {
    console.warn(`⚠️ Không parse được ${filePath}:`, err);
    return [];
  }
}

// Ép id gốc (thường là number bên genshin-db) về string để khớp @id String
// của mọi model mới. Với vài folder không có field `id` sẵn (elements,
// rarity), dùng `name` làm khóa thay thế.
function toIdString(value: unknown, fallback: string): string {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

async function seedAchievementGroups() {
  const items = readRaw("achievementgroups");
  for (const item of items) {
    const id = toIdString(item.id, item.name);
    await prisma.achievementGroup.upsert({
      where: { id },
      create: { id, name: item.name, sortOrder: item.sortOrder ?? null, version: item.version ?? null, raw: item },
      update: { name: item.name, sortOrder: item.sortOrder ?? null, version: item.version ?? null, raw: item },
    });
  }
  console.log(`  📦 AchievementGroup: ${items.length}`);
}

async function seedAchievements() {
  const items = readRaw("achievements");
  for (const item of items) {
    const id = toIdString(item.id, item.name);
    await prisma.achievement.upsert({
      where: { id },
      create: {
        id,
        name: item.name,
        achievementGroupId: item.achievementGroupId != null ? String(item.achievementGroupId) : null,
        achievementGroupName: item.achievementGroupName ?? null,
        isHidden: item.isHidden ?? null,
        sortOrder: item.sortOrder ?? null,
        raw: item,
      },
      update: {
        name: item.name,
        achievementGroupId: item.achievementGroupId != null ? String(item.achievementGroupId) : null,
        achievementGroupName: item.achievementGroupName ?? null,
        isHidden: item.isHidden ?? null,
        sortOrder: item.sortOrder ?? null,
        raw: item,
      },
    });
  }
  console.log(`  📦 Achievement: ${items.length}`);
}

async function seedAdventureRanks() {
  const items = readRaw("adventureranks");
  for (const item of items) {
    const id = toIdString(item.id, item.name);
    await prisma.adventureRank.upsert({
      where: { id },
      create: { id, name: item.name, exp: item.exp ?? null, raw: item },
      update: { name: item.name, exp: item.exp ?? null, raw: item },
    });
  }
  console.log(`  📦 AdventureRank: ${items.length}`);
}

async function seedAnimals() {
  const items = readRaw("animals");
  for (const item of items) {
    const id = toIdString(item.id, item.name);
    await prisma.animal.upsert({
      where: { id },
      create: {
        id,
        name: item.name,
        categoryType: item.categoryType ?? null,
        categoryText: item.categoryText ?? null,
        sortOrder: item.sortOrder ?? null,
        raw: item,
      },
      update: {
        name: item.name,
        categoryType: item.categoryType ?? null,
        categoryText: item.categoryText ?? null,
        sortOrder: item.sortOrder ?? null,
        raw: item,
      },
    });
  }
  console.log(`  📦 Animal: ${items.length}`);
}

async function seedConstellationsRaw() {
  const items = readRaw("constellations");
  for (const item of items) {
    const id = toIdString(item.id, item.name);
    await prisma.constellation.upsert({
      where: { id },
      create: { id, name: item.name, raw: item },
      update: { name: item.name, raw: item },
    });
  }
  console.log(`  📦 Constellation (raw): ${items.length}`);
}

async function seedCrafts() {
  const items = readRaw("crafts");
  for (const item of items) {
    const id = toIdString(item.id, item.name);
    await prisma.craft.upsert({
      where: { id },
      create: {
        id,
        name: item.name,
        unlockRank: item.unlockRank ?? null,
        moraCost: item.moraCost ?? null,
        resultCount: item.resultCount ?? null,
        raw: item,
      },
      update: {
        name: item.name,
        unlockRank: item.unlockRank ?? null,
        moraCost: item.moraCost ?? null,
        resultCount: item.resultCount ?? null,
        raw: item,
      },
    });
  }
  console.log(`  📦 Craft: ${items.length}`);
}

async function seedElements() {
  const items = readRaw("elements");
  for (const item of items) {
    await prisma.elementInfo.upsert({
      where: { name: item.name },
      create: { name: item.name, type: item.type ?? null, archon: item.archon ?? null, raw: item },
      update: { type: item.type ?? null, archon: item.archon ?? null, raw: item },
    });
  }
  console.log(`  📦 ElementInfo: ${items.length}`);
}

async function seedEnemies() {
  const items = readRaw("enemies");
  for (const item of items) {
    const id = toIdString(item.id, item.name);
    await prisma.enemy.upsert({
      where: { id },
      create: {
        id,
        monsterId: item.monsterId ?? null,
        name: item.name,
        monsterType: item.monsterType ?? null,
        enemyType: item.enemyType ?? null,
        categoryType: item.categoryType ?? null,
        categoryText: item.categoryText ?? null,
        raw: item,
      },
      update: {
        monsterId: item.monsterId ?? null,
        name: item.name,
        monsterType: item.monsterType ?? null,
        enemyType: item.enemyType ?? null,
        categoryType: item.categoryType ?? null,
        categoryText: item.categoryText ?? null,
        raw: item,
      },
    });
  }
  console.log(`  📦 Enemy: ${items.length}`);
}

async function seedFoods() {
  const items = readRaw("foods");
  for (const item of items) {
    const id = toIdString(item.id, item.name);
    await prisma.food.upsert({
      where: { id },
      create: {
        id,
        name: item.name,
        rarity: typeof item.rarity === "string" ? parseInt(item.rarity, 10) : item.rarity ?? null,
        foodtype: item.foodtype ?? null,
        filterType: item.filterType ?? null,
        raw: item,
      },
      update: {
        name: item.name,
        rarity: typeof item.rarity === "string" ? parseInt(item.rarity, 10) : item.rarity ?? null,
        foodtype: item.foodtype ?? null,
        filterType: item.filterType ?? null,
        raw: item,
      },
    });
  }
  console.log(`  📦 Food: ${items.length}`);
}

async function seedGeographies() {
  const items = readRaw("geographies");
  for (const item of items) {
    const id = toIdString(item.id, item.name);
    await prisma.geography.upsert({
      where: { id },
      create: {
        id,
        name: item.name,
        areaId: item.areaId != null ? String(item.areaId) : null,
        areaName: item.areaName ?? null,
        regionId: item.regionId != null ? String(item.regionId) : null,
        regionName: item.regionName ?? null,
        raw: item,
      },
      update: {
        name: item.name,
        areaId: item.areaId != null ? String(item.areaId) : null,
        areaName: item.areaName ?? null,
        regionId: item.regionId != null ? String(item.regionId) : null,
        regionName: item.regionName ?? null,
        raw: item,
      },
    });
  }
  console.log(`  📦 Geography: ${items.length}`);
}

async function seedNamecards() {
  const items = readRaw("namecards");
  for (const item of items) {
    const id = toIdString(item.id, item.name);
    await prisma.namecard.upsert({
      where: { id },
      create: { id, name: item.name, source: normalizeSource(item.source), version: item.version ?? null, raw: item },
      update: { name: item.name, source: normalizeSource(item.source), version: item.version ?? null, raw: item },
    });
  }
  console.log(`  📦 Namecard: ${items.length}`);
}

async function seedOutfits() {
  const items = readRaw("outfits");
  for (const item of items) {
    const id = toIdString(item.id, item.name);
    await prisma.outfit.upsert({
      where: { id },
      create: {
        id,
        name: item.name,
        characterId: item.characterId != null ? String(item.characterId) : null,
        characterName: item.characterName ?? null,
        isDefault: item.isDefault ?? null,
        source: normalizeSource(item.source),
        raw: item,
      },
      update: {
        name: item.name,
        characterId: item.characterId != null ? String(item.characterId) : null,
        characterName: item.characterName ?? null,
        isDefault: item.isDefault ?? null,
        source: normalizeSource(item.source),
        raw: item,
      },
    });
  }
  console.log(`  📦 Outfit: ${items.length}`);
}

async function seedRarity() {
  const items = readRaw("rarity");
  for (const item of items) {
    await prisma.rarity.upsert({
      where: { name: item.name },
      create: { name: item.name, raw: item },
      update: { raw: item },
    });
  }
  console.log(`  📦 Rarity: ${items.length}`);
}

async function seedTalentsRaw() {
  const items = readRaw("talents");
  for (const item of items) {
    const id = toIdString(item.id, item.name);
    await prisma.talent.upsert({
      where: { id },
      create: { id, name: item.name, raw: item },
      update: { name: item.name, raw: item },
    });
  }
  console.log(`  📦 Talent (raw): ${items.length}`);
}

async function seedWindgliders() {
  const items = readRaw("windgliders");
  for (const item of items) {
    const id = toIdString(item.id, item.name);
    await prisma.windglider.upsert({
      where: { id },
      create: {
        id,
        name: item.name,
        rarity: typeof item.rarity === "string" ? parseInt(item.rarity, 10) : item.rarity ?? null,
        source: normalizeSource(item.source),
        raw: item,
      },
      update: {
        name: item.name,
        rarity: typeof item.rarity === "string" ? parseInt(item.rarity, 10) : item.rarity ?? null,
        source: normalizeSource(item.source),
        raw: item,
      },
    });
  }
  console.log(`  📦 Windglider: ${items.length}`);
}

export async function seedExtra(): Promise<void> {
  await seedAchievementGroups();
  await seedAchievements();
  await seedAdventureRanks();
  await seedAnimals();
  await seedConstellationsRaw();
  await seedCrafts();
  await seedElements();
  await seedEnemies();
  await seedFoods();
  await seedGeographies();
  await seedNamecards();
  await seedOutfits();
  await seedRarity();
  await seedTalentsRaw();
  await seedWindgliders();
}