import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { rarityGlowClass } from "@/lib/theme";

export default async function ArtifactsPage() {
  // 1. Truy vấn danh sách toàn bộ các bộ thánh di vật xếp theo thứ tự bảng chữ cái alphabet
  const sets = await prisma.artifactSet.findMany({ 
    orderBy: { name: "asc" } 
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      
      {/* Khối tiêu đề chính */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-wide text-neutral-100 uppercase mb-2">
          Bảo Vật Thánh Di Vật
        </h1>
        <p className="text-sm text-[color:var(--parchment-dim)]">
          Khám phá bộ bí bảo tàng tích cổ đại gia tăng chiến lực
        </p>
      </div>

      {/* Lưới danh sách các bộ Thánh di vật (Artifacts Card Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {sets.map((a) => {
          // Tính toán cấp độ hiếm sao lớn nhất trong mảng để phủ hiệu ứng hào quang phát sáng tương ứng
          const maxRarity = Math.max(...(a.rarityRange as number[]), 4);
          
          return (
            <Link 
              key={a.id} 
              href={`/artifacts/${a.id}`} 
              className={`relic-frame ${rarityGlowClass(maxRarity)} bg-neutral-950/60 border border-neutral-800 rounded-xl overflow-hidden block group transition-all duration-300 hover:-translate-y-2`}
            >
              {/* Khung ảnh thánh di vật */}
              <div className="relative aspect-square w-full bg-neutral-900/40 p-4 flex items-center justify-center overflow-hidden">
                {a.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={a.iconUrl} 
                    alt={a.name} 
                    className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 p-2" 
                  />
                ) : (
                  <div className="text-neutral-600 text-xs">No Image</div>
                )}
              </div>

              {/* Chi tiết văn bản chân thẻ */}
              <div className="p-4 border-t border-neutral-900 bg-neutral-900/10">
                <div className="font-bold truncate text-neutral-100 group-hover:text-[color:var(--gold-bright)] transition-colors text-sm mb-1">
                  {a.name}
                </div>
                <div className="text-xs text-[color:var(--parchment-dim)] font-medium mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-[color:var(--gold-bright)]" />
                  Phẩm cấp: {(a.rarityRange as number[]).join("–")}★
                </div>
              </div>
            </Link>
          );
        })}
      </div>

    </div>
  );
}
