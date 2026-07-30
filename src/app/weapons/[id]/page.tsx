import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function WeaponDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const w = await prisma.weapon.findUnique({ where: { id } });
  if (!w) return notFound();

  // passiveByRefinement được seed dưới dạng mảng [r1, r2, r3, r4, r5] (đã filter bỏ phần tử rỗng)
  const refinements = (w.passiveByRefinement as any[]) ?? [];

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {w.iconUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={w.iconUrl} alt={w.name} className="w-40 h-40 rounded-xl border border-neutral-800 bg-neutral-900 object-contain" />
        )}
        <div>
          <h1 className="text-3xl font-bold text-amber-400">{w.name}</h1>
          <p className="text-sm text-neutral-400 mb-4">{w.type} · {w.rarity}★</p>
          {w.description && <p className="text-neutral-300 italic max-w-xl">{w.description}</p>}
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Chỉ số cơ bản</h2>
        <div className="flex gap-6 text-sm text-neutral-300">
          <div>ATK nền: {w.baseAtk ?? "—"}</div>
          <div>{w.subStatName ?? "Chỉ số phụ"}: {w.subStatValue ?? "—"}</div>
        </div>
      </section>

      {w.effectName && refinements.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">{w.effectName}</h2>
          <div className="space-y-3">
            {refinements.map((r: any, i: number) => (
              <div
                key={i}
                className="border border-neutral-800 rounded-lg p-3 bg-neutral-900"
              >
                <div className="font-medium text-amber-400 mb-1">
                  Tinh luyện {i + 1}
                </div>
                <p className="text-sm text-neutral-400 whitespace-pre-line">
                  {r?.description ?? "—"}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}