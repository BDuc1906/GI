import Link from "next/link";
import { prisma } from "../lib/prisma";
import { rarityGlowClass, rarityStars, rarityTextClass } from "../lib/theme";
import { ElementIcon } from "../components/ElementIcon";
import { SafeImage } from "../components/SafeImage";

export default async function Home() {
  const [charCount, weaponCount, artifactCount] = await Promise.all([
    prisma.character.count(),
    prisma.weapon.count(),
    prisma.artifactSet.count(),
  ]);

  const latestCharacters = await prisma.character.findMany({
    take: 6,
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, vision: true, weaponType: true, rarity: true, iconUrl: true, elementIcon: true },
  });

  const latestWeapons = await prisma.weapon.findMany({
    take: 6,
    orderBy: { updatedAt: "desc" },
    select: { id: true, name: true, type: true, rarity: true, iconUrl: true },
  });

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-amber-900/5 via-transparent to-transparent" />
      <div className="relative z-10">
        {/* Hero */}
        <section className="text-center py-16 md:py-24">
          <h1 className="font-display text-5xl md:text-7xl font-bold bg-gradient-to-r from-amber-300 via-amber-500 to-amber-600 bg-clip-text text-transparent drop-shadow-sm">
            LEIBO
          </h1>
          <p className="text-lg md:text-xl text-secondary max-w-2xl mx-auto mt-4 font-light">
            Cẩm nang Genshin Impact toàn diện
          </p>
          <p className="text-sm text-muted max-w-xl mx-auto mt-2">
            Khám phá dữ liệu chi tiết về nhân vật, vũ khí và thánh di vật – được cập nhật từ nguồn chính thức.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="/characters" className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-full shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:scale-105">
              Khám phá nhân vật
            </Link>
            <Link href="/weapons" className="px-8 py-3 border border-border text-secondary font-semibold rounded-full hover:border-amber-400 hover:text-amber-400 transition-all">
              Kho vũ khí
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          {[
            { label: "Nhân vật", count: charCount },
            { label: "Vũ khí", count: weaponCount },
            { label: "Thánh di vật", count: artifactCount },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-2xl p-6 text-center hover:border-gold transition-colors shadow-card">
              <div className="text-4xl font-bold text-amber-500">{stat.count}</div>
              <div className="text-sm text-secondary uppercase tracking-wider mt-1">{stat.label}</div>
            </div>
          ))}
        </section>

        {/* Latest Characters */}
        <section className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold text-primary">Nhân vật mới cập nhật</h2>
            <Link href="/characters" className="text-sm text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
              Xem tất cả <span className="text-lg">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {latestCharacters.map((c) => (
              <Link key={c.id} href={`/characters/${c.id}`} className={`relic-frame ${rarityGlowClass(c.rarity)} overflow-hidden group`}>
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
                  <div className="font-semibold truncate text-primary group-hover:text-amber-400 transition-colors text-sm">
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
        </section>

        {/* Latest Weapons */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-2xl font-semibold text-primary">Vũ khí mới cập nhật</h2>
            <Link href="/weapons" className="text-sm text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1">
              Xem tất cả <span className="text-lg">→</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {latestWeapons.map((w) => (
              <Link key={w.id} href={`/weapons/${w.id}`} className={`relic-frame ${rarityGlowClass(w.rarity)} overflow-hidden group`}>
                <div className="relative aspect-square w-full bg-secondary/40 p-4 flex items-center justify-center overflow-hidden">
                  {w.iconUrl ? (
                    <SafeImage src={w.iconUrl} alt={w.name} fill className="object-contain p-2 group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="text-muted text-xs">No Image</div>
                  )}
                </div>
                <div className="p-3 border-t border-border bg-card/80">
                  <div className="font-semibold truncate text-primary group-hover:text-amber-400 transition-colors text-sm">
                    {w.name}
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-secondary uppercase tracking-wider">{w.type}</span>
                    <span className={`text-[10px] tracking-tighter ${rarityTextClass(w.rarity)}`}>
                      {rarityStars(w.rarity)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-20 pt-8 border-t border-border text-center text-xs text-muted">
          <p>Dữ liệu được lấy từ genshin-db và Enka Network. LEIBO không thuộc sở hữu của miHoYo.</p>
        </footer>
      </div>
    </div>
  );
}
