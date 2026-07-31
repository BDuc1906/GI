import Link from "next/link";
import { Prisma } from "@prisma/client";
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
  searchParams: Promise<{ vision?: string; weapon?: string; rarity?: string; q?: string }>;
}

export default async function CharactersPage({ searchParams }: PageProps) {
  const { vision, weapon, rarity, q } = await searchParams;

  // Trước đây: `const where: any = {}` — không có kiểm tra kiểu nào cả, một
  // lỗi gõ nhầm tên field (vd "visons" thay vì "vision") sẽ chỉ vỡ lúc chạy
  // (runtime), không báo ngay lúc build. Dùng đúng type sinh ra từ schema
  // Prisma để TypeScript bắt lỗi field/kiểu dữ liệu sai ngay khi biên dịch.
  const where: Prisma.CharacterWhereInput = {};
  if (vision) where.vision = { equals: vision, mode: "insensitive" };
  if (weapon) where.weaponType = { equals: weapon, mode: "insensitive" };
  if (rarity) where.rarity = Number(rarity);
  if (q) where.name = { contains: q, mode: "insensitive" };

  const characters = await prisma.character.findMany({
    where,
    orderBy: [{ rarity: "desc" }, { name: "asc" }],
  });

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

  const visionRows = await getVisionRows();
  const weapons = ["Sword", "Claymore", "Polearm", "Bow", "Catalyst"];

  const buildQuery = (params: Record<string, string | undefined>) => {
    const sp = new URLSearchParams();
    if (vision) sp.set("vision", vision);
    if (weapon) sp.set("weapon", weapon);
    if (rarity) sp.set("rarity", rarity);
    if (q) sp.set("q", q);
    Object.entries(params).forEach(([k, v]) => {
      if (v) sp.set(k, v);
      else sp.delete(k);
    });
    return sp.toString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-wide text-primary uppercase mb-2">
          Học Viện Nhân Vật
        </h1>
        <p className="text-sm text-secondary">
          Tìm thấy{" "}
          <span className="text-gold-bright font-semibold">
            {nonTraveler.length + travelerByElement.size}
          </span>{" "}
          đại hiệp lữ hành
        </p>
      </div>

      <div className="mb-6">
        <form method="GET" className="flex gap-2">
          {vision && <input type="hidden" name="vision" value={vision} />}
          {weapon && <input type="hidden" name="weapon" value={weapon} />}
          {rarity && <input type="hidden" name="rarity" value={rarity} />}
          <input
            type="text"
            name="q"
            defaultValue={q || ""}
            placeholder="Tìm tên nhân vật..."
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
              href={`/characters?${buildQuery({ q: undefined })}`}
              className="rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-2 text-sm text-red-400 hover:bg-red-900/40 transition-colors"
            >
              Xóa
            </Link>
          )}
        </form>
      </div>

      <div className="bg-card/40 backdrop-blur-md border border-border p-4 rounded-xl mb-8 flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-secondary font-medium mr-2">Nguyên tố (Vision):</span>
          {visionRows.map(({ vision: v, elementIcon }) => (
            <Link
              key={v}
              href={`/characters?${buildQuery({ vision: v })}`}
              className="px-3 py-1.5 rounded-full border border-border bg-card/60 hover:border-gold/50 transition-all flex items-center gap-1.5 text-primary"
            >
              <ElementIcon vision={v} iconUrl={elementIcon} size={16} />
              {v}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-secondary font-medium mr-2">Loại Vũ Khí:</span>
          {weapons.map((w) => (
            <Link
              key={w}
              href={`/characters?${buildQuery({ weapon: w })}`}
              className="px-3 py-1.5 rounded-full border border-border bg-card/60 hover:border-gold/50 transition-all text-primary"
            >
              {w}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-secondary font-medium mr-2">Phẩm cấp (Rarity):</span>
          {[4, 5].map((r) => (
            <Link
              key={r}
              href={`/characters?${buildQuery({ rarity: String(r) })}`}
              className={`px-3 py-1.5 rounded-full border border-border bg-card/60 hover:border-gold/50 transition-all ${rarityTextClass(r)}`}
            >
              {rarityStars(r)}
            </Link>
          ))}
          {(vision || weapon || rarity || q) && (
            <Link
              href="/characters"
              className="ml-auto px-4 py-1.5 rounded-full bg-red-950/40 border border-red-900/60 text-red-400 hover:bg-red-900/40 transition-colors text-xs font-semibold"
            >
              Xóa Bộ Lọc &times;
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {Array.from(travelerByElement.entries()).map(([el, { boy, girl }]) => {
          const target = boy ?? girl!;
          const boyImg = boy?.iconUrl ?? null;
          const girlImg = girl?.iconUrl ?? null;
          return (
            <Link
              key={`traveler-${el}`}
              href={`/characters/${target.id}`}
              className={`relic-frame ${rarityGlowClass(target.rarity)} overflow-hidden group`}
            >
              <div className="relative aspect-square w-full overflow-hidden bg-secondary/50">
                <div
                  className="absolute inset-0"
                  style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}
                >
                  {boyImg ? (
                    <SafeImage src={boyImg} alt={`Traveler (${el}) - Nam`} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-[10px]">—</div>
                  )}
                </div>
                <div
                  className="absolute inset-0"
                  style={{ clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)" }}
                >
                  {girlImg ? (
                    <SafeImage src={girlImg} alt={`Traveler (${el}) - Nữ`} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-[10px]">—</div>
                  )}
                </div>
                <div className="absolute top-0 bottom-0 left-1/2 w-px bg-black/40 -translate-x-1/2" />
                <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm rounded-full p-1">
                  <ElementIcon vision={el} iconUrl={target.elementIcon} size={16} />
                </div>
              </div>
              <div className="p-3 border-t border-border bg-card/80">
                <div className="font-semibold truncate text-primary group-hover:text-gold-bright transition-colors text-sm">
                  Traveler ({el})
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[10px] text-secondary uppercase tracking-wider">Sword</span>
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
            className={`relic-frame ${rarityGlowClass(c.rarity)} overflow-hidden group`}
          >
            <div className="relative aspect-square w-full overflow-hidden bg-secondary/50">
              {c.iconUrl ? (
                <SafeImage src={c.iconUrl} alt={c.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted text-xs">No Image</div>
              )}
              <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm rounded-full p-1">
                <ElementIcon vision={c.vision} iconUrl={c.elementIcon} size={16} />
              </div>
            </div>
            <div className="p-3 border-t border-border bg-card/80">
              <div className="font-semibold truncate text-primary group-hover:text-gold-bright transition-colors text-sm">
                {c.name}
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] text-secondary uppercase tracking-wider">{c.weaponType}</span>
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
