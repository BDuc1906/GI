
import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { rarityGlowClass } from "@/lib/theme";
import { SafeImage } from "@/components/SafeImage";
import { Pagination } from "@/components/Pagination";
import { LIST_PAGE_SIZE, parsePageParam, totalPagesFor } from "@/lib/pagination";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thánh di vật — LEIBO",
  description: "Danh sách toàn bộ bộ thánh di vật Genshin Impact: hiệu ứng 1/2/4 mảnh.",
};

interface PageProps {
  searchParams: Promise<{ q?: string; page?: string }>;
}

export default async function ArtifactsPage({ searchParams }: PageProps) {
  const { q, page: pageRaw } = await searchParams;
  const page = parsePageParam(pageRaw);

  // Trước đây: `const where: any = {}`. Dùng type Prisma sinh sẵn để tránh
  // lỗi field/kiểu dữ liệu sai chỉ lộ ra lúc chạy thay vì lúc build.
  const where: Prisma.ArtifactSetWhereInput = {};
  if (q) where.name = { contains: q, mode: "insensitive" };

  // Trước đây không có take/skip — tải toàn bộ bảng thánh di vật mỗi lần
  // (xem lý do tương tự ở /weapons/page.tsx, /characters/page.tsx).
  const [sets, total] = await Promise.all([
    prisma.artifactSet.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * LIST_PAGE_SIZE,
      take: LIST_PAGE_SIZE,
    }),
    prisma.artifactSet.count({ where }),
  ]);
  const totalPages = totalPagesFor(total);

  const buildQuery = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v);
      else sp.delete(k);
    });
    return sp.toString();
  };
  const buildPageHref = (p: number) => `/artifacts?${buildQuery({ page: p > 1 ? String(p) : undefined })}`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-wide text-primary uppercase mb-2">
          Bảo Vật Thánh Di Vật
        </h1>
        <p className="text-sm text-secondary">
          Khám phá bộ bí bảo tàng tích cổ đại gia tăng chiến lực
        </p>
      </div>

      <div className="mb-6">
        <form method="GET" className="flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Tìm tên bộ thánh di vật..."
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
              href={`/artifacts?${buildQuery({ q: undefined })}`}
              className="rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-2 text-sm text-red-400 hover:bg-red-900/40 transition-colors"
            >
              Xóa
            </Link>
          )}
        </form>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {sets.map((a, index) => {
          const maxRarity = Math.max(...(a.rarityRange as number[]), 4);
          return (
            <Link
              key={a.id}
              href={`/artifacts/${a.id}`}
              className={`relic-frame ${rarityGlowClass(maxRarity)} overflow-hidden group`}
            >
              <div className="relative aspect-square w-full bg-secondary/40 p-4 flex items-center justify-center overflow-hidden">
                {a.iconUrl ? (
                  <SafeImage
                    src={a.iconUrl}
                    alt={a.name}
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
                  {a.name}
                </div>
                <div className="text-xs text-secondary font-medium mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-gold-bright" />
                  Phẩm cấp: {(a.rarityRange as number[]).join("–")}★
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} buildHref={buildPageHref} />
    </div>
  );
}
