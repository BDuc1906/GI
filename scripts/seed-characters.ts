/**
 * scripts/seed-characters.ts
 *
 * Bước 2 (persist) trong pipeline crawl -> seed: đọc data/raw/characters.json
 * (do `npm run data:crawl` sinh ra — xem scripts/pipeline/crawl-characters.ts)
 * rồi ghi vào Postgres qua Prisma.
 *
 * File này KHÔNG còn tự gọi genshin-db để lấy dữ liệu nhân vật nữa — đó là
 * việc của GenshinDbAdapter (src/lib/data-sources/adapters/genshindb-adapter.ts).
 * genshin-db vẫn được require ở đây, nhưng CHỈ để tra icon nguyên liệu qua
 * upsertMaterial() khi resolve materialId — 2 việc khác nhau, xem comment
 * ở buildMaterialRefsWithIds() bên dưới.
 */

import { createRequire } from "module";
import fs from "fs";
import path from "path";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

import { prisma } from "../src/lib/prisma";
import { upsertMaterial, loadManualOverrides } from "./lib/seed-helpers";
import type {
  CharacterData,
  MaterialRef,
  AscensionMaterialPhase,
  TalentMaterialLevel,
} from "../src/lib/data-sources/types";

const DATA_DIR = path.join(process.cwd(), "scripts", "data");
const RAW_CHARACTERS_FILE = path.join(process.cwd(), "data", "raw", "characters.json");

// Đọc image overrides (dùng khi resolve materialId qua upsertMaterial bên dưới)
const imageOverridesPath = path.join(DATA_DIR, "image-overrides.json");
let MANUAL_ICON_OVERRIDES: Record<string, string> = {};
try {
  MANUAL_ICON_OVERRIDES = JSON.parse(fs.readFileSync(imageOverridesPath, "utf-8"));
  console.log(`📖 Đã đọc image-overrides.json (${Object.keys(MANUAL_ICON_OVERRIDES).length} override)`);
} catch (err) {
  console.warn(
    `⚠️ Không đọc được ${imageOverridesPath} (${(err as Error).message}), sử dụng override rỗng.`
  );
}
loadManualOverrides(MANUAL_ICON_OVERRIDES);

/**
 * CharacterData.ascensionMaterials/talentMaterials chỉ có {name, count} —
 * adapter (bước fetch) không được đụng DB nên không thể tự resolve
 * materialId. Ở ĐÂY (bước persist, có sẵn prisma) mới gọi upsertMaterial()
 * cho từng material để: (1) đảm bảo record Material tồn tại/có icon,
 * (2) lấy materialId gắn vào JSON lưu trong cột ascensionMaterials/
 * talentMaterials của Character, phục vụ join lúc render trang chi tiết.
 */
async function resolveMaterialRefs(
  materials: MaterialRef[]
): Promise<Array<{ materialId: string; name: string; count: number | null }>> {
  const result = [];
  for (const m of materials) {
    const materialId = await upsertMaterial(prisma, genshindb, m.name);
    result.push({ materialId, name: m.name, count: m.count });
  }
  return result;
}

async function resolveAscensionMaterials(
  phases: AscensionMaterialPhase[] | null
): Promise<unknown> {
  if (!phases) return null;
  const result = [];
  for (const p of phases) {
    result.push({ phase: p.phase, materials: await resolveMaterialRefs(p.materials) });
  }
  return result;
}

async function resolveTalentMaterials(levels: TalentMaterialLevel[] | null): Promise<unknown> {
  if (!levels) return null;
  const result = [];
  for (const lvl of levels) {
    result.push({ level: lvl.level, materials: await resolveMaterialRefs(lvl.materials) });
  }
  return result;
}

/** Build đúng payload cột Character từ 1 CharacterData đã crawl. */
async function toCharacterPayload(data: CharacterData) {
  return {
    name: data.name,
    title: data.title,
    vision: data.vision,
    weaponType: data.weaponType,
    rarity: data.rarity,
    region: data.region,
    affiliation: data.affiliation,
    // genshin-db không cung cấp ngày ra mắt thật ngoài đời — xem comment
    // tại field này trong prisma/schema.prisma.
    releaseDate: null,
    description: data.description,
    iconUrl: data.iconUrl,
    sideIconUrl: data.sideIconUrl,
    splashUrl: data.splashUrl,
    elementIcon: data.elementIcon,
    baseHp: data.baseHp,
    baseAtk: data.baseAtk,
    baseDef: data.baseDef,
    ascensionStat: data.ascensionStat,
    ascensionMaterials: await resolveAscensionMaterials(data.ascensionMaterials),
    talentMaterials: await resolveTalentMaterials(data.talentMaterials),
    statsByLevel: data.statsByLevel,
    birthday: data.birthday,
    constellationName: data.constellationName,
    voiceActors: data.voiceActors,
    gameVersion: data.gameVersion,
    wikiUrl: data.wikiUrl,
    constellations: data.constellations,
    talents: data.talents,
  };
}

export async function seedCharacters(): Promise<void> {
  let raw: string;
  try {
    raw = fs.readFileSync(RAW_CHARACTERS_FILE, "utf-8");
  } catch (err) {
    throw new Error(
      `Không đọc được ${RAW_CHARACTERS_FILE} (${(err as Error).message}).\n` +
      `👉 Chạy 'npm run data:crawl' trước để tạo file này, rồi seed lại.`
    );
  }

  const characters: CharacterData[] = JSON.parse(raw);
  console.log(`📖 Đã đọc ${characters.length} nhân vật từ data/raw/characters.json`);

  let count = 0;
  for (const data of characters) {
    try {
      const payload = await toCharacterPayload(data);
      await prisma.character.upsert({
        where: { id: data.id },
        create: { id: data.id, ...payload },
        update: payload,
      });
      count++;
    } catch (err) {
      console.warn(`⚠ Skipped character "${data.name}" (${data.id}):`, (err as Error).message);
    }
  }

  console.log(`✔ Seeded ${count}/${characters.length} characters (including Traveler variants)`);

  const missingBookType = characters.filter((c) => c.missingTalentBookType).map((c) => c.name);
  if (missingBookType.length) {
    console.warn(
      `\n⚠ ${missingBookType.length} nhân vật KHÔNG resolve được talent book type ` +
      `(đã cảnh báo lúc crawl, xem data/raw/manifest.json):`
    );
    console.warn(missingBookType.map((n) => `   - ${n}`).join("\n"));
  } else {
    console.log("✔ Mọi nhân vật đều resolve được talent book type.");
  }
}
