
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SafeImage } from "@/components/SafeImage";
import { BreadcrumbJsonLd } from "@/components/BreadcrumbJsonLd";

interface PageProps {
  params: Promise<{ id: string }>;
}

const CATEGORY_LABEL: Record<string, string> = {
  artifact: "Bí cảnh thánh di vật",
  weapon: "Bí cảnh nguyên liệu vũ khí",
  talent: "Bí cảnh sách thiên phú",
};

const WEEKDAY_FULL_VI: Record<string, string> = {
  Sunday: "Chủ nhật",
  Monday: "Thứ 2",
  Tuesday: "Thứ 3",
  Wednesday: "Thứ 4",
  Thursday: "Thứ 5",
  Friday: "Thứ 6",
  Saturday: "Thứ 7",
};

interface DomainMaterialEntry {
  materialId?: string | null;
  name: string;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const d = await prisma.domain.findUnique({ where: { id } });
  if (!d) return { title: "Không tìm thấy bí cảnh — LEIBO" };
  return {
    title: `${d.name} — LEIBO`,
    description: d.description ?? `${CATEGORY_LABEL[d.category] ?? d.category} tại ${d.regionName ?? "Teyvat"}.`,
  };
}

export default async function DomainDetail({ params }: PageProps) {
  const { id } = await params;
  const d = await prisma.domain.findUnique({ where: { id } });
  if (!d) return notFound();

  const materials = (d.materials as unknown as DomainMaterialEntry[]) ?? [];

  const materialIds = materials.map((m) => m.materialId).filter((v): v is string => Boolean(v));
  const materialIcons = await prisma.material.findMany({
    where: { id: { in: materialIds } },
    select: { id: true, iconUrl: true },
  });
  const materialIconMap = new Map(materialIcons.map((m) => [m.id, m.iconUrl]));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <BreadcrumbJsonLd
        items={[
          { name: "LEIBO", path: "/" },
          { name: "Bí cảnh", path: "/domains" },
          { name: d.name, path: `/domains/${d.id}` },
        ]}
      />
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {d.imageUrl && (
          <div className="relative w-40 h-40 rounded-xl border border-border bg-card shrink-0 overflow-hidden">
            <SafeImage
              src={d.imageUrl}
              fallbackSrcs={[d.imageUrlOriginal]}
              alt={d.name}
              fill
              sizes="160px"
              className="object-cover"
              fallbackClassName="w-full h-full flex items-center justify-center text-muted text-[10px]"
            />
          </div>
        )}
        <div>
          <div className="text-xs uppercase tracking-wider text-secondary font-medium mb-1">
            {CATEGORY_LABEL[d.category] ?? d.category}
          </div>
          <h1 className="text-3xl font-bold text-gold-bright">{d.name}</h1>
          <p className="text-sm text-muted mb-4">
            {d.regionName ?? "Teyvat"}
            {d.recommendedLevel ? ` · Khuyến nghị cấp ${d.recommendedLevel}` : ""}
          </p>
          {d.description && <p className="text-primary italic max-w-xl">{d.description}</p>}
        </div>
      </div>

      {/* Lịch mở */}
      <section className="mb-8">
        <h2 className="font-display text-xl font-bold mb-2 text-gold border-b border-border pb-2">Lịch mở</h2>
        {d.daysOfWeek.length === 0 ? (
          <p className="text-sm text-secondary">Mở hằng ngày.</p>
        ) : (
          <div className="flex flex-wrap gap-2 text-sm">
            {d.daysOfWeek.map((wd) => (
              <span key={wd} className="px-3 py-1.5 rounded-full border border-gold/40 bg-gold/10 text-gold-bright">
                {WEEKDAY_FULL_VI[wd] ?? wd}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Nguyên tố khuyến nghị */}
      {d.recommendedElements.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold mb-2 text-gold border-b border-border pb-2">
            Nguyên tố khắc chế khuyến nghị
          </h2>
          <div className="flex flex-wrap gap-2 text-sm">
            {d.recommendedElements.map((el) => (
              <span key={el} className="px-3 py-1.5 rounded-full border border-border bg-card/60 text-primary">
                {el}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Nguyên liệu rớt */}
      {materials.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold mb-4 text-gold border-b border-border pb-2">
            Nguyên liệu nhận được
          </h2>
          <div className="relic-frame bg-card border border-border rounded-xl p-4">
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              {materials.map((m, i) => {
                const iconUrl = m.materialId ? materialIconMap.get(m.materialId) : null;
                return (
                  <li key={i} className="flex items-center gap-2 min-w-0">
                    <span className="relative w-8 h-8 shrink-0 rounded bg-secondary border border-border overflow-hidden">
                      {iconUrl ? (
                        <SafeImage src={iconUrl} alt={m.name} fill sizes="32px" className="object-contain" />
                      ) : null}
                    </span>
                    <span className="text-secondary truncate">{m.name}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
      )}

      {/* Quái trong bí cảnh */}
      {d.monsterNames.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-bold mb-4 text-gold border-b border-border pb-2">
            Kẻ địch trong bí cảnh
          </h2>
          <ul className="flex flex-wrap gap-2 text-sm">
            {d.monsterNames.map((m) => (
              <li key={m} className="px-3 py-1.5 rounded-full border border-border bg-card/60 text-secondary">
                {m}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
