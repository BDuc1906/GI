console.log("DB đang dùng:", process.env.DATABASE_URL);
import { createRequire } from "module";
import { prisma } from "../src/lib/prisma";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

function getEnkaUrl(filename?: string | null, mihoyoUrl?: string | null): string | null {
  // VERIFY: confirm the exact base path against a known-good filename from
  // your installed genshin-db version — Enka has changed asset paths before.
  if (filename) return `https://enka.network/ui/${filename}.png`;
  if (mihoyoUrl) return mihoyoUrl;
  return null;
}
function getElementIconUrl(element?: string | null): string | null {
  if (!element) return null;
  const name = element.trim();
  if (!name) return null;
  // VERIFY: replace with your actual asset source. Left as null-safe
  // rather than guessing a URL that "looks right" but 404s, since a
  // silently-broken icon is worse than an explicit gap you can fill in.
  const known: Record<string, string> = {
    Anemo: "https://static.wikia.nocookie.net/gensin-impact/images/1/10/Element_Anemo.svg",
    Geo: "https://static.wikia.nocookie.net/gensin-impact/images/9/9b/Element_Geo.svg",
    Electro: "https://static.wikia.nocookie.net/gensin-impact/images/f/ff/Element_Electro.svg",
    Dendro: "https://static.wikia.nocookie.net/gensin-impact/images/7/73/Element_Dendro.svg",
    Hydro: "https://static.wikia.nocookie.net/gensin-impact/images/8/80/Element_Hydro.svg",
    Pyro: "https://static.wikia.nocookie.net/gensin-impact/images/2/2c/Element_Pyro.svg",
    Cryo: "https://static.wikia.nocookie.net/gensin-impact/images/7/72/Element_Cryo.svg",
  };
  return known[name] ?? null;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Traveler has multiple elemental variants and a different data shape than
 * regular playable characters in most genshin-db versions. Rather than
 * dropping it (original behavior), we seed each known variant explicitly.
 * VERIFY: the exact lookup names genshin-db expects for Traveler variants
 * differ by version — some expose "Traveler", others expose element-specific
 * keys. Log `genshindb.characters("names", { matchCategories: true })`
 * and grep for "Traveler" in your actual installed package to confirm the
 * real keys before relying on this list.
 */
const TRAVELER_ELEMENTS = ["Anemo", "Geo", "Electro", "Dendro", "Hydro", "Pyro", "Cryo"] as const;

async function seedTraveler(): Promise<number> {
  let count = 0;
  for (const element of TRAVELER_ELEMENTS) {
    for (const genderId of ["Traveler (Boy)", "Traveler (Girl)"] as const) {
      try {
        const c = genshindb.characters(genderId) as any;
        if (!c || !c.name) continue;

        const lvl1 = typeof c.stats === "function" ? c.stats(1) : null;
        const id = slugify(`${genderId}-${element}`);
        const { talents, constellations } = await getTalentsAndConstellations(genderId);

        const payload = {
          name: `${c.name} (${element})`,
          title: c.title || null,
          vision: element, // element luôn là string ("Anemo", "Geo",...) -> Hợp lệ
          weaponType: c.weaponText || "Sword", // CÁCH 2: Thay null bằng "Sword" (Nhà lữ hành luôn dùng Kiếm)
          rarity: 5,
          region: c.region || null,
          affiliation: c.affiliation || null,
          description: c.description || null,
          iconUrl: getEnkaUrl(c.images?.filename_icon, c.images?.mihoyo_icon),
          splashUrl: getEnkaUrl(c.images?.filename_gachaSplash, c.images?.mihoyo_gachaSplash),
          elementIcon: getElementIconUrl(element),
          baseHp: lvl1?.hp ?? null,
          baseAtk: lvl1?.attack ?? null,
          baseDef: lvl1?.defense ?? null,
          ascensionStat: c.substatText || null,
          talents: talents as any, // ép kiểu Json để tránh TypeScript phàn nàn
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

const TALENT_KEYS = ["normalAttack", "elementalSkill", "elementalBurst", "passive1", "passive2", "passive3", "alternateSprint"] as const;
const CONSTELLATION_PREFIX = "constellation"; // constellation1..constellation6

async function getTalentsAndConstellations(
  characterName: string
): Promise<{ talents: unknown; constellations: unknown }> {
  try {
    if (typeof (genshindb as any).talents !== "function") {
      console.warn(`⚠ genshindb.talents() not available in this package version — skipping for "${characterName}"`);
      return { talents: null, constellations: null };
    }

    const raw = (genshindb as any).talents(characterName);
    if (!raw) return { talents: null, constellations: null };

    const talents = TALENT_KEYS
      .map((key) => raw[key] ? { key, name: raw[key].name ?? null, description: raw[key].description ?? null } : null)
      .filter(Boolean);

    const constellations = Array.from({ length: 6 }, (_, i) => {
      const c = raw[`${CONSTELLATION_PREFIX}${i + 1}`];
      return c ? { level: i + 1, name: c.name ?? null, description: c.description ?? null } : null;
    }).filter(Boolean);

    return {
      talents: talents.length ? JSON.parse(JSON.stringify(talents)) : null,
      constellations: constellations.length ? JSON.parse(JSON.stringify(constellations)) : null,
    };
  } catch (err) {
    console.warn(`⚠ Could not fetch talents/constellations for "${characterName}":`, (err as Error).message);
    return { talents: null, constellations: null };
  }
}

async function seedCharacters(): Promise<void> {
  const names = genshindb.characters("names", { matchCategories: true }) as string[];
  let count = 0;

  for (const name of names) {
    if (name.includes("Traveler")) continue;

    try {
      const c = genshindb.characters(name) as any;
      if (!c || !c.name || !c.rarity) continue;

      const lvl1 = typeof c.stats === "function" ? c.stats(1) : null;
      const { talents, constellations } = await getTalentsAndConstellations(name);

      const payload = {
        name: c.name,
        title: c.title || null,
        vision: c.elementText || "None", // CÁCH 2: Thay null bằng "None" (cho trường hợp không có nguyên tố)
        weaponType: c.weaponText || "Unknown", // CÁCH 2: Thay null bằng "Unknown"
        rarity: parseInt(c.rarity as unknown as string, 10) || 4,
        region: c.region || null,
        affiliation: c.affiliation || null,
        description: c.description || null,
        iconUrl: getEnkaUrl(c.images?.filename_icon, c.images?.mihoyo_icon),
        splashUrl: getEnkaUrl(c.images?.filename_gachaSplash, c.images?.mihoyo_gachaSplash),
        elementIcon: getElementIconUrl(c.elementText),
        baseHp: lvl1?.hp ?? null,
        baseAtk: lvl1?.attack ?? null,
        baseDef: lvl1?.defense ?? null,
        ascensionStat: c.substatText || null,
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

async function seedWeapons(): Promise<void> {
  const names = genshindb.weapons("names", { matchCategories: true }) as string[];
  let count = 0;

  for (const name of names) {
    try {
      const w = genshindb.weapons(name) as any;
      if (!w || !w.name || !w.rarity) continue;

      const raw = w as Record<string, any>;
      const refinements = [raw.r1, raw.r2, raw.r3, raw.r4, raw.r5].filter(Boolean);

      const payload = {
        name: w.name,
        type: w.weaponText || null,
        rarity: typeof w.rarity === "string" ? parseInt(w.rarity, 10) : w.rarity,
        baseAtk: w.baseAtkValue ?? null,
        subStatName: w.mainStatText || null,
        subStatValue: w.baseStatText || null,
        effectName: w.effectName || null,
        // Full text at refine 1 (base) — was previously the ONLY value kept.
        effectDescriptionR1: refinements[0]?.description || w.effectTemplateRaw || null,
        // Full text at refine 5 (max) — previously discarded entirely.
        effectDescriptionR5: refinements[4]?.description || w.effectTemplateRaw || null,
        // Complete per-refinement breakdown, unchanged.
        passiveByRefinement: refinements.length ? JSON.parse(JSON.stringify(refinements)) : null,
        description: w.description || null,
        iconUrl: getEnkaUrl(w.images?.filename_icon, w.images?.mihoyo_icon),
      };

      const id = slugify(w.name);
      await prisma.weapon.upsert({
        where: { id },
        create: { id, ...payload },
        update: payload,
      });
      count++;
    } catch (err) {
      console.warn(`⚠ Skipped weapon "${name}":`, (err as Error).message);
    }
  }
  console.log(`✔ Seeded ${count} weapons`);
}

async function seedArtifacts(): Promise<void> {
  const names = genshindb.artifacts("names", { matchCategories: true }) as string[];
  let count = 0;

  for (const name of names) {
    try {
      const a = genshindb.artifacts(name) as any;
      if (!a || !a.name) continue;

      // Lấy danh sách độ sao và loại bỏ các giá trị lỗi NaN
      const rarityRange: number[] = Array.isArray(a.rarityList)
        ? a.rarityList
            .map((r: string | number) => (typeof r === "string" ? parseInt(r, 10) : r))
            .filter((r: number) => !isNaN(r))
        : [];

      // Hỗ trợ cả 2 kiểu đặt tên thuộc tính của genshin-db
      const onePieceBonus = a.effect1Pc || a["1pc"] || null;
      const twoPieceBonus = a.effect2Pc || a["2pc"] || null;
      const fourPieceBonus = a.effect4Pc || a["4pc"] || null;
      const isLegacyTwoPieceOnlySet = !fourPieceBonus && !!onePieceBonus;

      const pieces = {
        flower: a.images?.filename_flower ? getEnkaUrl(a.images.filename_flower) : null,
        plume: a.images?.filename_plume ? getEnkaUrl(a.images.filename_plume) : null,
        sands: a.images?.filename_sands ? getEnkaUrl(a.images.filename_sands) : null,
        goblet: a.images?.filename_goblet ? getEnkaUrl(a.images.filename_goblet) : null,
        circlet: a.images?.filename_circlet ? getEnkaUrl(a.images.filename_circlet) : null,
      };

      const basePayload = {
        name: a.name,
        onePieceBonus,
        twoPieceBonus,
        fourPieceBonus,
        isLegacyTwoPieceOnlySet,
        pieces: pieces as any,
        iconUrl: getEnkaUrl(a.images?.filename_flower || a.images?.filename_circlet),
      };

      const id = slugify(a.name);

      await prisma.artifactSet.upsert({
        where: { id },
        create: {
          id,
          ...basePayload,
          rarityRange,
        },
        update: {
          ...basePayload,
          rarityRange: { set: rarityRange }, // Bắt buộc dùng { set: [...] } cho mảng trong update
        },
      });
      count++;
    } catch (err) {
      console.warn(`⚠ Skipped artifact set "${name}":`, (err as Error).message);
    }
  }
  console.log(`✔ Seeded ${count} artifact sets`);
}

async function main(): Promise<void> {
  console.log("Seeding database with real Genshin Impact data (genshin-db)...");
  try {
    await seedCharacters();
    await seedWeapons();
    await seedArtifacts();
    console.log("=== ALL DATA SEEDED SUCCESSFULLY ===");
  } catch (error) {
    console.error("❌ Seeding halted due to critical error:");
    console.error(error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });