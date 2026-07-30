import { createRequire } from "module";
import { prisma } from "../src/lib/prisma";
import { getEnkaUrl, slugify } from "./lib/seed-helpers";

const require = createRequire(import.meta.url);
const genshindb = require("genshin-db") as typeof import("genshin-db");

export async function seedWeapons(): Promise<void> {
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
        // Full text at refine 1 (base).
        effectDescriptionR1: refinements[0]?.description || w.effectTemplateRaw || null,
        // Full text at refine 5 (max).
        effectDescriptionR5: refinements[4]?.description || w.effectTemplateRaw || null,
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