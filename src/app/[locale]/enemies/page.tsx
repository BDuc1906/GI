import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { createStaticPageMetadata } from "@/lib/seo/metadata";
import { EntityThumb } from "@/components/ui/EntityThumb";
import { imageFor } from "@/core/game/image-urls";
import enemyImages from "@/data/images/enemies.json";
import {
  ENEMY_CATEGORY_LABEL,
  ENEMY_TYPE_LABEL,
  normalizeSearch,
  readEnemyRaw,
} from "@/core/game/enemy-format";

export const dynamic = "force-dynamic";

interface EnemiesPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; type?: string; cat?: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return createStaticPageMetadata(locale, "enemies");
}

const TYPE_ORDER = ["COMMON", "ELITE", "BOSS"] as const;

export default async function EnemiesPage({ params, searchParams }: EnemiesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const type = (TYPE_ORDER as readonly string[]).includes(sp.type ?? "") ? sp.type! : "";
  const cat = sp.cat && sp.cat in ENEMY_CATEGORY_LABEL ? sp.cat : "";

  // Chọn field tường minh; raw cần để lấy tên gọi khác + (không dùng toàn bộ).
  const all = await withDbRetry(() =>
    prisma.enemy.findMany({
      select: {
        id: true,
        name: true,
        enemyType: true,
        categoryType: true,
        categoryText: true,
        raw: true,
      },
      orderBy: { name: "asc" },
    })
  );

  const query = normalizeSearch(q);
  const enemies = all.filter((e) => {
    if (type && e.enemyType !== type) return false;
    if (cat && e.categoryType !== cat) return false;
    if (query) {
      const special = readEnemyRaw(e.raw).specialNames ?? [];
      return [e.name, ...special].some((n) => normalizeSearch(n).includes(query));
    }
    return true;
  });

  const count = (pred: (e: (typeof all)[number]) => boolean) => all.filter(pred).length;

  /** Dựng URL giữ các bộ lọc khác, đổi 1 bộ lọc. */
  const href = (next: { type?: string; cat?: string }) => {
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    const t = "type" in next ? next.type : type;
    const c = "cat" in next ? next.cat : cat;
    if (t) p.set("type", t);
    if (c) p.set("cat", c);
    const s = p.toString();
    return s ? `/enemies?${s}` : "/enemies";
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
        <h1 className="font-display text-4xl font-bold text-text-primary mb-4">Kẻ địch</h1>
        <p className="text-text-secondary mb-6 max-w-3xl">
          Toàn bộ kẻ địch trong sách tra cứu của game. Bấm vào một kẻ địch để xem mô tả, vật phẩm rớt và
          bí cảnh liên quan. Tên kẻ địch hiện hiển thị bằng tiếng Anh.
        </p>

        <form action="" method="get" role="search" className="flex gap-2 mb-5 max-w-md">
          {type && <input type="hidden" name="type" value={type} />}
          {cat && <input type="hidden" name="cat" value={cat} />}
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Tìm kẻ địch..."
            aria-label="Tìm kẻ địch"
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-bg-input text-text-primary placeholder:text-text-muted"
          />
          <button type="submit" className="btn-primary px-4 py-2 rounded-lg">
            Tìm
          </button>
        </form>

        <div className="flex flex-wrap gap-2 mb-3" aria-label="Lọc theo cấp độ">
          <Link href={href({ type: "" })} className={chip(!type)}>
            Tất cả ({all.length})
          </Link>
          {TYPE_ORDER.map((t) => (
            <Link key={t} href={href({ type: t })} className={chip(type === t)}>
              {ENEMY_TYPE_LABEL[t]} ({count((e) => e.enemyType === t)})
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 mb-6" aria-label="Lọc theo nhóm">
          <Link href={href({ cat: "" })} className={chip(!cat)}>
            Mọi nhóm
          </Link>
          {Object.entries(ENEMY_CATEGORY_LABEL).map(([key, label]) => (
            <Link key={key} href={href({ cat: key })} className={chip(cat === key)}>
              {label} ({count((e) => e.categoryType === key)})
            </Link>
          ))}
        </div>

        <p className="text-sm text-text-muted mb-4" aria-live="polite">
          {enemies.length} kẻ địch
        </p>

        {enemies.length === 0 ? (
          <p className="text-text-secondary">Không có kẻ địch nào khớp bộ lọc.</p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enemies.map((enemy) => {
              const raw = readEnemyRaw(enemy.raw);
              const special = raw.specialNames?.[0];
              return (
                <li key={enemy.id}>
                  <Link
                    href={`/enemies/${enemy.id}`}
                    className="flex gap-3 h-full bg-bg-card border-2 border-border rounded-xl p-4 hover:border-accent-500 transition-all"
                  >
                    <EntityThumb
                      candidates={imageFor(enemyImages, enemy.id)}
                      alt={enemy.name}
                      size="md"
                    />
                    <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-text-primary">{enemy.name}</h3>
                    {special && <p className="text-xs text-text-muted mt-0.5">{special}</p>}
                    <div className="flex flex-wrap gap-1.5 mt-3 text-[11px]">
                      {enemy.enemyType && (
                        <span className="px-2 py-0.5 rounded-full bg-bg-elevated text-accent-bright font-medium">
                          {ENEMY_TYPE_LABEL[enemy.enemyType] ?? enemy.enemyType}
                        </span>
                      )}
                      {enemy.categoryType && (
                        <span
                          className="px-2 py-0.5 rounded-full border border-border text-text-secondary"
                          title={enemy.categoryText ?? undefined}
                        >
                          {ENEMY_CATEGORY_LABEL[enemy.categoryType] ?? enemy.categoryText}
                        </span>
                      )}
                    </div>
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
