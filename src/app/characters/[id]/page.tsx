// src/app/characters/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { rarityGlowClass, rarityStars, rarityTextClass } from "@/lib/theme";
import { ElementIcon } from "@/components/ElementIcon";
import { SafeImage } from "@/components/SafeImage";
import type { Metadata } from "next";

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

type AscensionMaterialPhase = {
  phase: number;
  materials: Array<{ materialId?: string | null; name: string | null; count: number | null }>;
};

type StatByLevelRow = {
  level: number;
  ascension: number | null;
  hp: number | null;
  attack: number | null;
  defense: number | null;
  specialized: number | null;
};

type VoiceActors = {
  english?: string | null;
  chinese?: string | null;
  japanese?: string | null;
  korean?: string | null;
};

function formatNumber(n: number | null | undefined): string {
  if (n === null || n === undefined) return "—";
  return Math.round(n).toLocaleString("vi-VN");
}

/**
 * genshin-db trả về chỉ số phụ đột phá (specialized) dưới dạng số thô:
 * - Elemental Mastery: số nguyên thật (vd 187) -> hiển thị như formatNumber.
 * - Mọi chỉ số còn lại (Crit Rate/DMG, Energy Recharge, DMG Bonus theo hệ...)
 *   là % và genshin-db trả về dạng thập phân (vd 0.288 = 28.8%), KHÔNG phải
 *   số nguyên. Trước đây formatNumber() làm tròn thẳng -> mọi giá trị < 1
 *   bị hiển thị thành "0". Nhận biết loại chỉ số qua chuỗi ascensionStat
 *   (vd "CRIT Rate", "Energy Recharge", "Pyro DMG Bonus") có chứa "%" hay
 *   không (genshin-db luôn có "%" trong substatText cho các chỉ số dạng %).
 */
function formatSpecialized(
  n: number | null | undefined,
  ascensionStatLabel: string | null | undefined
): string {
  if (n === null || n === undefined) return "—";
  const isFlatElementalMastery = (ascensionStatLabel ?? "")
    .toLowerCase()
    .includes("elemental mastery");
  if (isFlatElementalMastery) {
    return formatNumber(n);
  }
  return `${(n * 100).toLocaleString("vi-VN", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;
}

export default async function CharacterDetail({ params }: PageProps) {
  const { id } = await params;

  // 1. Tìm kiếm thực thể lữ hành duy nhất dựa trên ID từ Supabase
  const c = await prisma.character.findUnique({
    where: { id },
  });

  if (!c) return notFound();

  // Nếu đây là 1 biến thể Traveler (id "traveler-boy-<element>" /
  // "traveler-girl-<element>"), lấy thêm biến thể giới tính còn lại CÙNG
  // nguyên tố (dữ liệu thật đã seed sẵn) để ghép ảnh nửa Nam / nửa Nữ ở
  // banner đầu trang — làm ngay tại đây, không tách file/component riêng.
  const isTraveler = c.id.startsWith("traveler-");
  let sibling: typeof c | null = null;
  if (isTraveler) {
    const siblingId = c.id.startsWith("traveler-boy-")
      ? c.id.replace("traveler-boy-", "traveler-girl-")
      : c.id.replace("traveler-girl-", "traveler-boy-");
    sibling = await prisma.character.findUnique({ where: { id: siblingId } });
  }
  const boy = isTraveler ? (c.id.startsWith("traveler-boy-") ? c : sibling) : null;
  const girl = isTraveler ? (c.id.startsWith("traveler-girl-") ? c : sibling) : null;
  const boySplash = boy?.splashUrl || boy?.iconUrl || null;
  const girlSplash = girl?.splashUrl || girl?.iconUrl || null;

  // 2. Chuyển đổi an toàn dữ liệu kiểu Json phức tạp từ Prisma 7
  const constellations = (c.constellations as any[]) ?? [];
  const talents = (c.talents as any[]) ?? [];
  const ascensionMaterials = (c.ascensionMaterials as unknown as AscensionMaterialPhase[]) ?? [];
  const statsByLevel = (c.statsByLevel as unknown as StatByLevelRow[]) ?? [];
  const voiceActors = (c.voiceActors as unknown as VoiceActors) ?? null;

  // Icon nguyên liệu đột phá được lưu ở bảng Material riêng (không lặp lại
  // trong JSON của từng nhân vật) — gom hết materialId xuất hiện trong 6
  // giai đoạn rồi query 1 lần duy nhất, tránh N+1 query trong lúc render.
  const materialIds = Array.from(
    new Set(
      ascensionMaterials
        .flatMap((phase) => phase.materials.map((m) => m.materialId))
        .filter((id): id is string => !!id)
    )
  );
  const materialIcons = materialIds.length
    ? await prisma.material.findMany({
        where: { id: { in: materialIds } },
        select: { id: true, iconUrl: true },
      })
    : [];
  const materialIconById = new Map(materialIcons.map((m) => [m.id, m.iconUrl]));

  const TALENT_LABEL_VI: Record<string, string> = {
    normalAttack: "Đòn Thường / Trọng Kích / Bổ Nhào",
    elementalSkill: "Kỹ Năng Nguyên Tố",
    elementalBurst: "Trọng Kích Nguyên Tố (Cực Kỹ)",
    alternateSprint: "Kỹ Năng Di Chuyển Đặc Biệt",
    passive1: "Thiên Phú Bị Động 1",
    passive2: "Thiên Phú Bị Động 2",
    passive3: "Thiên Phú Bị Động 3",
    passive4: "Thiên Phú Bị Động 4",
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      
      {/* Khối thẻ thông tin chính (Hero Banner Card) */}
      <div className={`relic-frame ${rarityGlowClass(c.rarity)} bg-neutral-900/30 backdrop-blur-md rounded-xl p-6 flex flex-col sm:flex-row gap-6 mb-8 border border-neutral-800/60`}>
        {isTraveler ? (
          // Ảnh ghép nửa Nam / nửa Nữ — chỉ áp dụng cho Traveler, dùng
          // đúng splashUrl/iconUrl thật của cả 2 biến thể giới tính.
          <div className="relative w-full sm:w-56 aspect-[3/4] rounded-lg overflow-hidden border border-[color:rgba(201,166,107,0.3)] bg-neutral-950/40 shrink-0">
            <div className="absolute inset-0" style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)" }}>
              {boySplash ? (
                <SafeImage src={boySplash} alt={`${c.name} - Nam`} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600 text-[10px]">—</div>
              )}
            </div>
            <div className="absolute inset-0" style={{ clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)" }}>
              {girlSplash ? (
                <SafeImage src={girlSplash} alt={`${c.name} - Nữ`} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600 text-[10px]">—</div>
              )}
            </div>
            <div className="absolute top-0 bottom-0 left-1/2 w-px bg-black/40 -translate-x-1/2" />
          </div>
        ) : (
          c.splashUrl && (
            <div className="relative w-full sm:w-56 aspect-[3/4] rounded-lg overflow-hidden border border-[color:rgba(201,166,107,0.3)] bg-neutral-950/40 shrink-0">
              <SafeImage src={c.splashUrl} alt={c.name} fill className="object-cover" />
            </div>
          )
        )}
        <div className="flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <ElementIcon vision={c.vision} iconUrl={c.elementIcon} size={24} />
            <span className="text-xs font-bold uppercase tracking-widest text-[color:var(--parchment-dim)]">
              {c.vision} &middot; {c.weaponType}
            </span>
          </div>

          <h1 className="font-display text-4xl font-extrabold text-[color:var(--gold-bright)] mb-1 tracking-wide">
            {isTraveler ? `Traveler (${c.vision})` : c.name}
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
            <p className="text-xs text-[color:var(--parchment-dim)] mb-2 font-medium uppercase tracking-wider">
              Vùng đất: <span className="text-neutral-200">{c.region}</span>
            </p>
          )}

          {/* Thông tin phụ: sinh nhật, chòm sao bản mệnh, phiên bản ra mắt */}
          {(c.birthday || c.constellationName || c.gameVersion) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[color:var(--parchment-dim)] mb-3">
              {c.birthday && (
                <span>
                  Sinh nhật: <span className="text-neutral-200">{c.birthday}</span>
                </span>
              )}
              {c.constellationName && (
                <span>
                  Chòm sao: <span className="text-neutral-200">{c.constellationName}</span>
                </span>
              )}
              {c.gameVersion && (
                <span>
                  Ra mắt phiên bản: <span className="text-neutral-200">{c.gameVersion}</span>
                </span>
              )}
            </div>
          )}

          {c.description && (
            <p className="text-sm text-neutral-300 max-w-xl leading-relaxed bg-neutral-950/20 p-3 rounded-lg border border-neutral-800/40 italic mb-3">
              {c.description}
            </p>
          )}

          {/* Seiyuu / lồng tiếng */}
          {voiceActors && (voiceActors.japanese || voiceActors.english || voiceActors.chinese || voiceActors.korean) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[color:var(--parchment-dim)] mb-2">
              {voiceActors.japanese && <span>🇯🇵 {voiceActors.japanese}</span>}
              {voiceActors.english && <span>🇬🇧 {voiceActors.english}</span>}
              {voiceActors.chinese && <span>🇨🇳 {voiceActors.chinese}</span>}
              {voiceActors.korean && <span>🇰🇷 {voiceActors.korean}</span>}
            </div>
          )}

         {c.wikiUrl && (
  <a href={c.wikiUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[color:var(--gold)] hover:text-[color:var(--gold-bright)] underline underline-offset-2 w-fit">Xem thêm trên Wiki &rarr;</a>
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
            <span className="text-lg font-semibold">{formatNumber(c.baseHp)}</span>
          </div>
          <div>
            <span className="text-[color:var(--parchment-dim)] font-medium block mb-1">Tấn Công (ATK)</span> 
            <span className="text-lg font-semibold">{formatNumber(c.baseAtk)}</span>
          </div>
          <div>
            <span className="text-[color:var(--parchment-dim)] font-medium block mb-1">Phòng Ngự (DEF)</span> 
            <span className="text-lg font-semibold">{formatNumber(c.baseDef)}</span>
          </div>
          <div>
            <span className="text-[color:var(--parchment-dim)] font-medium block mb-1">Đột Phá Tăng</span> 
            <span className="text-md font-semibold text-[color:var(--gold-bright)] truncate block">{c.ascensionStat ?? "—"}</span>
          </div>
        </div>
      </section>

      {/* Khối bảng chỉ số theo cấp / mốc đột phá */}
      {statsByLevel.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold mb-4 text-[color:var(--gold)] uppercase tracking-wide border-b border-neutral-800 pb-2">
            Chỉ Số Theo Cấp Độ
          </h2>
          <div className="relic-frame bg-neutral-950/40 border border-neutral-800/80 rounded-xl overflow-x-auto">
            <table className="w-full text-sm text-neutral-200 min-w-[560px]">
              <thead>
                <tr className="text-left text-[color:var(--parchment-dim)] text-xs uppercase tracking-wider border-b border-neutral-800">
                  <th className="p-3 font-medium">Cấp</th>
                  <th className="p-3 font-medium">Đột Phá</th>
                  <th className="p-3 font-medium">HP</th>
                  <th className="p-3 font-medium">ATK</th>
                  <th className="p-3 font-medium">DEF</th>
                  <th className="p-3 font-medium">{c.ascensionStat ?? "Chỉ số phụ"}</th>
                </tr>
              </thead>
              <tbody>
                {statsByLevel.map((row, i) => (
                  <tr key={i} className="border-b border-neutral-900/80 last:border-0 hover:bg-neutral-900/30">
                    <td className="p-3">{row.level}</td>
                    <td className="p-3 text-[color:var(--parchment-dim)]">{row.ascension ?? "—"}</td>
                    <td className="p-3">{formatNumber(row.hp)}</td>
                    <td className="p-3">{formatNumber(row.attack)}</td>
                    <td className="p-3">{formatNumber(row.defense)}</td>
                    <td className="p-3 text-[color:var(--gold-bright)]">
                      {row.specialized ? formatSpecialized(row.specialized, c.ascensionStat) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Khối nguyên liệu đột phá */}
      {ascensionMaterials.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold mb-4 text-[color:var(--gold)] uppercase tracking-wide border-b border-neutral-800 pb-2">
            Nguyên Liệu Đột Phá
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ascensionMaterials.map((phase) => (
              <div
                key={phase.phase}
                className="relic-frame bg-neutral-900/20 border border-neutral-800 rounded-xl p-4"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-[color:var(--gold)] mb-3">
                  Giai Đoạn {phase.phase}
                </div>
                <ul className="space-y-1.5 text-sm text-neutral-200">
                  {phase.materials.map((m, j) => {
                    const iconUrl = m.materialId ? materialIconById.get(m.materialId) : null;
                    return (
                      <li key={j} className="flex items-center justify-between gap-3">
                        <span className="flex items-center gap-2 min-w-0">
                          <span className="relative w-6 h-6 shrink-0 rounded bg-neutral-950/50 border border-neutral-800/60 overflow-hidden">
                            {iconUrl ? (
                              <SafeImage src={iconUrl} alt={m.name ?? ""} fill className="object-contain" />
                            ) : null}
                          </span>
                          <span className="text-[color:var(--parchment-dim)] truncate">{m.name}</span>
                        </span>
                        <span className="font-semibold shrink-0">
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

      {/* Khối danh sách kỹ năng thiên phú (Talents) */}
      {talents.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold mb-4 text-[color:var(--gold)] uppercase tracking-wide border-b border-neutral-800 pb-2">
            Hệ Thống Thiên Phú Kỹ Năng
          </h2>
          <div className="space-y-4">
            {talents.map((t: any, i: number) => (
              <div key={i} className="relic-frame bg-neutral-900/20 border border-neutral-800 rounded-xl p-5 hover:bg-neutral-900/40 transition-colors">
                <div className="font-bold text-base text-neutral-100 mb-2 flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase tracking-wider text-neutral-500">
                    {TALENT_LABEL_VI[t.key] ?? t.key}
                  </span>
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