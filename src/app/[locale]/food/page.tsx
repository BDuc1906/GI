import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { createStaticPageMetadata } from "@/lib/seo/metadata";
import { EntityThumb } from "@/components/ui/EntityThumb";
import { imageFor } from "@/core/game/image-urls";
import foodImages from "@/data/images/foods.json";
import { normalizeSearch } from "@/core/game/enemy-format";
import {
  FOOD_FILTER_LABEL,
  FOOD_TYPE_LABEL,
  readFoodRaw,
  stars,
} from "@/core/game/food-format";

export const dynamic = "force-dynamic";

interface FoodPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; type?: string; filter?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createStaticPageMetadata(locale, "food");
}

export default async function FoodPage({ params, searchParams }: FoodPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const type = sp.type && sp.type in FOOD_TYPE_LABEL ? sp.type : "";
  const filter = sp.filter && sp.filter in FOOD_FILTER_LABEL ? sp.filter : "";

  const all = await withDbRetry(() =>
    prisma.food.findMany({
      select: { id: true, name: true, rarity: true, foodtype: true, filterType: true, raw: true },
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
    })
  );

  const query = normalizeSearch(q);
  const foods = all.filter((f) => {
    if (type && f.foodtype !== type) return false;
    if (filter && f.filterType !== filter) return false;
    if (query) {
      const r = readFoodRaw(f.raw);
      return [f.name, r.characterName ?? ""].some((n) => normalizeSearch(n).includes(query));
    }
    return true;
  });

  const count = (pred: (f: (typeof all)[number]) => boolean) => all.filter(pred).length;

  const href = (next: { type?: string; filter?: string }) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    const t = "type" in next ? next.type : type;
    const f = "filter" in next ? next.filter : filter;
    if (t) p.set("type", t);
    if (f) p.set("filter", f);
    const s = p.toString();
    return s ? `/food?${s}` : "/food";
  };

  const chip = (active: boolean) =>
    `px-3 py-1 rounded-full border text-sm transition-colors ${
      active
        ? "bg-bg-elevated border-accent-500 text-accent-bright font-semibold"
        : "border-border text-text-secondary hover:border-accent-500 hover:text-accent-bright"
    }`;

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-4">Món ăn</h1>
        <p className="text-text-secondary mb-6 max-w-3xl">
          Toàn bộ món ăn và công thức nấu. Bấm vào một món để xem hiệu ứng, nguyên liệu (kèm link sang trang
          nguyên liệu) và nhân vật sở hữu món đặc biệt. Tên món hiện bằng tiếng Anh.
        </p>

        <form action="" method="get" role="search" className="flex gap-2 mb-5 max-w-md">
          {type && <input type="hidden" name="type" value={type} />}
          {filter && <input type="hidden" name="filter" value={filter} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Tìm món hoặc nhân vật..."
            aria-label="Tìm món ăn"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg-input text-text-primary placeholder:text-text-muted"
          />
          <button type="submit" className="btn-primary px-4 py-2 rounded-lg">
            Tìm
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mb-3" aria-label="Lọc theo loại món">
          <Link href={href({ type: "" })} className={chip(!type)}>
            Tất cả ({all.length})
          </Link>
          {Object.entries(FOOD_TYPE_LABEL).map(([key, label]) => (
            <Link key={key} href={href({ type: key })} className={chip(type === key)}>
              {label} ({count((f) => f.foodtype === key)})
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-6" aria-label="Lọc theo công dụng">
          <Link href={href({ filter: "" })} className={chip(!filter)}>
            Mọi công dụng
          </Link>
          {Object.entries(FOOD_FILTER_LABEL).map(([key, label]) => (
            <Link key={key} href={href({ filter: key })} className={chip(filter === key)}>
              {label} ({count((f) => f.filterType === key)})
            </Link>
          ))}
        </div>

        <p className="text-sm text-text-muted mb-4" aria-live="polite">
          {foods.length} món
        </p>

        {foods.length === 0 ? (
          <p className="text-text-secondary">Không có món nào khớp bộ lọc.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {foods.map((food) => {
              const r = readFoodRaw(food.raw);
              return (
                <li key={food.id}>
                  <Link
                    href={`/food/${food.id}`}
                    className="flex gap-3 h-full bg-bg-card border-2 border-border rounded-xl p-4 hover:border-accent-500 transition-all"
                  >
                    <EntityThumb
                      candidates={imageFor(foodImages, food.id)}
                      alt={food.name}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-text-primary">{food.name}</h3>
                      <span className="text-rarity-5 text-sm whitespace-nowrap">{stars(food.rarity)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-[11px] mb-2">
                      {food.foodtype && (
                        <span className="px-2 py-0.5 rounded-full bg-bg-elevated text-accent-bright font-medium">
                          {FOOD_TYPE_LABEL[food.foodtype] ?? food.foodtype}
                        </span>
                      )}
                      {food.filterType && (
                        <span
                          className="px-2 py-0.5 rounded-full border border-border text-text-secondary"
                          title={r.filterText}
                        >
                          {FOOD_FILTER_LABEL[food.filterType] ?? r.filterText}
                        </span>
                      )}
                    </div>
                    {r.characterName && (
                      <p className="text-xs text-text-muted">Món đặc biệt của {r.characterName}</p>
                    )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
