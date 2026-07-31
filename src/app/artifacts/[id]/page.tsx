import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SafeImage } from "@/components/SafeImage";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const a = await prisma.artifactSet.findUnique({ where: { id } });
  if (!a) return { title: "Không tìm thấy thánh di vật — LEIBO" };
  return {
    title: `${a.name} — LEIBO`,
    description: a.fourPieceBonus ?? a.twoPieceBonus ?? `Bộ thánh di vật ${a.rarityRange.join("/")}★.`,
  };
}

const PIECE_LABELS: Record<string, string> = {
  flower: "Hoa",
  plume: "Lông vũ",
  sands: "Đồng hồ cát",
  goblet: "Ly",
  circlet: "Vương miện",
};

function resolvePieceImage(val: unknown): string | null {
  if (typeof val === "string") return val || null;
  if (val && typeof val === "object") {
    const filename = (val as Record<string, unknown>).filename;
    if (typeof filename === "string" && filename) {
      return `https://enka.network/ui/${filename}.png`;
    }
  }
  return null;
}

function resolvePieceName(val: unknown, key: string): string {
  if (val && typeof val === "object") {
    const name = (val as Record<string, unknown>).name;
    if (typeof name === "string" && name) return name;
  }
  return PIECE_LABELS[key] ?? key;
}

export default async function ArtifactDetail({ params }: PageProps) {
  const { id } = await params;
  const a = await prisma.artifactSet.findUnique({ where: { id } });
  if (!a) return notFound();

  const pieces = (a.pieces as Record<string, unknown>) ?? {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {a.iconUrl && (
          <div className="relative w-40 h-40 rounded-xl border border-border bg-card shrink-0">
            <SafeImage
              src={a.iconUrl}
              alt={a.name}
              fill
              sizes="160px"
              className="object-contain p-2"
              fallbackClassName="w-full h-full flex items-center justify-center text-muted text-[10px]"
            />
          </div>
        )}
        <div>
          <h1 className="text-3xl font-bold text-gold-bright">{a.name}</h1>
          <p className="text-sm text-muted mb-4">{a.rarityRange.join("/")}★</p>
        </div>
      </div>

      <section className="mb-8 space-y-3">
        {a.twoPieceBonus && (
          <div className="border border-border rounded-lg p-3 bg-card">
            <div className="font-medium text-primary">Hiệu ứng 2 món</div>
            <p className="text-sm text-secondary">{a.twoPieceBonus}</p>
          </div>
        )}
        {a.fourPieceBonus && (
          <div className="border border-border rounded-lg p-3 bg-card">
            <div className="font-medium text-primary">Hiệu ứng 4 món</div>
            <p className="text-sm text-secondary">{a.fourPieceBonus}</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold mb-4 text-gold border-b border-border pb-2">Các món trong bộ</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
          {Object.entries(pieces).map(([key, val]) => {
            if (!val) return null;

            const imgUrl = resolvePieceImage(val);
            const pieceName = resolvePieceName(val, key);

            return (
              <div key={key} className="border border-border rounded-xl p-4 bg-card flex flex-col items-center text-center group hover:border-gold transition-all">
                <div className="relative w-16 h-16 mb-3 bg-secondary rounded-lg overflow-hidden flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                  {imgUrl ? (
                    <SafeImage
                      src={imgUrl}
                      alt={pieceName}
                      fill
                      sizes="64px"
                      className="object-contain"
                      fallbackClassName="w-full h-full flex items-center justify-center text-muted text-[10px]"
                    />
                  ) : (
                    <div className="text-muted text-[10px]">No Image</div>
                  )}
                </div>
                <div className="text-xs text-muted font-medium mb-1">{PIECE_LABELS[key] ?? key}</div>
                <div className="font-semibold text-primary line-clamp-2 text-xs" title={pieceName}>
                  {pieceName}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}