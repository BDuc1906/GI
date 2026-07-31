import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { rarityGlowClass, rarityStars, rarityTextClass } from "@/lib/theme";
import { ElementIcon } from "@/components/ElementIcon";
import { SafeImage } from "@/components/SafeImage";
import type { Metadata } from "next";
import {
  TALENT_LABEL_VI,
  formatNumber,
  formatSpecialized,
  getMaterialIconMap,
  resolveTravelerSibling,
  type AscensionMaterialPhase,
  type StatByLevelRow,
  type VoiceActors,
} from "@/lib/character-helpers";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const c = await prisma.character.findUnique({ where: { id } });
  if (!c) return { title: "Không tìm thấy nhân vật — LEIBO" };
  return {
    title: `${c.name} — LEIBO`,
    description: c.description ?? `${c.vision} · ${c.weaponType} · ${c.rarity}★`,
  };
}

export default async function CharacterDetail({ params }: PageProps) {
  const { id } = await params;

  const c = await prisma.character.findUnique({
    where: { id },
  });

  if (!c) return notFound();

  const { isTraveler, boySplash, girlSplash } = await resolveTravelerSibling(c);

  const constellations = (c.constellations as any[]) ?? [];
  const talents = (c.talents as any[]) ?? [];
  const ascensionMaterials = (c.ascensionMaterials as unknown as AscensionMaterialPhase[]) ?? [];
  const statsByLevel = (c.statsByLevel as unknown as StatByLevelRow[]) ?? [];
  const voiceActors = (c.voiceActors as unknown as VoiceActors) ?? null;

  const materialIconMap = await getMaterialIconMap(ascensionMaterials);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Hero Banner */}
      <div className={`relic-frame ${rarityGlowClass(c.rarity)} bg-card backdrop-blur-md rounded-xl p-6 flex flex-col sm:flex-row gap-6 mb-8 border border-border`}>
        {isTraveler ? (
          <div className="relative w-full sm:w-56 aspect-[3/4] rounded-lg overflow-hidden border border-gold/30 bg-secondary/40 shrink-0">
            <div className="absolute inset-0" style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}>
              {boySplash ? (
                <SafeImage src={boySplash} alt={`${c.name} - Nam`} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted text-[10px]">—</div>
              )}
            </div>
            <div className="absolute inset-0" style={{ clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)" }}>
              {girlSplash ? (
                <SafeImage src={girlSplash} alt={`${c.name} - Nữ`} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted text-[10px]">—</div>
              )}
            </div>
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-black/40 -translate-x-1/2" />
          </div>
        ) : (
          c.splashUrl && (
            <div className="relative w-full sm:w-56 aspect-[3/4] rounded-lg overflow-hidden border border-gold/30 bg-secondary/40 shrink-0">
              <SafeImage src={c.splashUrl} alt={c.name} fill className="object-cover" />
            </div>
          )
        )}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <ElementIcon vision={c.vision} iconUrl={c.elementIcon} size={24} />
            <span className="text-xs font-bold uppercase tracking-widest text-muted">
              {c.vision} &middot; {c.weaponType}
            </span>
          </div>

          <h1 className="font-display text-4xl font-extrabold text-gold-bright mb-1 tracking-wide">
            {isTraveler ? `Traveler (${c.vision})` : c.name}
          </h1>

          {c.title && (
            <p className="text-sm text-muted italic mb-3">
              &ldquo;{c.title}&rdquo;
            </p>
          )}

          <p className={`text-xl mb-4 ${rarityTextClass(c.rarity)}`}>
            {rarityStars(c.rarity)}
          </p>

          {c.region && (
            <p className="text-xs text-muted mb-2 font-medium uppercase tracking-wider">
              Vùng đất: <span className="text-primary">{c.region}</span>
            </p>
          )}

          {(c.birthday || c.constellationName || c.gameVersion) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted mb-3">
              {c.birthday && (
                <span>
                  Sinh nhật: <span className="text-primary">{c.birthday}</span>
                </span>
              )}
              {c.constellationName && (
                <span>
                  Chòm sao: <span className="text-primary">{c.constellationName}</span>
                </span>
              )}
              {c.gameVersion && (
                <span>
                  Ra mắt phiên bản: <span className="text-primary">{c.gameVersion}</span>
                </span>
              )}
            </div>
          )}

          {c.description && (
            <p className="text-sm text-primary max-w-xl leading-relaxed bg-card/50 p-3 rounded-lg border border-border italic mb-3">
              {c.description}
            </p>
          )}

          {voiceActors && (voiceActors.japanese || voiceActors.english || voiceActors.chinese || voiceActors.korean) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted mb-2">
              {voiceActors.japanese && <span>🇯🇵 {voiceActors.japanese}</span>}
              {voiceActors.english && <span>🇬🇧 {voiceActors.english}</span>}
              {voiceActors.chinese && <span>🇨🇳 {voiceActors.chinese}</span>}
              {voiceActors.korean && <span>🇰🇷 {voiceActors.korean}</span>}
            </div>
          )}

          {c.wikiUrl && (
            <a href={c.wikiUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:text-gold-bright underline underline-offset-2 w-fit">Xem thêm trên Wiki &rarr;</a>
          )}
        </div>
      </div>

      {/* Base Stats */}
      <section className="mb-8">
        <h2 className="font-display text-xl font-bold mb-4 text-gold uppercase tracking-wide border-b border-border pb-2">
          Thuộc Tính Căn Bản (Cấp 1)
        </h2>
        <div className="relic-frame bg-card border border-border rounded-xl p-5 grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
          <div>
            <span className="text-muted font-medium block mb-1">Sinh Mệnh (HP)</span> 
            <span className="text-lg font-semibold text-primary">{formatNumber(c.baseHp)}</span>
          </div>
          <div>
            <span className="text-muted font-medium block mb-1">Tấn Công (ATK)</span> 
            <span className="text-lg font-semibold text-primary">{formatNumber(c.baseAtk)}</span>
          </div>
          <div>
            <span className="text-muted font-medium block mb-1">Phòng Ngự (DEF)</span> 
            <span className="text-lg font-semibold text-primary">{formatNumber(c.baseDef)}</span>
          </div>
          <div>
            <span className="text-muted font-medium block mb-1">Đột Phá Tăng</span> 
            <span className="text-md font-semibold text-gold-bright truncate block">{c.ascensionStat ?? "—"}</span>
          </div>
        </div>
      </section>

      {/* Stats Table */}
      {statsByLevel.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold mb-4 text-gold uppercase tracking-wide border-b border-border pb-2">
            Chỉ Số Theo Cấp Độ
          </h2>
          <div className="relic-frame bg-card border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th>Cấp</th>
                  <th>Đột Phá</th>
                  <th>HP</th>
                  <th>ATK</th>
                  <th>DEF</th>
                  <th>{c.ascensionStat ?? "Chỉ số phụ"}</th>
                </tr>
              </thead>
              <tbody>
                {statsByLevel.map((row, i) => (
                  <tr key={i}>
                    <td>{row.level}</td>
                    <td className="text-muted">{row.ascension ?? "—"}</td>
                    <td>{formatNumber(row.hp)}</td>
                    <td>{formatNumber(row.attack)}</td>
                    <td>{formatNumber(row.defense)}</td>
                    <td className="text-gold-bright">
                      {row.specialized ? formatSpecialized(row.specialized, c.ascensionStat) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Ascension Materials */}
      {ascensionMaterials.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold mb-4 text-gold uppercase tracking-wide border-b border-border pb-2">
            Nguyên Liệu Đột Phá
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ascensionMaterials.map((phase) => (
              <div
                key={phase.phase}
                className="relic-frame bg-card border border-border rounded-xl p-4"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-gold mb-3">
                  Giai Đoạn {phase.phase}
                </div>
                <ul className="space-y-1.5 text-sm">
                  {phase.materials.map((m, j) => {
                    const iconUrl = m.materialId ? materialIconMap.get(m.materialId) : null;
                    return (
                      <li key={j} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 min-w-0">
                          <span className="relative w-6 h-6 shrink-0 rounded bg-secondary border border-border overflow-hidden">
                            {iconUrl ? (
                              <SafeImage src={iconUrl} alt={m.name ?? ""} fill className="object-contain" />
                            ) : null}
                          </span>
                          <span className="text-secondary truncate">{m.name}</span>
                        </span>
                        <span className="font-semibold text-primary shrink-0">
                          {m.count ? `x${m.count.toLocaleString("vi-VN")}` : ""}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Talents */}
      {talents.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold mb-4 text-gold uppercase tracking-wide border-b border-border pb-2">
            Hệ Thống Thiên Phú Kỹ Năng
          </h2>
          <div className="space-y-4">
            {talents.map((t: any, i: number) => (
              <div key={i} className="relic-frame bg-card border border-border rounded-xl p-5 hover:bg-card/80 transition-colors">
                <div className="font-bold text-base text-primary mb-2 flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted">
                    {TALENT_LABEL_VI[t.key] ?? t.key}
                  </span>
                  {t.name}
                </div>
                <p className="text-sm text-secondary leading-relaxed whitespace-pre-line">
                  {t.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Constellations */}
      {constellations.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold mb-4 text-gold uppercase tracking-wide border-b border-border pb-2">
            Hệ Thống Cung Mệnh Chòm Sao
          </h2>
          <div className="space-y-4">
            {constellations.map((cs: any, i: number) => (
              <div key={i} className="relic-frame bg-card border border-border rounded-xl p-5 hover:border-purple-400/40 transition-all">
                <div className="font-bold text-base mb-2 text-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.2)]">
                  C{i + 1} &middot; {cs.name}
                </div>
                <p className="text-sm text-secondary leading-relaxed whitespace-pre-line">
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