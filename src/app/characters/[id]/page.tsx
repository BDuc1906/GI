import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { rarityGlowClass, rarityStars, rarityTextClass } from "@/lib/theme";
import { ElementIcon } from "@/components/ElementIcon";
import { SafeImage } from "@/components/SafeImage";
import { CharacterLevelSlider } from "@/components/CharacterLevelSlider";
import { TalentMaterialSlider } from "@/components/TalentMaterialSlider";
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
  const materialIconsRaw = await prisma.material.findMany({
    where: { id: { in: Array.from(materialIds) } },
    select: { id: true, iconUrl: true },
  });
  const materialIconMap = new Map(materialIconsRaw.map((m) => [m.id, m.iconUrl]));
  // Bản plain-object của map trên để truyền được qua boundary Server -> Client
  // Component (TalentMaterialSlider là "use client", không nhận Map trực tiếp).
  const materialIconRecord: Record<string, string | null | undefined> = Object.fromEntries(
    materialIconMap
  );

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

      {/* Level Slider — tương tác, tính real-time từ statsByLevel thật */}
      {statsByLevel.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold mb-4 text-gold uppercase tracking-wide border-b border-border pb-2">
            Chỉ Số Theo Cấp
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

      {/* Kỹ Năng — trước đây bị thiếu hoàn toàn, giờ render từ `talents`.
          Nguyên liệu nâng cấp thiên phú (talentMaterials) được gộp thẳng
          vào đây dưới dạng slider kéo theo cấp, thay vì tách thành 1 bảng
          tĩnh liệt kê hết 10 cấp riêng biệt. */}
      {talents.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold mb-4 text-gold uppercase tracking-wide border-b border-border pb-2">
            Kỹ Năng
          </h2>
          <div className="space-y-4">
            {talents.map((t) => (
              <div key={t.key} className="relic-frame bg-card border border-border rounded-xl p-5">
                <div className="flex items-start gap-3 mb-2">
                  <span className="relative w-10 h-10 shrink-0 rounded skill-icon-frame border overflow-hidden">
                    {t.icon ? (
                      <SafeImage src={t.icon} alt={t.name ?? ""} fill className="object-contain p-1" sizes="40px" />
                    ) : null}
                  </span>
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-muted font-medium">
                      {TALENT_LABEL_VI[t.key] ?? t.key}
                    </div>
                    <div className="font-bold text-base text-gold-bright">{t.name}</div>
                  </div>
                </div>

                {t.description && (
                  <p className="text-sm text-secondary leading-relaxed whitespace-pre-line mb-3">
                    {t.description}
                  </p>
                )}

                {/* Bảng thông số theo cấp — trước đây liệt kê thẳng các giá
                    trị (0.80%, 0.86%, 0.92%...) mà KHÔNG có dòng tiêu đề
                    cho biết giá trị đó ứng với Cấp mấy, người xem không
                    biết cột nào là cấp nào. Thêm 1 hàng "Cấp" cố định ở
                    đầu bảng (1..N theo đúng số giá trị thật có, không hard
                    code 15 vì 1 vài thông số có thể có số cấp khác) +
                    khung/viền rõ ràng hơn (border quanh bảng, có màu nền
                    xen kẽ dòng) để dễ nhìn theo yêu cầu. */}
                {t.attributes && t.attributes.length > 0 && (
                  <div className="overflow-x-auto mb-1 rounded-lg border border-border">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-secondary/60">
                          <th className="py-1.5 px-3 text-left text-muted font-semibold whitespace-nowrap border-b border-r border-border">
                            Cấp Độ
                          </th>
                          {Array.from(
                            { length: Math.max(...t.attributes.map((r) => r.values.length)) },
                            (_, i) => i + 1
                          ).map((lv) => (
                            <th
                              key={lv}
                              className="py-1.5 px-2 text-center text-gold font-semibold whitespace-nowrap border-b border-border"
                            >
                              {lv}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {t.attributes.map((row, i) => (
                          <tr
                            key={i}
                            className={`border-t border-border ${i % 2 === 1 ? "bg-secondary/20" : ""}`}
                          >
                            <td className="py-1.5 px-3 text-muted whitespace-nowrap align-top border-r border-border">
                              {row.label}
                            </td>
                            {row.values.map((v, j) => (
                              <td key={j} className="py-1.5 px-2 text-center text-primary whitespace-nowrap">
                                {v}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Chỉ gắn slider nguyên liệu vào đúng kỹ năng chính có nâng
                    cấp (Đòn thường / Kỹ năng / Trọng kích), không lặp lại
                    ở các thiên phú bị động không tốn nguyên liệu này. */}
                {talentMaterials.length > 0 &&
                  ["normalAttack", "elementalSkill", "elementalBurst"].includes(t.key) && (
                    <TalentMaterialSlider
                      talentMaterials={talentMaterials}
                      materialIconMap={materialIconRecord}
                    />
                  )}
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
                <div className="flex items-start gap-3 mb-2">
                  <span className="relative w-10 h-10 shrink-0 rounded skill-icon-frame border overflow-hidden">
                    {cs.icon ? (
                      <SafeImage
                        src={cs.icon}
                        alt={cs.name ?? ""}
                        fill
                        className="object-contain p-1"
                        sizes="40px"
                      />
                    ) : null}
                  </span>
                  <div className="font-bold text-base text-purple-400 drop-shadow-[0_0_6px_rgba(168,85,247,0.2)]">
                    C{i + 1} &middot; {cs.name}
                  </div>
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