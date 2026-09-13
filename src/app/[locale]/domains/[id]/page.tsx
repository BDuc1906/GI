
import { prisma } from "@/lib/db/prisma";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SafeImage } from "@/components/ui/SafeImage";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { getLocalizedName } from "@/lib/i18n/entity-name";

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
  if (!d) return { title: t("notFoundTitle") };
  const categoryLabel: Record<string, string> = {
    artifact: t("categoryArtifact"),
    weapon: t("categoryWeapon"),
    talent: t("categoryTalent"),
  };
  return {
    title: `${getLocalizedName(d, locale)} — LEIBO`,
    description: d.description ?? t("metaDescriptionFallback", { category: categoryLabel[d.category] ?? d.category, region: d.regionName ?? "Teyvat" }),
  };
}

export default async function DomainDetail({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "DomainDetail" });

  const CATEGORY_LABEL: Record<string, string> = {
    artifact: t("categoryArtifact"),
    weapon: t("categoryWeapon"),
    talent: t("categoryTalent"),
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
      <BreadcrumbJsonLd items={breadcrumbItems} />
      <Breadcrumb items={breadcrumbItems} />
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {d.imageUrl && (
          <div className="relative w-40 h-40 rounded-xl border border-border bg-bg-card shrink-0 overflow-hidden">
            <SafeImage
              src={d.imageUrl}
              fallbackSrcs={[d.imageUrlOriginal]}
              alt={d.name}
              fill
              sizes="160px"
              className="object-cover"
              fallbackClassName="w-full h-full flex items-center justify-center text-text-muted text-[10px]"
            />
          </div>
        )}
        <div>
          <div className="text-xs uppercase tracking-wider text-text-secondary font-medium mb-1">
            {CATEGORY_LABEL[d.category] ?? d.category}
          </div>
          <h1 className="text-3xl font-bold text-gold-bright">{getLocalizedName(d, locale)}</h1>
          <p className="text-sm text-text-muted mb-4">
            {d.regionName ?? "Teyvat"}
            {d.recommendedLevel ? ` · ${t("recommendedLevel", { level: d.recommendedLevel })}` : ""}
          </p>
          {d.description && <p className="text-text-primary italic max-w-xl">{d.description}</p>}
        </div>
      </div>

      {/* Lịch mở */}
      <section className="mb-8">
        <h2 className="font-display text-xl font-bold mb-2 text-gold border-b border-border pb-2">{t("openSchedule")}</h2>
        {d.daysOfWeek.length === 0 ? (
          <p className="text-sm text-text-secondary">{t("opensDaily")}</p>
        ) : (
          <div className="flex flex-wrap gap-2 text-sm">
            {d.daysOfWeek.map((wd) => (
              <span key={wd} className="px-3 py-1.5 rounded-full border border-gold/40 bg-gold/10 text-gold-bright">
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
          <div className="flex flex-wrap gap-2 text-sm">
            {d.recommendedElements.map((el) => (
              <span key={el} className="px-3 py-1.5 rounded-full border border-border bg-bg-card/60 text-text-primary">
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
          <div className="relic-frame bg-bg-card border border-border rounded-xl p-4">
            <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              {materials.map((m, i) => {
                const iconUrl = m.materialId
                  ? materialIconMap.get(m.materialId)
                  : m.artifactSetId
                    ? artifactSetIconMap.get(m.artifactSetId)
                    : null;
                return (
                  <li key={i} className="flex items-center gap-2 min-w-0">
                    <span className="relative w-8 h-8 shrink-0 rounded bg-bg-secondary border border-border overflow-hidden">
                      {iconUrl ? (
                        <SafeImage src={iconUrl} alt={m.name} fill sizes="32px" className="object-contain" />
                      ) : null}
                    </span>
                    <span className="text-text-secondary truncate">{m.name}</span>
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
          <ul className="flex flex-wrap gap-2 text-sm">
            {d.monsterNames.map((m) => (
              <li key={m} className="px-3 py-1.5 rounded-full border border-border bg-bg-card/60 text-text-secondary">
                {m}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
