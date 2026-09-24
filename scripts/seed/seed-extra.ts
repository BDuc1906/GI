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
import { prisma } from "../../src/lib/db/prisma";
import { logDataSyncChange } from "../lib/audit-diff";

const DATA_RAW_DIR = path.join(process.cwd(), "data", "raw");

/**
 * BỔ SUNG (2026-09-22) — "chuẩn wiki lớn, làm tốt hơn": ghi lịch sử thay
 * đổi (giống pattern đã nối ở seed-characters.ts/seed-weapons.ts/
 * seed-artifacts.ts/seed-helpers.ts::upsertMaterial) cho MỌI model trong
 * file này, dùng CHUNG 1 helper thay vì lặp lại findUnique+upsert+
 * logDataSyncChange 15 lần — cả 15 model dưới đây đều theo đúng 1 khuôn
 * `upsert({where, create, update})` với `update` = `create` bỏ field
 * khoá, nên gộp logic chung an toàn (không phải suy đoán, đã đọc hết cả
 * 15 hàm gốc trước khi viết helper này).
 *
 * `whereKey` linh hoạt "id" hoặc "name" vì 2 model (ElementInfo, Rarity)
 * dùng `name` làm khoá chính thay vì `id`.
 */
async function upsertRawWithAudit(params: {
  // `any` có chủ đích: mỗi Prisma delegate (`prisma.achievement`,
  // `prisma.enemy`...) có type `findUnique`/`upsert` RIÊNG (WhereUniqueInput
  // khác nhau cho từng model — `{id}` vs `{name}`), TypeScript không cho
  // 15 delegate khác nhau đó cùng khớp 1 interface chung dù cấu trúc thật
  // sự giống hệt nhau lúc runtime. File này vốn đã dùng `any` rộng rãi
  // (readRaw() trả `any[]`) nên không phải giảm mức an toàn kiểu so với
  // phần còn lại của file.
  model: any;
  whereKey: string;
  whereValue: string;
  /** Payload ĐẦY ĐỦ (gồm cả field khoá) — helper tự bỏ field khoá ra khỏi `update`. */
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
    await upsertRawWithAudit({
      model: prisma.achievementGroup,
      whereKey: "id",
      whereValue: id,
      data: { id, name: item.name, sortOrder: item.sortOrder ?? null, version: item.version ?? null, raw: item },
      entityType: "achievementGroup",
    });
  }
  console.log(`  📦 AchievementGroup: ${items.length}`);
}

async function seedAchievements() {
  const items = readRaw("achievements");
  for (const item of items) {
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
  }
  console.log(`  📦 Achievement: ${items.length}`);
}

async function seedAdventureRanks() {
  const items = readRaw("adventureranks");
  for (const item of items) {
    const id = toIdString(item.id, item.name);
    await upsertRawWithAudit({
      model: prisma.adventureRank,
      whereKey: "id",
      whereValue: id,
      data: { id, name: item.name, exp: item.exp ?? null, raw: item },
      entityType: "adventureRank",
    });
  }
  console.log(`  📦 AdventureRank: ${items.length}`);
}

async function seedAnimals() {
  const items = readRaw("animals");
  for (const item of items) {
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
  }
  console.log(`  📦 Animal: ${items.length}`);
}

async function seedConstellationsRaw() {
  const items = readRaw("constellations");
  for (const item of items) {
    const id = toIdString(item.id, item.name);
    await upsertRawWithAudit({
      model: prisma.constellation,
      whereKey: "id",
      whereValue: id,
      data: { id, name: item.name, raw: item },
      entityType: "constellation",
    });
  }
  console.log(`  📦 Constellation (raw): ${items.length}`);
}

async function seedCrafts() {
  const items = readRaw("crafts");
  for (const item of items) {
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
  }
  console.log(`  📦 Craft: ${items.length}`);
}

async function seedElements() {
  const items = readRaw("elements");
  for (const item of items) {
    await upsertRawWithAudit({
      model: prisma.elementInfo,
      whereKey: "name",
      whereValue: item.name,
      data: { name: item.name, type: item.type ?? null, archon: item.archon ?? null, raw: item },
      entityType: "elementInfo",
    });
  }
  console.log(`  📦 ElementInfo: ${items.length}`);
}

async function seedEnemies() {
  const items = readRaw("enemies");
  for (const item of items) {
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
  }
  console.log(`  📦 Enemy: ${items.length}`);
}

async function seedFoods() {
  const items = readRaw("foods");
  for (const item of items) {
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
  }
  console.log(`  📦 Food: ${items.length}`);
}

async function seedGeographies() {
  const items = readRaw("geographies");
  for (const item of items) {
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
  }
  console.log(`  📦 Geography: ${items.length}`);
}

async function seedNamecards() {
  const items = readRaw("namecards");
  for (const item of items) {
    const id = toIdString(item.id, item.name);
    await upsertRawWithAudit({
      model: prisma.namecard,
      whereKey: "id",
      whereValue: id,
      data: { id, name: item.name, source: normalizeSource(item.source), version: item.version ?? null, raw: item },
      entityType: "namecard",
    });
  }
  console.log(`  📦 Namecard: ${items.length}`);
}

async function seedOutfits() {
  const items = readRaw("outfits");
  for (const item of items) {
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
  }
  console.log(`  📦 Outfit: ${items.length}`);
}

async function seedRarity() {
  const items = readRaw("rarity");
  for (const item of items) {
    await upsertRawWithAudit({
      model: prisma.rarity,
      whereKey: "name",
      whereValue: item.name,
      data: { name: item.name, raw: item },
      entityType: "rarity",
    });
  }
  console.log(`  📦 Rarity: ${items.length}`);
}

async function seedTalentsRaw() {
  const items = readRaw("talents");
  for (const item of items) {
    const id = toIdString(item.id, item.name);
    await upsertRawWithAudit({
      model: prisma.talent,
      whereKey: "id",
      whereValue: id,
      data: { id, name: item.name, raw: item },
      entityType: "talent",
    });
  }
  console.log(`  📦 Talent (raw): ${items.length}`);
}

async function seedWindgliders() {
  const items = readRaw("windgliders");
  for (const item of items) {
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