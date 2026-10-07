import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/db/prisma";
import { withDbRetry } from "@/lib/db/db-retry";
import { SafeImage } from "@/components/ui/SafeImage";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { BreadcrumbJsonLd } from "@/components/layout/BreadcrumbJsonLd";
import { getLocalizedName } from "@/lib/i18n/entity-name";
import { createLocalizedMetadata } from "@/lib/seo/metadata";
import { EntityThumb } from "@/components/ui/EntityThumb";
import { imageFor } from "@/core/game/image-urls";
import enemyImages from "@/data/images/enemies.json";
import {
  ENEMY_CATEGORY_LABEL,
  ENEMY_TYPE_LABEL,
  formatAmount,
  paragraphs,
  readEnemyRaw,
} from "@/core/game/enemy-format";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string; id: string }>;
}

const DOMAIN_CATEGORY_LABEL: Record<string, string> = {
  talent: "Sách thiên phú",
  weapon: "Nguyên liệu vũ khí",
  artifact: "Thánh di vật",
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, id } = await params;
  const e = await prisma.enemy.findUnique({
    where: { id },
    select: { id: true, name: true, raw: true },
  });
  if (!e) {
    return createLocalizedMetadata({
      locale,
      pathname: `enemies/${id}`,
      title: "Không tìm thấy kẻ địch — LEIBO",
      robots: { index: false, follow: false },
    });
  }
  const desc = paragraphs(readEnemyRaw(e.raw).description)[0];
  return createLocalizedMetadata({
    locale,
    pathname: `enemies/${id}`,
    title: `${e.name} — Kẻ địch Genshin Impact | LEIBO`,
    description: desc ? desc.slice(0, 155) : `${e.name}: mô tả, vật phẩm rớt và bí cảnh liên quan.`,
  });
}

export default async function EnemyDetailPage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const enemy = await withDbRetry(() =>
    prisma.enemy.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        enemyType: true,
        monsterType: true,
        categoryType: true,
        categoryText: true,
        raw: true,
      },
    })
  );
  if (!enemy) return notFound();

  const raw = readEnemyRaw(enemy.raw);
  const drops = raw.rewardPreview ?? [];
  const dropNames = Array.from(new Set(drops.map((d) => d.name).filter(Boolean)));

  // Nối tên vật phẩm rớt → Material / ArtifactSet (khớp tên chính xác, đã có unique ở Material).
  const [materials, artifactSets, domains, related] = await withDbRetry(() =>
    Promise.all([
      dropNames.length
        ? prisma.material.findMany({
            where: { name: { in: dropNames } },
            select: { id: true, name: true, nameTranslations: true, iconUrl: true, iconUrlOriginal: true },
          })
        : Promise.resolve([]),
      dropNames.length
        ? prisma.artifactSet.findMany({
            where: { name: { in: dropNames } },
            select: { id: true, name: true, nameTranslations: true, iconUrl: true, iconUrlOriginal: true },
          })
        : Promise.resolve([]),
      prisma.domain.findMany({
        where: { monsterNames: { has: enemy.name } },
        select: { id: true, name: true, nameTranslations: true, category: true, regionName: true },
        orderBy: { name: "asc" },
      }),
      enemy.categoryType
        ? prisma.enemy.findMany({
            where: { categoryType: enemy.categoryType, id: { not: enemy.id } },
            select: { id: true, name: true, enemyType: true },
            orderBy: { name: "asc" },
            take: 12,
          })
        : Promise.resolve([]),
    ])
  );

  const matByName = new Map(materials.map((m) => [m.name, m]));
  const setByName = new Map(artifactSets.map((a) => [a.name, a]));

  const breadcrumbItems = [
    { name: "LEIBO", path: "/" },
    { name: "Kẻ địch", path: "/enemies" },
    { name: enemy.name, path: `/enemies/${enemy.id}` },
  ];

  const inv = raw.investigation;
  const descParas = paragraphs(raw.description);
  const invParas = paragraphs(inv?.description);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <BreadcrumbJsonLd locale={locale} items={breadcrumbItems} />
      <Breadcrumb items={breadcrumbItems} />

      <header className="mb-8 flex items-center gap-4">
        <EntityThumb
          candidates={imageFor(enemyImages, enemy.id)}
          alt={enemy.name}
          size="lg"
          priority
        />
        <div className="min-w-0">
        <h1 className="font-display text-display-2 font-semibold text-text-primary">{enemy.name}</h1>
        {raw.specialNames && raw.specialNames.length > 0 && (
          <p className="text-sm text-text-muted mt-1">{raw.specialNames.join(" · ")}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-3 text-xs">
          {enemy.enemyType && (
            <span className="px-2.5 py-1 rounded-full bg-bg-elevated text-accent-bright font-semibold">
              {ENEMY_TYPE_LABEL[enemy.enemyType] ?? enemy.enemyType}
            </span>
          )}
          {enemy.categoryType && (
            <Link
              href={`/enemies?cat=${enemy.categoryType}`}
              title={enemy.categoryText ?? undefined}
              className="px-2.5 py-1 rounded-full border border-border text-text-secondary hover:border-accent-500 hover:text-accent-bright"
            >
              {ENEMY_CATEGORY_LABEL[enemy.categoryType] ?? enemy.categoryText}
            </Link>
          )}
        </div>
        </div>
      </header>

      {descParas.length > 0 && (
        <section className="mb-8 max-w-3xl space-y-2 text-text-secondary">
          {descParas.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
      )}

      {inv && (inv.name || invParas.length > 0) && (
        <section className="mb-10 surface-card p-4 max-w-3xl">
          <h2 className="font-display text-lg font-bold text-accent-bright mb-1">
            Ghi chép điều tra{inv.name ? `: ${inv.name}` : ""}
          </h2>
          {inv.categoryText && (
            <p className="text-xs text-text-muted mb-2">Phân loại trong game: {inv.categoryText}</p>
          )}
          {invParas.map((p, i) => (
            <p key={i} className="text-sm text-text-secondary mb-1">
              {p}
            </p>
          ))}
        </section>
      )}

      {drops.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-xl font-bold mb-1 text-accent-bright border-b border-border pb-2">
            Vật phẩm rớt
            <span className="ml-2 text-sm font-normal text-text-muted">({drops.length})</span>
          </h2>
          <p className="text-xs text-text-muted mb-4">
            Con số kèm theo là giá trị gốc trong dữ liệu nguồn (genshin-db): với nguyên liệu nhỏ hơn 1 thường
            hiểu là tỉ lệ/số lượng trung bình mỗi lần hạ; với EXP là lượng EXP. Chưa được đối chiếu độc lập
            trong game.
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {drops.map((d) => {
              const mat = matByName.get(d.name);
              const set = setByName.get(d.name);
              const ent = mat ?? set;
              const amount = formatAmount(d.count);
              const label = ent ? getLocalizedName(ent, locale) : d.name;
              const inner = (
                <>
                  <div className="relative w-10 h-10 rounded-lg bg-bg-elevated overflow-hidden shrink-0">
                    {ent && (
                      <SafeImage
                        src={ent.iconUrl}
                        fallbackSrcs={[ent.iconUrlOriginal]}
                        alt={label}
                        fill
                        sizes="40px"
                        className="object-contain p-0.5"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate group-hover/drop:text-accent-bright transition-colors">
                      {label}
                    </div>
                    <div className="text-[11px] text-text-muted">
                      {set ? "Thánh di vật" : ""}
                      {set && amount ? " · " : ""}
                      {amount ? `× ${amount}` : ""}
                    </div>
                  </div>
                </>
              );
              const key = `${d.id ?? d.name}-${d.name}`;
              if (mat) {
                return (
                  <li key={key}>
                    <Link href={`/materials/${mat.id}`} className="surface-card p-3 flex items-center gap-3 group/drop">
                      {inner}
                    </Link>
                  </li>
                );
              }
              if (set) {
                return (
                  <li key={key}>
                    <Link href={`/artifacts/${set.id}`} className="surface-card p-3 flex items-center gap-3 group/drop">
                      {inner}
                    </Link>
                  </li>
                );
              }
              return (
                <li key={key} className="surface-card p-3 flex items-center gap-3 group/drop">
                  {inner}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {domains.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-xl font-bold mb-4 text-accent-bright border-b border-border pb-2">
            Xuất hiện trong bí cảnh
            <span className="ml-2 text-sm font-normal text-text-muted">({domains.length})</span>
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {domains.map((d) => (
              <li key={d.id}>
                <Link href={`/domains/${d.id}`} className="surface-card p-3 block group">
                  <div className="font-semibold text-text-primary group-hover:text-accent-bright transition-colors">
                    {getLocalizedName(d, locale)}
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    {DOMAIN_CATEGORY_LABEL[d.category] ?? d.category}
                    {d.regionName ? ` · ${d.regionName}` : ""}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {related.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-xl font-bold mb-4 text-accent-bright border-b border-border pb-2">
            Cùng nhóm
          </h2>
          <ul className="flex flex-wrap gap-2">
            {related.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/enemies/${r.id}`}
                  className="inline-block px-3 py-1 rounded-full border border-border text-sm text-text-secondary hover:border-accent-500 hover:text-accent-bright"
                >
                  {r.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
