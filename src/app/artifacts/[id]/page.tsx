import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function ArtifactDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const a = await prisma.artifactSet.findUnique({ where: { id } });
  if (!a) return notFound();

  const pieces = (a.pieces as Record<string, any>) ?? {};
  const pieceLabels: Record<string, string> = {
    flower: "Hoa",
    plume: "Lông vũ",
    sands: "Đồng hồ cát",
    goblet: "Ly",
    circlet: "Vương miện",
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {a.iconUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={a.iconUrl} alt={a.name} className="w-40 h-40 rounded-xl border border-neutral-800 bg-neutral-900 object-contain" />
        )}
        <div>
          <h1 className="text-3xl font-bold text-amber-400">{a.name}</h1>
          <p className="text-sm text-neutral-400 mb-4">{a.rarityRange.join("/")}★</p>
        </div>
      </div>

      <section className="mb-8 space-y-3">
        {a.twoPieceBonus && (
          <div className="border border-neutral-800 rounded-lg p-3 bg-neutral-900">
            <div className="font-medium">Hiệu ứng 2 món</div>
            <p className="text-sm text-neutral-400">{a.twoPieceBonus}</p>
          </div>
        )}
        {a.fourPieceBonus && (
          <div className="border border-neutral-800 rounded-lg p-3 bg-neutral-900">
            <div className="font-medium">Hiệu ứng 4 món</div>
            <p className="text-sm text-neutral-400">{a.fourPieceBonus}</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-2">Các món trong bộ</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-sm">
          {Object.entries(pieces).map(([key, val]: [string, any]) =>
            val ? (
              <div key={key} className="border border-neutral-800 rounded-lg p-3 bg-neutral-900">
                <div className="text-xs text-neutral-500">{pieceLabels[key] ?? key}</div>
                <div className="font-medium">{val.name ?? val}</div>
              </div>
            ) : null
          )}
        </div>
      </section>
    </div>
  );
}
