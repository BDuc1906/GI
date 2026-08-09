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
 * BUG ĐÃ SỬA (nhân vật hệ Pyro hiển thị "Unknown" nhưng icon vẫn là lửa):
 * trước đây `vision`/`weaponType` LUÔN fallback cứng về chuỗi 'Unknown' —
 * kể cả ở nhánh UPDATE của upsert bên dưới. Nếu 1 lần crawl bị trục trặc
 * tạm thời (genshin-db đổi tên, rớt mạng, ...) và trả về vision rỗng cho
 * MỘT nhân vật đã có dữ liệu đúng sẵn trong DB, nhánh update sẽ ghi đè
 * "Pyro" (đúng) thành "Unknown" ngay lập tức. Trong khi đó cột elementIcon
 * (ảnh) KHÔNG bị đổi theo vì elementIcon chỉ được set ở nhánh CREATE, cố
 * tình giữ nguyên ở nhánh update (xem comment ở Character.iconUrl trong
 * prisma/schema.prisma — tách 2 nhóm cột để không hoàn tác công mirror ảnh
 * sang R2). Hậu quả: nhân vật hiển thị ĐÚNG icon lửa nhưng text nguyên tố
 * lại là "Unknown" — 2 nguồn dữ liệu cùng mô tả 1 thứ nhưng lệch nhau.
 *
 * Sửa: chỉ fallback về 'Unknown' khi thật sự KHÔNG CÓ gì để giữ (tạo mới).
 * Khi update mà dữ liệu crawl mới bị thiếu, GIỮ NGUYÊN giá trị cũ đang có
 * trong DB thay vì ghi đè bằng 'Unknown', đồng thời cảnh báo ra console để
 * biết mà kiểm tra lại nguồn crawl cho nhân vật đó.
 */
function resolveFallbackField(
  fresh: string | null | undefined,
  existing: string | undefined | null,
  charName: string,
  charId: string,
  fieldLabel: string
): string {
  if (fresh) return fresh;
  if (existing) {
    console.warn(
      `⚠️ "${charName}" (${charId}): crawl không trả về "${fieldLabel}" — giữ nguyên giá trị cũ "${existing}" trong DB thay vì ghi đè thành "Unknown".`
    );
    return existing;
  }
  return 'Unknown';
}

/**
 * Build payload từ CharacterData (không bao gồm 4 cột ảnh hiển thị).
 * `existing` là bản ghi hiện có trong DB (nếu đây là update) — dùng để
 * KHÔNG ghi đè vision/weaponType bằng 'Unknown' khi dữ liệu crawl bị thiếu
 * (xem resolveFallbackField ở trên).
 */
async function toCharacterPayload(
  data: CharacterData,
  existing?: { vision: string; weaponType: string } | null
) {
  return {
    name: data.name,
    title: data.title,
    vision: resolveFallbackField(data.vision, existing?.vision, data.name, data.id, 'vision'),
    weaponType: resolveFallbackField(data.weaponType, existing?.weaponType, data.name, data.id, 'weaponType'),
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
      // Lấy vision/weaponType hiện có (nếu nhân vật đã tồn tại) để
      // toCharacterPayload biết còn gì để "giữ nguyên" khi crawl thiếu dữ
      // liệu — xem resolveFallbackField().
      const existing = await prisma.character.findUnique({
        where: { id: data.id },
        select: { vision: true, weaponType: true },
      });
      const payload = await toCharacterPayload(data, existing);
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