import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { rarityGlowClass, rarityStars, rarityTextClass } from "@/lib/theme";
import { ElementIcon } from "@/components/ElementIcon";

interface PageProps {
  searchParams: Promise<{ vision?: string; weapon?: string; rarity?: string }>;
}

export default async function CharactersPage({ searchParams }: PageProps) {
  const { vision, weapon, rarity } = await searchParams;

  // 1. Truy vấn dữ liệu từ Supabase kết hợp bộ lọc (Filter)
  const characters = await prisma.character.findMany({
    where: {
      vision: vision ? { equals: vision, mode: "insensitive" } : undefined,
      weaponType: weapon ? { equals: weapon, mode: "insensitive" } : undefined,
      rarity: rarity ? Number(rarity) : undefined,
    },
    orderBy: [{ rarity: "desc" }, { name: "asc" }],
  });
// thay vì chỉ lấy tên nguyên tố, lấy luôn 1 elementIcon đại diện mỗi nguyên tố
  const visionRows = await prisma.character.findMany({
    distinct: ["vision"],
    select: { vision: true, elementIcon: true },
  });
  const weapons = ["Sword", "Claymore", "Polearm", "Bow", "Catalyst"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Khối tiêu đề */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-wide text-neutral-100 uppercase mb-2">
          Học Viện Nhân Vật
        </h1>
        <p className="text-sm text-[color:var(--parchment-dim)]">
          Tìm thấy <span className="text-[color:var(--gold-bright)] font-semibold">{characters.length}</span> đại hiệp lữ hành
        </p>
      </div>

      {/* Khối bộ lọc dữ liệu chuyên nghiệp (Filter Bar) */}
      <div className="bg-neutral-900/40 backdrop-blur-md border border-neutral-800 p-4 rounded-xl mb-8 flex flex-col gap-4">
        {/* Bộ lọc nguyên tố */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-400 font-medium mr-2">Nguyên tố (Vision):</span>
          {visionRows.map(({ vision: v, elementIcon }) => (
            <Link
              key={v}
              href={`/characters?vision=${v}${weapon ? `&weapon=${weapon}` : ""}${rarity ? `&rarity=${rarity}` : ""}`}
              className="px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-950/60 hover:border-neutral-500 transition-all flex items-center gap-1.5"
            >
              <ElementIcon vision={v} iconUrl={elementIcon} size={16} />
              {v}
            </Link>
          ))}
        </div>

        {/* Bộ lọc loại vũ khí */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-400 font-medium mr-2">Loại Vũ Khí:</span>
          {weapons.map((w) => (
            <Link
              key={w}
              href={`/characters?weapon=${w}${vision ? `&vision=${vision}` : ""}${rarity ? `&rarity=${rarity}` : ""}`}
              className="px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-950/60 hover:border-neutral-500 transition-all"
            >
              {w}
            </Link>
          ))}
        </div>

        {/* Bộ lọc độ hiếm sao */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-400 font-medium mr-2">Phẩm cấp (Rarity):</span>
          {[4, 5].map((r) => (
            <Link
              key={r}
              href={`/characters?rarity=${r}${vision ? `&vision=${vision}` : ""}${weapon ? `&weapon=${weapon}` : ""}`}
              className={`px-3 py-1.5 rounded-full border border-neutral-800 bg-neutral-950/60 hover:border-neutral-500 transition-all ${rarityTextClass(r)}`}
            >
              {rarityStars(r)}
            </Link>
          ))}

          {/* Nút xóa bộ lọc */}
          {(vision || weapon || rarity) && (
            <Link
              href="/characters"
              className="ml-auto px-4 py-1.5 rounded-full bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-900/40 transition-colors text-xs font-semibold"
            >
              Xóa Bộ Lọc &times;
            </Link>
          )}
        </div>
      </div>

      {/* Danh sách hiển thị dạng Lưới (Character Cards Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {characters.map((c) => (
          <Link
            key={c.id}
            href={`/characters/${c.id}`}
            className={`relic-frame ${rarityGlowClass(c.rarity)} bg-neutral-950/60 border border-neutral-800/80 rounded-xl overflow-hidden block group transition-all duration-300 hover:-translate-y-2`}
          >
            {/* Khung ảnh đại diện */}
            <div className="relative aspect-square w-full overflow-hidden bg-neutral-900/50">
              {c.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.iconUrl}
                  alt={c.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">
                  No Image
                </div>
              )}
              {/* Huy hiệu nguyên tố góc trên bên trái */}
              <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-full p-1 shadow-md">
                <ElementIcon vision={c.vision} iconUrl={c.elementIcon} size={16} />
              </div>
            </div>

            {/* Chi tiết văn bản chân thẻ */}
            <div className="p-4 border-t border-neutral-900 bg-neutral-900/20">
              <div className="font-semibold truncate text-neutral-100 group-hover:text-[color:var(--gold-bright)] transition-colors mb-1">
                {c.name}
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-xs text-neutral-500 uppercase tracking-wider">{c.weaponType}</span>
                <span className={`text-[10px] tracking-tighter ${rarityTextClass(c.rarity)}`}>
                  {rarityStars(c.rarity)}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}