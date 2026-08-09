import Link from "next/link";
import { unstable_cache } from "next/cache";
import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SafeImage } from "@/components/SafeImage";
import { ElementIcon } from "@/components/ElementIcon";
import { WeaponIcon } from "@/components/WeaponIcon";
import { rarityStars, rarityGlowClass, rarityTextClass } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Nhân vật — LEIBO",
  description: "Danh sách toàn bộ nhân vật Genshin Impact: nguyên tố, vũ khí, độ hiếm.",
};

const getVisionRows = unstable_cache(
  async () => {
    const rows = await prisma.character.findMany({
      distinct: ["vision"],
      select: { vision: true, elementIcon: true },
    });
    // Loại bỏ các giá trị "Unknown" hoặc null để không hiện chip lỗi
    return rows
      .filter((r) => r.vision && r.vision !== "Unknown")
      .map((r) => ({ vision: r.vision, elementIcon: r.elementIcon }));
  },
  ["character-vision-rows-v3"],
  { revalidate: 3600 }
);

const getRegionRows = unstable_cache(
  async () => {
    const rows = await prisma.character.findMany({
      distinct: ["region"],
      select: { region: true },
    });
    return rows
      .map((r) => r.region)
      .filter((r): r is string => Boolean(r));
  },
  ["character-region-rows"],
  { revalidate: 3600 }
);

interface PageProps {
  searchParams: Promise<{ vision?: string; weapon?: string; region?: string; rarity?: string; q?: string }>;
}

function parseMulti(value?: string): string[] {
  if (!value) return [];
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

function toggleValue(current: string[], value: string): string[] {
  return current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
}

export default async function CharactersPage({ searchParams }: PageProps) {
  const { vision, weapon, region, rarity, q } = await searchParams;

  const visionList = parseMulti(vision);
  const weaponList = parseMulti(weapon);
  const regionList = parseMulti(region);
  const rarityList = parseMulti(rarity).map(Number).filter((n) => !Number.isNaN(n));

  const where: Prisma.CharacterWhereInput = {};
  if (visionList.length > 0) {
    where.vision = { in: visionList, mode: "insensitive" };
  }
  if (weaponList.length > 0) where.weaponType = { in: weaponList, mode: "insensitive" };
  if (regionList.length > 0) where.region = { in: regionList, mode: "insensitive" };
  if (rarityList.length > 0) where.rarity = { in: rarityList };
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
  const regionRows = await getRegionRows();
  const weapons = ["Sword", "Claymore", "Polearm", "Bow", "Catalyst"];

  const buildQuery = (
    changes: Partial<Record<"vision" | "weapon" | "region" | "rarity", string>>,
    opts: { toggle?: boolean } = {}
  ) => {
    const sp = new URLSearchParams();
    let nextVision = visionList;
    let nextWeapon = weaponList;
    let nextRegion = regionList;
    let nextRarity = rarityList.map(String);

    if (changes.vision !== undefined) {
      nextVision = opts.toggle ? toggleValue(visionList, changes.vision) : parseMulti(changes.vision);
    }
    if (changes.weapon !== undefined) {
      nextWeapon = opts.toggle ? toggleValue(weaponList, changes.weapon) : parseMulti(changes.weapon);
    }
    if (changes.region !== undefined) {
      nextRegion = opts.toggle ? toggleValue(regionList, changes.region) : parseMulti(changes.region);
    }
    if (changes.rarity !== undefined) {
      nextRarity = opts.toggle
        ? toggleValue(rarityList.map(String), changes.rarity)
        : parseMulti(changes.rarity);
    }

    if (nextVision.length > 0) sp.set("vision", nextVision.join(","));
    if (nextWeapon.length > 0) sp.set("weapon", nextWeapon.join(","));
    if (nextRegion.length > 0) sp.set("region", nextRegion.join(","));
    if (nextRarity.length > 0) sp.set("rarity", nextRarity.join(","));
    if (q) sp.set("q", q);
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
          {visionList.length > 0 && <input type="hidden" name="vision" value={visionList.join(",")} />}
          {weaponList.length > 0 && <input type="hidden" name="weapon" value={weaponList.join(",")} />}
          {regionList.length > 0 && <input type="hidden" name="region" value={regionList.join(",")} />}
          {rarityList.length > 0 && <input type="hidden" name="rarity" value={rarityList.join(",")} />}
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
              href={`/characters?${buildQuery({})}`}
              className="rounded-lg border border-red-900/60 bg-red-950/40 px-4 py-2 text-sm text-red-400 hover:bg-red-900/40 transition-colors"
            >
              Xóa
            </Link>
          )}
        </form>
      </div>

      <div className="bg-card/40 backdrop-blur-md border border-border p-4 rounded-xl mb-8 flex flex-col gap-4">
        {/* Bộ lọc nguyên tố */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-secondary font-medium mr-2">Nguyên tố (Vision):</span>
          {visionRows.map(({ vision: v, elementIcon }) => {
            const active = visionList.includes(v);
            return (
              <Link
                key={v}
                href={`/characters?${buildQuery({ vision: v }, { toggle: true })}`}
                aria-pressed={active}
                className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                  active
                    ? "border-gold bg-gold/20 text-gold-bright font-semibold"
                    : "border-border bg-card/60 hover:border-gold/50 text-primary"
                }`}
              >
                <ElementIcon vision={v} iconUrl={elementIcon} size={16} />
                {v}
              </Link>
            );
          })}
        </div>

        {/* Bộ lọc vũ khí */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-secondary font-medium mr-2">Loại Vũ Khí:</span>
          {weapons.map((w) => {
            const active = weaponList.includes(w);
            return (
              <Link
                key={w}
                href={`/characters?${buildQuery({ weapon: w }, { toggle: true })}`}
                aria-pressed={active}
                className={`px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                  active
                    ? "border-gold bg-gold/20 text-gold-bright font-semibold"
                    : "border-border bg-card/60 hover:border-gold/50 text-primary"
                }`}
              >
                <WeaponIcon type={w} size={16} />
                {w}
              </Link>
            );
          })}
        </div>

        {/* Bộ lọc vùng */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-secondary font-medium mr-2">Vùng (Region):</span>
          {regionRows.map((r) => {
            const active = regionList.includes(r);
            return (
              <Link
                key={r}
                href={`/characters?${buildQuery({ region: r }, { toggle: true })}`}
                aria-pressed={active}
                className={`px-3 py-1.5 rounded-full border transition-all ${
                  active
                    ? "border-gold bg-gold/20 text-gold-bright font-semibold"
                    : "border-border bg-card/60 hover:border-gold/50 text-primary"
                }`}
              >
                {r}
              </Link>
            );
          })}
        </div>

        {/* Bộ lọc phẩm cấp */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-secondary font-medium mr-2">Phẩm cấp (Rarity):</span>
          {[4, 5].map((r) => {
            const active = rarityList.includes(r);
            return (
              <Link
                key={r}
                href={`/characters?${buildQuery({ rarity: String(r) }, { toggle: true })}`}
                aria-pressed={active}
                className={`px-3 py-1.5 rounded-full border font-bold transition-all ${
                  active
                    ? "border-gold bg-gold/20 text-rarity-star"
                    : "border-border bg-card/60 hover:border-gold/50 text-rarity-star"
                }`}
              >
                {rarityStars(r)}
              </Link>
            );
          })}
          {(visionList.length || weaponList.length || regionList.length || rarityList.length || q) && (
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
        {Array.from(travelerByElement.entries()).map(([el, { boy, girl }], index) => {
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
                {boyImg && girlImg ? (
                  <>
                    <div className="absolute inset-0" style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}>
                      <SafeImage src={boyImg} alt={`Traveler (${el}) - Nam`} fill priority={index < 6} sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 213px" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="absolute inset-0" style={{ clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)" }}>
                      <SafeImage src={girlImg} alt={`Traveler (${el}) - Nữ`} fill priority={index < 6} sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 213px" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="absolute top-0 bottom-0 left-1/2 w-px bg-black/40 -translate-x-1/2" />
                  </>
                ) : (
                  <SafeImage src={boyImg || girlImg} alt={`Traveler (${el})`} fill priority={index < 6} sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 213px" className="object-cover group-hover:scale-110 transition-transform duration-500" />
                )}
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
        {nonTraveler.map((c, index) => (
          <Link
            key={c.id}
            href={`/characters/${c.id}`}
            className={`relic-frame ${rarityGlowClass(c.rarity)} overflow-hidden group`}
          >
            <div className="relative aspect-square w-full overflow-hidden bg-secondary/50">
              {c.iconUrl ? (
                <SafeImage src={c.iconUrl} alt={c.name} fill priority={index < 6} sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 213px" className="object-cover group-hover:scale-110 transition-transform duration-500" />
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