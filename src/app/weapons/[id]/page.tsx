import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function WeaponDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const w = await prisma.weapon.findUnique({ where: { id } });
  if (!w) return notFound();

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

      {w.effectName && (
        <section>
          <h2 className="text-xl font-semibold mb-2">{w.effectName}</h2>
          <p className="text-sm text-neutral-400">{w.effectDescription}</p>
        </section>
      )}
    </div>
  );
}
