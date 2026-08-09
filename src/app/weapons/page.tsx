import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { rarityGlowClass, rarityStars, rarityTextClass } from "@/lib/theme";
import { SafeImage } from "@/components/SafeImage";
import { WeaponIcon } from "@/components/WeaponIcon";
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

export default async function WeaponsPage({ searchParams }: PageProps) {
  const { type, rarity, q, page: pageRaw } = await searchParams;
  const page = parsePageParam(pageRaw);

  // Trước đây: `const where: any = {}`. Dùng type Prisma sinh sẵn để tránh
  // lỗi field/kiểu dữ liệu sai chỉ lộ ra lúc chạy thay vì lúc build.
  const where: Prisma.WeaponWhereInput = {};
  if (type) where.type = { equals: type, mode: "insensitive" };
  if (rarity) where.rarity = Number(rarity);
  if (q) where.name = { contains: q, mode: "insensitive" };

  // Trước đây findMany không có take/skip — tải TOÀN BỘ bảng vũ khí mỗi
  // lần render trang này, dù layer API (/api/weapons) đã có phân trang
  // chuẩn từ lâu. Số lượng vũ khí tăng dần theo từng bản game mới, nên đây
  // là nợ kỹ thuật thật, không chỉ lý thuyết.
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
    // Đổi filter (type/rarity/q) luôn quay về trang 1 — giữ "page" cũ ở
    // đây sẽ dễ văng ra trang trống (vd đang ở trang 5, lọc còn 2 trang).
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v);
      else sp.delete(k);
    });
    return sp.toString();
  };
  const buildPageHref = (p: number) => `/weapons?${buildQuery({ page: p > 1 ? String(p) : undefined })}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-wide text-primary uppercase mb-2">
          Kho Tàng Vũ Khí
        </h1>
        <p className="text-sm text-secondary">
          Tìm thấy <span className="text-gold-bright font-semibold">{total}</span> thần binh tàng bảo
        </p>
      </div>

      <div className="mb-6">
        <form method="GET" className="flex gap-2">
          {type && <input type="hidden" name="type" value={type} />}
          {rarity && <input type="hidden" name="rarity" value={rarity} />}
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Tìm tên vũ khí..."
            className="flex-1 rounded-lg border border-border bg-input px-3 py-2 text-sm text-primary placeholder:text-muted focus:outline-none focus:border-gold/50 transition-colors"
          />
          <button
            type="submit"
            className="rounded-lg bg-gold/10 border border-gold/40 px-4 py-2 text-sm font-medium text-gold-bright hover:bg-gold/20 transition-colors"
          >
            Tìm kiếm
          </button>
          {q && (
            <Link
              href={`/weapons?${buildQuery({ q: undefined })}`}
              className="rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-2 text-sm text-red-400 hover:bg-red-900/40 transition-colors"
            >
              Xóa
            </Link>
          )}
        </form>
      </div>

      <div className="bg-card/40 backdrop-blur-md border border-border p-4 rounded-xl mb-8 flex flex-wrap gap-4 text-xs items-center">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-secondary font-medium mr-2">Phân loại dòng:</span>
          {types.map((t) => (
            <Link
              key={t}
              href={`/weapons?${buildQuery({ type: t })}`}
              className="px-3 py-1.5 rounded-full border border-border bg-card/60 hover:border-gold/50 transition-all flex items-center gap-1.5 font-medium text-primary"
            >
              <WeaponIcon type={t} size={16} />
              {t}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-secondary font-medium mr-2 ml-2">Phẩm sao:</span>
          {[3, 4, 5].map((r) => (
            <Link
              key={r}
              href={`/weapons?${buildQuery({ rarity: String(r) })}`}
              className="px-3 py-1.5 rounded-full border border-border bg-card/60 hover:border-gold/50 transition-all text-gold-bright font-bold"
            >
              {rarityStars(r)}
            </Link>
          ))}
        </div>

        {(type || rarity || q) && (
          <Link
            href="/weapons"
            className="ml-auto px-4 py-1.5 rounded-full bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-900/40 transition-colors font-semibold"
          >
            Xóa Lọc &times;
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {weapons.map((w, index) => (
          <Link
            key={w.id}
            href={`/weapons/${w.id}`}
            className={`relic-frame ${rarityGlowClass(w.rarity)} overflow-hidden group`}
          >
            <div className="relative aspect-square w-full bg-secondary/40 p-4 flex items-center justify-center overflow-hidden">
              {w.iconUrl ? (
                <SafeImage
                  src={w.iconUrl}
                  alt={w.name}
                  fill
                  priority={index < 6}
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 213px"
                  className="object-contain p-2 group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="text-muted text-xs">No Image</div>
              )}
            </div>
            <div className="p-3 border-t border-border bg-card/80">
              <div className="font-bold truncate text-primary group-hover:text-gold-bright transition-colors text-sm">
                {w.name}
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] text-secondary tracking-wider uppercase font-medium">{w.type}</span>
                <span className={`text-[10px] tracking-tighter ${rarityTextClass(w.rarity)}`}>
                  {rarityStars(w.rarity)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} buildHref={buildPageHref} />
    </div>
  );
}