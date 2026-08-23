import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { rarityStars, rarityColorVar } from "@/lib/theme";
import { WeaponIcon } from "@/components/WeaponIcon";
import { EntityCard } from "@/components/EntityCard";
import { Pagination } from "@/components/Pagination";
import { LIST_PAGE_SIZE, parsePageParam, totalPagesFor } from "@/lib/pagination";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Vũ khí — LEIBO",
  description: "Danh sách toàn bộ vũ khí Genshin Impact: loại vũ khí, độ hiếm, chỉ số cơ bản.",
};

interface PageProps {
  searchParams: Promise<{ type?: string; rarity?: string; q?: string; page?: string }>;
}

// Cùng mật độ lưới với /characters — nhất quán toàn site, tận dụng màn
// hình rộng thay vì dừng ở lg:6 như bản cũ.
const DENSE_GRID = "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-3";

export default async function WeaponsPage({ searchParams }: PageProps) {
  const { type, rarity, q, page: pageRaw } = await searchParams;
  const page = parsePageParam(pageRaw);

  const where: Prisma.WeaponWhereInput = {};
  if (type) where.type = { equals: type, mode: "insensitive" };
  if (rarity) where.rarity = Number(rarity);
  if (q) where.name = { contains: q, mode: "insensitive" };

  const [weapons, total] = await Promise.all([
    prisma.weapon.findMany({
      where,
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
      skip: (page - 1) * LIST_PAGE_SIZE,
      take: LIST_PAGE_SIZE,
    }),
    prisma.weapon.count({ where }),
  ]);
  const totalPages = totalPagesFor(total);
  const types = ["Sword", "Claymore", "Polearm", "Bow", "Catalyst"];

  const buildQuery = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    if (type) sp.set("type", type);
    if (rarity) sp.set("rarity", rarity);
    if (q) sp.set("q", q);
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v);
      else sp.delete(k);
    });
    return sp.toString();
  };
  const buildPageHref = (p: number) => `/weapons?${buildQuery({ page: p > 1 ? String(p) : undefined })}`;
  const hasActiveFilters = Boolean(type || rarity || q);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-7">
        <h1 className="font-display text-display-2 font-semibold text-text-primary mb-2">Vũ khí</h1>
        <p className="text-sm text-text-secondary">
          Tìm thấy <span className="text-accent-bright font-semibold tabular-nums">{total}</span> vũ khí
        </p>
      </div>

      <form method="GET" className="flex gap-2 mb-5">
        {type && <input type="hidden" name="type" value={type} />}
        {rarity && <input type="hidden" name="rarity" value={rarity} />}
        <input
          type="text"
          name="q"
          defaultValue={q || ""}
          placeholder="Tìm tên vũ khí..."
          className="flex-1 rounded-lg border border-border px-3 py-2 text-sm placeholder:text-text-muted focus:outline-none focus:border-border-strong transition-colors"
        />
        <button type="submit" className="btn-accent rounded-lg px-4 py-2 text-sm">
          Tìm kiếm
        </button>
      </form>

      <div className="surface-glass border border-border rounded-xl mb-8 px-4">
        <div className="flex items-start gap-3 py-2.5 border-b border-border">
          <span className="text-xs text-text-muted font-medium w-24 shrink-0 pt-1.5">Loại</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {types.map((t) => {
              const active = type === t;
              return (
                <Link
                  key={t}
                  href={`/weapons?${buildQuery({ type: active ? undefined : t })}`}
                  aria-pressed={active}
                  className="chip px-2.5 py-1 rounded-full flex items-center gap-1.5 text-xs"
                >
                  <WeaponIcon type={t} size={14} />
                  {t}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-start gap-3 py-2.5">
          <span className="text-xs text-text-muted font-medium w-24 shrink-0 pt-1.5">Phẩm cấp</span>
          <div className="flex flex-wrap items-center gap-1.5">
            {[5, 4, 3].map((r) => {
              const active = rarity === String(r);
              return (
                <Link
                  key={r}
                  href={`/weapons?${buildQuery({ rarity: active ? undefined : String(r) })}`}
                  aria-pressed={active}
                  className="chip px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={active ? { color: rarityColorVar(r), borderColor: rarityColorVar(r) } : undefined}
                >
                  {rarityStars(r)}
                </Link>
              );
            })}
            {hasActiveFilters && (
              <Link
                href="/weapons"
                className="ml-2 text-xs text-text-muted hover:text-text-primary transition-colors underline underline-offset-2"
              >
                Xóa tất cả bộ lọc
              </Link>
            )}
          </div>
        </div>
      </div>

      {weapons.length === 0 ? (
        <div className="text-center py-20 text-text-muted text-sm">
          Không tìm thấy vũ khí phù hợp với bộ lọc.{" "}
          <Link href="/weapons" className="underline underline-offset-2 hover:text-text-primary">
            Xóa bộ lọc
          </Link>
        </div>
      ) : (
        <div className={DENSE_GRID}>
          {weapons.map((w, index) => (
            <EntityCard
              key={w.id}
              href={`/weapons/${w.id}`}
              name={w.name}
              subtitle={w.type}
              rarity={w.rarity}
              imageSrc={w.iconUrl}
              imageFit="contain"
              compact
              priority={index < 10}
              elementColor={rarityColorVar(w.rarity)}
            />
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} buildHref={buildPageHref} />
    </div>
  );
}
