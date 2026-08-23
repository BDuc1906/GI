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
 * Hàm giải quyết fallback trường dữ liệu khi bị thiếu từ file crawl
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
 * Trả về giá trị mới nếu có, ngược lại trả `undefined` (Prisma hiểu là "giữ
 * nguyên giá trị cũ trong DB, đừng đụng vào field này") — NHƯNG khác bản cũ
 * ở chỗ: BÁO ĐỘNG ra console khi rơi vào nhánh "giữ nguyên cũ" cho field
 * thuộc `CORE_GAMEPLAY_FIELDS` (talents, constellations, statsByLevel...).
 *
 * LÝ DO CẦN HÀM NÀY: trước đây `data.X ? Y : undefined` cho các field này
 * hoàn toàn im lặng khi crawl không lấy được dữ liệu mới (mạng lỗi,
 * genshin-db đổi format, nhân vật vừa rebalance mà genshin-db chưa kịp cập
 * nhật đúng...) — hậu quả: nhân vật được buff trong bản mới nhưng mô tả kỹ
 * năng/số liệu vẫn hiển thị bản CŨ trên site, mà log seed vẫn báo "thành
 * công" như bình thường, không ai biết để mà sửa. Đây CHÍNH LÀ nguyên nhân
 * hiện tượng "buff không cập nhật" đã gặp — không phải seed chạy sai, mà là
 * seed chạy "đúng" theo thiết kế cũ (im lặng bỏ qua) khi thiếu dữ liệu.
 */
function withStaleWarning<T>(fieldName: string, characterName: string, value: T | null | undefined): T | undefined {
  if (value) return value;
  console.warn(
    `  ⚠️  ${characterName}: crawl không có dữ liệu mới cho "${fieldName}" — GIỮ NGUYÊN giá trị cũ trong DB ` +
    `(có thể đã lỗi thời nếu nhân vật này vừa được rebalance/buff ở bản mới). Kiểm tra data/raw/characters.json ` +
    `xem field này có rỗng không — nếu rỗng, lỗi nằm ở crawl-characters.ts / genshin-db, không phải ở seed.`
  );
  return undefined;
}

/**
 * Build payload từ CharacterData (Bổ sung các trường mới từ ảnh yêu cầu)
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
    ascensionMaterials: withStaleWarning(
      "ascensionMaterials",
      data.name,
      data.ascensionMaterials ? await resolveAscensionMaterials(data.ascensionMaterials) : null
    ) as any,
    talentMaterials: withStaleWarning(
      "talentMaterials",
      data.name,
      data.talentMaterials ? await resolveTalentMaterials(data.talentMaterials) : null
    ) as any,
    statsByLevel: withStaleWarning("statsByLevel", data.name, data.statsByLevel) as any,
    birthday: data.birthday,
    constellationName: data.constellationName,
    voiceActors: withStaleWarning("voiceActors", data.name, data.voiceActors) as any,
    gameVersion: data.gameVersion,
    wikiUrl: data.wikiUrl,
    constellations: withStaleWarning("constellations", data.name, data.constellations) as any,
    talents: withStaleWarning("talents", data.name, data.talents) as any,

    // 👇 CÁC TRƯỜNG MỚI ĐƯỢC THÊM THEO HƯỚNG DẪN TRONG ẢNH
    genshinDbId: data.genshinDbId ?? null,
    gender: data.gender ?? null,
    bodyType: data.bodyType ?? null,
    associationType: data.associationType ?? null,
    qualityType: data.qualityType ?? null,
    birthdaymmdd: data.birthdaymmdd ?? null,
    raw: data.raw ?? undefined, // prisma lưu Json type nhận undefined/object
  };
}

export async function seedCharacters(): Promise<void> {
  let rawData: string;
  try {
    rawData = fs.readFileSync(RAW_CHARACTERS_FILE, "utf-8");
  } catch (err) {
    throw new Error(
      `Không đọc được ${RAW_CHARACTERS_FILE} (${(err as Error).message}).\n` +
      `👉 Chạy 'npm run data:crawl' trước để tạo file này, rồi seed lại.`
    );
  }

  const characters: CharacterData[] = JSON.parse(rawData);
  console.log(`📖 Đã đọc ${characters.length} nhân vật từ data/raw/characters.json`);

  // 🚀 TỐI ƯU: Nạp trước toàn bộ nhân vật hiện có để tránh N+1 Query
  const allExistingChars = await prisma.character.findMany({
    select: { id: true, vision: true, weaponType: true },
  });
  const existingMap = new Map(allExistingChars.map((c) => [c.id, c]));

  let count = 0;
  for (const data of characters) {
    try {
      const existing = existingMap.get(data.id);
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
        update: payload, // Tự động cập nhật các trường mới nhờ đã gộp vào payload bên trên
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