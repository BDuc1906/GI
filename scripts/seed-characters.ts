import { createRequire } from "module";
import { prisma } from "../src/lib/prisma";
import { getEnkaUrl, getElementIconUrl, slugify, upsertMaterial } from "./lib/seed-helpers";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

const TRAVELER_ELEMENTS = ["Anemo", "Geo", "Electro", "Dendro", "Hydro", "Pyro", "Cryo"] as const;
const TRAVELER_QUERY_NAME: Record<"Traveler (Boy)" | "Traveler (Girl)", string> = {
  "Traveler (Boy)": "Aether",
  "Traveler (Girl)": "Lumine",
};

const TALENT_FIELD_ORDER = [
  "combat1", "combat2", "combatsp", "combat3",
  "passive1", "passive2", "passive3", "passive4",
] as const;
const TALENT_LABELS: Record<string, string> = {
  combat1: "normalAttack",
  combat2: "elementalSkill",
  combatsp: "alternateSprint",
  combat3: "elementalBurst",
  passive1: "passive1",
  passive2: "passive2",
  passive3: "passive3",
  passive4: "passive4",
};

// ---- Công thức số lượng ----
const TALENT_LEVEL_COSTS: Record<number, {
  bookTier: "teachings" | "guide" | "philosophies";
  bookCount: number;
  bossCount?: number;
  crown?: boolean;
  mora: number;
}> = {
  2: { bookTier: "teachings", bookCount: 3, mora: 12500 },
  3: { bookTier: "guide", bookCount: 2, mora: 17500 },
  4: { bookTier: "guide", bookCount: 4, mora: 25000 },
  5: { bookTier: "guide", bookCount: 6, mora: 30000 },
  6: { bookTier: "guide", bookCount: 9, mora: 37500 },
  7: { bookTier: "philosophies", bookCount: 4, bossCount: 1, mora: 120000 },
  8: { bookTier: "philosophies", bookCount: 6, bossCount: 1, mora: 260000 },
  9: { bookTier: "philosophies", bookCount: 12, bossCount: 2, mora: 450000 },
  10: { bookTier: "philosophies", bookCount: 16, bossCount: 2, crown: true, mora: 700000 },
};

// Danh sách nhân vật không resolve được bookType — in tổng kết ở cuối
// run thay vì chỉ rải rác từng dòng warn (dễ bị lướt qua khi log dài).
const CHARACTERS_MISSING_BOOK_TYPE: string[] = [];

// ---- Hàm tạo talentMaterials ----
async function generateTalentMaterials(
  bookType: string | null,
  bossMaterialName: string | null,
  characterLabel: string
): Promise<any[]> {
  if (!bookType) {
    console.warn(`⚠ [${characterLabel}] Skipped talent materials: no book type`);
    CHARACTERS_MISSING_BOOK_TYPE.push(characterLabel);
    return [];
  }

  const result: any[] = [];
  const bookNames = {
    teachings: `Teachings of ${bookType}`,
    guide: `Guide to ${bookType}`,
    philosophies: `Philosophies of ${bookType}`,
  };

  for (let level = 2; level <= 10; level++) {
    const cost = TALENT_LEVEL_COSTS[level];
    if (!cost) continue;

    const materials: Array<{ name: string; count: number }> = [
      { name: bookNames[cost.bookTier], count: cost.bookCount },
      { name: "Mora", count: cost.mora },
    ];

    if (cost.bossCount) {
      if (bossMaterialName) {
        materials.push({ name: bossMaterialName, count: cost.bossCount });
      } else {
        // Không silent-skip nữa: level này CẦN nguyên liệu boss nhưng không
        // resolve được tên -> dữ liệu materials của level này sẽ thiếu 1 mục.
        // In cảnh báo để ai đọc log biết rõ, thay vì tưởng data đã đủ.
        console.warn(`  ⚠ Level ${level}: cần ${cost.bossCount} nguyên liệu boss nhưng không xác định được tên (bỏ qua mục này)`);
      }
    }

    if (cost.crown) {
      materials.push({ name: "Crown of Insight", count: 1 });
    }

    const materialsWithIds = [];
    for (const mat of materials) {
      const materialId = await upsertMaterial(prisma, genshindb, mat.name);
      materialsWithIds.push({ materialId, name: mat.name, count: mat.count });
    }

    result.push({ level, materials: materialsWithIds });
  }

  return result;
}

// Danh sách đầy đủ tên series sách talent, verify qua nhiều nguồn (Fandom wiki +
// các trang tổng hợp material), theo từng vùng đã ra mắt tính đến bản game hiện tại:
//   Mondstadt: Freedom, Resistance, Ballad
//   Liyue:     Prosperity, Diligence, Gold
//   Inazuma:   Transience, Elegance, Light
//   Sumeru:    Admonition, Ingenuity, Praxis
//   Fontaine:  Equity, Justice, Order
//   Natlan:    Contention, Kindling, Conflict, Moonlight, Elysium, Vagrancy
const KNOWN_TALENT_BOOK_SERIES = [
  "Freedom", "Resistance", "Ballad",
  "Prosperity", "Diligence", "Gold",
  "Transience", "Elegance", "Light",
  "Admonition", "Ingenuity", "Praxis",
  "Equity", "Justice", "Order",
  "Contention", "Kindling", "Conflict",
  "Moonlight", "Elysium", "Vagrancy",
] as const;

// ---- Lấy loại sách talent ----
//
// LƯU Ý: đã thử 2 cách và cả 2 đều sai/không dùng được, giữ lại ghi chú để
// không ai lặp lại sai lầm cũ:
//   1) characterData.talentMaterialType / talentBook -> KHÔNG tồn tại field
//      này trên Character object (verify bằng debug-traveler.ts, xem toàn bộ
//      keys thật: id, name, title, description, weaponType, weaponText,
//      bodyType, gender, qualityType, rarity, birthdaymmdd, birthday,
//      elementType, elementText, affiliation, associationType, region,
//      substatType, substatText, constellation, cv, costs, images, url,
//      stats, version — không có gì liên quan đến talent book).
//   2) talentmaterialtypes("names", {matchCategories:true}) rồi đọc field
//      .characters -> function này không hỗ trợ query kiểu đó trong bản
//      genshin-db đang dùng (throw "not iterable" khi chạy debug-traveler.ts).
//
// CÁCH ĐÚNG (theo README chính thức của genshin-db): "talent level-up
// material types" là một category HỢP LỆ của chính hàm characters(), tức
// gọi genshindb.characters("Freedom", { matchCategories: true }) sẽ trả về
// mảng TÊN các nhân vật dùng sách Freedom.
//
// Thay vì gọi lại genshindb cho từng nhân vật (130 nhân vật x 21 series =
// ~2700 lần gọi thừa), build 1 map ngược MỘT LẦN lúc khởi động module:
// tên nhân vật (lowercase) -> tên series. Sau đó tra cứu chỉ là map lookup.
const CHARACTER_TO_BOOK_SERIES: Map<string, string> = (() => {
  const map = new Map<string, string>();
  for (const series of KNOWN_TALENT_BOOK_SERIES) {
    try {
      const namesInSeries = genshindb.characters(series, { matchCategories: true }) as string[] | undefined;
      for (const n of namesInSeries ?? []) {
        map.set(n.toLowerCase(), series);
      }
    } catch {
      // Series này chưa có data / chưa được category hóa trong bản data hiện
      // tại (vd nội dung quá mới) -> bỏ qua, không ảnh hưởng các series khác.
    }
  }
  return map;
})();

function getTalentBookType(characterNameOrCandidates: string | string[]): string | null {
  const candidates = Array.isArray(characterNameOrCandidates) ? characterNameOrCandidates : [characterNameOrCandidates];
  for (const candidate of candidates) {
    const found = CHARACTER_TO_BOOK_SERIES.get(candidate.toLowerCase());
    if (found) return found;
  }
  return null;
}

// ---- Lấy boss material (nguyên liệu từ boss tuần) ----
//
// Cũng như trên: `talentBoss`, `bossMaterial`, `weeklyBoss` không phải field
// thật trên Character object — genshin-db không gắn sẵn thông tin boss vào
// character. KHÔNG có cách nào data-driven đáng tin để suy luận boss material
// từ package này, nên trả về null thay vì đoán mò field không tồn tại.
//
// Nếu sau này cần data này thật sự, phải lấy từ nguồn khác (vd tự map tay
// theo nhân vật, hoặc domain data của genshin-db nếu có) — không nên "đoán
// field cho có" như bản cũ vì nó tạo cảm giác đang hoạt động trong khi thực
// chất luôn trả về null.
//
// Riêng Traveler: Traveler KHÔNG dùng nguyên liệu boss tuần cho cả ascension
// lẫn talent — đây là đặc điểm THIẾT KẾ CHÍNH THỨC của nhân vật này trong
// game (xác nhận qua nhiều nguồn wiki), không phải bug. Vì vậy null cho
// Traveler ở mục này là ĐÚNG, không cần "sửa".
function getBossMaterialName(_characterData: any): string | null {
  return null;
}

// ---- Các hàm khác (giữ nguyên) ----
async function getTalentsAndConstellations(characterName: string): Promise<{
  talents: unknown;
  constellations: unknown;
}> {
  try {
    const rawTalents = typeof (genshindb as any).talents === "function"
      ? (genshindb as any).talents(characterName)
      : null;
    const rawConstellations = typeof (genshindb as any).constellations === "function"
      ? (genshindb as any).constellations(characterName)
      : null;

    const talents = rawTalents
      ? TALENT_FIELD_ORDER
          .map((rawKey) =>
            rawTalents[rawKey]
              ? {
                  key: TALENT_LABELS[rawKey],
                  name: rawTalents[rawKey].name ?? null,
                  description: rawTalents[rawKey].description ?? null,
                }
              : null
          )
          .filter(Boolean)
      : [];

    const constellations = rawConstellations
      ? Array.from({ length: 6 }, (_, i) => {
          const cst = rawConstellations[`c${i + 1}`];
          return cst
            ? { level: i + 1, name: cst.name ?? null, description: cst.description ?? null }
            : null;
        }).filter(Boolean)
      : [];

    return {
      talents: talents.length ? JSON.parse(JSON.stringify(talents)) : null,
      constellations: constellations.length ? JSON.parse(JSON.stringify(constellations)) : null,
    };
  } catch (err) {
    console.warn(`⚠ Could not fetch talents/constellations for "${characterName}":`, (err as Error).message);
    return { talents: null, constellations: null };
  }
}

async function getAscensionMaterials(costs: unknown): Promise<unknown> {
  if (!costs || typeof costs !== "object") return null;
  const raw = costs as Record<string, Array<{ name?: string; count?: number }>>;
  const phases = [];
  for (const phase of [1, 2, 3, 4, 5, 6]) {
    const items = raw[`ascend${phase}`];
    if (!Array.isArray(items) || items.length === 0) continue;
    const materials = [];
    for (const m of items) {
      if (!m || !m.name) continue;
      const materialId = await upsertMaterial(prisma, genshindb, m.name);
      materials.push({ materialId, name: m.name, count: m.count ?? null });
    }
    if (materials.length > 0) phases.push({ phase, materials });
  }
  return phases.length ? JSON.parse(JSON.stringify(phases)) : null;
}

const STAT_BREAKPOINTS: Array<[number, "-" | "+" | undefined]> = [
  [1, undefined],
  [20, "-"], [20, "+"],
  [40, "-"], [40, "+"],
  [50, "-"], [50, "+"],
  [60, "-"], [60, "+"],
  [70, "-"], [70, "+"],
  [80, "-"], [80, "+"],
  [90, undefined],
];

function getStatsByLevel(statsFn: unknown): unknown {
  if (typeof statsFn !== "function") return null;
  try {
    const rows = STAT_BREAKPOINTS.map(([level, ascension]) => {
      const s = ascension ? (statsFn as any)(level, ascension) : (statsFn as any)(level);
      if (!s) return null;
      return {
        level: s.level ?? level,
        ascension: s.ascension ?? null,
        hp: s.hp ?? null,
        attack: s.attack ?? null,
        defense: s.defense ?? null,
        specialized: s.specialized ?? null,
      };
    }).filter(Boolean);
    return rows.length ? JSON.parse(JSON.stringify(rows)) : null;
  } catch {
    return null;
  }
}

// ----- Seed Traveler -----
async function seedTraveler(): Promise<number> {
  let count = 0;
  for (const element of TRAVELER_ELEMENTS) {
    for (const genderId of ["Traveler (Boy)", "Traveler (Girl)"] as const) {
      try {
        const queryName = TRAVELER_QUERY_NAME[genderId];
        const talentQueryName = `Traveler (${element})`;

        // Đã verify bằng debug-traveler.ts: genshin-db KHÔNG có record riêng
        // theo từng nguyên tố (genshindb.characters("Traveler (Anemo)") ===
        // undefined). Chỉ có 1 record chung "Aether"/"Lumine" — dùng đúng cái
        // đó, không cố tìm record theo element nữa (giả định lần sửa trước là sai).
        const c = genshindb.characters(queryName) as any;
        if (!c || !c.name) continue;

        const lvl1 = typeof c.stats === "function" ? c.stats(1) : null;
        const id = slugify(`${genderId}-${element}`);
        const { talents, constellations } = await getTalentsAndConstellations(talentQueryName);

        // Chưa chắc genshin-db liệt kê Traveler trong category sách bằng tên
        // nào, nên thử nhiều ứng viên: "Traveler (Anemo)", "Anemo Traveler",
        // "Traveler", và tên gốc "Aether"/"Lumine".
        const bookType = getTalentBookType([
          talentQueryName,
          `${element} Traveler`,
          "Traveler",
          queryName,
        ]);
        const bossName = getBossMaterialName(c); // luôn null cho Traveler — xem giải thích ở định nghĩa hàm
        const talentMaterials = await generateTalentMaterials(bookType, bossName, talentQueryName);

        console.log(`[Traveler ${element}] bookType: ${bookType}, boss: ${bossName}, materials: ${talentMaterials.length}`);

        const payload = {
          name: `${c.name} (${element})`,
          title: c.title || null,
          vision: element,
          weaponType: c.weaponText || "Sword",
          rarity: 5,
          region: c.region || null,
          affiliation: c.affiliation || null,
          description: c.description || null,
          iconUrl: getEnkaUrl(c.images?.filename_icon, c.images?.mihoyo_icon),
          sideIconUrl: getEnkaUrl(c.images?.filename_sideIcon, c.images?.mihoyo_sideIcon),
          splashUrl: getEnkaUrl(c.images?.filename_gachaSplash, c.images?.mihoyo_gachaSplash),
          elementIcon: getElementIconUrl(element),
          baseHp: lvl1?.hp ?? null,
          baseAtk: lvl1?.attack ?? null,
          baseDef: lvl1?.defense ?? null,
          ascensionStat: c.substatText || null,
          ascensionMaterials: (await getAscensionMaterials(c.costs)) as any,
          statsByLevel: getStatsByLevel(c.stats) as any,
          birthday: c.birthday || null,
          constellationName: c.constellation || null,
          voiceActors: c.cv ? (JSON.parse(JSON.stringify(c.cv)) as any) : null,
          gameVersion: c.version || null,
          wikiUrl: c.url?.fandom || null,
          talents: talents as any,
          constellations: constellations as any,
          talentMaterials: talentMaterials as any,
        };

        await prisma.character.upsert({
          where: { id },
          create: { id, ...payload },
          update: payload,
        });
        count++;
      } catch (err) {
        console.warn(`⚠ Skipped Traveler variant ${genderId}/${element}:`, (err as Error).message);
      }
    }
  }
  return count;
}

// ----- Seed Characters -----
export async function seedCharacters(): Promise<void> {
  const names = genshindb.characters("names", { matchCategories: true }) as string[];
  let count = 0;

  for (const name of names) {
    if (name.includes("Traveler") || name === "Aether" || name === "Lumine") continue;

    try {
      const c = genshindb.characters(name) as any;
      if (!c || !c.name || !c.rarity) continue;

      const lvl1 = typeof c.stats === "function" ? c.stats(1) : null;
      const { talents, constellations } = await getTalentsAndConstellations(name);

      // Lấy loại sách và boss — data-driven qua reverse-lookup map (xem
      // CHARACTER_TO_BOOK_SERIES ở trên), không đoán field không tồn tại
      const bookType = getTalentBookType(name);
      const bossName = getBossMaterialName(c);
      const talentMaterials = await generateTalentMaterials(bookType, bossName, name);

      console.log(`[${name}] bookType: ${bookType}, boss: ${bossName}, materials: ${talentMaterials.length}`);

      const payload = {
        name: c.name,
        title: c.title || null,
        vision: c.elementText || "None",
        weaponType: c.weaponText || "Unknown",
        rarity: parseInt(c.rarity as unknown as string, 10) || 4,
        region: c.region || null,
        affiliation: c.affiliation || null,
        description: c.description || null,
        iconUrl: getEnkaUrl(c.images?.filename_icon, c.images?.mihoyo_icon),
        sideIconUrl: getEnkaUrl(c.images?.filename_sideIcon, c.images?.mihoyo_sideIcon),
        splashUrl: getEnkaUrl(c.images?.filename_gachaSplash, c.images?.mihoyo_gachaSplash),
        elementIcon: getElementIconUrl(c.elementText),
        baseHp: lvl1?.hp ?? null,
        baseAtk: lvl1?.attack ?? null,
        baseDef: lvl1?.defense ?? null,
        ascensionStat: c.substatText || null,
        ascensionMaterials: (await getAscensionMaterials(c.costs)) as any,
        statsByLevel: getStatsByLevel(c.stats) as any,
        birthday: c.birthday || null,
        constellationName: c.constellation || null,
        voiceActors: c.cv ? (JSON.parse(JSON.stringify(c.cv)) as any) : null,
        gameVersion: c.version || null,
        wikiUrl: c.url?.fandom || null,
        talents: talents as any,
        constellations: constellations as any,
        talentMaterials: talentMaterials as any,
      };

      const id = slugify(c.name);
      await prisma.character.upsert({
        where: { id },
        create: { id, ...payload },
        update: payload,
      });
      count++;
    } catch (err) {
      console.warn(`⚠ Skipped character "${name}":`, (err as Error).message);
    }
  }

  count += await seedTraveler();
  console.log(`✔ Seeded ${count} characters (including Traveler variants)`);

  if (CHARACTERS_MISSING_BOOK_TYPE.length) {
    console.warn(
      `\n⚠ ${CHARACTERS_MISSING_BOOK_TYPE.length} nhân vật KHÔNG resolve được talent book type ` +
      `(talentMaterials sẽ rỗng cho các nhân vật này):`
    );
    console.warn(CHARACTERS_MISSING_BOOK_TYPE.map((n) => `   - ${n}`).join("\n"));
    console.warn(
      `→ Chạy "npx tsx scripts/debug-traveler.ts" để soi cấu trúc data thật của genshin-db\n` +
      `  và xác nhận tên nhân vật/tên sách đang khớp đúng chưa trước khi seed lại.`
    );
  } else {
    console.log("✔ Mọi nhân vật đều resolve được talent book type.");
  }
}