import { prisma } from "@/lib/db/prisma";
import { SafeImage } from "@/components/ui/SafeImage";
import { SectionHeading } from "@/components/layout/SectionHeading";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { Link } from "@/i18n/navigation";

interface Props {
  artifactSetId: string;
  locale: string;
  rarityColor?: string;
}

interface DomainMaterialEntry {
  artifactSetId?: string | null;
  name: string;
}

export async function ArtifactSourceDomain({ artifactSetId, locale, rarityColor }: Props) {
  // Query toàn bộ domain thánh di vật trong DB thật
  const domains = await prisma.domain.findMany({
    where: { category: "artifact" },
    select: {
      id: true,
      name: true,
      nameTranslations: true,
      regionName: true,
      description: true,
      recommendedLevel: true,
      recommendedElements: true,
      imageUrl: true,
      imageUrlOriginal: true,
      materials: true,
    },
  });

  // Tìm bí cảnh chứa bộ thánh di vật này trong danh sách materials rớt
  const sourceDomain = domains.find((d) => {
    const mats = (d.materials as unknown as DomainMaterialEntry[]) ?? [];
    return mats.some((m) => m.artifactSetId === artifactSetId);
  });

  if (!sourceDomain) return null;

  const localizedDomainName = getLocalizedName(sourceDomain, locale);

  return (
    <section className="mb-10">
      <SectionHeading elementColor={rarityColor}>Nơi thu thập (Bí Cảnh Chúc Phúc)</SectionHeading>
      <div className="surface-card p-5 flex flex-col md:flex-row items-center gap-6">
        {sourceDomain.imageUrl && (
          <div className="relative w-full md:w-56 h-32 rounded-xl bg-bg-elevated border border-border shrink-0 overflow-hidden">
            <SafeImage
              src={sourceDomain.imageUrl}
              fallbackSrcs={[sourceDomain.imageUrlOriginal]}
              alt={localizedDomainName}
              fill
              sizes="(max-width: 768px) 100vw, 224px"
              className="object-cover"
            />
          </div>
        )}

        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-eyebrow" style={{ color: rarityColor }}>
              {sourceDomain.regionName ?? "Teyvat"}
            </span>
            {sourceDomain.recommendedLevel && (
              <span className="text-xs text-text-muted">
                · Cấp khuyến nghị: {sourceDomain.recommendedLevel}
              </span>
            )}
          </div>

          <h3 className="font-display text-xl font-bold text-text-primary mb-2">
            {localizedDomainName}
          </h3>

          {sourceDomain.recommendedElements.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mb-4">
              <span className="text-xs text-text-secondary">Nguyên tố đề xuất:</span>
              {sourceDomain.recommendedElements.map((el) => (
                <span
                  key={el}
                  className="text-xs px-2 py-0.5 rounded-full border border-border bg-bg-elevated text-text-primary"
                >
                  {el}
                </span>
              ))}
            </div>
          )}

          <Link
            href={`/domains/${sourceDomain.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-accent-500/60 bg-bg-elevated text-accent-bright font-medium text-sm hover:border-accent-500 hover:bg-bg-elevated/80 transition-colors"
          >
            <span>🏰 Xem chi tiết bí cảnh & danh sách quái</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
