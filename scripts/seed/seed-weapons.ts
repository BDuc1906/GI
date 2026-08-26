import { createRequire } from "module";
import { prisma } from "../../src/lib/db/prisma";
import { getEnkaUrl, slugify, upsertMaterial } from "../lib/seed-helpers";

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

// ---------- STATS THEO CẤP ĐỘ (giống scripts/lib/genshin-pure-helpers.ts
// getStatsByLevel() dùng cho nhân vật — vũ khí cũng có .stats(level,
// ascension) THẬT trong genshin-db, không cần nội suy) ----------

const ASCENSION_BREAKPOINT_LEVELS = new Set([20, 40, 50, 60, 70, 80]);

function buildStatBreakpoints(): Array<[number, "-" | "+" | undefined]> {
  const points: Array<[number, "-" | "+" | undefined]> = [];
  for (let level = 1; level <= 90; level++) {
    if (ASCENSION_BREAKPOINT_LEVELS.has(level)) {
      points.push([level, "-"]);
      points.push([level, "+"]);
    } else {
      points.push([level, undefined]);
    }
  }
  return points;
}

const STAT_BREAKPOINTS = buildStatBreakpoints();

type WeaponStatsFn = (level: number, ascension?: "-" | "+") => {
  level?: number;
  ascension?: number;
  attack?: number;
  specialized?: number;
} | null;

function getWeaponStatsByLevel(statsFn: unknown): unknown {
  if (typeof statsFn !== "function") return null;
  try {
    const fn = statsFn as WeaponStatsFn;
    const rows = STAT_BREAKPOINTS.map(([level, ascension]) => {
      const s = ascension ? fn(level, ascension) : fn(level);
      if (!s) return null;
      return {
        level: s.level ?? level,
        ascension: s.ascension ?? null,
        // BUG ĐÃ SỬA (giống scripts/fix-weapon-stats-by-level.ts): field
        // ghi ra phải khớp tên với WeaponStatByLevelRow mà
        // WeaponLevelSlider.tsx đọc ("baseAtk"/"subStatValue"), không
        // phải tên gốc "attack"/"specialized" của genshin-db — nếu không
        // khớp, MỌI vũ khí seed qua đường này (tức MỌI vũ khí mới sau
        // mỗi lần cập nhật, vì script này chạy trong `npm run
        // data:update`) sẽ luôn hiện "—" ở ATK NỀN/CRIT RATE dù dữ liệu
        // đã crawl đúng.
        baseAtk: s.attack ?? null,
        subStatValue: s.specialized ?? null,
      };
    }).filter((r): r is NonNullable<typeof r> => r !== null);
    return rows.length ? JSON.parse(JSON.stringify(rows)) : null;
  } catch {
    return null;
  }
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

      // Chỉ số ATK + chỉ số phụ thật theo từng cấp — nguồn cho
      // WeaponLevelSlider (xem src/components/WeaponLevelSlider.tsx).
      const statsByLevel = getWeaponStatsByLevel(w.stats);

      // Ảnh GỐC (hotlink) tại lần crawl này — ghi tự do mỗi lần seed vào
      // iconUrlOriginal. Cột iconUrl (hiển thị) do
      // scripts/mirror-images-to-r2.ts sở hữu sau lần mirror đầu tiên và
      // KHÔNG được set ở nhánh `update` bên dưới — xem comment chi tiết ở
      // Character.iconUrlOriginal trong prisma/schema.prisma.
      const iconUrlOriginal = getEnkaUrl(w.images?.filename_icon, w.images?.mihoyo_icon);

      const payload = {
        name: w.name,
        type: w.weaponText || null,
        rarity: typeof w.rarity === "string" ? parseInt(w.rarity, 10) : w.rarity,
        baseAtk: w.baseAtkValue ?? null,
        statsByLevel: statsByLevel as any,
        subStatName: w.mainStatText || null,
        subStatValue: w.baseStatText || null,
        effectName: w.effectName || null,
        passiveByRefinement: refinements.length ? JSON.parse(JSON.stringify(refinements)) : null,
        description: w.description || null,
        iconUrlOriginal,
        ascensionMaterials: ascensionMaterials as any,
      };

      const id = slugify(w.name);
      await prisma.weapon.upsert({
        where: { id },
        // Record mới -> chưa mirror lần nào, tạm hiển thị thẳng bằng hotlink.
        create: { id, ...payload, iconUrl: iconUrlOriginal },
        // Record đã tồn tại -> KHÔNG đụng iconUrl.
        update: payload,
      });
      count++;
    } catch (err) {
      console.warn(`⚠ Skipped weapon "${name}":`, (err as Error).message);
    }
  }
  console.log(`✔ Seeded ${count} weapons with ascension materials`);
}
