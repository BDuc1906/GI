import { createRequire } from "module";
import { prisma } from "../src/lib/prisma";
import { getEnkaUrl, getElementIconUrl, slugify, upsertMaterial } from "./lib/seed-helpers";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

/**
 * Traveler có nhiều biến thể nguyên tố, nhưng genshin-db KHÔNG lưu key
 * "Traveler (Boy)" / "Traveler (Girl)" trong characters() — đã verify trực
 * tiếp bằng cách cài genshin-db thật và chạy:
 *
 *   db.characters('names', { matchCategories: true })
 *     .filter(n => /traveler|aether|lumine/i.test(n))
 *   // -> [ 'Aether', 'Lumine' ]
 *   db.characters('Traveler (Boy)') // -> undefined
 *
 * Tên thật để tra THÔNG TIN NHÂN VẬT (stat/ảnh/mô tả) là "Aether"/"Lumine".
 *
 * NHƯNG thiên phú + cung mệnh lại nằm ở một namespace KHÁC hẳn trong
 * genshin-db — talents()/constellations() không nhận "Aether"/"Lumine"
 * (trả về undefined) mà nhận đúng "Traveler (Anemo)", "Traveler (Pyro)"...
 * (đã verify bằng db.talents('names',{matchCategories:true}) ra đúng 7 tên
 * theo nguyên tố). Vì vậy 2 loại dữ liệu này phải tra bằng 2 tên khác nhau.
 *
 * Nguyên liệu đột phá (costs) của Traveler dùng chung 1 bộ nguyên liệu cho
 * mọi nguyên tố trong game thật (đá "Brilliant Diamond" + "Windwheel
 * Aster", không đổi theo vision) — đã verify qua characters('Aether').costs
 * — nên lấy từ Aether/Lumine áp dụng chung cho cả 7 biến thể là chính xác,
 * không phải giới hạn/xấp xỉ.
 */
const TRAVELER_ELEMENTS = ["Anemo", "Geo", "Electro", "Dendro", "Hydro", "Pyro", "Cryo"] as const;

const TRAVELER_QUERY_NAME: Record<"Traveler (Boy)" | "Traveler (Girl)", string> = {
  "Traveler (Boy)": "Aether",
  "Traveler (Girl)": "Lumine",
};

/**
 * Tên field thiên phú THẬT trong genshin-db (verify bằng
 * `db.talents('Kaeya')` -> keys: combat1, combat2, combat3, passive1..3;
 * một số nhân vật như Mona có thêm combatsp = kỹ năng di chuyển đặc biệt).
 */
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

async function getTalentsAndConstellations(
  characterName: string
): Promise<{ talents: unknown; constellations: unknown }> {
  try {
    const hasTalentsFn = typeof (genshindb as any).talents === "function";
    const hasConstellationsFn = typeof (genshindb as any).constellations === "function";
    if (!hasTalentsFn && !hasConstellationsFn) {
      console.warn(`⚠ genshindb.talents()/constellations() không có trong version này — bỏ qua "${characterName}"`);
      return { talents: null, constellations: null };
    }

    const rawTalents = hasTalentsFn ? (genshindb as any).talents(characterName) : null;
    // Cung mệnh nằm ở hàm RIÊNG genshindb.constellations(), key c1..c6.
    const rawConstellations = hasConstellationsFn ? (genshindb as any).constellations(characterName) : null;

    const talents = rawTalents
      ? TALENT_FIELD_ORDER
          .map((rawKey) =>
            rawTalents[rawKey]
              ? { key: TALENT_LABELS[rawKey], name: rawTalents[rawKey].name ?? null, description: rawTalents[rawKey].description ?? null }
              : null
          )
          .filter(Boolean)
      : [];

    const constellations = rawConstellations
      ? Array.from({ length: 6 }, (_, i) => {
          const cst = rawConstellations[`c${i + 1}`];
          return cst ? { level: i + 1, name: cst.name ?? null, description: cst.description ?? null } : null;
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

/**
 * Nguyên liệu đột phá — genshin-db trả về ở `characters(name).costs`, dạng
 * { ascend1: [{name,count}...], ..., ascend6: [...] }.
 *
 * Giờ upsert từng nguyên liệu vào bảng Material riêng (xem seed-helpers.ts:
 * upsertMaterial) và lưu kèm materialId trong JSON — trang chi tiết nhân
 * vật sẽ join sang Material để lấy icon, thay vì chỉ hiện tên chữ như cũ.
 * Hàm này phải là async vì upsertMaterial gọi DB.
 */
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

/**
 * Bảng chỉ số HP/ATK/DEF theo cấp — mốc 1, và trước/sau đột phá ở mỗi mốc
 * 20/40/50/60/70/80, kết thúc ở cấp 90.
 */
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

async function seedTraveler(): Promise<number> {
  let count = 0;
  for (const element of TRAVELER_ELEMENTS) {
    for (const genderId of ["Traveler (Boy)", "Traveler (Girl)"] as const) {
      try {
        const queryName = TRAVELER_QUERY_NAME[genderId];
        const talentQueryName = `Traveler (${element})`;

        const c = genshindb.characters(queryName) as any;
        if (!c || !c.name) {
          console.warn(`⚠ genshindb không có dữ liệu cho "${queryName}" — bỏ qua ${genderId}/${element}`);
          continue;
        }

        const lvl1 = typeof c.stats === "function" ? c.stats(1) : null;
        const id = slugify(`${genderId}-${element}`);
        const { talents, constellations } = await getTalentsAndConstellations(talentQueryName);

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

export async function seedCharacters(): Promise<void> {
  const names = genshindb.characters("names", { matchCategories: true }) as string[];
  let count = 0;

  for (const name of names) {
    // "Aether"/"Lumine" là tên riêng của Traveler trong danh sách names —
    // chặn theo tên riêng để tránh trùng với record do seedTraveler() tạo.
    if (name.includes("Traveler") || name === "Aether" || name === "Lumine") continue;

    try {
      const c = genshindb.characters(name) as any;
      if (!c || !c.name || !c.rarity) continue;

      const lvl1 = typeof c.stats === "function" ? c.stats(1) : null;
      const { talents, constellations } = await getTalentsAndConstellations(name);

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
}