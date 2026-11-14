/**
 * scripts/seed-extra.ts
 *
 * Đọc data/raw/<folder>.json (sinh bởi crawl-extra-data.ts) và upsert vào
 * 15 model Prisma mới tương ứng. Gọi từ scripts/seed.ts, giống cách
 * seedCharacters/seedWeapons/... đã hoạt động.
 *
 * Tối ưu hoá xử lý theo lô (batch chunks of 25) để hoàn thành trong vài giây,
 * tránh N+1 tuần tự làm nghẽn hoặc timeout kết nối DB.
 */

import fs from "fs";
import path from "path";
import { prisma } from "../../src/lib/db/prisma";
import { logDataSyncChange } from "../lib/audit-diff";

const DATA_RAW_DIR = path.join(process.cwd(), "data", "raw");

/**
 * Xử lý danh sách theo lô song song có kiểm soát để tăng tốc tối đa
 */
async function processBatch<T>(
  items: T[],
  handler: (item: T) => Promise<void>,
  batchSize = 25
): Promise<void> {
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    await Promise.all(chunk.map(handler));
  }
}

async function upsertRawWithAudit(params: {
  model: any;
  whereKey: string;
  whereValue: string;
  data: Record<string, unknown>;
  entityType: string;
}): Promise<void> {
  const { model, whereKey, whereValue, data, entityType } = params;
  const where = { [whereKey]: whereValue };
  const existing = await model.findUnique({ where });

  const updateData = { ...data };
  delete updateData[whereKey];

  await model.upsert({ where, create: data, update: updateData });

  await logDataSyncChange({
    entityType,
    entityId: whereValue,
    oldRecord: existing,
    newRecord: updateData,
    source: "seed-extra",
  }).catch((err) => {
    console.warn(`⚠️ Không ghi được AuditLog cho ${entityType} "${whereValue}":`, (err as Error).message);
  });
}

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

function toIdString(value: unknown, fallback: string): string {
  if (value === null || value === undefined || value === "") return fallback;
  return String(value);
}

async function seedAchievementGroups() {
  const items = readRaw("achievementgroups");
  await processBatch(items, async (item) => {
    const id = toIdString(item.id, item.name);
    await upsertRawWithAudit({
      model: prisma.achievementGroup,
      whereKey: "id",
      whereValue: id,
      data: { id, name: item.name, sortOrder: item.sortOrder ?? null, version: item.version ?? null, raw: item },
      entityType: "achievementGroup",
    });
  });
  console.log(`  📦 AchievementGroup: ${items.length}`);
}

async function seedAchievements() {
  const items = readRaw("achievements");
  await processBatch(items, async (item) => {
    const id = toIdString(item.id, item.name);
    await upsertRawWithAudit({
      model: prisma.achievement,
      whereKey: "id",
      whereValue: id,
      data: {
        id,
        name: item.name,
        achievementGroupId: item.achievementGroupId != null ? String(item.achievementGroupId) : null,
        achievementGroupName: item.achievementGroupName ?? null,
        isHidden: item.isHidden ?? null,
        sortOrder: item.sortOrder ?? null,
        raw: item,
      },
      entityType: "achievement",
    });
  });
  console.log(`  📦 Achievement: ${items.length}`);
}

async function seedAdventureRanks() {
  const items = readRaw("adventureranks");
  await processBatch(items, async (item) => {
    const id = toIdString(item.id, item.name);
    await upsertRawWithAudit({
      model: prisma.adventureRank,
      whereKey: "id",
      whereValue: id,
      data: { id, name: item.name, exp: item.exp ?? null, raw: item },
      entityType: "adventureRank",
    });
  });
  console.log(`  📦 AdventureRank: ${items.length}`);
}

async function seedAnimals() {
  const items = readRaw("animals");
  await processBatch(items, async (item) => {
    const id = toIdString(item.id, item.name);
    await upsertRawWithAudit({
      model: prisma.animal,
      whereKey: "id",
      whereValue: id,
      data: {
        id,
        name: item.name,
        categoryType: item.categoryType ?? null,
        categoryText: item.categoryText ?? null,
        sortOrder: item.sortOrder ?? null,
        raw: item,
      },
      entityType: "animal",
    });
  });
  console.log(`  📦 Animal: ${items.length}`);
}

async function seedConstellationsRaw() {
  const items = readRaw("constellations");
  await processBatch(items, async (item) => {
    const id = toIdString(item.id, item.name);
    await upsertRawWithAudit({
      model: prisma.constellation,
      whereKey: "id",
      whereValue: id,
      data: { id, name: item.name, raw: item },
      entityType: "constellation",
    });
  });
  console.log(`  📦 Constellation (raw): ${items.length}`);
}

async function seedCrafts() {
  const items = readRaw("crafts");
  await processBatch(items, async (item) => {
    const id = toIdString(item.id, item.name);
    await upsertRawWithAudit({
      model: prisma.craft,
      whereKey: "id",
      whereValue: id,
      data: {
        id,
        name: item.name,
        unlockRank: item.unlockRank ?? null,
        moraCost: item.moraCost ?? null,
        resultCount: item.resultCount ?? null,
        raw: item,
      },
      entityType: "craft",
    });
  });
  console.log(`  📦 Craft: ${items.length}`);
}

async function seedElements() {
  const items = readRaw("elements");
  await processBatch(items, async (item) => {
    await upsertRawWithAudit({
      model: prisma.elementInfo,
      whereKey: "name",
      whereValue: item.name,
      data: { name: item.name, type: item.type ?? null, archon: item.archon ?? null, raw: item },
      entityType: "elementInfo",
    });
  });
  console.log(`  📦 ElementInfo: ${items.length}`);
}

async function seedEnemies() {
  const items = readRaw("enemies");
  await processBatch(items, async (item) => {
    const id = toIdString(item.id, item.name);
    await upsertRawWithAudit({
      model: prisma.enemy,
      whereKey: "id",
      whereValue: id,
      data: {
        id,
        monsterId: item.monsterId ?? null,
        name: item.name,
        monsterType: item.monsterType ?? null,
        enemyType: item.enemyType ?? null,
        categoryType: item.categoryType ?? null,
        categoryText: item.categoryText ?? null,
        raw: item,
      },
      entityType: "enemy",
    });
  });
  console.log(`  📦 Enemy: ${items.length}`);
}

async function seedFoods() {
  const items = readRaw("foods");
  await processBatch(items, async (item) => {
    const id = toIdString(item.id, item.name);
    await upsertRawWithAudit({
      model: prisma.food,
      whereKey: "id",
      whereValue: id,
      data: {
        id,
        name: item.name,
        rarity: typeof item.rarity === "string" ? parseInt(item.rarity, 10) : item.rarity ?? null,
        foodtype: item.foodtype ?? null,
        filterType: item.filterType ?? null,
        raw: item,
      },
      entityType: "food",
    });
  });
  console.log(`  📦 Food: ${items.length}`);
}

async function seedGeographies() {
  const items = readRaw("geographies");
  await processBatch(items, async (item) => {
    const id = toIdString(item.id, item.name);
    await upsertRawWithAudit({
      model: prisma.geography,
      whereKey: "id",
      whereValue: id,
      data: {
        id,
        name: item.name,
        areaId: item.areaId != null ? String(item.areaId) : null,
        areaName: item.areaName ?? null,
        regionId: item.regionId != null ? String(item.regionId) : null,
        regionName: item.regionName ?? null,
        raw: item,
      },
      entityType: "geography",
    });
  });
  console.log(`  📦 Geography: ${items.length}`);
}

async function seedNamecards() {
  const items = readRaw("namecards");
  await processBatch(items, async (item) => {
    const id = toIdString(item.id, item.name);
    await upsertRawWithAudit({
      model: prisma.namecard,
      whereKey: "id",
      whereValue: id,
      data: { id, name: item.name, source: normalizeSource(item.source), version: item.version ?? null, raw: item },
      entityType: "namecard",
    });
  });
  console.log(`  📦 Namecard: ${items.length}`);
}

async function seedOutfits() {
  const items = readRaw("outfits");
  await processBatch(items, async (item) => {
    const id = toIdString(item.id, item.name);
    await upsertRawWithAudit({
      model: prisma.outfit,
      whereKey: "id",
      whereValue: id,
      data: {
        id,
        name: item.name,
        characterId: item.characterId != null ? String(item.characterId) : null,
        characterName: item.characterName ?? null,
        isDefault: item.isDefault ?? null,
        source: normalizeSource(item.source),
        raw: item,
      },
      entityType: "outfit",
    });
  });
  console.log(`  📦 Outfit: ${items.length}`);
}

async function seedRarity() {
  const items = readRaw("rarity");
  await processBatch(items, async (item) => {
    await upsertRawWithAudit({
      model: prisma.rarity,
      whereKey: "name",
      whereValue: item.name,
      data: { name: item.name, raw: item },
      entityType: "rarity",
    });
  });
  console.log(`  📦 Rarity: ${items.length}`);
}

async function seedTalentsRaw() {
  const items = readRaw("talents");
  await processBatch(items, async (item) => {
    const id = toIdString(item.id, item.name);
    await upsertRawWithAudit({
      model: prisma.talent,
      whereKey: "id",
      whereValue: id,
      data: { id, name: item.name, raw: item },
      entityType: "talent",
    });
  });
  console.log(`  📦 Talent (raw): ${items.length}`);
}

async function seedWindgliders() {
  const items = readRaw("windgliders");
  await processBatch(items, async (item) => {
    const id = toIdString(item.id, item.name);
    await upsertRawWithAudit({
      model: prisma.windglider,
      whereKey: "id",
      whereValue: id,
      data: {
        id,
        name: item.name,
        rarity: typeof item.rarity === "string" ? parseInt(item.rarity, 10) : item.rarity ?? null,
        source: normalizeSource(item.source),
        raw: item,
      },
      entityType: "windglider",
    });
  });
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
