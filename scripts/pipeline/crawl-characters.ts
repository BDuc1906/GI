/**
 * scripts/pipeline/crawl-characters.ts
 *
 * Bước 1: Crawl dữ liệu từ genshin-db, lưu vào data/raw/characters.json.
 */

import { createRequire } from "module";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

import {
  slugify,
  getBestImageUrl,
  getElementIconUrl,
  buildAscensionMaterialPhases,
  buildTalentMaterialLevels,
  buildBossMaterialNameSet,
  getBossMaterialName,
  createTalentBookResolver,
  getStatsByLevel,
  getTalentsAndConstellations,
  resolveTravelerTalentBook,
} from "../lib/genshin-pure-helpers";
import type { CharacterData, VoiceActors } from "../../src/lib/data-sources/types";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_RAW_DIR = path.join(__dirname, "../../data/raw");
const CONFIG_DIR = path.join(__dirname, "../data");

// Đảm bảo thư mục data/raw tồn tại
if (!fs.existsSync(DATA_RAW_DIR)) {
  fs.mkdirSync(DATA_RAW_DIR, { recursive: true });
}

// Đọc talent book mapping
const mappingPath = path.join(CONFIG_DIR, "talent-book-mapping.json");
let talentBookSeriesByCharacter: Record<string, string> = {};
try {
  talentBookSeriesByCharacter = JSON.parse(fs.readFileSync(mappingPath, "utf-8"));
  console.log(`📖 Đã đọc talent-book-mapping.json (${Object.keys(talentBookSeriesByCharacter).length} nhân vật)`);
} catch (err) {
  console.warn(`⚠️ Không đọc được ${mappingPath}, sử dụng mapping rỗng.`);
}

const resolveTalentBook = createTalentBookResolver(talentBookSeriesByCharacter);
const bossMaterialNames = buildBossMaterialNameSet(genshindb);

/**
 * Crawl một nhân vật và trả về CharacterData
 */
function crawlCharacter(name: string): CharacterData | null {
  try {
    const raw = genshindb.characters(name) as any;
    if (!raw || !raw.name) return null;

    const id = slugify(raw.name);

    // ---- Ảnh ----
    const iconUrl = getBestImageUrl(raw.images, "icon");
    const sideIconUrl = getBestImageUrl(raw.images, "side");
    const splashUrl = getBestImageUrl(raw.images, "splash");
    const elementIcon = getElementIconUrl(raw.elementText);

    // ---- Talent book ----
    // BUG ĐÃ SỬA (13 nhân vật báo "KHÔNG resolve được talent book type"):
    // trước đây LUÔN tra map thủ công talent-book-mapping.json trước —
    // 11 nhân vật Natlan mới chưa kịp thêm vào file đó là fail ngay dù
    // genshin-db thừa dữ liệu. Giờ ưu tiên lấy TRỰC TIẾP từ
    // talents().costs (xem deriveBookTypeFromTalentCosts) — đúng cho MỌI
    // nhân vật thường, không cần cập nhật map tay nữa. Map thủ công +
    // resolveTravelerTalentBook(vision) chỉ còn dùng làm fallback, chủ
    // yếu cho Aether/Lumine (genshin-db 5.2.12 không tách biến thể nguyên
    // tố cho Traveler nên talents("Aether")/raw.elementText đều rỗng — 2
    // nhân vật này vẫn phải khai tay trong talent-book-mapping.json).
    const { talents, constellations, talentMaterials: talentMaterialsFromCosts, bookType: bookTypeFromCosts } =
      getTalentsAndConstellations(genshindb, raw.name);

    const bookType =
      bookTypeFromCosts ??
      (raw.name === "Aether" || raw.name === "Lumine"
        ? resolveTravelerTalentBook(raw.elementText)
        : null) ??
      resolveTalentBook(raw.name);
    const bossMaterialName = getBossMaterialName(raw.costs, bossMaterialNames);

    const ascensionMaterials = buildAscensionMaterialPhases(raw.costs);
    const statsByLevel = getStatsByLevel(raw.stats);

    // Ưu tiên nguồn THẬT (talents().costs — đủ cả nguyên liệu quái vùng,
    // xem comment ở buildTalentMaterialLevelsFromRawCosts). Chỉ rơi về
    // bảng tự dựng generic (thiếu nguyên liệu quái vùng) khi genshin-db
    // không trả về costs cho nhân vật này.
    const talentMaterials =
      talentMaterialsFromCosts ??
      (bookType ? buildTalentMaterialLevels(bookType, bossMaterialName) : null);

    const voiceActors: VoiceActors = {
      english: raw.cv?.english || null,   // BUG ĐÃ SỬA: field đúng là "cv", không phải "voice";
      chinese: raw.cv?.chinese || null,   // và key con là "english"/"chinese"/... (tên đầy đủ),
      japanese: raw.cv?.japanese || null, // không phải viết tắt "en"/"zh"/"jp"/"kr"
      korean: raw.cv?.korean || null,
    };

    // ---- ĐẢM BẢO CÁC FIELD BẮT BUỘC ----
    const characterData: CharacterData = {
      id,
      name: raw.name,
      title: raw.title || null,
      // BUG ĐÃ SỬA: genshin-db v5 KHÔNG có field `vision` (chỉ có
      // `elementText`, vd "Pyro") và `weaponType` là MÃ ENUM NỘI BỘ (vd
      // "WEAPON_POLE"), không phải tên hiển thị. Dùng raw.vision/
      // raw.weaponType khiến cột `vision` luôn rơi về 'Unknown' và cột
      // `weaponType` chứa mã enum không khớp với các chip lọc trên UI
      // ("Sword"/"Claymore"/"Polearm"/"Bow"/"Catalyst") -> lọc theo vũ
      // khí luôn ra 0 kết quả, lọc theo nguyên tố sai cho nhân vật mới.
      // Field đúng: elementText / weaponText.
      vision: raw.elementText || 'Unknown',
      weaponType: raw.weaponText || 'Unknown',
      rarity: typeof raw.rarity === "string" ? parseInt(raw.rarity, 10) : (raw.rarity || 4),
      region: raw.region || null,
      affiliation: raw.affiliation || null,
      releaseDate: null,
      description: raw.description || null,
      iconUrl,
      sideIconUrl,
      splashUrl,
      elementIcon,
      baseHp: raw.baseHp || null,
      baseAtk: raw.baseAtk || null,
      baseDef: raw.baseDef || null,
      // BUG ĐÃ SỬA: genshin-db v5 KHÔNG có field `ascensionStat` (luôn
      // undefined -> cột ascensionStat trong DB rơi về null -> UI fallback
      // hiện chữ chung chung "Chỉ số đột phá" thay vì tên thật như "CRIT
      // DMG"/"Elemental Mastery"). Field đúng là `substatText`.
      ascensionStat: raw.substatText || null,
      ascensionMaterials,
      talentMaterials,
      statsByLevel,
      birthday: raw.birthday || null,
      constellationName: raw.constellation || null,
      voiceActors,
      gameVersion: raw.version || null,
      wikiUrl: raw.url || null,
      constellations,
      talents,
      missingTalentBookType: !bookType,
      genshinDbId: raw.id != null ? String(raw.id) : null,
      gender: raw.gender || null,
      bodyType: raw.bodyType || null,
      associationType: raw.associationType || null,
      qualityType: raw.qualityType || null,
      birthdaymmdd: raw.birthdaymmdd || null,
      raw, // lưu nguyên object gốc, phòng thiếu field khác sau này
    };

    return characterData;
  } catch (err) {
    console.warn(`⚠️ Crawl failed for "${name}":`, (err as Error).message);
    return null;
  }
}

/**
 * Main crawl function
 */
async function crawlCharacters() {
  console.log("🔄 Bắt đầu crawl dữ liệu nhân vật từ genshin-db...");

  const names = genshindb.characters("names", { matchCategories: true }) as string[];
  console.log(`📋 Tìm thấy ${names.length} nhân vật.`);

  const characters: CharacterData[] = [];
  let missingBookType: string[] = [];

  for (const name of names) {
    const data = crawlCharacter(name);
    if (data) {
      characters.push(data);
      if (data.missingTalentBookType) {
        missingBookType.push(data.name);
      }
    }
  }

  const outputPath = path.join(DATA_RAW_DIR, "characters.json");
  fs.writeFileSync(outputPath, JSON.stringify(characters, null, 2));
  console.log(`✅ Đã lưu ${characters.length} nhân vật vào ${outputPath}`);

  const manifest = {
    timestamp: new Date().toISOString(),
    totalCharacters: characters.length,
    missingTalentBookType: missingBookType,
    source: "genshin-db",
    version: require("genshin-db/package.json").version,
  };
  const manifestPath = path.join(DATA_RAW_DIR, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`📄 Đã lưu manifest vào ${manifestPath}`);

  if (missingBookType.length) {
    console.warn(
      `\n⚠ ${missingBookType.length} nhân vật thiếu talent book type:\n` +
      missingBookType.map((n) => `   - ${n}`).join("\n") +
      `\n→ Cập nhật scripts/data/talent-book-mapping.json và chạy lại crawl.`
    );
  }

  console.log("🎉 Crawl hoàn tất!");
}

crawlCharacters().catch((err) => {
  console.error("❌ Crawl thất bại:", err);
  process.exit(1);
});