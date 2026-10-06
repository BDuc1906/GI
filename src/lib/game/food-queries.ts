/**
 * src/lib/game/food-queries.ts
 *
 * Truy vấn nối Nguyên liệu ↔ Món ăn / Công thức chế tạo. Dữ liệu tham chiếu
 * nằm trong cột Json (`raw.ingredients`, `raw.recipe`) nên lọc theo tên.
 */
import { prisma } from "@/lib/db/prisma";
import { readFoodRaw } from "@/lib/game/food-format";

export interface FoodLite {
  id: string;
  name: string;
  rarity: number | null;
}

/** Món ăn dùng nguyên liệu này. Thử lọc ngay trong DB (jsonb @>), lỗi thì lọc ở ứng dụng. */
export async function foodsUsingIngredient(name: string): Promise<FoodLite[]> {
  try {
    return await prisma.food.findMany({
      where: { raw: { path: ["ingredients"], array_contains: [{ name }] } },
      select: { id: true, name: true, rarity: true },
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
    });
  } catch {
    const all = await prisma.food.findMany({
      select: { id: true, name: true, rarity: true, raw: true },
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
    });
    return all
      .filter((f) => (readFoodRaw(f.raw).ingredients ?? []).some((i) => i.name === name))
      .map(({ id, name: n, rarity }) => ({ id, name: n, rarity }));
  }
}

export interface CraftRecipeItem {
  id?: number;
  name: string;
  count?: number;
}

export interface CraftLite {
  id: string;
  name: string;
  recipe: CraftRecipeItem[];
  resultCount: number | null;
  moraCost: number | null;
  unlockRank: number | null;
}

interface CraftRaw {
  recipe?: CraftRecipeItem[];
}

/** Công thức chế tạo liên quan tới 1 vật phẩm: làm ra nó, hoặc dùng nó làm nguyên liệu. */
export async function craftsInvolving(
  name: string
): Promise<{ makes: CraftLite[]; uses: CraftLite[] }> {
  const rows = await prisma.craft.findMany({
    select: { id: true, name: true, resultCount: true, moraCost: true, unlockRank: true, raw: true },
    orderBy: { name: "asc" },
  });
  const lite = (r: (typeof rows)[number]): CraftLite => ({
    id: r.id,
    name: r.name,
    recipe: ((r.raw as CraftRaw | null)?.recipe ?? []).filter((i) => i?.name),
    resultCount: r.resultCount,
    moraCost: r.moraCost,
    unlockRank: r.unlockRank,
  });
  const all = rows.map(lite);
  return {
    makes: all.filter((c) => c.name === name),
    uses: all.filter((c) => c.name !== name && c.recipe.some((i) => i.name === name)),
  };
}
