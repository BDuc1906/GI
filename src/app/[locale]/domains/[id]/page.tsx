
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EntityVisual } from "@/components/ui/EntityVisual";
import { ReportIssueModal } from "@/components/ui/ReportIssueModal";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { ElementalFrame } from "@/components/ui/ElementalFrame";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { elementColorVar } from "@/lib/ui/theme";
import { createLocalizedMetadata } from "@/lib/seo/metadata";

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

interface DomainMaterialEntry {
  // Domain "weapon"/"talent": trỏ tới Material.id.
  materialId?: string | null;
  // Domain "artifact": rewardPreview là TÊN BỘ THÁNH DI VẬT, không phải
  // nguyên liệu -> trỏ tới ArtifactSet.id thay vì Material.id (xem comment
  // trong scripts/seed-domains.ts). Chỉ đúng 1 trong 2 field có giá trị,
  // tùy category của domain.
  artifactSetId?: string | null;
  name: string;
}

// Chọn field TƯỜNG MINH thay vì để Prisma tự "select tất cả cột" (implicit
// select) — findUnique không truyền `select` từng gây Rust panic
// ("Option::unwrap() on a None value" trong query-compiler/selection.rs)
// với Prisma 7.x trên model có field mảng (String[]) + Json trộn lẫn như
// Domain. Liệt kê rõ field cũng nhanh hơn vì không kéo cột thừa.
const DOMAIN_SELECT = {
  id: true,
  name: true,
  nameTranslations: true,
  category: true,
  regionName: true,
  description: true,
  recommendedLevel: true,
  recommendedElements: true,
  daysOfWeek: true,
  unlockRank: true,
  materials: true,
  monsterNames: true,
  imageUrl: true,
  imageUrlOriginal: true,
} as const;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "DomainDetail" });
  const d = await prisma.domain.findUnique({ where: { id }, select: DOMAIN_SELECT });
  if (!d) {
    return createLocalizedMetadata({
      locale,
      pathname: `domains/${id}`,
      title: t("notFoundTitle"),
      robots: { index: false, follow: false },
    });
  }
  const categoryLabel: Record<string, string> = {
    artifact: t("categoryArtifact"),
    weapon: t("categoryWeapon"),
    talent: t("categoryTalent"),
    trounce: t("categoryTrounce"),
    challenge: t("categoryChallenge"),
  };
  return createLocalizedMetadata({
    locale,
    pathname: `domains/${id}`,
    title: `${getLocalizedName(d, locale)} — LEIBO`,
    description:
      d.description ??
      t("metaDescriptionFallback", {
        category: categoryLabel[d.category] ?? d.category,
        region: d.regionName ?? "Teyvat",
      }),
  });
}

export default async function DomainDetail({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "DomainDetail" });

  const CATEGORY_LABEL: Record<string, string> = {
    artifact: t("categoryArtifact"),
    weapon: t("categoryWeapon"),
    talent: t("categoryTalent"),
    trounce: t("categoryTrounce"),
    challenge: t("categoryChallenge"),
  };

  const WEEKDAY_FULL: Record<string, string> = {
    Sunday: t("sunday"),
    Monday: t("monday"),
    Tuesday: t("tuesday"),
    Wednesday: t("wednesday"),
    Thursday: t("thursday"),
    Friday: t("friday"),
    Saturday: t("saturday"),
  };

  const d = await prisma.domain.findUnique({ where: { id }, select: DOMAIN_SELECT });
  if (!d) return notFound();

  const breadcrumbItems = [
    { name: "LEIBO", path: "/" },
    { name: t("breadcrumbDomains"), path: "/domains" },
    { name: getLocalizedName(d, locale), path: `/domains/${d.id}` },
  ];

  const materials = (d.materials as unknown as DomainMaterialEntry[]) ?? [];

  const materialIds = materials.map((m) => m.materialId).filter((v): v is string => Boolean(v));
  const artifactSetIds = materials.map((m) => m.artifactSetId).filter((v): v is string => Boolean(v));

  const [materialIcons, artifactSetIcons] = await Promise.all([
    materialIds.length
      ? prisma.material.findMany({
          where: { id: { in: materialIds } },
          select: { id: true, iconUrl: true },
        })
      : Promise.resolve([]),
    artifactSetIds.length
      ? prisma.artifactSet.findMany({
          where: { id: { in: artifactSetIds } },
          select: { id: true, iconUrl: true },
        })
      : Promise.resolve([]),
  ]);
  const materialIconMap = new Map(materialIcons.map((m) => [m.id, m.iconUrl]));
  const artifactSetIconMap = new Map(artifactSetIcons.map((a) => [a.id, a.iconUrl]));

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <BreadcrumbJsonLd locale={locale} items={breadcrumbItems} />
      <Breadcrumb items={breadcrumbItems} />
      
      <ElementalFrame 
        element={d.category === "artifact" ? "Geo" : d.category === "weapon" ? "Electro" : "Hydro"} 
        variant="ornate" 
        animated={true}
        className="mb-8"
      >
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 p-4 sm:p-6">
            <EntityVisual
              entityType="domain"
              entityId={d.id}
              alt={d.name}
              initialSrc={d.imageUrl}
              fallbackSrcs={[d.imageUrlOriginal, "/local-genshin-assets/ui/domain.png"]}
              size="fill"
              aspectRatio="landscape"
              fit="cover"
              sizes="(max-width: 640px) 100vw, 288px"
              wrapperClassName="w-full sm:w-72 aspect-[16/10] sm:aspect-auto sm:h-44 rounded-xl border border-border/80 bg-bg-card shrink-0 overflow-hidden shadow-lg"
            />
          <div>
            <div className="text-xs uppercase tracking-wider text-text-secondary font-medium mb-1">
              {CATEGORY_LABEL[d.category] ?? d.category}
            </div>
            <h1 className="text-3xl font-bold text-gold-bright game-title-glow" style={{ '--el': elementColorVar(d.category === "artifact" ? "Geo" : d.category === "weapon" ? "Electro" : "Hydro") } as React.CSSProperties}>
              {getLocalizedName(d, locale)}
            </h1>
            <p className="text-sm text-text-muted mb-4">
              {d.regionName ?? "Teyvat"}
              {d.recommendedLevel ? ` · ${t("recommendedLevel", { level: d.recommendedLevel })}` : ""}
            </p>
            {d.description && <p className="text-text-primary italic max-w-xl game-subtitle">{d.description}</p>}
          </div>
        </div>
      </ElementalFrame>

      {/* Lịch mở */}
      <section className="mb-8">
        <h2 className="font-display text-xl font-bold mb-2 text-gold border-b border-border pb-2">{t("openSchedule")}</h2>
        {d.daysOfWeek.length === 0 ? (
          <p className="text-sm text-text-secondary">{t("opensDaily")}</p>
        ) : (
          <div className="text-sm text-text-secondary">
            {d.daysOfWeek.map((wd) => (
              <span key={wd}>
                {wd !== d.daysOfWeek[0] && " · "}
                {WEEKDAY_FULL[wd] ?? wd}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Nguyên tố khuyến nghị */}
      {d.recommendedElements.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold mb-2 text-gold border-b border-border pb-2">
            {t("recommendedElements")}
          </h2>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-text-secondary">
            {d.recommendedElements.map((el) => (
              <span key={el}>
                {el}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Nguyên liệu / bộ thánh di vật rớt */}
      {materials.length > 0 && (
        <section className="mb-8">
          <h2 className="font-display text-xl font-bold mb-4 text-gold border-b border-border pb-2">
            {d.category === "artifact" ? t("artifactSetDrops") : t("materialsObtained")}
          </h2>
          <div className="relic-frame bg-bg-card border border-border rounded-xl p-3.5 sm:p-4">
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3 text-sm">
              {materials.map((m, i) => {
                const iconUrl = m.materialId
                  ? materialIconMap.get(m.materialId)
                  : m.artifactSetId
                    ? artifactSetIconMap.get(m.artifactSetId)
                    : null;
                const targetHref = m.artifactSetId
                  ? `/artifacts/${m.artifactSetId}`
                  : m.materialId
                    ? `/materials/${m.materialId}`
                    : null;

                const content = (
                  <>
                    <EntityVisual
                      entityType={m.artifactSetId ? "artifact" : "material"}
                      entityId={m.artifactSetId || m.materialId || m.name}
                      alt={m.name}
                      initialSrc={iconUrl}
                      size="sm"
                      wrapperClassName="rounded bg-bg-secondary border border-border group-hover:scale-105 transition-transform shrink-0"
                    />
                    <span className="text-text-secondary group-hover:text-accent-bright truncate transition-colors">{m.name}</span>
                  </>
                );

                return (
                  <li key={i}>
                    {targetHref ? (
                      <Link href={targetHref} className="group flex items-center gap-2 min-w-0">
                        {content}
                      </Link>
                    ) : (
                      <div className="flex items-center gap-2 min-w-0">{content}</div>
                    )}
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
            {t("enemiesInDomain")}
          </h2>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-text-secondary">
            {d.monsterNames.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Footer data provenance & report issue */}
      <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
        <span>Dữ liệu lịch mở và phần thưởng bí cảnh được đối chiếu theo thời gian thực máy chủ.</span>
        <ReportIssueModal entityType="domain" entityId={d.id} entityName={getLocalizedName(d, locale)} />
      </div>
    </div>
  );
}
