import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { rarityGlowClass, rarityStars, rarityTextClass } from "@/lib/theme";

interface PageProps {
  searchParams: Promise<{ type?: string; rarity?: string }>;
}

export default async function WeaponsPage({ searchParams }: PageProps) {
  const { type, rarity } = await searchParams;

  // 1. Truy vấn dữ liệu vũ khí từ Supabase kết hợp bộ lọc động
  const weapons = await prisma.weapon.findMany({
    where: {
      type: type ? { equals: type, mode: "insensitive" } : undefined,
      rarity: rarity ? Number(rarity) : undefined,
    },
    orderBy: [{ rarity: "desc" }, { name: "asc" }],
  });

  const types = ["Sword", "Claymore", "Polearm", "Bow", "Catalyst"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Khối tiêu đề */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-wide text-neutral-100 uppercase mb-2">
          Kho Tàng Vũ Khí
        </h1>
        <p className="text-sm text-[color:var(--parchment-dim)]">
          Tìm thấy <span className="text-[color:var(--gold-bright)] font-semibold">{weapons.length}</span> thần binh tàng bảo
        </p>
      </div>

      {/* Khối thanh bộ lọc dữ liệu chuyên nghiệp (Filter Bar) */}
      <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800 p-4 rounded-xl mb-8 flex flex-wrap gap-4 text-xs items-center">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-neutral-400 font-medium mr-2">Phân loại dòng:</span>
          {types.map((t) => (
            <Link
              key={t}
              href={`/weapons?type=${t}${rarity ? `&rarity=${rarity}` : ""}`}
              className="px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-950/60 hover:border-neutral-500 transition-all font-medium text-neutral-200"
            >
              {t}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-neutral-400 font-medium mr-2 ml-2">Phẩm sao:</span>
          {[3, 4, 5].map((r) => (
            <Link
              key={r}
              href={`/weapons?rarity=${r}${type ? `&type=${type}` : ""}`}
              className={`px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-950/60 hover:border-neutral-500 transition-all ${rarityTextClass(r)}`}
            >
              {rarityStars(r)}
            </Link>
          ))}
        </div>

        {/* Nút xóa bộ lọc */}
        {(type || rarity) && (
          <Link
            href="/weapons"
            className="ml-auto px-4 py-1.5 rounded-full bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-900/40 transition-colors font-semibold"
          >
            Xóa Lọc &times;
          </Link>
        )}
      </div>

      {/* Grid danh sách hiển thị vũ khí (Weapons Card Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {weapons.map((w) => (
          <Link
            key={w.id}
            href={`/weapons/${w.id}`}
            className={`relic-frame ${rarityGlowClass(w.rarity)} bg-neutral-950/60 border border-neutral-800 rounded-xl overflow-hidden block group transition-all duration-300 hover:-translate-y-2`}
          >
            {/* Khung ảnh vũ khí */}
            <div className="relative aspect-square w-full bg-neutral-900/40 p-4 flex items-center justify-center overflow-hidden">
              {w.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={w.iconUrl}
                  alt={w.name}
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 p-2"
                />
              ) : (
                <div className="text-neutral-600 text-xs">No Image</div>
              )}
            </div>

            {/* Chi tiết văn bản chân thẻ */}
            <div className="p-4 border-t border-neutral-900 bg-neutral-900/10">
              <div className="font-bold truncate text-neutral-100 group-hover:text-[color:var(--gold-bright)] transition-colors text-sm mb-1">
                {w.name}
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[10px] text-neutral-500 tracking-wider uppercase font-medium">{w.type}</span>
                <span className={`text-[10px] tracking-tighter ${rarityTextClass(w.rarity)}`}>
                  {rarityStars(w.rarity)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
