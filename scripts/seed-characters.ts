/**
 * scripts/seed-characters.ts
 *
 * Bước 2: Đọc dữ liệu từ data/raw/characters.json (sinh bởi crawl),
 * resolve materialId, và upsert vào DB.
 *
 * Chạy bằng: npm run db:seed
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

// Đọc image overrides (dùng khi resolve materialId)
const imageOverridesPath = path.join(DATA_DIR, "image-overrides.json");
let MANUAL_ICON_OVERRIDES: Record<string, string> = {};
try {
  MANUAL_ICON_OVERRIDES = JSON.parse(fs.readFileSync(imageOverridesPath, "utf-8"));
  console.log(`📖 Đã đọc image-overrides.json (${Object.keys(MANUAL_ICON_OVERRIDES).length} override)`);
} catch (err) {
  console.warn(`⚠️ Không đọc được ${imageOverridesPath}, sử dụng override rỗng.`);
}
loadManualOverrides(MANUAL_ICON_OVERRIDES);

/**
 * Resolve material references (thay name -> materialId)
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

type ResolvedMaterialRef = { materialId: string; name: string; count: number | null };

async function resolveAscensionMaterials(
  phases: AscensionMaterialPhase[] | null
): Promise<Array<{ phase: number; materials: ResolvedMaterialRef[] }> | null> {
  if (!phases) return null;
  const result: Array<{ phase: number; materials: ResolvedMaterialRef[] }> = [];
  for (const p of phases) {
    result.push({ phase: p.phase, materials: await resolveMaterialRefs(p.materials) });
  }
  return result;
}

async function resolveTalentMaterials(
  levels: TalentMaterialLevel[] | null
): Promise<Array<{ level: number; materials: ResolvedMaterialRef[] }> | null> {
  if (!levels) return null;
  const result: Array<{ level: number; materials: ResolvedMaterialRef[] }> = [];
  for (const lvl of levels) {
    result.push({ level: lvl.level, materials: await resolveMaterialRefs(lvl.materials) });
  }
  return result;
}

/**
 * Build payload từ CharacterData (không bao gồm 4 cột ảnh hiển thị)
 */
async function toCharacterPayload(data: CharacterData) {
  return {
    name: data.name,
    title: data.title,
    vision: data.vision || 'Unknown',  // FALLBACK
    weaponType: data.weaponType || 'Unknown',  // FALLBACK
    rarity: data.rarity || 4,
    region: data.region,
    affiliation: data.affiliation,
    releaseDate: null,
    description: data.description,
    iconUrlOriginal: data.iconUrl,
    sideIconUrlOriginal: data.sideIconUrl,
    splashUrlOriginal: data.splashUrl,
    elementIconOriginal: data.elementIcon,
    baseHp: data.baseHp,
    baseAtk: data.baseAtk,
    baseDef: data.baseDef,
    ascensionStat: data.ascensionStat,
    ascensionMaterials: data.ascensionMaterials ? (await resolveAscensionMaterials(data.ascensionMaterials)) as any : undefined,
    talentMaterials: data.talentMaterials ? (await resolveTalentMaterials(data.talentMaterials)) as any : undefined,
    statsByLevel: data.statsByLevel ? (data.statsByLevel as any) : undefined,
    birthday: data.birthday,
    constellationName: data.constellationName,
    voiceActors: data.voiceActors ? (data.voiceActors as any) : undefined,
    gameVersion: data.gameVersion,
    wikiUrl: data.wikiUrl,
    constellations: data.constellations ? (data.constellations as any) : undefined,
    talents: data.talents ? (data.talents as any) : undefined,
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
        create: {
          id: data.id,
          ...payload,
          iconUrl: data.iconUrl,
          sideIconUrl: data.sideIconUrl,
          splashUrl: data.splashUrl,
          elementIcon: data.elementIcon,
        },
        update: payload,
      });
      count++;
    } catch (err) {
      console.warn(`⚠️ Skipped character "${data.name}" (${data.id}):`, (err as Error).message);
    }
  }

  console.log(`✔ Seeded ${count}/${characters.length} characters`);

  const missingBookType = characters.filter((c) => c.missingTalentBookType).map((c) => c.name);
  if (missingBookType.length) {
    console.warn(
      `\n⚠ ${missingBookType.length} nhân vật KHÔNG resolve được talent book type:\n` +
      missingBookType.map((n) => `   - ${n}`).join("\n") +
      `\n→ Cập nhật scripts/data/talent-book-mapping.json và chạy lại crawl + seed.`
    );
  } else {
    console.log("✔ Mọi nhân vật đều resolve được talent book type.");
  }
}