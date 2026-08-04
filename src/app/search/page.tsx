import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { rarityGlowClass, rarityStars, rarityTextClass } from "@/lib/theme";
import { ElementIcon } from "@/components/ElementIcon";
import { SafeImage } from "@/components/SafeImage";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

const MAX_RESULTS_PER_TYPE = 24;

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  const query = (q ?? "").trim();
  return {
    title: query ? `Tìm kiếm "${query}" — LEIBO` : "Tìm kiếm — LEIBO",
    description: "Tìm kiếm nhân vật, vũ khí và thánh di vật Genshin Impact trên LEIBO.",
    // Trang kết quả tìm kiếm không cần index — tránh trùng nội dung với
    // /characters, /weapons, /artifacts trên Google.
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  if (!query) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display text-3xl font-bold text-primary mb-3">Tìm Kiếm</h1>
        <p className="text-sm text-secondary">
          Nhập tên nhân vật, vũ khí hoặc thánh di vật ở ô tìm kiếm phía trên để bắt đầu.
        </p>
      </div>
    );
  }

  const [characters, weapons, artifacts, domains] = await Promise.all([
    prisma.character.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
      take: MAX_RESULTS_PER_TYPE,
      select: {
        id: true,
        name: true,
        vision: true,
        weaponType: true,
        rarity: true,
        iconUrl: true,
        elementIcon: true,
      },
    }),
    prisma.weapon.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      orderBy: [{ rarity: "desc" }, { name: "asc" }],
      take: MAX_RESULTS_PER_TYPE,
      select: { id: true, name: true, type: true, rarity: true, iconUrl: true },
    }),
    prisma.artifactSet.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      orderBy: { name: "asc" },
      take: MAX_RESULTS_PER_TYPE,
      select: { id: true, name: true, rarityRange: true, iconUrl: true },
    }),
    prisma.domain.findMany({
      where: { name: { contains: query, mode: "insensitive" } },
      orderBy: { name: "asc" },
      take: MAX_RESULTS_PER_TYPE,
      select: { id: true, name: true, category: true, imageUrl: true },
    }),
  ]);

  const totalResults = characters.length + weapons.length + artifacts.length + domains.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-wide text-primary uppercase mb-2">
          Kết Quả Tìm Kiếm
        </h1>
        <p className="text-sm text-secondary">
          {totalResults > 0 ? (
            <>
              Tìm thấy <span className="text-gold-bright font-semibold">{totalResults}</span> kết quả cho{" "}
              <span className="text-gold-bright font-semibold">&ldquo;{query}&rdquo;</span>
            </>
          ) : (
            <>
              Không tìm thấy kết quả nào cho{" "}
              <span className="text-gold-bright font-semibold">&ldquo;{query}&rdquo;</span>
            </>
          )}
        </p>
      </div>

      {characters.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-xl font-semibold text-primary mb-4">
            Nhân Vật ({characters.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {characters.map((c) => (
              <Link
                key={c.id}
                href={`/characters/${c.id}`}
                className={`relic-frame ${rarityGlowClass(c.rarity)} overflow-hidden group`}
              >
                <div className="relative aspect-square w-full overflow-hidden bg-secondary/50">
                  {c.iconUrl ? (
                    <SafeImage
                      src={c.iconUrl}
                      alt={c.name}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 213px"
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-xs">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/40 backdrop-blur-sm rounded-full p-1">
                    <ElementIcon vision={c.vision} iconUrl={c.elementIcon} size={16} />
                  </div>
                </div>
                <div className="p-3 border-t border-border bg-card/80">
                  <div className="font-semibold truncate text-primary group-hover:text-amber-400 transition-colors text-sm">
                    {c.name}
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-secondary uppercase tracking-wider">
                      {c.weaponType}
                    </span>
                    <span className={`text-[10px] tracking-tighter ${rarityTextClass(c.rarity)}`}>
                      {rarityStars(c.rarity)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {weapons.length > 0 && (
        <section className="mb-12">
          <h2 className="font-display text-xl font-semibold text-primary mb-4">
            Vũ Khí ({weapons.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {weapons.map((w) => (
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
                    <span className="text-[10px] text-secondary tracking-wider uppercase font-medium">
                      {w.type}
                    </span>
                    <span className={`text-[10px] tracking-tighter ${rarityTextClass(w.rarity)}`}>
                      {rarityStars(w.rarity)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {artifacts.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-semibold text-primary mb-4">
            Thánh Di Vật ({artifacts.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {artifacts.map((a) => {
              const rarityRange = a.rarityRange as number[];
              const maxRarity = rarityRange.length ? Math.max(...rarityRange) : 4;
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
                      Phẩm cấp: {rarityRange.join("–")}★
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {domains.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold text-primary mb-4">
            Bí Cảnh ({domains.length})
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {domains.map((d) => (
              <Link key={d.id} href={`/domains/${d.id}`} className="relic-frame overflow-hidden group flex gap-3 p-3">
                <div className="relative w-14 h-14 shrink-0 rounded-lg bg-secondary/40 overflow-hidden">
                  {d.imageUrl ? (
                    <SafeImage src={d.imageUrl} alt={d.name} fill sizes="56px" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted text-[10px]">—</div>
                  )}
                </div>
                <div className="min-w-0 flex flex-col justify-center">
                  <div className="font-bold truncate text-primary group-hover:text-gold-bright transition-colors text-sm">
                    {d.name}
                  </div>
                  <div className="text-[10px] text-secondary uppercase tracking-wider mt-1">{d.category}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}