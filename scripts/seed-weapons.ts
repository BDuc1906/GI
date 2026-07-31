import { createRequire } from "module";
import { prisma } from "../src/lib/prisma";
import { getEnkaUrl, slugify, upsertMaterial } from "./lib/seed-helpers";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

/**
 * Lấy nguyên liệu đột phá từ costs của vũ khí (ascend1..ascend6)
 * và upsert vào bảng Material, trả về JSON phù hợp với schema.
 */
async function getWeaponAscensionMaterials(costs: unknown): Promise<unknown> {
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

export async function seedWeapons(): Promise<void> {
  const names = genshindb.weapons("names", { matchCategories: true }) as string[];
  let count = 0;

  for (const name of names) {
    try {
      const w = genshindb.weapons(name) as any;
      if (!w || !w.name || !w.rarity) continue;

      const raw = w as Record<string, any>;
      const refinements = [raw.r1, raw.r2, raw.r3, raw.r4, raw.r5].filter(Boolean);

      // Lấy nguyên liệu đột phá
      const ascensionMaterials = await getWeaponAscensionMaterials(w.costs);

      const payload = {
        name: w.name,
        type: w.weaponText || null,
        rarity: typeof w.rarity === "string" ? parseInt(w.rarity, 10) : w.rarity,
        baseAtk: w.baseAtkValue ?? null,
        subStatName: w.mainStatText || null,
        subStatValue: w.baseStatText || null,
        effectName: w.effectName || null,
        effectDescriptionR1: refinements[0]?.description || w.effectTemplateRaw || null,
        effectDescriptionR5: refinements[4]?.description || w.effectTemplateRaw || null,
        passiveByRefinement: refinements.length ? JSON.parse(JSON.stringify(refinements)) : null,
        description: w.description || null,
        iconUrl: getEnkaUrl(w.images?.filename_icon, w.images?.mihoyo_icon),
        ascensionMaterials: ascensionMaterials as any,
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
  console.log(`✔ Seeded ${count} weapons with ascension materials`);
}