import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { elementColor, rarityGlowClass, rarityStars, rarityTextClass } from "@/lib/theme";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CharacterDetail({ params }: PageProps) {
  const { id } = await params;

  // 1. Tìm kiếm thực thể lữ hành duy nhất dựa trên ID từ Supabase
  const c = await prisma.character.findUnique({ 
    where: { id } 
  });

  if (!c) return notFound();

  // 2. Chuyển đổi an toàn dữ liệu kiểu Json phức tạp từ Prisma 7
  const constellations = (c.constellations as any[]) ?? [];
  const talents = (c.talents as any[]) ?? [];
  const color = elementColor(c.vision);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Khối thẻ thông tin chính (Hero Banner Card) */}
      <div className={`relic-frame ${rarityGlowClass(c.rarity)} bg-neutral-900/30 backdrop-blur-md rounded-xl p-6 flex flex-col sm:flex-row gap-6 mb-8 border border-neutral-800/60`}>
        {c.splashUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={c.splashUrl} 
            alt={c.name} 
            className="w-full sm:w-56 h-auto rounded-lg object-cover border border-[color:rgba(201,166,107,0.3)] bg-neutral-950/40" 
          />
        )}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="w-3 h-3 rounded-full transition-all duration-300" 
              style={{ background: color, boxShadow: `0 0 10px ${color}` }} 
            />
            <span className="text-xs font-bold uppercase tracking-widest text-[color:var(--parchment-dim)]">
              {c.vision} &middot; {c.weaponType}
            </span>
          </div>

          <h1 className="font-display text-4xl font-extrabold text-[color:var(--gold-bright)] mb-1 tracking-wide">
            {c.name}
          </h1>

          {c.title && (
            <p className="text-sm text-[color:var(--parchment-dim)] italic mb-3">
              &ldquo;{c.title}&rdquo;
            </p>
          )}

          <p className={`text-xl mb-4 ${rarityTextClass(c.rarity)}`}>
            {rarityStars(c.rarity)}
          </p>

          {c.region && (
            <p className="text-xs text-[color:var(--parchment-dim)] mb-4 font-medium uppercase tracking-wider">
              Vùng đất: <span className="text-neutral-200">{c.region}</span>
            </p>
          )}

          {c.description && (
            <p className="text-sm text-neutral-300 max-w-xl leading-relaxed bg-neutral-950/20 p-3 rounded-lg border border-neutral-800/40 italic">
              {c.description}
            </p>
          )}
        </div>
      </div>

      {/* Khối thuộc tính cơ bản (Base Stats Grid) */}
      <section className="mb-8">
        <h2 className="font-display text-xl font-bold mb-4 text-[color:var(--gold)] uppercase tracking-wide border-b border-neutral-800 pb-2">
          Thuộc Tính Căn Bản (Cấp 1)
        </h2>
        <div className="relic-frame bg-neutral-950/40 border border-neutral-800/80 rounded-xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm text-neutral-200">
          <div>
            <span className="text-[color:var(--parchment-dim)] font-medium block mb-1">Sinh Mệnh (HP)</span> 
            <span className="text-lg font-semibold">{c.baseHp ?? "—"}</span>
          </div>
          <div>
            <span className="text-[color:var(--parchment-dim)] font-medium block mb-1">Tấn Công (ATK)</span> 
            <span className="text-lg font-semibold">{c.baseAtk ?? "—"}</span>
          </div>
          <div>
            <span className="text-[color:var(--parchment-dim)] font-medium block mb-1">Phòng Ngự (DEF)</span> 
            <span className="text-lg font-semibold">{c.baseDef ?? "—"}</span>
          </div>
          <div>
            <span className="text-[color:var(--parchment-dim)] font-medium block mb-1">Đột Phá Tăng</span> 
            <span className="text-md font-semibold text-[color:var(--gold-bright)] truncate block">{c.ascensionStat ?? "—"}</span>
          </div>
        </div>
      </section>

      {/* Khối danh sách kỹ năng thiên phú (Talents) */}
      {talents.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold mb-4 text-[color:var(--gold)] uppercase tracking-wide border-b border-neutral-800 pb-2">
            Hệ Thống Thiên Phú Kỹ Năng
          </h2>
          <div className="space-y-4">
            {talents.map((t: any, i: number) => (
              <div key={i} className="relic-frame bg-neutral-900/20 border border-neutral-800 rounded-xl p-5 hover:bg-neutral-900/40 transition-colors">
                <div className="font-bold text-base text-neutral-100 mb-2 flex items-center gap-2">
                  <span className="text-xs bg-neutral-800 px-2 py-0.5 rounded text-neutral-400">T{i+1}</span>
                  {t.name}
                </div>
                <p className="text-sm text-[color:var(--parchment-dim)] leading-relaxed whitespace-pre-line">
                  {t.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Khối hệ thống cung mệnh chòm sao (Constellations) */}
      {constellations.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold mb-4 text-[color:var(--gold)] uppercase tracking-wide border-b border-neutral-800 pb-2">
            Hệ Thống Cung Mệnh Chòm Sao
          </h2>
          <div className="space-y-4">
            {constellations.map((cs: any, i: number) => (
              <div key={i} className="relic-frame bg-neutral-900/10 border border-neutral-800/80 rounded-xl p-5 hover:border-purple-900/40 transition-all">
                <div className="font-bold text-base mb-2 text-[color:var(--purple-glow)] drop-shadow-[0_0_6px_rgba(168,85,247,0.2)]">
                  C{i + 1} &middot; {cs.name}
                </div>
                <p className="text-sm text-[color:var(--parchment-dim)] leading-relaxed whitespace-pre-line">
                  {cs.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
}
