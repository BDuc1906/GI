import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SafeImage } from "@/components/SafeImage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const w = await prisma.weapon.findUnique({ where: { id } });
  if (!w) return { title: "Không tìm thấy vũ khí — LEIBO" };
  return {
    title: `${w.name} — LEIBO`,
    description: w.description ?? `${w.type} ${w.rarity}★ — thông số và hiệu ứng tinh luyện.`,
  };
}

export default async function WeaponDetail({ params }: PageProps) {
  const { id } = await params;
  const w = await prisma.weapon.findUnique({ where: { id } });
  if (!w) return notFound();

  const refinements = (w.passiveByRefinement as unknown[]) ?? [];
  const ascensionMaterials = (w.ascensionMaterials as any[]) ?? [];

  // Lấy icon nguyên liệu từ bảng Material
  const materialIds = new Set<string>();
  for (const phase of ascensionMaterials) {
    for (const m of phase.materials) {
      if (m.materialId) materialIds.add(m.materialId);
    }
  }
  const materialIcons = await prisma.material.findMany({
    where: { id: { in: Array.from(materialIds) } },
    select: { id: true, iconUrl: true },
  });
  const materialIconMap = new Map(materialIcons.map((m) => [m.id, m.iconUrl]));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {w.iconUrl && (
          <div className="relative w-40 h-40 rounded-xl border border-border bg-card shrink-0">
            <SafeImage
              src={w.iconUrl}
              alt={w.name}
              fill
              className="object-contain p-2"
              fallbackClassName="w-full h-full flex items-center justify-center text-muted text-[10px]"
            />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gold-bright">{w.name}</h1>
          <p className="text-sm text-muted mb-4">{w.type} · {w.rarity}★</p>
          {w.description && <p className="text-primary italic max-w-xl">{w.description}</p>}
        </div>
      </div>

      {/* Chỉ số cơ bản */}
      <section className="mb-8">
        <h2 className="font-display text-xl font-bold mb-2 text-gold border-b border-border pb-2">Chỉ số cơ bản</h2>
        <div className="flex gap-6 text-sm text-secondary">
          <div>ATK nền: {w.baseAtk ?? "—"}</div>
          <div>{w.subStatName ?? "Chỉ số phụ"}: {w.subStatValue ?? "—"}</div>
        </div>
      </section>

      {/* Nguyên liệu đột phá */}
      {ascensionMaterials.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold mb-4 text-gold border-b border-border pb-2">Nguyên liệu đột phá</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ascensionMaterials.map((phase) => (
              <div key={phase.phase} className="relic-frame bg-card border border-border rounded-xl p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-gold mb-3">
                  Giai đoạn {phase.phase}
                </div>
                <ul className="space-y-1.5 text-sm">
                  {phase.materials.map((m: any, j: number) => {
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

      {/* Hiệu ứng tinh luyện */}
      {w.effectName && refinements.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold mb-4 text-gold border-b border-border pb-2">{w.effectName}</h2>
          <div className="space-y-3">
            {refinements.map((r, i) => (
              <div key={i} className="relic-frame bg-card border border-border rounded-lg p-3">
                <div className="font-medium text-gold-bright mb-1">
                  Tinh luyện {i + 1}
                </div>
                <p className="text-sm text-secondary whitespace-pre-line">
                  {(r as { description?: string } | null)?.description ?? "—"}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}