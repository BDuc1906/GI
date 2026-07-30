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

/**
 * Trả về URL ảnh Enka hợp lệ cho 1 mảnh di vật.
 *
 * Data hiện tại (từ seed-characters.ts bản đã sửa) luôn lưu `val` là
 * URL string đầy đủ (vd "https://enka.network/ui/UI_RelicIcon_xxx.png")
 * hoặc null. Nhánh xử lý object {name, filename} chỉ còn để tương thích
 * ngược với bản ghi cũ (trước khi seed script được sửa) — nếu re-seed
 * (`npm run db:seed`) thì toàn bộ record sẽ về đúng shape string và
 * nhánh object không bao giờ chạy nữa.
 */
function resolvePieceImage(val: unknown): string | null {
  if (typeof val === "string") {
    // Shape hiện tại: val chính là URL đầy đủ, dùng thẳng.
    return val || null;
  }

  if (val && typeof val === "object") {
    // Shape cũ (legacy): { name, filename }
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
  // genshin-db không cung cấp tên riêng cho từng mảnh trong bộ,
  // nên dùng nhãn chung (Hoa/Lông vũ/...) làm tên hiển thị.
  return PIECE_LABELS[key] ?? key;
}

export default async function ArtifactDetail({ params }: PageProps) {
  const { id } = await params;
  const a = await prisma.artifactSet.findUnique({ where: { id } });
  if (!a) return notFound();

  const pieces = (a.pieces as Record<string, unknown>) ?? {};

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-neutral-100">
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {a.iconUrl && (
          <div className="relative w-40 h-40 rounded-xl border border-neutral-800 bg-neutral-900 shrink-0">
            <SafeImage
              src={a.iconUrl}
              alt={a.name}
              fill
              className="object-contain p-2"
              fallbackClassName="w-full h-full flex items-center justify-center text-neutral-600 text-[10px]"
            />
          </div>
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
        <h2 className="text-xl font-semibold mb-4 text-amber-400">Các món trong bộ</h2>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-sm">
          {Object.entries(pieces).map(([key, val]) => {
            if (!val) return null;

            const imgUrl = resolvePieceImage(val);
            const pieceName = resolvePieceName(val, key);

            return (
              <div key={key} className="border border-neutral-800 rounded-xl p-4 bg-neutral-900/60 flex flex-col items-center text-center group hover:border-amber-400/50 transition-all duration-300">
                <div className="relative w-16 h-16 mb-3 bg-neutral-950 rounded-lg overflow-hidden flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                  {imgUrl ? (
                    <SafeImage
                      src={imgUrl}
                      alt={pieceName}
                      fill
                      className="object-contain"
                      fallbackClassName="w-full h-full flex items-center justify-center text-neutral-600 text-[10px]"
                    />
                  ) : (
                    <div className="text-neutral-600 text-[10px]">No Image</div>
                  )}
                </div>
                <div className="text-xs text-neutral-500 font-medium mb-1">{PIECE_LABELS[key] ?? key}</div>
                <div className="font-semibold text-neutral-200 line-clamp-2 text-xs" title={pieceName}>
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