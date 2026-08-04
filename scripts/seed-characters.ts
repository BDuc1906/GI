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

// (Danh sách 21 series sách talent — giữ trong comment của
// TALENT_BOOK_SERIES_BY_CHARACTER bên dưới, không cần mảng riêng nữa vì đã
// chuyển sang map tĩnh theo từng nhân vật.)

// ---- Lấy loại sách talent ----
//
// ĐÃ KIỂM CHỨNG QUA 3 LẦN THỬ (xem debug-talent-book*.ts và lịch sử sửa lỗi):
// genshin-db KHÔNG có bất kỳ field/hàm nào map "nhân vật -> series sách
// talent". Đã thử: characterData.talentBook (không tồn tại field),
// genshindb.characters(series, {matchCategories:true}) (chạy được nhưng
// CHO KẾT QUẢ SAI — ví dụ trả "Order" cho Albedo, đúng ra phải là "Ballad"),
// và genshindb.talentmaterialtype(s) (luôn trả undefined khi gọi bằng tên
// nhân vật — hàm này không hoạt động theo cách đó trong bản data hiện tại).
//
// GIẢI PHÁP: bảng tĩnh, tra cứu và đối chiếu tay từng nhân vật qua Genshin
// Impact Fandom Wiki (trang "<Series> Book" của từng series, vd
// https://genshin-impact.fandom.com/wiki/Freedom_Book — các trang này liệt
// kê đầy đủ, có đếm số lượng nhân vật để tự kiểm tra chéo). Dữ liệu này
// KHÔNG đổi theo thời gian (nhân vật ra mắt dùng sách nào thì dùng mãi sách
// đó), chỉ cần bổ sung dòng mới khi có nhân vật mới ra mắt.
//
// Bảng dưới đây đã đối chiếu ngày viết code, nhưng vẫn có thể thiếu nhân vật
// rất mới hoặc nhân vật Natlan/Nod-Krai chưa đủ dữ liệu công khai — những
// nhân vật không có trong bảng sẽ hiện trong CHARACTERS_MISSING_BOOK_TYPE ở
// cuối log seed, KHÔNG bị âm thầm bỏ qua.
const TALENT_BOOK_SERIES_BY_CHARACTER: Record<string, string> = {
  // Mondstadt — Freedom / Resistance / Ballad
  "Amber": "Freedom", "Barbara": "Freedom", "Sucrose": "Freedom", "Klee": "Freedom",
  "Diona": "Freedom", "Tartaglia": "Freedom", "Aloy": "Freedom", "Varka": "Freedom",
  "Bennett": "Resistance", "Diluc": "Resistance", "Eula": "Resistance", "Jean": "Resistance",
  "Mona": "Resistance", "Noelle": "Resistance", "Razor": "Resistance",
  "Albedo": "Ballad", "Dahlia": "Ballad", "Durin": "Ballad", "Fischl": "Ballad",
  "Kaeya": "Ballad", "Lisa": "Ballad", "Mika": "Ballad", "Rosaria": "Ballad", "Venti": "Ballad",

  // Liyue — Prosperity / Diligence / Gold
  "Gaming": "Prosperity", "Keqing": "Prosperity", "Ningguang": "Prosperity", "Qiqi": "Prosperity",
  "Shenhe": "Prosperity", "Xiao": "Prosperity", "Yelan": "Prosperity",
  "Chongyun": "Diligence", "Ganyu": "Diligence", "Hu Tao": "Diligence",
  "Kaedehara Kazuha": "Diligence", "Lan Yan": "Diligence", "Xiangling": "Diligence",
  "Yaoyao": "Diligence", "Yun Jin": "Diligence",
  "Beidou": "Gold", "Xingqiu": "Gold", "Zhongli": "Gold", "Xinyan": "Gold",
  "Yanfei": "Gold", "Baizhu": "Gold", "Xianyun": "Gold",

  // Inazuma — Transience / Elegance / Light
  "Kirara": "Transience", "Sangonomiya Kokomi": "Transience", "Shikanoin Heizou": "Transience",
  "Thoma": "Transience", "Yoimiya": "Transience", "Yumemizuki Mizuki": "Transience",
  "Arataki Itto": "Elegance", "Kamisato Ayaka": "Elegance", "Kamisato Ayato": "Elegance",
  "Kujou Sara": "Elegance", "Kuki Shinobu": "Elegance",
  "Chiori": "Light", "Gorou": "Light", "Raiden Shogun": "Light", "Sayu": "Light", "Yae Miko": "Light",

  // Sumeru — Admonition / Ingenuity / Praxis
  "Candace": "Admonition", "Cyno": "Admonition", "Faruzan": "Admonition", "Tighnari": "Admonition",
  "Alhaitham": "Ingenuity", "Dori": "Ingenuity", "Kaveh": "Ingenuity", "Layla": "Ingenuity", "Nahida": "Ingenuity",
  "Collei": "Praxis", "Dehya": "Praxis", "Nilou": "Praxis", "Sethos": "Praxis", "Wanderer": "Praxis",

  // Fontaine — Equity / Justice / Order
  "Lyney": "Equity", "Navia": "Equity", "Neuvillette": "Equity", "Sigewinne": "Equity",
  "Charlotte": "Justice", "Clorinde": "Justice", "Escoffier": "Justice", "Freminet": "Justice", "Furina": "Justice",
  "Wriothesley": "Order", "Chevreuse": "Order", "Emilie": "Order", "Arlecchino": "Order", "Lynette": "Order",

  // Natlan — Contention / Kindling / Conflict
  "Skirk": "Contention", "Mualani": "Contention", "Mavuika": "Contention",
  "Kinich": "Kindling", "Xilonen": "Kindling", "Ororon": "Kindling",
  "Chasca": "Conflict", "Citlali": "Conflict", "Iansan": "Conflict",
  // Kachina/Ifa/Ineffa/Varesa dùng Conflict — xác nhận qua Fandom "Guide to
  // Conflict" (liệt kê đích danh 6 người dùng series này: Chasca, Ifa,
  // Ineffa, Kachina, Traveler Pyro, Varesa), tháng 8/2026.
  "Kachina": "Conflict", "Ifa": "Conflict", "Ineffa": "Conflict", "Varesa": "Conflict",

  // Nod-Krai — Moonlight / Elysium / Vagrancy (domain "Lightless Capital",
  // xác nhận qua Fandom + Game8, tháng 7/2026). Nefer dùng Elysium — xác
  // nhận qua gamerant.com. Sandrone dùng Vagrancy — xác nhận qua Game8
  // (Sandrone Ascension and Talent Materials: "The Vagrancy Talent Books
  // can be farmed by completing Nod-Krai's regional Talent Book domain"),
  // tháng 8/2026. CHƯA thêm Aino/Flins/Illuga/Jahoda/Linnea/Lohen/Manekin/
  // Manekina/Nicole/Prune/Zibai vì tại thời điểm viết (8/2026) đây đều là
  // nhân vật mới ra mắt trong 2-5 bản gần nhất (6.3-6.7), CHƯA tìm được
  // trang "Guide to X"/"Teachings of X" trên Fandom liệt kê đích danh họ
  // (khác với Kachina/Ifa/Ineffa/Varesa bên trên, xác nhận được qua đúng
  // trang "Guide to Conflict") — xem CHARACTERS_MISSING_BOOK_TYPE ở cuối
  // log seed để biết nhân vật nào còn thiếu, rồi bổ sung tay khi có nguồn.
  "Columbina": "Moonlight", "Lauma": "Moonlight",
  "Nefer": "Elysium",
  "Sandrone": "Vagrancy",

  // Traveler & Aloy được xử lý riêng (Traveler qua getTalentBookType([...]),
  // Aloy đã có ở trên) — Traveler KHÔNG map ở đây vì tên trong DB khác theo
  // từng nguyên tố, xem seedTraveler() bên dưới.
};

// So sánh trực tiếp theo key nguyên văn (TALENT_BOOK_SERIES_BY_CHARACTER[candidate])
// từng khiến TOÀN BỘ nhân vật rơi vào "no book type" dù tên đã có trong bảng,
// mỗi khi tên do genshin-db trả về lệch với key dù chỉ 1 ký tự (thừa khoảng
// trắng đầu/cuối, khác hoa/thường, hoặc dấu câu unicode khác dạng — ví dụ
// package chuẩn hóa dấu nháy đơn). So sánh nguyên văn không tha thứ bất kỳ
// sai khác nào trong khi mục tiêu chỉ là khớp ĐÚNG NHÂN VẬT.
// -> chuẩn hóa cả 2 phía (bỏ khoảng trắng thừa, viết thường, bỏ dấu) trước
// khi so khớp, dựng 1 lần duy nhất lúc module load để không tốn chi phí mỗi
// lần gọi hàm.
function normalizeCharacterName(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu (diacritics)
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

const TALENT_BOOK_SERIES_BY_NORMALIZED_NAME: Record<string, string> = Object.fromEntries(
  Object.entries(TALENT_BOOK_SERIES_BY_CHARACTER).map(([name, series]) => [
    normalizeCharacterName(name),
    series,
  ])
);

function getTalentBookType(characterNameOrCandidates: string | string[]): string | null {
  const candidates = Array.isArray(characterNameOrCandidates) ? characterNameOrCandidates : [characterNameOrCandidates];
  for (const candidate of candidates) {
    const match = TALENT_BOOK_SERIES_BY_NORMALIZED_NAME[normalizeCharacterName(candidate)];
    if (match) return match;
  }
  // Traveler: mỗi nguyên tố dùng đúng bộ sách của vùng tương ứng (Anemo/Geo
  // dùng Mondstadt "Freedom", Dendro dùng Sumeru "Praxis", v.v.) — nhưng
  // KHÔNG map theo tên "Aether"/"Lumine" vì đó là tên chung cho mọi nguyên tố.
  const TRAVELER_ELEMENT_TO_BOOK: Record<string, string> = {
    Anemo: "Freedom", Geo: "Prosperity", Electro: "Elegance",
    Dendro: "Praxis", Hydro: "Equity", Pyro: "Contention", Cryo: "Ballad",
  };
  for (const candidate of candidates) {
    const match = candidate.match(/Traveler \(([A-Za-z]+)\)/);
    if (match && TRAVELER_ELEMENT_TO_BOOK[match[1]]) return TRAVELER_ELEMENT_TO_BOOK[match[1]];
  }
  return null;
}

// Riêng Traveler: không dùng nguyên liệu boss tuần cho cả ascension lẫn
// talent — đây là thiết kế chính thức của nhân vật (xác nhận qua nhiều
// nguồn wiki). Với Traveler, costs sẽ không chứa material nào khớp
// BOSS_MATERIAL_NAMES nên hàm dưới tự nhiên trả null, không cần case riêng.
//
// LƯU Ý (8/2026): cách cũ dùng genshindb.materials("Boss Material",
// {matchCategories:true}) LUÔN trả undefined — category đó không tồn tại
// trong enum thật của package (chỉ có ADSORBATE/AVATAR_MATERIAL/CONSUME/...,
// xem node_modules/genshin-db/types/folders/materials.d.ts). Mọi nguyên
// liệu đột phá (đá quý, đặc sản vùng, quái thường, boss) đều gộp chung
// "AVATAR_MATERIAL" — không tách được. Hậu quả: BOSS_MATERIAL_NAMES rỗng
// từ đầu, mọi nhân vật đều mất nguyên liệu boss ở cấp 7-10 (bỏ qua âm thầm
// qua đường console.warn "không xác định được tên").
//
// Cách mới: dùng folder `enemies`, lọc enemyType === "BOSS", gộp tên mọi
// item trong rewardPreview của các boss đó (trừ Adventure EXP/Mora/
// Companionship EXP và item có "rarity" — đó là thánh di vật boss rớt,
// không phải nguyên liệu đột phá). Đã test chéo: đúng bắt Everflame Seed/
// Hoarfrost Core, đúng LOẠI Forbidden Curse Scroll/Sealed Scroll (nguyên
// liệu quái THƯỜNG tier cao, không phải boss — nếu dùng heuristic "có ngưỡng
// Lv." sẽ bắt nhầm 2 cái này, xem lịch sử test trong PR liên quan).
const GENERIC_REWARD_NAMES_FOR_BOSS_SCAN = new Set(["Adventure EXP", "Mora", "Companionship EXP"]);
const BOSS_MATERIAL_NAMES: Set<string> = (() => {
  const set = new Set<string>();
  try {
    const enemyNames = (genshindb.enemies("names", { matchCategories: true }) as string[]) ?? [];
    let bossCount = 0;
    for (const n of enemyNames) {
      const e = genshindb.enemies(n) as any;
      if (!e || e.enemyType !== "BOSS") continue;
      bossCount++;
      for (const r of e.rewardPreview ?? []) {
        if (r?.name && !GENERIC_REWARD_NAMES_FOR_BOSS_SCAN.has(r.name) && !r.rarity) {
          set.add(r.name.toLowerCase());
        }
      }
    }
    if (bossCount === 0) {
      console.warn(
        `⚠ Không tìm được enemy nào có enemyType "BOSS" trong genshin-db. ` +
          `Có thể bản package đang cài đã đổi tên field này — kiểm tra ` +
          `genshindb.enemies(genshindb.enemies("names",{matchCategories:true})[0]) để xem shape thật.`
      );
    }
  } catch (err) {
    console.warn(`⚠ Lỗi khi build BOSS_MATERIAL_NAMES từ folder enemies: ${(err as Error).message}`);
  }
  return set;
})();

function getBossMaterialName(costs: unknown): string | null {
  if (!costs || typeof costs !== "object") return null;
  const raw = costs as Record<string, Array<{ name?: string }>>;
  for (const phase of [6, 5, 4, 3, 2, 1]) {
    const items = raw[`ascend${phase}`];
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (item?.name && BOSS_MATERIAL_NAMES.has(item.name.toLowerCase())) {
        return item.name;
      }
    }
  }
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
        const bossName = getBossMaterialName(c.costs); // luôn null cho Traveler — xem giải thích ở định nghĩa hàm
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
      const bossName = getBossMaterialName(c.costs);
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