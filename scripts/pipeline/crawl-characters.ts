
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
} catch {
  // Không dùng tới lỗi cụ thể — chỉ cần biết đọc thất bại để rơi về
  // mapping rỗng, xem cảnh báo bên dưới.
  console.warn(`⚠️ Không đọc được ${mappingPath}, sử dụng mapping rỗng.`);
}

const resolveTalentBook = createTalentBookResolver(talentBookSeriesByCharacter);
const bossMaterialNames = buildBossMaterialNameSet(genshindb);

// Gom tên nhân vật đã gặp `raw.url` với cấu trúc lạ (không có key
// "fandom") — in ra 1 lần cảnh báo tổng ở cuối script thay vì spam từng
// dòng khi crawl 122 nhân vật, để không bị chìm giữa log bình thường
// nhưng vẫn chắc chắn không bị bỏ sót nếu genshin-db đổi cấu trúc.
const wikiUrlShapeWarnings: string[] = [];

/**
 * Trích URL wiki thật từ field `raw.url` của genshin-db.
 *
 * ĐÃ XÁC MINH BẰNG DỮ LIỆU THẬT (data/inspect/character-sample-full.json,
 * nhân vật Hu Tao): `raw.url` không phải string mà là object dạng
 * `{ fandom: "https://genshin-impact.fandom.com/wiki/Hu_Tao" }`. Đây LÀ
 * hình dạng chuẩn của genshin-db, không phải dữ liệu lỗi/không đồng nhất
 * — nhân vật không có wiki thì `raw.url` là `undefined`, không phải
 * object rỗng.
 *
 * Nếu genshin-db đổi cấu trúc trong tương lai (vd đổi key "fandom" thành
 * tên khác, hoặc thêm nguồn thứ 2 như "hoyolab"), hàm này KHÔNG âm thầm
 * trả về null — nó cố lấy giá trị string đầu tiên tìm được trong object
 * (đủ dùng ngay, không mất dữ liệu) VÀ ghi lại tên nhân vật vào
 * `wikiUrlShapeWarnings` để in cảnh báo rõ ràng ở cuối lần crawl, thay vì
 * lặng lẽ mất dữ liệu như bug gốc.
 */
function extractWikiUrl(rawUrl: unknown, characterName: string): string | null {
  if (rawUrl === undefined || rawUrl === null) return null;
  if (typeof rawUrl === "string") return rawUrl;

  if (typeof rawUrl === "object") {
    const obj = rawUrl as Record<string, unknown>;
    if (typeof obj.fandom === "string") return obj.fandom;

    // Cấu trúc lạ, không có "fandom" như mong đợi — vẫn cố cứu dữ liệu
    // bằng cách lấy giá trị string đầu tiên tìm được trong object, đồng
    // thời gắn cờ cảnh báo để không bị lặp lại âm thầm lần sau.
    const firstStringValue = Object.values(obj).find((v): v is string => typeof v === "string");
    wikiUrlShapeWarnings.push(characterName);
    return firstStringValue ?? null;
  }

  wikiUrlShapeWarnings.push(characterName);
  return null;
}

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
      // BUG ĐÃ SỬA (2026-09) — SỬA ĐÚNG BẢN CHẤT, không phải né tránh:
      // genshin-db trả `raw.url` LUÔN Ở DẠNG OBJECT, vd
      // { fandom: "https://genshin-impact.fandom.com/wiki/Hu_Tao" } —
      // không phải string như code cũ giả định. Field `raw.url || null`
      // trước đây "tình cờ" chạy đúng cho nhân vật KHÔNG có wiki URL
      // (raw.url === undefined -> null, Prisma vui), nhưng với 49/122
      // nhân vật CÓ wiki URL thật, nó gán nguyên Object vào cột String?
      // khiến Prisma từ chối và crash TOÀN BỘ record nhân vật đó (không
      // chỉ riêng field wikiUrl) — xác nhận bằng cách in thử
      // data/inspect/character-sample-full.json.
      //
      // Đã kiểm tra: hiện genshin-db chỉ thấy dùng key con "fandom" cho
      // nguồn wiki duy nhất. Trích đúng chuỗi đó ra thay vì vứt bỏ dữ
      // liệu thật; nếu tương lai genshin-db đổi cấu trúc key (vd thêm
      // "hoyolab") mà không khớp "fandom", in cảnh báo ra console để lộ
      // ra ngay lần crawl kế tiếp thay vì âm thầm mất dữ liệu lần nữa.
      wikiUrl: extractWikiUrl(raw.url, raw.name),
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
  // SỬA (lint prefer-const): chỉ .push() vào mảng này, không bao giờ
  // gán lại chính biến `missingBookType` — dùng const.
  const missingBookType: string[] = [];

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

  if (wikiUrlShapeWarnings.length) {
    console.warn(
      `\n⚠ ${wikiUrlShapeWarnings.length} nhân vật có raw.url cấu trúc KHÁC key "fandom" đã biết:\n` +
      wikiUrlShapeWarnings.map((n) => `   - ${n}`).join("\n") +
      `\n→ genshin-db có thể đã đổi cấu trúc url. Kiểm tra data/inspect/character-sample-full.json ` +
      `cho các nhân vật này, cập nhật extractWikiUrl() trong file này nếu cần.`
    );
  }

  console.log("🎉 Crawl hoàn tất!");
}

crawlCharacters().catch((err) => {
  console.error("❌ Crawl thất bại:", err);
  process.exit(1);
});
