import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { rarityGlowClass, rarityStars, rarityTextClass } from "@/lib/theme";
import { ElementIcon } from "@/components/ElementIcon";
import { SafeImage } from "@/components/SafeImage";
import { CharacterLevelSlider } from "@/components/CharacterLevelSlider";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";
import type { Metadata } from "next";
import {
  TALENT_LABEL_VI,
  formatNumber,
  formatSpecialized,
  resolveTravelerSibling,
  type AscensionMaterialPhase,
  type Constellation,
  type StatByLevelRow,
  type Talent,
  type TalentMaterialLevel,
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

  const constellations = (c.constellations as unknown as Constellation[]) ?? [];
  const talents = (c.talents as unknown as Talent[]) ?? [];
  const ascensionMaterials = (c.ascensionMaterials as unknown as AscensionMaterialPhase[]) ?? [];
  const statsByLevel = (c.statsByLevel as unknown as StatByLevelRow[]) ?? [];
  const voiceActors = (c.voiceActors as unknown as VoiceActors) ?? null;
  const talentMaterials = (c.talentMaterials as unknown as TalentMaterialLevel[]) ?? [];

  // Gom tất cả materialId để lấy icon
  const materialIds = new Set<string>();
  for (const phase of ascensionMaterials) {
    for (const m of phase.materials) {
      if (m.materialId) materialIds.add(m.materialId);
    }
  }
  for (const levelData of talentMaterials) {
    for (const m of levelData.materials) {
      if (m.materialId) materialIds.add(m.materialId);
    }
  }
  const materialIcons = await prisma.material.findMany({
    where: { id: { in: Array.from(materialIds) } },
    select: { id: true, iconUrl: true },
  });
  const materialIconMap = new Map(materialIcons.map((m) => [m.id, m.iconUrl]));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <BreadcrumbJsonLd
        items={[
          { name: "LEIBO", path: "/" },
          { name: "Nhân vật", path: "/characters" },
          { name: isTraveler ? `Traveler (${c.vision})` : c.name, path: `/characters/${c.id}` },
        ]}
      />

      {/* Hero Banner */}
      <div className={`relic-frame ${rarityGlowClass(c.rarity)} bg-card backdrop-blur-md rounded-xl p-6 flex flex-col sm:flex-row gap-6 mb-8 border border-border`}>
        {isTraveler ? (
  <div className="relative w-full sm:w-56 aspect-[3/4] rounded-lg overflow-hidden border border-gold/30 bg-secondary/40 shrink-0">
    {boySplash && girlSplash ? (
      // Cả hai đều có -> ghép đôi
      <>
        <div className="absolute inset-0" style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}>
          <SafeImage src={boySplash} alt={`${c.name} - Nam`} fill className="object-cover" sizes="(max-width: 640px) 100vw, 224px" fallbackSrcs={[c.iconUrl, c.iconUrlOriginal]} />
        </div>
        <div className="absolute inset-0" style={{ clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)" }}>
          <SafeImage src={girlSplash} alt={`${c.name} - Nữ`} fill className="object-cover" sizes="(max-width: 640px) 100vw, 224px" fallbackSrcs={[c.iconUrl, c.iconUrlOriginal]} />
        </div>
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-black/40 -translate-x-1/2" />
      </>
    ) : (
      // Chỉ có một bên -> hiển thị full ảnh (hoặc icon nếu không có splash).
      // `src` chấp nhận null/undefined trực tiếp (xem SafeImage.tsx) — không
      // còn cần ép '' khi cả 2 nguồn đều thiếu.
      <SafeImage 
        src={boySplash || girlSplash || c.iconUrl} 
        alt={c.name} 
        fill 
        className="object-cover" 
        sizes="(max-width: 640px) 100vw, 224px" 
        priority={true}
        fallbackSrcs={[c.iconUrl, c.iconUrlOriginal]}
      />
    )}
  </div>
) : (
  // Fallback splash -> icon -> URL gốc (hotlink) đã lưu lúc crawl, nếu cả
  // bản mirror trên R2 lẫn icon cũng lỗi.
  <div className="relative w-full sm:w-56 aspect-[3/4] rounded-lg overflow-hidden border border-gold/30 bg-secondary/40 shrink-0">
    <SafeImage
      src={c.splashUrl || c.iconUrl}
      alt={c.name}
      fill
      className="object-cover"
      sizes="(max-width: 640px) 100vw, 224px"
      priority={true}
      fallbackSrcs={[c.iconUrl, c.splashUrlOriginal, c.iconUrlOriginal]}
    />
  </div>
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

          {(c.region || c.affiliation) && (
            <p className="text-xs text-muted mb-2 font-medium uppercase tracking-wider">
              {c.region && (
                <>
                  Vùng đất: <span className="text-primary">{c.region}</span>
                </>
              )}
              {c.region && c.affiliation && <span className="mx-2 text-border">·</span>}
              {c.affiliation && (
                <>
                  Phe phái: <span className="text-primary">{c.affiliation}</span>
                </>
              )}
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

      {/* Level Slider — tương tác, tính real-time từ statsByLevel thật */}
      {statsByLevel.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold mb-4 text-gold uppercase tracking-wide border-b border-border pb-2">
            Tra Cứu Chỉ Số Theo Cấp
          </h2>
          <CharacterLevelSlider statsByLevel={statsByLevel} ascensionStat={c.ascensionStat} />
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
              <div key={phase.phase} className="relic-frame bg-card border border-border rounded-xl p-4">
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
                              <SafeImage src={iconUrl} alt={m.name ?? ""} fill className="object-contain" sizes="24px" />
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

      {/* Talent Level-Up Materials - Bảng chi tiết */}
      {talentMaterials.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold mb-4 text-gold uppercase tracking-wide border-b border-border pb-2">
            Nguyên Liệu Nâng Cấp Thiên Phú
          </h2>
          <div className="relic-frame bg-card border border-border rounded-xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="w-20">Cấp</th>
                  <th>Nguyên liệu</th>
                </tr>
              </thead>
              <tbody>
                {talentMaterials.map((levelData) => {
                  const materials = levelData.materials || [];
                  return (
                    <tr key={levelData.level}>
                      <td className="font-medium text-primary">Cấp {levelData.level}</td>
                      <td>
                        <div className="flex flex-wrap gap-2 py-1">
                          {materials.map((m, idx: number) => {
                            const iconUrl = m.materialId ? materialIconMap.get(m.materialId) : null;
                            // Định dạng số với dấu chấm phân cách hàng nghìn
                            const formattedCount = m.count ? m.count.toLocaleString("vi-VN") : "";
                            return (
                              <span
                                key={idx}
                                className="flex items-center gap-1.5 bg-secondary/40 px-2.5 py-1 rounded-full border border-border text-xs"
                              >
                                <span className="relative w-5 h-5 shrink-0">
                                  {iconUrl ? (
                                    <SafeImage src={iconUrl} alt={m.name || ""} fill className="object-contain" sizes="20px" />
                                  ) : null}
                                </span>
                                <span className="text-secondary">{m.name}</span>
                                <span className="text-primary font-medium">×{formattedCount}</span>
                              </span>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
            {talents.map((t, i: number) => (
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
            {constellations.map((cs, i: number) => (
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