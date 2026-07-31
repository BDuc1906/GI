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

      <section className="mb-8">
        <h2 className="font-display text-xl font-bold mb-2 text-gold border-b border-border pb-2">Chỉ số cơ bản</h2>
        <div className="flex gap-6 text-sm text-secondary">
          <div>ATK nền: {w.baseAtk ?? "—"}</div>
          <div>{w.subStatName ?? "Chỉ số phụ"}: {w.subStatValue ?? "—"}</div>
        </div>
      </section>

      {w.effectName && refinements.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold mb-4 text-gold border-b border-border pb-2">{w.effectName}</h2>
          <div className="space-y-3">
            {refinements.map((r, i) => (
              <div
                key={i}
                className="relic-frame bg-card border border-border rounded-lg p-3"
              >
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