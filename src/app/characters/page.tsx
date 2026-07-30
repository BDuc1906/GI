// src/app/characters/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { rarityGlowClass, rarityStars, rarityTextClass } from "@/lib/theme";
import { ElementIcon } from "@/components/ElementIcon";
import { SafeImage } from "@/components/SafeImage";
import { unstable_cache } from "next/cache";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nhân vật — LEIBO",
  description: "Danh sách toàn bộ nhân vật Genshin Impact: nguyên tố, vũ khí, độ hiếm.",
};

// Trang này đọc searchParams (bộ lọc) nên Next luôn render động — không thể
// cache toàn trang bằng `export const revalidate`. Nhưng danh sách nguyên
// tố (visionRows) KHÔNG phụ thuộc filter, giống nhau ở mọi lượt truy cập,
// nên tách riêng ra cache 1 giờ bằng unstable_cache thay vì query lại DB
// mỗi request — đỡ 1 round-trip DB không cần thiết cho phần không đổi.
const getVisionRows = unstable_cache(
  async () =>
    prisma.character.findMany({
      distinct: ["vision"],
      select: { vision: true, elementIcon: true },
    }),
  ["character-vision-rows"],
  { revalidate: 3600 }
);

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

  // Traveler có 2 biến thể giới tính cho mỗi nguyên tố (đã seed thật trong DB:
  // "traveler-boy-<element>" / "traveler-girl-<element>"). Giống các web
  // Genshin database khác, ta chỉ hiện 1 thẻ / nguyên tố — nhưng thay vì chọn
  // đại 1 giới tính, ảnh đại diện của thẻ đó ghép nửa icon Boy + nửa icon Girl
  // (đúng ảnh thật lấy từ DB, không tạo ảnh mới). Click vào thẻ sẽ vào trang
  // detail của biến thể Boy (mặc định), từ đó vẫn xem được đầy đủ stat/talent
  // thật của biến thể đó như mọi nhân vật khác.
  const travelerByElement = new Map<
    string,
    { boy?: (typeof characters)[number]; girl?: (typeof characters)[number] }
  >();
  const nonTraveler: typeof characters = [];

  for (const c of characters) {
    if (c.id.startsWith("traveler-boy-")) {
      const bucket = travelerByElement.get(c.vision) ?? {};
      bucket.boy = c;
      travelerByElement.set(c.vision, bucket);
    } else if (c.id.startsWith("traveler-girl-")) {
      const bucket = travelerByElement.get(c.vision) ?? {};
      bucket.girl = c;
      travelerByElement.set(c.vision, bucket);
    } else {
      nonTraveler.push(c);
    }
  }

  // thay vì chỉ lấy tên nguyên tố, lấy luôn 1 elementIcon đại diện mỗi nguyên tố
  const visionRows = await getVisionRows();
  const weapons = ["Sword", "Claymore", "Polearm", "Bow", "Catalyst"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Khối tiêu đề */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-wide text-neutral-100 uppercase mb-2">
          Học Viện Nhân Vật
        </h1>
        <p className="text-sm text-[color:var(--parchment-dim)]">
          Tìm thấy{" "}
          <span className="text-[color:var(--gold-bright)] font-semibold">
            {nonTraveler.length + travelerByElement.size}
          </span>{" "}
          đại hiệp lữ hành
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
        {/* 1 thẻ / nguyên tố cho Traveler — ảnh ghép nửa Nam / nửa Nữ */}
        {Array.from(travelerByElement.entries()).map(([el, { boy, girl }]) => {
          const target = boy ?? girl!;
          const boyImg = boy?.iconUrl ?? null;
          const girlImg = girl?.iconUrl ?? null;

          return (
            <Link
              key={`traveler-${el}`}
              href={`/characters/${target.id}`}
              className={`relic-frame ${rarityGlowClass(target.rarity)} bg-neutral-950/60 border border-neutral-800/80 rounded-xl overflow-hidden block group transition-all duration-300 hover:-translate-y-2`}
            >
              <div className="relative aspect-square w-full overflow-hidden bg-neutral-900/50">
                {/* Nửa trái: icon Boy */}
                <div
                  className="absolute inset-0"
                  style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}
                >
                  {boyImg ? (
                    <SafeImage
                      src={boyImg}
                      alt={`Traveler (${el}) - Nam`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 text-[10px]">
                      —
                    </div>
                  )}
                </div>
                {/* Nửa phải: icon Girl */}
                <div
                  className="absolute inset-0"
                  style={{ clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)" }}
                >
                  {girlImg ? (
                    <SafeImage
                      src={girlImg}
                      alt={`Traveler (${el}) - Nữ`}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 text-[10px]">
                      —
                    </div>
                  )}
                </div>
                {/* Đường chia giữa */}
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-black/40 -translate-x-1/2" />
                <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-sm rounded-full p-1 shadow-md">
                  <ElementIcon vision={el} iconUrl={target.elementIcon} size={16} />
                </div>
              </div>

              <div className="p-4 border-t border-neutral-900 bg-neutral-900/20">
                <div className="font-semibold truncate text-neutral-100 group-hover:text-[color:var(--gold-bright)] transition-colors mb-1">
                  Traveler ({el})
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-xs text-neutral-500 uppercase tracking-wider">Sword</span>
                  <span className={`text-[10px] tracking-tighter ${rarityTextClass(target.rarity)}`}>
                    {rarityStars(target.rarity)}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}

        {nonTraveler.map((c) => (
          <Link
            key={c.id}
            href={`/characters/${c.id}`}
            className={`relic-frame ${rarityGlowClass(c.rarity)} bg-neutral-950/60 border border-neutral-800/80 rounded-xl overflow-hidden block group transition-all duration-300 hover:-translate-y-2`}
          >
            {/* Khung ảnh đại diện */}
            <div className="relative aspect-square w-full overflow-hidden bg-neutral-900/50">
              {c.iconUrl ? (
                <SafeImage
                  src={c.iconUrl}
                  alt={c.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  fallbackClassName="w-full h-full flex items-center justify-center text-neutral-600 text-xs"
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